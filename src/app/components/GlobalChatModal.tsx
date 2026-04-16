import { X } from 'lucide-react';
import { motion } from 'motion/react';
import type { Message, TeamMember } from '../App';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';

interface GlobalChatModalProps {
  messages: Message[];
  team: TeamMember[];
  currentUser: TeamMember;
  onClose: () => void;
  onSendMessage: (content: string) => void;
  onMarkMessagesAsRead: (messageIds: string[]) => void;
}

export function GlobalChatModal({
  messages,
  team,
  currentUser,
  onClose,
  onSendMessage,
  onMarkMessagesAsRead,
}: GlobalChatModalProps) {
  const globalMessages = messages.filter(m => !m.taskId && !m.observationId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">Team Chat</h2>
            <p className="text-sm text-neutral-500">General conversation</p>
          </div>
          <button
            onClick={onClose}
            className="size-9 flex items-center justify-center rounded-lg hover:bg-neutral-100 text-neutral-500 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-hidden">
          <ChatMessages
            messages={globalMessages}
            currentUser={currentUser}
            team={team}
            onMarkAsRead={onMarkMessagesAsRead}
          />
        </div>

        {/* Chat Input */}
        <ChatInput
          onSend={onSendMessage}
          placeholder="Type a message to the team..."
        />
      </motion.div>
    </motion.div>
  );
}
