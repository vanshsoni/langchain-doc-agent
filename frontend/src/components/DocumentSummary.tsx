import React from 'react';
import { FileText, Clock, Hash, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface DocumentSummaryProps {
  documentName?: string;
  summary?: string;
  wordCount?: number;
  pageCount?: number;
  isLoading?: boolean;
}

export const DocumentSummary: React.FC<DocumentSummaryProps> = ({
  documentName,
  summary,
  wordCount,
  pageCount,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <Card className="p-6 bg-card border-border shadow-card">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <FileText className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
          
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </Card>
    );
  }

  if (!documentName) {
    return (
      <Card className="p-8 bg-card border-border shadow-card text-center">
        <div className="p-4 bg-gradient-secondary rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <FileText className="w-8 h-8 text-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No Document Uploaded
        </h3>
        <p className="text-muted-foreground">
          Upload a document to see its summary and start asking questions.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border-border shadow-card">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-gradient-primary rounded-lg">
          <FileText className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{documentName}</h3>
          <div className="flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-ai-primary" />
            <span className="text-sm text-ai-primary">AI Summary</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex space-x-2 mb-4">
        {pageCount && (
          <Badge variant="secondary" className="bg-muted text-muted-foreground">
            <Hash className="w-3 h-3 mr-1" />
            {pageCount} pages
          </Badge>
        )}
        {wordCount && (
          <Badge variant="secondary" className="bg-muted text-muted-foreground">
            <Clock className="w-3 h-3 mr-1" />
            ~{Math.ceil(wordCount / 200)} min read
          </Badge>
        )}
      </div>

      {/* Summary */}
      <div className="space-y-3">
        <h4 className="font-medium text-foreground">Document Summary</h4>
        {summary ? (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {summary}
          </p>
        ) : (
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground text-center">
              Processing document summary...
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};