import { useState, useEffect } from 'react';
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

  // Load messages from localStorage
  useEffect(() => {
    if (!user) return;
    
    const stored = localStorage.getItem('shift:messages');
    if (stored) {
      const allMessages: Message[] = JSON.parse(stored);
      // Filter messages for current user
      const userMessages = allMessages.filter(
        m => m.from === user.pubkey || m.to === user.pubkey
      );
      
      // Group into conversations
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
    }
  }, [user]);

  const sendMessage = (to: string, content: string) => {
    if (!user) return;
    
    const message: Message = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      from: user.pubkey,
      to,
      content,
      timestamp: Date.now(),
      read: false
    };
    
    // Save to localStorage
    const stored = localStorage.getItem('shift:messages');
    const allMessages: Message[] = stored ? JSON.parse(stored) : [];
    allMessages.push(message);
    localStorage.setItem('shift:messages', JSON.stringify(allMessages));
    
    // Update conversations
    const otherPubkey = to;
    const updated = [...conversations];
    const existingIdx = updated.findIndex(c => c.pubkey === otherPubkey);
    
    if (existingIdx >= 0) {
      updated[existingIdx].messages.push(message);
      updated[existingIdx].lastMessage = message;
    } else {
      updated.push({
        pubkey: otherPubkey,
        messages: [message],
        lastMessage: message
      });
    }
    
    setConversations(updated);
  };

  return {
    conversations,
    sendMessage,
    isLoading: false
  };
}
