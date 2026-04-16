import { X, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import type { Observation, TeamMember, Category, Task, Message, Subcategory } from '../App';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { FileUpload } from './FileUpload';
import { LocationMap } from './LocationMap';

interface ObservationDetailModalProps {
  observation: Observation;
  categories: Category[];
  subcategories: Subcategory[];
  tasks: Task[];
  team: TeamMember[];
  messages: Message[];
  currentUser: TeamMember;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (content: string, taskId?: string, observationId?: string) => void;
  onMarkMessagesAsRead: (messageIds: string[]) => void;
  onAddAttachment: (file: File) => void;
  onRemoveAttachment: (attachmentId: string) => void;
}

export function ObservationDetailModal({
  observation,
  categories,
  subcategories,
  tasks,
  team,
  messages,
  currentUser,
  isOpen,
  onClose,
  onSendMessage,
  onMarkMessagesAsRead,
  onAddAttachment,
  onRemoveAttachment,
}: ObservationDetailModalProps) {
  const [showChat, setShowChat] = useState(false);
  const category = categories.find(c => c.id === observation.categoryId);
  const subcategory = observation.subcategoryId ? subcategories.find(sc => sc.id === observation.subcategoryId) : null;
  const relatedTasks = tasks.filter(t => observation.taskIds.includes(t.id));

  const categoryDisplay = category ? (
    subcategory ? `${category.name} > ${subcategory.name}` : category.name
  ) : '';

  const observationMessages = messages.filter(m => m.observationId === observation.id);
  const unreadCount = observationMessages.filter(m => m.senderId !== currentUser.id && m.status !== 'read').length;

  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
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
            <div className="border-b-2 border-[#5b9bd5] overflow-hidden">
              {category && (
                <div className="h-2" style={{ backgroundColor: category.color }} />
              )}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono text-neutral-500">OBS-{String(observation.number).padStart(3, '0')}</span>
                      {relatedTasks.length > 0 && (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-700">
                          {relatedTasks.length} task{relatedTasks.length > 1 ? 's' : ''} created
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-semibold text-neutral-900">Observation Details</h2>
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
                {/* Message */}
                <div>
                  <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-2">Message</h3>
                  <p className="text-neutral-900">{observation.message}</p>
                </div>

                {/* Photos */}
                {observation.photos.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-3">Photos</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {observation.photos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Observation photo ${index + 1}`}
                          className="w-full aspect-video object-cover rounded-lg border border-neutral-200"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-2">Author</h3>
                    <div className="flex items-center gap-2">
                      <img
                        src={observation.author.avatar}
                        alt={observation.author.name}
                        className="size-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-sm font-medium text-neutral-900">{observation.author.name}</div>
                        <div className="text-xs text-neutral-500">{observation.author.role}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-2">Timestamp</h3>
                    <div className="text-sm text-neutral-900">{formatDate(observation.timestamp)}</div>
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
                </div>

                {/* Related Tasks */}
                {relatedTasks.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-3">Tasks Created</h3>
                    <div className="space-y-2">
                      {relatedTasks.map(task => (
                        <div
                          key={task.id}
                          className="p-3 bg-neutral-50 rounded-lg border border-neutral-200"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="text-xs font-mono text-neutral-500 mb-1">
                                TSK-{String(task.number).padStart(3, '0')}
                              </div>
                              <div className="text-sm font-medium text-neutral-900">{task.title}</div>
                            </div>
                            {task.assignedTo && (
                              <img
                                src={task.assignedTo.avatar}
                                alt={task.assignedTo.name}
                                className="size-6 rounded-full object-cover"
                                title={task.assignedTo.name}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attachments */}
                <div>
                  <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-3">Attachments</h3>
                  <FileUpload
                    attachments={observation.attachments}
                    currentUser={currentUser}
                    onAddAttachment={onAddAttachment}
                    onRemoveAttachment={onRemoveAttachment}
                  />
                </div>

                {/* Location */}
                {observation.location && (
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-3">Location</h3>
                    <div className="rounded-lg overflow-hidden border-2" style={{ border: '2px solid #d4d0b8' }}>
                      <LocationMap
                        location={observation.location}
                        style={{ height: '300px', width: '100%' }}
                      />
                    </div>
                    <p className="text-xs text-neutral-500 mt-2">
                      📍 {observation.location.latitude.toFixed(6)}, {observation.location.longitude.toFixed(6)}
                    </p>
                  </div>
                )}
              </div>
            </div>
            ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-200">
                <h3 className="font-semibold text-neutral-900">Observation Chat</h3>
                <p className="text-sm text-neutral-500">Discuss this observation with team members</p>
              </div>

              <ChatMessages
                messages={observationMessages}
                currentUser={currentUser}
                team={team}
                onMarkAsRead={onMarkMessagesAsRead}
              />

              <ChatInput
                onSend={(content) => onSendMessage(content, undefined, observation.id)}
                placeholder="Type a message about this observation..."
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
