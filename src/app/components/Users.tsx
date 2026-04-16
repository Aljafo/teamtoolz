import { useState } from 'react';
import { UserPlus, Mail, Shield, Crown, MoreVertical, Send, XCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { TeamMember, Invitation } from '../App';

interface UsersProps {
  team: TeamMember[];
  invitations: Invitation[];
  currentUser: TeamMember;
  onInviteUser: (email: string, name: string, role: 'admin' | 'member') => void;
  onResendInvitation: (invitationId: string) => void;
  onCancelInvitation: (invitationId: string) => void;
  onRemoveUser: (userId: string) => void;
}

export function Users({
  team,
  invitations,
  currentUser,
  onInviteUser,
  onResendInvitation,
  onCancelInvitation,
  onRemoveUser
}: UsersProps) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const isAdmin = currentUser.userRole === 'admin';

  const handleInviteSubmit = () => {
    if (!inviteEmail.trim() || !inviteName.trim()) {
      alert('Please fill in all fields');
      return;
    }

    onInviteUser(inviteEmail.trim(), inviteName.trim(), inviteRole);
    setInviteEmail('');
    setInviteName('');
    setInviteRole('member');
    setShowInviteModal(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const getDaysUntilExpiry = (expiresAt: Date) => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    const days = Math.ceil(diff / (24 * 60 * 60 * 1000));
    return days;
  };

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-900">Users</h2>
            <p className="text-sm text-neutral-500 mt-1">
              Manage team members and invitations • {team.length} active user{team.length !== 1 ? 's' : ''}
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <UserPlus className="size-4" />
              Invite User
            </button>
          )}
        </div>

        {/* Active Users */}
        <div className="mb-8">
          <h3 className="font-semibold text-neutral-900 mb-4">Active Members</h3>
          <div className="space-y-3">
            {team.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-xl p-4 border border-neutral-200 flex items-center gap-4"
              >
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="size-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-neutral-900">{member.name}</span>
                    {member.userRole === 'admin' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-700">
                        <Crown className="size-3" />
                        Admin
                      </span>
                    )}
                    {member.id === currentUser.id && (
                      <span className="text-xs text-neutral-500">(You)</span>
                    )}
                  </div>
                  <div className="text-sm text-neutral-600">{member.role}</div>
                </div>

                {isAdmin && member.id !== currentUser.id && (
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === member.id ? null : member.id)}
                      className="size-8 flex items-center justify-center rounded hover:bg-neutral-100 transition-colors"
                    >
                      <MoreVertical className="size-4 text-neutral-600" />
                    </button>

                    {activeMenuId === member.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute right-0 top-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg p-1 min-w-40 z-10"
                      >
                        <button
                          onClick={() => {
                            onRemoveUser(member.id);
                            setActiveMenuId(null);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          Remove User
                        </button>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pending Invitations */}
        {pendingInvitations.length > 0 && (
          <div>
            <h3 className="font-semibold text-neutral-900 mb-4">Pending Invitations</h3>
            <div className="space-y-3">
              {pendingInvitations.map((invitation) => {
                const daysLeft = getDaysUntilExpiry(invitation.expiresAt);
                const isExpiringSoon = daysLeft <= 2;

                return (
                  <div
                    key={invitation.id}
                    className="bg-white rounded-xl p-4 border border-neutral-200 flex items-center gap-4"
                  >
                    <div className="size-12 rounded-full bg-neutral-100 flex items-center justify-center">
                      <Mail className="size-6 text-neutral-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-neutral-900">{invitation.name}</span>
                        {invitation.role === 'admin' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-700">
                            <Shield className="size-3" />
                            Admin
                          </span>
                        )}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                          isExpiringSoon ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          <Clock className="size-3" />
                          {daysLeft > 0 ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left` : 'Expired'}
                        </span>
                      </div>
                      <div className="text-sm text-neutral-600">{invitation.email}</div>
                      <div className="text-xs text-neutral-500 mt-1">
                        Invited {formatDate(invitation.createdAt)}
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onResendInvitation(invitation.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Send className="size-3" />
                          Resend
                        </button>
                        <button
                          onClick={() => onCancelInvitation(invitation.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <XCircle className="size-3" />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!isAdmin && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              Only admins can invite new users or manage team members. Contact an admin if you need to add someone to the team.
            </p>
          </div>
        )}
      </div>

      {/* Invite User Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl max-w-md w-full shadow-2xl"
            >
              <div className="p-6 border-b border-neutral-200">
                <h3 className="text-xl font-semibold text-neutral-900">Invite New User</h3>
                <p className="text-sm text-neutral-500 mt-1">
                  Send an invitation email to add a new team member
                </p>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="John Smith"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  <p className="text-xs text-neutral-500 mt-1">
                    {inviteRole === 'admin'
                      ? 'Admins can invite users, manage settings, and edit categories/teams'
                      : 'Members can create tasks, observations, and collaborate with the team'}
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-neutral-200 flex gap-3">
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteEmail('');
                    setInviteName('');
                    setInviteRole('member');
                  }}
                  className="flex-1 px-4 py-2 border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInviteSubmit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Send Invitation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
