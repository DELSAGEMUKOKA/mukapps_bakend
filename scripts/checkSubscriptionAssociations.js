// scripts/checkSubscriptionAssociations.js
import { Subscription } from '../src/models/index.js';
import sequelize from '../src/config/database.js';

async function checkAssociations() {
  console.log('🔍 VÉRIFICATION DES ASSOCIATIONS\n');
  
  // Voir les associations de Subscription
  console.log('Associations de Subscription:');
  const associations = Subscription.associations;
  Object.keys(associations).forEach(key => {
    console.log(`  - ${key}: ${associations[key].associationType}`);
    console.log(`    foreignKey: ${associations[key].foreignKey}`);
  });

  // Voir la définition de la table
  const tableDefinition = await sequelize.query(
    "DESCRIBE subscriptions",
    { type: sequelize.QueryTypes.SELECT }
  );
  
  console.log('\nColonnes dans la table:');
  tableDefinition.forEach(col => {
    console.log(`  - ${col.Field}: ${col.Type}`);
  });
}

checkAssociations();