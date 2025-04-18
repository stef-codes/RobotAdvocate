import { useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useDocumentDetails } from "@/hooks/useDocuments";
import DocumentSummary from "@/components/DocumentSummary";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ClipboardCopy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generatePdf } from "@/lib/api";

export default function Summary() {
  const [match, params] = useRoute("/summary/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: document, isLoading, isError } = useDocumentDetails(
    match ? parseInt(params?.id) : null
  );

  useEffect(() => {
    if (!match) {
      setLocation("/");
      return;
    }

    // If the document is not processed yet, redirect to processing
    if (document && !document.isProcessed && params?.id) {
      setLocation(`/processing/${params.id}`);
    }
  }, [match, document, params?.id, setLocation]);

  // Function to copy summary to clipboard
  const copyToClipboard = () => {
    if (!document || !document.summary) return;

    const summaryText = document.summary.raw;
    navigator.clipboard.writeText(summaryText)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: "The summary has been copied to your clipboard.",
        });
      })
      .catch(err => {
        toast({
          title: "Copy failed",
          description: "Failed to copy to clipboard: " + err.message,
          variant: "destructive",
        });
      });
  };

  // Function to export summary as PDF
  const exportPdf = async () => {
    if (!document || !document.summary) return;

    try {
      await generatePdf(document);
      toast({
        title: "PDF Export Started",
        description: "Your PDF is being downloaded.",
      });
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Export Failed",
          description: "Failed to export as PDF: " + error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Export Failed",
          description: "Failed to export as PDF due to an unknown error.",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="mb-8">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-t-4 border-primary"></div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Summary</h2>
      </div>
    );
  }

  if (isError || !document) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Summary</h2>
        <p className="text-gray-600 mb-4">There was a problem accessing the document summary.</p>
        <Button onClick={() => setLocation("/")}>
          Return Home
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {document.fileName}
          </h2>
          <p className="text-gray-500 text-sm">
            Processed on {new Date(document.processedAt || document.uploadedAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-wrap mt-4 md:mt-0 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={copyToClipboard}
            className="flex items-center"
          >
            <ClipboardCopy className="h-4 w-4 mr-2" />
            Copy to Clipboard
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportPdf}
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export as PDF
          </Button>
          <Button 
            size="sm" 
            onClick={() => setLocation("/")}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Upload Another Document
          </Button>
        </div>
      </div>

      <DocumentSummary document={document} />
    </div>
  );
}
