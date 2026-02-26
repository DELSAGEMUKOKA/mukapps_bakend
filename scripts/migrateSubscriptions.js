// scripts/migrateSubscriptions.js
import sequelize from '../src/config/database.js';
import { QueryTypes } from 'sequelize';

async function migrateSubscriptions() {
  try {
    console.log('🔄 Migration de la table subscriptions...');
    
    // Ajouter les colonnes manquantes une par une
    const migrations = [
      `ALTER TABLE subscriptions 
       ADD COLUMN IF NOT EXISTS companyId VARCHAR(255) AFTER id,
       ADD INDEX IF NOT EXISTS idx_subscriptions_company (companyId)`,
      
      `ALTER TABLE subscriptions 
       ADD COLUMN IF NOT EXISTS billingCycle ENUM('monthly', 'yearly') AFTER plan`,
      
      `ALTER TABLE subscriptions 
       ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2) DEFAULT 0 AFTER billingCycle`,
      
      `ALTER TABLE subscriptions 
       ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD' AFTER amount`,
      
      `ALTER TABLE subscriptions 
       ADD COLUMN IF NOT EXISTS paymentMethod VARCHAR(50) AFTER currency`,
      
      `ALTER TABLE subscriptions 
       ADD COLUMN IF NOT EXISTS startDate DATETIME AFTER paymentMethod`,
      
      `ALTER TABLE subscriptions 
       ADD COLUMN IF NOT EXISTS endDate DATETIME AFTER startDate`,
      
      `ALTER TABLE subscriptions 
       MODIFY COLUMN plan ENUM('free', 'basic', 'premium', 'enterprise') DEFAULT 'free'`
    ];
    
    for (const sql of migrations) {
      try {
        await sequelize.query(sql);
        console.log(`✅ Exécuté: ${sql.substring(0, 60)}...`);
      } catch (err) {
        console.log(`⚠️  Erreur (peut-être déjà existant): ${err.message}`);
      }
    }
    
    // Mettre à jour les données existantes
    await sequelize.query(`
      UPDATE subscriptions s
      LEFT JOIN users u ON s.userId = u.id
      SET s.companyId = u.company_id
      WHERE s.companyId IS NULL AND u.id IS NOT NULL
    `);
    
    console.log('✅ Migration terminée !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await sequelize.close();
  }
}

migrateSubscriptions();