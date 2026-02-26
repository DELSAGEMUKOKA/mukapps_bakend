import request from 'supertest';
import app from '../../app.js';
import { User, Company, Subscription } from '../../models/index.js';
import { createTestCompany, createTestUser } from '../helpers/fixtures.js';

describe('Authentication Integration Tests', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user with company', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
        companyName: 'John\'s Company',
        phone: '+1234567890'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toMatchObject({
        name: userData.name,
        email: userData.email,
        role: 'admin'
      });
      expect(response.body.company).toHaveProperty('name', userData.companyName);

      const user = await User.findOne({ where: { email: userData.email } });
      expect(user).toBeTruthy();
      expect(user.company_id).toBeTruthy();

      const subscription = await Subscription.findOne({
        where: { company_id: user.company_id }
      });
      expect(subscription).toBeTruthy();
      expect(subscription.status).toBe('trial');
    });

    it('should reject registration with existing email', async () => {
      const company = await createTestCompany(Company);
      await createTestUser(User, company.id, { email: 'existing@example.com' });

      const userData = {
        name: 'Jane Doe',
        email: 'existing@example.com',
        password: 'SecurePass123!',
        companyName: 'Jane\'s Company'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject registration with weak password', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123',
        companyName: 'John\'s Company'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject registration without required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser;
    let testCompany;

    beforeEach(async () => {
      testCompany = await createTestCompany(Company);
      testUser = await createTestUser(User, testCompany.id, {
        email: 'test@example.com'
      });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user).toMatchObject({
        email: 'test@example.com',
        role: testUser.role
      });
    });

    it('should reject login with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject login for inactive user', async () => {
      await testUser.update({ is_active: false });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body.error).toMatch(/inactive/i);
    });

    it('should lock account after 5 failed attempts', async () => {
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrongpassword'
          });
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body.error).toMatch(/locked/i);

      const user = await User.findByPk(testUser.id);
      expect(user.locked_until).toBeTruthy();
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    let testUser;
    let testCompany;

    beforeEach(async () => {
      testCompany = await createTestCompany(Company);
      testUser = await createTestUser(User, testCompany.id, {
        email: 'test@example.com'
      });
    });

    it('should send password reset email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'test@example.com' })
        .expect(200);

      expect(response.body).toHaveProperty('message');

      const user = await User.findByPk(testUser.id);
      expect(user.password_reset_token).toBeTruthy();
      expect(user.password_reset_expires).toBeTruthy();
    });

    it('should return success even for non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    let testUser;
    let testCompany;
    let resetToken;

    beforeEach(async () => {
      testCompany = await createTestCompany(Company);
      testUser = await createTestUser(User, testCompany.id, {
        email: 'test@example.com'
      });

      resetToken = 'test-reset-token-123';
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

      await testUser.update({
        password_reset_token: resetToken,
        password_reset_expires: resetExpires
      });
    });

    it('should reset password with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'NewSecurePass123!'
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'NewSecurePass123!'
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('token');
    });

    it('should reject reset with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid-token',
          newPassword: 'NewSecurePass123!'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject reset with expired token', async () => {
      await testUser.update({
        password_reset_expires: new Date(Date.now() - 1000)
      });

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'NewSecurePass123!'
        })
        .expect(400);

      expect(response.body.error).toMatch(/expired/i);
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    let testUser;
    let testCompany;
    let refreshToken;

    beforeEach(async () => {
      testCompany = await createTestCompany(Company);
      testUser = await createTestUser(User, testCompany.id);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'password123'
        });

      refreshToken = loginResponse.body.refreshToken;
    });

    it('should refresh token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.token).not.toBe(refreshToken);
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/verify-email', () => {
    let testUser;
    let testCompany;
    let verificationToken;

    beforeEach(async () => {
      testCompany = await createTestCompany(Company);
      verificationToken = 'test-verification-token-123';
      testUser = await createTestUser(User, testCompany.id, {
        email_verification_token: verificationToken,
        email_verified: false
      });
    });

    it('should verify email with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: verificationToken })
        .expect(200);

      expect(response.body).toHaveProperty('message');

      const user = await User.findByPk(testUser.id);
      expect(user.email_verified).toBe(true);
      expect(user.email_verification_token).toBeNull();
    });

    it('should reject invalid verification token', async () => {
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: 'invalid-token' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/auth/me', () => {
    let testUser;
    let testCompany;
    let authToken;

    beforeEach(async () => {
      testCompany = await createTestCompany(Company);
      testUser = await createTestUser(User, testCompany.id);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'password123'
        });

      authToken = loginResponse.body.token;
    });

    it('should get current user profile', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.user).toMatchObject({
        email: testUser.email,
        name: testUser.name
      });
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });
});
