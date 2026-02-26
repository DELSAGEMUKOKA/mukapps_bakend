// src/models/Subscription.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Subscription = sequelize.define('Subscription', {
  id: {
    type: DataTypes.STRING(255),
    primaryKey: true
  },
  companyId: {  // ✅ camelCase (correspond à la nouvelle colonne)
    type: DataTypes.STRING(255),
    allowNull: false,
    references: {
      model: 'companies',
      key: 'id'
    }
  },
  userId: {  // ✅ camelCase
    type: DataTypes.STRING(255),
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  plan: {
    type: DataTypes.ENUM('free', 'basic', 'premium', 'enterprise'),
    defaultValue: 'free',
    allowNull: false
  },
  billingCycle: {  // ✅ camelCase
    type: DataTypes.ENUM('monthly', 'yearly'),
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    allowNull: true
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD',
    allowNull: true
  },
  paymentMethod: {  // ✅ camelCase
    type: DataTypes.STRING(50),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'trial', 'expired', 'cancelled', 'pending'),
    defaultValue: 'trial',
    allowNull: false
  },
  startDate: {  // ✅ camelCase
    type: DataTypes.DATE,
    allowNull: true
  },
  endDate: {  // ✅ camelCase
    type: DataTypes.DATE,
    allowNull: true
  },
  trialEndsAt: {  // ✅ camelCase
    type: DataTypes.DATE,
    allowNull: true
  },
  isSubscribed: {  // ✅ camelCase
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  paymentHistory: {  // ✅ camelCase
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const value = this.getDataValue('paymentHistory');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('paymentHistory', JSON.stringify(value));
    }
  },
  maxicashReference: {  // ✅ camelCase
    type: DataTypes.STRING(255),
    allowNull: true
  },
  createdAt: {  // ✅ camelCase
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {  // ✅ camelCase
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  _export_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'subscriptions',
  timestamps: false,
  indexes: [
    { fields: ['companyId'] },
    { fields: ['userId'] },
    { fields: ['status'] },
    { fields: ['plan'] },
    { fields: ['endDate'] }
  ]
});

// ✅ AJOUT DES ASSOCIATIONS ICI
Subscription.associate = function(models) {
  // Une souscription appartient à une entreprise
  Subscription.belongsTo(models.Company, {
    foreignKey: 'companyId',
    as: 'company',
    onDelete: 'CASCADE'
  });

  // Une souscription appartient à un utilisateur
  Subscription.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'subscriber',
    onDelete: 'SET NULL'
  });
};

export default Subscription;