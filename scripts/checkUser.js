import sequelize from '../src/config/database.js';
import { User } from '../src/models/index.js';

async function checkUsers() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion DB OK');
    
    const users = await User.findAll();
    console.log(`📊 ${users.length} utilisateur(s) trouvé(s) :`);
    
    users.forEach(user => {
      console.log(`  - ID: "${user.id}"`);
      console.log(`    Email: ${user.email}`);
      console.log(`    Actif: ${user.is_active}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await sequelize.close();
  }
}

checkUsers();