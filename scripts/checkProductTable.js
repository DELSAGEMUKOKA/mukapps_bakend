// scripts/checkProductTable.js
import sequelize from '../src/config/database.js';
import { QueryTypes } from 'sequelize';

async function checkProductTable() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion DB OK\n');

    const columns = await sequelize.query(
      "DESCRIBE products",
      { type: QueryTypes.SELECT }
    );

    console.log('📊 Structure de la table products:');
    columns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type}`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await sequelize.close();
  }
}

checkProductTable();