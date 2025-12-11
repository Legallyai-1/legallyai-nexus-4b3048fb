import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'crypto';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface UsePersistentChatOptions {
  hubType: string;
  sessionId?: string;
  autoSave?: boolean;
}

export const usePersistentChat = (options: UsePersistentChatOptions) => {
  const { hubType, sessionId: initialSessionId, autoSave = true } = options;
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string>(initialSessionId || '');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Generate session ID
  useEffect(() => {
    if (!initialSessionId) {
      // Use a simple UUID generation
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(id);
    }
  }, [initialSessionId]);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  // Load existing session
  useEffect(() => {
    if (sessionId && userId) {
      loadSession();
    }
  }, [sessionId, userId]);

  const loadSession = async () => {
    if (!userId || !sessionId) return;
    
    try {
      const { data, error } = await supabase
        .from('ai_chat_history')
        .select('messages')
        .eq('user_id', userId)
        .eq('session_id', sessionId)
        .single();

      if (data && !error) {
        setMessages(data.messages as Message[] || []);
      }
    } catch (error) {
      console.log('No existing session found, starting fresh');
    }
  };

  const saveSession = useCallback(async (messagesToSave: Message[]) => {
    if (!userId || !sessionId || messagesToSave.length === 0) return;

    try {
      const searchableText = messagesToSave
        .map(m => m.content)
        .join(' ')
        .substring(0, 5000);

      const { error } = await supabase
        .from('ai_chat_history')
        .upsert({
          user_id: userId,
          hub_type: hubType,
          session_id: sessionId,
          messages: messagesToSave,
          searchable_text: searchableText,
          updated_at: new Date().toISOString(),
          metadata: {
            message_count: messagesToSave.length,
            last_activity: new Date().toISOString()
          }
        }, {
          onConflict: 'user_id,session_id'
        });

      if (error) {
        console.error('Error saving chat session:', error);
      }
    } catch (error) {
      console.error('Error saving chat session:', error);
    }
  }, [userId, sessionId, hubType]);

  const addMessage = useCallback((message: Message) => {
    const newMessage = {
      ...message,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => {
      const updated = [...prev, newMessage];
      if (autoSave) {
        saveSession(updated);
      }
      return updated;
    });
  }, [autoSave, saveSession]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const startNewSession = useCallback(() => {
    const newId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newId);
    setMessages([]);
  }, []);

  return {
    messages,
    setMessages,
    addMessage,
    clearMessages,
    sessionId,
    startNewSession,
    loading,
    saveSession: () => saveSession(messages),
    userId
  };
};

export default usePersistentChat;
