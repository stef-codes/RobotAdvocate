import { documents, type Document, type InsertDocument, type UpdateDocument, users, type User, type InsertUser } from "@shared/schema";
import { nanoid } from "nanoid";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods (keeping for reference)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Document methods
  createDocument(document: InsertDocument): Promise<Document>;
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentsBySession(sessionId: string): Promise<Document[]>;
  updateDocument(id: number, updates: UpdateDocument): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  deleteExpiredDocuments(expiryTimeInHours: number): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private documents: Map<number, Document>;
  currentUserId: number;
  currentDocumentId: number;

  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.currentUserId = 1;
    this.currentDocumentId = 1;
  }

  // User methods

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Document methods

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.currentDocumentId++;
    const document: Document = { 
      ...insertDocument, 
      id,
      processedAt: null,
      summary: null
    };
    this.documents.set(id, document);
    return document;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getDocumentsBySession(sessionId: string): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      doc => doc.sessionId === sessionId
    ).sort((a, b) => {
      // Sort by uploadedAt in descending order (newest first)
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });
  }

  async updateDocument(id: number, updates: UpdateDocument): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (!document) return undefined;

    const updatedDocument = { ...document, ...updates };
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }

  async deleteExpiredDocuments(expiryTimeInHours: number): Promise<number> {
    const now = new Date();
    const expiryTimeMs = expiryTimeInHours * 60 * 60 * 1000;
    let count = 0;

    for (const [id, doc] of this.documents.entries()) {
      const uploadTime = new Date(doc.uploadedAt).getTime();
      if (now.getTime() - uploadTime > expiryTimeMs) {
        this.documents.delete(id);
        count++;
      }
    }

    return count;
  }
}

export const storage = new MemStorage();
