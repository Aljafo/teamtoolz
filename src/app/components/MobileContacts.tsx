import { ArrowLeft, Search, Phone, MessageSquare, Plus, User, Users, UsersRound } from 'lucide-react';
import { motion } from 'motion/react';
import type { TeamMember, Message, Team } from '../App';

interface MobileContactsProps {
  team: TeamMember[];
  teams: Team[];
  messages: Message[];
  currentUser: TeamMember;
  onBack: () => void;
  onCallContact: (contact: TeamMember) => void;
  onMessageContact: (contact: TeamMember) => void;
  onMessageTeam: (team: Team) => void;
  onOpenGlobalChat: () => void;
  unreadGlobalCount: number;
}

export function MobileContacts({
  team,
  teams,
  messages,
  currentUser,
  onBack,
  onCallContact,
  onMessageContact,
  onMessageTeam,
  onOpenGlobalChat,
  unreadGlobalCount,
}: MobileContactsProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Calculate unread messages per contact
  const getUnreadCount = (contactId: string) => {
    return messages.filter(
      m => m.senderId === contactId && m.status !== 'read' && !m.taskId && !m.observationId
    ).length;
  };

  // Calculate unread messages for a team (any unread message from team members)
  const getTeamUnreadCount = (teamId: string) => {
    const teamObj = teams.find(t => t.id === teamId);
    if (!teamObj) return 0;

    return messages.filter(
      m => teamObj.memberIds.includes(m.senderId) &&
           m.status !== 'read' &&
           !m.taskId &&
           !m.observationId &&
           m.senderId !== currentUser.id
    ).length;
  };

  // Get last interaction time for a contact (either sent or received message)
  const getLastInteractionTime = (contactId: string): number => {
    const contactMessages = messages.filter(
      m => (m.senderId === contactId || m.senderId === currentUser.id) &&
           !m.taskId &&
           !m.observationId
    );
    if (contactMessages.length === 0) return 0;
    return Math.max(...contactMessages.map(m => m.timestamp.getTime()));
  };

  // Get last interaction time for a team
  const getTeamLastInteractionTime = (teamId: string): number => {
    const teamObj = teams.find(t => t.id === teamId);
    if (!teamObj) return 0;

    const teamMessages = messages.filter(
      m => (teamObj.memberIds.includes(m.senderId) || m.senderId === currentUser.id) &&
           !m.taskId &&
           !m.observationId
    );
    if (teamMessages.length === 0) return 0;
    return Math.max(...teamMessages.map(m => m.timestamp.getTime()));
  };

  // Combine and sort contacts by most recent interaction
  type ContactItem =
    | { type: 'user'; data: TeamMember; lastInteraction: number }
    | { type: 'team'; data: Team; lastInteraction: number };

  const allContacts: ContactItem[] = [
    ...team
      .filter(member => member.id !== currentUser.id)
      .map(member => ({
        type: 'user' as const,
        data: member,
        lastInteraction: getLastInteractionTime(member.id)
      })),
    ...teams.map(teamObj => ({
      type: 'team' as const,
      data: teamObj,
      lastInteraction: getTeamLastInteractionTime(teamObj.id)
    }))
  ];

  // Sort by most recent interaction (most recent first)
  const sortedContacts = allContacts.sort((a, b) => b.lastInteraction - a.lastInteraction);

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'tween', duration: 0.3 }}
      className="absolute inset-0 bg-[#1f2a4e] z-50 flex flex-col"
    >
      {/* Status Bar */}
      <div className="h-11 bg-[#1e2942] flex items-center justify-between px-6 pt-2 text-white">
        <span className="text-sm font-semibold">20:06</span>
        <div className="flex items-center gap-2 text-xs">
          <span>📶</span>
          <span>📡</span>
          <span>50%</span>
        </div>
      </div>

      {/* Icons Row */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1f2a4e]">
        {/* Contact Icon */}
        <div className="relative flex items-center">
          <button
            onClick={onBack}
            className="relative p-2 active:opacity-70 transition-opacity"
          >
            <UsersRound className="size-8 text-white" />
          </button>
        </div>

        {/* User Avatar with Initials */}
        <div className="size-10 rounded-full bg-[#e5e7eb] flex items-center justify-center">
          <span className="text-[#6b7280] font-bold text-sm">
            {getInitials(currentUser.name)}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex">
        <button
          onClick={onBack}
          className="flex-1 py-3 text-center text-sm font-medium bg-[#FFFFF0] text-[#1f2a4e]"
        >
          My Day
        </button>
        <button
          onClick={onBack}
          className="flex-1 py-3 text-center text-sm font-medium bg-[#5b9bd5] text-white relative"
        >
          Observations
          <span className="absolute top-2 right-8 size-2 bg-red-500 rounded-full" />
        </button>
      </div>

      {/* Header */}
      <div className="px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Contacts</h1>
        <button className="size-9 flex items-center justify-center rounded-full hover:bg-white/10">
          <Search className="size-6 text-white" />
        </button>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 relative">
        <div className="space-y-3">
          {sortedContacts.map(item => {
            if (item.type === 'user') {
              const contact = item.data;
              const unreadCount = getUnreadCount(contact.id);
              return (
                <div
                  key={`user-${contact.id}`}
                  className="flex items-center gap-3 py-2"
                >
                  {/* Avatar */}
                  <div className="size-12 rounded-full bg-[#e5e7eb] flex items-center justify-center flex-shrink-0">
                    <span className="text-[#6b7280] font-bold text-sm">
                      {getInitials(contact.name)}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium">{contact.name}</div>
                    <div className="text-[#9ca3af] text-sm">{contact.role}</div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onCallContact(contact)}
                      className="size-10 flex items-center justify-center"
                    >
                      <Phone className="size-6 text-[#4dd0e1]" />
                    </button>
                    <button
                      onClick={() => onMessageContact(contact)}
                      className="size-10 flex items-center justify-center relative"
                    >
                      <MessageSquare className="size-6 text-[#4dd0e1]" fill="#4dd0e1" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 size-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              );
            } else {
              const teamObj = item.data;
              const unreadCount = getTeamUnreadCount(teamObj.id);
              return (
                <div
                  key={`team-${teamObj.id}`}
                  className="flex items-center gap-3 py-2"
                >
                  {/* Avatar */}
                  <div className="size-12 rounded-full bg-[#e5e7eb] flex items-center justify-center flex-shrink-0">
                    <span className="text-[#6b7280] font-bold text-sm">
                      {getInitials(teamObj.name)}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium">{teamObj.name}</div>
                    <div className="text-[#9ca3af] text-sm">Team ({teamObj.memberIds.length} members)</div>
                  </div>

                  {/* Action Buttons - Only message icon for teams */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onMessageTeam(teamObj)}
                      className="size-10 flex items-center justify-center relative"
                    >
                      <MessageSquare className="size-6 text-[#9c88ff]" fill="#9c88ff" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 size-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              );
            }
          })}
        </div>

        {/* Add Contact FAB */}
        <button className="absolute bottom-6 right-6 size-14 bg-blue-600 rounded-full flex items-center justify-center shadow-xl">
          <Plus className="size-8 text-white stroke-[3]" />
        </button>
      </div>

      {/* Color Indicator Strip */}
      <div className="h-1.5 bg-[#1f2a4e]" />

      {/* Bottom Tabs */}
      <div className="flex z-50 shadow-lg">
        <button
          onClick={onBack}
          className="flex-1 py-3 text-sm font-medium bg-[#2ba4b3] text-neutral-200 text-center"
        >
          Tasks
        </button>
        <button
          onClick={onBack}
          className="flex-1 py-3 text-sm font-medium bg-[#7a68cc] text-neutral-200 text-center"
        >
          Team Tasks
        </button>
      </div>
    </motion.div>
  );
}
