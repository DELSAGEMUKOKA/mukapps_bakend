import request from 'supertest';
import app from '../../app.js';
import { User, Company, Customer } from '../../models/index.js';
import { createTestCompany, createTestUser, createTestCustomer } from '../helpers/fixtures.js';

describe('Customers Integration Tests', () => {
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

  describe('GET /api/customers', () => {
    it('should get all customers for the company', async () => {
      await createTestCustomer(Customer, testCompany.id, { name: 'Customer 1' });
      await createTestCustomer(Customer, testCompany.id, { name: 'Customer 2' });

      const otherCompany = await createTestCompany(Company, { name: 'Other Company' });
      await createTestCustomer(Customer, otherCompany.id, { name: 'Other Customer' });

      const response = await request(app)
        .get('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.customers).toHaveLength(2);
      expect(response.body.customers[0]).toHaveProperty('name');
      expect(response.body.customers[0]).toHaveProperty('email');
    });

    it('should search customers by name', async () => {
      await createTestCustomer(Customer, testCompany.id, { name: 'John Doe', email: 'john@customer.com' });
      await createTestCustomer(Customer, testCompany.id, { name: 'Jane Smith', email: 'jane@customer.com' });

      const response = await request(app)
        .get('/api/customers?search=john')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.customers).toHaveLength(1);
      expect(response.body.customers[0].name).toMatch(/john/i);
    });

    it('should reject request without authentication', async () => {
      await request(app)
        .get('/api/customers')
        .expect(401);
    });
  });

  describe('GET /api/customers/:id', () => {
    it('should get a specific customer', async () => {
      const customer = await createTestCustomer(Customer, testCompany.id);

      const response = await request(app)
        .get(`/api/customers/${customer.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.customer).toMatchObject({
        id: customer.id,
        name: customer.name,
        email: customer.email
      });
    });

    it('should return 404 for non-existent customer', async () => {
      await request(app)
        .get('/api/customers/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should not return customer from different company', async () => {
      const otherCompany = await createTestCompany(Company, { name: 'Other Company' });
      const otherCustomer = await createTestCustomer(Customer, otherCompany.id);

      await request(app)
        .get(`/api/customers/${otherCustomer.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('POST /api/customers', () => {
    it('should create a new customer', async () => {
      const customerData = {
        name: 'New Customer',
        email: 'new@customer.com',
        phone: '+1234567890',
        address: '123 Customer St',
        city: 'Customer City',
        state: 'Customer State',
        country: 'Customer Country',
        postal_code: '12345',
        tax_number: 'TAX123'
      };

      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(customerData)
        .expect(201);

      expect(response.body.customer).toMatchObject({
        name: customerData.name,
        email: customerData.email
      });

      const customer = await Customer.findOne({
        where: { email: customerData.email, company_id: testCompany.id }
      });
      expect(customer).toBeTruthy();
    });

    it('should reject customer with duplicate email in same company', async () => {
      const existingCustomer = await createTestCustomer(Customer, testCompany.id);

      const customerData = {
        name: 'Duplicate Email Customer',
        email: existingCustomer.email,
        phone: '+9876543210'
      };

      await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(customerData)
        .expect(400);
    });

    it('should reject customer without required fields', async () => {
      const customerData = {
        phone: '+1234567890'
      };

      await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(customerData)
        .expect(400);
    });

    it('should reject customer with invalid email', async () => {
      const customerData = {
        name: 'Invalid Email Customer',
        email: 'invalid-email'
      };

      await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(customerData)
        .expect(400);
    });
  });

  describe('PUT /api/customers/:id', () => {
    it('should update a customer', async () => {
      const customer = await createTestCustomer(Customer, testCompany.id);

      const updateData = {
        name: 'Updated Customer Name',
        phone: '+9999999999'
      };

      const response = await request(app)
        .put(`/api/customers/${customer.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.customer.name).toBe(updateData.name);
      expect(response.body.customer.phone).toBe(updateData.phone);

      const updatedCustomer = await Customer.findByPk(customer.id);
      expect(updatedCustomer.name).toBe(updateData.name);
    });

    it('should not update customer from different company', async () => {
      const otherCompany = await createTestCompany(Company, { name: 'Other Company' });
      const otherCustomer = await createTestCustomer(Customer, otherCompany.id);

      const updateData = {
        name: 'Hacked Name'
      };

      await request(app)
        .put(`/api/customers/${otherCustomer.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);
    });

    it('should reject update with invalid data', async () => {
      const customer = await createTestCustomer(Customer, testCompany.id);

      const updateData = {
        email: 'invalid-email'
      };

      await request(app)
        .put(`/api/customers/${customer.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);
    });
  });

  describe('DELETE /api/customers/:id', () => {
    it('should delete a customer', async () => {
      const customer = await createTestCustomer(Customer, testCompany.id);

      await request(app)
        .delete(`/api/customers/${customer.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const deletedCustomer = await Customer.findByPk(customer.id);
      expect(deletedCustomer).toBeNull();
    });

    it('should not delete customer from different company', async () => {
      const otherCompany = await createTestCompany(Company, { name: 'Other Company' });
      const otherCustomer = await createTestCustomer(Customer, otherCompany.id);

      await request(app)
        .delete(`/api/customers/${otherCustomer.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      const stillExists = await Customer.findByPk(otherCustomer.id);
      expect(stillExists).toBeTruthy();
    });

    it('should return 404 for non-existent customer', async () => {
      await request(app)
        .delete('/api/customers/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('GET /api/customers/:id/invoices', () => {
    it('should get all invoices for a customer', async () => {
      const customer = await createTestCustomer(Customer, testCompany.id);

      const response = await request(app)
        .get(`/api/customers/${customer.id}/invoices`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('invoices');
      expect(Array.isArray(response.body.invoices)).toBe(true);
    });
  });
});
