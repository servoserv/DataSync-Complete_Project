import type { Express } from "express";
import { createServer, type Server } from "http";
import { db, storage } from "./storage";
import { setupAuth } from "./auth";
import { WebSocketServer, WebSocket } from "ws";
import { google } from "googleapis";
import { insertTableSchema, insertCustomColumnSchema, columnValues, customColumns, tables as tablesSchema } from "@shared/schema";
import { eq, and, ne } from "drizzle-orm";

// Google API setup
const sheets = google.sheets("v4");

// Type for WebSocket client with extended properties
interface ExtendedWebSocket extends WebSocket {
  isAlive: boolean;
  subscribedTables: Set<number>;
  userId?: number;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for Render
  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });
  // Sets up /api/register, /api/login, /api/logout, /api/user
  const { verifyToken } = setupAuth(app);
  
  // Create the HTTP server
  const httpServer = createServer(app);
  
  // Create WebSocket server
  const wss = new WebSocketServer({ 
    server: httpServer,
    // Use a different path to avoid conflicts with Vite's WebSocket
    path: '/ws-api',
    // Add WebSocket server options to increase stability
    clientTracking: true,
    perMessageDeflate: {
      zlibDeflateOptions: {
        chunkSize: 1024,
        memLevel: 7,
        level: 3
      },
      zlibInflateOptions: {
        chunkSize: 10 * 1024
      },
      // Limits zlib concurrency for performance
      concurrencyLimit: 10, 
      // Size below which messages should not be compressed
      threshold: 1024 
    }
  });
  
  // Store connected clients by tableId
  const tableSubscriptions = new Map<number, Set<ExtendedWebSocket>>();
  
  // Monitor websocket connections
  wss.on('connection', (ws: WebSocket) => {
    const extWs = ws as ExtendedWebSocket;
    extWs.isAlive = true;
    extWs.subscribedTables = new Set();
    
    console.log('WebSocket client connected');
    
    // Handle pings to keep connection alive
    extWs.on('pong', () => {
      extWs.isAlive = true;
    });
    
    // Handle client messages
    extWs.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle subscription requests
        if (data.type === 'subscribe' && typeof data.tableId === 'number') {
          const tableId = data.tableId;
          console.log(`Client subscribing to table ${tableId}`);
          
          // Add tableId to user's subscriptions
          extWs.subscribedTables.add(tableId);
          
          // Add user to table's subscribers
          if (!tableSubscriptions.has(tableId)) {
            tableSubscriptions.set(tableId, new Set());
          }
          tableSubscriptions.get(tableId)?.add(extWs);
          
          // Confirm subscription
          extWs.send(JSON.stringify({ 
            type: 'subscribed', 
            tableId,
            message: 'Successfully subscribed to real-time updates'
          }));
        }
        
        // Handle unsubscribe requests
        else if (data.type === 'unsubscribe' && typeof data.tableId === 'number') {
          const tableId = data.tableId;
          
          // Remove tableId from user's subscriptions
          extWs.subscribedTables.delete(tableId);
          
          // Remove user from table's subscribers
          tableSubscriptions.get(tableId)?.delete(extWs);
          if (tableSubscriptions.get(tableId)?.size === 0) {
            tableSubscriptions.delete(tableId);
          }
          
          // Confirm unsubscription
          extWs.send(JSON.stringify({ 
            type: 'unsubscribed', 
            tableId 
          }));
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    // Handle disconnection
    extWs.on('close', () => {
      console.log('WebSocket client disconnected');
      
      // Clean up subscriptions - use Array.from to safely iterate the Set
      Array.from(extWs.subscribedTables).forEach(tableId => {
        tableSubscriptions.get(tableId)?.delete(extWs);
        if (tableSubscriptions.get(tableId)?.size === 0) {
          tableSubscriptions.delete(tableId);
        }
      });
    });
  });
  
  // Heart beat interval to keep connections alive
  const pingInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      const extWs = ws as ExtendedWebSocket;
      if (extWs.isAlive === false) {
        console.log('Terminating inactive WebSocket connection');
        return ws.terminate();
      }
      
      extWs.isAlive = false;
      console.log('Sending ping to keep WebSocket connection alive');
      extWs.ping();
    });
  }, 15000); // Reduced interval to 15 seconds
  
  // Clean up on server close
  wss.on('close', () => {
    clearInterval(pingInterval);
  });
  
  // Helper function for table updates via WebSockets
  const broadcastTableUpdate = (tableId: number, data: any) => {
    const subscribers = tableSubscriptions.get(tableId);
    if (!subscribers || subscribers.size === 0) {
      return;
    }
    
    const message = JSON.stringify({
      type: 'tableUpdate',
      tableId,
      ...data
    });
    
    console.log(`Broadcasting update to ${subscribers.size} clients for table ${tableId}`);
    
    subscribers.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };
  
  // Helper function to fetch data from Google Sheets
  const fetchGoogleSheetData = async (sheetUrl: string) => {
    try {
      // Extract sheet ID from URL
      const matches = sheetUrl.match(/[-\w]{25,}/);
      if (!matches) {
        throw new Error("Invalid Google Sheet URL");
      }
      
      const spreadsheetId = matches[0];
      const apiKey = process.env.GOOGLE_SHEETS_API_KEY || "";
      
      // Verify API key is available
      if (!apiKey) {
        throw new Error("Google Sheets API key is missing");
      }
      
      try {
        // Use direct API call with no caching to ensure fresh data
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: "Sheet1!A1:Z1000", // More specific range to avoid errors
          key: apiKey,
          valueRenderOption: "UNFORMATTED_VALUE", // Get raw values
          dateTimeRenderOption: "FORMATTED_STRING", // Format dates as strings
        });
        
        console.log(`Raw Google Sheets API response:`, JSON.stringify(response.data).substring(0, 500) + '...');
        
        const values = response.data.values || [];
        
        if (values.length === 0) {
          return { headers: [], rows: [] };
        }
        
        // First row contains headers (use empty string if no header)
        const headers = values[0] ? values[0].map(h => h?.toString() || '') : [];
        
        // If no headers but there are rows, create generic headers
        if (headers.length === 0 && values.length > 0) {
          // Get the max columns from any row in the sheet
          const maxColumns = values.reduce((max, row) => 
            Array.isArray(row) ? Math.max(max, row.length) : max, 0);
          
          // Create generic headers as Column 1, Column 2, etc.
          for (let i = 0; i < maxColumns; i++) {
            headers.push(`Column ${i + 1}`);
          }
        }
        
        // Rest are data rows - ensure all values are strings and handle undefined/missing values
        const rows = values.slice(1).map(row => {
          // Ensure row is an array
          if (!Array.isArray(row)) {
            return Array(headers.length).fill('');
          }
          
          // Map each cell, ensuring it's a string
          return Array.from({ length: Math.max(headers.length, row.length) }, (_, i) => {
            const cell = row[i];
            return cell === null || cell === undefined ? '' : cell.toString();
          });
        });
        
        // If there are no rows but headers exist, add an empty row for UI display purposes
        if (rows.length === 0 && headers.length > 0) {
          rows.push(Array(headers.length).fill(''));
        }
        
        console.log(`Fetched ${rows.length} rows from Google Sheet`);
        
        return { headers, rows };
      } catch (googleError: any) {
        // Handle specific Google API errors
        if (googleError.code === 404 || (googleError.response && googleError.response.status === 404)) {
          return { 
            headers: ["Data not found"], 
            rows: [["Please check your Google Sheet URL and permissions"]] 
          };
        }
        
        if (googleError.code === 403 || (googleError.response && googleError.response.status === 403)) {
          return { 
            headers: ["Access denied"], 
            rows: [["Google Sheet requires public access or sharing with service account"]] 
          };
        }
        
        throw googleError;
      }
    } catch (error) {
      console.error("Error fetching Google Sheet data:", error);
      
      // Return a formatted error that's usable by the client
      return { 
        headers: ["Error"], 
        rows: [["Failed to load data. Please check the Google Sheet URL and try again."]] 
      };
    }
  };
  
  // Table Routes
  
  // Get all tables for current user
  app.get("/api/tables", verifyToken, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      // Get tables from database with strict user filtering
      const userTables = await db.select()
        .from(tablesSchema)
        .where(eq(tablesSchema.userId, userId));
      
      res.json(userTables);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tables", error });
    }
  });
  
  // Get a specific table
  app.get("/api/tables/:id", verifyToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const tableId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Use user-specific table lookup
      const table = await storage.getUserTable(tableId, userId);
      
      if (!table) {
        return res.status(404).json({ message: "Table not found" });
      }
      
      // Get custom columns for this table
      const customColumns = await storage.getCustomColumns(tableId);
      
      // Fetch data from Google Sheets
      const sheetData = await fetchGoogleSheetData(table.googleSheetUrl);
      
      res.json({ table, customColumns, sheetData });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch table data", error });
    }
  });
  
  // Create a new table
  app.post("/api/tables", verifyToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const validatedData = insertTableSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      
      // Check if this user already has a table with this Google Sheet URL
      const existingTables = await db.select()
        .from(tablesSchema)
        .where(
          and(
            eq(tablesSchema.userId, req.user.id),
            eq(tablesSchema.googleSheetUrl, validatedData.googleSheetUrl)
          )
        );
      
      if (existingTables.length > 0) {
        return res.status(400).json({ 
          message: "You already have a table using this Google Sheet URL. Please use a different Google Sheet." 
        });
      }
      
      // Try to fetch data from the Google Sheet to validate it
      await fetchGoogleSheetData(validatedData.googleSheetUrl);
      
      // Create the table first
      const newTable = await storage.createTable(validatedData);
      
      // If the request includes columns, create custom columns for the table
      if (req.body.columns && Array.isArray(req.body.columns) && req.body.columns.length > 0) {
        // Process each column
        for (const column of req.body.columns) {
          if (column.name && column.name.trim()) {
            await storage.createCustomColumn({
              tableId: newTable.id,
              name: column.name.trim(),
              type: column.type || 'text'
            });
          }
        }
        
        // Get the custom columns we just created
        const customColumns = await storage.getCustomColumns(newTable.id);
        
        // Return both the table and its columns
        return res.status(201).json({
          ...newTable,
          customColumns
        });
      }
      
      // If no columns, just return the table
      res.status(201).json(newTable);
    } catch (error) {
      res.status(400).json({ message: "Failed to create table", error });
    }
  });
  
  // Add a custom column to a table
  app.post("/api/tables/:id/columns", verifyToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const tableId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Use user-specific table lookup
      const table = await storage.getUserTable(tableId, userId);
      
      if (!table) {
        return res.status(404).json({ message: "Table not found" });
      }
      
      const validatedData = insertCustomColumnSchema.parse({
        ...req.body,
        tableId,
      });
      
      const newColumn = await storage.createCustomColumn(validatedData);
      
      // Fetch latest data to include with the update
      const sheetData = await fetchGoogleSheetData(table.googleSheetUrl);
      
      // Broadcast the update to all clients subscribed to this table
      broadcastTableUpdate(tableId, { 
        type: "columnAdded", 
        column: newColumn,
        sheetData
      });
      
      res.status(201).json(newColumn);
    } catch (error) {
      res.status(400).json({ message: "Failed to add column", error });
    }
  });
  
  // Get data from Google Sheet (with refresh capability)
  app.get("/api/tables/:id/data", verifyToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const tableId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Use user-specific table lookup
      const table = await storage.getUserTable(tableId, userId);
      
      if (!table) {
        return res.status(404).json({ message: "Table not found" });
      }
      
      // Note: fetchGoogleSheetData will never throw now, it returns error info in the data structure
      const sheetData = await fetchGoogleSheetData(table.googleSheetUrl);
      
      // Update the last updated timestamp
      const updatedTable = await storage.updateTable(tableId, { lastUpdatedAt: new Date() });
      
      // Get custom columns
      const customColumns = await storage.getCustomColumns(tableId);
      
      // If refresh was requested explicitly, notify subscribers about the update
      if (req.query.refresh === 'true') {
        broadcastTableUpdate(tableId, { 
          type: "dataRefreshed",
          message: "Data refreshed",
          sheetData,
          customColumns,
          table: updatedTable
        });
      }
      
      res.json({
        table: updatedTable, 
        customColumns,
        sheetData
      });
    } catch (error) {
      console.error("Error in /api/tables/:id/data:", error);
      // Get the data securely if possible using the user context
      const tableId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Try to get the table even if an error occurred earlier
      const table = await storage.getUserTable(tableId, userId);
      
      if (!table) {
        return res.status(404).json({ message: "Table not found" });
      }
      
      // Send a valid response with error information
      res.json({
        table,
        customColumns: await storage.getCustomColumns(tableId),
        sheetData: { 
          headers: ["Error"], 
          rows: [["An error occurred while fetching the data. Please try again."]]
        }
      });
    }
  });
  
  // Sync data from Google Sheet (with real-time notifications)
  app.post("/api/tables/:id/sync", verifyToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const tableId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Use user-specific table lookup
      const table = await storage.getUserTable(tableId, userId);
      
      if (!table) {
        return res.status(404).json({ message: "Table not found" });
      }
      
      // Fetch latest data (note: will never throw an error now)
      const sheetData = await fetchGoogleSheetData(table.googleSheetUrl);
      
      // Update the last updated timestamp
      const updatedTable = await storage.updateTable(tableId, { lastUpdatedAt: new Date() });
      
      // Get custom columns for the table
      const customColumns = await storage.getCustomColumns(tableId);
      
      // Notify all subscribers about the new data
      broadcastTableUpdate(tableId, { 
        message: "Data synced",
        timestamp: new Date(),
        sheetData,
        customColumns,
        table: updatedTable
      });
      
      res.json({ 
        success: true,
        table: updatedTable,
        sheetData,
        customColumns,
        lastUpdated: updatedTable?.lastUpdatedAt
      });
    } catch (error) {
      console.error("Error in /api/tables/:id/sync:", error);
      // Get data securely with the user context
      const tableId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Try to get the table even if an error occurred in sync
      const table = await storage.getUserTable(tableId, userId);
      
      if (!table) {
        return res.status(404).json({ message: "Table not found" });
      }
      
      // Even if there's an error, return a valid response
      res.json({ 
        success: false,
        message: "Data sync encountered an issue, but the application is still functioning",
        table,
        customColumns: await storage.getCustomColumns(tableId),
        sheetData: { 
          headers: ["Note"], 
          rows: [["Unable to sync with Google Sheets. Please check the URL and try again."]]
        }
      });
    }
  });
  
  // Update a table
  app.patch("/api/tables/:id", verifyToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const tableId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Use user-specific table lookup
      const table = await storage.getUserTable(tableId, userId);
      
      if (!table) {
        return res.status(404).json({ message: "Table not found" });
      }
      
      // Validate/sanitize the update data
      const updates: Partial<{name: string, googleSheetUrl: string}> = {};
      
      if (typeof req.body.name === 'string' && req.body.name.trim()) {
        updates.name = req.body.name.trim();
      }
      
      if (typeof req.body.googleSheetUrl === 'string' && req.body.googleSheetUrl.trim()) {
        // Validate Google Sheet URL
        const validUrl = req.body.googleSheetUrl.trim();
        const matches = validUrl.match(/[-\w]{25,}/);
        if (!matches) {
          return res.status(400).json({ message: "Invalid Google Sheet URL" });
        }
        
        // Check if this URL is different from the current one
        if (validUrl !== table.googleSheetUrl) {
          // Check if this user already has another table with this Google Sheet URL
          // First get all tables with this URL for this user
          const existingTables = await db.select()
            .from(tablesSchema)
            .where(
              and(
                eq(tablesSchema.userId, userId),
                eq(tablesSchema.googleSheetUrl, validUrl)
              )
            );
            
          // Then filter out the current table manually
          const otherTablesWithSameUrl = existingTables.filter(t => t.id !== tableId);
          
          if (otherTablesWithSameUrl.length > 0) {
            return res.status(400).json({ 
              message: "You already have another table using this Google Sheet URL. Please use a different Google Sheet." 
            });
          }
        }
        
        updates.googleSheetUrl = validUrl;
        
        // Try to fetch from the new sheet URL to validate it works
        try {
          await fetchGoogleSheetData(validUrl);
        } catch (error) {
          return res.status(400).json({ message: "Unable to access Google Sheet at the provided URL" });
        }
      }
      
      // Update the table
      const updatedTable = await storage.updateTable(tableId, updates);
      
      // Notify subscribers about the update
      broadcastTableUpdate(tableId, { 
        type: "tableUpdated",
        table: updatedTable,
        message: "Table details updated"
      });
      
      res.status(200).json(updatedTable);
    } catch (error) {
      res.status(500).json({ message: "Failed to update table", error });
    }
  });
  
  // Delete a table
  app.delete("/api/tables/:id", verifyToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const tableId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Use deleteUserTable instead of deleteTable to ensure
      // we delete only if the table belongs to this user
      const deleted = await storage.deleteUserTable(tableId, userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Table not found" });
      }
      
      // Notify subscribers that table was deleted
      broadcastTableUpdate(tableId, { 
        type: "tableDeleted",
        message: "Table was deleted"
      });
      
      // Clear subscriptions for this table
      tableSubscriptions.delete(tableId);
      
      res.status(200).json({ message: "Table deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete table", error });
    }
  });

  // Column Values Routes
  
  // Get all values for a column
  app.get("/api/columns/:columnId/values", verifyToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const columnId = parseInt(req.params.columnId);
      const userId = req.user.id;
      
      // Get the column to verify it exists
      const column = await storage.getUserCustomColumn(columnId, userId);
      
      if (!column) {
        return res.status(404).json({ message: "Column not found or you don't have access to it" });
      }
      
      // Get column values using user-specific method
      const columnValues = await storage.getUserColumnValues(columnId, userId);
      res.json(columnValues);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch column values", error });
    }
  });
  
  // Get a column value by column ID and row index
  app.get("/api/columns/:columnId/values/:rowIndex", verifyToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const columnId = parseInt(req.params.columnId, 10);
      const rowIndex = parseInt(req.params.rowIndex, 10);
      const userId = req.user.id;
      
      if (isNaN(columnId) || isNaN(rowIndex)) {
        return res.status(400).json({ error: "Invalid column ID or row index" });
      }
      
      // Validate column exists and belongs to a table the user has access to
      const column = await storage.getUserCustomColumn(columnId, userId);
      if (!column) {
        return res.status(404).json({ error: "Column not found or you don't have access to it" });
      }
      
      // Get the value for this column and row using the user-specific method
      const value = await storage.getUserColumnValue(columnId, rowIndex, userId);
      
      res.status(200).json(value || { columnId, rowIndex, value: "" });
    } catch (error) {
      console.error("Error fetching column value:", error);
      res.status(500).json({ error: "Failed to fetch column value" });
    }
  });
  
  // Save a column value
  app.post("/api/columns/values", verifyToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { columnId, rowIndex, value } = req.body;
      const userId = req.user.id;
      
      if (typeof columnId !== 'number' || typeof rowIndex !== 'number' || typeof value !== 'string') {
        return res.status(400).json({ message: "Invalid request data" });
      }
      
      // Verify column exists and user has access to it
      const column = await storage.getUserCustomColumn(columnId, userId);
      if (!column) {
        return res.status(404).json({ message: "Column not found or you don't have access to it" });
      }
      
      // Save the column value
      const columnValue = await storage.saveColumnValue({ columnId, rowIndex, value });
      
      // Broadcast update to subscribers
      const tableId = column.tableId;
      const table = await storage.getUserTable(tableId, userId);
      const customColumns = await storage.getCustomColumns(tableId);
      let sheetData;
      
      if (table && table.googleSheetUrl) {
        sheetData = await fetchGoogleSheetData(table.googleSheetUrl);
      }
      
      broadcastTableUpdate(tableId, {
        type: "columnValueUpdated",
        columnId,
        rowIndex,
        value,
        customColumns,
        sheetData
      });
      
      res.status(201).json(columnValue);
    } catch (error) {
      console.error("Error saving column value:", error);
      res.status(500).json({ message: "Failed to save column value", error });
    }
  });
  
  // Update a column value
  app.patch("/api/columns/values/:id", verifyToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const valueId = parseInt(req.params.id);
      const { value } = req.body;
      const userId = req.user.id;
      
      if (typeof value !== 'string') {
        return res.status(400).json({ message: "Invalid value" });
      }
      
      // We need to verify user has access to the column this value belongs to
      // First get the value
      const columnValue = await db.select()
        .from(columnValues)
        .where(eq(columnValues.id, valueId))
        .limit(1);
        
      if (!columnValue || columnValue.length === 0) {
        return res.status(404).json({ message: "Column value not found" });
      }
      
      // Then verify the user has access to this column
      const columnId = columnValue[0].columnId;
      const column = await storage.getUserCustomColumn(columnId, userId);
      
      if (!column) {
        return res.status(403).json({ message: "You don't have access to update this value" });
      }
      
      // Now we can update the value
      const updatedValue = await storage.updateColumnValue(valueId, value);
      
      if (!updatedValue) {
        return res.status(404).json({ message: "Column value not found" });
      }
      
      res.json(updatedValue);
    } catch (error) {
      res.status(500).json({ message: "Failed to update column value", error });
    }
  });
  
  // Delete a column value
  app.delete("/api/columns/values/:id", verifyToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const valueId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // We need to verify user has access to the column this value belongs to
      // First get the value
      const columnValue = await db.select()
        .from(columnValues)
        .where(eq(columnValues.id, valueId))
        .limit(1);
        
      if (!columnValue || columnValue.length === 0) {
        return res.status(404).json({ message: "Column value not found" });
      }
      
      // Then verify the user has access to this column
      const columnId = columnValue[0].columnId;
      const column = await storage.getUserCustomColumn(columnId, userId);
      
      if (!column) {
        return res.status(403).json({ message: "You don't have access to delete this value" });
      }
      
      // Now we can delete the value
      const deleted = await storage.deleteColumnValue(valueId);
      
      res.json({ success: deleted });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete column value", error });
    }
  });

  return httpServer;
}
