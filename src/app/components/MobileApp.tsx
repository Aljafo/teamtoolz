import { useState, useRef } from 'react';
import { Camera, Send, User, Users, ArrowLeft, ChevronLeft, ChevronRight, Plus, Eye, Check, X, UsersRound, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Observation, Task, TeamMember, Category, Team, Message, Location, Subcategory, RecurrencePattern } from '../App';
import { MobileTaskDetail } from './MobileTaskDetail';
import { MobileObservationDetail } from './MobileObservationDetail';
import { MobileGlobalChat } from './MobileGlobalChat';
import { MobileContacts } from './MobileContacts';
import { MobileTaskCreation } from './MobileTaskCreation';
import { MobileLocationPicker } from './MobileLocationPicker';

interface MobileAppProps {
  observations: Observation[];
  tasks: Task[];
  team: TeamMember[];
  teams: Team[];
  categories: Category[];
  subcategories: Subcategory[];
  messages: Message[];
  currentUser: TeamMember;
  onAddObservation: (message: string, photos: string[], categoryId: string, location?: Location) => void;
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
  onConvertToTask: (observationId: string, assignTo?: TeamMember) => void;
  onClaimTask: (taskId: string, userId: string) => void;
  onUnclaimTask: (taskId: string) => void;
  onSendMessage: (content: string, taskId?: string, observationId?: string) => void;
  onMarkMessagesAsRead: (messageIds: string[]) => void;
  onAddTaskAttachment: (taskId: string, file: File) => void;
  onRemoveTaskAttachment: (taskId: string, attachmentId: string) => void;
  onAddObservationAttachment: (observationId: string, file: File) => void;
  onRemoveObservationAttachment: (observationId: string, attachmentId: string) => void;
}

type DayView = 'yesterday' | 'today' | 'tomorrow';
type ActiveView = 'my-day' | 'observations' | 'tasks' | 'team-tasks';
type DetailView = { type: 'task'; taskId: string } | { type: 'observation'; observationId: string } | null;

export function MobileApp({
  observations,
  tasks,
  team,
  teams,
  categories,
  subcategories,
  messages,
  currentUser,
  onAddObservation,
  onAddTask,
  onClaimTask,
  onUnclaimTask,
  onSendMessage,
  onMarkMessagesAsRead,
  onAddTaskAttachment,
  onRemoveTaskAttachment,
  onAddObservationAttachment,
  onRemoveObservationAttachment,
}: MobileAppProps) {
  const [currentDay, setCurrentDay] = useState<DayView>('today');
  const [activeView, setActiveView] = useState<ActiveView>('my-day');
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [detailView, setDetailView] = useState<DetailView>(null);
  const [showGlobalChat, setShowGlobalChat] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showRecipientSelection, setShowRecipientSelection] = useState(false);
  const [recipientSearch, setRecipientSearch] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<TeamMember | null>(null);
  const [showTaskCreation, setShowTaskCreation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedPhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProceedToRecipientSelection = () => {
    if (message.trim() || capturedPhoto) {
      setShowLocationPicker(true);
    }
  };

  const handleLocationConfirmed = (location: Location | null) => {
    setSelectedLocation(location);
    setShowLocationPicker(false);
    setShowRecipientSelection(true);
  };

  const handleSubmitObservation = () => {
    if (selectedRecipient && (message.trim() || capturedPhoto)) {
      // Default to first category for mobile observations
      const defaultCategoryId = categories.length > 0 ? categories[0].id : '';
      onAddObservation(message, capturedPhoto ? [capturedPhoto] : [], defaultCategoryId, selectedLocation || undefined);
      setMessage('');
      setCapturedPhoto(null);
      setShowCamera(false);
      setShowRecipientSelection(false);
      setSelectedRecipient(null);
      setRecipientSearch('');
      setSelectedLocation(null);
    }
  };

  const filteredRecipients = team.filter(member =>
    member.name.toLowerCase().includes(recipientSearch.toLowerCase())
  );

  const getDateForView = (view: DayView): Date => {
    const now = new Date();
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);

    if (view === 'yesterday') {
      date.setDate(date.getDate() - 1);
    } else if (view === 'tomorrow') {
      date.setDate(date.getDate() + 1);
    }
    return date;
  };

  const filterByDay = (items: (Observation | Task)[], view: DayView) => {
    const targetDate = getDateForView(view);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    return items.filter(item => {
      const itemDate = 'timestamp' in item ? item.timestamp : item.createdAt;
      return itemDate >= targetDate && itemDate < nextDate;
    });
  };

  const formatDayHeader = (view: DayView): string => {
    const date = getDateForView(view);
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentDay === 'today') setCurrentDay('yesterday');
      else if (currentDay === 'tomorrow') setCurrentDay('today');
    } else {
      if (currentDay === 'yesterday') setCurrentDay('today');
      else if (currentDay === 'today') setCurrentDay('tomorrow');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const dayObservations = filterByDay(observations, currentDay) as Observation[];
  const dayTasks = filterByDay(tasks, currentDay) as Task[];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Calculate unread global messages
  const globalMessages = messages.filter(m => !m.taskId && !m.observationId);
  const unreadGlobalCount = globalMessages.filter(m => m.senderId !== currentUser.id && m.status !== 'read').length;

  // Calculate if any contacts have unread messages
  const hasUnreadFromContacts = team.some(member =>
    member.id !== currentUser.id &&
    messages.some(m => m.senderId === member.id && m.status !== 'read' && !m.taskId && !m.observationId)
  );

  // Get teams the current user is a member of
  const getUserTeams = () => {
    return teams.filter(team => team.memberIds.includes(currentUser.id));
  };

  // Get border color for a task (orange for external, purple for team, jade for individual)
  const getTaskBorderColor = (task: Task) => {
    return task.assignedToExternal
      ? '#f59e0b' // Orange for external
      : task.assignedToTeamId
      ? '#9c88ff' // Purple for team
      : '#4dd0e1'; // Jade for individual
  };

  // Get team name for a task
  const getTaskTeamName = (task: Task) => {
    if (!task.assignedToTeamId) return null;
    const team = teams.find(t => t.id === task.assignedToTeamId);
    return team?.name || null;
  };

  // Get external email for a task
  const getTaskExternalEmail = (task: Task) => {
    return task.assignedToExternal || null;
  };

  const getActiveViewColor = () => {
    switch (activeView) {
      case 'my-day':
        return '#f5f5dc'; // Ivory
      case 'observations':
        return '#5b9bd5'; // Blue (matching JPEG)
      case 'tasks':
        return '#4dd0e1'; // Jade
      case 'team-tasks':
        return '#9c88ff'; // Purple
    }
  };

  return (
    <div className="w-[390px] h-[844px] bg-[#2c3e72] rounded-[40px] shadow-2xl overflow-hidden flex flex-col border-8 border-neutral-900 relative">
      {/* Status Bar */}
      <div className="h-11 bg-[#1e2942] flex items-center justify-between px-6 pt-2 text-white">
        <span className="text-sm font-semibold">20:06</span>
        <div className="flex items-center gap-2 text-xs">
          <span>📶</span>
          <span>📡</span>
          <span>50%</span>
        </div>
      </div>

      {/* Sticky Top Navigation */}
      <div className="bg-white">
        {/* Icons Row */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#2c3e72]">
          {/* Contact Icon */}
          <div className="relative flex items-center">
            <button
              onClick={() => setShowContacts(true)}
              className="relative p-2 active:opacity-70 transition-opacity"
            >
              <UsersRound className="size-8 text-white" />
              {/* Notification badge */}
              {(hasUnreadFromContacts || unreadGlobalCount > 0) && (
                <div className="absolute -top-1 -right-1 size-6 bg-red-600 rounded-full flex items-center justify-center z-20 border-2 border-[#2c3e72]">
                  <span className="text-white text-[11px] font-bold">
                    {(hasUnreadFromContacts ? 1 : 0) + unreadGlobalCount}
                  </span>
                </div>
              )}
            </button>
          </div>

          {/* User Avatar with Initials */}
          <div className="size-10 rounded-full bg-[#e5e7eb] flex items-center justify-center">
            <span className="text-[#6b7280] font-bold text-sm">
              {getInitials(currentUser.name)}
            </span>
          </div>
        </div>

        {/* Top Tabs */}
        <div className="flex gap-0.5 bg-[#2c3e72] px-0.5">
          <button
            onClick={() => setActiveView('my-day')}
            className="flex-1 py-3 text-sm font-medium transition-all rounded-tl-2xl rounded-tr-2xl shadow-md"
            style={{
              backgroundColor: '#f5f5dc',
              color: '#2c3e72'
            }}
          >
            My Day
          </button>
          <button
            onClick={() => setActiveView('observations')}
            className="flex-1 py-3 text-sm font-medium transition-all relative text-white rounded-tl-2xl rounded-tr-2xl shadow-md"
            style={{ backgroundColor: '#5b9bd5' }}
          >
            Observations
            <span className="absolute top-2 right-8 size-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </div>

      {/* Content */}
      {showCamera ? (
        <div className="flex-1 flex flex-col">
          {showLocationPicker ? (
            <MobileLocationPicker
              onBack={() => {
                setShowLocationPicker(false);
              }}
              onConfirm={handleLocationConfirmed}
              initialLocation={selectedLocation || undefined}
            />
          ) : showRecipientSelection ? (
            <div className="flex-1 flex flex-col bg-white">
              <div className="px-4 py-3 flex items-center justify-between border-b border-neutral-100">
                <button onClick={() => setShowRecipientSelection(false)} className="flex items-center gap-2 text-neutral-700">
                  <ArrowLeft className="size-5" />
                  <span>Back</span>
                </button>
                <span className="font-medium">Send To</span>
                <div className="w-16" />
              </div>

              <div className="p-4">
                <input
                  type="text"
                  value={recipientSearch}
                  onChange={(e) => setRecipientSearch(e.target.value)}
                  placeholder="Search contacts..."
                  className="w-full p-3 border border-neutral-200 rounded-xl mb-4"
                  autoFocus
                />
              </div>

              <div className="flex-1 overflow-y-auto px-4">
                {filteredRecipients.map(member => (
                  <button
                    key={member.id}
                    onClick={() => setSelectedRecipient(member)}
                    className={`w-full p-4 mb-2 rounded-xl border-2 transition-all active:opacity-70 flex items-center gap-3 ${
                      selectedRecipient?.id === member.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-neutral-200 bg-white'
                    }`}
                  >
                    <div className="size-10 rounded-full bg-pink-100 text-pink-700 border border-pink-300 flex items-center justify-center font-bold">
                      {getInitials(member.name)}
                    </div>
                    <span className="font-medium text-neutral-900">{member.name}</span>
                  </button>
                ))}
              </div>

              <div className="p-4 bg-white border-t border-neutral-100">
                <button
                  onClick={handleSubmitObservation}
                  disabled={!selectedRecipient}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="size-5" />
                  Submit to {selectedRecipient?.name || 'Select Contact'}
                </button>
              </div>
            </div>
          ) : capturedPhoto ? (
            <div className="flex-1 flex flex-col">
              <div className="px-4 py-3 flex items-center justify-between bg-white border-b border-neutral-100">
                <button onClick={() => {
                  setCapturedPhoto(null);
                  setMessage('');
                }} className="flex items-center gap-2 text-neutral-700">
                  <ArrowLeft className="size-5" />
                  <span>Retake</span>
                </button>
                <span className="font-medium">New Observation</span>
                <div className="w-16" />
              </div>
              <div className="flex-1 bg-neutral-900 flex items-center justify-center">
                <img src={capturedPhoto} alt="Captured" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="p-4 bg-white border-t border-neutral-100">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe what you observed..."
                  className="w-full p-3 border border-neutral-200 rounded-xl resize-none mb-3"
                  rows={3}
                />
                <button
                  onClick={handleProceedToRecipientSelection}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                >
                  <Send className="size-5" />
                  Next: Choose Recipient
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-neutral-900 relative">
              <button
                onClick={() => {
                  setShowCamera(false);
                  setMessage('');
                  setCapturedPhoto(null);
                  setShowRecipientSelection(false);
                  setSelectedRecipient(null);
                  setRecipientSearch('');
                  setShowLocationPicker(false);
                  setSelectedLocation(null);
                }}
                className="absolute top-4 left-4 size-10 bg-white/20 rounded-full flex items-center justify-center text-white"
              >
                <ArrowLeft className="size-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoCapture}
                className="hidden"
              />
              <Camera className="size-24 text-white mb-6" />
              <h3 className="text-xl font-semibold text-white mb-2">Capture Observation</h3>
              <p className="text-neutral-400 text-center mb-8">Take a photo of what you see in the field</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-white text-neutral-900 px-8 py-4 rounded-full font-medium flex items-center gap-3"
              >
                <Camera className="size-5" />
                Take Photo
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            {/* MY DAY VIEW */}
            {activeView === 'my-day' && (
              <motion.div
                key="my-day"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                {/* Day Label with Ivory highlight */}
                <div
                  className="text-center py-3"
                  style={{ backgroundColor: '#f5f5dc' }}
                >
                  <div
                    className="text-base font-semibold"
                    style={{ color: '#2c3e72' }}
                  >
                    {currentDay === 'yesterday' ? 'Yesterday' : currentDay === 'today' ? 'Today' : 'Tomorrow'}
                  </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto px-4 py-3">
                  <div className="space-y-2">
                    {dayTasks.map(task => {
                      const taskCategory = categories.find(c => c.id === task.categoryId);
                      const teamName = getTaskTeamName(task);
                      const externalEmail = getTaskExternalEmail(task);
                      const borderColor = getTaskBorderColor(task);
                      return (
                      <div
                        key={task.id}
                        onClick={() => setDetailView({ type: 'task', taskId: task.id })}
                        className="rounded-lg overflow-hidden border-2 cursor-pointer active:opacity-70 transition-opacity"
                        style={{ borderColor }}
                      >
                        {/* Category banner at top */}
                        {taskCategory && (
                          <div className="h-1" style={{ backgroundColor: taskCategory.color }} />
                        )}

                        {/* Top section with image, title, and avatar */}
                        <div className="flex gap-2 p-2 relative bg-white">
                          {/* Image thumbnail */}
                          {task.photos.length > 0 && (
                            <div className="w-12 h-12 bg-neutral-200 rounded overflow-hidden flex-shrink-0">
                              <img src={task.photos[0]} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}

                          {/* Title and team/external name */}
                          <div className="flex-1 min-w-0 pr-8">
                            {teamName && (
                              <div className="text-[9px] font-semibold mb-0.5" style={{ color: borderColor }}>
                                {teamName}
                              </div>
                            )}
                            {externalEmail && (
                              <div className="text-[9px] font-semibold mb-0.5" style={{ color: borderColor }}>
                                📧 {externalEmail}
                              </div>
                            )}
                            <h4 className="font-semibold text-[11px] text-neutral-900 leading-tight line-clamp-2">
                              {task.title}
                            </h4>
                          </div>

                          {/* Avatar in top-right corner */}
                          {task.assignedTo && (
                            <div className="absolute top-1.5 right-1.5 size-6 rounded-full bg-pink-100 text-pink-700 border border-pink-300 flex items-center justify-center text-[9px] font-bold">
                              {getInitials(task.assignedTo.name)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                    })}

                    {dayObservations.map(obs => {
                      const obsCategory = categories.find(c => c.id === obs.categoryId);
                      return (
                      <div
                        key={obs.id}
                        onClick={() => setDetailView({ type: 'observation', observationId: obs.id })}
                        className="border rounded-lg overflow-hidden cursor-pointer active:opacity-70 transition-opacity"
                        style={{ borderColor: '#5b9bd5' }}
                      >
                        {/* Category banner at top */}
                        {obsCategory && (
                          <div className="h-1" style={{ backgroundColor: obsCategory.color }} />
                        )}

                        {/* Top section with image, title, and avatar */}
                        <div className="flex gap-2 p-2 relative bg-white">
                          {/* Image thumbnail */}
                          {obs.photos.length > 0 && (
                            <div className="w-12 h-12 bg-neutral-200 rounded overflow-hidden flex-shrink-0">
                              <img src={obs.photos[0]} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}

                          {/* Title */}
                          <div className="flex-1 min-w-0 pr-8">
                            <h4 className="font-semibold text-[11px] text-neutral-900 leading-tight line-clamp-2">
                              {obs.message}
                            </h4>
                          </div>

                          {/* Avatar in top-right corner */}
                          <div className="absolute top-1.5 right-1.5 size-6 rounded-full bg-pink-100 text-pink-700 border border-pink-300 flex items-center justify-center text-[9px] font-bold">
                            {getInitials(obs.author.name)}
                          </div>
                        </div>
                      </div>
                    );
                    })}

                    {dayTasks.length === 0 && dayObservations.length === 0 && (
                      <div className="text-center py-12 text-white">
                        <div className="text-4xl mb-3">📋</div>
                        <p className="text-neutral-300">
                          No items for {currentDay}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* OBSERVATIONS VIEW */}
            {activeView === 'observations' && (
              <motion.div
                key="observations"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-hidden flex flex-col"
              >
                {/* Blue header indicator */}
                <div className="text-center py-3" style={{ backgroundColor: '#5b9bd5' }}>
                  <div className="text-base font-semibold text-white">
                    All Observations
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-4 pt-3">
                <div className="space-y-2">
                  {observations.slice().reverse().map(obs => {
                    const obsCategory = categories.find(c => c.id === obs.categoryId);
                    return (
                    <div
                      key={obs.id}
                      onClick={() => setDetailView({ type: 'observation', observationId: obs.id })}
                      className="border rounded-lg overflow-hidden cursor-pointer active:opacity-70 transition-opacity"
                      style={{ borderColor: '#5b9bd5' }}
                    >
                      {obsCategory && (
                        <div className="h-1" style={{ backgroundColor: obsCategory.color }} />
                      )}
                      <div className="flex gap-2 p-2 relative bg-white">
                        {obs.photos.length > 0 && (
                          <div className="w-12 h-12 bg-neutral-200 rounded overflow-hidden flex-shrink-0">
                            <img src={obs.photos[0]} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 pr-8">
                          <h4 className="font-semibold text-[11px] text-neutral-900 leading-tight line-clamp-2">
                            {obs.message}
                          </h4>
                        </div>
                        <div className="absolute top-1.5 right-1.5 size-6 rounded-full bg-pink-100 text-pink-700 border border-pink-300 flex items-center justify-center text-[9px] font-bold">
                          {getInitials(obs.author.name)}
                        </div>
                      </div>
                    </div>
                  );
                  })}
                </div>
                </div>
              </motion.div>
            )}

            {/* TASKS VIEW */}
            {activeView === 'tasks' && (
              <motion.div
                key="tasks"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-hidden flex flex-col"
              >
                {/* Jade header indicator */}
                <div className="text-center py-3" style={{ backgroundColor: '#4dd0e1' }}>
                  <div className="text-base font-semibold text-neutral-900">
                    My Tasks
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-4 pt-3">
                <div className="space-y-2">
                  {tasks.filter(t => t.assignedTo?.id === currentUser.id).map(task => {
                    const taskCategory = categories.find(c => c.id === task.categoryId);
                    const teamName = getTaskTeamName(task);
                    const externalEmail = getTaskExternalEmail(task);
                    const borderColor = getTaskBorderColor(task);
                    const isClaimedTeamTask = task.assignedToTeamId && task.assignedTo;

                    return (
                    <div
                      key={task.id}
                      onClick={() => setDetailView({ type: 'task', taskId: task.id })}
                      className="border-2 rounded-lg overflow-hidden cursor-pointer active:opacity-70 transition-opacity"
                      style={{ borderColor }}
                    >
                      {taskCategory && (
                        <div className="h-1" style={{ backgroundColor: taskCategory.color }} />
                      )}
                      <div className="flex gap-2 p-2 relative bg-white">
                        {task.photos.length > 0 && (
                          <div className="w-12 h-12 bg-neutral-200 rounded overflow-hidden flex-shrink-0">
                            <img src={task.photos[0]} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 pr-8">
                          {teamName && (
                            <div className="text-[9px] font-semibold mb-0.5" style={{ color: borderColor }}>
                              {teamName}
                            </div>
                          )}
                          {externalEmail && (
                            <div className="text-[9px] font-semibold mb-0.5" style={{ color: borderColor }}>
                              📧 {externalEmail}
                            </div>
                          )}
                          <h4 className="font-semibold text-[11px] text-neutral-900 leading-tight line-clamp-2">
                            {task.title}
                          </h4>
                        </div>
                        <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 items-end">
                          <div className={`size-5 rounded-full border-2 ${
                            task.status === 'completed' ? 'bg-green-500 border-green-500' :
                            task.status === 'in-progress' ? 'border-blue-500 bg-blue-500' : 'border-neutral-300'
                          }`} />
                          {isClaimedTeamTask && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onUnclaimTask(task.id);
                              }}
                              className="px-2 py-0.5 text-[9px] font-medium rounded"
                              style={{ backgroundColor: borderColor + '20', color: borderColor }}
                            >
                              Unclaim
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                  })}
                </div>
                </div>
              </motion.div>
            )}

            {/* TEAM TASKS VIEW */}
            {activeView === 'team-tasks' && (
              <motion.div
                key="team-tasks"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-hidden flex flex-col"
              >
                {/* Purple header indicator */}
                <div className="text-center py-3" style={{ backgroundColor: '#9c88ff' }}>
                  <div className="text-base font-semibold text-white">
                    Team Tasks
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-4 pt-3">
                <div className="space-y-2">
                  {tasks.filter(t => {
                    // Show unclaimed team tasks where current user is a team member
                    if (!t.assignedToTeamId || t.assignedTo) return false;
                    const userTeamIds = getUserTeams().map(team => team.id);
                    return userTeamIds.includes(t.assignedToTeamId);
                  }).map(task => {
                    const taskCategory = categories.find(c => c.id === task.categoryId);
                    const teamName = getTaskTeamName(task);
                    return (
                    <div
                      key={task.id}
                      onClick={() => setDetailView({ type: 'task', taskId: task.id })}
                      className="border-2 border-[#9c88ff] rounded-lg overflow-hidden cursor-pointer active:opacity-70 transition-opacity"
                    >
                      {taskCategory && (
                        <div className="h-1" style={{ backgroundColor: taskCategory.color }} />
                      )}
                      <div className="flex gap-2 p-2 relative bg-white">
                        {task.photos.length > 0 && (
                          <div className="w-12 h-12 bg-neutral-200 rounded overflow-hidden flex-shrink-0">
                            <img src={task.photos[0]} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 pr-14">
                          {teamName && (
                            <div className="text-[9px] font-semibold mb-0.5 text-[#9c88ff]">
                              {teamName}
                            </div>
                          )}
                          <h4 className="font-semibold text-[11px] text-neutral-900 leading-tight line-clamp-2">
                            {task.title}
                          </h4>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onClaimTask(task.id, currentUser.id);
                          }}
                          className="absolute top-1.5 right-1.5 px-2 py-1 text-[9px] font-semibold text-white bg-[#9c88ff] rounded hover:bg-[#8a76ee] transition-colors"
                        >
                          Claim
                        </button>
                      </div>
                    </div>
                  );
                  })}
                </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Color Indicator Strip Above Bottom Tabs */}
      <div
        className="h-1.5"
        style={{ backgroundColor: getActiveViewColor() }}
      />

      {/* Bottom Tabs - Always Visible - Inside Phone Frame */}
      <div className="flex gap-0.5 bg-[#2c3e72] px-0.5 pb-0.5 z-50">
        <button
          onClick={() => setActiveView('tasks')}
          className={`flex-1 py-3 text-sm font-medium transition-all rounded-bl-2xl rounded-br-2xl shadow-md ${
            activeView === 'tasks'
              ? 'bg-[#4dd0e1] text-neutral-900'
              : 'bg-[#2ba4b3] text-neutral-200'
          }`}
        >
          Tasks
        </button>
        <button
          onClick={() => setActiveView('team-tasks')}
          className={`flex-1 py-3 text-sm font-medium transition-all rounded-bl-2xl rounded-br-2xl shadow-md ${
            activeView === 'team-tasks'
              ? 'bg-[#9c88ff] text-white'
              : 'bg-[#7a68cc] text-neutral-200'
          }`}
        >
          Team Tasks
        </button>
      </div>

      {/* Add/Plus FAB */}
      {!showCamera && (
        <button
          onClick={() => setShowActionMenu(true)}
          className="absolute bottom-16 right-6 size-14 bg-blue-600 rounded-full flex items-center justify-center shadow-xl z-50"
        >
          <Plus className="size-8 text-white stroke-[3]" />
        </button>
      )}

      {/* Swipe Navigation Arrows - Only on My Day view */}
      {!showCamera && activeView === 'my-day' && (
        <>
          {currentDay !== 'yesterday' && (
            <button
              onClick={() => navigateDay('prev')}
              className="absolute left-2 top-1/2 -translate-y-1/2 size-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white z-40"
            >
              <ChevronLeft className="size-6" />
            </button>
          )}
          {currentDay !== 'tomorrow' && (
            <button
              onClick={() => navigateDay('next')}
              className="absolute right-2 top-1/2 -translate-y-1/2 size-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white z-40"
            >
              <ChevronRight className="size-6" />
            </button>
          )}
        </>
      )}

      {/* Detail Views */}
      <AnimatePresence>
        {detailView?.type === 'task' && (() => {
          const task = tasks.find(t => t.id === detailView.taskId);
          return task ? (
            <MobileTaskDetail
              key="task-detail"
              task={task}
              categories={categories}
              subcategories={subcategories}
              teams={teams}
              messages={messages}
              team={team}
              currentUser={currentUser}
              onBack={() => setDetailView(null)}
              onClaim={onClaimTask}
              onUnclaim={onUnclaimTask}
              onSendMessage={onSendMessage}
              onMarkMessagesAsRead={onMarkMessagesAsRead}
              onAddAttachment={(file) => onAddTaskAttachment(task.id, file)}
              onRemoveAttachment={(attachmentId) => onRemoveTaskAttachment(task.id, attachmentId)}
              onCallContact={(contact) => {
                console.log('Calling', contact.name);
              }}
              onMessageContact={(contact) => {
                setDetailView(null);
                setShowGlobalChat(true);
              }}
            />
          ) : null;
        })()}

        {detailView?.type === 'observation' && (() => {
          const observation = observations.find(o => o.id === detailView.observationId);
          return observation ? (
            <MobileObservationDetail
              key="observation-detail"
              observation={observation}
              categories={categories}
              subcategories={subcategories}
              tasks={tasks}
              messages={messages}
              team={team}
              currentUser={currentUser}
              onBack={() => setDetailView(null)}
              onSendMessage={onSendMessage}
              onMarkMessagesAsRead={onMarkMessagesAsRead}
              onAddAttachment={(file) => onAddObservationAttachment(observation.id, file)}
              onRemoveAttachment={(attachmentId) => onRemoveObservationAttachment(observation.id, attachmentId)}
              onCallContact={(contact) => {
                console.log('Calling', contact.name);
              }}
              onMessageContact={(contact) => {
                setDetailView(null);
                setShowGlobalChat(true);
              }}
            />
          ) : null;
        })()}

        {showGlobalChat && (
          <MobileGlobalChat
            key="global-chat"
            messages={messages}
            team={team}
            currentUser={currentUser}
            onBack={() => setShowGlobalChat(false)}
            onSendMessage={(content) => onSendMessage(content)}
            onMarkMessagesAsRead={onMarkMessagesAsRead}
          />
        )}

        {showContacts && (
          <MobileContacts
            key="contacts"
            team={team}
            teams={teams}
            messages={messages}
            currentUser={currentUser}
            onBack={() => setShowContacts(false)}
            onCallContact={(contact) => {
              // Placeholder for call functionality
              console.log('Calling', contact.name);
            }}
            onMessageContact={(contact) => {
              // Open global chat when messaging a contact
              setShowContacts(false);
              setShowGlobalChat(true);
            }}
            onMessageTeam={(teamObj) => {
              // Open global chat when messaging a team
              setShowContacts(false);
              setShowGlobalChat(true);
            }}
            onOpenGlobalChat={() => {
              setShowContacts(false);
              setShowGlobalChat(true);
            }}
            unreadGlobalCount={unreadGlobalCount}
          />
        )}

        {/* Task Creation */}
        {showTaskCreation && (
          <MobileTaskCreation
            key="task-creation"
            team={team}
            teams={teams}
            categories={categories}
            subcategories={subcategories}
            currentUser={currentUser}
            onBack={() => setShowTaskCreation(false)}
            onCreateTask={(title, description, photos, categoryId, assignTo, assignToTeamId, assignToExternal, location, subcategoryId, startDate, endDate, recurrencePattern) => {
              onAddTask(title, description, photos, categoryId, assignTo, assignToTeamId, assignToExternal, location, subcategoryId, startDate, endDate, recurrencePattern);
              setShowTaskCreation(false);
            }}
          />
        )}

        {/* Action Menu - Fills Content Area */}
        {showActionMenu && (
          <motion.div
            key="action-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute z-[100]"
            style={{
              top: '124px', // Below sticky header (status bar + icons + tabs)
              left: '0',
              right: '0',
              bottom: '72px', // Above bottom tabs
            }}
          >
            <div className="w-full h-full bg-white px-4 py-6 flex flex-col">
              <h2 className="text-xl font-semibold text-neutral-900 mb-6 text-center">Create New</h2>

              <div className="flex-1 flex flex-col gap-4 content-start">
                {/* Top row - New Observation and New Task */}
                <div className="grid grid-cols-2 gap-4">
                  {/* New Observation */}
                  <button
                    onClick={() => {
                      setShowActionMenu(false);
                      setShowCamera(true);
                    }}
                    className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-3 active:opacity-70 transition-opacity shadow-lg"
                    style={{ backgroundColor: '#5b9bd5' }}
                  >
                    <Camera className="size-12 text-white" />
                    <span className="text-white font-semibold text-sm">New Observation</span>
                  </button>

                  {/* New Task */}
                  <button
                    onClick={() => {
                      setShowActionMenu(false);
                      setShowTaskCreation(true);
                    }}
                    className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-3 active:opacity-70 transition-opacity shadow-lg"
                    style={{ backgroundColor: '#4dd0e1' }}
                  >
                    <CheckSquare className="size-12 text-white" />
                    <span className="text-white font-semibold text-sm">New Task</span>
                  </button>
                </div>

                {/* Bottom row - Cancel left-aligned */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowActionMenu(false)}
                    className="aspect-square bg-neutral-500 rounded-2xl flex flex-col items-center justify-center gap-3 active:opacity-70 transition-opacity shadow-lg"
                  >
                    <X className="size-12 text-white" />
                    <span className="text-white font-semibold text-sm">Cancel</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
