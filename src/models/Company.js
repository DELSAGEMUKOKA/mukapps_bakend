import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Company = sequelize.define('Company', {
  id: {
    type: DataTypes.STRING(255),
    primaryKey: true
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  data: {
    type: DataTypes.TEXT,
    allowNull: true
  },
    email: {                    // ← AJOUTEZ CE CHAMP
    type: DataTypes.TEXT,
    allowNull: true
  },
  ownerId: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  _export_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'companies',
  timestamps: false,
  indexes: [
    { fields: ['ownerId'] }
  ]
});

export default Company;
