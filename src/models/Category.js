import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.STRING(255),
    primaryKey: true,
    allowNull: false
  },

  name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  color: {
    type: DataTypes.STRING(50),
    allowNull: true
  },

  companyId: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },

  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },

  _export_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }

}, {
  tableName: 'categories',
  timestamps: false,
  indexes: [
    { fields: ['companyId'] }
  ]
});

export default Category;
