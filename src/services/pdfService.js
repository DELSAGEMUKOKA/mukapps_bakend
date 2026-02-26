import logger from '../utils/logger.js';
import { Invoice, Company, Customer } from '../models/index.js';
import { NotFoundError } from '../utils/helpers.js';
import { formatDate, formatCurrency } from '../utils/dateUtils.js';

class PDFService {
  generateInvoiceHTML(invoice, company, customer, items) {
    const invoiceDate = formatDate(invoice.date || invoice.created_at);
    const dueDate = invoice.due_date ? formatDate(invoice.due_date) : 'N/A';
    const subtotal = parseFloat(invoice.subtotal || 0);
    const tax = parseFloat(invoice.tax || 0);
    const discount = parseFloat(invoice.discount || 0);
    const total = parseFloat(invoice.total || 0);

    const itemsHTML = items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.description || item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${formatCurrency(item.unit_price)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${formatCurrency(item.total || (item.quantity * item.unit_price))}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
            .invoice-container { max-width: 800px; margin: 0 auto; border: 1px solid #ddd; }
            .header { background-color: #2c3e50; color: white; padding: 30px; }
            .header h1 { margin-bottom: 10px; }
            .invoice-details { display: flex; justify-content: space-between; padding: 30px; }
            .section { flex: 1; }
            .section h3 { color: #2c3e50; margin-bottom: 10px; border-bottom: 2px solid #3498db; padding-bottom: 5px; }
            .section p { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background-color: #34495e; color: white; padding: 12px; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #ddd; }
            .totals { background-color: #ecf0f1; padding: 20px; margin-top: 20px; }
            .totals table { margin: 0; }
            .totals td { border: none; padding: 8px; }
            .total-row { font-weight: bold; font-size: 18px; color: #2c3e50; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #7f8c8d; font-size: 12px; }
            .status { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; }
            .status-paid { background-color: #2ecc71; color: white; }
            .status-pending { background-color: #f39c12; color: white; }
            .status-overdue { background-color: #e74c3c; color: white; }
            .status-cancelled { background-color: #95a5a6; color: white; }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <h1>${company.name}</h1>
              <p>${company.email}</p>
              ${company.phone ? `<p>${company.phone}</p>` : ''}
              ${company.address ? `<p>${company.address}</p>` : ''}
            </div>

            <div class="invoice-details">
              <div class="section">
                <h3>INVOICE TO</h3>
                <p><strong>${customer.name}</strong></p>
                <p>${customer.email}</p>
                ${customer.phone ? `<p>${customer.phone}</p>` : ''}
                ${customer.address ? `<p>${customer.address}</p>` : ''}
              </div>

              <div class="section" style="text-align: right;">
                <h3>INVOICE DETAILS</h3>
                <p><strong>Invoice #:</strong> ${invoice.invoice_number}</p>
                <p><strong>Date:</strong> ${invoiceDate}</p>
                <p><strong>Due Date:</strong> ${dueDate}</p>
                <p>
                  <span class="status status-${invoice.payment_status}">
                    ${invoice.payment_status.toUpperCase()}
                  </span>
                </p>
              </div>
            </div>

            <div style="padding: 0 30px;">
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: right;">Unit Price</th>
                    <th style="text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                </tbody>
              </table>

              <div class="totals">
                <table>
                  <tr>
                    <td style="text-align: right;">Subtotal:</td>
                    <td style="text-align: right; width: 150px;">${formatCurrency(subtotal)}</td>
                  </tr>
                  ${discount > 0 ? `
                    <tr>
                      <td style="text-align: right;">Discount:</td>
                      <td style="text-align: right;">-${formatCurrency(discount)}</td>
                    </tr>
                  ` : ''}
                  ${tax > 0 ? `
                    <tr>
                      <td style="text-align: right;">Tax:</td>
                      <td style="text-align: right;">${formatCurrency(tax)}</td>
                    </tr>
                  ` : ''}
                  <tr class="total-row">
                    <td style="text-align: right;">TOTAL:</td>
                    <td style="text-align: right;">${formatCurrency(total)}</td>
                  </tr>
                </table>
              </div>

              ${invoice.notes ? `
                <div style="margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #3498db;">
                  <strong>Notes:</strong><br>
                  ${invoice.notes}
                </div>
              ` : ''}
            </div>

            <div class="footer">
              <p>Thank you for your business!</p>
              <p>This is a computer-generated invoice</p>
              ${invoice.payment_method ? `<p>Payment Method: ${invoice.payment_method}</p>` : ''}
            </div>
          </div>
        </body>
      </html>
    `;
  }

  async generateInvoicePDF(invoiceId, companyId) {
    try {
      const invoice = await Invoice.findById(invoiceId, companyId);

      if (!invoice) {
        throw new NotFoundError('Invoice not found');
      }

      const company = await Company.findById(invoice.company_id);
      const customer = await Customer.findById(invoice.customer_id, companyId);

      const items = invoice.items || [];

      const html = this.generateInvoiceHTML(invoice, company, customer, items);

      logger.info('Invoice PDF generated', {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoice_number,
        companyId
      });

      return {
        success: true,
        html,
        filename: `invoice-${invoice.invoice_number}.pdf`,
        invoiceNumber: invoice.invoice_number
      };
    } catch (error) {
      logger.error('Failed to generate invoice PDF', {
        error: error.message,
        invoiceId,
        companyId
      });
      throw error;
    }
  }

  generateReportHTML(title, data, reportType) {
    let content = '';

    if (reportType === 'sales') {
      content = `
        <div style="padding: 30px;">
          <h2 style="color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px;">Sales Summary</h2>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 30px 0;">
            <div style="background-color: #3498db; color: white; padding: 20px; border-radius: 8px;">
              <h3 style="margin-bottom: 10px;">Total Sales</h3>
              <p style="font-size: 32px; font-weight: bold;">${formatCurrency(data.totalSales || 0)}</p>
            </div>
            <div style="background-color: #2ecc71; color: white; padding: 20px; border-radius: 8px;">
              <h3 style="margin-bottom: 10px;">Total Orders</h3>
              <p style="font-size: 32px; font-weight: bold;">${data.count || 0}</p>
            </div>
            <div style="background-color: #9b59b6; color: white; padding: 20px; border-radius: 8px;">
              <h3 style="margin-bottom: 10px;">Average Order</h3>
              <p style="font-size: 32px; font-weight: bold;">${formatCurrency(data.averageOrder || 0)}</p>
            </div>
          </div>
        </div>
      `;
    } else if (reportType === 'inventory') {
      content = `
        <div style="padding: 30px;">
          <h2 style="color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px;">Inventory Summary</h2>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 30px 0;">
            <div style="background-color: #3498db; color: white; padding: 20px; border-radius: 8px;">
              <h3 style="margin-bottom: 10px;">Total Products</h3>
              <p style="font-size: 32px; font-weight: bold;">${data.totalProducts || 0}</p>
            </div>
            <div style="background-color: #f39c12; color: white; padding: 20px; border-radius: 8px;">
              <h3 style="margin-bottom: 10px;">Low Stock Items</h3>
              <p style="font-size: 32px; font-weight: bold;">${data.lowStockCount || 0}</p>
            </div>
            <div style="background-color: #2ecc71; color: white; padding: 20px; border-radius: 8px;">
              <h3 style="margin-bottom: 10px;">Total Value</h3>
              <p style="font-size: 32px; font-weight: bold;">${formatCurrency(data.totalValue || 0)}</p>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .report-container { max-width: 1000px; margin: 0 auto; }
            .header { background-color: #2c3e50; color: white; padding: 40px; text-align: center; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #7f8c8d; font-size: 12px; margin-top: 40px; }
          </style>
        </head>
        <body>
          <div class="report-container">
            <div class="header">
              <h1>${title}</h1>
              <p>Generated on ${new Date().toLocaleString()}</p>
            </div>
            ${content}
            <div class="footer">
              <p>Inventory Management System - Automated Report</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  async generateReportPDF(reportData, reportType, companyId) {
    try {
      const title = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`;
      const html = this.generateReportHTML(title, reportData, reportType);

      logger.info('Report PDF generated', {
        reportType,
        companyId
      });

      return {
        success: true,
        html,
        filename: `${reportType}-report-${Date.now()}.pdf`
      };
    } catch (error) {
      logger.error('Failed to generate report PDF', {
        error: error.message,
        reportType,
        companyId
      });
      throw error;
    }
  }

  async generateReceiptPDF(invoiceId, companyId) {
    try {
      const invoice = await Invoice.findById(invoiceId, companyId);

      if (!invoice) {
        throw new NotFoundError('Invoice not found');
      }

      const company = await Company.findById(invoice.company_id);
      const customer = await Customer.findById(invoice.customer_id, companyId);

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
              .receipt { max-width: 400px; margin: 0 auto; border: 2px solid #333; }
              .header { text-align: center; padding: 20px; border-bottom: 2px dashed #333; }
              .content { padding: 20px; }
              .row { display: flex; justify-content: space-between; margin: 10px 0; }
              .total { border-top: 2px solid #333; padding-top: 10px; margin-top: 20px; font-weight: bold; font-size: 18px; }
              .footer { text-align: center; padding: 20px; border-top: 2px dashed #333; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="receipt">
              <div class="header">
                <h2>${company.name}</h2>
                <p>${company.email}</p>
                ${company.phone ? `<p>${company.phone}</p>` : ''}
              </div>
              <div class="content">
                <h3 style="text-align: center; margin-bottom: 20px;">PAYMENT RECEIPT</h3>
                <div class="row">
                  <span>Receipt #:</span>
                  <span>${invoice.invoice_number}</span>
                </div>
                <div class="row">
                  <span>Date:</span>
                  <span>${formatDate(invoice.payment_date || new Date())}</span>
                </div>
                <div class="row">
                  <span>Customer:</span>
                  <span>${customer.name}</span>
                </div>
                <div class="row">
                  <span>Payment Method:</span>
                  <span>${invoice.payment_method || 'Cash'}</span>
                </div>
                <div class="row total">
                  <span>Amount Paid:</span>
                  <span>${formatCurrency(invoice.total)}</span>
                </div>
              </div>
              <div class="footer">
                <p>Thank you for your payment!</p>
                <p>This is a computer-generated receipt</p>
              </div>
            </div>
          </body>
        </html>
      `;

      logger.info('Receipt PDF generated', {
        invoiceId: invoice.id,
        companyId
      });

      return {
        success: true,
        html,
        filename: `receipt-${invoice.invoice_number}.pdf`
      };
    } catch (error) {
      logger.error('Failed to generate receipt PDF', {
        error: error.message,
        invoiceId,
        companyId
      });
      throw error;
    }
  }
}

export default new PDFService();
