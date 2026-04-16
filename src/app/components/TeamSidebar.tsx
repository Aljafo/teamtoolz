import { LayoutDashboard, CheckSquare, Camera, Users, Tag, UsersRound, MessageSquare, UserCog, Crown, Calendar } from 'lucide-react';
import type { TeamMember } from '../App';

interface TeamSidebarProps {
  team: TeamMember[];
  currentUser: TeamMember;
  currentView: 'dashboard' | 'tasks' | 'observations' | 'team' | 'categories' | 'teams' | 'chat' | 'users' | 'planning';
  onViewChange: (view: 'dashboard' | 'tasks' | 'observations' | 'team' | 'categories' | 'teams' | 'chat' | 'users' | 'planning') => void;
}

export function TeamSidebar({ team, currentUser, currentView, onViewChange }: TeamSidebarProps) {
  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'planning' as const, label: 'Planning', icon: Calendar },
    { id: 'tasks' as const, label: 'Tasks', icon: CheckSquare },
    { id: 'observations' as const, label: 'Observations', icon: Camera },
    { id: 'chat' as const, label: 'Chat', icon: MessageSquare },
    { id: 'users' as const, label: 'Users', icon: UserCog },
    { id: 'team' as const, label: 'Team Overview', icon: Users },
    { id: 'categories' as const, label: 'Categories', icon: Tag },
    { id: 'teams' as const, label: 'Teams', icon: UsersRound },
  ];

  return (
    <div className="w-64 flex flex-col" style={{ backgroundColor: '#f5f5dc', borderRight: '1px solid #d4d0b8' }}>
      <div className="p-6" style={{ borderBottom: '1px solid #d4d0b8' }}>
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#2c3e72' }}>
            <CheckSquare className="size-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold" style={{ color: '#2c3e72' }}>TaskFlow</h1>
            <p className="text-sm" style={{ color: '#6b7280' }}>Desktop</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4">
        <div className="mb-6">
          <h2 className="text-xs uppercase tracking-wide mb-2 px-2" style={{ color: '#6b7280' }}>Navigation</h2>
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: currentView === item.id ? '#e8e6d5' : 'transparent',
                    color: currentView === item.id ? '#2c3e72' : '#4b5563'
                  }}
                >
                  <Icon className="size-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-xs uppercase tracking-wide mb-3 px-2" style={{ color: '#6b7280' }}>Team Members</h2>
          <div className="space-y-1">
            {team.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 px-2 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: 'transparent' }}
              >
                <div className="relative">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="size-8 rounded-full object-cover"
                  />
                  {member.id === currentUser.id && (
                    <div className="absolute -bottom-0.5 -right-0.5 size-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 text-sm font-medium" style={{ color: '#2c3e72' }}>
                    <span className="truncate">{member.name.split(' ')[0]}</span>
                    {member.userRole === 'admin' && (
                      <Crown className="size-3 flex-shrink-0" style={{ color: '#9c88ff' }} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4" style={{ borderTop: '1px solid #d4d0b8' }}>
        <div className="flex items-center gap-3 px-2">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="size-10 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 text-sm font-medium" style={{ color: '#2c3e72' }}>
              <span className="truncate">{currentUser.name}</span>
              {currentUser.userRole === 'admin' && (
                <Crown className="size-3 flex-shrink-0" style={{ color: '#9c88ff' }} />
              )}
            </div>
            <div className="text-xs truncate" style={{ color: '#6b7280' }}>{currentUser.role}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
