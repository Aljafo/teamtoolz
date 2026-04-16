import { useState } from 'react';
import { Calendar as CalendarIcon, BarChart3 } from 'lucide-react';
import type { Task, TeamMember, Category, Team, Message, Subcategory } from '../App';
import { CalendarView } from './CalendarView';
import { GanttView } from './GanttView';

interface PlanningPanelProps {
  tasks: Task[];
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

type PlanningView = 'calendar' | 'gantt';

export function PlanningPanel({
  tasks,
  team,
  teams,
  categories,
  subcategories,
  messages,
  currentUser,
  onUpdateAssignment,
  onUpdateStatus,
  onSendMessage,
  onMarkMessagesAsRead,
  onAddAttachment,
  onRemoveAttachment,
}: PlanningPanelProps) {
  const [activeView, setActiveView] = useState<PlanningView>('calendar');
  const [filterStatus, setFilterStatus] = useState<Task['status'] | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState(true);

  // Filter tasks based on current filters
  const filteredTasks = tasks.filter(task => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterCategory !== 'all' && task.categoryId !== filterCategory) return false;
    if (!showCompleted && task.status === 'completed') return false;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: '#f5f5dc' }}>
      {/* Header */}
      <div className="px-8 py-6 flex items-center justify-between" style={{ borderBottom: '1px solid #d4d0b8', backgroundColor: 'white' }}>
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: '#2c3e72' }}>Planning</h2>
          <p style={{ color: '#6b7280' }}>View tasks on calendar and timeline</p>
        </div>

        {/* View Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveView('calendar')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: activeView === 'calendar' ? '#4dd0e1' : '#f5f5dc',
              color: activeView === 'calendar' ? 'white' : '#6b7280'
            }}
          >
            <CalendarIcon className="size-5" />
            Calendar
          </button>
          <button
            onClick={() => setActiveView('gantt')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: activeView === 'gantt' ? '#4dd0e1' : '#f5f5dc',
              color: activeView === 'gantt' ? 'white' : '#6b7280'
            }}
          >
            <BarChart3 className="size-5" />
            Gantt Chart
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-8 py-4 flex items-center gap-4" style={{ borderBottom: '1px solid #d4d0b8', backgroundColor: 'white' }}>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium" style={{ color: '#2c3e72' }}>Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as Task['status'] | 'all')}
            className="px-3 py-1.5 rounded-lg text-sm"
            style={{ border: '1px solid #d4d0b8', color: '#2c3e72' }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium" style={{ color: '#2c3e72' }}>Category:</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-sm"
            style={{ border: '1px solid #d4d0b8', color: '#2c3e72' }}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 ml-auto">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="size-4"
          />
          <span className="text-sm font-medium" style={{ color: '#2c3e72' }}>Show completed</span>
        </label>

        <div className="text-sm" style={{ color: '#6b7280' }}>
          {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeView === 'calendar' ? (
          <CalendarView
            tasks={filteredTasks}
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
        ) : (
          <GanttView
            tasks={filteredTasks}
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
        )}
      </div>
    </div>
  );
}
