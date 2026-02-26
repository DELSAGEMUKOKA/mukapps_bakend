// scripts/checkAppRoutes.js
import fs from 'fs';
import path from 'path';  // ✅ Un seul import de path
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appPath = path.join(__dirname, '../src/app.js');

console.log('🔍 VÉRIFICATION DU FICHIER APP.JS\n');

if (fs.existsSync(appPath)) {
  const content = fs.readFileSync(appPath, 'utf8');
  
  // Chercher l'ordre des routes
  const lines = content.split('\n');
  let foundSettings = false;
  let found404 = false;
  let settingsLine = -1;
  let errorLine = -1;
  
  console.log('📋 Analyse de l\'ordre des routes :\n');
  
  lines.forEach((line, index) => {
    // Chercher les routes API
    if (line.includes('app.use') && line.includes('/api/v1')) {
      console.log(`Ligne ${index + 1}: ${line.trim()}`);
      if (line.includes('settings')) {
        foundSettings = true;
        settingsLine = index + 1;
      }
    }
    // Chercher la route 404
    if (line.includes('app.use(*)') || line.includes('app.use("*")') || line.includes('app.use(\'*\')')) {
      console.log(`\n⚠️  Route 404 trouvée à la ligne ${index + 1}: ${line.trim()}`);
      found404 = true;
      errorLine = index + 1;
    }
  });
  
  console.log('\n' + '='.repeat(50));
  
  if (foundSettings) {
    console.log(`✅ Route settings trouvée à la ligne ${settingsLine}`);
  } else {
    console.log('❌ Route settings NON trouvée dans app.js');
  }
  
  if (found404) {
    if (settingsLine < errorLine) {
      console.log('✅ Route settings est AVANT la route 404 (correct)');
    } else {
      console.log('❌ Route settings est APRÈS la route 404 (incorrect)');
    }
  }
  
  console.log('='.repeat(50));
  
} else {
  console.log('❌ Fichier app.js non trouvé à:', appPath);
}