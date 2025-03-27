#!/usr/bin/env node
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} = require('@modelcontextprotocol/sdk/types.js');

// Import our SanMar API client
const sanmarApi = require('./sanmar-api.js');

class SanMarMcpServer {
  constructor() {
    this.server = new Server(
      {
        name: 'sanmar-mcp-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          resources: {}, // No resources defined for now
          tools: {},
        },
      }
    );

    this.setupToolHandlers();

    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    // List Tools Handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        // SanMar Standard Product Information Services
        {
          name: 'get_sanmar_product_info',
          description:
            'Retrieves SanMar product information (basic, image, price) by style, optionally filtered by color and size.',
          inputSchema: {
            type: 'object',
            properties: {
              style: { type: 'string', description: 'SanMar style number (e.g., PC61)' },
              color: { type: 'string', description: 'SanMar catalog color name (optional)' },
              size: { type: 'string', description: 'Product size (e.g., S, XL) (optional)' },
            },
            required: ['style'],
          },
        },
        {
          name: 'get_sanmar_product_by_brand',
          description:
            'Retrieves SanMar product information for all products of a specific brand.',
          inputSchema: {
            type: 'object',
            properties: {
              brand: { 
                type: 'string', 
                description: 'Brand name (e.g., Port Authority, Nike, OGIO, etc.)',
                enum: [
                  'Allmade', 'Alternative', 'American Apparel', 'Anvil', 'Bella + Canvas', 
                  'Brooks Brothers', 'Bulwark', 'Carhartt', 'Champion', 'Comfort Colors', 
                  'CornerStone', 'Cotopaxi', 'District', 'Eddie Bauer', 'Fruit of the Loom', 
                  'Gildan', 'Hanes', 'Jerzees', 'Mercer+Mettle', 'New Era', 'Next Level', 
                  'Nike', 'OGIO', 'Outdoor Research', 'Port & Company', 'Port Authority', 
                  'Rabbit Skins', 'Red House', 'Red Kap', 'Russell Outdoors', 'Spacecraft', 
                  'Sport-Tek', 'tentree', 'The North Face', 'Tommy Bahama', 'TravisMathew', 
                  'Volunteer Knitwear', 'Wonderwink'
                ]
              },
            },
            required: ['brand'],
          },
        },
        {
          name: 'get_sanmar_product_by_category',
          description:
            'Retrieves SanMar product information for all products in a specific category.',
          inputSchema: {
            type: 'object',
            properties: {
              category: { 
                type: 'string', 
                description: 'Product category',
                enum: [
                  'Activewear', 'Accessories', 'Bags', 'Caps', 'Infant & Toddler', 
                  'Juniors & Young Men', 'Ladies', 'Outerwear', 'Polos/Knits', 
                  'Sweatshirts/Fleece', 'Tall', 'Workwear', 'Woven Shirts', 'Youth'
                ]
              },
            },
            required: ['category'],
          },
        },
        {
          name: 'get_sanmar_product_bulk_info',
          description:
            'Generates a bulk CSV file with all SanMar product information in the SanMarPI folder on the FTP server.',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_sanmar_product_delta_info',
          description:
            'Generates an incremental CSV file with only changed product information since the last bulk or delta request.',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        
        // SanMar Standard Inventory Services
        {
          name: 'get_sanmar_inventory',
          description:
            'Retrieves SanMar inventory levels by style, optionally filtered by color and size.',
          inputSchema: {
            type: 'object',
            properties: {
              style: { type: 'string', description: 'SanMar style number (e.g., PC61)' },
              color: { type: 'string', description: 'SanMar catalog color name (optional)' },
              size: { type: 'string', description: 'Product size (e.g., S, XL) (optional)' },
            },
            required: ['style'],
          },
        },
        {
          name: 'get_sanmar_inventory_by_warehouse',
          description:
            'Retrieves SanMar inventory levels for a specific warehouse by style, optionally filtered by color and size.',
          inputSchema: {
            type: 'object',
            properties: {
              style: { type: 'string', description: 'SanMar style number (e.g., PC61)' },
              color: { type: 'string', description: 'SanMar catalog color name (optional)' },
              size: { type: 'string', description: 'Product size (e.g., S, XL) (optional)' },
              warehouse: { 
                type: 'string', 
                description: 'Warehouse number',
                enum: ['1', '2', '3', '4', '5', '6', '7', '12', '31'],
              },
            },
            required: ['style', 'warehouse'],
          },
        },
        
        // SanMar Standard Pricing Services
        {
          name: 'get_sanmar_pricing',
          description:
            'Retrieves SanMar pricing information by style, optionally filtered by color and size.',
          inputSchema: {
            type: 'object',
            properties: {
              style: { type: 'string', description: 'SanMar style number (e.g., PC61)' },
              color: { type: 'string', description: 'SanMar catalog color name (optional)' },
              size: { type: 'string', description: 'Product size (e.g., S, XL) (optional)' },
            },
            required: ['style'],
          },
        },
        
        // SanMar Standard Invoicing Services
        {
          name: 'get_sanmar_invoice_by_invoice_no',
          description:
            'Retrieves SanMar invoice information by invoice number.',
          inputSchema: {
            type: 'object',
            properties: {
              invoiceNo: { type: 'string', description: 'SanMar invoice number' },
            },
            required: ['invoiceNo'],
          },
        },
        {
          name: 'get_sanmar_invoices_by_po',
          description:
            'Retrieves SanMar invoice information by purchase order number.',
          inputSchema: {
            type: 'object',
            properties: {
              purchaseOrderNo: { type: 'string', description: 'Purchase order number' },
            },
            required: ['purchaseOrderNo'],
          },
        },
        {
          name: 'get_sanmar_invoices_by_date_range',
          description:
            'Retrieves SanMar invoice information by invoice date range (max 3 months).',
          inputSchema: {
            type: 'object',
            properties: {
              startDate: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
              endDate: { type: 'string', description: 'End date (YYYY-MM-DD)' },
            },
            required: ['startDate', 'endDate'],
          },
        },
        {
          name: 'get_sanmar_invoices_by_order_date',
          description:
            'Retrieves SanMar invoice information by order date.',
          inputSchema: {
            type: 'object',
            properties: {
              date: { type: 'string', description: 'Order date (YYYY-MM-DD)' },
            },
            required: ['date'],
          },
        },
        {
          name: 'get_sanmar_unpaid_invoices',
          description:
            'Retrieves all unpaid SanMar invoices.',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        
        // SanMar License Plate Number Service
        {
          name: 'get_sanmar_packing_slip',
          description:
            'Retrieves packing slip information for a specific LPN (License Plate Number).',
          inputSchema: {
            type: 'object',
            properties: {
              packingSlipId: { type: 'string', description: 'License Plate Number (LPN)' },
            },
            required: ['packingSlipId'],
          },
        },
        
        // PromoStandards Product Data Services
        {
          name: 'get_ps_product',
          description:
            'Retrieves detailed product information using PromoStandards Product Data Service.',
          inputSchema: {
            type: 'object',
            properties: {
              productId: { type: 'string', description: 'SanMar style number (e.g., PC61)' },
              partId: { type: 'string', description: 'SanMar unique key (optional)' },
              colorName: { type: 'string', description: 'SanMar catalog color name (optional)' },
              apparelSize: { type: 'string', description: 'Product size (e.g., S, XL) (optional)' },
            },
            required: ['productId'],
          },
        },
        {
          name: 'get_ps_product_closeout',
          description:
            'Retrieves a list of discontinued products using PromoStandards Product Data Service.',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_ps_product_date_modified',
          description:
            'Retrieves a list of products modified since a specific date using PromoStandards Product Data Service.',
          inputSchema: {
            type: 'object',
            properties: {
              changeTimeStamp: { type: 'string', description: 'ISO 8601 timestamp (YYYY-MM-DDThh:mm:ss.sssZ)' },
            },
            required: ['changeTimeStamp'],
          },
        },
        {
          name: 'get_ps_product_sellable',
          description:
            'Retrieves a list of sellable products using PromoStandards Product Data Service.',
          inputSchema: {
            type: 'object',
            properties: {
              productId: { type: 'string', description: 'SanMar style number (e.g., PC61)' },
              isSellable: { type: 'boolean', description: 'Whether the product is sellable' },
            },
            required: ['productId', 'isSellable'],
          },
        },
        
        // PromoStandards Media Content Services
        {
          name: 'get_ps_media_content',
          description:
            'Retrieves media content (images, documents) for a product using PromoStandards Media Content Service.',
          inputSchema: {
            type: 'object',
            properties: {
              productId: { type: 'string', description: 'SanMar style number (e.g., PC61)' },
              partId: { type: 'string', description: 'SanMar unique key (optional)' },
              mediaType: { 
                type: 'string', 
                description: 'Type of media to return',
                enum: ['Image', 'Document'],
                default: 'Image'
              },
              classType: { 
                type: 'string', 
                description: 'Class type of media',
                enum: ['1004', '1006', '1007', '1008', '2001'],
              },
            },
            required: ['productId'],
          },
        },
        
        // PromoStandards Inventory Services
        {
          name: 'get_ps_inventory_levels',
          description:
            'Retrieves inventory levels using PromoStandards Inventory Service.',
          inputSchema: {
            type: 'object',
            properties: {
              productId: { type: 'string', description: 'SanMar style number (e.g., PC61)' },
              filter: { 
                type: 'object', 
                description: 'Filter options',
                properties: {
                  partIdArray: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Array of part IDs (up to 200)'
                  },
                  LabelSizeArray: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Array of label sizes'
                  },
                  PartColorArray: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Array of part colors'
                  }
                }
              },
            },
            required: ['productId'],
          },
        },
        
        // PromoStandards Pricing and Configuration Services
        {
          name: 'get_ps_pricing_config',
          description:
            'Retrieves pricing and configuration information using PromoStandards Pricing and Configuration Service.',
          inputSchema: {
            type: 'object',
            properties: {
              productId: { type: 'string', description: 'SanMar style number (e.g., PC61)' },
              partId: { type: 'string', description: 'SanMar unique key' },
              priceType: { 
                type: 'string', 
                description: 'Type of price to return',
                enum: ['Net', 'List', 'Customer'],
                default: 'Net'
              },
              fobId: { 
                type: 'string', 
                description: 'FOB point ID',
                enum: ['1', '2', '3', '4', '5', '6', '7', '12', '31'],
                default: '1'
              },
            },
            required: ['productId', 'partId'],
          },
        },
        {
          name: 'get_ps_fob_points',
          description:
            'Retrieves FOB points information using PromoStandards Pricing and Configuration Service.',
          inputSchema: {
            type: 'object',
            properties: {
              productId: { type: 'string', description: 'SanMar style number (e.g., PC61)' },
            },
            required: ['productId'],
          },
        },
        
        // PromoStandards Order Shipment Notification Services
        {
          name: 'get_ps_order_shipment_notification',
          description:
            'Retrieves order shipment notifications using PromoStandards Order Shipment Notification Service.',
          inputSchema: {
            type: 'object',
            properties: {
              queryType: { 
                type: 'string', 
                description: 'Type of query',
                enum: ['1', '2', '3'],
              },
              referenceNumber: { 
                type: 'string', 
                description: 'Purchase order or sales order number (required for queryType 1 or 2)' 
              },
              shipmentDateTimeStamp: { 
                type: 'string', 
                description: 'ISO 8601 timestamp (required for queryType 3)' 
              },
            },
            required: ['queryType'],
          },
        },
        
        // PromoStandards Order Status Services
        {
          name: 'get_ps_order_status_types',
          description:
            'Retrieves order status types using PromoStandards Order Status Service.',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_ps_order_status_details',
          description:
            'Retrieves order status details using PromoStandards Order Status Service.',
          inputSchema: {
            type: 'object',
            properties: {
              queryType: { 
                type: 'string', 
                description: 'Type of query',
                enum: ['1', '2', '3', '4'],
              },
              referenceNumber: { 
                type: 'string', 
                description: 'Purchase order or sales order number (required for queryType 1 or 2)' 
              },
              statusTimeStamp: { 
                type: 'string', 
                description: 'ISO 8601 timestamp (required for queryType 3)' 
              },
            },
            required: ['queryType'],
          },
        },
        {
          name: 'get_ps_order_status',
          description:
            'Retrieves order status using PromoStandards Order Status Service V2.',
          inputSchema: {
            type: 'object',
            properties: {
              queryType: { 
                type: 'string', 
                description: 'Type of query',
                enum: ['poSearch', 'soSearch', 'lastUpdate', 'allOpen', 'allOpenIssues'],
              },
              referenceNumber: { 
                type: 'string', 
                description: 'Purchase order or sales order number (required for queryType poSearch or soSearch)' 
              },
              statusTimeStamp: { 
                type: 'string', 
                description: 'ISO 8601 timestamp (required for queryType lastUpdate)' 
              },
              returnIssueDetailType: { 
                type: 'string', 
                description: 'Type of issue details to return',
                enum: ['noIssues', 'openIssues', 'allIssues'],
                default: 'noIssues'
              },
              returnProductDetail: { 
                type: 'boolean', 
                description: 'Whether to return product details',
                default: true
              },
            },
            required: ['queryType'],
          },
        },
        {
          name: 'get_ps_service_methods',
          description:
            'Retrieves service methods using PromoStandards Order Status Service V2.',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        
        // PromoStandards Invoice Services
        {
          name: 'get_ps_invoices',
          description:
            'Retrieves invoices using PromoStandards Invoice Service.',
          inputSchema: {
            type: 'object',
            properties: {
              queryType: { 
                type: 'string', 
                description: 'Type of query',
                enum: ['1', '2', '3', '4'],
              },
              referenceNumber: { 
                type: 'string', 
                description: 'Purchase order or invoice number (required for queryType 1 or 2)' 
              },
              requestedDate: { 
                type: 'string', 
                description: 'Date in YYYY-MM-DD format (required for queryType 3)' 
              },
              availableTimeStamp: { 
                type: 'string', 
                description: 'ISO 8601 timestamp (required for queryType 4)' 
              },
            },
            required: ['queryType'],
          },
        },

        // SanMar Standard PO Services
        {
          name: 'get_sanmar_presubmit_info',
          description: 'Checks inventory availability before submitting a PO (SanMar Standard).',
          inputSchema: {
            type: 'object',
            description: 'PO data structure matching the getPreSubmitInfo service requirements.',
            // Define properties based on the guide's XML structure for arg0
            properties: {
              poNum: { type: 'string' },
              shipTo: { type: 'string', description: 'Company Name' },
              shipAddress1: { type: 'string' },
              shipAddress2: { type: 'string' },
              shipCity: { type: 'string' },
              shipState: { type: 'string', maxLength: 2 },
              shipZip: { type: 'string', minLength: 5, maxLength: 10 },
              shipMethod: { type: 'string' },
              shipEmail: { type: 'string' },
              residence: { type: 'string', enum: ['Y', 'N'] },
              attention: { type: 'string' },
              webServicePoDetailList: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    style: { type: 'string' },
                    color: { type: 'string' }, // SANMAR_MAINFRAME_COLOR
                    size: { type: 'string' },
                    quantity: { type: 'integer' },
                    inventoryKey: { type: 'integer' }, // Optional if style/color/size provided
                    sizeIndex: { type: 'integer' }, // Optional if style/color/size provided
                    whseNo: { type: 'integer' } // Optional for warehouse selection
                  },
                  required: ['quantity'] // Plus either (invKey+sizeIndex) or (style+color+size)
                }
              }
              // Add other optional fields like notes, department if needed
            },
            required: ['poNum', 'shipAddress1', 'shipCity', 'shipState', 'shipZip', 'shipMethod', 'shipEmail', 'residence', 'webServicePoDetailList']
          }
        },
        {
          name: 'submit_sanmar_po',
          description: 'Submits a Purchase Order using the SanMar Standard service.',
           inputSchema: { // Same schema as get_sanmar_presubmit_info
            type: 'object',
            description: 'PO data structure matching the submitPO service requirements.',
            properties: {
              poNum: { type: 'string' },
              shipTo: { type: 'string', description: 'Company Name' },
              shipAddress1: { type: 'string' },
              shipAddress2: { type: 'string' },
              shipCity: { type: 'string' },
              shipState: { type: 'string', maxLength: 2 },
              shipZip: { type: 'string', minLength: 5, maxLength: 10 },
              shipMethod: { type: 'string' },
              shipEmail: { type: 'string' },
              residence: { type: 'string', enum: ['Y', 'N'] },
              attention: { type: 'string' },
              webServicePoDetailList: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    style: { type: 'string' },
                    color: { type: 'string' }, // SANMAR_MAINFRAME_COLOR
                    size: { type: 'string' },
                    quantity: { type: 'integer' },
                    inventoryKey: { type: 'integer' }, // Optional if style/color/size provided
                    sizeIndex: { type: 'integer' }, // Optional if style/color/size provided
                    whseNo: { type: 'integer' } // Optional for warehouse selection
                  },
                  required: ['quantity'] // Plus either (invKey+sizeIndex) or (style+color+size)
                }
              }
              // Add other optional fields like notes, department if needed
            },
            required: ['poNum', 'shipAddress1', 'shipCity', 'shipState', 'shipZip', 'shipMethod', 'shipEmail', 'residence', 'webServicePoDetailList']
          }
        },

        // PromoStandards PO Services
        {
          name: 'get_ps_supported_po_types',
          description: 'Retrieves the supported PO types (PromoStandards). Should return "Blank".',
          inputSchema: { type: 'object', properties: {} }
        },
        {
          name: 'send_ps_po',
          description: 'Submits a Purchase Order using the PromoStandards service.',
          inputSchema: {
            type: 'object',
            description: 'PO data structure matching the PromoStandards SendPO service requirements.',
            // Define properties based on the guide's XML structure for PO
            properties: {
               orderType: { type: 'string', enum: ['Blank', 'Sample', 'Simple', 'Configured'] },
               orderNumber: { type: 'string', maxLength: 28 },
               orderDate: { type: 'string', format: 'date-time' }, // e.g., 2022-02-08T00:00:00
               totalAmount: { type: 'number' },
               rush: { type: 'boolean' },
               currency: { type: 'string', enum: ['USD'] }, // Assuming USD
               ShipmentArray: {
                 type: 'array',
                 items: {
                   type: 'object',
                   properties: {
                      shipReferences: { type: 'array', items: { type: 'string' }, maxItems: 2 },
                      comments: { type: 'string', maxLength: 255 },
                      allowConsolidation: { type: 'boolean' },
                      blindShip: { type: 'boolean' },
                      packingListRequired: { type: 'boolean' },
                      FreightDetails: {
                        type: 'object',
                        properties: {
                          carrier: { type: 'string' }, // e.g., UPS, USPS
                          service: { type: 'string' } // e.g., Ground, 2ND DAY, PP, APP, PSST
                        },
                        required: ['carrier', 'service']
                      },
                      ShipTo: {
                        type: 'object',
                        properties: {
                          customerPickup: { type: 'boolean' },
                          ContactDetails: {
                            type: 'object',
                            properties: {
                              attentionTo: { type: 'string', maxLength: 35 },
                              companyName: { type: 'string', maxLength: 35 },
                              address1: { type: 'string', maxLength: 35 },
                              address2: { type: 'string', maxLength: 35 },
                              city: { type: 'string', maxLength: 30 },
                              region: { type: 'string', maxLength: 3 }, // State code
                              postalCode: { type: 'string', maxLength: 10 },
                              country: { type: 'string', enum: ['US'] }, // Assuming US
                              email: { type: 'string', maxLength: 105 },
                              phone: { type: 'string', maxLength: 32 },
                              comments: { type: 'string', maxLength: 255 }
                            },
                            required: ['address1', 'city', 'region', 'postalCode', 'country']
                          },
                          shipmentId: { type: 'integer' }
                        },
                        required: ['customerPickup', 'ContactDetails', 'shipmentId']
                      }
                   },
                   required: ['allowConsolidation', 'blindShip', 'packingListRequired', 'FreightDetails', 'ShipTo']
                 }
               },
               LineItemArray: {
                 type: 'array',
                 items: {
                   type: 'object',
                   properties: {
                      lineNumber: { type: 'string', maxLength: 64 }, // Changed to string as per guide example
                      description: { type: 'string', maxLength: 255 },
                      lineType: { type: 'string', enum: ['New', 'Repeat', 'Reference'] },
                      fobId: { type: 'string' }, // Optional, Warehouse ID
                      ToleranceDetails: {
                        type: 'object',
                        properties: {
                          tolerance: { type: 'string', enum: ['AllowOverRun', 'AllowUnderRun', 'AllowOverRunOrUnderRun', 'ExactOnly'] }
                        },
                        required: ['tolerance']
                      },
                      allowPartialShipments: { type: 'boolean' },
                      lineItemTotal: { type: 'number' },
                      PartArray: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            partId: { type: 'string', maxLength: 64 }, // SanMar Unique Key
                            customerSupplied: { type: 'boolean' },
                            Quantity: {
                              type: 'object',
                              properties: {
                                uom: { type: 'string', enum: ['BX', 'CA', 'DZ', 'EA', 'KT', 'PR', 'PK', 'RL', 'ST', 'SL', 'TH'] },
                                value: { type: 'number' } // Quantity value
                              },
                              required: ['uom', 'value']
                            },
                            locationLinkId: { type: 'array', items: { type: 'integer' } } // Optional
                          },
                          required: ['partId', 'customerSupplied', 'Quantity']
                        }
                      }
                   },
                   required: ['lineNumber', 'description', 'lineType', 'ToleranceDetails', 'allowPartialShipments', 'lineItemTotal', 'PartArray']
                 }
               },
               termsAndConditions: { type: 'string', maxLength: 255 },
               salesChannel: { type: 'string', maxLength: 3 } // Optional Dept Code
            },
            required: ['orderType', 'orderNumber', 'orderDate', 'totalAmount', 'rush', 'currency', 'ShipmentArray', 'LineItemArray']
          }
        }
      ],
    }));

    // Call Tool Handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      let result;
      try {
        const args = request.params.arguments || {};
        
        switch (request.params.name) {
          // SanMar Standard Product Information Services
          case 'get_sanmar_product_info':
            result = await sanmarApi.getProductInfoByStyleColorSize(
              args.style,
              args.color,
              args.size
            );
            break;
            
          case 'get_sanmar_product_by_brand':
            result = await sanmarApi.getProductInfoByBrand(args.brand);
            break;
            
          case 'get_sanmar_product_by_category':
            result = await sanmarApi.getProductInfoByCategory(args.category);
            break;
            
          case 'get_sanmar_product_bulk_info':
            result = await sanmarApi.getProductBulkInfo();
            break;
            
          case 'get_sanmar_product_delta_info':
            result = await sanmarApi.getProductDeltaInfo();
            break;
            
          // SanMar Standard Inventory Services
          case 'get_sanmar_inventory':
            result = await sanmarApi.getInventoryQtyForStyleColorSize(
              args.style,
              args.color,
              args.size
            );
            break;
            
          case 'get_sanmar_inventory_by_warehouse':
            result = await sanmarApi.getInventoryQtyForStyleColorSizeByWhse(
              args.style,
              args.color,
              args.size,
              args.warehouse
            );
            break;
            
          // SanMar Standard Pricing Services
          case 'get_sanmar_pricing':
            result = await sanmarApi.getPricing(
              args.style,
              args.color,
              args.size
            );
            break;
            
          // SanMar Standard Invoicing Services
          case 'get_sanmar_invoice_by_invoice_no':
            result = await sanmarApi.getInvoiceByInvoiceNo(args.invoiceNo);
            break;
            
          case 'get_sanmar_invoices_by_po':
            result = await sanmarApi.getInvoicesByPurchaseOrderNo(args.purchaseOrderNo);
            break;
            
          case 'get_sanmar_invoices_by_date_range':
            result = await sanmarApi.getInvoicesByInvoiceDateRange(args.startDate, args.endDate);
            break;
            
          case 'get_sanmar_invoices_by_order_date':
            result = await sanmarApi.getInvoicesByOrderDate(args.date);
            break;
            
          case 'get_sanmar_unpaid_invoices':
            result = await sanmarApi.getUnpaidInvoices();
            break;
            
          // SanMar License Plate Number Service
          case 'get_sanmar_packing_slip':
            result = await sanmarApi.getPackingSlip(args.packingSlipId);
            break;
            
          // PromoStandards Product Data Services
          case 'get_ps_product':
            result = await sanmarApi.psGetProduct(
              args.productId,
              args.partId,
              args.colorName,
              args.apparelSize
            );
            break;
            
          case 'get_ps_product_closeout':
            result = await sanmarApi.psGetProductCloseOut();
            break;
            
          case 'get_ps_product_date_modified':
            result = await sanmarApi.psGetProductDateModified(args.changeTimeStamp);
            break;
            
          case 'get_ps_product_sellable':
            result = await sanmarApi.psGetProductSellable(args.productId, args.isSellable);
            break;
            
          // PromoStandards Media Content Services
          case 'get_ps_media_content':
            result = await sanmarApi.psGetMediaContent(
              args.productId,
              args.partId,
              args.mediaType,
              args.classType
            );
            break;
            
          // PromoStandards Inventory Services
          case 'get_ps_inventory_levels':
            result = await sanmarApi.psGetInventoryLevels(args.productId, args.filter);
            break;
            
          // PromoStandards Pricing and Configuration Services
          case 'get_ps_pricing_config':
            result = await sanmarApi.psGetConfigurationAndPricing(
              args.productId,
              args.partId,
              args.priceType,
              args.fobId
            );
            break;
            
          case 'get_ps_fob_points':
            result = await sanmarApi.psGetFobPoints(args.productId);
            break;
            
          // PromoStandards Order Shipment Notification Services
          case 'get_ps_order_shipment_notification':
            result = await sanmarApi.psGetOrderShipmentNotification(
              args.queryType,
              args.referenceNumber,
              args.shipmentDateTimeStamp
            );
            break;
            
          // PromoStandards Order Status Services
          case 'get_ps_order_status_types':
            result = await sanmarApi.psGetOrderStatusTypes();
            break;
            
          case 'get_ps_order_status_details':
            result = await sanmarApi.psGetOrderStatusDetails(
              args.queryType,
              args.referenceNumber,
              args.statusTimeStamp
            );
            break;
            
          case 'get_ps_order_status':
            result = await sanmarApi.psGetOrderStatus(
              args.queryType,
              args.referenceNumber,
              args.statusTimeStamp,
              args.returnIssueDetailType,
              args.returnProductDetail
            );
            break;
            
          case 'get_ps_service_methods':
            result = await sanmarApi.psGetServiceMethods();
            break;
            
          // PromoStandards Invoice Services
          case 'get_ps_invoices':
            result = await sanmarApi.psGetInvoices(
              args.queryType,
              args.referenceNumber,
              args.requestedDate,
              args.availableTimeStamp
            );
            break;
            
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${request.params.name}`
            );
        }

        // --- Add cases for new PO tools ---
        switch (request.params.name) {
          // ... (existing cases) ...

          // SanMar Standard PO Services
          case 'get_sanmar_presubmit_info':
            result = await sanmarApi.getPreSubmitInfo(args); // Pass the whole args object
            break;
          case 'submit_sanmar_po':
            result = await sanmarApi.submitPO(args); // Pass the whole args object
            break;

          // PromoStandards PO Services
          case 'get_ps_supported_po_types':
            result = await sanmarApi.psGetSupportedOrderTypes();
            break;
          case 'send_ps_po':
            // The psSendPO function expects the PO data under a 'PO' key
            result = await sanmarApi.psSendPO(args);
            break;

          // ... (default case remains the same) ...
          default:
             // Combine results from previous switch if needed, or handle unknown tool
             if (result === undefined) { // Only throw if no previous case matched
                throw new McpError(
                  ErrorCode.MethodNotFound,
                  `Unknown tool: ${request.params.name}`
                );
             }
        }

        // Format successful result
        return {
          content: [
            {
              type: 'text',
              // Convert result to JSON string for the response
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        // Handle errors thrown from tool functions or switch statement
        console.error(`Error calling tool ${request.params.name}:`, error);
        const errorMessage = error instanceof McpError ? error.message : error.message || 'An unexpected error occurred.';
        const errorCode = error instanceof McpError ? error.code : ErrorCode.InternalError;

        // Return error response
        return {
          content: [{ type: 'text', text: errorMessage }],
          isError: true,
          errorCode: errorCode,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('SanMar MCP server running on stdio');
  }
}

// Run the server
const server = new SanMarMcpServer();
server.run().catch((err) => {
  console.error('Server failed to run:', err);
  process.exit(1);
});
