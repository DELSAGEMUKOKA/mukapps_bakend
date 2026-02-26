// src/models/Product.js
import { DataTypes,Op } from 'sequelize';
import sequelize from '../config/database.js';

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.STRING(255),
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  barcode: {
    type: DataTypes.STRING(100),
    allowNull: true,
    // ✅ AJOUT: Validation personnalisée
    validate: {
      async isUniqueForCompany(value) {
        if (!value) return; // Ignorer si pas de barcode
        
        const product = await Product.findOne({
          where: {
            barcode: value,
            companyId: this.companyId,
            id: { [Op.ne]: this.id } // Exclure le produit actuel
          }
        });
        
        if (product) {
          throw new Error('Barcode already exists for this company');
        }
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  categoryId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  costPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  minStockLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  },
  unit: {
    type: DataTypes.STRING(50),
    defaultValue: 'piece'
  },
  companyId: {
    type: DataTypes.STRING(255),
    allowNull: false,
    references: {
      model: 'companies',
      key: 'id'
    }
  },
  currentStock: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  trackStock: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  _export_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'products',
  timestamps: false,
  indexes: [
    { fields: ['companyId'] },
    { fields: ['categoryId'] },
    { fields: ['barcode'] },
    // ✅ AJOUT: Index unique pour (barcode, companyId)
    { 
      fields: ['barcode', 'companyId'], 
      unique: true, 
      name: 'unique_barcode_per_company',
      where: { 
        barcode: { [Op.ne]: null } // Ne pas appliquer aux NULL
      }
    }
  ]
});

export default Product;