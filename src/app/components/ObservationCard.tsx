import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Check, Users, Mail } from 'lucide-react';
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
  onSendMessage,
  onMarkMessagesAsRead,
  onAddAttachment,
  onRemoveAttachment,
}: ObservationCardProps) {
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [externalEmail, setExternalEmail] = useState('');
  const [showExternalInput, setShowExternalInput] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowAssignMenu(false);
      }
    };

    if (showAssignMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAssignMenu]);

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

        <div className="relative" onClick={(e) => e.stopPropagation()} ref={menuRef}>
          <button
            onClick={() => setShowAssignMenu(!showAssignMenu)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            {observation.taskIds && observation.taskIds.length > 0 ? 'Create another task' : 'Convert to task'}
            <ArrowRight className="size-4" />
          </button>

          {showAssignMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full left-0 mt-2 bg-white border border-neutral-200 rounded-lg shadow-xl p-2 min-w-56 z-50 max-h-80 overflow-y-auto"
            >
              <div className="text-xs uppercase tracking-wide text-neutral-500 px-2 py-1 mb-1">
                Assign to individual
              </div>
              <button
                onClick={() => {
                  onConvertToTask(observation.id);
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
                    onConvertToTask(observation.id, member);
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

              {teams.length > 0 && (
                <>
                  <div className="border-t border-neutral-200 my-2" />
                  <div className="text-xs uppercase tracking-wide text-neutral-500 px-2 py-1 mb-1">
                    Assign to team
                  </div>
                  {teams.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        onConvertToTask(observation.id, undefined, t.id);
                        setShowAssignMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-2 py-2 text-sm hover:bg-neutral-50 rounded transition-colors"
                    >
                      <div className="size-6 rounded-full bg-purple-100 flex items-center justify-center">
                        <Users className="size-3 text-purple-600" />
                      </div>
                      <span>{t.name}</span>
                    </button>
                  ))}
                </>
              )}

              {/* External Assignment Section */}
              <div className="border-t border-neutral-200 my-2" />
              <div className="text-xs uppercase tracking-wide text-neutral-500 px-2 py-1 mb-1">
                Assign to external party
              </div>

              {!showExternalInput ? (
                <>
                  {/* Show recent external contacts */}
                  {externalContacts.slice(0, 3).map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => {
                        onConvertToTask(observation.id, undefined, undefined, contact.email);
                        setShowAssignMenu(false);
                        setShowExternalInput(false);
                      }}
                      className="w-full flex items-center gap-2 px-2 py-2 text-sm hover:bg-neutral-50 rounded transition-colors"
                    >
                      <div className="size-6 rounded-full bg-orange-100 flex items-center justify-center">
                        <Mail className="size-3 text-orange-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-xs text-neutral-900">{contact.name || contact.email}</div>
                        {contact.name && <div className="text-[10px] text-neutral-500">{contact.email}</div>}
                      </div>
                    </button>
                  ))}

                  {/* New email button */}
                  <button
                    onClick={() => setShowExternalInput(true)}
                    className="w-full flex items-center gap-2 px-2 py-2 text-sm hover:bg-neutral-50 rounded transition-colors text-blue-600"
                  >
                    <div className="size-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <Mail className="size-3 text-blue-600" />
                    </div>
                    <span>Enter new email...</span>
                  </button>
                </>
              ) : (
                <div className="px-2 py-2">
                  <input
                    type="email"
                    value={externalEmail}
                    onChange={(e) => setExternalEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-2 py-1.5 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && externalEmail.trim()) {
                        onConvertToTask(observation.id, undefined, undefined, externalEmail.trim());
                        setShowAssignMenu(false);
                        setShowExternalInput(false);
                        setExternalEmail('');
                      } else if (e.key === 'Escape') {
                        setShowExternalInput(false);
                        setExternalEmail('');
                      }
                    }}
                  />
                  <div className="flex gap-1 mt-1">
                    <button
                      onClick={() => {
                        if (externalEmail.trim()) {
                          onConvertToTask(observation.id, undefined, undefined, externalEmail.trim());
                          setShowAssignMenu(false);
                          setShowExternalInput(false);
                          setExternalEmail('');
                        }
                      }}
                      className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Assign
                    </button>
                    <button
                      onClick={() => {
                        setShowExternalInput(false);
                        setExternalEmail('');
                      }}
                      className="px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
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
