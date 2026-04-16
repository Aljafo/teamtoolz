import { useState } from 'react';
import { CheckCircle2, Circle, Clock, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import type { Task, TeamMember, Category, Team, Message, Location, Subcategory, RecurrencePattern } from '../App';
import { TaskCard } from './TaskCard';
import { DesktopTaskCreation } from './DesktopTaskCreation';

interface TaskPanelProps {
  tasks: Task[];
  team: TeamMember[];
  teams: Team[];
  categories: Category[];
  subcategories: Subcategory[];
  messages: Message[];
  currentUser: TeamMember;
  onAddTask: (
    title: string,
    description: string,
    photos: string[],
    categoryId: string,
    assignTo?: TeamMember,
    assignToTeamId?: string,
    assignToExternal?: string,
    location?: Location,
    subcategoryId?: string,
    startDate?: Date,
    endDate?: Date,
    recurrencePattern?: RecurrencePattern
  ) => void;
  onUpdateAssignment: (taskId: string, member: TeamMember | null) => void;
  onUpdateStatus: (taskId: string, status: Task['status']) => void;
  onSendMessage: (content: string, taskId?: string) => void;
  onMarkMessagesAsRead: (messageIds: string[]) => void;
  onAddAttachment: (taskId: string, file: File) => void;
  onRemoveAttachment: (taskId: string, attachmentId: string) => void;
}

export function TaskPanel({ tasks, team, teams, categories, subcategories, messages, currentUser, onAddTask, onUpdateAssignment, onUpdateStatus, onSendMessage, onMarkMessagesAsRead, onAddAttachment, onRemoveAttachment }: TaskPanelProps) {
  const [showTaskCreation, setShowTaskCreation] = useState(false);
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: '#f5f5dc' }}>
      <div className="px-8 py-6 flex items-center justify-between" style={{ borderBottom: '1px solid #d4d0b8', backgroundColor: 'white' }}>
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: '#2c3e72' }}>Tasks</h2>
          <p style={{ color: '#6b7280' }}>{tasks.length} total tasks</p>
        </div>
        <button
          onClick={() => setShowTaskCreation(true)}
          className="px-4 py-2 rounded-lg font-medium text-white flex items-center gap-2 transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#4dd0e1' }}
        >
          <Plus className="size-4" />
          New Task
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Circle className="size-5 text-neutral-400" />
              <h3 className="font-semibold text-neutral-900">Pending</h3>
              <span className="text-sm text-neutral-500">({pendingTasks.length})</span>
            </div>
            <div className="space-y-3">
              {pendingTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  team={team}
                  teams={teams}
                  categories={categories}
                  subcategories={subcategories}
                  messages={messages}
                  currentUser={currentUser}
                  onUpdateAssignment={onUpdateAssignment}
                  onUpdateStatus={onUpdateStatus}
                  onSendMessage={onSendMessage}
                  onMarkMessagesAsRead={onMarkMessagesAsRead}
                  onAddAttachment={onAddAttachment}
                  onRemoveAttachment={onRemoveAttachment}
                />
              ))}
              {pendingTasks.length === 0 && (
                <div className="bg-white rounded-xl p-6 border border-dashed border-neutral-300 text-center">
                  <p className="text-sm text-neutral-400">No pending tasks</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="size-5 text-blue-600" />
              <h3 className="font-semibold text-neutral-900">In Progress</h3>
              <span className="text-sm text-neutral-500">({inProgressTasks.length})</span>
            </div>
            <div className="space-y-3">
              {inProgressTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  team={team}
                  teams={teams}
                  categories={categories}
                  subcategories={subcategories}
                  messages={messages}
                  currentUser={currentUser}
                  onUpdateAssignment={onUpdateAssignment}
                  onUpdateStatus={onUpdateStatus}
                  onSendMessage={onSendMessage}
                  onMarkMessagesAsRead={onMarkMessagesAsRead}
                  onAddAttachment={onAddAttachment}
                  onRemoveAttachment={onRemoveAttachment}
                />
              ))}
              {inProgressTasks.length === 0 && (
                <div className="bg-white rounded-xl p-6 border border-dashed border-neutral-300 text-center">
                  <p className="text-sm text-neutral-400">No active tasks</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="size-5 text-green-600" />
              <h3 className="font-semibold text-neutral-900">Completed</h3>
              <span className="text-sm text-neutral-500">({completedTasks.length})</span>
            </div>
            <div className="space-y-3">
              {completedTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  team={team}
                  teams={teams}
                  categories={categories}
                  subcategories={subcategories}
                  messages={messages}
                  currentUser={currentUser}
                  onUpdateAssignment={onUpdateAssignment}
                  onUpdateStatus={onUpdateStatus}
                  onSendMessage={onSendMessage}
                  onMarkMessagesAsRead={onMarkMessagesAsRead}
                  onAddAttachment={onAddAttachment}
                  onRemoveAttachment={onRemoveAttachment}
                />
              ))}
              {completedTasks.length === 0 && (
                <div className="bg-white rounded-xl p-6 border border-dashed border-neutral-300 text-center">
                  <p className="text-sm text-neutral-400">No completed tasks</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Creation Modal */}
      {showTaskCreation && (
        <DesktopTaskCreation
          team={team}
          teams={teams}
          categories={categories}
          subcategories={subcategories}
          currentUser={currentUser}
          onClose={() => setShowTaskCreation(false)}
          onCreateTask={(title, description, photos, categoryId, assignTo, assignToTeamId, assignToExternal, location, subcategoryId, startDate, endDate, recurrencePattern) => {
            onAddTask(title, description, photos, categoryId, assignTo, assignToTeamId, assignToExternal, location, subcategoryId, startDate, endDate, recurrencePattern);
            setShowTaskCreation(false);
          }}
        />
      )}
    </div>
  );
}
