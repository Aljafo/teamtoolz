import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import type { Message, TeamMember } from '../App';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';

interface MobileGlobalChatProps {
  messages: Message[];
  team: TeamMember[];
  currentUser: TeamMember;
  onBack: () => void;
  onSendMessage: (content: string) => void;
  onMarkMessagesAsRead: (messageIds: string[]) => void;
}

export function MobileGlobalChat({
  messages,
  team,
  currentUser,
  onBack,
  onSendMessage,
  onMarkMessagesAsRead,
}: MobileGlobalChatProps) {
  const globalMessages = messages.filter(m => !m.taskId && !m.observationId);
  const unreadCount = globalMessages.filter(m => m.senderId !== currentUser.id && m.status !== 'read').length;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'tween', duration: 0.3 }}
      className="absolute inset-0 bg-white z-50 flex flex-col"
    >
      {/* Header */}
      <div className="bg-[#2c3e72] text-white">
        {/* Status Bar */}
        <div className="h-11 bg-[#1e2942] flex items-center justify-between px-6 pt-2">
          <span className="text-sm font-semibold">20:06</span>
          <div className="flex items-center gap-2 text-xs">
            <span>📶</span>
            <span>📡</span>
            <span>50%</span>
          </div>
        </div>

        {/* Top Bar */}
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={onBack} className="size-9 flex items-center justify-center rounded-full hover:bg-white/10">
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex-1">
            <div className="text-xs opacity-70">Team Communication</div>
            <div className="font-semibold">Team Chat</div>
          </div>
          {unreadCount > 0 && (
            <span className="px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full">
              {unreadCount} unread
            </span>
          )}
        </div>

        {/* Color Banner */}
        <div className="h-1" style={{ backgroundColor: '#5b9bd5' }} />
      </div>

      {/* Chat Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatMessages
          messages={globalMessages}
          currentUser={currentUser}
          team={team}
          onMarkAsRead={onMarkMessagesAsRead}
        />

        <ChatInput
          onSend={onSendMessage}
          placeholder="Type a message to the team..."
        />
      </div>
    </motion.div>
  );
}
