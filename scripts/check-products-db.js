// check-products-db.js
import sequelize from './src/config/database.js';

async function checkProducts() {
  try {
    const [results] = await sequelize.query('SELECT COUNT(*) as total FROM Products');
    console.log(`Nombre de produits en base : ${results[0].total}`);
    
    // Voir les 5 premiers
    const [products] = await sequelize.query('SELECT id, name,companyId, price FROM Products LIMIT 5');
    console.table(products);
  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkProducts();