// scripts/checkExpenses.js
import { Expense } from '../src/models/index.js';
import sequelize from '../src/config/database.js';

async function checkExpenses() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion DB OK\n');

    const expenses = await Expense.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']]
    });

    console.log(`📊 ${expenses.length} dépenses trouvées :\n`);
    
    expenses.forEach((exp, index) => {
      console.log(`🔹 Dépense #${index + 1}`);
      console.log(`   ID: ${exp.id}`);
      console.log(`   Titre: ${exp.title}`);
      console.log(`   Montant: ${exp.amount}`);
      console.log(`   Statut: ${exp.status}`);
      console.log('---');
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await sequelize.close();
  }
}

checkExpenses();