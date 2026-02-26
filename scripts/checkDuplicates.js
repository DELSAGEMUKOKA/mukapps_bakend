// scripts/checkDuplicates.js
import sequelize from '../src/config/database.js';
import { QueryTypes } from 'sequelize';

async function checkDuplicates() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion DB OK\n');

    // Vérifier les doublons d'email par company
    console.log('🔍 Recherche des doublons (email + company_id)...');
    
    const duplicates = await sequelize.query(`
      SELECT email, company_id, COUNT(*) as count
      FROM users
      GROUP BY email, company_id
      HAVING COUNT(*) > 1
    `, { type: QueryTypes.SELECT });

    if (duplicates.length > 0) {
      console.log(`\n⚠️  ${duplicates.length} doublon(s) trouvé(s) :\n`);
      
      for (const dup of duplicates) {
        console.log(`📧 Email: ${dup.email}`);
        console.log(`🏢 Company ID: ${dup.company_id}`);
        console.log(`🔢 Nombre: ${dup.count}`);
        
        // Afficher les utilisateurs concernés
        const users = await sequelize.query(`
          SELECT id, name, email, company_id
          FROM users
          WHERE email = ? AND company_id = ?
        `, {
          replacements: [dup.email, dup.company_id],
          type: QueryTypes.SELECT
        });
        
        users.forEach((user, index) => {
          console.log(`   ${index + 1}. ID: ${user.id}, Nom: ${user.name}`);
        });
        console.log('');
      }
    } else {
      console.log('✅ Aucun doublon trouvé !');
    }

    // Vérifier aussi les emails NULL ou vides
    const nullEmails = await sequelize.query(`
      SELECT COUNT(*) as count FROM users WHERE email IS NULL OR email = ''
    `, { type: QueryTypes.SELECT });
    
    if (nullEmails[0].count > 0) {
      console.log(`\n⚠️  ${nullEmails[0].count} utilisateur(s) avec email NULL ou vide`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await sequelize.close();
  }
}

checkDuplicates();