import { Document } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { AlertTriangle } from "lucide-react";

interface DocumentSummaryProps {
  document: Document;
}

export default function DocumentSummary({ document }: DocumentSummaryProps) {
  const summary = document.summary;

  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Document Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <p className="text-gray-500">Summary not available for this document.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow rounded-lg overflow-hidden">
      <CardHeader className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <CardTitle className="text-lg font-medium text-gray-900">Document Summary</CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="prose max-w-none">
          {/* Key Parties */}
          {summary.parties && summary.parties.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Key Parties</h4>
              <div className="bg-blue-50 rounded-lg p-4">
                <ul className="list-disc pl-5 space-y-1">
                  {summary.parties.map((party, index) => (
                    <li key={index}>
                      <strong>{party.role}:</strong> {party.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {/* Main Obligations */}
          {summary.obligations && summary.obligations.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Main Obligations</h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                {summary.obligations.map((obligation, index) => (
                  <li key={index}>{obligation}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Important Dates */}
          {summary.dates && summary.dates.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Important Dates</h4>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary.dates.map((date, index) => (
                      <TableRow key={index}>
                        <TableCell className="py-4 whitespace-nowrap text-sm text-gray-700">
                          {date.event}
                        </TableCell>
                        <TableCell className="py-4 whitespace-nowrap text-sm text-gray-700">
                          {date.date}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          
          {/* Key Terms */}
          {summary.terms && summary.terms.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Key Terms</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {summary.terms.map((term, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium text-gray-800 mb-1">{term.title}</p>
                    <p className="text-gray-700 text-sm">{term.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Potential Risks */}
          {summary.risks && summary.risks.length > 0 && (
            <div className="mb-2">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Potential Risks</h4>
              {summary.risks.map((risk, index) => {
                const severityColor = 
                  risk.severity === 'high' ? 'red' :
                  risk.severity === 'medium' ? 'yellow' : 'orange';
                  
                return (
                  <Alert
                    key={index}
                    variant="default"
                    className={`bg-${severityColor}-50 border-l-4 border-${severityColor}-400 p-4 mb-3`}
                  >
                    <div className="flex">
                      <AlertTriangle className={`h-5 w-5 text-${severityColor}-400 mr-3`} />
                      <div>
                        <AlertTitle className={`text-sm text-${severityColor}-700 font-medium`}>
                          {risk.title}
                        </AlertTitle>
                        <AlertDescription className={`mt-1 text-sm text-${severityColor}-600`}>
                          {risk.description}
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
