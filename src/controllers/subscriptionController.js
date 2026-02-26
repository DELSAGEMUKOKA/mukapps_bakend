// src/controllers/subscriptionController.js
import { Subscription, User, Company } from '../models/index.js';
import { NotFoundError, ValidationError } from '../utils/helpers.js';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

/**
 * Récupérer l'abonnement actuel
 */
export const getCurrentSubscription = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    const subscription = await Subscription.findOne({
      where: { companyId: companyId },  // ✅ Utilise companyId (camelCase)
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'subscriber',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]    // ✅ Utilise createdAt
    });

    if (!subscription) {
      // Retourner un abonnement par défaut
      return res.json({
        success: true,
        data: {
          plan: 'free',
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          features: {
            maxUsers: 1,
            maxProducts: 100,
            maxInvoices: 50,
            advancedReports: false,
            api: false
          }
        }
      });
    }

    // Calculer les jours restants
    const now = new Date();
    const endDate = new Date(subscription.endDate);
    const daysRemaining = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));

    res.json({
      success: true,
      data: {
        ...subscription.toJSON(),
        daysRemaining,
        isExpired: now > endDate
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer l'historique des abonnements
 */
export const getSubscriptionHistory = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    const subscriptions = await Subscription.findAll({
      where: { companyId: companyId },  // ✅ Utilise companyId
      order: [['createdAt', 'DESC']],   // ✅ Utilise createdAt
      include: [
        {
          model: User,
          as: 'subscriber',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.json({
      success: true,
      data: subscriptions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer les factures d'abonnement
 */
export const getSubscriptionInvoices = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    const subscriptions = await Subscription.findAll({
      where: { 
        companyId: companyId,  // ✅ Utilise companyId
        status: 'paid'
      },
      order: [['createdAt', 'DESC']],  // ✅ Utilise createdAt
      include: [
        {
          model: User,
          as: 'subscriber',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    const invoices = subscriptions.map(sub => ({
      id: sub.id,
      invoiceNumber: `INV-SUB-${sub.id.substring(0, 8)}`,
      date: sub.createdAt,
      amount: sub.amount || 0,
      plan: sub.plan,
      status: sub.status,
      paymentMethod: sub.paymentMethod,
      subscriber: sub.subscriber?.name
    }));

    res.json({
      success: true,
      data: invoices
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer les plans disponibles
 */
export const getPlans = async (req, res, next) => {
  try {
    const plans = [
      {
        id: 'free',
        name: 'Gratuit',
        price: 0,
        currency: 'USD',
        interval: 'month',
        features: [
          'Jusqu\'à 100 produits',
          'Jusqu\'à 50 factures/mois',
          '1 utilisateur',
          'Rapports basiques'
        ],
        limits: {
          users: 1,
          products: 100,
          invoicesPerMonth: 50
        }
      },
      {
        id: 'basic',
        name: 'Basique',
        price: 29.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'Produits illimités',
          'Factures illimitées',
          'Jusqu\'à 3 utilisateurs',
          'Rapports avancés',
          'Support email'
        ],
        limits: {
          users: 3,
          products: -1,
          invoicesPerMonth: -1
        }
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 79.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'Tout du plan Basique',
          'Jusqu\'à 10 utilisateurs',
          'API access',
          'Support prioritaire',
          'Export de données avancé'
        ],
        limits: {
          users: 10,
          products: -1,
          invoicesPerMonth: -1
        }
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 299.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'Tout du plan Premium',
          'Utilisateurs illimités',
          'Formation personnalisée',
          'SLA garanti',
          'Intégrations personnalisées'
        ],
        limits: {
          users: -1,
          products: -1,
          invoicesPerMonth: -1
        }
      }
    ];

    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer les statistiques d'utilisation
 */
export const getUsageStats = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const { Product, User, Invoice } = await import('../models/index.js');

    const [productsCount, usersCount, invoicesCount] = await Promise.all([
      Product.count({ where: { companyId } }),
      User.count({ where: { company_id: companyId } }),
      Invoice.count({ 
        where: { 
          companyId,
          createdAt: {
            [Op.gte]: new Date(new Date().setDate(1))
          }
        }
      })
    ]);

    const subscription = await Subscription.findOne({
      where: { companyId: companyId },  // ✅ Utilise companyId
      order: [['createdAt', 'DESC']]    // ✅ Utilise createdAt
    });

    const plan = subscription?.plan || 'free';
    const limits = {
      free: { users: 1, products: 100, invoicesPerMonth: 50 },
      basic: { users: 3, products: 500, invoicesPerMonth: 200 },
      premium: { users: 10, products: 2000, invoicesPerMonth: 1000 },
      enterprise: { users: -1, products: -1, invoicesPerMonth: -1 }
    }[plan] || limits.free;

    res.json({
      success: true,
      data: {
        current: {
          users: usersCount,
          products: productsCount,
          invoicesThisMonth: invoicesCount
        },
        limits,
        usage: {
          users: limits.users === -1 ? 0 : Math.round((usersCount / limits.users) * 100),
          products: limits.products === -1 ? 0 : Math.round((productsCount / limits.products) * 100),
          invoices: limits.invoicesPerMonth === -1 ? 0 : Math.round((invoicesCount / limits.invoicesPerMonth) * 100)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour l'abonnement
 */
export const updateSubscription = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const { plan, billingCycle, paymentMethod } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update subscription'
      });
    }

    let subscription = await Subscription.findOne({
      where: { companyId: companyId },  // ✅ Utilise companyId
      order: [['createdAt', 'DESC']]    // ✅ Utilise createdAt
    });

    const startDate = new Date();
    let endDate = new Date(startDate);

    if (billingCycle === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (billingCycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const prices = {
      free: { monthly: 0, yearly: 0 },
      basic: { monthly: 29.99, yearly: 299.99 },
      premium: { monthly: 79.99, yearly: 799.99 },
      enterprise: { monthly: 299.99, yearly: 2999.99 }
    };

    const amount = prices[plan]?.[billingCycle] || 0;

    if (subscription) {
      await subscription.update({
        plan,
        billingCycle,
        amount,
        paymentMethod,
        startDate,
        endDate,
        status: 'active',
        updatedAt: new Date()
      });
    } else {
      subscription = await Subscription.create({
        id: uuidv4(),
        companyId: companyId,
        userId: req.user.userId,
        plan,
        billingCycle,
        amount,
        paymentMethod,
        startDate,
        endDate,
        status: 'active',
        isSubscribed: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    res.json({
      success: true,
      data: subscription,
      message: 'Subscription updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Renouveler l'abonnement
 */
export const renewSubscription = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const { paymentMethod } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can renew subscription'
      });
    }

    const subscription = await Subscription.findOne({
      where: { companyId: companyId },  // ✅ Utilise companyId
      order: [['createdAt', 'DESC']]    // ✅ Utilise createdAt
    });

    if (!subscription) {
      throw new NotFoundError('No subscription found');
    }

    const startDate = new Date(subscription.endDate > new Date() ? subscription.endDate : new Date());
    let endDate = new Date(startDate);

    if (subscription.billingCycle === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (subscription.billingCycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    await subscription.update({
      startDate,
      endDate,
      paymentMethod: paymentMethod || subscription.paymentMethod,
      status: 'active',
      isSubscribed: true,
      updatedAt: new Date()
    });

    res.json({
      success: true,
      data: subscription,
      message: 'Subscription renewed successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Annuler l'abonnement
 */
export const cancelSubscription = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can cancel subscription'
      });
    }

    const subscription = await Subscription.findOne({
      where: { companyId: companyId },  // ✅ Utilise companyId
      order: [['createdAt', 'DESC']]    // ✅ Utilise createdAt
    });

    if (!subscription) {
      throw new NotFoundError('No subscription found');
    }

    await subscription.update({
      status: 'cancelled',
      isSubscribed: false,
      updatedAt: new Date()
    });

    res.json({
      success: true,
      data: subscription,
      message: 'Subscription cancelled successfully. You will have access until the end of the billing period.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upgrade l'abonnement
 */
export const upgradeSubscription = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const { plan, billingCycle } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can upgrade subscription'
      });
    }

    const subscription = await Subscription.findOne({
      where: { companyId: companyId },  // ✅ Utilise companyId
      order: [['createdAt', 'DESC']]    // ✅ Utilise createdAt
    });

    if (!subscription) {
      throw new NotFoundError('No subscription found');
    }

    const prices = {
      basic: { monthly: 29.99, yearly: 299.99 },
      premium: { monthly: 79.99, yearly: 799.99 },
      enterprise: { monthly: 299.99, yearly: 2999.99 }
    };

    const amount = prices[plan]?.[billingCycle || subscription.billingCycle] || 0;

    await subscription.update({
      plan,
      billingCycle: billingCycle || subscription.billingCycle,
      amount,
      updatedAt: new Date()
    });

    res.json({
      success: true,
      data: subscription,
      message: 'Subscription upgraded successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Downgrade l'abonnement
 */
export const downgradeSubscription = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const { plan } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can downgrade subscription'
      });
    }

    const subscription = await Subscription.findOne({
      where: { companyId: companyId },  // ✅ Utilise companyId
      order: [['createdAt', 'DESC']]    // ✅ Utilise createdAt
    });

    if (!subscription) {
      throw new NotFoundError('No subscription found');
    }

    await subscription.update({
      plan,
      updatedAt: new Date()
    });

    res.json({
      success: true,
      data: subscription,
      message: 'Subscription will be downgraded at the end of the current billing period'
    });
  } catch (error) {
    next(error);
  }
};

// Export all functions
export default {
  getCurrentSubscription,
  getSubscriptionHistory,
  getSubscriptionInvoices,
  getPlans,
  getUsageStats,
  updateSubscription,
  renewSubscription,
  cancelSubscription,
  upgradeSubscription,
  downgradeSubscription
};