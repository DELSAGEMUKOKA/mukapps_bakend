// src/models/Invoice.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.STRING(255),
    primaryKey: true
  },
  invoiceNumber: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  customerId: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  customerName: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  items: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  subtotal: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tax: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  discount: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  discountPercentage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  total: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  paymentMethod: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  deliveryAddress: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  date: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  userId: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  companyId: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  companyInfo: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  paymentDate: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  _export_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'invoices',
  timestamps: false,  // ← IMPORTANT: Ceci désactive createdAt et updatedAt automatiques
  indexes: [
    { fields: ['companyId'] },
    { fields: ['customerId'] },
    { fields: ['userId'] },
    { fields: ['invoiceNumber'] }
  ]
});

export default Invoice;