import cors from 'cors';
import env from '../config/env.js';

const corsOptions = {
  origin: env.CORS_ORIGIN === '*' ? '*' : env.ALLOWED_ORIGINS,
  credentials: true,
  optionsSuccessStatus: 200
};

export default cors(corsOptions);
