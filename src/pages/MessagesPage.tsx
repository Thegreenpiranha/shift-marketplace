import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useDMContext } from '@/hooks/useDMContext';
import { useAuthor } from '@/hooks/useAuthor';
import { EnhancedLoginArea } from '@/components/auth/EnhancedLoginArea';
import { MessageCircle, Send, ArrowLeft } from 'lucide-react';
import { MESSAGE_PROTOCOL } from '@/lib/dmConstants';
import { genUserName } from '@/lib/genUserName';
import { ConversationItem } from '@/components/ConversationItem';

export default function MessagesPage() {
  const { user } = useCurrentUser();
  const [searchParams] = useSearchParams();
  const recipientParam = searchParams.get('recipient');

  const { conversations, sendMessage, isLoading } = useDMContext();
  const [selectedPubkey, setSelectedPubkey] = useState<string | null>(recipientParam);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Auto-select conversation from URL param
  useEffect(() => {
    if (recipientParam && conversations.length > 0) {
      setSelectedPubkey(recipientParam);
    }
  }, [recipientParam, conversations]);

  const selectedConversation = conversations.find(c => c.pubkey === selectedPubkey);
  const selectedAuthor = useAuthor(selectedPubkey || undefined);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedPubkey || !user) return;

    setIsSending(true);
    try {
      await sendMessage({
        recipientPubkey: selectedPubkey,
        content: messageText.trim(),
        protocol: MESSAGE_PROTOCOL.NIP17
      });
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <EnhancedLoginArea />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List - Left Sidebar */}
        <div className="w-full md:w-80 border-r bg-background overflow-y-auto">
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Messages</h2>
          </div>
          <Separator />
          
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-4">No conversations yet</p>
              <Link to="/search">
                <Button size="sm">Browse Listings</Button>
              </Link>
            </div>
          ) : (
            <div>
              {conversations.map((conversation) => {
                const author = useAuthor(conversation.pubkey);
                const name = author?.name || genUserName(conversation.pubkey);
                const avatar = author?.picture;
                
                return (
                  <button
                    key={conversation.pubkey}
                    onClick={() => setSelectedPubkey(conversation.pubkey)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-accent transition-colors text-left ${
                      selectedPubkey === conversation.pubkey ? 'bg-accent' : ''
                    }`}
                  >
                    <Avatar>
                      <AvatarImage src={avatar} />
                      <AvatarFallback>{name[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <p className="font-semibold truncate">{name}</p>
                        {conversation.lastMessage && (
                          <span className="text-xs text-muted-foreground ml-2">
                            {new Date(conversation.lastMessage.created_at * 1000).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {conversation.lastMessage && (
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage.decryptedContent || 'Message...'}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Chat Area - Right Side */}
        <div className="flex-1 flex flex-col">
          {selectedPubkey && selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="border-b p-4 flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSelectedPubkey(null)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar>
                  <AvatarImage src={selectedAuthor?.picture} />
                  <AvatarFallback>
                    {(selectedAuthor?.name || genUserName(selectedPubkey))[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {selectedAuthor?.name || genUserName(selectedPubkey)}
                  </h3>
                  <p className="text-xs text-muted-foreground">Active on Shift</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedConversation.messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  selectedConversation.messages.map((message, idx) => {
                    const isFromMe = message.pubkey === user.pubkey;
                    return (
                      <div
                        key={idx}
                        className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            isFromMe
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.decryptedContent}
                          </p>
                          <p className={`text-xs mt-1 ${isFromMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {new Date(message.created_at * 1000).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input */}
              <div className="border-t p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    disabled={isSending}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!messageText.trim() || isSending}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
                <p className="text-muted-foreground mb-6">
                  Choose a conversation from the list to start messaging
                </p>
                <Link to="/search">
                  <Button>Browse Listings</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
