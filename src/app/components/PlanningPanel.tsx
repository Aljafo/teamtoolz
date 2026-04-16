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
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [filterTeam, setFilterTeam] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<'all' | 'overdue' | 'today' | 'week' | 'month'>('all');
  const [showCompleted, setShowCompleted] = useState(true);
  const [expandRecurring, setExpandRecurring] = useState(false);

  // Helper function for date range filtering
  const isInDateRange = (task: Task) => {
    if (filterDateRange === 'all') return true;

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const taskDate = task.startDate ? new Date(task.startDate) : task.endDate ? new Date(task.endDate) : null;
    if (!taskDate) return false;

    taskDate.setHours(0, 0, 0, 0);

    if (filterDateRange === 'overdue') {
      return taskDate < now && task.status !== 'completed';
    } else if (filterDateRange === 'today') {
      return taskDate.getTime() === now.getTime();
    } else if (filterDateRange === 'week') {
      const weekFromNow = new Date(now);
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return taskDate >= now && taskDate <= weekFromNow;
    } else if (filterDateRange === 'month') {
      const monthFromNow = new Date(now);
      monthFromNow.setMonth(monthFromNow.getMonth() + 1);
      return taskDate >= now && taskDate <= monthFromNow;
    }

    return true;
  };

  // Expand recurring tasks into individual instances
  const expandRecurringTasks = (tasksToExpand: Task[]): Task[] => {
    if (!expandRecurring) return tasksToExpand;

    const expandedTasks: Task[] = [];

    tasksToExpand.forEach(task => {
      if (!task.isRecurring || !task.recurrencePattern || !task.startDate) {
        expandedTasks.push(task);
        return;
      }

      const { type, interval, endType, occurrences, endDate } = task.recurrencePattern;
      const startDate = new Date(task.startDate);
      const taskEndDate = task.endDate ? new Date(task.endDate) : null;
      const duration = taskEndDate ? taskEndDate.getTime() - startDate.getTime() : 0;

      let currentDate = new Date(startDate);
      let occurrenceCount = 0;
      const maxOccurrences = endType === 'after' ? occurrences : 100; // Limit to 100 for performance
      const recurrenceEndDate = endType === 'on' && endDate ? new Date(endDate) : null;

      while (occurrenceCount < maxOccurrences) {
        if (recurrenceEndDate && currentDate > recurrenceEndDate) break;

        const instanceStartDate = new Date(currentDate);
        const instanceEndDate = taskEndDate ? new Date(currentDate.getTime() + duration) : null;

        expandedTasks.push({
          ...task,
          id: `${task.id}-occurrence-${occurrenceCount}`,
          startDate: instanceStartDate,
          endDate: instanceEndDate,
          title: `${task.title} (${occurrenceCount + 1})`,
        });

        occurrenceCount++;
        if (endType === 'never' && occurrenceCount >= 100) break;

        // Calculate next occurrence
        if (type === 'daily') {
          currentDate.setDate(currentDate.getDate() + interval);
        } else if (type === 'weekly') {
          currentDate.setDate(currentDate.getDate() + (interval * 7));
        } else if (type === 'monthly') {
          currentDate.setMonth(currentDate.getMonth() + interval);
        }
      }
    });

    return expandedTasks;
  };

  // Filter tasks based on current filters
  const filteredTasks = expandRecurringTasks(tasks).filter(task => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterCategory !== 'all' && task.categoryId !== filterCategory) return false;
    if (!showCompleted && task.status === 'completed') return false;

    // Assignee filter
    if (filterAssignee !== 'all') {
      if (filterAssignee === 'unassigned') {
        if (task.assignedTo || task.assignedToTeamId || task.assignedToExternal) return false;
      } else {
        const matchesMember = task.assignedTo?.id === filterAssignee;
        const matchesExternal = task.assignedToExternal === filterAssignee;
        if (!matchesMember && !matchesExternal) return false;
      }
    }

    // Team filter
    if (filterTeam !== 'all') {
      if (filterTeam === 'noteam') {
        if (task.assignedToTeamId) return false;
      } else {
        if (task.assignedToTeamId !== filterTeam) return false;
      }
    }

    // Date range filter
    if (!isInDateRange(task)) return false;

    return true;
  });

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: '#f5f5dc' }}>
      {/* Header */}
      <div className="px-8 py-6 flex items-center justify-between" style={{ borderBottom: '1px solid #d4d0b8', backgroundColor: 'white' }}>
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: '#1f2a4e' }}>Planning</h2>
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
      <div className="px-8 py-4 flex flex-wrap items-center gap-4" style={{ borderBottom: '1px solid #d4d0b8', backgroundColor: 'white' }}>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium" style={{ color: '#1f2a4e' }}>Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as Task['status'] | 'all')}
            className="px-3 py-1.5 rounded-lg text-sm"
            style={{ border: '1px solid #d4d0b8', color: '#1f2a4e', backgroundColor: 'white' }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium" style={{ color: '#1f2a4e' }}>Category:</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-sm"
            style={{ border: '1px solid #d4d0b8', color: '#1f2a4e', backgroundColor: 'white' }}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium" style={{ color: '#1f2a4e' }}>Assignee:</label>
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-sm"
            style={{ border: '1px solid #d4d0b8', color: '#1f2a4e', backgroundColor: 'white' }}
          >
            <option value="all">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {team.map(member => (
              <option key={member.id} value={member.id}>{member.name}</option>
            ))}
            {Array.from(new Set(tasks.filter(t => t.assignedToExternal).map(t => t.assignedToExternal))).map(external => (
              <option key={external} value={external}>{external}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium" style={{ color: '#1f2a4e' }}>Team:</label>
          <select
            value={filterTeam}
            onChange={(e) => setFilterTeam(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-sm"
            style={{ border: '1px solid #d4d0b8', color: '#1f2a4e', backgroundColor: 'white' }}
          >
            <option value="all">All Teams</option>
            <option value="noteam">No Team</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium" style={{ color: '#1f2a4e' }}>Date Range:</label>
          <select
            value={filterDateRange}
            onChange={(e) => setFilterDateRange(e.target.value as typeof filterDateRange)}
            className="px-3 py-1.5 rounded-lg text-sm"
            style={{ border: '1px solid #d4d0b8', color: '#1f2a4e', backgroundColor: 'white' }}
          >
            <option value="all">All Dates</option>
            <option value="overdue">Overdue</option>
            <option value="today">Today</option>
            <option value="week">Next 7 Days</option>
            <option value="month">Next 30 Days</option>
          </select>
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={expandRecurring}
            onChange={(e) => setExpandRecurring(e.target.checked)}
            className="size-4"
          />
          <span className="text-sm font-medium" style={{ color: '#1f2a4e' }}>Expand recurring</span>
        </label>

        <label className="flex items-center gap-2 ml-auto">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="size-4"
          />
          <span className="text-sm font-medium" style={{ color: '#1f2a4e' }}>Show completed</span>
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
