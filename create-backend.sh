#!/bin/bash

# Create minimal CORS middleware
cat > src/middleware/cors.js << 'EOF'
import cors from 'cors';
import env from '../config/env.js';

const corsOptions = {
  origin: env.CORS_ORIGIN === '*' ? '*' : env.ALLOWED_ORIGINS,
  credentials: true,
  optionsSuccessStatus: 200
};

export default cors(corsOptions);
EOF

# Create minimal routes index
cat > src/routes/index.js << 'EOF'
import express from 'express';
import authRoutes from './auth.js';
import productRoutes from './products.js';
import invoiceRoutes from './invoices.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/invoices', invoiceRoutes);

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is running', timestamp: new Date().toISOString() });
});

export default router;
EOF

# Create auth routes
cat > src/routes/auth.js << 'EOF'
import express from 'express';
import authController from '../controllers/authController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { loginSchema, registerSchema } from '../utils/validators.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', authLimiter, validateRequest(registerSchema), authController.register);
router.post('/login', authLimiter, validateRequest(loginSchema), authController.login);
router.get('/me', authenticate, authController.me);
router.post('/logout', authenticate, authController.logout);

export default router;
EOF

# Create product routes
cat > src/routes/products.js << 'EOF'
import express from 'express';
import productController from '../controllers/productController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { productSchema } from '../utils/validators.js';

const router = express.Router();

router.use(authenticate);

router.get('/', productController.index);
router.get('/barcode/:barcode', productController.getByBarcode);
router.get('/:id', productController.show);
router.post('/', validateRequest(productSchema.create), productController.create);
router.put('/:id', validateRequest(productSchema.update), productController.update);
router.delete('/:id', productController.destroy);

export default router;
EOF

# Create invoice routes  
cat > src/routes/invoices.js << 'EOF'
import express from 'express';
import invoiceController from '../controllers/invoiceController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { invoiceSchema } from '../utils/validators.js';

const router = express.Router();

router.use(authenticate);

router.get('/', invoiceController.index);
router.get('/:id', invoiceController.show);
router.post('/', validateRequest(invoiceSchema.create), invoiceController.create);
router.post('/:id/cancel', invoiceController.cancel);

export default router;
EOF

echo "Routes created successfully"
