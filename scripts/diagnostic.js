// scripts/diagnostic.js
import sequelize from '../src/config/database.js';
import { QueryTypes } from 'sequelize';

async function diagnostic() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion DB OK\n');

    // Vérifier les tables
    const tables = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = :dbName",
      { 
        replacements: { dbName: process.env.DB_NAME || 'inventory_db' },
        type: QueryTypes.SELECT
      }
    );

    console.log('📊 Tables existantes:');
    tables.forEach(t => console.log(`   - ${t.table_name}`));

    // Vérifier la structure de companies
    console.log('\n🏢 Structure de companies:');
    const companiesCols = await sequelize.query(
      "DESCRIBE companies",
      { type: QueryTypes.SELECT }
    );
    companiesCols.forEach(c => console.log(`   - ${c.Field}: ${c.Type}`));

    // Vérifier la structure de users
    console.log('\n👤 Structure de users:');
    const usersCols = await sequelize.query(
      "DESCRIBE users",
      { type: QueryTypes.SELECT }
    );
    usersCols.forEach(c => console.log(`   - ${c.Field}: ${c.Type}`));

    // Compter les enregistrements
    const [companyCount] = await sequelize.query(
      "SELECT COUNT(*) as count FROM companies",
      { type: QueryTypes.SELECT }
    );
    console.log(`\n📈 Nombre d'entreprises: ${companyCount.count}`);

    const [userCount] = await sequelize.query(
      "SELECT COUNT(*) as count FROM users",
      { type: QueryTypes.SELECT }
    );
    console.log(`📈 Nombre d'utilisateurs: ${userCount.count}`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await sequelize.close();
  }
}

diagnostic();