import { ArrowLeft, MessageSquare, Phone } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import type { Observation, Category, Task, TeamMember, Message, Subcategory } from '../App';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { MobileFileUpload } from './MobileFileUpload';
import { LocationMap } from './LocationMap';
import { MobileLayeredIcon } from './MobileLayeredIcon';

interface MobileObservationDetailProps {
  observation: Observation;
  categories: Category[];
  subcategories: Subcategory[];
  tasks: Task[];
  messages: Message[];
  team: TeamMember[];
  onBack: () => void;
  onSendMessage?: (content: string, taskId?: string, observationId?: string) => void;
  onMarkMessagesAsRead?: (messageIds: string[]) => void;
  onAddAttachment?: (file: File) => void;
  onRemoveAttachment?: (attachmentId: string) => void;
  onCallContact?: (contact: TeamMember) => void;
  onMessageContact?: (contact: TeamMember) => void;
  currentUser: TeamMember;
}

export function MobileObservationDetail({
  observation,
  categories,
  subcategories,
  tasks,
  messages,
  team,
  onBack,
  onSendMessage,
  onMarkMessagesAsRead,
  onAddAttachment,
  onRemoveAttachment,
  onCallContact,
  onMessageContact,
  currentUser,
}: MobileObservationDetailProps) {
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

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
            <MobileLayeredIcon Icon={ArrowLeft} size={20} />
          </button>
          <div className="flex-1">
            <div className="text-xs font-mono opacity-70">OBS-{String(observation.number).padStart(3, '0')}</div>
            <div className="font-semibold">{showChat ? 'Observation Chat' : 'Observation Details'}</div>
          </div>
          <button
            onClick={() => setShowChat(!showChat)}
            className="relative size-9 flex items-center justify-center rounded-full hover:bg-white/10"
          >
            <MobileLayeredIcon Icon={MessageSquare} size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 size-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Category Banner */}
        {category && (
          <div className="h-1" style={{ backgroundColor: category.color }} />
        )}
      </div>

      {/* Content */}
      {!showChat ? (
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Task Count Badge */}
          {relatedTasks.length > 0 && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
              {relatedTasks.length} task{relatedTasks.length > 1 ? 's' : ''} created
            </div>
          )}

          {/* Message */}
          <div>
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Message</h3>
            <p className="text-sm text-neutral-900 leading-relaxed">{observation.message}</p>
          </div>

          {/* Photos */}
          {observation.photos.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Photos</h3>
              <div className="space-y-2">
                {observation.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Observation photo ${index + 1}`}
                    className="w-full aspect-video object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          {onAddAttachment && onRemoveAttachment && (
            <div>
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Attachments</h3>
              <MobileFileUpload
                attachments={observation.attachments}
                currentUser={currentUser}
                onAddAttachment={onAddAttachment}
                onRemoveAttachment={onRemoveAttachment}
              />
            </div>
          )}

          {/* Location */}
          {observation.location && (
            <div>
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Location</h3>
              <div className="rounded-lg overflow-hidden border border-neutral-200">
                <LocationMap
                  location={observation.location}
                  style={{ height: '200px', width: '100%' }}
                />
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                📍 {observation.location.latitude.toFixed(6)}, {observation.location.longitude.toFixed(6)}
              </p>
            </div>
          )}

          {/* Details */}
          <div className="space-y-3">
            <div>
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Author</h3>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-pink-100 text-pink-700 border border-pink-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {getInitials(observation.author.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-neutral-900">{observation.author.name}</div>
                  <div className="text-xs text-neutral-500">{observation.author.role}</div>
                </div>
                {observation.author.id !== currentUser.id && (
                  <div className="flex items-center gap-3">
                    {onCallContact && (
                      <button
                        onClick={() => onCallContact(observation.author)}
                        className="size-9 flex items-center justify-center active:opacity-70"
                      >
                        <MobileLayeredIcon Icon={Phone} size={20} />
                      </button>
                    )}
                    {onMessageContact && (
                      <button
                        onClick={() => onMessageContact(observation.author)}
                        className="size-9 flex items-center justify-center active:opacity-70"
                      >
                        <MobileLayeredIcon Icon={MessageSquare} size={20} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Timestamp</h3>
              <div className="text-sm text-neutral-900">{formatDate(observation.timestamp)}</div>
            </div>

            {categoryDisplay && (
              <div>
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Category</h3>
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
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Tasks Created</h3>
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
                        <div className="size-6 rounded-full bg-pink-100 text-pink-700 border border-pink-300 flex items-center justify-center text-[9px] font-bold">
                          {getInitials(task.assignedTo.name)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      ) : (
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatMessages
          messages={observationMessages}
          currentUser={currentUser}
          team={team}
          onMarkAsRead={onMarkMessagesAsRead}
        />

        {onSendMessage && (
          <ChatInput
            onSend={(content) => onSendMessage(content, undefined, observation.id)}
            placeholder="Type a message about this observation..."
          />
        )}
      </div>
      )}
    </motion.div>
  );
}
