import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.STRING(255),
    primaryKey: true
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  permissions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isDefault: {
    type: DataTypes.TEXT,
    allowNull: true
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
  tableName: 'roles',
  timestamps: false,
  indexes: [
    { fields: ['companyId'] },
    { fields: ['name'] }
  ]
});

export default Role;