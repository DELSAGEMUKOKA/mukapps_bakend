// scripts/checkProductController.js
import * as productController from '../src/controllers/productController.js';

console.log('🔍 VÉRIFICATION DU PRODUCT CONTROLLER\n');

const functions = [
  'index', 'search', 'getByBarcode', 'getByCategory', 
  'getLowStock', 'getOutOfStock', 'show', 'getHistory',
  'create', 'bulkCreate', 'update', 'updatePrice', 
  'updateStock', 'destroy', 'bulkDelete'
];

let allGood = true;

functions.forEach(fn => {
  if (typeof productController[fn] === 'function') {
    console.log(`✅ ${fn} existe`);
  } else {
    console.log(`❌ ${fn} n'existe PAS ou n'est pas une fonction`);
    allGood = false;
  }
});

if (!allGood) {
  console.log('\n⚠️  Des fonctions manquent dans productController.js');
}