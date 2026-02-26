import sequelize from '../src/config/database.js';
import { QueryTypes } from 'sequelize';

async function convertAllTables() {
  try {
    console.log('🔄 Connexion à la base de données...');
    await sequelize.authenticate();
    console.log('✅ Connexion réussie\n');

    // Récupérer toutes les tables
    const results = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = :dbName",
      {
        replacements: { dbName: process.env.DB_NAME || 'inventory_db' },
        type: QueryTypes.SELECT
      }
    );

    // ✅ CORRECTION: results est déjà un tableau, pas besoin de [results]
    console.log('📊 Résultats bruts:', results);
    
    const tableList = results.map(row => row.table_name || row.TABLE_NAME);
    console.log(`📊 Tables trouvées : ${tableList.length}\n`);

    if (tableList.length === 0) {
      console.log('⚠️ Aucune table trouvée dans la base de données');
      return;
    }

    let converted = 0;
    let failed = 0;

    for (const table of tableList) {
      try {
        process.stdout.write(`  🔄 Conversion de ${table}... `);
        await sequelize.query(`ALTER TABLE ${table} ENGINE = InnoDB`);
        console.log(`✅`);
        converted++;
      } catch (error) {
        console.log(`❌ (${error.message})`);
        failed++;
      }
    }

    console.log(`\n📈 Résultats :`);
    console.log(`  ✅ Converties : ${converted}`);
    console.log(`  ❌ Échecs : ${failed}`);
    
    if (failed === 0) {
      console.log('\n🎉 Toutes les tables ont été converties avec succès !');
    } else {
      console.log('\n⚠️  Certaines tables n\'ont pas pu être converties.');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// Exécuter
convertAllTables();