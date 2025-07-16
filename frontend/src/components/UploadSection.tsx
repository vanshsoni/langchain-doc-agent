'use client';

import { useState, useRef } from 'react';

interface UploadSectionProps {
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
}

export default function UploadSection({ onFileUpload, isProcessing }: UploadSectionProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Supported file types
  const supportedTypes = ['.pdf', '.txt', '.doc', '.docx'];
  const maxFileSize = 5 * 1024 * 1024; // 5MB

  const handleFileSelect = (file: File) => {
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!supportedTypes.includes(fileExtension)) {
      alert(`Please select a supported file type: ${supportedTypes.join(', ')}`);
      return;
    }

    if (file.size > maxFileSize) {
      alert('File size must be less than 5MB.');
      return;
    }

    onFileUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div
          className={`border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
            isDragOver
              ? 'border-purple-500 bg-purple-50 scale-105'
              : 'border-purple-300 hover:border-purple-400 bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Drop your document here
          </h3>
          <p className="text-gray-600 mb-4">
            Supported formats: PDF, TXT, DOC, DOCX
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Max file size: 5MB
          </p>
          
          {isProcessing ? (
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              <span className="text-purple-600 font-medium">Processing document...</span>
            </div>
          ) : (
            <button
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              Choose Document
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.doc,.docx"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleFileSelect(file);
            }
          }}
        />
      </div>
    </div>
  );
} 