import sequelize from '../src/config/database.js';
import { QueryTypes } from 'sequelize';

async function fixDuplicateEmail() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion DB OK\n');

    // 1. Identifier le doublon
    const email = 'sitedelsage@gmail.com';
    const companyId = '5ICAkxe4uIZbOjfOzgKXCb4FSRh2';

    console.log(`📧 Traitement du doublon pour: ${email}\n`);

    // 2. Récupérer les deux utilisateurs
    const users = await sequelize.query(`
      SELECT id, name, email, company_id 
      FROM users 
      WHERE email = ? AND company_id = ?
      ORDER BY createdAt
    `, {
      replacements: [email, companyId],
      type: QueryTypes.SELECT
    });

    console.log('👥 Utilisateurs trouvés:');
    users.forEach((u, i) => {
      console.log(`   ${i+1}. ID: ${u.id}, Nom: ${u.name}`);
    });

    // 3. Proposer des solutions
    console.log('\n📋 Choisissez une option:');
    console.log('   1. Modifier l\'email du second utilisateur');
    console.log('   2. Supprimer le second utilisateur');
    console.log('   3. Ne rien faire (et supprimer l\'index unique)');

    // Par défaut, on va modifier l'email du second
    if (users.length >= 2) {
      const keepUser = users[0]; // Garder le premier
      const modifyUser = users[1]; // Modifier le second

      console.log(`\n🔄 Modification de l'email pour ${modifyUser.name}...`);
      
      const newEmail = `modified_${Date.now()}@temp.com`;
      
      await sequelize.query(`
        UPDATE users 
        SET email = ? 
        WHERE id = ?
      `, {
        replacements: [newEmail, modifyUser.id],
        type: QueryTypes.UPDATE
      });

      console.log(`   ✅ Email modifié: ${newEmail}`);
      
      // Vérification
      const [updatedUser] = await sequelize.query(`
        SELECT id, name, email FROM users WHERE id = ?
      `, {
        replacements: [modifyUser.id],
        type: QueryTypes.SELECT
      });
      
      console.log(`   ✅ Nouvel email: ${updatedUser.email}`);
    }

    console.log('\n✅ Correction terminée !');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await sequelize.close();
  }
}

fixDuplicateEmail();