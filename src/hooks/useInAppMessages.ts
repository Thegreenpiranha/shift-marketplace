import { useState, useEffect, useCallback } from 'react';
import { useCurrentUser } from './useCurrentUser';

export interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: number;
  read: boolean;
}

export interface Conversation {
  pubkey: string;
  messages: Message[];
  lastMessage?: Message;
}

export function useInAppMessages() {
  const { user } = useCurrentUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/messages?pubkey=${user.pubkey}`);
      const data = await response.json();
      
      const userMessages: Message[] = data.messages || [];
      
      // Group into conversations by other party
      const convMap = new Map<string, Message[]>();
      userMessages.forEach(msg => {
        const otherPubkey = msg.from === user.pubkey ? msg.to : msg.from;
        if (!convMap.has(otherPubkey)) {
          convMap.set(otherPubkey, []);
        }
        convMap.get(otherPubkey)!.push(msg);
      });
      
      // Convert to conversations array
      const convs: Conversation[] = Array.from(convMap.entries()).map(([pubkey, messages]) => {
        messages.sort((a, b) => a.timestamp - b.timestamp);
        return {
          pubkey,
          messages,
          lastMessage: messages[messages.length - 1]
        };
      });
      
      // Sort by last message time
      convs.sort((a, b) => (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0));
      
      setConversations(convs);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }, [user]);

  // Load messages on mount
  useEffect(() => {
    setIsLoading(true);
    loadConversations().finally(() => setIsLoading(false));
  }, [loadConversations]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, [loadConversations]);

  const sendMessage = async (to: string, content: string) => {
    if (!user) return;
    
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: user.pubkey,
          to,
          content
        })
      });
      
      // Immediately reload to show sent message
      await loadConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return {
    conversations,
    sendMessage,
    isLoading
  };
}
