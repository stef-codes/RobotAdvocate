import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Keep the users table for reference
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Document table definition
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  originalText: text("original_text"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
  summary: json("summary").$type<DocumentSummary>(),
});

// Summary structure
export interface DocumentSummary {
  parties: Party[];
  obligations: string[];
  dates: DateItem[];
  terms: Term[];
  risks: Risk[];
  raw: string;
}

export interface Party {
  name: string;
  role: string;
}

export interface DateItem {
  event: string;
  date: string;
}

export interface Term {
  title: string;
  description: string;
}

export interface Risk {
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
}

// Insert schema
export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  processedAt: true,
  summary: true,
});

export const updateDocumentSchema = z.object({
  originalText: z.string().optional(),
  processedAt: z.date().optional(),
  summary: z.any().optional(),
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type UpdateDocument = z.infer<typeof updateDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});
