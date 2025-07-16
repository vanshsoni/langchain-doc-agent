import React, { useState } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { DocumentChat } from '@/components/DocumentChat';
import { DocumentSummary } from '@/components/DocumentSummary';
import { Brain, Sparkles } from 'lucide-react';

// Backend API configuration
const API_BASE_URL = 'http://localhost:8000';

const Index = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [documentSummary, setDocumentSummary] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setIsProcessing(true);
    setUploadError('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to upload document');
      }

      const data = await response.json();
      setDocumentSummary(data.summary || 'Document processed successfully.');
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload document');
      setUploadedFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async (message: string): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('question', message);

      const response = await fetch(`${API_BASE_URL}/ask`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get answer');
      }

      const data = await response.json();
      return data.answer;
      
    } catch (error) {
      console.error('Chat error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get answer');
    }
  };

  const handleGetSuggestedQuestions = async (): Promise<string[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/suggested-questions`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get suggested questions');
      }

      const data = await response.json();
      return data.suggested_questions || [];
      
    } catch (error) {
      console.error('Suggested questions error:', error);
      // Return empty array to let loading state handle it
      return [];
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-primary rounded-xl">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">DocuChat AI</h1>
                <p className="text-sm text-muted-foreground">Talk with your documents</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-ai-primary">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI Powered</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Left Column - Upload & Summary */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Upload Document</h2>
              <FileUpload onFileUpload={handleFileUpload} />
              {uploadError && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{uploadError}</p>
                </div>
              )}
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Document Summary</h2>
              <DocumentSummary
                documentName={uploadedFile?.name}
                summary={documentSummary}
                isLoading={isProcessing}
              />
            </div>
          </div>

          {/* Right Column - Chat */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-foreground mb-4">Chat with Document</h2>
            <div className="h-[700px]">
              <DocumentChat
                documentName={uploadedFile?.name}
                onSendMessage={handleSendMessage}
                onGetSuggestedQuestions={handleGetSuggestedQuestions}
              />
            </div>
          </div>
        </div>

        {/* Features Section */}
        {!uploadedFile && (
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Powerful Document AI Features
            </h3>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Upload any document and start having intelligent conversations. 
              Get summaries, ask questions, and extract insights with AI.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                {
                  title: "Smart Summaries",
                  description: "Get instant AI-generated summaries of your documents"
                },
                {
                  title: "Q&A Chat",
                  description: "Ask specific questions and get detailed answers"
                },
                {
                  title: "Multiple Formats",
                  description: "Support for PDF, Word, and text documents"
                }
              ].map((feature, index) => (
                <div key={index} className="p-6 bg-card border border-border rounded-xl shadow-card">
                  <div className="p-3 bg-gradient-primary rounded-lg w-fit mx-auto mb-4">
                    <Sparkles className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
