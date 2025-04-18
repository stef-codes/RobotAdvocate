import { useState } from "react";
import UploadBox from "@/components/UploadBox";
import SessionDocuments from "@/components/SessionDocuments";
import { useDocuments } from "@/hooks/useDocuments";

export default function Home() {
  const { documents, isLoading } = useDocuments();
  const [uploading, setUploading] = useState(false);

  return (
    <div>
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
          AI-Powered Legal Document Analysis
        </h2>
        <p className="text-xl text-gray-600">
          Upload your legal document and get a clear, concise summary in minutes. Save hours of review time.
        </p>
      </div>

      <UploadBox
        uploading={uploading}
        setUploading={setUploading}
      />

      <SessionDocuments 
        documents={documents || []} 
        isLoading={isLoading} 
      />
    </div>
  );
}
