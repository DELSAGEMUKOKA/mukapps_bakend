import supabase from '../config/database.js';
import maxicashService from '../services/maxicashService.js';
import logger from '../utils/logger.js';
import { ValidationError, NotFoundError } from '../utils/helpers.js';
import {
  getPlanById,
  getAllPlans,
  calculateExpirationDate,
  isPlanValid,
  getPlanPrice,
  getPlanDuration,
  PLAN_STATUS,
  PAYMENT_STATUS
} from '../config/subscriptionPlans.js';
import crypto from 'crypto';

export const initiateSubscriptionPayment = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const { planId, customerPhone, autoRenew = false } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can initiate subscription payments'
      });
    }

    if (!isPlanValid(planId)) {
      throw new ValidationError({ plan: 'Invalid subscription plan' });
    }

    if (!customerPhone) {
      throw new ValidationError({ phone: 'Customer phone number is required for MaxiCash payments' });
    }

    const plan = getPlanById(planId);

    if (plan.price === 0) {
      throw new ValidationError({ plan: 'Free plans do not require payment' });
    }

    const reference = `SUB-${companyId.substring(0, 8)}-${Date.now()}`;
    const paymentData = {
      amount: plan.price,
      currency: plan.currency,
      reference,
      description: `${plan.name} - Monthly Subscription`,
      customerPhone
    };

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('name, email')
      .eq('id', companyId)
      .single();

    if (companyError) throw companyError;

    const startDate = new Date();
    const endDate = calculateExpirationDate(startDate, plan.duration);

    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        company_id: companyId,
        plan_type: planId,
        status: PLAN_STATUS.PENDING,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        amount: plan.price,
        payment_method: 'maxicash',
        maxicash_reference: reference,
        maxicash_payment_status: PAYMENT_STATUS.PENDING,
        customer_phone: customerPhone,
        auto_renew: autoRenew,
        next_billing_date: autoRenew ? endDate.toISOString() : null
      })
      .select()
      .single();

    if (subError) throw subError;

    logger.info('Initiating MaxiCash subscription payment', {
      companyId,
      subscriptionId: subscription.id,
      planId,
      reference,
      amount: plan.price
    });

    const paymentResult = await maxicashService.initiatePayment(paymentData);

    if (paymentResult.success) {
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          maxicash_transaction_id: paymentResult.transactionId,
          maxicash_payment_status: PAYMENT_STATUS.SUCCESS,
          maxicash_payment_date: new Date().toISOString(),
          status: PLAN_STATUS.ACTIVE
        })
        .eq('id', subscription.id);

      if (updateError) throw updateError;

      logger.info('MaxiCash subscription payment successful', {
        companyId,
        subscriptionId: subscription.id,
        transactionId: paymentResult.transactionId
      });

      res.json({
        success: true,
        message: 'Subscription activated successfully',
        data: {
          subscriptionId: subscription.id,
          plan: plan.name,
          amount: plan.price,
          currency: plan.currency,
          status: PLAN_STATUS.ACTIVE,
          transactionId: paymentResult.transactionId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          autoRenew
        }
      });
    } else {
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          maxicash_transaction_id: paymentResult.transactionId,
          maxicash_payment_status: PAYMENT_STATUS.FAILED,
          status: PLAN_STATUS.EXPIRED
        })
        .eq('id', subscription.id);

      if (updateError) throw updateError;

      logger.warn('MaxiCash subscription payment failed', {
        companyId,
        subscriptionId: subscription.id,
        message: paymentResult.message
      });

      res.status(400).json({
        success: false,
        message: 'Payment failed',
        error: paymentResult.message,
        data: {
          subscriptionId: subscription.id,
          reference
        }
      });
    }
  } catch (error) {
    logger.error('Subscription payment initiation failed', {
      error: error.message,
      companyId: req.user?.companyId
    });
    next(error);
  }
};

export const verifySubscriptionPayment = async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const companyId = req.user.companyId;

    if (!transactionId) {
      throw new ValidationError({ transactionId: 'Transaction ID is required' });
    }

    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('maxicash_transaction_id', transactionId)
      .eq('company_id', companyId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (!subscription) {
      throw new NotFoundError('Subscription not found for this transaction');
    }

    const verificationResult = await maxicashService.verifyPayment(transactionId);

    if (verificationResult.success) {
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          maxicash_payment_status: PAYMENT_STATUS.SUCCESS,
          maxicash_payment_date: new Date().toISOString(),
          status: PLAN_STATUS.ACTIVE
        })
        .eq('id', subscription.id);

      if (updateError) throw updateError;

      res.json({
        success: true,
        message: 'Payment verified and subscription activated',
        data: {
          subscriptionId: subscription.id,
          status: PLAN_STATUS.ACTIVE,
          transactionId,
          amount: verificationResult.amount / 100
        }
      });
    } else {
      res.json({
        success: false,
        message: 'Payment verification failed',
        data: {
          subscriptionId: subscription.id,
          status: subscription.status,
          transactionId
        }
      });
    }
  } catch (error) {
    logger.error('Subscription payment verification failed', {
      error: error.message,
      transactionId: req.params.transactionId
    });
    next(error);
  }
};

export const getActiveSubscription = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', PLAN_STATUS.ACTIVE)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (!subscription) {
      return res.json({
        success: true,
        data: null,
        message: 'No active subscription found'
      });
    }

    const now = new Date();
    const endDate = new Date(subscription.end_date);
    const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    const isExpired = now > endDate;

    if (isExpired && subscription.status === PLAN_STATUS.ACTIVE) {
      await supabase
        .from('subscriptions')
        .update({ status: PLAN_STATUS.EXPIRED })
        .eq('id', subscription.id);
    }

    const plan = getPlanById(subscription.plan_type);

    res.json({
      success: true,
      data: {
        ...subscription,
        plan: plan ? plan.name : subscription.plan_type,
        features: plan ? plan.features : [],
        daysRemaining: Math.max(0, daysRemaining),
        isExpired,
        isActive: !isExpired && subscription.status === PLAN_STATUS.ACTIVE
      }
    });
  } catch (error) {
    logger.error('Failed to get active subscription', {
      error: error.message,
      companyId: req.user?.companyId
    });
    next(error);
  }
};

export const getAvailablePlans = async (req, res, next) => {
  try {
    const plans = getAllPlans();

    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    next(error);
  }
};

export const cancelSubscription = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const { subscriptionId } = req.params;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can cancel subscriptions'
      });
    }

    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .eq('company_id', companyId)
      .single();

    if (fetchError) throw fetchError;

    if (!subscription) {
      throw new NotFoundError('Subscription not found');
    }

    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: PLAN_STATUS.CANCELLED,
        auto_renew: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriptionId);

    if (updateError) throw updateError;

    logger.info('Subscription cancelled', {
      companyId,
      subscriptionId
    });

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: {
        subscriptionId,
        status: PLAN_STATUS.CANCELLED
      }
    });
  } catch (error) {
    logger.error('Subscription cancellation failed', {
      error: error.message,
      subscriptionId: req.params.subscriptionId
    });
    next(error);
  }
};

export const updateAutoRenew = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const { subscriptionId } = req.params;
    const { autoRenew } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update subscription settings'
      });
    }

    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .eq('company_id', companyId)
      .single();

    if (fetchError) throw fetchError;

    if (!subscription) {
      throw new NotFoundError('Subscription not found');
    }

    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        auto_renew: autoRenew,
        next_billing_date: autoRenew ? subscription.end_date : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriptionId);

    if (updateError) throw updateError;

    logger.info('Subscription auto-renew updated', {
      companyId,
      subscriptionId,
      autoRenew
    });

    res.json({
      success: true,
      message: `Auto-renew ${autoRenew ? 'enabled' : 'disabled'} successfully`,
      data: {
        subscriptionId,
        autoRenew,
        nextBillingDate: autoRenew ? subscription.end_date : null
      }
    });
  } catch (error) {
    logger.error('Auto-renew update failed', {
      error: error.message,
      subscriptionId: req.params.subscriptionId
    });
    next(error);
  }
};

export const getSubscriptionHistory = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const history = subscriptions.map(sub => {
      const plan = getPlanById(sub.plan_type);
      return {
        ...sub,
        planName: plan ? plan.name : sub.plan_type,
        features: plan ? plan.features : []
      };
    });

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    logger.error('Failed to get subscription history', {
      error: error.message,
      companyId: req.user?.companyId
    });
    next(error);
  }
};
