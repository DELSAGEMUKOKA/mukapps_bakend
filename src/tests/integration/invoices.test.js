import request from 'supertest';
import app from '../../app.js';
import { User, Company, Invoice, Customer, Product } from '../../models/index.js';
import {
  createTestCompany,
  createTestUser,
  createTestCustomer,
  createTestProduct,
  createTestInvoice
} from '../helpers/fixtures.js';

describe('Invoices Integration Tests', () => {
  let testCompany;
  let testUser;
  let testCustomer;
  let testProduct;
  let authToken;

  beforeEach(async () => {
    testCompany = await createTestCompany(Company);
    testUser = await createTestUser(User, testCompany.id, { role: 'admin' });
    testCustomer = await createTestCustomer(Customer, testCompany.id);
    testProduct = await createTestProduct(Product, testCompany.id);

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'password123'
      });

    authToken = loginResponse.body.token;
  });

  describe('GET /api/invoices', () => {
    it('should get all invoices for the company', async () => {
      await createTestInvoice(Invoice, testCompany.id, testCustomer.id);
      await createTestInvoice(Invoice, testCompany.id, testCustomer.id);

      const otherCompany = await createTestCompany(Company, { name: 'Other Company' });
      const otherCustomer = await createTestCustomer(Customer, otherCompany.id);
      await createTestInvoice(Invoice, otherCompany.id, otherCustomer.id);

      const response = await request(app)
        .get('/api/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.invoices).toHaveLength(2);
      expect(response.body.invoices[0]).toHaveProperty('invoice_number');
    });

    it('should filter invoices by payment status', async () => {
      await createTestInvoice(Invoice, testCompany.id, testCustomer.id, { payment_status: 'paid' });
      await createTestInvoice(Invoice, testCompany.id, testCustomer.id, { payment_status: 'pending' });

      const response = await request(app)
        .get('/api/invoices?status=paid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.invoices).toHaveLength(1);
      expect(response.body.invoices[0].payment_status).toBe('paid');
    });
  });

  describe('GET /api/invoices/:id', () => {
    it('should get a specific invoice', async () => {
      const invoice = await createTestInvoice(Invoice, testCompany.id, testCustomer.id);

      const response = await request(app)
        .get(`/api/invoices/${invoice.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.invoice).toMatchObject({
        id: invoice.id,
        invoice_number: invoice.invoice_number
      });
    });

    it('should return 404 for non-existent invoice', async () => {
      await request(app)
        .get('/api/invoices/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('POST /api/invoices', () => {
    it('should create a new invoice', async () => {
      const invoiceData = {
        customer_id: testCustomer.id,
        date: new Date().toISOString(),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
          {
            product_id: testProduct.id,
            name: testProduct.name,
            quantity: 2,
            unit_price: 100.00,
            total: 200.00
          }
        ],
        subtotal: 200.00,
        tax: 20.00,
        discount: 0.00,
        total: 220.00,
        notes: 'Test invoice'
      };

      const response = await request(app)
        .post('/api/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invoiceData)
        .expect(201);

      expect(response.body.invoice).toHaveProperty('invoice_number');
      expect(response.body.invoice.total).toBe('220.00');

      const createdInvoice = await Invoice.findByPk(response.body.invoice.id);
      expect(createdInvoice).toBeTruthy();
    });

    it('should reject invoice without customer', async () => {
      const invoiceData = {
        items: [{
          product_id: testProduct.id,
          quantity: 1,
          unit_price: 100.00,
          total: 100.00
        }],
        subtotal: 100.00,
        total: 100.00
      };

      await request(app)
        .post('/api/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invoiceData)
        .expect(400);
    });

    it('should reject invoice without items', async () => {
      const invoiceData = {
        customer_id: testCustomer.id,
        items: [],
        subtotal: 0.00,
        total: 0.00
      };

      await request(app)
        .post('/api/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invoiceData)
        .expect(400);
    });
  });

  describe('PUT /api/invoices/:id', () => {
    it('should update an invoice', async () => {
      const invoice = await createTestInvoice(Invoice, testCompany.id, testCustomer.id);

      const updateData = {
        notes: 'Updated notes',
        payment_status: 'paid'
      };

      const response = await request(app)
        .put(`/api/invoices/${invoice.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.invoice.notes).toBe(updateData.notes);
      expect(response.body.invoice.payment_status).toBe(updateData.payment_status);
    });

    it('should not update invoice from different company', async () => {
      const otherCompany = await createTestCompany(Company, { name: 'Other Company' });
      const otherCustomer = await createTestCustomer(Customer, otherCompany.id);
      const otherInvoice = await createTestInvoice(Invoice, otherCompany.id, otherCustomer.id);

      const updateData = {
        notes: 'Hacked notes'
      };

      await request(app)
        .put(`/api/invoices/${otherInvoice.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);
    });
  });

  describe('DELETE /api/invoices/:id', () => {
    it('should delete an invoice', async () => {
      const invoice = await createTestInvoice(Invoice, testCompany.id, testCustomer.id);

      await request(app)
        .delete(`/api/invoices/${invoice.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const deletedInvoice = await Invoice.findByPk(invoice.id);
      expect(deletedInvoice).toBeNull();
    });

    it('should not delete paid invoice', async () => {
      const invoice = await createTestInvoice(Invoice, testCompany.id, testCustomer.id, {
        payment_status: 'paid'
      });

      await request(app)
        .delete(`/api/invoices/${invoice.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('POST /api/invoices/:id/payment', () => {
    it('should record payment for invoice', async () => {
      const invoice = await createTestInvoice(Invoice, testCompany.id, testCustomer.id, {
        total: 100.00,
        payment_status: 'pending'
      });

      const paymentData = {
        amount: 100.00,
        paymentMethod: 'cash',
        paymentDate: new Date().toISOString(),
        notes: 'Full payment received'
      };

      const response = await request(app)
        .post(`/api/invoices/${invoice.id}/payment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect(200);

      expect(response.body.invoice.payment_status).toBe('paid');
    });

    it('should record partial payment', async () => {
      const invoice = await createTestInvoice(Invoice, testCompany.id, testCustomer.id, {
        total: 100.00,
        payment_status: 'pending'
      });

      const paymentData = {
        amount: 50.00,
        paymentMethod: 'cash'
      };

      const response = await request(app)
        .post(`/api/invoices/${invoice.id}/payment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect(200);

      expect(response.body.invoice.payment_status).toBe('partial');
      expect(response.body.remainingAmount).toBe(50.00);
    });
  });

  describe('GET /api/invoices/:id/pdf', () => {
    it('should generate invoice PDF', async () => {
      const invoice = await createTestInvoice(Invoice, testCompany.id, testCustomer.id);

      const response = await request(app)
        .get(`/api/invoices/${invoice.id}/pdf`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('html');
      expect(response.body).toHaveProperty('filename');
    });
  });
});
