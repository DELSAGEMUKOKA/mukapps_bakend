// scripts/checkModels.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Liste des modèles à vérifier avec leurs clés étrangères potentielles
const modelsToCheck = [
  {
    name: 'Company.js',
    foreignKeys: []
  },
  {
    name: 'User.js',
    foreignKeys: ['company_id']
  },
  {
    name: 'Category.js',
    foreignKeys: ['companyId']
  },
  {
    name: 'Product.js',
    foreignKeys: ['categoryId', 'companyId']
  },
  {
    name: 'Customer.js',
    foreignKeys: ['companyId']
  },
  {
    name: 'Invoice.js',
    foreignKeys: ['customerId', 'userId', 'companyId']
  },
  {
    name: 'Expense.js',
    foreignKeys: ['companyId', 'userId', 'approvedBy']
  },
  {
    name: 'StockMovement.js',
    foreignKeys: ['productId', 'userId', 'companyId']
  },
  {
    name: 'Role.js',
    foreignKeys: ['companyId']
  },
  {
    name: 'Setting.js',
    foreignKeys: ['companyId']
  },
  {
    name: 'AdminAction.js',
    foreignKeys: ['adminId', 'targetUserId']
  },
  {
    name: 'LoginAttempt.js',
    foreignKeys: ['userId']
  },
  {
    name: 'UserPin.js',
    foreignKeys: ['userId', 'companyId']
  },
  {
    name: 'Subscription.js',
    foreignKeys: ['userId']
  }
];

// Fonction pour vérifier un fichier modèle
function checkModelFile(modelPath, modelInfo) {
  console.log(`\n📄 Vérification de ${modelInfo.name}:`);
  
  if (!fs.existsSync(modelPath)) {
    console.log(`  ❌ Fichier non trouvé: ${modelPath}`);
    return;
  }

  const content = fs.readFileSync(modelPath, 'utf8');
  let hasError = false;

  // Vérifier chaque clé étrangère potentielle
  modelInfo.foreignKeys.forEach(fk => {
    // Chercher la définition du champ
    const fieldRegex = new RegExp(`${fk}:\\s*{[^}]*type:\\s*DataTypes\\.(\\w+)[^}]*}`, 's');
    const match = content.match(fieldRegex);
    
    if (match) {
      const type = match[1];
      const hasReference = content.includes(`references:`) && 
                          content.slice(content.indexOf(fk)).includes(`model:`);
      
      console.log(`  ${fk}:`);
      console.log(`    Type: ${type}`);
      console.log(`    Référence: ${hasReference ? '✅ Oui' : '❌ Non'}`);
      
      if (type !== 'STRING' && type !== 'STRING(255)') {
        console.log(`    ⚠️  Attention: ${fk} est en ${type} mais devrait être STRING(255) pour une clé étrangère`);
        hasError = true;
      }
      
      if (hasReference && type !== 'STRING' && type !== 'STRING(255)') {
        console.log(`    ❌ ERREUR: ${fk} est une clé étrangère en ${type} au lieu de STRING(255)`);
        hasError = true;
      }
    } else {
      console.log(`  ${fk}: ⚠️  Non trouvé dans le modèle`);
    }
  });

  if (modelInfo.foreignKeys.length === 0) {
    console.log('  ✅ Aucune clé étrangère à vérifier');
  } else if (!hasError) {
    console.log('  ✅ Toutes les clés étrangères sont correctes');
  }

  return !hasError;
}

// Fonction principale
async function main() {
  console.log('='.repeat(60));
  console.log('🔍 VÉRIFICATION DES MODÈLES POUR LES CLÉS ÉTRANGÈRES');
  console.log('='.repeat(60));
  console.log('\n📋 RÈGLE: Toutes les clés étrangères doivent être STRING(255)\n');

  const modelsDir = path.join(__dirname, '../src/models');
  let allGood = true;

  for (const model of modelsToCheck) {
    const modelPath = path.join(modelsDir, model.name);
    const result = checkModelFile(modelPath, model);
    if (!result) allGood = false;
  }

  console.log('\n' + '='.repeat(60));
  if (allGood) {
    console.log('✅ TOUS LES MODÈLES SONT CORRECTS !');
    console.log('🎉 Vous pouvez lancer votre application avec npm run dev');
  } else {
    console.log('⚠️  DES ERREURS ONT ÉTÉ TROUVÉES');
    console.log('📝 Corrigez les modèles indiqués ci-dessus');
  }
  console.log('='.repeat(60));
}

// Exécuter
main().catch(console.error);