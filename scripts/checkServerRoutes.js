// scripts/checkServerRoutes.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverPath = path.join(__dirname, '../src/server.js');

console.log('🔍 VÉRIFICATION DU FICHIER SERVER.JS\n');
console.log(`📁 Chemin: ${serverPath}\n`);

if (fs.existsSync(serverPath)) {
  const content = fs.readFileSync(serverPath, 'utf8');
  
  // Vérifier l'import de settingsRoutes
  if (content.includes("import settingsRoutes from './routes/settings.js'")) {
    console.log('✅ Import de settingsRoutes trouvé');
  } else {
    console.log('❌ Import de settingsRoutes manquant');
  }
  
  // Vérifier l'utilisation de settingsRoutes
  if (content.includes("app.use('/api/v1/settings', settingsRoutes)")) {
    console.log('✅ Montage de la route /settings trouvé');
  } else {
    console.log('❌ Montage de la route /settings manquant');
  }
  
  // Compter le nombre de routes montées
  const routeLines = content.match(/app\.use\('\/api\/v1\/[^']+', [^)]+\)/g);
  console.log(`\n📊 Routes montées dans server.js :`);
  routeLines.forEach(route => {
    console.log(`   ${route}`);
  });
  
} else {
  console.log('❌ Fichier server.js non trouvé');
}