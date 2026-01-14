import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useInAppMessages } from '@/hooks/useInAppMessages';
import { useAuthor } from '@/hooks/useAuthor';
import { EnhancedLoginArea } from '@/components/auth/EnhancedLoginArea';
import { MessageCircle, Send, ArrowLeft } from 'lucide-react';
import { ConversationItem } from '@/components/ConversationItem';
import { genUserName } from '@/lib/genUserName';

export default function MessagesPage() {
  const { user } = useCurrentUser();
  const [searchParams] = useSearchParams();
  const recipientParam = searchParams.get('recipient');

  const { conversations, sendMessage, isLoading } = useInAppMessages();
  const [selectedPubkey, setSelectedPubkey] = useState<string | null>(recipientParam);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);

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
      await sendMessage(selectedPubkey, messageText.trim());
      setMessageText("");
    } catch (error) {
      console.error("Failed to send message:", error);
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
              {conversations.map((conversation) => (
                <ConversationItem
                  key={conversation.pubkey}
                  pubkey={conversation.pubkey}
                  lastMessage={conversation.lastMessage}
                  isSelected={selectedPubkey === conversation.pubkey}
                  onClick={() => setSelectedPubkey(conversation.pubkey)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col">
          {selectedPubkey ? (
            <>
              <div className="border-b p-4 flex items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedPubkey(null)}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar>
                  <AvatarImage src={selectedAuthor?.data?.metadata?.picture} />
                  <AvatarFallback>{(selectedAuthor?.data?.metadata?.display_name || selectedAuthor?.data?.metadata?.name || selectedAuthor?.data?.metadata?.username || "User")[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedAuthor?.data?.metadata?.display_name || selectedAuthor?.data?.metadata?.name || selectedAuthor?.data?.metadata?.username || "Anonymous"}</h3>
                  <p className="text-xs text-muted-foreground">Active on Shift</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {!selectedConversation || selectedConversation.messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  selectedConversation?.messages.map((message, idx) => {
                    const isFromMe = message.from === user.pubkey;
                    return (
                      <div key={idx} className={`flex gap-2 ${isFromMe ? 'justify-end' : 'justify-start'}`}>
                        {!isFromMe && (
                          <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                            <AvatarImage src={selectedAuthor?.data?.metadata?.picture} />
                            <AvatarFallback>
                              {(selectedAuthor?.data?.metadata?.display_name || selectedAuthor?.data?.metadata?.name || "U")[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`max-w-[70%] rounded-lg px-4 py-2 ${isFromMe ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                          <p className={`text-xs mt-1 ${isFromMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        {isFromMe && (
                          <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                            <AvatarImage src={user.picture} />
                            <AvatarFallback>{(user.name || "You")[0]?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="border-t p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Type a message..." disabled={isSending} className="flex-1" />
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
                <p className="text-muted-foreground mb-6">Choose a conversation to start messaging</p>
                <Link to="/search"><Button>Browse Listings</Button></Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
