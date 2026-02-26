import logger from '../utils/logger.js';
import { ValidationError } from '../utils/helpers.js';

class MaxiCashService {
  constructor() {
    this.merchantId = process.env.MAXICASH_MERCHANT_ID;
    this.merchantPassword = process.env.MAXICASH_MERCHANT_PASSWORD;
    this.environment = process.env.MAXICASH_ENVIRONMENT || 'sandbox';

    this.apiUrl = this.environment === 'live'
      ? 'https://api.maxicashapp.com/Merchant/api.asmx'
      : 'https://api-testbed.maxicashapp.com/Merchant/api.asmx';
  }

  validateCredentials() {
    if (!this.merchantId || !this.merchantPassword) {
      throw new ValidationError({
        maxicash: 'MaxiCash credentials not configured. Please set MAXICASH_MERCHANT_ID and MAXICASH_MERCHANT_PASSWORD in .env'
      });
    }
  }

  async initiatePayment(paymentData) {
    try {
      this.validateCredentials();

      const {
        amount,
        currency = 'USD',
        reference,
        description,
        customerPhone
      } = paymentData;

      if (!amount || amount <= 0) {
        throw new ValidationError({ amount: 'Invalid payment amount' });
      }

      if (!reference) {
        throw new ValidationError({ reference: 'Payment reference is required' });
      }

      if (!customerPhone) {
        throw new ValidationError({ phone: 'Customer phone number is required for MaxiCash payments' });
      }

      const amountInCents = Math.round(amount * 100);

      const soapEnvelope = this.buildPayNowSynchRequest({
        merchantId: this.merchantId,
        merchantPassword: this.merchantPassword,
        amount: amountInCents,
        currency,
        reference,
        description: description || `Subscription payment - ${reference}`,
        customerPhone
      });

      logger.info('Initiating MaxiCash PayNowSynch payment', {
        reference,
        amount: amountInCents,
        currency,
        environment: this.environment
      });

      const response = await fetch(`${this.apiUrl}/PayNowSynch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'http://tempuri.org/PayNowSynch'
        },
        body: soapEnvelope
      });

      if (!response.ok) {
        throw new Error(`MaxiCash API returned status ${response.status}`);
      }

      const responseText = await response.text();
      const result = this.parsePayNowSynchResponse(responseText);

      logger.info('MaxiCash PayNowSynch response received', {
        reference,
        status: result.status,
        transactionId: result.transactionId
      });

      return result;
    } catch (error) {
      logger.error('MaxiCash payment initiation failed', {
        error: error.message,
        reference: paymentData.reference
      });
      throw error;
    }
  }

  buildPayNowSynchRequest(params) {
    const { merchantId, merchantPassword, amount, currency, reference, description, customerPhone } = params;

    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
               xmlns:xsd="http://www.w3.org/2001/XMLSchema"
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <PayNowSynch xmlns="http://tempuri.org/">
      <MerchantID>${this.escapeXml(merchantId)}</MerchantID>
      <MerchantPassword>${this.escapeXml(merchantPassword)}</MerchantPassword>
      <Amount>${amount}</Amount>
      <Currency>${this.escapeXml(currency)}</Currency>
      <Reference>${this.escapeXml(reference)}</Reference>
      <Description>${this.escapeXml(description)}</Description>
      <PayerCellNr>${this.escapeXml(customerPhone)}</PayerCellNr>
    </PayNowSynch>
  </soap:Body>
</soap:Envelope>`;
  }

  parsePayNowSynchResponse(xmlResponse) {
    try {
      const statusMatch = xmlResponse.match(/<Status>([^<]+)<\/Status>/);
      const transactionIdMatch = xmlResponse.match(/<TransactionID>([^<]+)<\/TransactionID>/);
      const messageMatch = xmlResponse.match(/<Message>([^<]+)<\/Message>/);
      const amountMatch = xmlResponse.match(/<Amount>([^<]+)<\/Amount>/);

      const status = statusMatch ? statusMatch[1].trim() : 'unknown';
      const transactionId = transactionIdMatch ? transactionIdMatch[1].trim() : null;
      const message = messageMatch ? messageMatch[1].trim() : '';
      const amount = amountMatch ? parseInt(amountMatch[1]) : 0;

      const isSuccess = status.toLowerCase() === 'success' ||
                       status.toLowerCase() === 'approved' ||
                       status === '0';

      return {
        success: isSuccess,
        status,
        transactionId,
        message,
        amount,
        rawResponse: xmlResponse
      };
    } catch (error) {
      logger.error('Failed to parse MaxiCash response', {
        error: error.message,
        response: xmlResponse
      });
      throw new Error('Failed to parse payment response');
    }
  }

  async verifyPayment(transactionId) {
    try {
      this.validateCredentials();

      if (!transactionId) {
        throw new ValidationError({ transactionId: 'Transaction ID is required' });
      }

      const soapEnvelope = this.buildVerifyTransactionRequest(transactionId);

      logger.info('Verifying MaxiCash transaction', {
        transactionId,
        environment: this.environment
      });

      const response = await fetch(`${this.apiUrl}/VerifyTransaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'http://tempuri.org/VerifyTransaction'
        },
        body: soapEnvelope
      });

      if (!response.ok) {
        throw new Error(`MaxiCash API returned status ${response.status}`);
      }

      const responseText = await response.text();
      const result = this.parseVerifyTransactionResponse(responseText);

      logger.info('MaxiCash transaction verification complete', {
        transactionId,
        status: result.status
      });

      return result;
    } catch (error) {
      logger.error('MaxiCash transaction verification failed', {
        error: error.message,
        transactionId
      });
      throw error;
    }
  }

  buildVerifyTransactionRequest(transactionId) {
    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
               xmlns:xsd="http://www.w3.org/2001/XMLSchema"
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <VerifyTransaction xmlns="http://tempuri.org/">
      <MerchantID>${this.escapeXml(this.merchantId)}</MerchantID>
      <MerchantPassword>${this.escapeXml(this.merchantPassword)}</MerchantPassword>
      <TransactionID>${this.escapeXml(transactionId)}</TransactionID>
    </VerifyTransaction>
  </soap:Body>
</soap:Envelope>`;
  }

  parseVerifyTransactionResponse(xmlResponse) {
    try {
      const statusMatch = xmlResponse.match(/<Status>([^<]+)<\/Status>/);
      const amountMatch = xmlResponse.match(/<Amount>([^<]+)<\/Amount>/);
      const referenceMatch = xmlResponse.match(/<Reference>([^<]+)<\/Reference>/);
      const transactionDateMatch = xmlResponse.match(/<TransactionDate>([^<]+)<\/TransactionDate>/);

      const status = statusMatch ? statusMatch[1].trim() : 'unknown';
      const amount = amountMatch ? parseInt(amountMatch[1]) : 0;
      const reference = referenceMatch ? referenceMatch[1].trim() : null;
      const transactionDate = transactionDateMatch ? transactionDateMatch[1].trim() : null;

      const isSuccess = status.toLowerCase() === 'success' ||
                       status.toLowerCase() === 'approved' ||
                       status === '0';

      return {
        success: isSuccess,
        status,
        amount,
        reference,
        transactionDate,
        rawResponse: xmlResponse
      };
    } catch (error) {
      logger.error('Failed to parse MaxiCash verification response', {
        error: error.message,
        response: xmlResponse
      });
      throw new Error('Failed to parse verification response');
    }
  }

  escapeXml(unsafe) {
    if (unsafe === null || unsafe === undefined) return '';
    return String(unsafe)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  formatCurrency(amountInCents, currency = 'USD') {
    const amount = amountInCents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  convertToMaxiCashCurrency(currency) {
    const currencyMap = {
      'USD': 'maxiDollar',
      'ZAR': 'maxiRand'
    };
    return currencyMap[currency] || currency;
  }
}

export default new MaxiCashService();
