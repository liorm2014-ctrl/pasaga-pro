import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { MessageSquare, Clock, FileText, ArrowRight, RefreshCw, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatProtocol {
  id: string;
  created_at: string;
  session_id: string;
  full_transcript: string;
  summary: string | null;
}

const ChatLogs: React.FC = () => {
  const [protocols, setProtocols] = useState<ChatProtocol[]>([]);
  const [selectedProtocol, setSelectedProtocol] = useState<ChatProtocol | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProtocols = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('chat_protocols')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching protocols:', error);
    } else {
      setProtocols(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProtocols();
  }, []);

  const filteredProtocols = protocols.filter(p => 
    p.session_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.full_transcript.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.summary && p.summary.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'dd/MM/yyyy HH:mm', { locale: he });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 py-8" dir="rtl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-primary" />
                יומן שיחות AI
              </h1>
              <p className="text-muted-foreground mt-2">
                צפייה בכל פרוטוקולי השיחות מסוכן Gemini
              </p>
            </div>
            <Button onClick={fetchProtocols} variant="outline" className="gap-2">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              רענון
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Protocols List */}
            <div className="lg:col-span-1">
              <Card className="h-[calc(100vh-220px)]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    רשימת פרוטוקולים
                    <Badge variant="secondary" className="mr-auto">
                      {filteredProtocols.length}
                    </Badge>
                  </CardTitle>
                  <div className="relative mt-3">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="חיפוש..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[calc(100vh-380px)]">
                    <AnimatePresence>
                      {isLoading ? (
                        <div className="p-4 text-center text-muted-foreground">
                          טוען...
                        </div>
                      ) : filteredProtocols.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p>אין פרוטוקולים עדיין</p>
                        </div>
                      ) : (
                        filteredProtocols.map((protocol, idx) => (
                          <motion.div
                            key={protocol.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => setSelectedProtocol(protocol)}
                            className={`p-4 border-b border-border cursor-pointer transition-colors hover:bg-accent/50 ${
                              selectedProtocol?.id === protocol.id ? 'bg-primary/10 border-r-4 border-r-primary' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground truncate">
                                  {protocol.session_id}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {protocol.summary || protocol.full_transcript.slice(0, 100)}...
                                </p>
                              </div>
                              <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {formatDate(protocol.created_at)}
                            </div>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Protocol Details */}
            <div className="lg:col-span-2">
              <Card className="h-[calc(100vh-220px)]">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    תמליל שיחה מלא
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedProtocol ? (
                    <motion.div
                      key={selectedProtocol.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      <div className="flex flex-wrap gap-4 text-sm">
                        <Badge variant="outline" className="gap-1">
                          <FileText className="w-3 h-3" />
                          {selectedProtocol.session_id}
                        </Badge>
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(selectedProtocol.created_at)}
                        </Badge>
                      </div>

                      {selectedProtocol.summary && (
                        <div className="bg-accent/30 p-4 rounded-lg">
                          <h4 className="font-medium text-foreground mb-2">סיכום:</h4>
                          <p className="text-muted-foreground">{selectedProtocol.summary}</p>
                        </div>
                      )}

                      <ScrollArea className="h-[calc(100vh-450px)] bg-secondary/20 rounded-lg p-4">
                        <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed text-foreground">
                          {selectedProtocol.full_transcript}
                        </pre>
                      </ScrollArea>
                    </motion.div>
                  ) : (
                    <div className="h-[calc(100vh-350px)] flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p>בחר פרוטוקול מהרשימה לצפייה בתמליל המלא</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ChatLogs;
