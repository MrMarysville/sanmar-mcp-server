#!/usr/bin/env node
const soap = require('soap');

// --- Credentials from Environment Variables ---
const SANMAR_CUSTOMER_NUMBER = process.env.SANMAR_CUSTOMER_NUMBER || '103579';
const SANMAR_USERNAME = process.env.SANMAR_USERNAME || 'kingcl';
const SANMAR_PASSWORD = process.env.SANMAR_PASSWORD || 'candis21';

// --- SanMar API Endpoints (Production) ---
const PRODUCT_INFO_WSDL =
  'https://ws.sanmar.com:8080/SanMarWebService/SanMarProductInfoServicePort?wsdl';
const INVENTORY_WSDL =
  'https://ws.sanmar.com:8080/SanMarWebService/SanMarWebServicePort?wsdl';
const PRICING_WSDL =
  'https://ws.sanmar.com:8080/SanMarWebService/SanMarPricingServicePort?wsdl';
const INVOICE_WSDL =
  'https://ws.sanmar.com:8080/SanMarWebService/InvoicePort?wsdl';

// --- Authentication Object ---
const authArgs = {
  sanMarCustomerNumber: SANMAR_CUSTOMER_NUMBER,
  sanMarUserName: SANMAR_USERNAME,
  sanMarUserPassword: SANMAR_PASSWORD,
};

// --- Helper Function to Create SOAP Client ---
async function createSoapClient(wsdlUrl) {
  try {
    const client = await soap.createClientAsync(wsdlUrl);
    return client;
  } catch (error) {
    console.error(`Failed to create SOAP client for ${wsdlUrl}:`, error);
    throw new Error(`Failed to initialize SOAP client: ${error.message}`);
  }
}

// --- Tool Implementations ---
async function getProductInfoByStyleColorSize(style, color, size) {
  const client = await createSoapClient(PRODUCT_INFO_WSDL);
  const requestArgs = {
    arg0: {
      style: style,
      color: color, // Will be null/undefined if not provided
      size: size, // Will be null/undefined if not provided
    },
    arg1: authArgs,
  };

  try {
    const [result] = await client.getProductInfoByStyleColorSizeAsync(requestArgs);
    // Check for SanMar specific errors in the response structure
    if (result?.return?.errorOccured === true) {
      throw new Error(`SanMar API Error: ${result.return.message || 'Unknown error'}`);
    }
    // Return the relevant part of the response
    return result?.return?.listResponse || result?.return || result;
  } catch (error) {
    console.error('SOAP Call Error (getProductInfoByStyleColorSize):', error);
    // Handle SOAP faults specifically
    if (error.root?.Envelope?.Body?.Fault) {
      const fault = error.root.Envelope.Body.Fault;
      const faultString = fault.faultstring || 'Unknown SOAP Fault';
      throw new Error(`SOAP Fault: ${faultString}`);
    }
    throw new Error(`SOAP call failed: ${error.message}`);
  }
}

// --- Main Function ---
async function main() {
  try {
    // Example: Get product info for PC61 in White, size XL
    const productInfo = await getProductInfoByStyleColorSize('PC61', 'White', 'XL');
    console.log(JSON.stringify(productInfo, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the main function
main();
