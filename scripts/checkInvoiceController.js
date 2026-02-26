// scripts/checkInvoiceController.js
import * as invoiceController from '../src/controllers/invoiceController.js';

console.log('🔍 VÉRIFICATION DU INVOICE CONTROLLER\n');

const functions = [
  'createInvoice', 'getInvoices', 'getInvoiceById', 
  'updateInvoice', 'cancelInvoice', 'getInvoiceStats', 
  'getCustomerInvoices'
];

functions.forEach(fn => {
  if (typeof invoiceController[fn] === 'function') {
    console.log(`✅ ${fn} existe`);
  } else {
    console.log(`❌ ${fn} n'existe PAS`);
  }
});