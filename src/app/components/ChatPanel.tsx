import { useState } from 'react';
import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Observation, TeamMember, Task, Category, Team, Message, ExternalContact, Location, Subcategory } from '../App';
import { ObservationCard } from './ObservationCard';
import { Dashboard } from './Dashboard';
import { DesktopObservationCreation } from './DesktopObservationCreation';

interface ChatPanelProps {
  observations: Observation[];
  currentUser: TeamMember;
  team: TeamMember[];
  teams: Team[];
  tasks: Task[];
  categories: Category[];
  subcategories: Subcategory[];
  messages: Message[];
  externalContacts: ExternalContact[];
  onAddObservation: (message: string, photos: string[], categoryId: string, location?: Location, subcategoryId?: string) => void;
  onConvertToTask: (observationId: string, assignTo?: TeamMember, assignToTeamId?: string, assignToExternal?: string) => void;
  onUpdateTaskStatus: (taskId: string, status: Task['status']) => void;
  onSendMessage: (content: string, taskId?: string, observationId?: string) => void;
  onMarkMessagesAsRead: (messageIds: string[]) => void;
  onAddTaskAttachment: (taskId: string, file: File) => void;
  onRemoveTaskAttachment: (taskId: string, attachmentId: string) => void;
  onAddObservationAttachment: (observationId: string, file: File) => void;
  onRemoveObservationAttachment: (observationId: string, attachmentId: string) => void;
  observationsOnly?: boolean;
}

export function ChatPanel({
  observations,
  currentUser,
  team,
  teams,
  tasks,
  categories,
  subcategories,
  messages,
  externalContacts,
  onAddObservation,
  onConvertToTask,
  onUpdateTaskStatus,
  onSendMessage,
  onMarkMessagesAsRead,
  onAddTaskAttachment,
  onRemoveTaskAttachment,
  onAddObservationAttachment,
  onRemoveObservationAttachment,
  observationsOnly = false,
}: ChatPanelProps) {
  const [showObservationCreation, setShowObservationCreation] = useState(false);

  if (!observationsOnly) {
    return (
      <Dashboard
        tasks={tasks}
        observations={observations}
        team={team}
        teams={teams}
        categories={categories}
        subcategories={subcategories}
        messages={messages}
        currentUser={currentUser}
        externalContacts={externalContacts}
        onConvertToTask={onConvertToTask}
        onUpdateTaskStatus={onUpdateTaskStatus}
        onSendMessage={onSendMessage}
        onMarkMessagesAsRead={onMarkMessagesAsRead}
        onAddTaskAttachment={onAddTaskAttachment}
        onRemoveTaskAttachment={onRemoveTaskAttachment}
        onAddObservationAttachment={onAddObservationAttachment}
        onRemoveObservationAttachment={onRemoveObservationAttachment}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: '#f5f5dc' }}>
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #d4d0b8', backgroundColor: 'white' }}>
        <div>
          <h2 className="font-semibold" style={{ color: '#2c3e72' }}>Observations</h2>
          <p className="text-sm" style={{ color: '#6b7280' }}>Share what you see, convert to tasks</p>
        </div>
        <button
          onClick={() => setShowObservationCreation(true)}
          className="px-4 py-2 rounded-lg font-medium text-white flex items-center gap-2 transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#5b9bd5' }}
        >
          <Plus className="size-4" />
          New Observation
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-4 max-w-3xl pb-48">
          <AnimatePresence initial={false}>
            {observations.map((observation) => (
              <ObservationCard
                key={observation.id}
                observation={observation}
                team={team}
                teams={teams}
                categories={categories}
                subcategories={subcategories}
                tasks={tasks}
                messages={messages}
                currentUser={currentUser}
                externalContacts={externalContacts}
                onConvertToTask={onConvertToTask}
                onSendMessage={onSendMessage}
                onMarkMessagesAsRead={onMarkMessagesAsRead}
                onAddAttachment={onAddObservationAttachment}
                onRemoveAttachment={onRemoveObservationAttachment}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Observation Creation Modal */}
      {showObservationCreation && (
        <DesktopObservationCreation
          team={team}
          categories={categories}
          subcategories={subcategories}
          currentUser={currentUser}
          onClose={() => setShowObservationCreation(false)}
          onCreateObservation={(message, photos, categoryId, location, subcategoryId) => {
            onAddObservation(message, photos, categoryId, location, subcategoryId);
            setShowObservationCreation(false);
          }}
        />
      )}
    </div>
  );
}
