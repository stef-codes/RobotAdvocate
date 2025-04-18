import { DocumentSummary } from "@shared/schema";

export interface Document {
  id: number;
  sessionId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  processedAt: string | null;
  summary: DocumentSummary | null;
  isProcessed: boolean;
  processingError?: string | null;
}

export interface UploadResponse {
  id: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
}
