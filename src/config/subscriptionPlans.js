export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free Plan',
    price: 0,
    currency: 'USD',
    duration: 30,
    features: [
      'Up to 50 products',
      'Up to 20 invoices per month',
      '1 user',
      'Basic reports',
      'Community support'
    ],
    limits: {
      products: 50,
      invoices: 20,
      users: 1,
      storage: 100
    }
  },
  BASIC: {
    id: 'basic',
    name: 'Basic Plan',
    price: 29.99,
    currency: 'USD',
    duration: 30,
    features: [
      'Up to 500 products',
      'Up to 200 invoices per month',
      'Up to 3 users',
      'Advanced reports',
      'Email support',
      'Basic inventory tracking'
    ],
    limits: {
      products: 500,
      invoices: 200,
      users: 3,
      storage: 1000
    }
  },
  PRO: {
    id: 'pro',
    name: 'Pro Plan',
    price: 59.99,
    currency: 'USD',
    duration: 30,
    features: [
      'Unlimited products',
      'Unlimited invoices',
      'Up to 10 users',
      'Advanced reports & analytics',
      'Priority email support',
      'Advanced inventory tracking',
      'Multi-location support',
      'API access'
    ],
    limits: {
      products: -1,
      invoices: -1,
      users: 10,
      storage: 5000
    }
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise Plan',
    price: 149.99,
    currency: 'USD',
    duration: 30,
    features: [
      'Unlimited everything',
      'Unlimited users',
      'Custom reports & analytics',
      '24/7 priority support',
      'Advanced inventory management',
      'Multi-location support',
      'Full API access',
      'Custom integrations',
      'Dedicated account manager'
    ],
    limits: {
      products: -1,
      invoices: -1,
      users: -1,
      storage: -1
    }
  }
};

export const getPlanById = (planId) => {
  const planKey = planId.toUpperCase();
  return SUBSCRIPTION_PLANS[planKey] || null;
};

export const getAllPlans = () => {
  return Object.values(SUBSCRIPTION_PLANS);
};

export const getActivePlans = () => {
  return Object.values(SUBSCRIPTION_PLANS).filter(plan => plan.id !== 'free');
};

export const calculateExpirationDate = (startDate, durationInDays) => {
  const date = new Date(startDate);
  date.setDate(date.getDate() + durationInDays);
  return date;
};

export const isPlanValid = (planId) => {
  return Object.keys(SUBSCRIPTION_PLANS).some(
    key => SUBSCRIPTION_PLANS[key].id === planId.toLowerCase()
  );
};

export const getPlanPrice = (planId) => {
  const plan = getPlanById(planId);
  return plan ? plan.price : 0;
};

export const getPlanDuration = (planId) => {
  const plan = getPlanById(planId);
  return plan ? plan.duration : 30;
};

export const PLAN_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
  TRIAL: 'trial'
};

export const PAYMENT_STATUS = {
  SUCCESS: 'success',
  FAILED: 'failed',
  PENDING: 'pending',
  PROCESSING: 'processing'
};
