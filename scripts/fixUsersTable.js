import sequelize from '../src/config/database.js';
import { QueryTypes } from 'sequelize';

async function fixUsersTable() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion DB OK\n');

    // 1. Sauvegarder les données existantes
    console.log('💾 Sauvegarde des données utilisateurs...');
    const users = await sequelize.query(
      "SELECT * FROM users",
      { type: QueryTypes.SELECT }
    );
    console.log(`   ✅ ${users.length} utilisateurs sauvegardés\n`);

    // 2. Sauvegarder les entreprises
    const companies = await sequelize.query(
      "SELECT * FROM companies",
      { type: QueryTypes.SELECT }
    );
    console.log(`   ✅ ${companies.length} entreprises sauvegardées\n`);

    // 3. Vérifier que les companyId existent
    console.log('🔍 Vérification des companyId...');
    const usersWithoutCompany = users.filter(u => !u.companyId);
    console.log(`   ⚠️  ${usersWithoutCompany.length} utilisateurs sans companyId\n`);

    // 4. Créer une table temporaire
    console.log('🔄 Création d\'une table temporaire...');
    await sequelize.query(`
      CREATE TABLE users_new (
        id VARCHAR(255) PRIMARY KEY,
        name TEXT,
        email TEXT,
        password VARCHAR(255),
        role TEXT,
        company_id VARCHAR(255),
        isActive TEXT,
        permissions TEXT,
        department TEXT,
        createdAt TEXT,
        lockedUntil TEXT,
        loginAttempts TEXT,
        lastLogin TEXT,
        avatar TEXT,
        isGoogleUser TEXT,
        phone TEXT,
        updatedAt TEXT,
        adminLevel TEXT,
        isAdmin TEXT,
        adminPermissions TEXT,
        _export_date TIMESTAMP
      ) ENGINE=InnoDB
    `);
    console.log('   ✅ Table temporaire créée\n');

    // 5. Copier les données avec conversion
    console.log('📋 Copie des données...');
    for (const user of users) {
      // S'assurer que company_id existe
      const companyId = user.companyId || (companies[0] ? companies[0].id : null);
      
      await sequelize.query(`
        INSERT INTO users_new (
          id, name, email, password, role, company_id,
          isActive, permissions, department, createdAt,
          lockedUntil, loginAttempts, lastLogin, avatar,
          isGoogleUser, phone, updatedAt, adminLevel,
          isAdmin, adminPermissions, _export_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, {
        replacements: [
          user.id, user.name, user.email, user.password, user.role, companyId,
          user.isActive, user.permissions, user.department, user.createdAt,
          user.lockedUntil, user.loginAttempts, user.lastLogin, user.avatar,
          user.isGoogleUser, user.phone, user.updatedAt, user.adminLevel,
          user.isAdmin, user.adminPermissions, user._export_date
        ],
        type: QueryTypes.INSERT
      });
    }
    console.log('   ✅ Données copiées\n');

    // 6. Remplacer l'ancienne table
    console.log('🔄 Remplacement de l\'ancienne table...');
    await sequelize.query("DROP TABLE users");
    await sequelize.query("RENAME TABLE users_new TO users");
    console.log('   ✅ Table remplacée\n');

    // 7. Ajouter les contraintes de clé étrangère
    console.log('🔗 Ajout des contraintes...');
    await sequelize.query(`
      ALTER TABLE users 
      ADD CONSTRAINT fk_users_company 
      FOREIGN KEY (company_id) 
      REFERENCES companies(id) 
      ON DELETE CASCADE ON UPDATE CASCADE
    `);
    console.log('   ✅ Contrainte ajoutée\n');

    // 8. Ajouter les index
    console.log('📊 Ajout des index...');
    await sequelize.query("CREATE INDEX idx_users_email ON users(email(100))");
    await sequelize.query("CREATE INDEX idx_users_company ON users(company_id(100))");
    await sequelize.query("CREATE INDEX idx_users_role ON users(role(50))");
    console.log('   ✅ Index ajoutés\n');

    // 9. Vérification finale
    console.log('✅ Vérification finale...');
    const [finalUsers] = await sequelize.query(`
      SELECT u.id, u.name, u.email, u.company_id, c.name as company_name 
      FROM users u 
      LEFT JOIN companies c ON u.company_id = c.id 
      LIMIT 5
    `);
    
    console.log('\n📊 Échantillon des données corrigées:');
    finalUsers.forEach(u => {
      console.log(`   - ${u.name}: company_id=${u.company_id} (${u.company_name || 'N/A'})`);
    });

    console.log('\n🎉 CORRECTION TERMINÉE AVEC SUCCÈS !');
    console.log(`   ✅ ${users.length} utilisateurs préservés`);
    console.log(`   ✅ ${companies.length} entreprises préservées`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await sequelize.close();
  }
}

fixUsersTable();