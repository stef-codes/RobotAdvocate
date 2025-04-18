import { useState, ChangeEvent, useRef } from "react";
import { Upload, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { uploadDocument } from "@/lib/api";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";

interface UploadBoxProps {
  uploading: boolean;
  setUploading: (uploading: boolean) => void;
}

export default function UploadBox({ uploading, setUploading }: UploadBoxProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Maximum file size is 25MB.",
        variant: "destructive",
      });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Validate file type
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt || !['pdf', 'docx'].includes(fileExt)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or DOCX file.",
        variant: "destructive",
      });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setSelectedFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await uploadDocument(formData);
      
      toast({
        title: "Upload successful",
        description: "Your document has been uploaded and is being processed.",
      });
      
      // Refresh the documents list
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      
      // Redirect to processing page
      setLocation(`/processing/${response.id}`);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error.message || "An error occurred while uploading the document.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden border-2 border-dashed border-gray-300 p-8 text-center">
      <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Legal Document</h3>
      <p className="text-gray-500 mb-6">Supports PDF and DOCX formats (max 25MB)</p>
      
      <div className="flex justify-center items-center space-x-4">
        <Button
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          Choose File
          <input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            accept=".pdf,.docx"
            className="sr-only"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </Button>
        <Button
          disabled={!selectedFile || uploading}
          onClick={handleUpload}
          className="inline-flex items-center"
        >
          {uploading ? 'Uploading...' : 'Upload Document'}
        </Button>
      </div>
      
      {selectedFile && (
        <div className="mt-4 text-gray-600">
          <div className="flex items-center justify-center space-x-2">
            <File className="h-5 w-5 text-gray-500" />
            <span>{selectedFile.name}</span>
            <button
              onClick={removeFile}
              className="text-red-600 hover:text-red-800 focus:outline-none"
              disabled={uploading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
