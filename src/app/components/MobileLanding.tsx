import { CheckSquare, Camera, Users, MessageSquare, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface MobileLandingProps {
  onNavigateToLogin: () => void;
}

export function MobileLanding({ onNavigateToLogin }: MobileLandingProps) {
  const features = [
    {
      icon: Camera,
      title: 'Capture Observations',
      description: 'Take photos and notes of issues on-site instantly'
    },
    {
      icon: CheckSquare,
      title: 'Manage Tasks',
      description: 'Track, claim, and complete tasks on the go'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Stay connected with real-time chat and updates'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-[390px] h-[844px] bg-gradient-to-b from-blue-600 to-blue-800 text-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col border-8 border-neutral-900 relative"
    >
      {/* Status Bar */}
      <div className="h-11 bg-[#1e2942] flex items-center justify-between px-6 pt-2">
        <span className="text-sm font-semibold">20:06</span>
        <div className="flex items-center gap-2 text-xs">
          <span>📶</span>
          <span>📡</span>
          <span>50%</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="flex-1 overflow-y-auto px-6 py-12">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="size-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mx-auto mb-4">
            <CheckSquare className="size-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">TaskFlow</h1>
          <p className="text-blue-100 text-lg">Task Management On The Go</p>
        </div>

        {/* Value Proposition */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold mb-4 leading-tight">
            Capture, Track, Complete
          </h2>
          <p className="text-blue-100 text-base leading-relaxed">
            The mobile-first task management app built for teams in the field
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-12">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 flex items-start gap-4"
              >
                <div className="size-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="size-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-sm text-blue-100">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sign In Button */}
        <button
          onClick={onNavigateToLogin}
          className="w-full py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:bg-blue-50 active:bg-blue-100 transition-colors shadow-lg mb-4"
        >
          Sign In
        </button>

        {/* New Organization Note */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
          <p className="text-sm text-blue-100 mb-2">
            Need to create a new organization?
          </p>
          <p className="text-xs text-blue-200">
            Please sign up on desktop at{' '}
            <span className="font-semibold">taskflow.com</span>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-6 text-center">
        <p className="text-xs text-blue-200">
          © 2026 TaskFlow. All rights reserved.
        </p>
      </div>
    </motion.div>
  );
}
