import { Check, CheckCheck, Crown } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { Message, TeamMember } from '../App';

interface ChatMessagesProps {
  messages: Message[];
  currentUser: TeamMember;
  team: TeamMember[];
  onMarkAsRead?: (messageIds: string[]) => void;
}

export function ChatMessages({ messages, currentUser, team, onMarkAsRead }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    // Mark unread messages as read
    if (onMarkAsRead) {
      const unreadMessageIds = messages
        .filter(m => m.senderId !== currentUser.id && m.status !== 'read')
        .map(m => m.id);

      if (unreadMessageIds.length > 0) {
        setTimeout(() => onMarkAsRead(unreadMessageIds), 1000);
      }
    }
  }, [messages, currentUser.id, onMarkAsRead]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getSender = (senderId: string): TeamMember | undefined => {
    return team.find(m => m.id === senderId);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-neutral-400 text-sm">
          No messages yet. Start the conversation!
        </div>
      ) : (
        <>
          {messages.map((message) => {
            const sender = getSender(message.senderId);
            const isCurrentUser = message.senderId === currentUser.id;

            return (
              <div
                key={message.id}
                className={`flex gap-2 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {!isCurrentUser && sender && (
                  <div className="size-8 rounded-full bg-pink-100 text-pink-700 border border-pink-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {getInitials(sender.name)}
                  </div>
                )}

                <div className={`flex flex-col gap-1 max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                  {!isCurrentUser && sender && (
                    <div className="flex items-center gap-1 text-xs text-neutral-500 font-medium px-2">
                      <span>{sender.name}</span>
                      {sender.userRole === 'admin' && (
                        <Crown className="size-3 text-purple-600" />
                      )}
                    </div>
                  )}

                  <div
                    className={`px-3 py-2 rounded-lg ${
                      isCurrentUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-neutral-100 text-neutral-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  </div>

                  <div className={`flex items-center gap-1 px-2 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-xs text-neutral-400">
                      {formatTime(message.timestamp)}
                    </span>

                    {isCurrentUser && (
                      <div className="flex items-center">
                        {message.status === 'sent' && (
                          <Check className="size-3 text-neutral-400" />
                        )}
                        {message.status === 'delivered' && (
                          <CheckCheck className="size-3 text-neutral-400" />
                        )}
                        {message.status === 'read' && (
                          <CheckCheck className="size-3 text-blue-500" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}
