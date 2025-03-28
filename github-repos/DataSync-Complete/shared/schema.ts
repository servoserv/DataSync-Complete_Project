import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("firstName"),
  lastName: text("lastName"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firstName: true,
  lastName: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const tables = pgTable("tables", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  name: text("name").notNull(),
  googleSheetUrl: text("googleSheetUrl").notNull(),
  columns: jsonb("columns").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastUpdatedAt: timestamp("lastUpdatedAt").defaultNow(),
});

export const insertTableSchema = createInsertSchema(tables).pick({
  userId: true,
  name: true,
  googleSheetUrl: true,
  columns: true,
});

export const customColumns = pgTable("customColumns", {
  id: serial("id").primaryKey(),
  tableId: integer("tableId").notNull().references(() => tables.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'text' or 'date'
  createdAt: timestamp("createdAt").defaultNow(),
});

export const insertCustomColumnSchema = createInsertSchema(customColumns).pick({
  tableId: true,
  name: true,
  type: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;
export type User = typeof users.$inferSelect;
export type InsertTable = z.infer<typeof insertTableSchema>;
export type Table = typeof tables.$inferSelect;
export type InsertCustomColumn = z.infer<typeof insertCustomColumnSchema>;
export type CustomColumn = typeof customColumns.$inferSelect;

// For Google Sheet data type
// For custom column values
export const columnValues = pgTable("columnValues", {
  id: serial("id").primaryKey(),
  columnId: integer("columnId").notNull().references(() => customColumns.id),
  rowIndex: integer("rowIndex").notNull(), // The index of the row in the Google Sheet data
  value: text("value").notNull(), // The value stored for this cell
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const insertColumnValueSchema = createInsertSchema(columnValues).pick({
  columnId: true,
  rowIndex: true,
  value: true,
});

export type InsertColumnValue = z.infer<typeof insertColumnValueSchema>;
export type ColumnValue = typeof columnValues.$inferSelect;

export type SheetData = {
  headers: string[];
  rows: string[][];
};
