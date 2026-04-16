import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { motion } from 'motion/react';
import type { Observation, TeamMember, Category, Team, Task, Message, ExternalContact, Subcategory } from '../App';
import { ObservationDetailModal } from './ObservationDetailModal';

interface ObservationCardProps {
  observation: Observation;
  team: TeamMember[];
  teams: Team[];
  categories: Category[];
  subcategories: Subcategory[];
  tasks: Task[];
  messages: Message[];
  currentUser: TeamMember;
  externalContacts: ExternalContact[];
  onConvertToTask: (observationId: string, assignTo?: TeamMember, assignToTeamId?: string, assignToExternal?: string) => void;
  onOpenTaskCreation: (observationId: string) => void;
  onSendMessage: (content: string, taskId?: string, observationId?: string) => void;
  onMarkMessagesAsRead: (messageIds: string[]) => void;
  onAddAttachment: (observationId: string, file: File) => void;
  onRemoveAttachment: (observationId: string, attachmentId: string) => void;
}

export function ObservationCard({
  observation,
  team,
  teams,
  categories,
  subcategories,
  tasks,
  messages,
  currentUser,
  externalContacts,
  onConvertToTask,
  onOpenTaskCreation,
  onSendMessage,
  onMarkMessagesAsRead,
  onAddAttachment,
  onRemoveAttachment,
}: ObservationCardProps) {
  const [showDetailModal, setShowDetailModal] = useState(false);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);

    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const category = categories.find(c => c.id === observation.categoryId);
  const subcategory = observation.subcategoryId ? subcategories.find(sc => sc.id === observation.subcategoryId) : null;

  const categoryDisplay = category ? (
    subcategory ? `${category.name} > ${subcategory.name}` : category.name
  ) : '';

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onClick={() => setShowDetailModal(true)}
      className="bg-white rounded-lg border border-neutral-200 cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
      style={{ borderColor: '#5b9bd5' }}
    >
      {category && (
        <div className="h-1 w-full flex">
          <div className="flex-1" style={{ backgroundColor: category.color }} />
          {subcategory && (
            <div className="flex-1" style={{ backgroundColor: subcategory.color }} />
          )}
        </div>
      )}

      <div className="flex gap-2 p-2 relative">
        {/* Image thumbnail */}
        {observation.photos.length > 0 && (
          <div className="w-12 h-12 bg-neutral-200 rounded overflow-hidden flex-shrink-0">
            <img src={observation.photos[0]} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Title */}
        <div className="flex-1 min-w-0 pr-8">
          <h4 className="font-semibold text-[11px] text-neutral-900 leading-tight line-clamp-2">
            {observation.message}
          </h4>
        </div>

        {/* Avatar in top-right corner */}
        <div className="absolute top-1.5 right-1.5 size-6 rounded-full overflow-hidden border border-neutral-200">
          <img
            src={observation.author.avatar}
            alt={observation.author.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </motion.div>

    <ObservationDetailModal
      observation={observation}
      categories={categories}
      subcategories={subcategories}
      tasks={tasks}
      team={team}
      messages={messages}
      currentUser={currentUser}
      isOpen={showDetailModal}
      onClose={() => setShowDetailModal(false)}
      onSendMessage={onSendMessage}
      onMarkMessagesAsRead={onMarkMessagesAsRead}
      onAddAttachment={(file) => onAddAttachment(observation.id, file)}
      onRemoveAttachment={(attachmentId) => onRemoveAttachment(observation.id, attachmentId)}
    />
    </>
  );
}
