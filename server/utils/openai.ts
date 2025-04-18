import OpenAI from "openai";
import { DocumentSummary } from "@shared/schema";

// Initialize OpenAI client with API key from environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

/**
 * Generates a summary of a legal document using OpenAI API
 * @param documentText The text content of the document to summarize
 * @returns A structured summary of the document
 */
export async function generateDocumentSummary(documentText: string): Promise<DocumentSummary> {
  try {
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured");
    }

    // Create a system prompt that explains how to analyze legal documents
    const systemPrompt = `
      You are a legal analysis expert specialized in summarizing legal documents.
      Analyze the provided legal document and extract the following key information:
      
      1. Parties: List all parties involved in the document, with their roles (e.g., "Client", "Service Provider").
      2. Main Obligations: Summarize the primary obligations of each party.
      3. Important Dates: Identify all critical dates mentioned in the document, such as effective date, termination date, payment dates, etc.
      4. Key Terms: Extract crucial contract terms like payment terms, intellectual property clauses, confidentiality provisions, etc.
      5. Potential Risks: Identify potential risks or concerns in the document, with a severity level (high, medium, or low).
      
      Format your response as a JSON object with the following structure:
      {
        "parties": [{"name": string, "role": string}],
        "obligations": [string],
        "dates": [{"event": string, "date": string}],
        "terms": [{"title": string, "description": string}],
        "risks": [{"title": string, "description": string, "severity": "high" | "medium" | "low"}],
        "raw": string  // A raw text summary of the document
      }
      
      Keep the summary concise but comprehensive, highlighting only the most important elements.
    `;

    // Send request to OpenAI API
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: documentText }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2, // Lower temperature for more focused, less creative response
      max_tokens: 2048 // Limit response length
    });

    // Parse and return the generated summary
    const summaryText = response.choices[0].message.content;
    const summary = JSON.parse(summaryText) as DocumentSummary;
    
    return summary;
  } catch (error) {
    console.error("Error generating document summary:", error);
    
    // Return a basic summary structure with error information
    return {
      parties: [],
      obligations: ["Error: Failed to analyze document"],
      dates: [],
      terms: [],
      risks: [{
        title: "Analysis Error",
        description: `Failed to analyze document: ${error.message}`,
        severity: "high"
      }],
      raw: "Failed to generate summary due to an error."
    };
  }
}
