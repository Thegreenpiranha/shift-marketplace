import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';

interface ConversationItemProps {
  pubkey: string;
  lastMessage?: {
    timestamp: number;
    content?: string;
  };
  isSelected: boolean;
  onClick: () => void;
}

export function ConversationItem({ pubkey, lastMessage, isSelected, onClick }: ConversationItemProps) {
  const author = useAuthor(pubkey);
  const name = author?.name || genUserName(pubkey);
  const avatar = author?.picture;

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 flex items-start gap-3 hover:bg-accent transition-colors text-left ${
        isSelected ? 'bg-accent' : ''
      }`}
    >
      <Avatar>
        <AvatarImage src={avatar} />
        <AvatarFallback>{name[0]?.toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <p className="font-semibold truncate">{name}</p>
          {lastMessage && (
            <span className="text-xs text-muted-foreground ml-2">
              {new Date(lastMessage.timestamp).toLocaleDateString()}
            </span>
          )}
        </div>
        {lastMessage && (
          <p className="text-sm text-muted-foreground truncate">
            {lastMessage.content || 'Message...'}
          </p>
        )}
      </div>
    </button>
  );
}
