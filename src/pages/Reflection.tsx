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
  Sparkles
} from 'lucide-react';
import { ConversationMessage } from '@/types';
import { cn } from '@/lib/utils';

const reflectionQuestions = [
  'שלום! אני כאן כדי ללוות אותך במסע רפלקטיבי על ההשתלמויות והמנהיגות הפדגוגית שלך. בואו נתחיל - ספר/י לי על פעולות גדולות שנעשו בפסג"ה ומה היו האדוות של הפעולות האלה?',
  'תודה על השיתוף! מה היעדים שהיית רוצה להשיג בשנה הקרובה?',
  'מעניין מאוד. האם היעדים האלה עומדים במסגרת התקציב הקיים?',
  'הבנתי. איפה נמצא הקושי העיקרי לדעתך בהשגת היעדים?',
  'מהו המפתח לפתרון הבעיה? ומה ביכולתך לעשות כדי להתקדם?',
  'נהדר! בוא/י נחשוב על פתרון יצירתי להתמודדות עם הקושי שציינת.',
];

const Reflection: React.FC = () => {
  const { user, updateUser, trainings } = useApp();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<ConversationMessage[]>(
    user?.reflectionConversation || []
  );
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    if (!user?.dashboardVisited) {
      navigate('/dashboard');
      return;
    }
    
    // Add initial message if no conversation
    if (messages.length === 0) {
      const initialMessage: ConversationMessage = {
        role: 'assistant',
        content: reflectionQuestions[0],
        timestamp: new Date().toISOString(),
      };
      setMessages([initialMessage]);
      setCurrentQuestionIndex(1);
    }
  }, [user, navigate, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    updateUser({ reflectionConversation: messages });
  }, [messages, updateUser]);

  const generateAIResponse = (userMessage: string): string => {
    // In real app, this would call the AI API
    const responses = [
      `תודה על השיתוף המשמעותי! אני רואה שיש לך חשיבה מעמיקה על התהליכים בפסג"ה. ${reflectionQuestions[currentQuestionIndex] || 'נראה שסיימנו את השאלות העיקריות. האם יש משהו נוסף שתרצה/י להוסיף?'}`,
      `הבנתי את הנקודה שלך לגבי "${userMessage.slice(0, 30)}...". זה מחזק את התובנות שעלו מהנתונים. ${reflectionQuestions[currentQuestionIndex] || 'בוא/י נסכם את מה שעלה בשיחה.'}`,
      `נקודה חשובה! זה מתקשר למה שראינו בניתוח הנתונים. ${reflectionQuestions[currentQuestionIndex] || 'האם תרצה/י להמשיך לשלב החזון?'}`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ConversationMessage = {
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse: ConversationMessage = {
        role: 'assistant',
        content: generateAIResponse(inputValue),
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setCurrentQuestionIndex(prev => Math.min(prev + 1, reflectionQuestions.length));
      setIsTyping(false);

      // Mark as completed after enough messages
      if (messages.length >= 8) {
        updateUser({ reflectionCompleted: true });
      }
    }, 1500);
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
            
            <a 
              href="https://gemini.google.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-sm hover:bg-accent/20 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              Gemini
            </a>
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
                    <p className="leading-relaxed">{message.content}</p>
                    <span className="text-xs opacity-60 mt-2 block">
                      {new Date(message.timestamp).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
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

        {/* Next Step */}
        {user?.reflectionCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex justify-end"
          >
            <Button 
              size="lg" 
              onClick={() => navigate('/vision')}
              className="gap-2"
            >
              המשך לחזון וקפיצה
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </motion.div>
    </Layout>
  );
};

export default Reflection;