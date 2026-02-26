import { hashPassword } from '../../utils/encryption.js';

export const createCompanyFixture = (overrides = {}) => ({
  name: 'Test Company',
  email: 'company@test.com',
  phone: '+1234567890',
  address: '123 Test Street',
  city: 'Test City',
  state: 'Test State',
  country: 'Test Country',
  postal_code: '12345',
  ...overrides
});

export const createUserFixture = async (overrides = {}) => ({
  name: 'Test User',
  email: 'user@test.com',
  password: await hashPassword('password123'),
  role: 'admin',
  phone: '+1234567890',
  is_active: true,
  ...overrides
});

export const createProductFixture = (overrides = {}) => ({
  name: 'Test Product',
  sku: `SKU-${Date.now()}`,
  description: 'Test product description',
  category: 'Electronics',
  cost_price: 10.00,
  selling_price: 20.00,
  current_stock: 100,
  min_stock_level: 10,
  unit: 'pcs',
  ...overrides
});

export const createCustomerFixture = (overrides = {}) => ({
  name: 'Test Customer',
  email: 'customer@test.com',
  phone: '+1234567890',
  address: '456 Customer Street',
  city: 'Customer City',
  state: 'Customer State',
  country: 'Customer Country',
  postal_code: '67890',
  tax_number: 'TAX123456',
  ...overrides
});

export const createInvoiceFixture = (overrides = {}) => ({
  invoice_number: `INV-${Date.now()}`,
  date: new Date(),
  due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  subtotal: 100.00,
  tax: 10.00,
  discount: 0.00,
  total: 110.00,
  payment_status: 'pending',
  notes: 'Test invoice',
  items: JSON.stringify([
    {
      product_id: 1,
      name: 'Test Product',
      quantity: 5,
      unit_price: 20.00,
      total: 100.00
    }
  ]),
  ...overrides
});

export const createExpenseFixture = (overrides = {}) => ({
  date: new Date(),
  amount: 50.00,
  category: 'Office Supplies',
  description: 'Test expense',
  payment_method: 'cash',
  reference: `EXP-${Date.now()}`,
  ...overrides
});

export const createCategoryFixture = (overrides = {}) => ({
  name: 'Test Category',
  description: 'Test category description',
  ...overrides
});

export const createSubscriptionFixture = (overrides = {}) => ({
  plan_type: 'basic',
  status: 'active',
  start_date: new Date(),
  end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  trial_ends_at: null,
  ...overrides
});

export const createTeamFixture = (overrides = {}) => ({
  name: 'Test Team',
  description: 'Test team description',
  ...overrides
});

export const createStockMovementFixture = (overrides = {}) => ({
  type: 'in',
  quantity: 10,
  previous_stock: 100,
  new_stock: 110,
  reference: `MOV-${Date.now()}`,
  notes: 'Test stock movement',
  ...overrides
});

export const createTestCompany = async (Company, overrides = {}) => {
  const companyData = createCompanyFixture(overrides);
  return await Company.create(companyData);
};

export const createTestUser = async (User, companyId, overrides = {}) => {
  const userData = await createUserFixture({
    company_id: companyId,
    ...overrides
  });
  return await User.create(userData);
};

export const createTestProduct = async (Product, companyId, overrides = {}) => {
  const productData = createProductFixture({
    company_id: companyId,
    ...overrides
  });
  return await Product.create(productData);
};

export const createTestCustomer = async (Customer, companyId, overrides = {}) => {
  const customerData = createCustomerFixture({
    company_id: companyId,
    ...overrides
  });
  return await Customer.create(customerData);
};

export const createTestInvoice = async (Invoice, companyId, customerId, overrides = {}) => {
  const invoiceData = createInvoiceFixture({
    company_id: companyId,
    customer_id: customerId,
    ...overrides
  });
  return await Invoice.create(invoiceData);
};

export const createTestExpense = async (Expense, companyId, userId, overrides = {}) => {
  const expenseData = createExpenseFixture({
    company_id: companyId,
    user_id: userId,
    ...overrides
  });
  return await Expense.create(expenseData);
};

export const createTestCategory = async (Category, companyId, overrides = {}) => {
  const categoryData = createCategoryFixture({
    company_id: companyId,
    ...overrides
  });
  return await Category.create(categoryData);
};

export const createFullTestEnvironment = async (models) => {
  const { Company, User, Product, Customer, Invoice, Subscription } = models;

  const company = await createTestCompany(Company);
  const user = await createTestUser(User, company.id, { role: 'admin' });
  const product = await createTestProduct(Product, company.id);
  const customer = await createTestCustomer(Customer, company.id);

  const subscription = await Subscription.create(
    createSubscriptionFixture({ company_id: company.id })
  );

  return {
    company,
    user,
    product,
    customer,
    subscription
  };
};
