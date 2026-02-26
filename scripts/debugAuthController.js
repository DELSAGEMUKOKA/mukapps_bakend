// scripts/debugAuthController.js
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 VÉRIFICATION DU FICHIER AUTH CONTROLLER\n');

// Vérifier le chemin du fichier
const filePath = path.join(__dirname, '../src/controllers/authController.js');
console.log(`📁 Chemin du fichier: ${filePath}`);

if (fs.existsSync(filePath)) {
  console.log('✅ Le fichier existe');
  
  // Lire le contenu
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Vérifier l'export
  if (content.includes('export default authController')) {
    console.log('✅ Export default trouvé');
  } else {
    console.log('❌ Export default manquant');
  }
  
  // Vérifier quelques fonctions
  const functions = ['register', 'login', 'changePassword'];
  functions.forEach(fn => {
    if (content.includes(`async ${fn}`) || content.includes(`${fn}: async`)) {
      console.log(`✅ Fonction ${fn} trouvée`);
    } else {
      console.log(`❌ Fonction ${fn} NON trouvée`);
    }
  });
  
} else {
  console.log('❌ Le fichier N\'existe PAS');
  console.log('👉 Créez le fichier à cet emplacement');
}