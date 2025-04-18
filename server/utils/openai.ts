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
    console.log("Starting OpenAI document summary generation");
    
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is not configured");
      throw new Error("OpenAI API key is not configured");
    }
    
    console.log(`API Key available: ${process.env.OPENAI_API_KEY ? "Yes" : "No"}`);
    console.log(`Document text length: ${documentText.length} characters`);
    
    // Trim document text if it's too long (tokens limit)
    const maxTextLength = 15000; // Approximately 4000 tokens
    const trimmedText = documentText.length > maxTextLength 
      ? documentText.substring(0, maxTextLength) + "... [text truncated for API limits]" 
      : documentText;
    
    console.log(`Using trimmed text length: ${trimmedText.length} characters`);
    console.log(`First 100 chars of text: ${trimmedText.substring(0, 100)}...`);

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

    console.log("Preparing to send request to OpenAI API");
    
    // Send request to OpenAI API
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    console.log("Sending request to OpenAI with model: gpt-4o");
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: trimmedText }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2, // Lower temperature for more focused, less creative response
      max_tokens: 2048 // Limit response length
    });
    
    console.log("Received response from OpenAI API");
    console.log(`Response status: ${response.choices.length > 0 ? "Has choices" : "No choices"}`);
    
    if (response.choices.length === 0) {
      throw new Error("OpenAI API returned empty response");
    }

    // Parse and return the generated summary
    const summaryText = response.choices[0].message.content;
    console.log(`Raw response text: ${summaryText.substring(0, 200)}...`);
    
    console.log("Parsing JSON response");
    const summary = JSON.parse(summaryText) as DocumentSummary;
    console.log("Successfully parsed JSON response");
    
    return summary;
  } catch (error) {
    console.error("Error generating document summary:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    
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
