import { useState } from 'react';
import { MoreVertical, UserPlus, Mail, Calendar, Repeat } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Task, TeamMember, Category, Team, Message, Subcategory } from '../App';
import { TaskDetailModal } from './TaskDetailModal';

interface TaskCardProps {
  task: Task;
  team: TeamMember[];
  teams: Team[];
  categories: Category[];
  subcategories: Subcategory[];
  messages: Message[];
  currentUser: TeamMember;
  onUpdateAssignment: (taskId: string, member: TeamMember | null) => void;
  onUpdateStatus: (taskId: string, status: Task['status']) => void;
  onSendMessage: (content: string, taskId?: string) => void;
  onMarkMessagesAsRead: (messageIds: string[]) => void;
  onAddAttachment: (taskId: string, file: File) => void;
  onRemoveAttachment: (taskId: string, attachmentId: string) => void;
}

export function TaskCard({ task, team, teams, categories, subcategories, messages, currentUser, onUpdateAssignment, onUpdateStatus, onSendMessage, onMarkMessagesAsRead, onAddAttachment, onRemoveAttachment }: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const statusColors = {
    pending: 'bg-neutral-100 text-neutral-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
  };

  const category = categories.find(c => c.id === task.categoryId);
  const subcategory = task.subcategoryId ? subcategories.find(sc => sc.id === task.subcategoryId) : null;
  const assignedTeam = task.assignedToTeamId ? teams.find(t => t.id === task.assignedToTeamId) : null;

  const categoryDisplay = category ? (
    subcategory ? `${category.name} > ${subcategory.name}` : category.name
  ) : '';

  // Determine border color based on assignment type
  const borderColor = task.assignedToExternal
    ? '#f59e0b' // Orange for external
    : assignedTeam
    ? '#9c88ff' // Purple for team tasks
    : '#4dd0e1'; // Jade for individual

  return (
    <>
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={() => setShowDetailModal(true)}
      className="bg-white rounded-lg border-2 hover:shadow-md transition-all overflow-hidden cursor-pointer"
      style={{ borderColor }}
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
        {task.photos.length > 0 && (
          <div className="w-12 h-12 bg-neutral-200 rounded overflow-hidden flex-shrink-0">
            <img src={task.photos[0]} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Title and team/external name */}
        <div className="flex-1 min-w-0 pr-8">
          {assignedTeam && (
            <div className="text-[9px] font-semibold mb-0.5" style={{ color: borderColor }}>
              {assignedTeam.name}
            </div>
          )}
          {task.assignedToExternal && (
            <div className="text-[9px] font-semibold mb-0.5" style={{ color: borderColor }}>
              📧 {task.assignedToExternal}
            </div>
          )}
          <h4 className="font-semibold text-[11px] text-neutral-900 leading-tight line-clamp-2">
            {task.title}
          </h4>
        </div>

        {/* Avatar in top-right corner */}
        {task.assignedTo && (
          <div className="absolute top-1.5 right-1.5 size-6 rounded-full overflow-hidden border border-neutral-200">
            <img
              src={task.assignedTo.avatar}
              alt={task.assignedTo.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        {task.assignedToExternal && !task.assignedTo && (
          <div className="absolute top-1.5 right-1.5 size-6 rounded-full bg-orange-100 flex items-center justify-center border border-orange-200">
            <Mail className="size-3 text-orange-600" />
          </div>
        )}
      </div>
    </motion.div>

    <TaskDetailModal
      task={task}
      categories={categories}
      subcategories={subcategories}
      teams={teams}
      team={team}
      messages={messages}
      currentUser={currentUser}
      isOpen={showDetailModal}
      onClose={() => setShowDetailModal(false)}
      onSendMessage={onSendMessage}
      onMarkMessagesAsRead={onMarkMessagesAsRead}
      onAddAttachment={(file) => onAddAttachment(task.id, file)}
      onRemoveAttachment={(attachmentId) => onRemoveAttachment(task.id, attachmentId)}
    />
    </>
  );
}
