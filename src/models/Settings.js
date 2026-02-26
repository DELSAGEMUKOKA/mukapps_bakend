// src/models/Setting.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Setting = sequelize.define('Setting', {
  id: {
    type: DataTypes.STRING(255),
    primaryKey: true
  },
  currency: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  dateFormat: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  invoicePrefix: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  companyId: {
    // Clé étrangère vers companies
    type: DataTypes.STRING(255),  // STRING(255) pour la clé étrangère
    allowNull: true,
    references: {
      model: 'companies',
      key: 'id'
    }
  },
  country: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  website: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  city: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  postalCode: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  impotNumber: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  phone: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  invoiceFooter: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  slogan: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  email: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  companyName: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rccm: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  idNat: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  updatedAt: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  taxId: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  _export_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'settings',
  timestamps: false,
  indexes: [
    { fields: ['companyId'] }
  ]
});

export default Setting;