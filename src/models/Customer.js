import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.STRING(255),
    primaryKey: true
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  email: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  phone: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  taxId: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  creditLimit: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  discountPercentage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isVip: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  companyId: {
    // ✅ CORRECTION: Changer TEXT en STRING(255) pour correspondre à companies.id
    type: DataTypes.STRING(255),  // ← MODIFICATION IMPORTANTE
    allowNull: true,
    references: {
      model: 'companies',
      key: 'id'
    }
  },
  totalPurchases: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  totalSpent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  loyaltyPoints: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  updatedAt: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  lastPurchaseDate: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  _export_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'customers',
  timestamps: false,
  indexes: [
    { fields: ['companyId'] },
    { fields: ['email'] }
  ]
});

export default Customer;