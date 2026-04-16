import { ArrowLeft, MessageSquare, Phone, Calendar, Repeat } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import type { Task, Category, Team, TeamMember, Message, Subcategory } from '../App';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { MobileFileUpload } from './MobileFileUpload';
import { LocationMap } from './LocationMap';
import { MobileLayeredIcon } from './MobileLayeredIcon';

interface MobileTaskDetailProps {
  task: Task;
  categories: Category[];
  subcategories: Subcategory[];
  teams: Team[];
  messages: Message[];
  team: TeamMember[];
  onBack: () => void;
  onClaim?: (taskId: string, userId: string) => void;
  onUnclaim?: (taskId: string) => void;
  onSendMessage?: (content: string, taskId?: string) => void;
  onMarkMessagesAsRead?: (messageIds: string[]) => void;
  onAddAttachment?: (file: File) => void;
  onRemoveAttachment?: (attachmentId: string) => void;
  onCallContact?: (contact: TeamMember) => void;
  onMessageContact?: (contact: TeamMember) => void;
  currentUser: TeamMember;
}

export function MobileTaskDetail({
  task,
  categories,
  subcategories,
  teams,
  messages,
  team,
  onBack,
  onClaim,
  onUnclaim,
  onSendMessage,
  onMarkMessagesAsRead,
  onAddAttachment,
  onRemoveAttachment,
  onCallContact,
  onMessageContact,
  currentUser,
}: MobileTaskDetailProps) {
  const [showChat, setShowChat] = useState(false);
  const category = categories.find(c => c.id === task.categoryId);
  const subcategory = task.subcategoryId ? subcategories.find(sc => sc.id === task.subcategoryId) : null;
  const assignedTeam = task.assignedToTeamId ? teams.find(t => t.id === task.assignedToTeamId) : null;
  const borderColor = assignedTeam ? '#9c88ff' : '#4dd0e1';

  const categoryDisplay = category ? (
    subcategory ? `${category.name} > ${subcategory.name}` : category.name
  ) : '';
  const isClaimedByCurrentUser = task.assignedTo?.id === currentUser.id;
  const isClaimedTeamTask = task.assignedToTeamId && task.assignedTo;

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
            <div className="text-xs font-mono opacity-70">TSK-{String(task.number).padStart(3, '0')}</div>
            <div className="font-semibold">{showChat ? 'Task Chat' : 'Task Details'}</div>
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
          {/* Title and Status */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              {assignedTeam && (
                <span className="px-2 py-1 text-xs font-semibold rounded" style={{ backgroundColor: borderColor + '20', color: borderColor }}>
                  {assignedTeam.name}
                </span>
              )}
              <span className={`text-xs px-2 py-1 rounded ${statusColors[task.status]}`}>
                {task.status.replace('-', ' ')}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-neutral-900">{task.title}</h2>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Description</h3>
            <p className="text-sm text-neutral-900 leading-relaxed">{task.description}</p>
          </div>

          {/* Photos */}
          {task.photos.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Photos</h3>
              <div className="space-y-2">
                {task.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Task photo ${index + 1}`}
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
                attachments={task.attachments}
                currentUser={currentUser}
                onAddAttachment={onAddAttachment}
                onRemoveAttachment={onRemoveAttachment}
              />
            </div>
          )}

          {/* Location */}
          {task.location && (
            <div>
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Location</h3>
              <div className="rounded-lg overflow-hidden border border-neutral-200">
                <LocationMap
                  location={task.location}
                  style={{ height: '200px', width: '100%' }}
                />
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                📍 {task.location.latitude.toFixed(6)}, {task.location.longitude.toFixed(6)}
              </p>
            </div>
          )}

          {/* Details */}
          <div className="space-y-3">
            <div>
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Created By</h3>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-pink-100 text-pink-700 border border-pink-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {getInitials(task.createdBy.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-neutral-900">{task.createdBy.name}</div>
                  <div className="text-xs text-neutral-500">{task.createdBy.role}</div>
                </div>
                {task.createdBy.id !== currentUser.id && (
                  <div className="flex items-center gap-3">
                    {onCallContact && (
                      <button
                        onClick={() => onCallContact(task.createdBy)}
                        className="size-9 flex items-center justify-center active:opacity-70"
                      >
                        <MobileLayeredIcon Icon={Phone} size={20} />
                      </button>
                    )}
                    {onMessageContact && (
                      <button
                        onClick={() => onMessageContact(task.createdBy)}
                        className="size-9 flex items-center justify-center active:opacity-70"
                      >
                        <MobileLayeredIcon Icon={MessageSquare} size={20} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {task.assignedTo && (
              <div>
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Assigned To</h3>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-pink-100 text-pink-700 border border-pink-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {getInitials(task.assignedTo.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-neutral-900">{task.assignedTo.name}</div>
                    <div className="text-xs text-neutral-500">{task.assignedTo.role}</div>
                  </div>
                  {task.assignedTo.id !== currentUser.id && (
                    <div className="flex items-center gap-3">
                      {onCallContact && (
                        <button
                          onClick={() => onCallContact(task.assignedTo!)}
                          className="size-9 flex items-center justify-center active:opacity-70"
                        >
                          <MobileLayeredIcon Icon={Phone} size={20} />
                        </button>
                      )}
                      {onMessageContact && (
                        <button
                          onClick={() => onMessageContact(task.assignedTo!)}
                          className="size-9 flex items-center justify-center active:opacity-70"
                        >
                          <MobileLayeredIcon Icon={MessageSquare} size={20} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Created</h3>
              <div className="text-sm text-neutral-900">{formatDate(task.createdAt)}</div>
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

            {task.startDate && (
              <div>
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Start Date</h3>
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
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">End Date</h3>
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-neutral-500" />
                  <span className="text-sm text-neutral-900">
                    {new Date(task.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            )}

            {task.isRecurring && task.recurrencePattern && (
              <div>
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Recurrence</h3>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Repeat className="size-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">
                      Every {task.recurrencePattern.interval} {task.recurrencePattern.type}
                      {task.recurrencePattern.interval > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="text-xs text-purple-700">
                    {task.recurrencePattern.endType === 'never' && 'Repeats indefinitely'}
                    {task.recurrencePattern.endType === 'after' &&
                      `Ends after ${task.recurrencePattern.endAfterOccurrences} occurrences`}
                    {task.recurrencePattern.endType === 'on' && task.recurrencePattern.endDate &&
                      `Ends on ${new Date(task.recurrencePattern.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      ) : (
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatMessages
          messages={taskMessages}
          currentUser={currentUser}
          team={team}
          onMarkAsRead={onMarkMessagesAsRead}
        />

        {onSendMessage && (
          <ChatInput
            onSend={(content) => onSendMessage(content, task.id)}
            placeholder="Type a message about this task..."
          />
        )}
      </div>
      )}

      {/* Action Button */}
      {isClaimedByCurrentUser && isClaimedTeamTask && onUnclaim && (
        <div className="p-4 border-t border-neutral-200 bg-white">
          <button
            onClick={() => onUnclaim(task.id)}
            className="w-full py-3 rounded-lg font-semibold text-white"
            style={{ backgroundColor: borderColor }}
          >
            Unclaim Task
          </button>
        </div>
      )}
      {!task.assignedTo && task.assignedToTeamId && onClaim && (
        <div className="p-4 border-t border-neutral-200 bg-white">
          <button
            onClick={() => onClaim(task.id, currentUser.id)}
            className="w-full py-3 bg-[#9c88ff] rounded-lg font-semibold text-white"
          >
            Claim Task
          </button>
        </div>
      )}
    </motion.div>
  );
}
