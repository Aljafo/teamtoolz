import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Task, TeamMember, Category, Team, Message, Subcategory } from '../App';
import { TaskDetailModal } from './TaskDetailModal';

interface CalendarViewProps {
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

type CalendarViewMode = 'month' | 'week' | 'day';

export function CalendarView({
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
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');

  // Get year and month from current date
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Navigate functions based on view mode
  const navigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);

    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'prev' ? -1 : 1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'prev' ? -7 : 7));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'prev' ? -1 : 1));
    }

    setCurrentDate(newDate);
  };

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get week range for current date
  const getWeekRange = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay()); // Go to Sunday
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Check if a date is today
  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day &&
           today.getMonth() === month &&
           today.getFullYear() === year;
  };

  // Get tasks for a specific date
  const getTasksForDate = (day: number): Task[] => {
    const targetDate = new Date(year, month, day);

    return tasks.filter(task => {
      if (!task.startDate && !task.endDate) return false;

      const start = task.startDate ? new Date(task.startDate) : null;
      const end = task.endDate ? new Date(task.endDate) : null;

      // Reset time parts for date comparison
      targetDate.setHours(0, 0, 0, 0);
      if (start) start.setHours(0, 0, 0, 0);
      if (end) end.setHours(0, 0, 0, 0);

      // Task starts on this date
      if (start && start.getTime() === targetDate.getTime()) return true;

      // Task ends on this date
      if (end && end.getTime() === targetDate.getTime()) return true;

      // Task spans this date
      if (start && end && start.getTime() <= targetDate.getTime() && end.getTime() >= targetDate.getTime()) {
        return true;
      }

      return false;
    });
  };

  // Build calendar grid (6 weeks max)
  const calendarDays: (number | null)[] = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }

  // Add days of month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Add empty cells to complete the grid (should be 35 or 42 cells total)
  while (calendarDays.length < 42) {
    calendarDays.push(null);
  }

  // Format header title based on view mode
  const getHeaderTitle = () => {
    if (viewMode === 'month') {
      return `${monthNames[month]} ${year}`;
    } else if (viewMode === 'week') {
      const weekDates = getWeekRange();
      const start = weekDates[0];
      const end = weekDates[6];
      if (start.getMonth() === end.getMonth()) {
        return `${monthNames[start.getMonth()]} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`;
      } else {
        return `${monthNames[start.getMonth()]} ${start.getDate()} - ${monthNames[end.getMonth()]} ${end.getDate()}, ${year}`;
      }
    } else {
      return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Calendar Controls */}
      <div className="px-8 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #d4d0b8', backgroundColor: 'white' }}>
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-semibold" style={{ color: '#2c3e72' }}>
            {getHeaderTitle()}
          </h3>
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode('month')}
              className="px-3 py-1.5 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: viewMode === 'month' ? '#4dd0e1' : '#f5f5dc',
                color: viewMode === 'month' ? 'white' : '#6b7280'
              }}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className="px-3 py-1.5 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: viewMode === 'week' ? '#4dd0e1' : '#f5f5dc',
                color: viewMode === 'week' ? 'white' : '#6b7280'
              }}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('day')}
              className="px-3 py-1.5 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: viewMode === 'day' ? '#4dd0e1' : '#f5f5dc',
                color: viewMode === 'day' ? 'white' : '#6b7280'
              }}
            >
              Day
            </button>
          </div>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 rounded-lg text-sm font-medium"
            style={{ backgroundColor: '#f5f5dc', color: '#2c3e72' }}
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('prev')}
            className="size-9 flex items-center justify-center rounded-lg hover:bg-neutral-100"
            style={{ color: '#2c3e72' }}
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            onClick={() => navigate('next')}
            className="size-9 flex items-center justify-center rounded-lg hover:bg-neutral-100"
            style={{ color: '#2c3e72' }}
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto p-8">
        {viewMode === 'month' && (
          <div className="grid grid-cols-7 gap-2 h-full">
            {/* Day Headers */}
            {dayNames.map(day => (
              <div
                key={day}
                className="text-center text-sm font-semibold py-2"
                style={{ color: '#6b7280' }}
              >
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {calendarDays.map((day, index) => {
              if (day === null) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="min-h-24 rounded-lg"
                    style={{ backgroundColor: '#f5f5dc' }}
                  />
                );
              }

              const dayTasks = getTasksForDate(day);
              const today = isToday(day);

              return (
                <div
                  key={day}
                  className="min-h-24 rounded-lg p-2 relative"
                  style={{
                    backgroundColor: today ? '#e0f7fa' : 'white',
                    border: today ? '2px solid #4dd0e1' : '1px solid #d4d0b8'
                  }}
                >
                  <div
                    className="text-sm font-medium mb-1"
                    style={{ color: today ? '#4dd0e1' : '#2c3e72' }}
                  >
                    {day}
                  </div>

                  {/* Task Pills */}
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map(task => {
                      const category = categories.find(c => c.id === task.categoryId);
                      return (
                        <button
                          key={task.id}
                          onClick={() => setSelectedTask(task)}
                          className="w-full text-left px-2 py-1 rounded text-xs font-medium truncate hover:opacity-80 transition-opacity"
                          style={{
                            backgroundColor: category ? category.color + '20' : '#e5e7eb',
                            color: category ? category.color : '#6b7280',
                            border: `1px solid ${category ? category.color : '#d1d5db'}`
                          }}
                        >
                          {task.title}
                        </button>
                      );
                    })}

                    {dayTasks.length > 3 && (
                      <div className="text-xs font-medium px-2" style={{ color: '#6b7280' }}>
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {viewMode === 'week' && (
          <div className="grid grid-cols-7 gap-2 h-full">
            {/* Day Headers with dates */}
            {getWeekRange().map(date => {
              const isCurrentDay = date.toDateString() === new Date().toDateString();
              return (
                <div
                  key={date.toISOString()}
                  className="text-center py-2"
                  style={{ borderBottom: '2px solid #d4d0b8' }}
                >
                  <div className="text-xs font-semibold" style={{ color: '#6b7280' }}>
                    {dayNames[date.getDay()]}
                  </div>
                  <div
                    className="text-lg font-bold"
                    style={{ color: isCurrentDay ? '#4dd0e1' : '#2c3e72' }}
                  >
                    {date.getDate()}
                  </div>
                </div>
              );
            })}

            {/* Week Days */}
            {getWeekRange().map(date => {
              const dayTasks = getTasksForDate(date.getDate());
              const isCurrentDay = date.toDateString() === new Date().toDateString();

              return (
                <div
                  key={date.toISOString()}
                  className="min-h-96 rounded-lg p-3"
                  style={{
                    backgroundColor: isCurrentDay ? '#e0f7fa' : 'white',
                    border: isCurrentDay ? '2px solid #4dd0e1' : '1px solid #d4d0b8'
                  }}
                >
                  <div className="space-y-2">
                    {dayTasks.map(task => {
                      const category = categories.find(c => c.id === task.categoryId);
                      return (
                        <button
                          key={task.id}
                          onClick={() => setSelectedTask(task)}
                          className="w-full text-left px-2 py-2 rounded text-xs font-medium hover:opacity-80 transition-opacity"
                          style={{
                            backgroundColor: category ? category.color + '20' : '#e5e7eb',
                            color: category ? category.color : '#6b7280',
                            border: `1px solid ${category ? category.color : '#d1d5db'}`
                          }}
                        >
                          <div className="truncate">{task.title}</div>
                          <div className="text-[10px] opacity-75 truncate mt-0.5">
                            {task.assignedTo?.name || task.assignedToExternal || 'Unassigned'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {viewMode === 'day' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6" style={{ border: '2px solid #4dd0e1' }}>
              <div className="mb-6">
                <div className="text-2xl font-bold mb-2" style={{ color: '#2c3e72' }}>
                  Tasks for {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </div>
                <div className="text-sm" style={{ color: '#6b7280' }}>
                  {getTasksForDate(currentDate.getDate()).length} task(s) scheduled
                </div>
              </div>

              <div className="space-y-3">
                {getTasksForDate(currentDate.getDate()).map(task => {
                  const category = categories.find(c => c.id === task.categoryId);
                  const assignedTeam = task.assignedToTeamId ? teams.find(t => t.id === task.assignedToTeamId) : null;

                  return (
                    <button
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="w-full text-left p-4 rounded-lg hover:shadow-md transition-shadow"
                      style={{
                        backgroundColor: category ? category.color + '10' : 'white',
                        border: `2px solid ${category ? category.color : '#d4d0b8'}`
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="size-3 rounded-full mt-1.5 flex-shrink-0"
                          style={{ backgroundColor: category ? category.color : '#6b7280' }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold mb-1" style={{ color: '#2c3e72' }}>
                            {task.title}
                          </div>
                          <div className="text-sm mb-2" style={{ color: '#6b7280' }}>
                            {task.description}
                          </div>
                          <div className="flex items-center gap-3 text-xs" style={{ color: '#6b7280' }}>
                            {category && (
                              <span className="px-2 py-0.5 rounded" style={{ backgroundColor: category.color + '20', color: category.color }}>
                                {category.name}
                              </span>
                            )}
                            <span>{task.assignedTo?.name || assignedTeam?.name || task.assignedToExternal || 'Unassigned'}</span>
                            <span className={`px-2 py-0.5 rounded ${
                              task.status === 'completed' ? 'bg-green-100 text-green-700' :
                              task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                              'bg-neutral-100 text-neutral-700'
                            }`}>
                              {task.status.replace('-', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {getTasksForDate(currentDate.getDate()).length === 0 && (
                  <div className="text-center py-12" style={{ color: '#6b7280' }}>
                    <div className="text-4xl mb-2">📅</div>
                    <div>No tasks scheduled for this day</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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
