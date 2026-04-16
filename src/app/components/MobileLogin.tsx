import { useState } from 'react';
import { CheckSquare, Mail, Lock, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface MobileLoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onNavigateToLanding: () => void;
}

export function MobileLogin({ onLogin, onNavigateToLanding }: MobileLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'tween', duration: 0.3 }}
      className="w-[390px] h-[844px] bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col border-8 border-neutral-900 relative z-50"
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

      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-6">
        <button
          onClick={onNavigateToLanding}
          className="size-10 flex items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-colors mb-4"
        >
          <ArrowLeft className="size-6" />
        </button>
        <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
        <p className="text-blue-100">Sign in to your account</p>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-neutral-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full pl-11 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                autoFocus
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                Password
              </label>
              <button
                type="button"
                className="text-sm text-blue-600 active:text-blue-700 font-medium"
                onClick={() => alert('Password reset coming soon!')}
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-neutral-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-11 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle className="size-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
          >
            {loading ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-neutral-700 mb-2 font-medium">
            Need to create a new organization?
          </p>
          <p className="text-sm text-neutral-600">
            Organization signup is only available on desktop. Visit{' '}
            <span className="font-semibold text-blue-600">taskflow.com</span> on your computer to get started.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-6 border-t border-neutral-200">
        <p className="text-center text-xs text-neutral-500">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </motion.div>
  );
}
