import { X, MessageSquare, Calendar, Repeat } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import type { Task, TeamMember, Category, Team, Message, Subcategory } from '../App';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { FileUpload } from './FileUpload';
import { LocationMap } from './LocationMap';

interface TaskDetailModalProps {
  task: Task;
  categories: Category[];
  subcategories: Subcategory[];
  teams: Team[];
  team: TeamMember[];
  messages: Message[];
  currentUser: TeamMember;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (content: string, taskId?: string) => void;
  onMarkMessagesAsRead: (messageIds: string[]) => void;
  onAddAttachment: (file: File) => void;
  onRemoveAttachment: (attachmentId: string) => void;
}

export function TaskDetailModal({
  task,
  categories,
  subcategories,
  teams,
  team,
  messages,
  currentUser,
  isOpen,
  onClose,
  onSendMessage,
  onMarkMessagesAsRead,
  onAddAttachment,
  onRemoveAttachment,
}: TaskDetailModalProps) {
  const [showChat, setShowChat] = useState(false);
  const category = categories.find(c => c.id === task.categoryId);
  const subcategory = task.subcategoryId ? subcategories.find(sc => sc.id === task.subcategoryId) : null;
  const assignedTeam = task.assignedToTeamId ? teams.find(t => t.id === task.assignedToTeamId) : null;
  const borderColor = assignedTeam ? '#9c88ff' : '#4dd0e1';

  const categoryDisplay = category ? (
    subcategory ? `${category.name} > ${subcategory.name}` : category.name
  ) : '';

  const taskMessages = messages.filter(m => m.taskId === task.id);
  const unreadCount = taskMessages.filter(m => m.senderId !== currentUser.id && m.status !== 'read').length;

  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const statusColors = {
    pending: 'bg-neutral-100 text-neutral-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] bg-white rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="border-b-2 overflow-hidden" style={{ borderColor }}>
              {category && (
                <div className="h-2" style={{ backgroundColor: category.color }} />
              )}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono text-neutral-500">TSK-{String(task.number).padStart(3, '0')}</span>
                      {assignedTeam && (
                        <span className="px-2 py-1 text-xs font-medium rounded" style={{ backgroundColor: borderColor + '20', color: borderColor }}>
                          {assignedTeam.name}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded ${statusColors[task.status]}`}>
                        {task.status.replace('-', ' ')}
                      </span>
                    </div>
                    <h2 className="text-2xl font-semibold text-neutral-900">{task.title}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowChat(!showChat)}
                      className="relative size-10 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors"
                    >
                      <MessageSquare className="size-5 text-neutral-600" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 size-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={onClose}
                      className="size-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors"
                    >
                      <X className="size-5 text-neutral-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            {!showChat ? (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-2">Description</h3>
                  <p className="text-neutral-900">{task.description}</p>
                </div>

                {/* Photos */}
                {task.photos.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-3">Photos</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {task.photos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Task photo ${index + 1}`}
                          className="w-full aspect-video object-cover rounded-lg border border-neutral-200"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-2">Created By</h3>
                    <div className="flex items-center gap-2">
                      <img
                        src={task.createdBy.avatar}
                        alt={task.createdBy.name}
                        className="size-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-sm font-medium text-neutral-900">{task.createdBy.name}</div>
                        <div className="text-xs text-neutral-500">{task.createdBy.role}</div>
                      </div>
                    </div>
                  </div>

                  {task.assignedTo && (
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-2">Assigned To</h3>
                      <div className="flex items-center gap-2">
                        <img
                          src={task.assignedTo.avatar}
                          alt={task.assignedTo.name}
                          className="size-8 rounded-full object-cover"
                        />
                        <div>
                          <div className="text-sm font-medium text-neutral-900">{task.assignedTo.name}</div>
                          <div className="text-xs text-neutral-500">{task.assignedTo.role}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-2">Created</h3>
                    <div className="text-sm text-neutral-900">{formatDate(task.createdAt)}</div>
                  </div>

                  {categoryDisplay && (
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-2">Category</h3>
                      <div className="flex items-center gap-2">
                        <div className="size-4 rounded" style={{ backgroundColor: category!.color }} />
                        {subcategory && (
                          <div className="size-4 rounded" style={{ backgroundColor: subcategory.color }} />
                        )}
                        <span className="text-sm text-neutral-900">{categoryDisplay}</span>
                      </div>
                    </div>
                  )}

                  {task.startDate && (
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-2">Start Date</h3>
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-neutral-500" />
                        <span className="text-sm text-neutral-900">
                          {new Date(task.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  )}

                  {task.endDate && (
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-2">End Date</h3>
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-neutral-500" />
                        <span className="text-sm text-neutral-900">
                          {new Date(task.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Recurrence Pattern */}
                {task.isRecurring && task.recurrencePattern && (
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-3">Recurrence</h3>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Repeat className="size-5 text-purple-600" />
                        <span className="font-medium text-purple-900">
                          Every {task.recurrencePattern.interval} {task.recurrencePattern.type}
                          {task.recurrencePattern.interval > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="text-sm text-purple-700">
                        {task.recurrencePattern.endType === 'never' && 'Repeats indefinitely'}
                        {task.recurrencePattern.endType === 'after' &&
                          `Ends after ${task.recurrencePattern.endAfterOccurrences} occurrences`}
                        {task.recurrencePattern.endType === 'on' && task.recurrencePattern.endDate &&
                          `Ends on ${new Date(task.recurrencePattern.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                      </div>
                    </div>
                  </div>
                )}

                {/* Attachments */}
                <div>
                  <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-3">Attachments</h3>
                  <FileUpload
                    attachments={task.attachments}
                    currentUser={currentUser}
                    onAddAttachment={onAddAttachment}
                    onRemoveAttachment={onRemoveAttachment}
                  />
                </div>

                {/* Location */}
                {task.location && (
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-3">Location</h3>
                    <div className="rounded-lg overflow-hidden border-2" style={{ border: '2px solid #d4d0b8' }}>
                      <LocationMap
                        location={task.location}
                        style={{ height: '300px', width: '100%' }}
                      />
                    </div>
                    <p className="text-xs text-neutral-500 mt-2">
                      📍 {task.location.latitude.toFixed(6)}, {task.location.longitude.toFixed(6)}
                    </p>
                  </div>
                )}
              </div>
            </div>
            ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-200">
                <h3 className="font-semibold text-neutral-900">Task Chat</h3>
                <p className="text-sm text-neutral-500">Discuss this task with team members</p>
              </div>

              <ChatMessages
                messages={taskMessages}
                currentUser={currentUser}
                team={team}
                onMarkAsRead={onMarkMessagesAsRead}
              />

              <ChatInput
                onSend={(content) => onSendMessage(content, task.id)}
                placeholder="Type a message about this task..."
              />
            </div>
            )}

            {/* Footer */}
            <div className="border-t border-neutral-200 p-4 bg-neutral-50">
              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
