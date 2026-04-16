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
      className="bg-white rounded-xl border-2 hover:shadow-md transition-all overflow-hidden cursor-pointer min-h-[280px] flex flex-col"
      style={{ borderColor }}
    >
      {category && (
        <div className="h-2 w-full flex">
          <div className="flex-1" style={{ backgroundColor: category.color }} />
          {subcategory && (
            <div className="flex-1" style={{ backgroundColor: subcategory.color }} />
          )}
        </div>
      )}
      <div className="p-4 flex flex-col flex-1">
      <div className="flex items-start gap-2 mb-3">
        <div className="flex-1 min-w-0">
          {assignedTeam && (
            <div className="mb-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: borderColor + '20', color: borderColor }}>
                {assignedTeam.name}
              </span>
            </div>
          )}
          {task.assignedToExternal && (
            <div className="mb-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                <Mail className="size-3" />
                {task.assignedToExternal}
              </span>
            </div>
          )}
          <h4 className="text-sm font-medium text-neutral-900 mb-1">{task.title}</h4>
          {task.description !== task.title && (
            <p className="text-xs text-neutral-600 line-clamp-2">{task.description}</p>
          )}
        </div>

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="size-6 flex items-center justify-center rounded hover:bg-neutral-200 transition-colors"
          >
            <MoreVertical className="size-4 text-neutral-600" />
          </button>

          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-0 top-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg p-1 min-w-40 z-10"
            >
              <button
                onClick={() => {
                  onUpdateStatus(task.id, 'pending');
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 text-sm hover:bg-neutral-50 rounded transition-colors"
              >
                Mark as Pending
              </button>
              <button
                onClick={() => {
                  onUpdateStatus(task.id, 'in-progress');
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 text-sm hover:bg-neutral-50 rounded transition-colors"
              >
                Mark as In Progress
              </button>
              <button
                onClick={() => {
                  onUpdateStatus(task.id, 'completed');
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 text-sm hover:bg-neutral-50 rounded transition-colors"
              >
                Mark as Completed
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {task.photos.length > 0 && (
        <div className="mb-3">
          <img
            src={task.photos[0]}
            alt="Task"
            className="w-full aspect-video object-cover rounded"
          />
        </div>
      )}

      {categoryDisplay && (
        <div className="text-xs text-neutral-600 mb-2">
          {categoryDisplay}
        </div>
      )}

      {/* Date and Recurrence Display */}
      {(task.startDate || task.endDate || task.isRecurring) && (
        <div className="mb-2 space-y-1">
          {(task.startDate || task.endDate) && (
            <div className="flex items-center gap-1.5 text-xs text-neutral-600">
              <Calendar className="size-3" />
              <span>
                {task.startDate && new Date(task.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {task.startDate && task.endDate && ' - '}
                {task.endDate && new Date(task.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          )}
          {task.isRecurring && (
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                <Repeat className="size-3" />
                Recurring
              </span>
            </div>
          )}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-2">
        <span className={`text-xs px-2 py-0.5 rounded ${statusColors[task.status]}`}>
          {task.status.replace('-', ' ')}
        </span>

        <div className="relative" onClick={(e) => e.stopPropagation()}>
          {task.assignedTo ? (
            <button
              onClick={() => setShowAssignMenu(!showAssignMenu)}
              className="flex items-center gap-1.5 hover:bg-neutral-200 rounded px-1.5 py-0.5 transition-colors"
            >
              <img
                src={task.assignedTo.avatar}
                alt={task.assignedTo.name}
                className="size-5 rounded-full object-cover"
              />
              <span className="text-xs text-neutral-700">{task.assignedTo.name.split(' ')[0]}</span>
            </button>
          ) : task.assignedToExternal ? (
            <button
              onClick={() => setShowAssignMenu(!showAssignMenu)}
              className="flex items-center gap-1.5 hover:bg-neutral-200 rounded px-1.5 py-0.5 transition-colors"
            >
              <div className="size-5 rounded-full bg-orange-100 flex items-center justify-center">
                <Mail className="size-3 text-orange-600" />
              </div>
              <span className="text-xs text-orange-700">External</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAssignMenu(!showAssignMenu)}
              className="flex items-center gap-1 text-xs text-neutral-500 hover:bg-neutral-200 rounded px-1.5 py-0.5 transition-colors"
            >
              <UserPlus className="size-3" />
              <span>Assign</span>
            </button>
          )}

          <AnimatePresence>
            {showAssignMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 bottom-full mb-2 bg-white border border-neutral-200 rounded-lg shadow-lg p-2 min-w-48 z-10"
              >
                <div className="text-xs uppercase tracking-wide text-neutral-500 px-2 py-1 mb-1">
                  Assign to
                </div>
                <button
                  onClick={() => {
                    onUpdateAssignment(task.id, null);
                    setShowAssignMenu(false);
                  }}
                  className="w-full text-left px-2 py-2 text-sm hover:bg-neutral-50 rounded transition-colors"
                >
                  Unassigned
                </button>
                {team.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => {
                      onUpdateAssignment(task.id, member);
                      setShowAssignMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-2 text-sm hover:bg-neutral-50 rounded transition-colors"
                  >
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="size-6 rounded-full object-cover"
                    />
                    <span>{member.name}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
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
