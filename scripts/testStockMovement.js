// scripts/testStockMovement.js
import { StockMovement, Product, User } from '../src/models/index.js';
import sequelize from '../src/config/database.js';

async function testStockMovement() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion DB OK\n');

    // 1. Récupérer un produit valide
    const product = await Product.findOne();
    
    if (!product) {
      console.log('❌ Aucun produit trouvé dans la base');
      return;
    }

    console.log('📦 Produit trouvé:');
    console.log(`   ID: ${product.id}`);
    console.log(`   Nom: ${product.name}`);
    console.log(`   Stock actuel: ${product.currentStock}`);

    // 2. Simuler la création d'un mouvement
    console.log('\n🔄 Test de création de mouvement...');
    
    // Utiliser directement l'ID du produit
    const productId = product.id;
    
    if (!productId) {
      console.log('❌ productId est undefined');
      return;
    }

    console.log(`   productId: ${productId}`);

    // 3. Vérifier que le produit existe
    const foundProduct = await Product.findOne({
      where: { id: productId }
    });

    if (foundProduct) {
      console.log('✅ Produit trouvé avec findOne');
    } else {
      console.log('❌ Produit NON trouvé avec findOne');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await sequelize.close();
  }
}

testStockMovement();