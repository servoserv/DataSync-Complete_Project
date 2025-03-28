import { 
  users, tables, customColumns, columnValues,
  type User, type InsertUser, type Table, type InsertTable, 
  type CustomColumn, type InsertCustomColumn,
  type ColumnValue, type InsertColumnValue
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and } from "drizzle-orm";

const PostgresSessionStore = connectPg(session);

// Modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Table operations
  getTables(userId: number): Promise<Table[]>;
  getTable(id: number): Promise<Table | undefined>;
  getUserTable(id: number, userId: number): Promise<Table | undefined>;
  createTable(table: InsertTable): Promise<Table>;
  updateTable(id: number, table: Partial<Table>): Promise<Table | undefined>;
  deleteTable(id: number): Promise<boolean>;
  deleteUserTable(id: number, userId: number): Promise<boolean>;
  
  // Custom column operations
  getCustomColumns(tableId: number): Promise<CustomColumn[]>;
  getCustomColumn(id: number): Promise<CustomColumn | undefined>;
  getUserCustomColumn(id: number, userId: number): Promise<CustomColumn | undefined>;
  createCustomColumn(column: InsertCustomColumn): Promise<CustomColumn>;
  
  // Column values operations
  getColumnValues(columnId: number): Promise<ColumnValue[]>;
  getUserColumnValues(columnId: number, userId: number): Promise<ColumnValue[]>;
  getColumnValue(columnId: number, rowIndex: number): Promise<ColumnValue | undefined>;
  getUserColumnValue(columnId: number, rowIndex: number, userId: number): Promise<ColumnValue | undefined>;
  saveColumnValue(columnValue: InsertColumnValue): Promise<ColumnValue>;
  updateColumnValue(id: number, value: string): Promise<ColumnValue | undefined>;
  deleteColumnValue(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.Store;
}

// Create PostgreSQL client
const connectionString = process.env.DATABASE_URL || "";
const client = postgres(connectionString);
export const db = drizzle(client);

export class PostgresStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // Initialize PostgreSQL session store
    this.sessionStore = new PostgresSessionStore({
      conString: connectionString,
      createTableIfMissing: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const createdAt = new Date();
    
    // Ensure firstName and lastName are either string or null (not undefined)
    const firstName = insertUser.firstName ?? null;
    const lastName = insertUser.lastName ?? null;
    
    const result = await db.insert(users).values({
      ...insertUser,
      createdAt,
      firstName,
      lastName
    }).returning();
    
    return result[0];
  }

  // Table methods
  async getTables(userId: number): Promise<Table[]> {
    return await db.select().from(tables).where(eq(tables.userId, userId));
  }

  async getTable(id: number): Promise<Table | undefined> {
    const result = await db.select().from(tables).where(eq(tables.id, id)).limit(1);
    return result[0];
  }
  
  // Get a table only if it belongs to the specified user
  async getUserTable(id: number, userId: number): Promise<Table | undefined> {
    const result = await db.select()
      .from(tables)
      .where(
        and(
          eq(tables.id, id),
          eq(tables.userId, userId)
        )
      )
      .limit(1);
    return result[0];
  }

  async createTable(insertTable: InsertTable): Promise<Table> {
    const createdAt = new Date();
    const lastUpdatedAt = new Date();
    
    // Check if this user already has a table with this URL
    const existingTable = await db.select()
      .from(tables)
      .where(
        and(
          eq(tables.googleSheetUrl, insertTable.googleSheetUrl),
          eq(tables.userId, insertTable.userId)
        )
      )
      .limit(1);
    
    // If the user already has a table with this URL, throw an error
    if (existingTable.length > 0) {
      throw new Error("You already have a table connected to this Google Sheet");
    }
    
    const result = await db.insert(tables).values({
      ...insertTable,
      createdAt,
      lastUpdatedAt
    }).returning();
    
    return result[0];
  }

  async updateTable(id: number, tableData: Partial<Table>): Promise<Table | undefined> {
    const lastUpdatedAt = new Date();
    
    const result = await db.update(tables)
      .set({
        ...tableData,
        lastUpdatedAt
      })
      .where(eq(tables.id, id))
      .returning();
    
    return result[0];
  }

  async deleteTable(id: number): Promise<boolean> {
    // First delete custom columns (and their values will cascade delete)
    const columns = await this.getCustomColumns(id);
    for (const column of columns) {
      // Delete column values first (explicit delete to ensure proper cleanup)
      await db.delete(columnValues).where(eq(columnValues.columnId, column.id));
    }
    
    // Then delete the custom columns
    if (columns.length > 0) {
      await db.delete(customColumns).where(eq(customColumns.tableId, id));
    }
    
    // Finally delete the table
    const result = await db.delete(tables).where(eq(tables.id, id));
    return result.count > 0;
  }
  
  // Delete a table only if it belongs to the specified user
  async deleteUserTable(id: number, userId: number): Promise<boolean> {
    // First check if the table exists and belongs to the user
    const table = await this.getUserTable(id, userId);
    if (!table) {
      return false;
    }
    
    // If it does, delete it
    return this.deleteTable(id);
  }

  // Custom column methods
  async getCustomColumns(tableId: number): Promise<CustomColumn[]> {
    return await db.select().from(customColumns).where(eq(customColumns.tableId, tableId));
  }
  
  async getCustomColumn(id: number): Promise<CustomColumn | undefined> {
    const result = await db.select().from(customColumns).where(eq(customColumns.id, id)).limit(1);
    return result[0];
  }
  
  // Get a custom column only if it belongs to a table owned by the specified user
  async getUserCustomColumn(id: number, userId: number): Promise<CustomColumn | undefined> {
    const result = await db
      .select({
        column: customColumns,
        table: tables
      })
      .from(customColumns)
      .innerJoin(tables, eq(customColumns.tableId, tables.id))
      .where(
        and(
          eq(customColumns.id, id),
          eq(tables.userId, userId)
        )
      )
      .limit(1);
    
    return result[0]?.column;
  }

  async createCustomColumn(insertColumn: InsertCustomColumn): Promise<CustomColumn> {
    const createdAt = new Date();
    
    const result = await db.insert(customColumns).values({
      ...insertColumn,
      createdAt
    }).returning();
    
    return result[0];
  }

  // Column values methods
  async getColumnValues(columnId: number): Promise<ColumnValue[]> {
    return await db.select()
      .from(columnValues)
      .where(eq(columnValues.columnId, columnId));
  }
  
  // Get column values only if they belong to a column in a table owned by the specified user
  async getUserColumnValues(columnId: number, userId: number): Promise<ColumnValue[]> {
    const result = await db
      .select({
        columnValue: columnValues,
      })
      .from(columnValues)
      .innerJoin(customColumns, eq(columnValues.columnId, customColumns.id))
      .innerJoin(tables, eq(customColumns.tableId, tables.id))
      .where(
        and(
          eq(columnValues.columnId, columnId),
          eq(tables.userId, userId)
        )
      );
    
    return result.map(r => r.columnValue);
  }

  async getColumnValue(columnId: number, rowIndex: number): Promise<ColumnValue | undefined> {
    const result = await db.select()
      .from(columnValues)
      .where(
        and(
          eq(columnValues.columnId, columnId),
          eq(columnValues.rowIndex, rowIndex)
        )
      )
      .limit(1);
    return result[0];
  }
  
  // Get a column value only if it belongs to a column in a table owned by the specified user
  async getUserColumnValue(columnId: number, rowIndex: number, userId: number): Promise<ColumnValue | undefined> {
    const result = await db
      .select({
        columnValue: columnValues,
      })
      .from(columnValues)
      .innerJoin(customColumns, eq(columnValues.columnId, customColumns.id))
      .innerJoin(tables, eq(customColumns.tableId, tables.id))
      .where(
        and(
          eq(columnValues.columnId, columnId),
          eq(columnValues.rowIndex, rowIndex),
          eq(tables.userId, userId)
        )
      )
      .limit(1);
    
    return result[0]?.columnValue;
  }

  async saveColumnValue(insertColumnValue: InsertColumnValue): Promise<ColumnValue> {
    const createdAt = new Date();
    const updatedAt = new Date();
    
    // Check if a value already exists for this column and row
    const existingValue = await this.getColumnValue(
      insertColumnValue.columnId,
      insertColumnValue.rowIndex
    );
    
    if (existingValue) {
      // Update the existing value
      const result = await db.update(columnValues)
        .set({
          value: insertColumnValue.value,
          updatedAt
        })
        .where(eq(columnValues.id, existingValue.id))
        .returning();
      return result[0];
    } else {
      // Create a new value
      const result = await db.insert(columnValues)
        .values({
          ...insertColumnValue,
          createdAt,
          updatedAt
        })
        .returning();
      return result[0];
    }
  }

  async updateColumnValue(id: number, value: string): Promise<ColumnValue | undefined> {
    const updatedAt = new Date();
    
    const result = await db.update(columnValues)
      .set({
        value,
        updatedAt
      })
      .where(eq(columnValues.id, id))
      .returning();
    
    return result[0];
  }

  async deleteColumnValue(id: number): Promise<boolean> {
    const result = await db.delete(columnValues)
      .where(eq(columnValues.id, id));
    return result !== undefined;
  }
}

export const storage = new PostgresStorage();
