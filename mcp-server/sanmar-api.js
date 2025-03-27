#!/usr/bin/env node
const soap = require('soap');

// --- Credentials from Environment Variables ---
const SANMAR_CUSTOMER_NUMBER = process.env.SANMAR_CUSTOMER_NUMBER || '103579';
const SANMAR_USERNAME = process.env.SANMAR_USERNAME || 'kingcl';
const SANMAR_PASSWORD = process.env.SANMAR_PASSWORD || 'candis21';

// --- SanMar API Endpoints (Production) ---
const PRODUCT_INFO_WSDL = 'https://ws.sanmar.com:8080/SanMarWebService/SanMarProductInfoServicePort?wsdl';
const INVENTORY_WSDL = 'https://ws.sanmar.com:8080/SanMarWebService/SanMarWebServicePort?wsdl';
const PRICING_WSDL = 'https://ws.sanmar.com:8080/SanMarWebService/SanMarPricingServicePort?wsdl';
const INVOICE_WSDL = 'https://ws.sanmar.com:8080/SanMarWebService/InvoicePort?wsdl';
const PACKING_SLIP_WSDL = 'https://ws.sanmar.com:8080/SanMarWebService/webservices/PackingSlipService?wsdl';
const PO_SERVICE_WSDL = 'https://ws.sanmar.com:8080/SanMarWebService/SanMarPOServicePort?wsdl'; // Added for Standard PO

// PromoStandards endpoints
const PS_PRODUCT_DATA_WSDL = 'https://ws.sanmar.com:8080/promostandards/ProductDataServiceV2.xml?wsdl';
const PS_MEDIA_CONTENT_WSDL = 'https://ws.sanmar.com:8080/promostandards/MediaContentServiceBinding?wsdl';
const PS_INVENTORY_WSDL = 'https://ws.sanmar.com:8080/promostandards/InventoryServiceBindingV2final?WSDL';
const PS_PRICING_CONFIG_WSDL = 'https://ws.sanmar.com:8080/promostandards/PricingAndConfigurationServiceBinding?WSDL';
const PS_ORDER_SHIPMENT_WSDL = 'https://ws.sanmar.com:8080/promostandards/OrderShipmentNotificationServiceBinding?wsdl';
const PS_ORDER_STATUS_WSDL = 'https://ws.sanmar.com:8080/promostandards/OrderStatusServiceBinding?wsdl';
const PS_ORDER_STATUS_V2_WSDL = 'https://ws.sanmar.com:8080/promostandards/OrderStatusServiceBindingV2?wsdl';
const PS_INVOICE_WSDL = 'https://ws.sanmar.com:8080/promostandards/InvoiceServiceBindingV1_0_0?WSDL';
const PS_PO_SERVICE_WSDL = 'https://ws.sanmar.com:8080/promostandards/POServiceBinding?wsdl'; // Added for PromoStandards PO


// --- Authentication Object ---
const authArgs = {
  sanMarCustomerNumber: SANMAR_CUSTOMER_NUMBER,
  sanMarUserName: SANMAR_USERNAME,
  sanMarUserPassword: SANMAR_PASSWORD,
};

// PromoStandards Authentication
const psAuthArgs = {
  id: SANMAR_USERNAME,
  password: SANMAR_PASSWORD
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

// --- SanMar Standard API Functions ---

// Product Information
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

async function getProductInfoByBrand(brand) {
  const client = await createSoapClient(PRODUCT_INFO_WSDL);
  const requestArgs = {
    arg0: {
      brandName: brand,
    },
    arg1: authArgs,
  };

  try {
    const [result] = await client.getProductInfoByBrandAsync(requestArgs);
    if (result?.return?.errorOccured === true) {
      throw new Error(`SanMar API Error: ${result.return.message || 'Unknown error'}`);
    }
    return result?.return?.listResponse || result?.return || result;
  } catch (error) {
    console.error('SOAP Call Error (getProductInfoByBrand):', error);
    if (error.root?.Envelope?.Body?.Fault) {
      const fault = error.root.Envelope.Body.Fault;
      const faultString = fault.faultstring || 'Unknown SOAP Fault';
      throw new Error(`SOAP Fault: ${faultString}`);
    }
    throw new Error(`SOAP call failed: ${error.message}`);
  }
}

async function getProductInfoByCategory(category) {
  const client = await createSoapClient(PRODUCT_INFO_WSDL);
  const requestArgs = {
    arg0: {
      category: category,
    },
    arg1: authArgs,
  };

  try {
    const [result] = await client.getProductInfoByCategoryAsync(requestArgs);
    if (result?.return?.errorOccured === true) {
      throw new Error(`SanMar API Error: ${result.return.message || 'Unknown error'}`);
    }
    return result?.return?.listResponse || result?.return || result;
  } catch (error) {
    console.error('SOAP Call Error (getProductInfoByCategory):', error);
    if (error.root?.Envelope?.Body?.Fault) {
      const fault = error.root.Envelope.Body.Fault;
      const faultString = fault.faultstring || 'Unknown SOAP Fault';
      throw new Error(`SOAP Fault: ${faultString}`);
    }
    throw new Error(`SOAP call failed: ${error.message}`);
  }
}

async function getProductBulkInfo() {
  const client = await createSoapClient(PRODUCT_INFO_WSDL);
  const requestArgs = {
    arg0: authArgs,
  };

  try {
    const [result] = await client.getProductBulkInfoAsync(requestArgs);
    if (result?.return?.errorOccured === true) {
      throw new Error(`SanMar API Error: ${result.return.message || 'Unknown error'}`);
    }
    return result?.return || result;
  } catch (error) {
    console.error('SOAP Call Error (getProductBulkInfo):', error);
    if (error.root?.Envelope?.Body?.Fault) {
      const fault = error.root.Envelope.Body.Fault;
      const faultString = fault.faultstring || 'Unknown SOAP Fault';
      throw new Error(`SOAP Fault: ${faultString}`);
    }
    throw new Error(`SOAP call failed: ${error.message}`);
  }
}

async function getProductDeltaInfo() {
  const client = await createSoapClient(PRODUCT_INFO_WSDL);
  const requestArgs = {
    arg0: authArgs,
  };

  try {
    const [result] = await client.getProductDeltaInfoAsync(requestArgs);
    if (result?.return?.errorOccured === true) {
      throw new Error(`SanMar API Error: ${result.return.message || 'Unknown error'}`);
    }
    return result?.return || result;
  } catch (error) {
    console.error('SOAP Call Error (getProductDeltaInfo):', error);
    if (error.root?.Envelope?.Body?.Fault) {
      const fault = error.root.Envelope.Body.Fault;
      const faultString = fault.faultstring || 'Unknown SOAP Fault';
      throw new Error(`SOAP Fault: ${faultString}`);
    }
    throw new Error(`SOAP call failed: ${error.message}`);
  }
}

// Inventory
async function getInventoryQtyForStyleColorSize(style, color, size) {
  const client = await createSoapClient(INVENTORY_WSDL);
  const requestArgs = {
    arg0: SANMAR_CUSTOMER_NUMBER,
    arg1: SANMAR_USERNAME,
    arg2: SANMAR_PASSWORD,
    arg3: style,
    arg4: color, // Will be null/undefined if not provided
    arg5: size, // Will be null/undefined if not provided
  };

  try {
    const [result] = await client.getInventoryQtyForStyleColorSizeAsync(requestArgs);
    // Check for SanMar specific errors in the response structure
    if (result?.errorOccurred === true) {
      throw new Error(`SanMar API Error: ${result.message || 'Unknown error'}`);
    }
    // Return the relevant part of the response
    return result;
  } catch (error) {
    console.error('SOAP Call Error (getInventoryQtyForStyleColorSize):', error);
    // Handle SOAP faults specifically
    if (error.root?.Envelope?.Body?.Fault) {
      const fault = error.root.Envelope.Body.Fault;
      const faultString = fault.faultstring || 'Unknown SOAP Fault';
      throw new Error(`SOAP Fault: ${faultString}`);
    }
    throw new Error(`SOAP call failed: ${error.message}`);
  }
}

async function getInventoryQtyForStyleColorSizeByWhse(style, color, size, warehouse) {
  const client = await createSoapClient(INVENTORY_WSDL);
  const requestArgs = {
    arg0: SANMAR_CUSTOMER_NUMBER,
    arg1: SANMAR_USERNAME,
    arg2: SANMAR_PASSWORD,
    arg3: style,
    arg4: color, // Will be null/undefined if not provided
    arg5: size, // Will be null/undefined if not provided
    arg6: warehouse,
  };

  try {
    const [result] = await client.getInventoryQtyForStyleColorSizeByWhseAsync(requestArgs);
    if (result?.errorOccurred === true) {
      throw new Error(`SanMar API Error: ${result.message || 'Unknown error'}`);
    }
    return result;
  } catch (error) {
    console.error('SOAP Call Error (getInventoryQtyForStyleColorSizeByWhse):', error);
    if (error.root?.Envelope?.Body?.Fault) {
      const fault = error.root.Envelope.Body.Fault;
      const faultString = fault.faultstring || 'Unknown SOAP Fault';
      throw new Error(`SOAP Fault: ${faultString}`);
    }
    throw new Error(`SOAP call failed: ${error.message}`);
  }
}

// Pricing
async function getPricing(style, color, size) {
  const client = await createSoapClient(PRICING_WSDL);
  const requestArgs = {
    arg0: {
      style: style,
      color: color, // Will be null/undefined if not provided
      size: size, // Will be null/undefined if not provided
    },
    arg1: authArgs,
  };

  try {
    const [result] = await client.getPricingAsync(requestArgs);
    // Check for SanMar specific errors in the response structure
    if (result?.return?.errorOccurred === true) {
      throw new Error(`SanMar API Error: ${result.return.message || 'Unknown error'}`);
    }
    // Return the relevant part of the response
    return result?.return?.listResponse || result?.return || result;
  } catch (error) {
    console.error('SOAP Call Error (getPricing):', error);
    // Handle SOAP faults specifically
    if (error.root?.Envelope?.Body?.Fault) {
      const fault = error.root.Envelope.Body.Fault;
      const faultString = fault.faultstring || 'Unknown SOAP Fault';
      throw new Error(`SOAP Fault: ${faultString}`);
    }
    throw new Error(`SOAP call failed: ${error.message}`);
  }
}

// Invoicing
async function getInvoiceByInvoiceNo(invoiceNo) {
  const client = await createSoapClient(INVOICE_WSDL);
  const requestArgs = {
    CustomerNo: SANMAR_CUSTOMER_NUMBER,
    UserName: SANMAR_USERNAME,
    Password: SANMAR_PASSWORD,
    InvoiceNo: invoiceNo,
  };

  try {
    const [result] = await client.GetInvoiceByInvoiceNoAsync(requestArgs);
    return result;
  } catch (error) {
    console.error('SOAP Call Error (getInvoiceByInvoiceNo):', error);
    if (error.root?.Envelope?.Body?.Fault) {
      const fault = error.root.Envelope.Body.Fault;
      const faultString = fault.faultstring || 'Unknown SOAP Fault';
      throw new Error(`SOAP Fault: ${faultString}`);
    }
    throw new Error(`SOAP call failed: ${error.message}`);
  }
}

async function getInvoicesByPurchaseOrderNo(purchaseOrderNo) {
  const client = await createSoapClient(INVOICE_WSDL);
  const requestArgs = {
    CustomerNo: SANMAR_CUSTOMER_NUMBER,
    UserName: SANMAR_USERNAME,
    Password: SANMAR_PASSWORD,
    PurchaseOrderNo: purchaseOrderNo,
  };

  try {
    const [result] = await client.GetInvoicesByPurchaseOrderNoAsync(requestArgs);
    return result;
  } catch (error) {
    console.error('SOAP Call Error (getInvoicesByPurchaseOrderNo):', error);
    if (error.root?.Envelope?.Body?.Fault) {
      const fault = error.root.Envelope.Body.Fault;
      const faultString = fault.faultstring || 'Unknown SOAP Fault';
      throw new Error(`SOAP Fault: ${faultString}`);
    }
    throw new Error(`SOAP call failed: ${error.message}`);
  }
}

async function getInvoicesByInvoiceDateRange(startDate, endDate) {
  const client = await createSoapClient(INVOICE_WSDL);
  const requestArgs = {
    CustomerNo: SANMAR_CUSTOMER_NUMBER,
    UserName: SANMAR_USERNAME,
    Password: SANMAR_PASSWORD,
    StartDate: startDate,
    EndDate: endDate,
  };

  try {
    const [result] = await client.GetInvoicesByInvoiceDateRangeAsync(requestArgs);
    return result;
  } catch (error) {
    console.error('SOAP Call Error (getInvoicesByInvoiceDateRange):', error);
    if (error.root?.Envelope?.Body?.Fault) {
      const fault = error.root.Envelope.Body.Fault;
      const faultString = fault.faultstring || 'Unknown SOAP Fault';
      throw new Error(`SOAP Fault: ${faultString}`);
    }
    throw new Error(`SOAP call failed: ${error.message}`);
  }
}

async function getInvoicesByOrderDate(date) {
  const client = await createSoapClient(INVOICE_WSDL);
  const requestArgs = {
    CustomerNo: SANMAR_CUSTOMER_NUMBER,
    UserName: SANMAR_USERNAME,
    Password: SANMAR_PASSWORD,
    Date: date,
  };

  try {
    const [result] = await client.GetInvoicesByOrderDateAsync(requestArgs);
    return result;
  } catch (error) {
    console.error('SOAP Call Error (getInvoicesByOrderDate):', error);
    if (error.root?.Envelope?.Body?.Fault) {
      const fault = error.root.Envelope.Body.Fault;
      const faultString = fault.faultstring || 'Unknown SOAP Fault';
      throw new Error(`SOAP Fault: ${faultString}`);
    }
    throw new Error(`SOAP call failed: ${error.message}`);
  }
}

async function getUnpaidInvoices() {
  const client = await createSoapClient(INVOICE_WSDL);
  const requestArgs = {
    CustomerNo: SANMAR_CUSTOMER_NUMBER,
    UserName: SANMAR_USERNAME,
    Password: SANMAR_PASSWORD,
  };

  try {
    const [result] = await client.GetUnpaidInvoicesAsync(requestArgs);
    return result;
  } catch (error) {
    console.error('SOAP Call Error (getUnpaidInvoices):', error);
    if (error.root?.Envelope?.Body?.Fault) {
      const fault = error.root.Envelope.Body.Fault;
      const faultString = fault.faultstring || 'Unknown SOAP Fault';
      throw new Error(`SOAP Fault: ${faultString}`);
    }
    throw new Error(`SOAP call failed: ${error.message}`);
  }
}

// Packing Slip (LPN)
async function getPackingSlip(packingSlipId) {
  const client = await createSoapClient(PACKING_SLIP_WSDL);
  const requestArgs = {
    wsVersion: '1.0.0',
    UserId: SANMAR_USERNAME,
    Password: SANMAR_PASSWORD,
    PackingSlipId: packingSlipId,
  };

  try {
    const [result] = await client.GetPackingSlipAsync(requestArgs);
    return result;
  } catch (error) {
    console.error('SOAP Call Error (getPackingSlip):', error);
    if (error.root?.Envelope?.Body?.Fault) {
      const fault = error.root.Envelope.Body.Fault;
      const faultString = fault.faultstring || 'Unknown SOAP Fault';
      throw new Error(`SOAP Fault: ${faultString}`);
    }
    throw new Error(`SOAP call failed: ${error.message}`);
  }
}

// --- PromoStandards API Functions ---

// Product Data
async function psGetProduct(productId, partId, colorName, apparelSize) {
  const client = await createSoapClient(PS_PRODUCT_DATA_WSDL);
  const requestArgs = {
    wsVersion: '2.0.0',
    id: SANMAR_USERNAME,
    password: SANMAR_PASSWORD,
    localizationCountry: 'us',
    localizationLanguage: 'en',
    productId: productId,
    partId: partId,
    colorName: colorName,
  };

  // Add ApparelSizeArray if apparelSize is provided
  if (apparelSize) {
    requestArgs.ApparelSizeArray = {
      ApparelSize: {
        apparelStyle: 'Unisex',
        labelSize: apparelSize,
        customSize: apparelSize,
      }
    };
  }

  try {
    const [result] = await client.getProductAsync(requestArgs);
    return result;
  } catch (error) {
    console.error('SOAP Call Error (psGetProduct):', error);
    if (error.root?.Envelope?.Body?.Fault) {
      const fault = error.root.Envelope.Body.Fault;
      const faultString = fault.faultstring || 'Unknown SOAP Fault';
      throw new Error(`SOAP Fault: ${faultString}`);
    }
    throw new Error(`SOAP call failed: ${error.message}`);
  }
}

async function psGetProductCloseOut() {
  const client = await createSoapClient(PS_PRODUCT_DATA_WSDL);
  const requestArgs = {
    wsVersion: '2.0.0',
    id: SANMAR_USERNAME,
    password: SANMAR_PASSWORD,
  };

  try {
    const [result] = await client.getProductCloseOutAsync(requestArgs);
    return result;
  } catch (error) {
    console.error('SOAP Call Error (psGetProductCloseOut):', error);
    if (error.root?.Envelope?.Body?.Fault) {
      const fault = error.root.Envelope.Body.Fault;
      const faultString = fault.faultstring || 'Unknown SOAP Fault';
      throw new Error(`SOAP Fault: ${faultString}`);
    }
    throw new Error(`SOAP call failed: ${error.message}`);
  }
}

async function psGetProductDateModified(changeTimeStamp) {
  const client = await createSoapClient(PS_PRODUCT_DATA_WSDL);
  const requestArgs = {
    wsVersion: '2.0.0',
    id: SANMAR_USERNAME,
    password: SANMAR_PASSWORD,
    changeTimeStamp: changeTimeStamp,
  };

  try {
    const [result] = await client.getProductDateModifiedAsync(requestArgs);
    return result;
  } catch (error) {
    console.error('SOAP Call Error (psGetProductDateModified):', error);
    if (error.root?.Envelope?.Body?.Fault) {
      const fault = error.root.Envelope.Body.Fault;
      const faultString = fault.faultstring || 'Unknown SOAP Fault';
      throw new Error(`SOAP Fault: ${faultString}`);
    }
    throw new Error(`SOAP call failed: ${error.message}`);
  }
}

async function psGetProductSellable(productId, isSellable) {
  const client = await createSoapClient(PS_PRODUCT_DATA_WSDL);
  const requestArgs = {
    wsVersion: '2.0.0',
    id: SANMAR_USERNAME,
    password: SANMAR_PASSWORD,
    productId: productId,
    isSellable: isSellable,
  };

  try {
    const [result] = await client.getProductSellableAsync(requestArgs);
    return result;
  } catch (error) {
    console.error('SOAP Call Error (psGetProductSellable):', error);
    if (error.root?.Envelope?.Body?.Fault) {
      const fault = error.root.Envelope.Body.Fault;
      const faultString = fault.faultstring || 'Unknown SOAP Fault';
      throw new Error(`SOAP Fault: ${faultString}`);
    }
    throw new Error(`SOAP call failed: ${error.message}`);
  }
}

// Media Content
async function psGetMediaContent(productId, partId, mediaType, classType) {
  const client = await createSoapClient(PS_MEDIA_CONTENT_WSDL);
  const requestArgs = {
    wsVersion: '1.1.0',
    id: SANMAR_USERNAME,
    password: SANMAR_PASSWORD,
    cultureName: '',
    mediaType: mediaType || 'Image',
    productId: productId,
    partId: partId,
    classType: classType,
  };

  try {
    const [result] = await client.getMediaContentAsync(requestArgs);
    return result;
  } catch (error) {
    console.error('SOAP Call Error (psGetMediaContent):', error);
    if (error.root?.Envelope?.Body?.Fault) {
      const fault = error.root.Envelope.Body.Fault;
      const faultString = fault.faultstring || 'Unknown SOAP Fault';
      throw new Error(`SOAP Fault: ${faultString}`);
    }
    throw new Error(`SOAP call failed: ${error.message}`);
  }
}

// Inventory
async function psGetInventoryLevels(productId, filter) {
  const client = await createSoapClient(PS_INVENTORY_WSDL);
  const requestArgs = {
    wsVersion: '2.0.0',
    id: SANMAR_USERNAME,
    password: SANMAR_PASSWORD,
    productId: productId,
  };

  // Add filter if provided
  if (filter) {
    requestArgs.Filter = filter;
  }

  try {
    const [result] = await client.getInventoryLevelsAsync(requestArgs);
    return result;
  } catch (error) {
    console.error('SOAP Call Error (psGetInventoryLevels):', error);
    if (error.root?.Envelope?.Body?.Fault) {
      const fault = error.root.Envelope.Body.Fault;
      const faultString = fault.faultstring || 'Unknown SOAP Fault';
      throw new Error(`SOAP Fault: ${faultString}`);
    }
    throw new Error(`SOAP call failed: ${error.message}`);
  }
}

// Pricing and Configuration
async function psGetConfigurationAndPricing(productId, partId, priceType, fobId) {
  const client = await createSoapClient(PS_PRICING_CONFIG_WSDL);
  const requestArgs = {
    wsVersion: '1.0.0',
    id: SANMAR_USERNAME,
    password: SANMAR_PASSWORD,
    productId: productId,
    partId: partId,
    currency: 'USD',
    fobId: fobId || '1',
    priceType: priceType || 'Net',
    localizationCountry: 'US',
    localizationLanguage: 'EN',
    configurationType: 'Blank',
  };

  try {
    const [result] = await client.getConfigurationAndPricingAsync(requestArgs);
    return result;
  } catch (error) {
    console.error('SOAP Call Error (psGetConfigurationAndPricing):', error);
    if (error.root?.Envelope?.Body?.Fault) {
      const fault = error.root.Envelope.Body.Fault;
      const faultString = fault.faultstring || 'Unknown SOAP Fault';
      throw new Error(`SOAP Fault: ${faultString}`);
    }
    throw new Error(`SOAP call failed: ${error.message}`);
  }
}

async function psGetFobPoints(productId) {
  const client = await createSoapClient(PS_PRICING_CONFIG_WSDL);
  const requestArgs = {
    wsVersion: '1.0.0',
    id: SANMAR_USERNAME,
    password: SANMAR_PASSWORD,
    productId: productId,
    localizationCountry: 'US',
    localizationLanguage: 'EN',
  };

  try {
    const [result] = await client.getFobPointsAsync(requestArgs);
    return result;
  } catch (error) {
    console.error('SOAP Call Error (psGetFobPoints):', error);
    if (error.root?.Envelope?.Body?.Fault) {
      const fault = error.root.Envelope.Body.Fault;
      const faultString = fault.faultstring || 'Unknown SOAP Fault';
      throw new Error(`SOAP Fault: ${faultString}`);
    }
    throw new Error(`SOAP call failed: ${error.message}`);
  }
}

// Order Shipment Notification
async function psGetOrderShipmentNotification(queryType, referenceNumber, shipmentDateTimeStamp) {
  const client = await createSoapClient(PS_ORDER_SHIPMENT_WSDL);
  const requestArgs = {
    wsVersion: '1.0.0',
    id: SANMAR_USERNAME,
    password: SANMAR_PASSWORD,
    queryType: queryType,
  };

  // Add referenceNumber or shipmentDateTimeStamp based on queryType
  if (queryType === '1' || queryType === '2') {
    requestArgs.referenceNumber = referenceNumber;
  } else if (queryType === '3') {
    requestArgs.shipmentDateTimeStamp = shipmentDateTimeStamp;
  }

  try {
    const [result] = await client.getOrderShipmentNotificationAsync(requestArgs);
    return result;
  } catch (error) {
    console.error('SOAP Call Error (psGetOrderShipmentNotification):', error);
    if (error.root?.Envelope?.Body?.Fault) {
      const fault = error.root.Envelope.Body.Fault;
      const faultString = fault.faultstring || 'Unknown SOAP Fault';
      throw new Error(`SOAP Fault: ${faultString}`);
    }
    throw new Error(`SOAP call failed: ${error.message}`);
  }
}

// Order Status
async function psGetOrderStatusTypes() {
  const client = await createSoapClient(PS_ORDER_STATUS_WSDL);
  const requestArgs = {
    wsVersion: '1.0.0',
    id: SANMAR_USERNAME,
    password: SANMAR_PASSWORD,
  };

  try {
    const [result] = await client.getOrderStatusTypesAsync(requestArgs);
    return result;
  } catch (error) {
    console.error('SOAP Call Error (psGetOrderStatusTypes):', error);
    if (error.root?.Envelope?.Body?.Fault) {
      const fault = error.root.Envelope.Body.Fault;
      const faultString = fault.faultstring || 'Unknown SOAP Fault';
      throw new Error(`SOAP Fault: ${faultString}`);
    }
    throw new Error(`SOAP call failed: ${error.message}`);
  }
}

async function psGetOrderStatusDetails(queryType, referenceNumber, statusTimeStamp) {
  const client = await createSoapClient(PS_ORDER_STATUS_WSDL);
  const requestArgs = {
    wsVersion: '1.0.0',
    id: SANMAR_USERNAME,
    password: SANMAR_PASSWORD,
    queryType: queryType,
  };

  // Add referenceNumber or statusTimeStamp based on queryType
  if (queryType === '1' || queryType === '2') {
    requestArgs.referenceNumber = referenceNumber;
  } else if (queryType === '3') {
    requestArgs.statusTimeStamp = statusTimeStamp;
  }

  try {
    const [result] = await client.getOrderStatusDetailsAsync(requestArgs);
    return result;
  } catch (error) {
    console.error('SOAP Call Error (psGetOrderStatusDetails):', error);
    if (error.root?.Envelope?.Body?.Fault) {
      const fault = error.root.Envelope.Body.Fault;
      const faultString = fault.faultstring || 'Unknown SOAP Fault';
      throw new Error(`SOAP Fault: ${faultString}`);
    }
    throw new Error(`SOAP call failed: ${error.message}`);
  }
}

// Order Status V2
async function psGetOrderStatus(queryType, referenceNumber, statusTimeStamp, returnIssueDetailType, returnProductDetail) {
  const client = await createSoapClient(PS_ORDER_STATUS_V2_WSDL);
  const requestArgs = {
    wsVersion: '2.0.0',
    id: SANMAR_USERNAME,
    password: SANMAR_PASSWORD,
    queryType: queryType,
    returnIssueDetailType: returnIssueDetailType || 'noIssues',
    returnProductDetail: returnProductDetail || true,
  };

  // Add referenceNumber or statusTimeStamp based on queryType
  if (queryType === 'poSearch' || queryType === 'soSearch') {
    requestArgs.referenceNumber = referenceNumber;
  } else if (queryType === 'lastUpdate') {
    requestArgs.statusTimeStamp = statusTimeStamp;
  }

  try {
    const [result] = await client.getOrderStatusAsync(requestArgs);
    return result;
  } catch (error) {
    console.error('SOAP Call Error (psGetOrderStatus):', error);
    if (error.root?.Envelope?.Body?.Fault) {
      const fault = error.root.Envelope.Body.Fault;
      const faultString = fault.faultstring || 'Unknown SOAP Fault';
      throw new Error(`SOAP Fault: ${faultString}`);
    }
    throw new Error(`SOAP call failed: ${error.message}`);
  }
}

async function psGetServiceMethods() {
  const client = await createSoapClient(PS_ORDER_STATUS_V2_WSDL);
  const requestArgs = {
    wsVersion: '2.0.0',
    id: SANMAR_USERNAME,
    password: SANMAR_PASSWORD,
  };

  try {
    const [result] = await client.getServiceMethodsAsync(requestArgs);
    return result;
  } catch (error) {
    console.error('SOAP Call Error (psGetServiceMethods):', error);
    if (error.root?.Envelope?.Body?.Fault) {
      const fault = error.root.Envelope.Body.Fault;
      const faultString = fault.faultstring || 'Unknown SOAP Fault';
      throw new Error(`SOAP Fault: ${faultString}`);
    }
    throw new Error(`SOAP call failed: ${error.message}`);
  }
}

// Invoice
async function psGetInvoices(queryType, referenceNumber, requestedDate, availableTimeStamp) {
  const client = await createSoapClient(PS_INVOICE_WSDL);
  const requestArgs = {
    wsVersion: '1.0.0',
    id: SANMAR_USERNAME,
    password: SANMAR_PASSWORD,
    queryType: queryType,
  };

  // Add parameters based on queryType
  if (queryType === '1' || queryType === '2') {
    requestArgs.referenceNumber = referenceNumber;
  } else if (queryType === '3') {
    requestArgs.requestedDate = requestedDate;
  } else if (queryType === '4') {
    requestArgs.availableTimeStamp = availableTimeStamp;
  }

  try {
    const [result] = await client.getInvoicesAsync(requestArgs);
    return result;
  } catch (error) {
    console.error('SOAP Call Error (psGetInvoices):', error);
    if (error.root?.Envelope?.Body?.Fault) {
      const fault = error.root.Envelope.Body.Fault;
      const faultString = fault.faultstring || 'Unknown SOAP Fault';
      throw new Error(`SOAP Fault: ${faultString}`);
    }
    throw new Error(`SOAP call failed: ${error.message}`);
  }
}

// --- SanMar Standard PO Service Functions ---

async function getPreSubmitInfo(poData) {
  const client = await createSoapClient(PO_SERVICE_WSDL);
  const requestArgs = {
    arg0: poData, // Expects the PO structure defined in the guide
    arg1: authArgs,
  };

  try {
    const [result] = await client.getPreSubmitInfoAsync(requestArgs);
    // Check for SanMar specific errors in the response structure
    if (result?.return?.errorOccurred === true) {
      throw new Error(`SanMar API Error: ${result.return.message || 'Unknown error'}`);
    }
    return result?.return || result;
  } catch (error) {
    console.error('SOAP Call Error (getPreSubmitInfo):', error);
    if (error.root?.Envelope?.Body?.Fault) {
      const fault = error.root.Envelope.Body.Fault;
      const faultString = fault.faultstring || 'Unknown SOAP Fault';
      throw new Error(`SOAP Fault: ${faultString}`);
    }
    throw new Error(`SOAP call failed: ${error.message}`);
  }
}

async function submitPO(poData) {
  const client = await createSoapClient(PO_SERVICE_WSDL);
  const requestArgs = {
    arg0: poData, // Expects the PO structure defined in the guide
    arg1: authArgs,
  };

  try {
    const [result] = await client.submitPOAsync(requestArgs);
    // Check for SanMar specific errors in the response structure
    if (result?.return?.errorOccurred === true) {
      throw new Error(`SanMar API Error: ${result.return.message || 'Unknown error'}`);
    }
    return result?.return || result; // Should return { errorOccurred: false, message: 'PO Submission successful' }
  } catch (error) {
    console.error('SOAP Call Error (submitPO):', error);
    if (error.root?.Envelope?.Body?.Fault) {
      const fault = error.root.Envelope.Body.Fault;
      const faultString = fault.faultstring || 'Unknown SOAP Fault';
      throw new Error(`SOAP Fault: ${faultString}`);
    }
    throw new Error(`SOAP call failed: ${error.message}`);
  }
}

// --- PromoStandards PO Service Functions ---

async function psGetSupportedOrderTypes() {
  const client = await createSoapClient(PS_PO_SERVICE_WSDL);
  const requestArgs = {
    wsVersion: '1.0.0', // Assuming v1.0.0 based on guide
    id: SANMAR_USERNAME,
    password: SANMAR_PASSWORD,
  };

  try {
    // Note: The method name might vary slightly depending on the WSDL structure.
    // Common variations: GetSupportedOrderTypesAsync, getSupportedOrderTypesAsync
    // Adjust if necessary based on SOAP client introspection or errors.
    const [result] = await client.GetSupportedOrderTypesAsync(requestArgs);
    // Check for PromoStandards specific errors if the structure is known
    // Example: if (result?.ErrorMessage) throw new Error(result.ErrorMessage);
    return result; // Should return { supportedOrderTypes: 'Blank' }
  } catch (error) {
    console.error('SOAP Call Error (psGetSupportedOrderTypes):', error);
    if (error.root?.Envelope?.Body?.Fault) {
      const fault = error.root.Envelope.Body.Fault;
      const faultString = fault.faultstring || 'Unknown SOAP Fault';
      throw new Error(`SOAP Fault: ${faultString}`);
    }
    throw new Error(`SOAP call failed: ${error.message}`);
  }
}

async function psSendPO(poData) {
  const client = await createSoapClient(PS_PO_SERVICE_WSDL);
  // Construct the requestArgs based on the PromoStandards SendPO structure
  // This involves mapping the poData object to the complex XML structure shown in the guide
  const requestArgs = {
    wsVersion: '1.0.0', // Assuming v1.0.0
    id: SANMAR_USERNAME,
    password: SANMAR_PASSWORD,
    PO: poData // Expects the complex PO structure defined in the PromoStandards guide
  };

  try {
    // Note: Method name might vary. Adjust if needed.
    const [result] = await client.SendPOAsync(requestArgs);
     // Check for PromoStandards specific errors if the structure is known
    // Example: if (result?.errorMessageArray) throw new Error(result.errorMessageArray[0].description);
    return result; // Should return { transactionId: '...' } on success
  } catch (error) {
    console.error('SOAP Call Error (psSendPO):', error);
    if (error.root?.Envelope?.Body?.Fault) {
      const fault = error.root.Envelope.Body.Fault;
      const faultString = fault.faultstring || 'Unknown SOAP Fault';
      throw new Error(`SOAP Fault: ${faultString}`);
    }
    throw new Error(`SOAP call failed: ${error.message}`);
  }
}


// --- Command Line Interface ---
async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'product':
        // Usage: node sanmar-api.js product <style> [color] [size]
        const style = args[1];
        const color = args[2];
        const size = args[3];

        if (!style) {
          console.error('Error: Style is required');
          console.log('Usage: node sanmar-api.js product <style> [color] [size]');
          process.exit(1);
        }

        const productInfo = await getProductInfoByStyleColorSize(style, color, size);
        console.log(JSON.stringify(productInfo, null, 2));
        break;

      case 'inventory':
        // Usage: node sanmar-api.js inventory <style> [color] [size]
        const invStyle = args[1];
        const invColor = args[2];
        const invSize = args[3];

        if (!invStyle) {
          console.error('Error: Style is required');
          console.log('Usage: node sanmar-api.js inventory <style> [color] [size]');
          process.exit(1);
        }

        const inventoryInfo = await getInventoryQtyForStyleColorSize(invStyle, invColor, invSize);
        console.log(JSON.stringify(inventoryInfo, null, 2));
        break;

      case 'pricing':
        // Usage: node sanmar-api.js pricing <style> [color] [size]
        const priceStyle = args[1];
        const priceColor = args[2];
        const priceSize = args[3];

        if (!priceStyle) {
          console.error('Error: Style is required');
          console.log('Usage: node sanmar-api.js pricing <style> [color] [size]');
          process.exit(1);
        }

        const pricingInfo = await getPricing(priceStyle, priceColor, priceSize);
        console.log(JSON.stringify(pricingInfo, null, 2));
        break;

      default:
        console.log('SanMar API CLI');
        console.log('Usage:');
        console.log('  node sanmar-api.js product <style> [color] [size]');
        console.log('  node sanmar-api.js inventory <style> [color] [size]');
        console.log('  node sanmar-api.js pricing <style> [color] [size]');
        break;
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the main function if this file is executed directly
if (require.main === module) {
  main();
}

// Export the functions for use in other modules
module.exports = {
  // SanMar Standard API Functions
  getProductInfoByStyleColorSize,
  getProductInfoByBrand,
  getProductInfoByCategory,
  getProductBulkInfo,
  getProductDeltaInfo,
  getInventoryQtyForStyleColorSize,
  getInventoryQtyForStyleColorSizeByWhse,
  getPricing,
  getInvoiceByInvoiceNo,
  getInvoicesByPurchaseOrderNo,
  getInvoicesByInvoiceDateRange,
  getInvoicesByOrderDate,
  getUnpaidInvoices,
  getPackingSlip,

  // PromoStandards API Functions
  psGetProduct,
  psGetProductCloseOut,
  psGetProductDateModified,
  psGetProductSellable,
  psGetMediaContent,
  psGetInventoryLevels,
  psGetConfigurationAndPricing,
  psGetFobPoints,
  psGetOrderShipmentNotification,
  psGetOrderStatusTypes,
  psGetOrderStatusDetails,
  psGetOrderStatus,
  psGetServiceMethods,
  psGetInvoices,

  // SanMar Standard PO Services
  getPreSubmitInfo,
  submitPO,

  // PromoStandards PO Services
  psGetSupportedOrderTypes,
  psSendPO
};
