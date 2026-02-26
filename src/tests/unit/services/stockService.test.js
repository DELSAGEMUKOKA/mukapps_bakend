import stockService from '../../../services/stockService.js';
import { Product, Company, User, StockMovement } from '../../../models/index.js';
import { createTestCompany, createTestUser, createTestProduct } from '../../helpers/fixtures.js';

describe('StockService Unit Tests', () => {
  let testCompany;
  let testUser;
  let testProduct;

  beforeEach(async () => {
    testCompany = await createTestCompany(Company);
    testUser = await createTestUser(User, testCompany.id);
    testProduct = await createTestProduct(Product, testCompany.id, {
      current_stock: 100,
      min_stock_level: 10
    });
  });

  describe('checkStock', () => {
    it('should return true when sufficient stock available', async () => {
      const result = await stockService.checkStock(testProduct.id, testCompany.id, 50);

      expect(result.hasStock).toBe(true);
      expect(result.currentStock).toBe(100);
      expect(result.availableQuantity).toBe(100);
    });

    it('should return false when insufficient stock', async () => {
      const result = await stockService.checkStock(testProduct.id, testCompany.id, 150);

      expect(result.hasStock).toBe(false);
      expect(result.currentStock).toBe(100);
    });

    it('should throw error for non-existent product', async () => {
      await expect(
        stockService.checkStock(99999, testCompany.id, 10)
      ).rejects.toThrow('Product not found');
    });
  });

  describe('adjustStock', () => {
    it('should increase stock with type "in"', async () => {
      const result = await stockService.adjustStock(
        testProduct.id,
        testCompany.id,
        testUser.id,
        'in',
        50,
        'PO-001',
        'Purchase order'
      );

      expect(result.success).toBe(true);
      expect(result.product.newStock).toBe(150);

      const updatedProduct = await Product.findByPk(testProduct.id);
      expect(updatedProduct.current_stock).toBe(150);
    });

    it('should decrease stock with type "out"', async () => {
      const result = await stockService.adjustStock(
        testProduct.id,
        testCompany.id,
        testUser.id,
        'out',
        30,
        'SALE-001',
        'Sale'
      );

      expect(result.success).toBe(true);
      expect(result.product.newStock).toBe(70);

      const updatedProduct = await Product.findByPk(testProduct.id);
      expect(updatedProduct.current_stock).toBe(70);
    });

    it('should create stock movement record', async () => {
      await stockService.adjustStock(
        testProduct.id,
        testCompany.id,
        testUser.id,
        'in',
        25
      );

      const movements = await StockMovement.findAll({
        where: { product_id: testProduct.id }
      });

      expect(movements).toHaveLength(1);
      expect(movements[0].type).toBe('in');
      expect(movements[0].quantity).toBe(25);
    });

    it('should reject adjustment resulting in negative stock', async () => {
      await expect(
        stockService.adjustStock(
          testProduct.id,
          testCompany.id,
          testUser.id,
          'out',
          150
        )
      ).rejects.toThrow('Insufficient stock');
    });

    it('should reject zero quantity adjustment', async () => {
      await expect(
        stockService.adjustStock(
          testProduct.id,
          testCompany.id,
          testUser.id,
          'in',
          0
        )
      ).rejects.toThrow('Quantity must be greater than 0');
    });

    it('should reject negative quantity', async () => {
      await expect(
        stockService.adjustStock(
          testProduct.id,
          testCompany.id,
          testUser.id,
          'in',
          -10
        )
      ).rejects.toThrow('Quantity must be greater than 0');
    });
  });

  describe('transferStock', () => {
    let secondProduct;

    beforeEach(async () => {
      secondProduct = await createTestProduct(Product, testCompany.id, {
        name: 'Second Product',
        sku: 'SKU-SECOND',
        current_stock: 50
      });
    });

    it('should transfer stock between products', async () => {
      const result = await stockService.transferStock(
        testProduct.id,
        secondProduct.id,
        20,
        testCompany.id,
        testUser.id
      );

      expect(result.success).toBe(true);
      expect(result.fromProduct.newStock).toBe(80);
      expect(result.toProduct.newStock).toBe(70);

      const fromProduct = await Product.findByPk(testProduct.id);
      const toProduct = await Product.findByPk(secondProduct.id);

      expect(fromProduct.current_stock).toBe(80);
      expect(toProduct.current_stock).toBe(70);
    });

    it('should create movement records for both products', async () => {
      await stockService.transferStock(
        testProduct.id,
        secondProduct.id,
        15,
        testCompany.id,
        testUser.id
      );

      const fromMovements = await StockMovement.findAll({
        where: { product_id: testProduct.id }
      });

      const toMovements = await StockMovement.findAll({
        where: { product_id: secondProduct.id }
      });

      expect(fromMovements).toHaveLength(1);
      expect(fromMovements[0].type).toBe('out');

      expect(toMovements).toHaveLength(1);
      expect(toMovements[0].type).toBe('in');
    });

    it('should reject transfer exceeding source stock', async () => {
      await expect(
        stockService.transferStock(
          testProduct.id,
          secondProduct.id,
          150,
          testCompany.id,
          testUser.id
        )
      ).rejects.toThrow('Insufficient stock');
    });
  });

  describe('getLowStockProducts', () => {
    it('should return products with low stock', async () => {
      await createTestProduct(Product, testCompany.id, {
        name: 'Low Stock 1',
        sku: 'SKU-LOW-1',
        current_stock: 5,
        min_stock_level: 10
      });

      await createTestProduct(Product, testCompany.id, {
        name: 'Low Stock 2',
        sku: 'SKU-LOW-2',
        current_stock: 8,
        min_stock_level: 10
      });

      const result = await stockService.getLowStockProducts(testCompany.id);

      expect(result.success).toBe(true);
      expect(result.count).toBe(2);
      expect(result.products).toHaveLength(2);
    });

    it('should not return products with normal stock', async () => {
      await createTestProduct(Product, testCompany.id, {
        name: 'Normal Stock',
        sku: 'SKU-NORMAL',
        current_stock: 100,
        min_stock_level: 10
      });

      const result = await stockService.getLowStockProducts(testCompany.id);

      const normalProduct = result.products.find(p => p.sku === 'SKU-NORMAL');
      expect(normalProduct).toBeUndefined();
    });

    it('should limit results', async () => {
      for (let i = 0; i < 60; i++) {
        await createTestProduct(Product, testCompany.id, {
          name: `Low Stock ${i}`,
          sku: `SKU-LOW-${i}`,
          current_stock: 1,
          min_stock_level: 10
        });
      }

      const result = await stockService.getLowStockProducts(testCompany.id, 50);

      expect(result.products.length).toBeLessThanOrEqual(50);
    });
  });

  describe('getOutOfStockProducts', () => {
    it('should return products with zero stock', async () => {
      await createTestProduct(Product, testCompany.id, {
        name: 'Out of Stock',
        sku: 'SKU-OUT',
        current_stock: 0
      });

      const result = await stockService.getOutOfStockProducts(testCompany.id);

      expect(result.success).toBe(true);
      expect(result.count).toBeGreaterThan(0);

      const outOfStockProduct = result.products.find(p => p.sku === 'SKU-OUT');
      expect(outOfStockProduct).toBeTruthy();
    });

    it('should not return products with stock', async () => {
      const result = await stockService.getOutOfStockProducts(testCompany.id);

      const testProductInResult = result.products.find(p => p.id === testProduct.id);
      expect(testProductInResult).toBeUndefined();
    });
  });

  describe('getStockValuation', () => {
    it('should calculate total stock valuation', async () => {
      await Product.destroy({ where: { company_id: testCompany.id } });

      await createTestProduct(Product, testCompany.id, {
        name: 'Product 1',
        sku: 'SKU-1',
        cost_price: 10.00,
        selling_price: 20.00,
        current_stock: 100
      });

      await createTestProduct(Product, testCompany.id, {
        name: 'Product 2',
        sku: 'SKU-2',
        cost_price: 5.00,
        selling_price: 15.00,
        current_stock: 50
      });

      const result = await stockService.getStockValuation(testCompany.id);

      expect(result.success).toBe(true);
      expect(result.totalCostValue).toBe(1250.00);
      expect(result.totalRetailValue).toBe(2750.00);
      expect(result.potentialProfit).toBe(1500.00);
      expect(result.totalItems).toBe(150);
      expect(result.totalProducts).toBe(2);
    });
  });

  describe('bulkAdjustStock', () => {
    let products;

    beforeEach(async () => {
      products = [
        await createTestProduct(Product, testCompany.id, {
          name: 'Product 1',
          sku: 'SKU-BULK-1',
          current_stock: 100
        }),
        await createTestProduct(Product, testCompany.id, {
          name: 'Product 2',
          sku: 'SKU-BULK-2',
          current_stock: 50
        })
      ];
    });

    it('should adjust multiple products', async () => {
      const adjustments = [
        { productId: products[0].id, type: 'in', quantity: 20 },
        { productId: products[1].id, type: 'out', quantity: 10 }
      ];

      const result = await stockService.bulkAdjustStock(
        adjustments,
        testCompany.id,
        testUser.id
      );

      expect(result.success).toBe(true);
      expect(result.totalProcessed).toBe(2);
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(0);

      const product1 = await Product.findByPk(products[0].id);
      const product2 = await Product.findByPk(products[1].id);

      expect(product1.current_stock).toBe(120);
      expect(product2.current_stock).toBe(40);
    });

    it('should handle partial failures', async () => {
      const adjustments = [
        { productId: products[0].id, type: 'in', quantity: 20 },
        { productId: 99999, type: 'in', quantity: 10 },
        { productId: products[1].id, type: 'out', quantity: 10 }
      ];

      const result = await stockService.bulkAdjustStock(
        adjustments,
        testCompany.id,
        testUser.id
      );

      expect(result.totalProcessed).toBe(3);
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(1);
    });
  });
});
