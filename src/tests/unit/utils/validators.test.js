import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateSKU,
  validatePrice
} from '../../../utils/validators.js';

describe('Validators Utils Unit Tests', () => {
  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user_name@example.com',
        'user123@example.com',
        'test@sub.example.com'
      ];

      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid',
        '@example.com',
        'user@',
        'user @example.com',
        'user@.com',
        'user@example',
        'user..name@example.com',
        ''
      ];

      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });
    });

    it('should handle null and undefined', () => {
      expect(validateEmail(null)).toBe(false);
      expect(validateEmail(undefined)).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const validPasswords = [
        'Password123',
        'Strong@Pass1',
        'Complex#Pass99',
        'MyP@ssw0rd',
        'Test1234!'
      ];

      validPasswords.forEach(password => {
        expect(validatePassword(password)).toBe(true);
      });
    });

    it('should reject weak passwords', () => {
      const weakPasswords = [
        '123456',
        'password',
        'short',
        '12345',
        'abcdef',
        'PASSWORD',
        '12345678',
        ''
      ];

      weakPasswords.forEach(password => {
        expect(validatePassword(password)).toBe(false);
      });
    });

    it('should require minimum length', () => {
      expect(validatePassword('Pass1')).toBe(false);
      expect(validatePassword('Pass12')).toBe(false);
      expect(validatePassword('Pass123')).toBe(false);
      expect(validatePassword('Pass1234')).toBe(true);
    });

    it('should require at least one number', () => {
      expect(validatePassword('Password')).toBe(false);
      expect(validatePassword('Password1')).toBe(true);
    });

    it('should require at least one letter', () => {
      expect(validatePassword('12345678')).toBe(false);
      expect(validatePassword('Password1')).toBe(true);
    });
  });

  describe('validatePhone', () => {
    it('should validate correct phone formats', () => {
      const validPhones = [
        '+1234567890',
        '+12345678901',
        '+123456789012',
        '+44 1234 567890',
        '+1 (555) 123-4567',
        '(555) 123-4567',
        '555-123-4567',
        '5551234567'
      ];

      validPhones.forEach(phone => {
        expect(validatePhone(phone)).toBe(true);
      });
    });

    it('should reject invalid phone formats', () => {
      const invalidPhones = [
        '123',
        'abc',
        '+1',
        '++1234567890',
        '+abcdefghij',
        ''
      ];

      invalidPhones.forEach(phone => {
        expect(validatePhone(phone)).toBe(false);
      });
    });

    it('should handle international formats', () => {
      const internationalPhones = [
        '+44 20 7946 0958',
        '+33 1 42 86 82 00',
        '+81 3-1234-5678',
        '+86 10 1234 5678'
      ];

      internationalPhones.forEach(phone => {
        expect(validatePhone(phone)).toBe(true);
      });
    });
  });

  describe('validateSKU', () => {
    it('should validate correct SKU formats', () => {
      const validSKUs = [
        'SKU-123',
        'PROD-ABC-001',
        'ITEM_123',
        'TEST-SKU-999',
        'ABC123',
        'A1B2C3'
      ];

      validSKUs.forEach(sku => {
        expect(validateSKU(sku)).toBe(true);
      });
    });

    it('should reject invalid SKU formats', () => {
      const invalidSKUs = [
        '',
        ' ',
        'AB',
        'SKU WITH SPACES',
        'SKU@INVALID',
        'SKU#123',
        '!!!'
      ];

      invalidSKUs.forEach(sku => {
        expect(validateSKU(sku)).toBe(false);
      });
    });

    it('should require minimum length', () => {
      expect(validateSKU('AB')).toBe(false);
      expect(validateSKU('ABC')).toBe(true);
    });

    it('should allow alphanumeric with hyphens and underscores', () => {
      expect(validateSKU('SKU-123')).toBe(true);
      expect(validateSKU('SKU_123')).toBe(true);
      expect(validateSKU('SKU123')).toBe(true);
      expect(validateSKU('SKU-_-123')).toBe(true);
    });
  });

  describe('validatePrice', () => {
    it('should validate correct price formats', () => {
      const validPrices = [
        0,
        0.01,
        10.00,
        99.99,
        1000.50,
        10000,
        0.99
      ];

      validPrices.forEach(price => {
        expect(validatePrice(price)).toBe(true);
      });
    });

    it('should reject negative prices', () => {
      const negativePrices = [
        -1,
        -0.01,
        -10.50,
        -1000
      ];

      negativePrices.forEach(price => {
        expect(validatePrice(price)).toBe(false);
      });
    });

    it('should reject non-numeric values', () => {
      expect(validatePrice('abc')).toBe(false);
      expect(validatePrice(null)).toBe(false);
      expect(validatePrice(undefined)).toBe(false);
      expect(validatePrice(NaN)).toBe(false);
    });

    it('should handle string numbers', () => {
      expect(validatePrice('10.50')).toBe(true);
      expect(validatePrice('0')).toBe(true);
      expect(validatePrice('99.99')).toBe(true);
    });

    it('should reject prices with more than 2 decimal places', () => {
      expect(validatePrice(10.123)).toBe(false);
      expect(validatePrice(99.999)).toBe(false);
      expect(validatePrice(10.12)).toBe(true);
      expect(validatePrice(10.1)).toBe(true);
    });

    it('should handle edge cases', () => {
      expect(validatePrice(0)).toBe(true);
      expect(validatePrice(0.00)).toBe(true);
      expect(validatePrice(Infinity)).toBe(false);
      expect(validatePrice(-Infinity)).toBe(false);
    });
  });

  describe('Cross-validation scenarios', () => {
    it('should validate user registration data', () => {
      const userData = {
        email: 'test@example.com',
        password: 'SecurePass123',
        phone: '+1234567890'
      };

      expect(validateEmail(userData.email)).toBe(true);
      expect(validatePassword(userData.password)).toBe(true);
      expect(validatePhone(userData.phone)).toBe(true);
    });

    it('should validate product data', () => {
      const productData = {
        sku: 'PROD-001',
        price: 99.99,
        costPrice: 50.00
      };

      expect(validateSKU(productData.sku)).toBe(true);
      expect(validatePrice(productData.price)).toBe(true);
      expect(validatePrice(productData.costPrice)).toBe(true);
    });

    it('should detect invalid mixed data', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'weak',
        phone: '123',
        sku: 'AB',
        price: -10
      };

      expect(validateEmail(invalidData.email)).toBe(false);
      expect(validatePassword(invalidData.password)).toBe(false);
      expect(validatePhone(invalidData.phone)).toBe(false);
      expect(validateSKU(invalidData.sku)).toBe(false);
      expect(validatePrice(invalidData.price)).toBe(false);
    });
  });
});
