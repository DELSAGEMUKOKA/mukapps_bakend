import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UserPin = sequelize.define('UserPin', {
  id: {
    type: DataTypes.STRING(255),
    primaryKey: true
  },
  pinCode: {
    type: DataTypes.TEXT,
    allowNull: true
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
  companyId: {
    // ✅ CORRECTION: TEXT -> STRING(255)
    type: DataTypes.STRING(255),  // ← MODIFICATION
    allowNull: true,
    references: {
      model: 'companies',
      key: 'id'
    }
  },
  createdAt: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  updatedAt: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  _export_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'userpins',
  timestamps: false,
  indexes: [
    { fields: ['userId'] },
    { fields: ['companyId'] },
    { fields: ['pinCode'] }
  ]
});

export default UserPin;