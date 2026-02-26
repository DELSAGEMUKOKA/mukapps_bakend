import {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken
} from '../../../utils/encryption.js';

describe('Encryption Utils Unit Tests', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);

      expect(hash).toBeTruthy();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(20);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'testPassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty password', async () => {
      const hash = await hashPassword('');
      expect(hash).toBeTruthy();
    });

    it('should handle long passwords', async () => {
      const longPassword = 'a'.repeat(1000);
      const hash = await hashPassword(longPassword);
      expect(hash).toBeTruthy();
    });

    it('should handle special characters', async () => {
      const password = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const hash = await hashPassword(password);
      expect(hash).toBeTruthy();
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);
      const isMatch = await comparePassword(password, hash);

      expect(isMatch).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword';
      const hash = await hashPassword(password);
      const isMatch = await comparePassword(wrongPassword, hash);

      expect(isMatch).toBe(false);
    });

    it('should be case sensitive', async () => {
      const password = 'TestPassword';
      const hash = await hashPassword(password);
      const isMatch = await comparePassword('testpassword', hash);

      expect(isMatch).toBe(false);
    });

    it('should handle empty passwords', async () => {
      const hash = await hashPassword('');
      const isMatch = await comparePassword('', hash);

      expect(isMatch).toBe(true);
    });
  });

  describe('generateToken', () => {
    it('should generate a JWT token', () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'admin'
      };

      const token = generateToken(payload);

      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should generate different tokens for different payloads', () => {
      const payload1 = { userId: 1, email: 'user1@example.com' };
      const payload2 = { userId: 2, email: 'user2@example.com' };

      const token1 = generateToken(payload1);
      const token2 = generateToken(payload2);

      expect(token1).not.toBe(token2);
    });

    it('should accept expiry time', () => {
      const payload = { userId: 1 };
      const token = generateToken(payload, '1h');

      expect(token).toBeTruthy();
    });

    it('should handle complex payloads', () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'admin',
        permissions: ['read', 'write', 'delete'],
        metadata: {
          department: 'IT',
          level: 5
        }
      };

      const token = generateToken(payload);
      expect(token).toBeTruthy();
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'admin'
      };

      const token = generateToken(payload);
      const decoded = verifyToken(token);

      expect(decoded).toBeTruthy();
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it('should include token metadata', () => {
      const payload = { userId: 1 };
      const token = generateToken(payload);
      const decoded = verifyToken(token);

      expect(decoded).toHaveProperty('iat');
      expect(decoded).toHaveProperty('exp');
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => {
        verifyToken(invalidToken);
      }).toThrow();
    });

    it('should throw error for tampered token', () => {
      const payload = { userId: 1 };
      const token = generateToken(payload);
      const tamperedToken = token.slice(0, -10) + 'tampered';

      expect(() => {
        verifyToken(tamperedToken);
      }).toThrow();
    });

    it('should throw error for empty token', () => {
      expect(() => {
        verifyToken('');
      }).toThrow();
    });

    it('should handle token expiry', () => {
      const payload = { userId: 1 };
      const token = generateToken(payload, '1ms');

      setTimeout(() => {
        expect(() => {
          verifyToken(token);
        }).toThrow();
      }, 10);
    });
  });

  describe('Token Lifecycle', () => {
    it('should generate, verify, and extract payload correctly', () => {
      const originalPayload = {
        userId: 123,
        email: 'user@example.com',
        role: 'manager',
        companyId: 456
      };

      const token = generateToken(originalPayload);
      const decoded = verifyToken(token);

      expect(decoded.userId).toBe(originalPayload.userId);
      expect(decoded.email).toBe(originalPayload.email);
      expect(decoded.role).toBe(originalPayload.role);
      expect(decoded.companyId).toBe(originalPayload.companyId);
    });

    it('should maintain data integrity through token lifecycle', () => {
      const testCases = [
        { userId: 1, value: 'test' },
        { userId: 999999, value: 'large-id' },
        { userId: 1, value: 'special!@#$%' },
        { userId: 1, array: [1, 2, 3] },
        { userId: 1, nested: { key: 'value' } }
      ];

      testCases.forEach(testCase => {
        const token = generateToken(testCase);
        const decoded = verifyToken(token);

        Object.keys(testCase).forEach(key => {
          expect(decoded[key]).toEqual(testCase[key]);
        });
      });
    });
  });
});
