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
      className="bg-white rounded-xl border border-neutral-200 cursor-pointer hover:shadow-md transition-shadow min-h-[280px] flex flex-col relative"
    >
      {category && (
        <div className="h-2 w-full rounded-t-xl flex">
          <div className="flex-1" style={{ backgroundColor: category.color }} />
          {subcategory && (
            <div className="flex-1" style={{ backgroundColor: subcategory.color }} />
          )}
        </div>
      )}
      <div className="p-4 flex flex-col flex-1">
      <div className="flex items-start gap-3 mb-3">
        <img
          src={observation.author.avatar}
          alt={observation.author.name}
          className="size-10 rounded-full object-cover flex-shrink-0"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-medium text-neutral-900">{observation.author.name}</span>
            <span className="text-sm text-neutral-500">{formatTime(observation.timestamp)}</span>
          </div>
        </div>
      </div>

      <p className="text-neutral-700 mb-3 text-sm line-clamp-3">{observation.message}</p>

      {observation.photos.length > 0 && (
        <div className="mb-3">
          <img
            src={observation.photos[0]}
            alt="Observation"
            className="w-full aspect-video object-cover rounded"
          />
        </div>
      )}

      <div className="mt-auto">
        {categoryDisplay && (
          <div className="text-xs text-neutral-600 mb-2">
            {categoryDisplay}
          </div>
        )}
        {observation.taskIds && observation.taskIds.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-green-600 mb-2">
            <Check className="size-4" />
            <span>{observation.taskIds.length} task{observation.taskIds.length > 1 ? 's' : ''} created</span>
          </div>
        )}

        <div onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onOpenTaskCreation(observation.id)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            {observation.taskIds && observation.taskIds.length > 0 ? 'Create another task' : 'Convert to task'}
            <ArrowRight className="size-4" />
          </button>
        </div>
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
