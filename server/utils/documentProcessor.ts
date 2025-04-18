import fs from 'fs/promises';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { promisify } from 'util';

/**
 * Extracts text from a document file (PDF or DOCX)
 * @param filePath Path to the document file
 * @param fileType Type of the file (pdf or docx)
 * @returns Extracted text
 */
export async function extractTextFromDocument(filePath: string, fileType: string): Promise<string> {
  try {
    if (fileType.toLowerCase() === 'pdf') {
      return await extractTextFromPdf(filePath);
    } else if (fileType.toLowerCase() === 'docx') {
      return await extractTextFromDocx(filePath);
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error) {
    console.error('Error extracting text from document:', error);
    throw new Error(`Failed to extract text from document: ${error.message}`);
  }
}

/**
 * Extracts text from a PDF file
 * @param filePath Path to the PDF file
 * @returns Extracted text
 */
async function extractTextFromPdf(filePath: string): Promise<string> {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);
    
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

/**
 * Extracts text from a DOCX file
 * @param filePath Path to the DOCX file
 * @returns Extracted text
 */
async function extractTextFromDocx(filePath: string): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error(`Failed to extract text from DOCX: ${error.message}`);
  }
}
