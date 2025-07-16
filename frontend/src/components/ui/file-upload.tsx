import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  accept = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'text/plain': ['.txt']
  },
  maxSize = 5 * 1024 * 1024, // 5MB to match backend
  className
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const removeFile = () => {
    setUploadedFile(null);
  };

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false
  });

  const isError = fileRejections.length > 0;

  return (
    <div className={cn("w-full", className)}>
      {!uploadedFile ? (
        <div
          {...getRootProps()}
          className={cn(
            "relative cursor-pointer transition-all duration-300",
            "border-2 border-dashed rounded-xl p-8",
            "bg-gradient-to-br from-card to-muted/50",
            "hover:from-muted hover:to-card",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            isDragActive && "border-primary bg-primary/5 scale-[1.02]",
            isError && "border-destructive bg-destructive/5"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className={cn(
              "p-4 rounded-full bg-gradient-primary",
              "transition-transform duration-300",
              isDragActive && "scale-110"
            )}>
              <Upload className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {isDragActive ? "Drop your document here" : "Upload Document"}
              </h3>
              <p className="text-muted-foreground mb-4">
                Drag and drop your PDF, Word, or text document here, or click to browse
              </p>
              <div className="text-sm text-muted-foreground">
                Supported formats: PDF, DOC, DOCX, TXT • Max size: 5MB
              </div>
            </div>
          </div>
          
          {isError && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">
                {fileRejections[0]?.errors[0]?.message}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <File className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">{uploadedFile.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};