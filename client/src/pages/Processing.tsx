import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useDocumentDetails } from "@/hooks/useDocuments";
import { queryClient } from "@/lib/queryClient";

export default function Processing() {
  const [match, params] = useRoute("/processing/:id");
  const [, setLocation] = useLocation();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Extracting document text");

  const documentId = match ? parseInt(params.id) : null;
  const { data: document, isLoading, isError } = useDocumentDetails(documentId);

  // Handle redirection and simulated progress
  useEffect(() => {
    if (!match) {
      setLocation("/");
      return;
    }

    if (document?.isProcessed) {
      setLocation(`/summary/${params.id}`);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 5;

        if (next === 25) setStatus("Analyzing document structure");
        if (next === 50) setStatus("Identifying key information");
        if (next === 75) setStatus("Generating summary");

        if (next >= 100) clearInterval(interval);

        return Math.min(next, 100);
      });
    }, 800);

    return () => clearInterval(interval);
  }, [match, document?.isProcessed, params.id, setLocation]);

  // Polling for document status
  useEffect(() => {
    if (!match || document?.isProcessed) return;

    const checkStatus = setInterval(() => {
      queryClient.invalidateQueries({
        queryKey: [`/api/documents/${params.id}`],
      });
    }, 2000);

    return () => clearInterval(checkStatus);
  }, [match, params.id, document?.isProcessed]);

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-t-4 border-primary"></div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Document</h2>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Document</h2>
        <p className="text-gray-600 mb-4">There was a problem accessing the document.</p>
        <button 
          onClick={() => setLocation("/")}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-700"
        >
          Return Home
        </button>
      </div>
    );
  }

  // Processing state
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <div className="mx-auto h-16 w-16 animate-spin rounded-full border-t-4 border-primary"></div>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Your Document</h2>
      <p className="text-gray-600 mb-2">
        We're using AI to extract and analyze the key information.
      </p>
      <p className="text-gray-500 text-sm mb-4">
        This may take a minute or two depending on document length and complexity.
      </p>

      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div
          className="bg-primary h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="text-left bg-gray-50 rounded-lg p-4 border border-gray-200">
        <p className="font-medium text-gray-700 mb-2">Current step:</p>
        <p className="text-gray-600 loading-dots after:content-['.'] after:animate-dots">
          {status}
        </p>
      </div>
    </div>
  );
}
