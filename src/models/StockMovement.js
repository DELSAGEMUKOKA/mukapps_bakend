import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const StockMovement = sequelize.define('StockMovement', {
  id: {
    type: DataTypes.STRING(255),
    primaryKey: true
  },
  productId: {
    // ✅ CORRECTION: TEXT -> STRING(255)
    type: DataTypes.STRING(255),  // ← MODIFICATION
    allowNull: true,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  quantity: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  previousStock: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  currentStock: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reference: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  date: {
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
  _export_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'stockmovements',
  timestamps: false,
  indexes: [
    { fields: ['productId'] },
    { fields: ['userId'] },
    { fields: ['companyId'] },
    { fields: ['type'] },
    { fields: ['date'] }
  ]
});

export default StockMovement;