import { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import type { Team, TeamMember } from '../App';

interface TeamsProps {
  teams: Team[];
  allMembers: TeamMember[];
  onAddTeam: (name: string) => void;
  onUpdateTeam: (id: string, name: string) => void;
  onDeleteTeam: (id: string) => void;
  onAddMember: (teamId: string, memberId: string) => void;
  onRemoveMember: (teamId: string, memberId: string) => void;
}

export function Teams({
  teams,
  allMembers,
  onAddTeam,
  onUpdateTeam,
  onDeleteTeam,
  onAddMember,
  onRemoveMember,
}: TeamsProps) {
  const [showAddMemberMenu, setShowAddMemberMenu] = useState<string | null>(null);

  const getTeamMembers = (team: Team): TeamMember[] => {
    return allMembers.filter(m => team.memberIds.includes(m.id));
  };

  const getAvailableMembers = (team: Team): TeamMember[] => {
    return allMembers.filter(m => !team.memberIds.includes(m.id));
  };

  return (
    <div className="flex-1 p-8 bg-neutral-50">
      <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Teams</h2>
      <div className="max-w-4xl">
        <p className="text-neutral-600 mb-6">
          Manage teams for organizing work. Team tasks appear in the "Team Tasks" tab and can be claimed by team members.
        </p>

        <div className="space-y-4 mb-6">
          {teams.map(team => {
            const teamMembers = getTeamMembers(team);
            const availableMembers = getAvailableMembers(team);

            return (
              <div key={team.id} className="bg-white border border-neutral-200 rounded-lg p-5">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="text"
                    value={team.name}
                    onChange={(e) => onUpdateTeam(team.id, e.target.value)}
                    className="flex-1 px-3 py-2 text-lg font-semibold border border-neutral-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      if (confirm(`Delete team "${team.name}"?`)) {
                        onDeleteTeam(team.id);
                      }
                    }}
                    className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    Delete Team
                  </button>
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-neutral-700">
                      Team Members ({teamMembers.length})
                    </h4>
                    <div className="relative">
                      <button
                        onClick={() => setShowAddMemberMenu(showAddMemberMenu === team.id ? null : team.id)}
                        disabled={availableMembers.length === 0}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed"
                      >
                        <UserPlus className="size-4" />
                        Add Member
                      </button>

                      {showAddMemberMenu === team.id && availableMembers.length > 0 && (
                        <div className="absolute right-0 top-full mt-2 bg-white border border-neutral-200 rounded-lg shadow-lg p-2 min-w-56 z-10">
                          <div className="text-xs uppercase tracking-wide text-neutral-500 px-2 py-1 mb-1">
                            Add to team
                          </div>
                          {availableMembers.map(member => (
                            <button
                              key={member.id}
                              onClick={() => {
                                onAddMember(team.id, member.id);
                                setShowAddMemberMenu(null);
                              }}
                              className="w-full flex items-center gap-3 px-2 py-2 text-sm hover:bg-neutral-50 rounded transition-colors"
                            >
                              <img
                                src={member.avatar}
                                alt={member.name}
                                className="size-8 rounded-full object-cover"
                              />
                              <div className="flex-1 text-left">
                                <div className="font-medium text-neutral-900">{member.name}</div>
                                <div className="text-xs text-neutral-500">{member.role}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {teamMembers.length > 0 ? (
                    <div className="space-y-2">
                      {teamMembers.map(member => (
                        <div
                          key={member.id}
                          className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg"
                        >
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="size-10 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-neutral-900">{member.name}</div>
                            <div className="text-sm text-neutral-500">{member.role}</div>
                          </div>
                          <button
                            onClick={() => onRemoveMember(team.id, member.id)}
                            className="size-8 flex items-center justify-center rounded-full hover:bg-neutral-200 transition-colors text-neutral-600 hover:text-red-600"
                            title="Remove from team"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-neutral-400 text-sm bg-neutral-50 rounded-lg">
                      No members yet. Add members to this team.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => {
            const name = prompt('Team name:');
            if (name) onAddTeam(name);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create New Team
        </button>
      </div>
    </div>
  );
}
