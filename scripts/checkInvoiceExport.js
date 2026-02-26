// scripts/checkInvoiceExport.js
import * as invoiceController from '../src/controllers/invoiceController.js';
import invoiceControllerDefault from '../src/controllers/invoiceController.js';

console.log('🔍 VÉRIFICATION DES EXPORTS\n');

console.log('Export par défaut:', typeof invoiceControllerDefault);
console.log('Export nommé getInvoices:', typeof invoiceController.getInvoices);
console.log('Export nommé createInvoice:', typeof invoiceController.createInvoice);
console.log('Export nommé cancelInvoice:', typeof invoiceController.cancelInvoice);