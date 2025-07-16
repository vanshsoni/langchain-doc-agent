'use client';

import { useState } from 'react';
import UploadSection from '@/components/UploadSection';
import ChatSection from '@/components/ChatSection';

export default function Home() {
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setCurrentFile(file.name);
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewUpload = () => {
    setCurrentFile(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 text-center">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-3">
            <span className="text-2xl">🤖</span>
            Talk with your documents
          </h1>
          <p className="text-purple-100">
            Upload your documents and start chatting with them
          </p>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {!currentFile ? (
            <UploadSection 
              onFileUpload={handleFileUpload}
              isProcessing={isProcessing}
            />
          ) : (
            <ChatSection 
              fileName={currentFile}
              onNewUpload={handleNewUpload}
            />
          )}
        </div>
      </div>
    </div>
  );
}
