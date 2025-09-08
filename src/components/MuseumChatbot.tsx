import { useState, useRef, useEffect } from 'react';
import { ChatMessage as ChatMessageType, MetObject } from '@/types/met';
import { MetAPI } from '@/utils/metApi';
import { ChatMessage } from './chat/ChatMessage';
import { ChatInput } from './chat/ChatInput';
import { MoodSuggestions } from './chat/MoodSuggestions';
import { ArtworkModal } from './chat/ArtworkModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Palette } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const MuseumChatbot = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm your personal art curator from The Metropolitan Museum. Tell me how you'd like to feel, and I'll find the perfect artwork to match your mood. You can also ask me questions about any artworks I show you!",
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState<MetObject | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = (mood: string, artwork?: any) => {
    const responses = {
      happy: [
        "Here's a delightful piece that radiates joy and positivity!",
        "This artwork should bring a smile to your face!",
        "Found something bright and cheerful for you!"
      ],
      peaceful: [
        "This serene piece should help you find your inner calm.",
        "Here's something tranquil to soothe your soul.",
        "This artwork embodies peaceful tranquility."
      ],
      energized: [
        "This dynamic piece should get your creative energy flowing!",
        "Here's something vibrant to match your energy!",
        "This artwork pulses with life and movement!"
      ],
      inspired: [
        "This masterpiece should spark your creativity!",
        "Here's something to ignite your imagination!",
        "This artwork embodies artistic innovation!"
      ],
      mysterious: [
        "Here's something enigmatic and thought-provoking.",
        "This piece holds secrets waiting to be discovered.",
        "Mysterious and captivating - just what you need!"
      ],
      sad: [
        "Sometimes beauty can be found in melancholy.",
        "This piece acknowledges the depth of emotion.",
        "Art that speaks to the soul's quieter moments."
      ]
    };

    const moodKey = mood.toLowerCase() as keyof typeof responses;
    const moodResponses = responses[moodKey] || ["Here's an artwork that caught my attention!"];
    return moodResponses[Math.floor(Math.random() * moodResponses.length)];
  };

  const handleAIConversation = async (messageText: string, currentArtwork?: any): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke('art-curator-ai', {
        body: {
          message: messageText,
          artwork: currentArtwork,
          conversationHistory: messages
        }
      });

      if (error) {
        console.error('AI conversation error:', error);
        return "I'm sorry, I'm having trouble processing your question right now. Please try again.";
      }

      return data.response || "I'm not sure how to respond to that. Could you ask me something about the artwork or artist?";
    } catch (error) {
      console.error('Error calling AI function:', error);
      return "I'm experiencing some technical difficulties. Please try asking your question again.";
    }
  };

  const isComplaintOrAlternativeRequest = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    
    const complaintPhrases = [
      'show me another',
      'show me other',
      'show me something different',
      'show me more',
      'different',
      "doesn't make me feel",
      "why would this",
      "are you kidding",
      "not feeling",
      "show me examples",
      "other pieces",
      "other examples",
      "show me something else"
    ];
    
    return complaintPhrases.some(phrase => lowerMessage.includes(phrase));
  };

  const isMoodRequest = (message: string): boolean => {
    const moodKeywords = ['feel', 'mood', 'emotion', 'want to be', 'make me', 'need something'];
    const explicitMoodRequests = ['i want to feel', 'make me feel', 'i need to feel', 'help me feel', 'show me something'];
    
    const lowerMessage = message.toLowerCase();
    
    // Check for explicit mood requests
    const hasExplicitRequest = explicitMoodRequests.some(phrase => lowerMessage.includes(phrase));
    
    // Check for simple mood words at the start
    const startsWithMood = /^(happy|sad|peaceful|excited|inspired|mysterious|calm|energetic|joyful|melancholy)$/i.test(lowerMessage.trim());
    
    return hasExplicitRequest || startsWithMood;
  };

  const handleSendMessage = async (messageText: string) => {
    // Add user message
    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Check if this is a mood request, complaint about current artwork, or general conversation
      const isMoodReq = isMoodRequest(messageText);
      const isComplaint = isComplaintOrAlternativeRequest(messageText);
      
      if (isMoodReq || isComplaint) {
        // Handle as mood-based artwork discovery
        let mood: any = null;
        
        if (isComplaint) {
          // For complaints, try to extract mood from the current message or find the last mood used
          mood = MetAPI.extractMoodFromMessage(messageText);
          
          // If no mood in current message, find the last mood from conversation history
          if (!mood) {
            for (let i = messages.length - 1; i >= 0; i--) {
              if (messages[i].artwork) {
                // Try to extract mood from the message that showed this artwork
                const moodFromHistory = MetAPI.extractMoodFromMessage(messages[i].content);
                if (moodFromHistory) {
                  mood = moodFromHistory;
                  break;
                }
              }
            }
          }
          
          // Default to 'peaceful' if we can't determine the mood
          if (!mood) mood = 'peaceful';
        } else {
          mood = MetAPI.extractMoodFromMessage(messageText);
        }
        
        if (mood) {
          // Get artwork based on mood, get more options for complaints
          const artworkCount = isComplaint ? 5 : 1;
          const artworks = await MetAPI.getObjectsByMood(mood, artworkCount);
          
          if (artworks.length > 0) {
            let selectedArtwork = artworks[0];
            
            // If this is a complaint, try to get a different artwork than the current one
            if (isComplaint) {
              const currentArtwork = messages.length > 0 ? 
                messages[messages.length - 1]?.artwork : null;
              
              if (currentArtwork) {
                const alternatives = artworks.filter(art => art.objectID !== currentArtwork.objectID);
                if (alternatives.length > 0) {
                  selectedArtwork = alternatives[Math.floor(Math.random() * alternatives.length)];
                }
              }
            }
            
            const responseText = isComplaint ? 
              "I understand that piece didn't resonate with you. Let me show you something different that might better capture the feeling you're looking for!" :
              generateBotResponse(mood, selectedArtwork);
            
            const botMessage: ChatMessageType = {
              id: (Date.now() + 1).toString(),
              type: 'bot',
              content: responseText,
              timestamp: new Date(),
              artwork: selectedArtwork,
            };
            setMessages(prev => [...prev, botMessage]);
          } else {
            const botMessage: ChatMessageType = {
              id: (Date.now() + 1).toString(),
              type: 'bot',
              content: "I couldn't find artworks matching that mood right now. Could you try describing your desired feeling differently?",
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, botMessage]);
          }
        } else {
          // Still try AI conversation even if mood extraction failed
          const currentArtwork = messages.length > 0 ? 
            messages[messages.length - 1]?.artwork : null;
          
          const aiResponse = await handleAIConversation(messageText, currentArtwork);
          
          const botMessage: ChatMessageType = {
            id: (Date.now() + 1).toString(),
            type: 'bot',
            content: aiResponse,
            timestamp: new Date(),
            artwork: currentArtwork
          };
          
          setMessages(prev => [...prev, botMessage]);
        }
      } else {
        // Handle all other messages as AI conversation
        const currentArtwork = messages.length > 0 ? 
          messages[messages.length - 1]?.artwork : null;
        
        const aiResponse = await handleAIConversation(messageText, currentArtwork);
        
        const botMessage: ChatMessageType = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: aiResponse,
          timestamp: new Date(),
          artwork: currentArtwork
        };
        
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "I'm having trouble right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleArtworkClick = (artwork: MetObject | undefined) => {
    if (artwork) {
      setSelectedArtwork(artwork);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedArtwork(null);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-museum">
      <Card className="flex-1 flex flex-col border-border/50 bg-card/95 backdrop-blur-sm">
        <CardHeader className="border-b border-border/50 bg-gradient-artwork">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Palette className="w-5 h-5 text-primary" />
            MET Art Curator
            <span className="text-sm font-normal text-muted-foreground ml-auto">
              Powered by The Metropolitan Museum
            </span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage 
                  key={message.id} 
                  message={message} 
                  onArtworkClick={handleArtworkClick}
                />
              ))}
              
              {messages.length === 1 && !isLoading && (
                <div className="mt-8">
                  <MoodSuggestions 
                    onSelectMood={handleSendMessage} 
                    isLoading={isLoading}
                  />
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t border-border/50 bg-background/50">
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
          </div>
        </CardContent>
      </Card>
      
      <ArtworkModal 
        artwork={selectedArtwork}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};