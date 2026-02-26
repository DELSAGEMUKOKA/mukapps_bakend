import { DataTypes, Op } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.STRING(255),
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'supervisor', 'operator', 'cashier'),
    defaultValue: 'cashier',
    allowNull: false
  },
  companyId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    references: {
      model: 'companies',
      key: 'id'
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  failed_login_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  locked_until: {
    type: DataTypes.DATE,
    allowNull: true
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  },
  email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  email_verification_token: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  // ✅ NOUVEAU: Token de réinitialisation du mot de passe
  password_reset_token: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  // ✅ NOUVEAU: Date d'expiration du token de réinitialisation
  password_reset_expires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // ✅ NOUVEAU: Date du dernier changement de mot de passe
  last_password_change: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // ✅ NOUVEAU: Historique des mots de passe (pour éviter la réutilisation)
  password_history: {
    type: DataTypes.TEXT, // Stocké en JSON
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('password_history');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('password_history', JSON.stringify(value));
    }
  },
  // ✅ NOUVEAU: Token de rafraîchissement JWT
  refresh_token: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  // ✅ NOUVEAU: Date d'expiration du token de rafraîchissement
  refresh_token_expires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // ✅ NOUVEAU: 2FA (Authentification à deux facteurs)
  two_factor_secret: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  two_factor_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // ✅ NOUVEAU: Backup codes pour 2FA
  two_factor_backup_codes: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('two_factor_backup_codes');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('two_factor_backup_codes', JSON.stringify(value));
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
  tableName: 'users',
  timestamps: false,
  indexes: [
    { fields: ['email'] },
    { fields: ['companyId'] },
    { fields: ['role'] },
    { fields: ['email', 'companyId'], unique: true, name: 'unique_email_per_company' },
    { fields: ['password_reset_token'] },
    { fields: ['refresh_token'] }
  ],
  
  // Hooks pour automatiser certaines tâches
  hooks: {
    beforeCreate: async (user) => {
      // Initialiser l'historique des mots de passe
      if (user.password) {
        user.password_history = [user.password];
      }
    },
    beforeUpdate: async (user) => {
      // Si le mot de passe change, mettre à jour l'historique
      if (user.changed('password')) {
        const history = user.password_history || [];
        const newHistory = [user.password, ...history].slice(0, 5); // Garder les 5 derniers
        user.password_history = newHistory;
        user.last_password_change = new Date();
      }
    }
  }
});

export default User;