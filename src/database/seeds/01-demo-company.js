import { Company, User, Category, Product, Customer, Subscription } from '../../models/index.js';
import { hashPassword } from '../../utils/encryption.js';
import { addDays } from '../../utils/dateUtils.js';

export const seedDemoCompany = async () => {
  try {
    console.log('Seeding demo company...');

    const existingCompany = await Company.findOne({ where: { email: 'demo@inventory.com' } });
    if (existingCompany) {
      console.log('Demo company already exists, skipping seed.');
      return;
    }

    const company = await Company.create({
      name: 'Demo Inventory Company',
      email: 'demo@inventory.com',
      phone: '+1234567890',
      address: '123 Business St',
      city: 'San Francisco',
      country: 'USA',
      tax_id: 'TAX-123456'
    });

    console.log(`✓ Created company: ${company.name}`);

    const trialEnd = addDays(new Date(), 30);
    await Subscription.create({
      company_id: company.id,
      plan_type: 'premium',
      status: 'active',
      start_date: new Date(),
      end_date: addDays(new Date(), 365),
      trial_ends_at: trialEnd
    });

    console.log('✓ Created subscription');

    const adminPassword = await hashPassword('Admin123!');
    const managerPassword = await hashPassword('Manager123!');
    const cashierPassword = await hashPassword('Cashier123!');

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@demo.com',
      password: adminPassword,
      role: 'admin',
      company_id: company.id,
      phone: '+1234567891'
    });

    await User.create({
      name: 'Manager User',
      email: 'manager@demo.com',
      password: managerPassword,
      role: 'manager',
      company_id: company.id,
      phone: '+1234567892'
    });

    await User.create({
      name: 'Cashier User',
      email: 'cashier@demo.com',
      password: cashierPassword,
      role: 'cashier',
      company_id: company.id,
      phone: '+1234567893'
    });

    console.log('✓ Created 3 users (admin, manager, cashier)');

    const electronics = await Category.create({
      name: 'Electronics',
      description: 'Electronic devices and accessories',
      company_id: company.id
    });

    const clothing = await Category.create({
      name: 'Clothing',
      description: 'Apparel and fashion items',
      company_id: company.id
    });

    const food = await Category.create({
      name: 'Food & Beverages',
      description: 'Food and drink products',
      company_id: company.id
    });

    console.log('✓ Created 3 categories');

    await Product.create({
      name: 'Laptop Dell XPS 15',
      barcode: 'LAPTOP001',
      description: '15-inch laptop with Intel i7',
      category_id: electronics.id,
      purchase_price: 800,
      selling_price: 1200,
      current_stock: 15,
      min_stock_level: 5,
      unit: 'piece',
      company_id: company.id
    });

    await Product.create({
      name: 'Wireless Mouse',
      barcode: 'MOUSE001',
      description: 'Ergonomic wireless mouse',
      category_id: electronics.id,
      purchase_price: 15,
      selling_price: 25,
      current_stock: 50,
      min_stock_level: 10,
      unit: 'piece',
      company_id: company.id
    });

    await Product.create({
      name: 'T-Shirt Cotton',
      barcode: 'TSHIRT001',
      description: 'Cotton t-shirt, various colors',
      category_id: clothing.id,
      purchase_price: 5,
      selling_price: 15,
      current_stock: 100,
      min_stock_level: 20,
      unit: 'piece',
      company_id: company.id
    });

    await Product.create({
      name: 'Jeans Denim',
      barcode: 'JEANS001',
      description: 'Classic blue denim jeans',
      category_id: clothing.id,
      purchase_price: 20,
      selling_price: 50,
      current_stock: 60,
      min_stock_level: 15,
      unit: 'piece',
      company_id: company.id
    });

    await Product.create({
      name: 'Coffee Beans 1kg',
      barcode: 'COFFEE001',
      description: 'Premium Arabica coffee beans',
      category_id: food.id,
      purchase_price: 10,
      selling_price: 20,
      current_stock: 30,
      min_stock_level: 10,
      unit: 'kg',
      company_id: company.id
    });

    console.log('✓ Created 5 products');

    await Customer.create({
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+1555123456',
      address: '456 Customer Lane',
      city: 'San Francisco',
      total_purchases: 500,
      is_vip: false,
      company_id: company.id
    });

    await Customer.create({
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      phone: '+1555123457',
      address: '789 Buyer Ave',
      city: 'San Francisco',
      total_purchases: 1500,
      is_vip: true,
      company_id: company.id
    });

    await Customer.create({
      name: 'Bob Johnson',
      email: 'bob.j@example.com',
      phone: '+1555123458',
      address: '321 Shopping Blvd',
      city: 'Oakland',
      total_purchases: 200,
      is_vip: false,
      company_id: company.id
    });

    console.log('✓ Created 3 customers');

    console.log('\n========================================');
    console.log('Demo Data Seeded Successfully!');
    console.log('========================================');
    console.log('\nLogin Credentials:');
    console.log('------------------');
    console.log('Admin:');
    console.log('  Email: admin@demo.com');
    console.log('  Password: Admin123!');
    console.log('\nManager:');
    console.log('  Email: manager@demo.com');
    console.log('  Password: Manager123!');
    console.log('\nCashier:');
    console.log('  Email: cashier@demo.com');
    console.log('  Password: Cashier123!');
    console.log('========================================\n');

    return company;
  } catch (error) {
    console.error('Error seeding demo company:', error);
    throw error;
  }
};

export default seedDemoCompany;
