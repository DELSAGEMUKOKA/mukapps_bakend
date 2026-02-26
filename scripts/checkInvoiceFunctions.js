// scripts/checkInvoiceFunctions.js
import invoiceController from '../src/controllers/invoiceController.js';

console.log('🔍 VÉRIFICATION DES FONCTIONS DU CONTROLEUR\n');

const functions = [
  'getInvoices',
  'getInvoiceStats',
  'getCustomerInvoices',
  'getInvoiceById',
  'createInvoice',
  'updateInvoice',
  'cancelInvoice'
];

functions.forEach(fn => {
  if (typeof invoiceController[fn] === 'function') {
    console.log(`✅ ${fn} existe`);
  } else {
    console.log(`❌ ${fn} n'existe PAS`);
  }
});