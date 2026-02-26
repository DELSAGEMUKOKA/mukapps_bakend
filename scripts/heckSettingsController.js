// scripts/checkSettingsController.js
import settingsController from '../src/controllers/settingsController.js';

console.log('🔍 VÉRIFICATION DU CONTROLLER SETTINGS\n');

const functions = [
  'getSettings',
  'updateSettings',
  'getCompanyInfo',
  'updateCompanyInfo',
  'getInvoiceSettings',
  'updateInvoiceSettings',
  'getNotificationSettings',
  'updateNotificationSettings',
  'resetSettings'
];

functions.forEach(fn => {
  if (typeof settingsController[fn] === 'function') {
    console.log(`✅ ${fn} existe`);
  } else {
    console.log(`❌ ${fn} n'existe PAS`);
  }
});