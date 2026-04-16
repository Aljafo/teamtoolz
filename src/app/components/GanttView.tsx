import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import type { Task, TeamMember, Category, Team, Message, Subcategory } from '../App';
import { TaskDetailModal } from './TaskDetailModal';

interface GanttViewProps {
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

type ZoomLevel = 'day' | 'week' | 'month';

export function GanttView({
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
}: GanttViewProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('week');
  const [timelineStart, setTimelineStart] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  // Separate tasks into scheduled and unscheduled
  const scheduledTasks = tasks.filter(t => t.startDate || t.endDate);
  const unscheduledTasks = tasks.filter(t => !t.startDate && !t.endDate);

  // Calculate timeline range
  const getTimelineRange = useMemo(() => {
    if (scheduledTasks.length === 0) {
      // Default range: current month
      const start = new Date(timelineStart);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      return { start, end };
    }

    // Find earliest start and latest end from all scheduled tasks
    const dates = scheduledTasks.flatMap(t => [
      t.startDate ? new Date(t.startDate) : null,
      t.endDate ? new Date(t.endDate) : null
    ]).filter(d => d !== null) as Date[];

    const earliest = new Date(Math.min(...dates.map(d => d.getTime())));
    const latest = new Date(Math.max(...dates.map(d => d.getTime())));

    // Add padding
    const start = new Date(earliest);
    start.setDate(start.getDate() - 7);
    const end = new Date(latest);
    end.setDate(end.getDate() + 7);

    return { start, end };
  }, [scheduledTasks, timelineStart]);

  // Generate timeline columns based on zoom level
  const getTimelineColumns = () => {
    const columns: Date[] = [];
    const { start, end } = getTimelineRange;
    const current = new Date(start);

    while (current <= end) {
      columns.push(new Date(current));

      if (zoomLevel === 'day') {
        current.setDate(current.getDate() + 1);
      } else if (zoomLevel === 'week') {
        current.setDate(current.getDate() + 7);
      } else {
        current.setMonth(current.getMonth() + 1);
      }
    }

    return columns;
  };

  const timelineColumns = getTimelineColumns();

  // Format column header based on zoom level
  const formatColumnHeader = (date: Date) => {
    if (zoomLevel === 'day') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (zoomLevel === 'week') {
      return `Week ${Math.ceil(date.getDate() / 7)}`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
  };

  // Calculate task bar position and width
  const getTaskBarStyle = (task: Task) => {
    const { start: timelineStart, end: timelineEnd } = getTimelineRange;
    const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));

    const taskStart = task.startDate ? new Date(task.startDate) : task.endDate ? new Date(task.endDate) : null;
    const taskEnd = task.endDate ? new Date(task.endDate) : task.startDate ? new Date(task.startDate) : null;

    if (!taskStart || !taskEnd) return null;

    const startDays = Math.floor((taskStart.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const durationDays = Math.max(1, Math.ceil((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    const leftPercent = (startDays / totalDays) * 100;
    const widthPercent = (durationDays / totalDays) * 100;

    return {
      left: `${Math.max(0, leftPercent)}%`,
      width: `${Math.min(100 - leftPercent, widthPercent)}%`,
    };
  };

  // Get task bar color based on status
  const getTaskBarColor = (task: Task) => {
    const statusColors = {
      'pending': '#9ca3af',
      'in-progress': '#3b82f6',
      'completed': '#10b981',
    };
    return statusColors[task.status];
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Controls */}
      <div className="px-8 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #d4d0b8', backgroundColor: 'white' }}>
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold" style={{ color: '#2c3e72' }}>Timeline</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: '#6b7280' }}>Zoom:</span>
            <button
              onClick={() => setZoomLevel('day')}
              className="px-3 py-1.5 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: zoomLevel === 'day' ? '#4dd0e1' : '#f5f5dc',
                color: zoomLevel === 'day' ? 'white' : '#6b7280'
              }}
            >
              Day
            </button>
            <button
              onClick={() => setZoomLevel('week')}
              className="px-3 py-1.5 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: zoomLevel === 'week' ? '#4dd0e1' : '#f5f5dc',
                color: zoomLevel === 'week' ? 'white' : '#6b7280'
              }}
            >
              Week
            </button>
            <button
              onClick={() => setZoomLevel('month')}
              className="px-3 py-1.5 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: zoomLevel === 'month' ? '#4dd0e1' : '#f5f5dc',
                color: zoomLevel === 'month' ? 'white' : '#6b7280'
              }}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="flex-1 flex overflow-hidden">
        {/* Task List Column */}
        <div className="w-80 flex-shrink-0 overflow-y-auto" style={{ borderRight: '1px solid #d4d0b8', backgroundColor: 'white' }}>
          <div className="sticky top-0 z-10 px-4 py-3 font-semibold text-sm" style={{ borderBottom: '1px solid #d4d0b8', backgroundColor: '#f5f5dc', color: '#2c3e72' }}>
            Task Name
          </div>

          {/* Scheduled Tasks */}
          {scheduledTasks.map(task => {
            const assignedTeam = task.assignedToTeamId ? teams.find(t => t.id === task.assignedToTeamId) : null;
            return (
              <div
                key={task.id}
                className="px-4 py-3 flex items-center gap-3 hover:bg-neutral-50 cursor-pointer"
                style={{ borderBottom: '1px solid #f3f4f6' }}
                onClick={() => setSelectedTask(task)}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: '#2c3e72' }}>
                    {task.title}
                  </div>
                  <div className="text-xs truncate" style={{ color: '#6b7280' }}>
                    {task.assignedTo?.name || assignedTeam?.name || task.assignedToExternal || 'Unassigned'}
                  </div>
                </div>
                <div className={`size-2 rounded-full`} style={{ backgroundColor: getTaskBarColor(task) }} />
              </div>
            );
          })}

          {/* Unscheduled Section */}
          {unscheduledTasks.length > 0 && (
            <>
              <div className="sticky px-4 py-3 font-semibold text-sm" style={{ borderBottom: '1px solid #d4d0b8', backgroundColor: '#fef3c7', color: '#92400e' }}>
                Unscheduled ({unscheduledTasks.length})
              </div>
              {unscheduledTasks.map(task => {
                const assignedTeam = task.assignedToTeamId ? teams.find(t => t.id === task.assignedToTeamId) : null;
                return (
                  <div
                    key={task.id}
                    className="px-4 py-3 flex items-center gap-3 hover:bg-neutral-50 cursor-pointer"
                    style={{ borderBottom: '1px solid #f3f4f6', backgroundColor: '#fffbeb' }}
                    onClick={() => setSelectedTask(task)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate" style={{ color: '#2c3e72' }}>
                        {task.title}
                      </div>
                      <div className="text-xs truncate" style={{ color: '#6b7280' }}>
                        {task.assignedTo?.name || assignedTeam?.name || task.assignedToExternal || 'Unassigned'}
                      </div>
                    </div>
                    <div className={`size-2 rounded-full`} style={{ backgroundColor: getTaskBarColor(task) }} />
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Timeline Area */}
        <div className="flex-1 overflow-auto">
          <div className="relative" style={{ minWidth: '800px' }}>
            {/* Timeline Header */}
            <div className="sticky top-0 z-10 flex" style={{ borderBottom: '1px solid #d4d0b8', backgroundColor: '#f5f5dc' }}>
              {timelineColumns.map((date, index) => (
                <div
                  key={index}
                  className="flex-1 px-2 py-3 text-center text-xs font-medium"
                  style={{
                    borderRight: '1px solid #d4d0b8',
                    backgroundColor: isToday(date) ? '#e0f7fa' : '#f5f5dc',
                    color: isToday(date) ? '#4dd0e1' : '#6b7280',
                    minWidth: '80px'
                  }}
                >
                  {formatColumnHeader(date)}
                </div>
              ))}
            </div>

            {/* Task Bars */}
            <div className="relative">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex pointer-events-none">
                {timelineColumns.map((date, index) => (
                  <div
                    key={index}
                    className="flex-1"
                    style={{
                      borderRight: '1px solid #e5e7eb',
                      backgroundColor: isToday(date) ? '#e0f7fa20' : 'transparent',
                      minWidth: '80px'
                    }}
                  />
                ))}
              </div>

              {/* Task Rows */}
              {scheduledTasks.map((task, index) => {
                const barStyle = getTaskBarStyle(task);
                const category = categories.find(c => c.id === task.categoryId);

                if (!barStyle) return null;

                return (
                  <div
                    key={task.id}
                    className="relative"
                    style={{
                      height: '52px',
                      borderBottom: '1px solid #f3f4f6'
                    }}
                  >
                    <button
                      onClick={() => setSelectedTask(task)}
                      className="absolute top-1/2 -translate-y-1/2 h-8 rounded-lg flex items-center px-3 text-xs font-medium text-white shadow-sm hover:shadow-md transition-shadow"
                      style={{
                        ...barStyle,
                        backgroundColor: category ? category.color : getTaskBarColor(task),
                        minWidth: '60px'
                      }}
                    >
                      <span className="truncate">{task.title}</span>
                    </button>
                  </div>
                );
              })}

              {/* Unscheduled Tasks Rows */}
              {unscheduledTasks.map((task, index) => (
                <div
                  key={task.id}
                  style={{
                    height: '52px',
                    borderBottom: '1px solid #f3f4f6',
                    backgroundColor: '#fffbeb'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          categories={categories}
          subcategories={subcategories}
          teams={teams}
          team={team}
          messages={messages}
          currentUser={currentUser}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onSendMessage={onSendMessage}
          onMarkMessagesAsRead={onMarkMessagesAsRead}
          onAddAttachment={(file) => onAddAttachment(selectedTask.id, file)}
          onRemoveAttachment={(attachmentId) => onRemoveAttachment(selectedTask.id, attachmentId)}
        />
      )}
    </div>
  );
}
