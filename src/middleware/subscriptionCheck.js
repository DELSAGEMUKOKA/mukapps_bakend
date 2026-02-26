import supabase from '../config/database.js';
import logger from '../utils/logger.js';
import { getPlanById, PLAN_STATUS } from '../config/subscriptionPlans.js';

export const requireActiveSubscription = (requiredPlans = []) => {
  return async (req, res, next) => {
    try {
      const companyId = req.user?.companyId;

      if (!companyId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('company_id', companyId)
        .eq('status', PLAN_STATUS.ACTIVE)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        logger.error('Subscription check failed', {
          error: error.message,
          companyId
        });
        throw error;
      }

      if (!subscription) {
        return res.status(403).json({
          success: false,
          message: 'Active subscription required',
          code: 'NO_ACTIVE_SUBSCRIPTION',
          data: {
            hasSubscription: false
          }
        });
      }

      const now = new Date();
      const endDate = new Date(subscription.end_date);

      if (now > endDate) {
        await supabase
          .from('subscriptions')
          .update({ status: PLAN_STATUS.EXPIRED })
          .eq('id', subscription.id);

        return res.status(403).json({
          success: false,
          message: 'Subscription has expired',
          code: 'SUBSCRIPTION_EXPIRED',
          data: {
            subscriptionId: subscription.id,
            expiredDate: subscription.end_date
          }
        });
      }

      if (requiredPlans.length > 0 && !requiredPlans.includes(subscription.plan_type)) {
        const plan = getPlanById(subscription.plan_type);
        return res.status(403).json({
          success: false,
          message: 'This feature requires a higher plan',
          code: 'INSUFFICIENT_PLAN',
          data: {
            currentPlan: plan ? plan.name : subscription.plan_type,
            requiredPlans: requiredPlans.map(p => {
              const reqPlan = getPlanById(p);
              return reqPlan ? reqPlan.name : p;
            })
          }
        });
      }

      req.subscription = subscription;
      req.subscriptionPlan = getPlanById(subscription.plan_type);

      next();
    } catch (error) {
      logger.error('Subscription check middleware error', {
        error: error.message,
        companyId: req.user?.companyId
      });
      return res.status(500).json({
        success: false,
        message: 'Failed to verify subscription status'
      });
    }
  };
};

export const checkFeatureAccess = (featureName, planLimits = {}) => {
  return async (req, res, next) => {
    try {
      const companyId = req.user?.companyId;

      if (!companyId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

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
        return res.status(403).json({
          success: false,
          message: 'Active subscription required to access this feature',
          code: 'NO_ACTIVE_SUBSCRIPTION'
        });
      }

      const plan = getPlanById(subscription.plan_type);

      if (!plan) {
        return res.status(403).json({
          success: false,
          message: 'Invalid subscription plan'
        });
      }

      if (planLimits.minPlan) {
        const planHierarchy = ['free', 'basic', 'pro', 'enterprise'];
        const currentPlanIndex = planHierarchy.indexOf(subscription.plan_type);
        const minPlanIndex = planHierarchy.indexOf(planLimits.minPlan);

        if (currentPlanIndex < minPlanIndex) {
          return res.status(403).json({
            success: false,
            message: `This feature requires ${planLimits.minPlan} plan or higher`,
            code: 'INSUFFICIENT_PLAN',
            data: {
              currentPlan: plan.name,
              requiredPlan: planLimits.minPlan
            }
          });
        }
      }

      req.subscription = subscription;
      req.subscriptionPlan = plan;

      next();
    } catch (error) {
      logger.error('Feature access check error', {
        error: error.message,
        feature: featureName,
        companyId: req.user?.companyId
      });
      return res.status(500).json({
        success: false,
        message: 'Failed to verify feature access'
      });
    }
  };
};

export const checkUsageLimit = (resource, limitField) => {
  return async (req, res, next) => {
    try {
      const companyId = req.user?.companyId;

      if (!companyId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('company_id', companyId)
        .eq('status', PLAN_STATUS.ACTIVE)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subError) throw subError;

      if (!subscription) {
        return res.status(403).json({
          success: false,
          message: 'Active subscription required',
          code: 'NO_ACTIVE_SUBSCRIPTION'
        });
      }

      const plan = getPlanById(subscription.plan_type);

      if (!plan || !plan.limits) {
        return next();
      }

      const limit = plan.limits[limitField];

      if (limit === -1) {
        return next();
      }

      const { count, error: countError } = await supabase
        .from(resource)
        .select('id', { count: 'exact', head: true })
        .eq('company_id', companyId);

      if (countError) throw countError;

      if (count >= limit) {
        return res.status(403).json({
          success: false,
          message: `${resource} limit reached for your plan`,
          code: 'LIMIT_REACHED',
          data: {
            currentCount: count,
            limit,
            plan: plan.name,
            resource
          }
        });
      }

      req.usageCount = count;
      req.usageLimit = limit;
      req.subscription = subscription;
      req.subscriptionPlan = plan;

      next();
    } catch (error) {
      logger.error('Usage limit check error', {
        error: error.message,
        resource,
        companyId: req.user?.companyId
      });
      return res.status(500).json({
        success: false,
        message: 'Failed to verify usage limits'
      });
    }
  };
};

export const warnOnLimitApproaching = (resource, limitField, threshold = 0.8) => {
  return async (req, res, next) => {
    try {
      const companyId = req.user?.companyId;

      if (!companyId || !req.subscription || !req.subscriptionPlan) {
        return next();
      }

      const plan = req.subscriptionPlan;
      const limit = plan.limits?.[limitField];

      if (!limit || limit === -1) {
        return next();
      }

      const { count } = await supabase
        .from(resource)
        .select('id', { count: 'exact', head: true })
        .eq('company_id', companyId);

      if (count >= limit * threshold) {
        res.setHeader('X-Usage-Warning', 'approaching-limit');
        res.setHeader('X-Usage-Count', count);
        res.setHeader('X-Usage-Limit', limit);
        res.setHeader('X-Usage-Percentage', Math.round((count / limit) * 100));
      }

      next();
    } catch (error) {
      logger.error('Usage warning check error', {
        error: error.message,
        resource,
        companyId: req.user?.companyId
      });
      next();
    }
  };
};
