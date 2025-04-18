import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Document } from "@/lib/types";

/**
 * Hook to fetch all documents for the current session
 */
export function useDocuments() {
  return useQuery<Document[]>({
    queryKey: ['/api/documents'],
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Hook to fetch a specific document by ID
 * @param id Document ID to fetch
 */
export function useDocumentDetails(id: number | null) {
  return useQuery<Document>({
    queryKey: [`/api/documents/${id}`],
    enabled: id !== null,
    refetchInterval: (data) => {
      // If the document is still processing, poll every 2 seconds
      return !data?.isProcessed ? 2000 : false;
    },
  });
}
