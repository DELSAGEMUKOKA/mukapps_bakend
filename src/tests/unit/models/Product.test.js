import { Product, Company } from '../../../models/index.js';
import { createTestCompany, createTestProduct } from '../../helpers/fixtures.js';

describe('Product Model Unit Tests', () => {
  let testCompany;

  beforeEach(async () => {
    testCompany = await createTestCompany(Company);
  });

  describe('Model Validation', () => {
    it('should create a valid product', async () => {
      const product = await createTestProduct(Product, testCompany.id);

      expect(product).toBeTruthy();
      expect(product.id).toBeTruthy();
      expect(product.name).toBe('Test Product');
      expect(product.company_id).toBe(testCompany.id);
    });

    it('should require name', async () => {
      try {
        await Product.create({
          sku: 'SKU-TEST',
          selling_price: 10.00,
          current_stock: 10,
          company_id: testCompany.id
        });
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).toBe('SequelizeValidationError');
      }
    });

    it('should require SKU', async () => {
      try {
        await Product.create({
          name: 'Test Product',
          selling_price: 10.00,
          current_stock: 10,
          company_id: testCompany.id
        });
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).toBe('SequelizeValidationError');
      }
    });

    it('should require unique SKU per company', async () => {
      const sku = 'DUPLICATE-SKU';
      await createTestProduct(Product, testCompany.id, { sku });

      try {
        await createTestProduct(Product, testCompany.id, { sku });
        fail('Should have thrown unique constraint error');
      } catch (error) {
        expect(error.name).toBe('SequelizeUniqueConstraintError');
      }
    });

    it('should allow same SKU for different companies', async () => {
      const company1 = await createTestCompany(Company, { name: 'Company 1' });
      const company2 = await createTestCompany(Company, { name: 'Company 2' });
      const sku = 'SHARED-SKU';

      const product1 = await createTestProduct(Product, company1.id, { sku });
      const product2 = await createTestProduct(Product, company2.id, { sku });

      expect(product1.sku).toBe(product2.sku);
      expect(product1.company_id).not.toBe(product2.company_id);
    });

    it('should require selling price', async () => {
      try {
        await Product.create({
          name: 'Test Product',
          sku: 'SKU-TEST',
          current_stock: 10,
          company_id: testCompany.id
        });
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).toBe('SequelizeValidationError');
      }
    });

    it('should require current stock', async () => {
      try {
        await Product.create({
          name: 'Test Product',
          sku: 'SKU-TEST',
          selling_price: 10.00,
          company_id: testCompany.id
        });
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).toBe('SequelizeValidationError');
      }
    });

    it('should not allow negative selling price', async () => {
      try {
        await createTestProduct(Product, testCompany.id, { selling_price: -10.00 });
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).toBe('SequelizeValidationError');
      }
    });

    it('should not allow negative cost price', async () => {
      try {
        await createTestProduct(Product, testCompany.id, { cost_price: -5.00 });
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).toBe('SequelizeValidationError');
      }
    });

    it('should not allow negative stock', async () => {
      try {
        await createTestProduct(Product, testCompany.id, { current_stock: -10 });
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).toBe('SequelizeValidationError');
      }
    });

    it('should have default min stock level of 0', async () => {
      const product = await Product.create({
        name: 'Test Product',
        sku: 'SKU-TEST',
        selling_price: 10.00,
        current_stock: 10,
        company_id: testCompany.id
      });

      expect(product.min_stock_level).toBe(0);
    });
  });

  describe('Price Management', () => {
    it('should store cost and selling prices as decimals', async () => {
      const product = await createTestProduct(Product, testCompany.id, {
        cost_price: 10.50,
        selling_price: 20.99
      });

      expect(parseFloat(product.cost_price)).toBe(10.50);
      expect(parseFloat(product.selling_price)).toBe(20.99);
    });

    it('should calculate profit margin correctly', async () => {
      const product = await createTestProduct(Product, testCompany.id, {
        cost_price: 10.00,
        selling_price: 20.00
      });

      const costPrice = parseFloat(product.cost_price);
      const sellingPrice = parseFloat(product.selling_price);
      const margin = ((sellingPrice - costPrice) / sellingPrice) * 100;

      expect(margin).toBe(50);
    });
  });

  describe('Stock Management', () => {
    it('should track current stock', async () => {
      const product = await createTestProduct(Product, testCompany.id, {
        current_stock: 100
      });

      expect(product.current_stock).toBe(100);
    });

    it('should track minimum stock level', async () => {
      const product = await createTestProduct(Product, testCompany.id, {
        min_stock_level: 10
      });

      expect(product.min_stock_level).toBe(10);
    });

    it('should identify low stock products', async () => {
      const product = await createTestProduct(Product, testCompany.id, {
        current_stock: 5,
        min_stock_level: 10
      });

      const isLowStock = product.current_stock <= product.min_stock_level;
      expect(isLowStock).toBe(true);
    });

    it('should identify normal stock products', async () => {
      const product = await createTestProduct(Product, testCompany.id, {
        current_stock: 50,
        min_stock_level: 10
      });

      const isLowStock = product.current_stock <= product.min_stock_level;
      expect(isLowStock).toBe(false);
    });

    it('should update stock levels', async () => {
      const product = await createTestProduct(Product, testCompany.id, {
        current_stock: 100
      });

      await product.update({ current_stock: 150 });
      await product.reload();

      expect(product.current_stock).toBe(150);
    });
  });

  describe('Product Information', () => {
    it('should store product description', async () => {
      const description = 'This is a detailed product description';
      const product = await createTestProduct(Product, testCompany.id, {
        description
      });

      expect(product.description).toBe(description);
    });

    it('should store product category', async () => {
      const product = await createTestProduct(Product, testCompany.id, {
        category: 'Electronics'
      });

      expect(product.category).toBe('Electronics');
    });

    it('should store product unit', async () => {
      const product = await createTestProduct(Product, testCompany.id, {
        unit: 'kg'
      });

      expect(product.unit).toBe('kg');
    });
  });

  describe('Associations', () => {
    it('should belong to a company', async () => {
      const product = await createTestProduct(Product, testCompany.id);
      const company = await product.getCompany();

      expect(company).toBeTruthy();
      expect(company.id).toBe(testCompany.id);
    });
  });

  describe('Query Operations', () => {
    it('should find products by category', async () => {
      await createTestProduct(Product, testCompany.id, {
        name: 'Laptop',
        category: 'Electronics'
      });
      await createTestProduct(Product, testCompany.id, {
        name: 'Chair',
        category: 'Furniture'
      });

      const electronics = await Product.findAll({
        where: {
          company_id: testCompany.id,
          category: 'Electronics'
        }
      });

      expect(electronics).toHaveLength(1);
      expect(electronics[0].category).toBe('Electronics');
    });

    it('should find low stock products', async () => {
      await createTestProduct(Product, testCompany.id, {
        name: 'Low Stock Item',
        current_stock: 5,
        min_stock_level: 10
      });
      await createTestProduct(Product, testCompany.id, {
        name: 'Normal Stock Item',
        current_stock: 100,
        min_stock_level: 10
      });

      const products = await Product.findAll({
        where: { company_id: testCompany.id }
      });

      const lowStockProducts = products.filter(
        p => p.current_stock <= p.min_stock_level
      );

      expect(lowStockProducts).toHaveLength(1);
      expect(lowStockProducts[0].name).toBe('Low Stock Item');
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt timestamp', async () => {
      const product = await createTestProduct(Product, testCompany.id);
      expect(product.created_at).toBeTruthy();
    });

    it('should have updatedAt timestamp', async () => {
      const product = await createTestProduct(Product, testCompany.id);
      expect(product.updated_at).toBeTruthy();
    });

    it('should update updatedAt on change', async () => {
      const product = await createTestProduct(Product, testCompany.id);
      const originalUpdatedAt = product.updated_at;

      await new Promise(resolve => setTimeout(resolve, 100));

      await product.update({ name: 'Updated Product Name' });
      await product.reload();

      expect(product.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});
