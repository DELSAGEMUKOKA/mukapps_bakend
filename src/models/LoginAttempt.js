import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const LoginAttempt = sequelize.define('LoginAttempt', {
  id: {
    type: DataTypes.STRING(255),
    primaryKey: true
  },
  userId: {
    // ✅ CORRECTION: TEXT -> STRING(255)
    type: DataTypes.STRING(255),  // ← MODIFICATION
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  email: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  success: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  timestamp: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  captchaVerified: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  _export_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'loginattempts',
  timestamps: false,
  indexes: [
    { fields: ['userId'] },
    { fields: ['email'] },
    { fields: ['timestamp'] },
    { fields: ['success'] }
  ]
});

export default LoginAttempt;