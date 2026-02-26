import request from 'supertest';
import app from '../../app.js';
import { User, Company, Product, Category } from '../../models/index.js';
import { createTestCompany, createTestUser, createTestProduct, createTestCategory } from '../helpers/fixtures.js';

describe('Products Integration Tests', () => {
  let testCompany;
  let testUser;
  let authToken;

  beforeEach(async () => {
    testCompany = await createTestCompany(Company);
    testUser = await createTestUser(User, testCompany.id, { role: 'admin' });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'password123'
      });

    authToken = loginResponse.body.token;
  });

  describe('GET /api/products', () => {
    it('should get all products for the company', async () => {
      await createTestProduct(Product, testCompany.id, { name: 'Product 1' });
      await createTestProduct(Product, testCompany.id, { name: 'Product 2' });

      const otherCompany = await createTestCompany(Company, { name: 'Other Company' });
      await createTestProduct(Product, otherCompany.id, { name: 'Other Product' });

      const response = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.products).toHaveLength(2);
      expect(response.body.products[0]).toHaveProperty('name');
      expect(response.body.products[0]).toHaveProperty('sku');
    });

    it('should filter products by category', async () => {
      await createTestProduct(Product, testCompany.id, { name: 'Electronics Item', category: 'Electronics' });
      await createTestProduct(Product, testCompany.id, { name: 'Furniture Item', category: 'Furniture' });

      const response = await request(app)
        .get('/api/products?category=Electronics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.products).toHaveLength(1);
      expect(response.body.products[0].category).toBe('Electronics');
    });

    it('should search products by name', async () => {
      await createTestProduct(Product, testCompany.id, { name: 'Laptop Dell XPS' });
      await createTestProduct(Product, testCompany.id, { name: 'Desktop Computer' });

      const response = await request(app)
        .get('/api/products?search=laptop')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.products).toHaveLength(1);
      expect(response.body.products[0].name).toMatch(/laptop/i);
    });

    it('should reject request without authentication', async () => {
      await request(app)
        .get('/api/products')
        .expect(401);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should get a specific product', async () => {
      const product = await createTestProduct(Product, testCompany.id);

      const response = await request(app)
        .get(`/api/products/${product.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.product).toMatchObject({
        id: product.id,
        name: product.name,
        sku: product.sku
      });
    });

    it('should return 404 for non-existent product', async () => {
      await request(app)
        .get('/api/products/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should not return product from different company', async () => {
      const otherCompany = await createTestCompany(Company, { name: 'Other Company' });
      const otherProduct = await createTestProduct(Product, otherCompany.id);

      await request(app)
        .get(`/api/products/${otherProduct.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const productData = {
        name: 'New Product',
        sku: 'SKU-NEW-001',
        description: 'A new test product',
        category: 'Electronics',
        cost_price: 50.00,
        selling_price: 100.00,
        current_stock: 50,
        min_stock_level: 10,
        unit: 'pcs'
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(201);

      expect(response.body.product).toMatchObject({
        name: productData.name,
        sku: productData.sku
      });

      const product = await Product.findOne({
        where: { sku: productData.sku, company_id: testCompany.id }
      });
      expect(product).toBeTruthy();
    });

    it('should reject product with duplicate SKU in same company', async () => {
      const existingProduct = await createTestProduct(Product, testCompany.id);

      const productData = {
        name: 'Duplicate SKU Product',
        sku: existingProduct.sku,
        selling_price: 100.00,
        current_stock: 50
      };

      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(400);
    });

    it('should reject product without required fields', async () => {
      const productData = {
        name: 'Incomplete Product'
      };

      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(400);
    });

    it('should reject product with negative price', async () => {
      const productData = {
        name: 'Invalid Price Product',
        sku: 'SKU-INVALID',
        selling_price: -10.00,
        current_stock: 50
      };

      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(400);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update a product', async () => {
      const product = await createTestProduct(Product, testCompany.id);

      const updateData = {
        name: 'Updated Product Name',
        selling_price: 150.00
      };

      const response = await request(app)
        .put(`/api/products/${product.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.product.name).toBe(updateData.name);
      expect(parseFloat(response.body.product.selling_price)).toBe(updateData.selling_price);

      const updatedProduct = await Product.findByPk(product.id);
      expect(updatedProduct.name).toBe(updateData.name);
    });

    it('should not update product from different company', async () => {
      const otherCompany = await createTestCompany(Company, { name: 'Other Company' });
      const otherProduct = await createTestProduct(Product, otherCompany.id);

      const updateData = {
        name: 'Hacked Name'
      };

      await request(app)
        .put(`/api/products/${otherProduct.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);
    });

    it('should reject update with invalid data', async () => {
      const product = await createTestProduct(Product, testCompany.id);

      const updateData = {
        selling_price: 'invalid'
      };

      await request(app)
        .put(`/api/products/${product.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete a product', async () => {
      const product = await createTestProduct(Product, testCompany.id);

      await request(app)
        .delete(`/api/products/${product.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const deletedProduct = await Product.findByPk(product.id);
      expect(deletedProduct).toBeNull();
    });

    it('should not delete product from different company', async () => {
      const otherCompany = await createTestCompany(Company, { name: 'Other Company' });
      const otherProduct = await createTestProduct(Product, otherCompany.id);

      await request(app)
        .delete(`/api/products/${otherProduct.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      const stillExists = await Product.findByPk(otherProduct.id);
      expect(stillExists).toBeTruthy();
    });

    it('should return 404 for non-existent product', async () => {
      await request(app)
        .delete('/api/products/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('GET /api/products/low-stock', () => {
    it('should get products with low stock', async () => {
      await createTestProduct(Product, testCompany.id, {
        name: 'Low Stock Product',
        current_stock: 5,
        min_stock_level: 10
      });

      await createTestProduct(Product, testCompany.id, {
        name: 'Normal Stock Product',
        current_stock: 100,
        min_stock_level: 10
      });

      const response = await request(app)
        .get('/api/products/low-stock')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.products).toHaveLength(1);
      expect(response.body.products[0].name).toBe('Low Stock Product');
    });
  });

  describe('POST /api/products/:id/stock-adjustment', () => {
    it('should adjust stock in', async () => {
      const product = await createTestProduct(Product, testCompany.id, {
        current_stock: 100
      });

      const adjustmentData = {
        type: 'in',
        quantity: 50,
        reference: 'PO-001',
        notes: 'Purchase order delivery'
      };

      const response = await request(app)
        .post(`/api/products/${product.id}/stock-adjustment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(adjustmentData)
        .expect(200);

      expect(response.body.product.newStock).toBe(150);

      const updatedProduct = await Product.findByPk(product.id);
      expect(updatedProduct.current_stock).toBe(150);
    });

    it('should adjust stock out', async () => {
      const product = await createTestProduct(Product, testCompany.id, {
        current_stock: 100
      });

      const adjustmentData = {
        type: 'out',
        quantity: 30,
        reference: 'SALE-001',
        notes: 'Sales order'
      };

      const response = await request(app)
        .post(`/api/products/${product.id}/stock-adjustment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(adjustmentData)
        .expect(200);

      expect(response.body.product.newStock).toBe(70);
    });

    it('should reject stock out exceeding available stock', async () => {
      const product = await createTestProduct(Product, testCompany.id, {
        current_stock: 10
      });

      const adjustmentData = {
        type: 'out',
        quantity: 20
      };

      await request(app)
        .post(`/api/products/${product.id}/stock-adjustment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(adjustmentData)
        .expect(400);
    });

    it('should reject invalid adjustment type', async () => {
      const product = await createTestProduct(Product, testCompany.id);

      const adjustmentData = {
        type: 'invalid',
        quantity: 10
      };

      await request(app)
        .post(`/api/products/${product.id}/stock-adjustment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(adjustmentData)
        .expect(400);
    });
  });

  describe('Role-based access control', () => {
    it('should allow manager to create products', async () => {
      const manager = await createTestUser(User, testCompany.id, {
        email: 'manager@test.com',
        role: 'manager'
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: manager.email,
          password: 'password123'
        });

      const managerToken = loginResponse.body.token;

      const productData = {
        name: 'Manager Product',
        sku: 'SKU-MGR-001',
        selling_price: 100.00,
        current_stock: 50
      };

      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(productData)
        .expect(201);
    });

    it('should not allow viewer to create products', async () => {
      const viewer = await createTestUser(User, testCompany.id, {
        email: 'viewer@test.com',
        role: 'viewer'
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: viewer.email,
          password: 'password123'
        });

      const viewerToken = loginResponse.body.token;

      const productData = {
        name: 'Viewer Product',
        sku: 'SKU-VWR-001',
        selling_price: 100.00,
        current_stock: 50
      };

      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send(productData)
        .expect(403);
    });

    it('should allow viewer to read products', async () => {
      const viewer = await createTestUser(User, testCompany.id, {
        email: 'viewer@test.com',
        role: 'viewer'
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: viewer.email,
          password: 'password123'
        });

      const viewerToken = loginResponse.body.token;

      await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${viewerToken}`)
        .expect(200);
    });
  });
});
