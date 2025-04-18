import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { Document } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

interface SessionDocumentsProps {
  documents: Document[];
  isLoading: boolean;
}

export default function SessionDocuments({ documents, isLoading }: SessionDocumentsProps) {
  const [, setLocation] = useLocation();

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const documentDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - documentDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  const handleDocumentClick = (id: number, isProcessed: boolean) => {
    if (isProcessed) {
      setLocation(`/summary/${id}`);
    } else {
      setLocation(`/processing/${id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto mt-12">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Documents (Current Session)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i} className="shadow-md">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-3">
                    <Skeleton className="h-8 w-8 rounded" />
                    <div>
                      <Skeleton className="h-5 w-40 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="max-w-5xl mx-auto mt-12">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Documents (Current Session)</h3>
        <Card className="shadow-md p-6 text-center">
          <p className="text-gray-500">No documents uploaded in the current session.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-12">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Documents (Current Session)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => (
          <div 
            key={doc.id}
            className="document-card bg-white rounded-lg shadow-md p-4 cursor-pointer"
            onClick={() => handleDocumentClick(doc.id, doc.isProcessed)}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <h4 className="font-medium text-gray-900">{doc.fileName}</h4>
                  <p className="text-sm text-gray-500">
                    Uploaded {formatTimeAgo(doc.uploadedAt)}
                  </p>
                </div>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  doc.isProcessed
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {doc.isProcessed ? "Processed" : "Processing"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
