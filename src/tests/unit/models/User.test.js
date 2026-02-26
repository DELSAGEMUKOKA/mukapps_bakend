import { User, Company } from '../../../models/index.js';
import { createTestCompany, createTestUser } from '../../helpers/fixtures.js';
import { hashPassword, comparePassword } from '../../../utils/encryption.js';

describe('User Model Unit Tests', () => {
  let testCompany;

  beforeEach(async () => {
    testCompany = await createTestCompany(Company);
  });

  describe('Model Validation', () => {
    it('should create a valid user', async () => {
      const user = await createTestUser(User, testCompany.id);

      expect(user).toBeTruthy();
      expect(user.id).toBeTruthy();
      expect(user.email).toBe('user@test.com');
      expect(user.company_id).toBe(testCompany.id);
    });

    it('should require name', async () => {
      try {
        await User.create({
          email: 'test@example.com',
          password: await hashPassword('password123'),
          company_id: testCompany.id
        });
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).toBe('SequelizeValidationError');
      }
    });

    it('should require email', async () => {
      try {
        await User.create({
          name: 'Test User',
          password: await hashPassword('password123'),
          company_id: testCompany.id
        });
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).toBe('SequelizeValidationError');
      }
    });

    it('should require valid email format', async () => {
      try {
        await User.create({
          name: 'Test User',
          email: 'invalid-email',
          password: await hashPassword('password123'),
          company_id: testCompany.id
        });
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).toBe('SequelizeValidationError');
      }
    });

    it('should require unique email per company', async () => {
      await createTestUser(User, testCompany.id, { email: 'duplicate@test.com' });

      try {
        await createTestUser(User, testCompany.id, { email: 'duplicate@test.com' });
        fail('Should have thrown unique constraint error');
      } catch (error) {
        expect(error.name).toBe('SequelizeUniqueConstraintError');
      }
    });

    it('should allow same email for different companies', async () => {
      const company1 = await createTestCompany(Company, { name: 'Company 1' });
      const company2 = await createTestCompany(Company, { name: 'Company 2' });

      const user1 = await createTestUser(User, company1.id, { email: 'shared@test.com' });
      const user2 = await createTestUser(User, company2.id, { email: 'shared@test.com' });

      expect(user1.email).toBe(user2.email);
      expect(user1.company_id).not.toBe(user2.company_id);
    });

    it('should require password', async () => {
      try {
        await User.create({
          name: 'Test User',
          email: 'test@example.com',
          company_id: testCompany.id
        });
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).toBe('SequelizeValidationError');
      }
    });

    it('should have default role as user', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: await hashPassword('password123'),
        company_id: testCompany.id
      });

      expect(user.role).toBe('user');
    });

    it('should have default is_active as true', async () => {
      const user = await createTestUser(User, testCompany.id);
      expect(user.is_active).toBe(true);
    });

    it('should accept valid roles', async () => {
      const roles = ['admin', 'manager', 'user', 'viewer'];

      for (const role of roles) {
        const user = await createTestUser(User, testCompany.id, {
          email: `${role}@test.com`,
          role
        });
        expect(user.role).toBe(role);
      }
    });
  });

  describe('Password Handling', () => {
    it('should store hashed password', async () => {
      const plainPassword = 'password123';
      const user = await createTestUser(User, testCompany.id);

      expect(user.password).not.toBe(plainPassword);
      expect(user.password.length).toBeGreaterThan(20);
    });

    it('should validate correct password', async () => {
      const plainPassword = 'password123';
      const hashedPassword = await hashPassword(plainPassword);

      const user = await createTestUser(User, testCompany.id, {
        password: hashedPassword
      });

      const isValid = await comparePassword(plainPassword, user.password);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const user = await createTestUser(User, testCompany.id);

      const isValid = await comparePassword('wrongpassword', user.password);
      expect(isValid).toBe(false);
    });
  });

  describe('User Methods', () => {
    it('should track failed login attempts', async () => {
      const user = await createTestUser(User, testCompany.id);

      await user.update({ failed_login_attempts: 3 });
      await user.reload();

      expect(user.failed_login_attempts).toBe(3);
    });

    it('should set locked_until timestamp', async () => {
      const user = await createTestUser(User, testCompany.id);
      const lockTime = new Date(Date.now() + 15 * 60 * 1000);

      await user.update({ locked_until: lockTime });
      await user.reload();

      expect(user.locked_until).toBeTruthy();
    });

    it('should track last login', async () => {
      const user = await createTestUser(User, testCompany.id);
      const loginTime = new Date();

      await user.update({ last_login: loginTime });
      await user.reload();

      expect(user.last_login).toBeTruthy();
    });

    it('should handle email verification', async () => {
      const user = await createTestUser(User, testCompany.id, {
        email_verified: false,
        email_verification_token: 'test-token'
      });

      expect(user.email_verified).toBe(false);
      expect(user.email_verification_token).toBe('test-token');

      await user.update({
        email_verified: true,
        email_verification_token: null
      });
      await user.reload();

      expect(user.email_verified).toBe(true);
      expect(user.email_verification_token).toBeNull();
    });

    it('should handle password reset tokens', async () => {
      const user = await createTestUser(User, testCompany.id);
      const resetToken = 'reset-token-123';
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

      await user.update({
        password_reset_token: resetToken,
        password_reset_expires: resetExpires
      });
      await user.reload();

      expect(user.password_reset_token).toBe(resetToken);
      expect(user.password_reset_expires).toBeTruthy();
    });
  });

  describe('Associations', () => {
    it('should belong to a company', async () => {
      const user = await createTestUser(User, testCompany.id);
      const company = await user.getCompany();

      expect(company).toBeTruthy();
      expect(company.id).toBe(testCompany.id);
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt timestamp', async () => {
      const user = await createTestUser(User, testCompany.id);
      expect(user.created_at).toBeTruthy();
    });

    it('should have updatedAt timestamp', async () => {
      const user = await createTestUser(User, testCompany.id);
      expect(user.updated_at).toBeTruthy();
    });

    it('should update updatedAt on change', async () => {
      const user = await createTestUser(User, testCompany.id);
      const originalUpdatedAt = user.updated_at;

      await new Promise(resolve => setTimeout(resolve, 100));

      await user.update({ name: 'Updated Name' });
      await user.reload();

      expect(user.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});
