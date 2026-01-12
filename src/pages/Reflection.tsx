import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/layout/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MessageCircle, 
  Send, 
  ArrowLeft,
  Bot,
  User,
  Sparkles,
  Save
} from 'lucide-react';
import { ConversationMessage } from '@/types';
import { cn } from '@/lib/utils';
import { useAIChat } from '@/hooks/useAIChat';
import { toast } from 'sonner';

// Safe message formatting component - prevents XSS by using React components
const FormattedMessage: React.FC<{ content: string }> = ({ content }) => {
  // Remove markdown headers and format bold text safely
  const cleanedContent = content
    .replace(/###\s*/g, '')
    .replace(/##\s*/g, '')
    .replace(/#\s*/g, '')
    .replace(/\*/g, '');
  
  // Split by bold markers and render safely
  const parts = cleanedContent.split(/\*\*([^*]+)\*\*/);
  
  return (
    <p 
      className="leading-relaxed whitespace-pre-wrap text-right" 
      dir="rtl" 
      style={{ fontSize: '16px', lineHeight: '1.8' }}
    >
      {parts.map((part, i) => 
        i % 2 === 1 ? <strong key={i} className="font-bold">{part}</strong> : part
      )}
    </p>
  );
};

const getInitialPrompt = (gender?: string) => {
  const isFemale = gender === 'female';
  return isFemale 
    ? 'שלום! אני כאן כדי ללוות אותך במסע רפלקטיבי על ההשתלמויות והמנהיגות הפדגוגית שלך. בואי נתחיל - ספרי לי על פעולות משמעותיות שנעשו בפסג"ה שלך ומה היו האדוות של הפעולות האלה?'
    : 'שלום! אני כאן כדי ללוות אותך במסע רפלקטיבי על ההשתלמויות והמנהיגות הפדגוגית שלך. בוא נתחיל - ספר לי על פעולות משמעותיות שנעשו בפסג"ה שלך ומה היו האדוות של הפעולות האלה?';
};

const Reflection: React.FC = () => {
  const { user, updateUser, trainings } = useApp();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<ConversationMessage[]>(
    user?.reflectionConversation || []
  );
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');

  const { streamChat, isLoading, error } = useAIChat({
    userContext: {
      fullName: user?.fullName,
      gender: user?.gender,
      district: user?.district,
      city: user?.city,
      numKindergartens: user?.numKindergartens,
      numElementary: user?.numElementary,
      numHighSchools: user?.numHighSchools,
      trainingsCount: trainings.length,
    },
  });

  useEffect(() => {
    // Add initial message if no conversation
    if (messages.length === 0) {
      const initialMessage: ConversationMessage = {
        role: 'assistant',
        content: getInitialPrompt(user?.gender),
        timestamp: new Date().toISOString(),
      };
      setMessages([initialMessage]);
    }
  }, [messages.length, user?.gender]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Save conversation only when messages actually change (not on every render)
  const messagesRef = React.useRef<string>('');
  useEffect(() => {
    const messagesJson = JSON.stringify(messages);
    if (messagesJson !== messagesRef.current && messages.length > 0) {
      messagesRef.current = messagesJson;
      void updateUser({ reflectionConversation: messages });
    }
  }, [messages, updateUser]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: ConversationMessage = {
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);
    setStreamingContent('');

    try {
      // Convert to API format
      const apiMessages = newMessages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      let fullResponse = '';

      await streamChat({
        messages: apiMessages,
        onDelta: (chunk) => {
          fullResponse += chunk;
          setStreamingContent(fullResponse);
        },
        onDone: () => {
          const aiMessage: ConversationMessage = {
            role: 'assistant',
            content: fullResponse,
            timestamp: new Date().toISOString(),
          };
          setMessages(prev => [...prev, aiMessage]);
          setStreamingContent('');
          setIsTyping(false);

          // Mark as completed after enough messages
          if (newMessages.length >= 8) {
            void updateUser({ reflectionCompleted: true });
          }
        },
      });
    } catch (err) {
      setIsTyping(false);
      setStreamingContent('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto"
      >
        <div className="card-elevated flex flex-col h-[calc(100vh-250px)] min-h-[500px]">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">שיחה רפלקטיבית</h1>
                <p className="text-sm text-muted-foreground">דיאלוג מנהיגותי עם AI מנטור</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-sm">
              <Sparkles className="h-4 w-4" />
              AI מנטור
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn(
                    "flex gap-3",
                    message.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                    message.role === 'user' 
                      ? "bg-accent text-accent-foreground" 
                      : "bg-primary text-primary-foreground"
                  )}>
                    {message.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                  </div>
                  
                  <div className={cn(
                    "max-w-[80%] p-4 rounded-2xl",
                    message.role === 'user' 
                      ? "bg-accent text-accent-foreground rounded-br-sm" 
                      : "bg-muted text-foreground rounded-bl-sm"
                  )}>
                    <FormattedMessage content={message.content} />
                    <span className="text-xs opacity-60 mt-2 block text-right">
                      {new Date(message.timestamp).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Streaming response */}
            {isTyping && streamingContent && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="max-w-[80%] p-4 rounded-2xl bg-muted text-foreground rounded-bl-sm">
                  <FormattedMessage content={streamingContent} />
                </div>
              </motion.div>
            )}

            {/* Typing indicator */}
            {isTyping && !streamingContent && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="bg-muted p-4 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="pt-4 border-t border-border">
            <div className="flex gap-3">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="כתוב/י את תשובתך..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button 
                onClick={handleSend} 
                disabled={!inputValue.trim() || isTyping}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Save and Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex justify-end gap-3"
        >
          <Button 
            size="lg" 
            onClick={async () => {
              await updateUser({ reflectionCompleted: true });
              toast.success('השיחה נשמרה בהצלחה');
              navigate('/vision');
            }}
            className="gap-2 text-white border-0"
            style={{ backgroundColor: 'rgba(30, 58, 95, 0.8)' }}
            disabled={messages.length < 2}
          >
            <Save className="h-4 w-4" />
            שמור והמשך לשלב החזון
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default Reflection;
