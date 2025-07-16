import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface DocumentChatProps {
  documentName?: string;
  onSendMessage: (message: string) => Promise<string>;
  onGetSuggestedQuestions?: () => Promise<string[]>;
}

export const DocumentChat: React.FC<DocumentChatProps> = ({
  documentName,
  onSendMessage,
  onGetSuggestedQuestions
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load suggested questions when document is available
  useEffect(() => {
    if (documentName && onGetSuggestedQuestions && suggestedQuestions.length === 0 && !isLoadingSuggestions) {
      loadSuggestedQuestions();
    }
  }, [documentName]);

  const loadSuggestedQuestions = async () => {
    if (!onGetSuggestedQuestions) return;
    
    setIsLoadingSuggestions(true);
    try {
      const questions = await onGetSuggestedQuestions();
      setSuggestedQuestions(questions);
    } catch (error) {
      console.error('Failed to load suggested questions:', error);
      // Don't set fallback questions on error, let the loading state handle it
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !documentName) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await onSendMessage(input.trim());
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your question. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = async (question: string) => {
    // Automatically send the suggested question
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await onSendMessage(question);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your question. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-xl shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Document Assistant</h3>
            {documentName && (
              <p className="text-sm text-muted-foreground">Analyzing: {documentName}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Sparkles className="w-4 h-4 text-ai-primary" />
          <span className="text-sm text-ai-primary font-medium">AI Powered</span>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && !documentName && (
            <div className="text-center py-8">
              <div className="p-4 bg-muted rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">
                Upload a Document First
              </h4>
              <p className="text-muted-foreground">
                Please upload a document to start asking questions. I'll help you analyze and understand its content.
              </p>
            </div>
          )}
          
          {messages.length === 0 && documentName && (
            <div className="text-center py-8">
              <div className="p-4 bg-gradient-primary rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Bot className="w-8 h-8 text-primary-foreground" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">
                Ready to help!
              </h4>
              <p className="text-muted-foreground mb-6">
                Ask me anything about your document. I can answer questions, summarize content, or explain concepts.
              </p>
              
              {/* Suggested Questions */}
              {isLoadingSuggestions && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">Generating suggested questions...</p>
                  <div className="flex space-x-1 justify-center">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  </div>
                </div>
              )}
              
              {!isLoadingSuggestions && suggestedQuestions.length > 0 && messages.length === 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">Suggested questions:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {suggestedQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestedQuestion(question)}
                        disabled={isLoading}
                        className="px-3 py-2 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? "Sending..." : question}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {!isLoadingSuggestions && suggestedQuestions.length === 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Start by asking a question about your document!
                  </p>
                </div>
              )}
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex items-start space-x-3",
                message.role === 'user' && "flex-row-reverse space-x-reverse"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg shrink-0",
                message.role === 'user' 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-gradient-primary"
              )}>
                {message.role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4 text-primary-foreground" />
                )}
              </div>
              <div className={cn(
                "max-w-[80%] p-3 rounded-xl",
                message.role === 'user' 
                  ? "bg-primary text-primary-foreground ml-auto" 
                  : "bg-muted"
              )}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                <p className={cn(
                  "text-xs mt-2 opacity-70",
                  message.role === 'user' ? "text-primary-foreground" : "text-muted-foreground"
                )}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="max-w-[80%] p-3 rounded-xl bg-muted">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex space-x-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={documentName ? "Ask a question about your document..." : "Upload a document to start chatting..."}
            className="flex-1"
            disabled={isLoading || !documentName}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || !documentName}
            className="bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};