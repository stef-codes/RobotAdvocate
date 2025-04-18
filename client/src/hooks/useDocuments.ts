import { useQuery, Query, QueryKey } from "@tanstack/react-query";
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
    refetchInterval: (query: Query<Document, Error, Document, QueryKey>) => {
  const data = query.state.data;
  return data && !data.isProcessed ? 4000 : false;
},
    staleTime: 0, // Force data to be stale immediately
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnMount: true, // Refetch on mount if needed
  });
}
