# Test Suite Documentation

Comprehensive test suite for the Inventory Management System backend.

## Setup

### Install Dependencies

First, install the required testing dependencies:

```bash
npm install --save-dev jest @types/jest supertest
```

### Environment Configuration

Create a `.env.test` file for test environment:

```env
NODE_ENV=test
DB_HOST=localhost
DB_PORT=3306
DB_NAME=inventory_test
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=test_jwt_secret_key_123
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Specific Test File
```bash
npx jest src/tests/integration/auth.test.js
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

## Test Structure

### Integration Tests (`src/tests/integration/`)

Integration tests verify the API endpoints and business logic work correctly together.

- **auth.test.js** - Authentication and authorization tests
  - User registration
  - Login/logout
  - Password reset
  - Email verification
  - Token management

- **products.test.js** - Product management tests
  - CRUD operations
  - Stock adjustments
  - Search and filtering
  - Role-based access control

- **invoices.test.js** - Invoice management tests
  - Invoice creation and updates
  - Payment recording
  - PDF generation
  - Status management

- **customers.test.js** - Customer management tests
  - Customer CRUD operations
  - Search functionality
  - Customer invoices

### Unit Tests (`src/tests/unit/`)

Unit tests verify individual components work correctly in isolation.

#### Models (`src/tests/unit/models/`)

- **User.test.js** - User model validations
  - Field validations
  - Password hashing
  - Email verification
  - Account locking

- **Product.test.js** - Product model validations
  - Field validations
  - Price management
  - Stock tracking
  - Category management

#### Services (`src/tests/unit/services/`)

- **stockService.test.js** - Stock management service
  - Stock adjustments
  - Stock transfers
  - Low stock detection
  - Bulk operations
  - Stock valuation

#### Utils (`src/tests/unit/utils/`)

- **encryption.test.js** - Encryption utilities
  - Password hashing
  - Token generation and verification
  - Security functions

- **validators.test.js** - Validation utilities
  - Email validation
  - Password strength
  - Phone numbers
  - SKU format
  - Price validation

- **dateUtils.test.js** - Date utilities
  - Date formatting
  - Currency formatting
  - Date manipulation
  - Expiry checking

### Test Helpers (`src/tests/helpers/`)

- **setup.js** - Test environment setup
  - Database connection
  - Test database initialization
  - Cleanup between tests

- **fixtures.js** - Test data generators
  - Company fixtures
  - User fixtures
  - Product fixtures
  - Customer fixtures
  - Invoice fixtures
  - Helper functions for creating test data

## Test Coverage

The test suite aims for:
- **80%+ line coverage**
- **75%+ branch coverage**
- **80%+ function coverage**

### Coverage Reports

After running tests with coverage, view the HTML report:

```bash
open coverage/index.html
```

## Writing New Tests

### Integration Test Example

```javascript
import request from 'supertest';
import app from '../../app.js';
import { User, Company } from '../../models/index.js';

describe('New Feature Tests', () => {
  let authToken;

  beforeEach(async () => {
    // Setup test data
    const company = await Company.create({ name: 'Test Company' });
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      company_id: company.id
    });

    // Login to get auth token
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });

    authToken = response.body.token;
  });

  it('should test new feature', async () => {
    const response = await request(app)
      .get('/api/new-endpoint')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
  });
});
```

### Unit Test Example

```javascript
import { myFunction } from '../../../utils/myUtil.js';

describe('MyFunction Unit Tests', () => {
  it('should return expected result', () => {
    const result = myFunction(input);
    expect(result).toBe(expectedOutput);
  });

  it('should handle edge cases', () => {
    expect(() => myFunction(null)).toThrow();
  });
});
```

## Best Practices

1. **Test Isolation**
   - Each test should be independent
   - Use `beforeEach` for setup
   - Clean up after tests

2. **Descriptive Names**
   - Use clear, descriptive test names
   - Follow the pattern: "should [expected behavior] when [condition]"

3. **Arrange-Act-Assert**
   - Arrange: Set up test data
   - Act: Execute the function/endpoint
   - Assert: Verify the results

4. **Test Edge Cases**
   - Test boundary conditions
   - Test error scenarios
   - Test validation failures

5. **Mock External Dependencies**
   - Mock email services
   - Mock payment gateways
   - Mock third-party APIs

6. **Keep Tests Fast**
   - Use test database
   - Minimize I/O operations
   - Use fixtures for test data

## Continuous Integration

Tests should run automatically on:
- Pre-commit hooks
- Pull requests
- Main branch pushes
- Scheduled builds

## Troubleshooting

### Tests Failing Locally

1. Ensure test database is created:
   ```bash
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS inventory_test;"
   ```

2. Run database migrations:
   ```bash
   NODE_ENV=test npm run migrate
   ```

3. Clear test data:
   ```bash
   mysql -u root -p inventory_test -e "DROP DATABASE inventory_test; CREATE DATABASE inventory_test;"
   ```

### Slow Tests

- Check for unnecessary database queries
- Review test setup/teardown
- Consider using transactions for faster rollback

### Flaky Tests

- Avoid time-dependent tests
- Use proper async/await
- Ensure test isolation

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)

## Contributing

When adding new features:
1. Write tests first (TDD)
2. Ensure all tests pass
3. Maintain test coverage above 80%
4. Update this documentation if needed
