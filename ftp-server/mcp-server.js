#!/usr/bin/env node
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  McpError,
  ErrorCode,
} = require('@modelcontextprotocol/sdk/types.js');
const { NodeSSH } = require('node-ssh');

// --- Credentials from Environment Variables ---
const FTP_HOST = process.env.SANMAR_FTP_HOST;
const FTP_USERNAME = process.env.SANMAR_FTP_USERNAME;
const FTP_PASSWORD = process.env.SANMAR_FTP_PASSWORD;

if (!FTP_HOST || !FTP_USERNAME || !FTP_PASSWORD) {
  throw new Error(
    'SANMAR_FTP_HOST, SANMAR_FTP_USERNAME, and SANMAR_FTP_PASSWORD environment variables are required'
  );
}

class SanMarFtpMcpServer {
  constructor() {
    this.server = new Server(
      {
        name: 'sanmar-ftp-mcp-server',
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
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_sanmar_ftp_file',
          description: 'Downloads a file from the SanMar FTP server.',
          inputSchema: {
            type: 'object',
            properties: {
              remotePath: {
                type: 'string',
                description: 'Path to the file on the FTP server.',
              },
              localPath: {
                type: 'string',
                description: 'Local path to save the downloaded file.',
              },
            },
            required: ['remotePath', 'localPath'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const args = request.params.arguments || {};

        switch (request.params.name) {
          case 'get_sanmar_ftp_file':
            const { remotePath, localPath } = args;
            await this.downloadFtpFile(remotePath, localPath);
            return {
              content: [
                {
                  type: 'text',
                  text: `File downloaded successfully to: ${localPath}`,
                },
              ],
            };
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${request.params.name}`
            );
        }
      } catch (error) {
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

  async downloadFtpFile(remotePath, localPath) {
    const ssh = new NodeSSH();
    try {
      await ssh.connect({
        host: FTP_HOST,
        username: FTP_USERNAME,
        password: FTP_PASSWORD,
      });
      await ssh.getFile(localPath, remotePath);
    } catch (err) {
      console.error('Download failed:', err);
      throw new Error(`FTP download failed: ${err.message}`);
    } finally {
      ssh.dispose();
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('SanMar FTP MCP server running on stdio');
  }
}

// Run the server
const server = new SanMarFtpMcpServer();
server.run().catch((err) => {
  console.error('Server failed to run:', err);
  process.exit(1);
});
