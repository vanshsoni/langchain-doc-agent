'use client';

interface MessageProps {
  message: {
    type: 'user' | 'bot';
    content: string;
    timestamp: Date;
  };
}

export default function Message({ message }: MessageProps) {
  const isUser = message.type === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
        isUser 
          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-br-md' 
          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'
      }`}>
        <div className="flex items-start gap-3">
          {!isUser && (
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
              🤖
            </div>
          )}
          
          <div className="flex-1">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
            <p className={`text-xs mt-2 ${
              isUser ? 'text-purple-100' : 'text-gray-500'
            }`}>
              {message.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
          
          {isUser && (
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
              👤
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 