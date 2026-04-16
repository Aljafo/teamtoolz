import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, Shield, User, Lock, Mail } from 'lucide-react';
import type { Invitation, Organization } from '../App';

interface AcceptInvitationProps {
  token: string;
  onAccept: (token: string, password: string) => Promise<void>;
  platform?: 'desktop' | 'mobile';
}

export function AcceptInvitation({ token, onAccept, platform = 'desktop' }: AcceptInvitationProps) {
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [inviterName, setInviterName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  // Container classes based on platform
  const containerClasses = platform === 'mobile'
    ? 'w-[390px] h-[844px] rounded-[40px] shadow-2xl border-8 border-neutral-900 bg-neutral-50 flex items-center justify-center overflow-hidden'
    : 'min-h-screen bg-neutral-50 flex items-center justify-center p-4';

  useEffect(() => {
    // Validate token and fetch invitation details
    // In production, this would call Supabase to validate the token
    validateInvitation();
  }, [token]);

  const validateInvitation = async () => {
    setLoading(true);
    setError('');

    try {
      // Simulate API call to validate token
      // In production: const { data, error } = await supabase.rpc('validate_invitation_token', { token })

      // Mock validation - check if token exists and is valid
      const mockInvitation: Invitation = {
        id: 'inv1',
        organizationId: 'org1',
        email: 'newuser@example.com',
        name: 'John Smith',
        role: 'member',
        invitedBy: 'user1',
        token: token,
        status: 'pending',
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      };

      const mockOrganization: Organization = {
        id: 'org1',
        name: 'ACME Construction',
        subscriptionTier: 'premium',
        subscriptionStatus: 'active',
        maxUsers: 100,
        createdAt: new Date()
      };

      // Check if invitation is valid
      const now = new Date();
      if (mockInvitation.expiresAt < now) {
        setError('This invitation has expired. Please contact your administrator for a new invitation.');
        setLoading(false);
        return;
      }

      if (mockInvitation.status !== 'pending') {
        setError('This invitation is no longer valid. It may have been cancelled or already used.');
        setLoading(false);
        return;
      }

      setInvitation(mockInvitation);
      setOrganization(mockOrganization);
      setInviterName('Sarah Chen'); // In production, fetch from database
      setLoading(false);

    } catch (err) {
      setError('Failed to validate invitation. Please check your link and try again.');
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    // Validate password
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setAccepting(true);
    setError('');

    try {
      await onAccept(token, password);
      setAccepted(true);
    } catch (err) {
      setError('Failed to accept invitation. Please try again.');
      setAccepting(false);
    }
  };

  const getDaysRemaining = () => {
    if (!invitation) return 0;
    const now = new Date();
    const diff = invitation.expiresAt.getTime() - now.getTime();
    return Math.ceil(diff / (24 * 60 * 60 * 1000));
  };

  if (loading) {
    return (
      <div className={containerClasses}>
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center mx-4">
          <Loader2 className="size-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Validating Invitation</h2>
          <p className="text-neutral-600">Please wait while we verify your invitation...</p>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className={containerClasses}>
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center mx-4">
          <XCircle className="size-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Invalid Invitation</h2>
          <p className="text-neutral-600 mb-6">{error}</p>
          <a
            href="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className={containerClasses}>
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center mx-4">
          <CheckCircle className="size-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Welcome to {organization?.name}!</h2>
          <p className="text-neutral-600 mb-6">
            Your account has been created successfully. You can now sign in and start collaborating with your team.
          </p>
          <a
            href="/login"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <div className={`bg-white rounded-xl shadow-lg w-full overflow-auto ${platform === 'mobile' ? 'h-full' : 'max-w-2xl mx-4'}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white text-center">
          <h1 className="text-2xl font-semibold mb-2">You're Invited to Join</h1>
          <h2 className="text-3xl font-bold">{organization?.name}</h2>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Invitation Details */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-12 bg-blue-600 rounded-full flex items-center justify-center">
                <Mail className="size-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Invitation Details</h3>
                <p className="text-sm text-neutral-600">{inviterName} invited you to join</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs uppercase tracking-wide text-neutral-500 mb-1">Your Name</div>
                <div className="font-medium text-neutral-900">{invitation?.name}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-neutral-500 mb-1">Your Email</div>
                <div className="font-medium text-neutral-900">{invitation?.email}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-neutral-500 mb-1">Role</div>
                <div className="flex items-center gap-1">
                  {invitation?.role === 'admin' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-700">
                      <Shield className="size-3" />
                      Administrator
                    </span>
                  )}
                  {invitation?.role === 'member' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                      <User className="size-3" />
                      Member
                    </span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-neutral-500 mb-1">Expires In</div>
                <div className="font-medium text-neutral-900">{getDaysRemaining()} days</div>
              </div>
            </div>
          </div>

          {/* Role Description */}
          <div className="mb-6">
            <h3 className="font-semibold text-neutral-900 mb-2">What you can do</h3>
            {invitation?.role === 'admin' ? (
              <ul className="text-sm text-neutral-600 space-y-1">
                <li>• Create and manage tasks and observations</li>
                <li>• Invite and manage team members</li>
                <li>• Configure categories and teams</li>
                <li>• Access all administrative features</li>
              </ul>
            ) : (
              <ul className="text-sm text-neutral-600 space-y-1">
                <li>• Create tasks and observations</li>
                <li>• Collaborate with team members</li>
                <li>• Upload photos and documents</li>
                <li>• Participate in team discussions</li>
              </ul>
            )}
          </div>

          {/* Password Setup */}
          <div className="border-t border-neutral-200 pt-6 mb-6">
            <h3 className="font-semibold text-neutral-900 mb-4">Create Your Password</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-neutral-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-1">Must be at least 8 characters long</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-neutral-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full pl-10 pr-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          {/* Accept Button */}
          <button
            onClick={handleAccept}
            disabled={accepting || !password || !confirmPassword}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {accepting ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <CheckCircle className="size-5" />
                Accept Invitation & Create Account
              </>
            )}
          </button>

          <p className="text-xs text-neutral-500 text-center mt-4">
            By accepting this invitation, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
