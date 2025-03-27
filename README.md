# SanMar MCP Server

This repository contains two server implementations for integrating with SanMar's systems:

## MCP Server
Located in `/mcp-server/`
- Main MCP server implementation
- Handles core MCP functionality
- Includes SanMar API integration

## FTP Server
Located in `/ftp-server/`
- FTP-specific server implementation
- Handles file transfer operations
- Specialized for SanMar FTP integration

## Setup and Usage

### MCP Server
1. Navigate to the mcp-server directory:
   ```bash
   cd mcp-server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the server:
   ```bash
   node mcp-server.js
   ```

### FTP Server
1. Navigate to the ftp-server directory:
   ```bash
   cd ftp-server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the server:
   ```bash
   node mcp-server.js
   ```

## Environment Variables
Both servers require appropriate environment variables to be set. Create a `.env` file in each server directory with the necessary configuration. 