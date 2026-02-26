// src/models/Expense.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.STRING(255),
    primaryKey: true
  },
  status: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  amount: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  companyId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    references: {
      model: 'companies',
      key: 'id'
    },
    field: 'companyId'  // ✅ AJOUTÉ pour éviter les confusions
  },
  updatedAt: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  userId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'userId'  // ✅ AJOUTÉ
  },
  paymentMethod: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  date: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  receiptUrl: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  approvedBy: {
    type: DataTypes.STRING(255),
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'approvedBy'  // ✅ AJOUTÉ
  },
  approvedAt: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  _export_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'expenses',
  timestamps: false,
  indexes: [
    { fields: ['companyId'] },
    { fields: ['userId'] },
    { fields: ['approvedBy'] },
    { fields: ['status'] },
    { fields: ['category'] },
    { fields: ['date'] }
  ]
});

export default Expense;