import type { Message, TeamMember } from '../App';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';

interface GlobalChatPanelProps {
  messages: Message[];
  team: TeamMember[];
  currentUser: TeamMember;
  onSendMessage: (content: string) => void;
  onMarkMessagesAsRead: (messageIds: string[]) => void;
}

export function GlobalChatPanel({
  messages,
  team,
  currentUser,
  onSendMessage,
  onMarkMessagesAsRead,
}: GlobalChatPanelProps) {
  const globalMessages = messages.filter(m => !m.taskId && !m.observationId);

  return (
    <div className="flex-1 flex flex-col bg-neutral-50">
      <div className="px-6 py-4 border-b border-neutral-200 bg-white">
        <h2 className="font-semibold text-neutral-900">Team Chat</h2>
        <p className="text-sm text-neutral-500">General conversation with the team</p>
      </div>

      <div className="flex-1 overflow-hidden">
        <ChatMessages
          messages={globalMessages}
          currentUser={currentUser}
          team={team}
          onMarkAsRead={onMarkMessagesAsRead}
        />
      </div>

      <ChatInput
        onSend={onSendMessage}
        placeholder="Type a message to the team..."
      />
    </div>
  );
}
