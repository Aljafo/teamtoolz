import { TrendingUp, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Task, Observation, TeamMember, Category, Team, Message, ExternalContact, Subcategory } from '../App';
import { ObservationCard } from './ObservationCard';
import { TaskCard } from './TaskCard';

interface DashboardProps {
  tasks: Task[];
  observations: Observation[];
  team: TeamMember[];
  teams: Team[];
  categories: Category[];
  subcategories: Subcategory[];
  messages: Message[];
  currentUser: TeamMember;
  externalContacts: ExternalContact[];
  onConvertToTask: (observationId: string, assignTo?: TeamMember, assignToTeamId?: string, assignToExternal?: string) => void;
  onUpdateTaskStatus: (taskId: string, status: Task['status']) => void;
  onSendMessage: (content: string, taskId?: string, observationId?: string) => void;
  onMarkMessagesAsRead: (messageIds: string[]) => void;
  onAddTaskAttachment: (taskId: string, file: File) => void;
  onRemoveTaskAttachment: (taskId: string, attachmentId: string) => void;
  onAddObservationAttachment: (observationId: string, file: File) => void;
  onRemoveObservationAttachment: (observationId: string, attachmentId: string) => void;
}

export function Dashboard({
  tasks,
  observations,
  team,
  teams,
  categories,
  subcategories,
  messages,
  currentUser,
  externalContacts,
  onConvertToTask,
  onUpdateTaskStatus,
  onSendMessage,
  onMarkMessagesAsRead,
  onAddTaskAttachment,
  onRemoveTaskAttachment,
  onAddObservationAttachment,
  onRemoveObservationAttachment,
}: DashboardProps) {
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const recentObservations = observations.slice(-5).reverse();

  const stats = [
    {
      label: 'Total Tasks',
      value: tasks.length,
      icon: CheckCircle2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'In Progress',
      value: inProgressTasks.length,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Completed',
      value: completedTasks.length,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Pending',
      value: pendingTasks.length,
      icon: AlertCircle,
      color: 'text-neutral-600',
      bgColor: 'bg-neutral-50',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2" style={{ color: '#2c3e72' }}>Dashboard</h1>
          <p style={{ color: '#6b7280' }}>Overview of tasks and recent observations</p>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-xl p-6" style={{ backgroundColor: 'white', border: '1px solid #d4d0b8' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm" style={{ color: '#6b7280' }}>{stat.label}</span>
                  <div className={`size-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`size-5 ${stat.color}`} />
                  </div>
                </div>
                <div className="text-3xl font-semibold" style={{ color: '#2c3e72' }}>{stat.value}</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h2 className="font-semibold mb-4" style={{ color: '#2c3e72' }}>Recent Observations</h2>
            <div className="space-y-3 pb-48">
              {recentObservations.length > 0 ? (
                recentObservations.map(observation => (
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
                ))
              ) : (
                <div className="rounded-xl p-8 text-center" style={{ backgroundColor: 'white', border: '1px solid #d4d0b8' }}>
                  <p className="text-sm" style={{ color: '#6b7280' }}>No observations yet</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="font-semibold mb-4" style={{ color: '#2c3e72' }}>Active Tasks</h2>
            <div className="space-y-3">
              {inProgressTasks.length > 0 ? (
                inProgressTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    team={team}
                    teams={teams}
                    categories={categories}
                    subcategories={subcategories}
                    messages={messages}
                    currentUser={currentUser}
                    onUpdateAssignment={() => {}}
                    onUpdateStatus={onUpdateTaskStatus}
                    onSendMessage={onSendMessage}
                    onMarkMessagesAsRead={onMarkMessagesAsRead}
                    onAddAttachment={onAddTaskAttachment}
                    onRemoveAttachment={onRemoveTaskAttachment}
                  />
                ))
              ) : (
                <div className="rounded-xl p-8 text-center" style={{ backgroundColor: 'white', border: '1px solid #d4d0b8' }}>
                  <p className="text-sm" style={{ color: '#6b7280' }}>No active tasks</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
