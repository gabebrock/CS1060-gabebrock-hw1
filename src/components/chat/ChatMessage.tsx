import { ChatMessage as ChatMessageType } from '@/types/met';
import { ArtworkCard } from './ArtworkCard';

interface ChatMessageProps {
  message: ChatMessageType;
  onArtworkClick?: (artwork: ChatMessageType['artwork']) => void;
}

export const ChatMessage = ({ message, onArtworkClick }: ChatMessageProps) => {
  const isUser = message.type === 'user';
  
  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Avatar */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            isUser 
              ? 'bg-chat-user text-chat-user-foreground' 
              : 'bg-chat-bot text-chat-bot-foreground'
          }`}>
            {isUser ? 'You' : '🎨'}
          </div>
          
          {/* Message content */}
          <div className="flex-1">
            <div className={`rounded-lg px-4 py-3 ${
              isUser 
                ? 'bg-chat-user text-chat-user-foreground' 
                : 'bg-chat-bot text-chat-bot-foreground'
            }`}>
              <p className="text-sm leading-relaxed">{message.content}</p>
            </div>
            
            {/* Artwork card for bot messages */}
            {!isUser && message.artwork && (
              <div className="mt-4">
                <ArtworkCard 
                  artwork={message.artwork} 
                  onImageClick={() => onArtworkClick?.(message.artwork)}
                />
              </div>
            )}
            
            {/* Timestamp */}
            <p className="text-xs text-muted-foreground mt-2 px-1">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};