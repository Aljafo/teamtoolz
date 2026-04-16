import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, ArrowUpDown } from 'lucide-react';
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
type GroupBy = 'none' | 'category' | 'assignee' | 'team' | 'status';
type SortBy = 'startDate' | 'endDate' | 'status' | 'title';

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
  const [groupBy, setGroupBy] = useState<GroupBy>('none');
  const [sortBy, setSortBy] = useState<SortBy>('startDate');
  const [sortAscending, setSortAscending] = useState(true);

  // Separate tasks into scheduled and unscheduled
  let scheduledTasks = tasks.filter(t => t.startDate || t.endDate);
  let unscheduledTasks = tasks.filter(t => !t.startDate && !t.endDate);

  // Sort tasks
  const sortTasks = (tasksToSort: Task[]) => {
    return [...tasksToSort].sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'startDate') {
        const aDate = a.startDate ? new Date(a.startDate).getTime() : Infinity;
        const bDate = b.startDate ? new Date(b.startDate).getTime() : Infinity;
        comparison = aDate - bDate;
      } else if (sortBy === 'endDate') {
        const aDate = a.endDate ? new Date(a.endDate).getTime() : Infinity;
        const bDate = b.endDate ? new Date(b.endDate).getTime() : Infinity;
        comparison = aDate - bDate;
      } else if (sortBy === 'status') {
        const statusOrder = { 'pending': 0, 'in-progress': 1, 'completed': 2 };
        comparison = statusOrder[a.status] - statusOrder[b.status];
      } else if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      }

      return sortAscending ? comparison : -comparison;
    });
  };

  scheduledTasks = sortTasks(scheduledTasks);
  unscheduledTasks = sortTasks(unscheduledTasks);

  // Group tasks
  const groupTasks = (tasksToGroup: Task[]) => {
    if (groupBy === 'none') {
      return [{ name: 'All Tasks', tasks: tasksToGroup, color: undefined }];
    }

    const groups: { name: string; tasks: Task[]; color?: string }[] = [];

    if (groupBy === 'category') {
      const categoryMap = new Map<string, Task[]>();
      tasksToGroup.forEach(task => {
        const category = categories.find(c => c.id === task.categoryId);
        const key = category?.name || 'Uncategorized';
        if (!categoryMap.has(key)) categoryMap.set(key, []);
        categoryMap.get(key)!.push(task);
      });
      categoryMap.forEach((tasks, name) => {
        const category = categories.find(c => c.name === name);
        groups.push({ name, tasks, color: category?.color });
      });
    } else if (groupBy === 'assignee') {
      const assigneeMap = new Map<string, Task[]>();
      tasksToGroup.forEach(task => {
        const key = task.assignedTo?.name || task.assignedToExternal || 'Unassigned';
        if (!assigneeMap.has(key)) assigneeMap.set(key, []);
        assigneeMap.get(key)!.push(task);
      });
      assigneeMap.forEach((tasks, name) => {
        groups.push({ name, tasks });
      });
    } else if (groupBy === 'team') {
      const teamMap = new Map<string, Task[]>();
      tasksToGroup.forEach(task => {
        const taskTeam = task.assignedToTeamId ? teams.find(t => t.id === task.assignedToTeamId) : null;
        const key = taskTeam?.name || 'No Team';
        if (!teamMap.has(key)) teamMap.set(key, []);
        teamMap.get(key)!.push(task);
      });
      teamMap.forEach((tasks, name) => {
        groups.push({ name, tasks });
      });
    } else if (groupBy === 'status') {
      const statusMap = new Map<string, Task[]>();
      tasksToGroup.forEach(task => {
        const key = task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1);
        if (!statusMap.has(key)) statusMap.set(key, []);
        statusMap.get(key)!.push(task);
      });
      statusMap.forEach((tasks, name) => {
        groups.push({ name, tasks });
      });
    }

    return groups;
  };

  const groupedScheduledTasks = groupTasks(scheduledTasks);
  const groupedUnscheduledTasks = groupTasks(unscheduledTasks);

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
      <div className="px-8 py-4 flex items-center justify-between gap-6" style={{ borderBottom: '1px solid #d4d0b8', backgroundColor: 'white' }}>
        <h3 className="text-lg font-semibold" style={{ color: '#2c3e72' }}>Timeline</h3>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{ color: '#6b7280' }}>Zoom:</span>
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

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{ color: '#6b7280' }}>Group by:</span>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupBy)}
              className="px-3 py-1.5 rounded-lg text-sm"
              style={{ border: '1px solid #d4d0b8', color: '#2c3e72', backgroundColor: 'white' }}
            >
              <option value="none">None</option>
              <option value="category">Category</option>
              <option value="assignee">Assignee</option>
              <option value="team">Team</option>
              <option value="status">Status</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{ color: '#6b7280' }}>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-3 py-1.5 rounded-lg text-sm"
              style={{ border: '1px solid #d4d0b8', color: '#2c3e72', backgroundColor: 'white' }}
            >
              <option value="startDate">Start Date</option>
              <option value="endDate">End Date</option>
              <option value="status">Status</option>
              <option value="title">Title</option>
            </select>
            <button
              onClick={() => setSortAscending(!sortAscending)}
              className="p-1.5 rounded-lg hover:bg-neutral-100"
              title={sortAscending ? 'Ascending' : 'Descending'}
            >
              <ArrowUpDown className="size-4" style={{ color: '#6b7280', transform: sortAscending ? 'none' : 'scaleY(-1)' }} />
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
          {groupedScheduledTasks.map((group, groupIndex) => (
            <div key={`scheduled-group-${groupIndex}`}>
              {groupBy !== 'none' && (
                <div
                  className="sticky px-4 py-2 text-xs font-semibold uppercase tracking-wide"
                  style={{
                    borderBottom: '1px solid #d4d0b8',
                    backgroundColor: group.color || '#e8e6d5',
                    color: group.color ? 'white' : '#2c3e72',
                    top: '45px',
                    zIndex: 9
                  }}
                >
                  {group.name} ({group.tasks.length})
                </div>
              )}
              {group.tasks.map(task => {
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
            </div>
          ))}

          {/* Unscheduled Section */}
          {unscheduledTasks.length > 0 && (
            <>
              <div className="sticky px-4 py-3 font-semibold text-sm" style={{ borderBottom: '1px solid #d4d0b8', backgroundColor: '#fef3c7', color: '#92400e', top: '0', zIndex: 10 }}>
                Unscheduled ({unscheduledTasks.length})
              </div>
              {groupedUnscheduledTasks.map((group, groupIndex) => (
                <div key={`unscheduled-group-${groupIndex}`}>
                  {groupBy !== 'none' && (
                    <div
                      className="sticky px-4 py-2 text-xs font-semibold uppercase tracking-wide"
                      style={{
                        borderBottom: '1px solid #d4d0b8',
                        backgroundColor: group.color ? `${group.color}dd` : '#fde68a',
                        color: group.color ? 'white' : '#92400e',
                        top: '45px',
                        zIndex: 9
                      }}
                    >
                      {group.name} ({group.tasks.length})
                    </div>
                  )}
                  {group.tasks.map(task => {
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
                </div>
              ))}
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
              {groupedScheduledTasks.map((group, groupIndex) => (
                <div key={`timeline-scheduled-group-${groupIndex}`}>
                  {groupBy !== 'none' && (
                    <div
                      style={{
                        height: '32px',
                        borderBottom: '1px solid #d4d0b8',
                        backgroundColor: group.color ? `${group.color}20` : '#e8e6d520'
                      }}
                    />
                  )}
                  {group.tasks.map((task, index) => {
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
                </div>
              ))}

              {/* Unscheduled Tasks Rows */}
              {unscheduledTasks.length > 0 && (
                <>
                  <div
                    style={{
                      height: '45px',
                      borderBottom: '1px solid #d4d0b8',
                      backgroundColor: '#fef3c7'
                    }}
                  />
                  {groupedUnscheduledTasks.map((group, groupIndex) => (
                    <div key={`timeline-unscheduled-group-${groupIndex}`}>
                      {groupBy !== 'none' && (
                        <div
                          style={{
                            height: '32px',
                            borderBottom: '1px solid #d4d0b8',
                            backgroundColor: group.color ? `${group.color}30` : '#fde68a'
                          }}
                        />
                      )}
                      {group.tasks.map((task, index) => (
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
                  ))}
                </>
              )}
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
