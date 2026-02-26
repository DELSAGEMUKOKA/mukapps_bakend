// scripts/checkProduct.js
import { Product } from '../src/models/index.js';

async function checkProduct() {
  const products = await Product.findAll({ limit: 5 });
  console.log('Produits trouvés:', products.map(p => ({
    id: p.id,
    name: p.name,
    currentStock: p.currentStock
  })));
}

checkProduct();