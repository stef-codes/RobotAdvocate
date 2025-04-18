import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import { z } from "zod";
import { insertDocumentSchema } from "@shared/schema";
import { extractTextFromDocument } from "./utils/documentProcessor";
import { generateDocumentSummary } from "./utils/openai";
import fs from "fs";
import session from "express-session";
import MemoryStore from "memorystore";
import { fileURLToPath } from "url";

// The maximum file size (25MB)
const MAX_FILE_SIZE = 25 * 1024 * 1024;

// Configure multer for file upload
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // Create temp directory if it doesn't exist
      const tempDir = path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        "..",
        "temp"
      );
      
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      cb(null, tempDir);
    },
    filename: (req, file, cb) => {
      // Generate unique filename
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: (req, file, cb) => {
    // Only accept PDF and DOCX files
    const allowedFileTypes = [".pdf", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedFileTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and DOCX files are allowed"));
    }
  }
});

const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || "robot-lawyer-secret",
    resave: false,
    saveUninitialized: true,
    cookie: { 
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    store: new SessionStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    })
  }));

  // Document upload endpoint
  app.post("/api/documents/upload", upload.single("file"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Get session ID
      const sessionId = req.session.id;

      // Convert file size to number
      const fileSize = req.file.size;
      
      // Create document record
      const documentData = {
        sessionId,
        fileName: req.file.originalname,
        fileType: path.extname(req.file.originalname).substring(1),
        fileSize,
        uploadedAt: new Date()
      };

      // Validate document data
      const validatedData = insertDocumentSchema.parse(documentData);
      
      // Save document to storage
      const document = await storage.createDocument(validatedData);
      
      // Return document ID
      res.status(201).json({ 
        id: document.id,
        fileName: document.fileName,
        fileSize: document.fileSize,
        fileType: document.fileType,
        uploadedAt: document.uploadedAt
      });

      // Process document asynchronously
      processDocument(document.id, req.file.path);
      
    } catch (error) {
      console.error("Error uploading document:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid document data", errors: error.errors });
      }
      
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  // Get documents for current session
  app.get("/api/documents", async (req: Request, res: Response) => {
    try {
      const sessionId = req.session.id;
      const documents = await storage.getDocumentsBySession(sessionId);
      
      res.json(documents.map(doc => ({
        id: doc.id,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        fileType: doc.fileType,
        uploadedAt: doc.uploadedAt,
        processedAt: doc.processedAt,
        isProcessed: !!doc.processedAt
      })));
    } catch (error) {
      console.error("Error retrieving documents:", error);
      res.status(500).json({ message: "Failed to retrieve documents" });
    }
  });

  // Get document by ID
  app.get("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      const documentId = parseInt(req.params.id);
      
      if (isNaN(documentId)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Check if document belongs to current session
      if (document.sessionId !== req.session.id) {
        return res.status(403).json({ message: "Unauthorized access to document" });
      }
      
      res.json({
        id: document.id,
        fileName: document.fileName,
        fileSize: document.fileSize,
        fileType: document.fileType,
        uploadedAt: document.uploadedAt,
        processedAt: document.processedAt,
        summary: document.summary,
        isProcessed: !!document.processedAt
      });
    } catch (error) {
      console.error("Error retrieving document:", error);
      res.status(500).json({ message: "Failed to retrieve document" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // Setup cleanup job for expired documents
  const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour
  const DOCUMENT_EXPIRY_TIME = 24; // 24 hours
  
  setInterval(async () => {
    try {
      const count = await storage.deleteExpiredDocuments(DOCUMENT_EXPIRY_TIME);
      if (count > 0) {
        console.log(`Cleaned up ${count} expired documents`);
      }
    } catch (error) {
      console.error("Error cleaning up expired documents:", error);
    }
  }, CLEANUP_INTERVAL);

  return httpServer;
}

// Helper function to process document asynchronously
async function processDocument(documentId: number, filePath: string): Promise<void> {
  try {
    console.log(`Started processing document ${documentId} at ${filePath}`);
    
    // Get document from storage
    const document = await storage.getDocument(documentId);
    
    if (!document) {
      console.error(`Document ${documentId} not found`);
      return;
    }
    
    console.log(`Processing document: ${document.fileName} (${document.fileType})`);
    
    // Extract text from document
    console.log(`Extracting text from ${filePath}`);
    const extractedText = await extractTextFromDocument(filePath, document.fileType);
    console.log(`Extracted ${extractedText.length} characters of text`);
    
    // Update document with extracted text
    await storage.updateDocument(documentId, {
      originalText: extractedText
    });
    console.log(`Updated document ${documentId} with extracted text`);
    
    // Generate summary using OpenAI
    console.log(`Generating summary using OpenAI...`);
    const summary = await generateDocumentSummary(extractedText);
    console.log(`Summary generated successfully:`, JSON.stringify(summary).substring(0, 200) + '...');
    
    // Update document with summary
    await storage.updateDocument(documentId, {
      processedAt: new Date(),
      summary
    });
    console.log(`Updated document ${documentId} with summary and marked as processed`);
    
    // Delete temporary file
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error deleting temporary file ${filePath}:`, err);
      } else {
        console.log(`Deleted temporary file ${filePath}`);
      }
    });
    
    console.log(`Completed processing document ${documentId}`);
  } catch (error) {
    console.error(`Error processing document ${documentId}:`, error);
  }
}
