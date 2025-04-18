import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useDocumentDetails } from "@/hooks/useDocuments";

export default function Processing() {
  const [match, params] = useRoute("/processing/:id");
  const [, setLocation] = useLocation();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Extracting document text");
  
  const { data: document, isLoading, isError } = useDocumentDetails(
    match ? parseInt(params.id) : null
  );

  useEffect(() => {
    if (!match) {
      setLocation("/");
      return;
    }

    // If the document is already processed, redirect to summary
    if (document && document.isProcessed) {
      setLocation(`/summary/${params.id}`);
      return;
    }

    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 5;
        
        // Update status text based on progress
        if (newProgress === 25) {
          setStatus("Analyzing document structure");
        } else if (newProgress === 50) {
          setStatus("Identifying key information");
        } else if (newProgress === 75) {
          setStatus("Generating summary");
        }
        
        // If progress is at 100%, end the interval
        if (newProgress >= 100) {
          clearInterval(interval);
        }
        
        return Math.min(newProgress, 100);
      });
    }, 800);

    return () => {
      clearInterval(interval);
    };
  }, [match, document, params.id, setLocation]);

  // Check for document status every 2 seconds
  useEffect(() => {
    if (!match) return;

    const checkStatus = setInterval(() => {
      // Force refetch document data
      queryClient.invalidateQueries({
        queryKey: [`/api/documents/${params.id}`]
      });
    }, 2000);

    return () => {
      clearInterval(checkStatus);
    };
  }, [match, params.id]);

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

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <div className="mx-auto h-16 w-16 animate-spin rounded-full border-t-4 border-primary"></div>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Your Document</h2>
      <p className="text-gray-600 mb-2">We're using AI to extract and analyze the key information.</p>
      <p className="text-gray-500 text-sm mb-4">This may take a minute or two depending on document length and complexity.</p>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div 
          className="bg-primary h-2.5 rounded-full transition-all duration-500" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="text-left bg-gray-50 rounded-lg p-4 border border-gray-200">
        <p className="font-medium text-gray-700 mb-2">Current step:</p>
        <p className="text-gray-600 loading-dots after:content-['.'] after:animate-dots">{status}</p>
      </div>
    </div>
  );
}

import { queryClient } from "@/lib/queryClient";
