// scripts/checkAssociations.js
import { Product, Category } from '../src/models/index.js';
import sequelize from '../src/config/database.js';

async function checkAssociations() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion DB OK\n');

    // Voir les associations de Product
    console.log('🔍 Associations de Product:');
    const productAssociations = Product.associations;
    Object.keys(productAssociations).forEach(key => {
      console.log(`   - ${key}: ${productAssociations[key].associationType} vers ${productAssociations[key].target.name}`);
    });

    console.log('\n🔍 Associations de Category:');
    const categoryAssociations = Category.associations;
    Object.keys(categoryAssociations).forEach(key => {
      console.log(`   - ${key}: ${categoryAssociations[key].associationType} vers ${categoryAssociations[key].target.name}`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await sequelize.close();
  }
}

checkAssociations();