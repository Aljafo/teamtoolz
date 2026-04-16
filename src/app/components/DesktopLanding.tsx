import { CheckSquare, Users, Camera, MessageSquare, Check, ArrowRight } from 'lucide-react';

interface DesktopLandingProps {
  onNavigateToSignup: () => void;
  onNavigateToLogin: () => void;
}

export function DesktopLanding({ onNavigateToSignup, onNavigateToLogin }: DesktopLandingProps) {
  const features = [
    {
      icon: Camera,
      title: 'Photo Observations',
      description: 'Capture issues on-site with photos and convert them to actionable tasks instantly.'
    },
    {
      icon: CheckSquare,
      title: 'Task Management',
      description: 'Assign tasks to individuals or teams with claim/unclaim functionality for flexible workflows.'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Real-time chat, file sharing, and notifications keep everyone synchronized.'
    },
    {
      icon: MessageSquare,
      title: 'Mobile & Desktop',
      description: 'Full-featured mobile app for field work, desktop app for management and administration.'
    }
  ];

  const pricingPlans = [
    {
      name: 'Standard',
      price: '$29',
      period: 'per month',
      description: 'Perfect for small teams',
      features: [
        'Up to 50 users',
        'Unlimited tasks & observations',
        'Photos, PDFs, and documents',
        'Team collaboration & chat',
        'Custom categories',
        'Mobile & desktop apps',
        'Standard support'
      ],
      highlighted: false
    },
    {
      name: 'Premium',
      price: '$79',
      period: 'per month',
      description: 'For growing organizations',
      features: [
        'Up to 100 users',
        'Everything in Standard',
        'Video attachments (15s)',
        'Priority support',
        'Advanced reporting',
        'API access',
        'Dedicated account manager'
      ],
      highlighted: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      {/* Navigation */}
      <nav className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <CheckSquare className="size-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-neutral-900">TaskFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onNavigateToLogin}
              className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={onNavigateToSignup}
              className="px-6 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-neutral-900 mb-6">
            Task Management for Teams That Move Fast
          </h1>
          <p className="text-xl text-neutral-600 mb-8 leading-relaxed">
            Capture observations in the field, convert them to tasks, and collaborate with your team in real-time. Built for mobile-first workflows with powerful desktop management.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={onNavigateToSignup}
              className="px-8 py-4 text-lg font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="size-5" />
            </button>
            <button
              onClick={onNavigateToLogin}
              className="px-8 py-4 text-lg font-semibold border-2 border-neutral-300 text-neutral-700 rounded-lg hover:border-neutral-400 hover:bg-neutral-50 transition-colors"
            >
              Sign In
            </button>
          </div>
          <p className="text-sm text-neutral-500 mt-4">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>

        {/* Hero Image Placeholder */}
        <div className="mt-16 rounded-xl overflow-hidden shadow-2xl border border-neutral-200">
          <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
            <div className="text-center">
              <CheckSquare className="size-20 text-blue-600 mx-auto mb-4" />
              <p className="text-neutral-600 font-medium">App Preview</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20 border-y border-neutral-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">Everything You Need to Stay Organized</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Designed for teams in construction, facilities management, and field operations who need to capture and act on issues quickly.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="bg-neutral-50 rounded-xl p-8 border border-neutral-200">
                  <div className="size-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                    <Icon className="size-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">{feature.title}</h3>
                  <p className="text-neutral-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-neutral-600">Choose the plan that fits your team size and needs</p>
          </div>

          <div className="grid grid-cols-2 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl p-8 border-2 ${
                  plan.highlighted
                    ? 'border-blue-600 bg-blue-50 shadow-xl'
                    : 'border-neutral-200 bg-white'
                }`}
              >
                {plan.highlighted && (
                  <div className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">{plan.name}</h3>
                <p className="text-neutral-600 mb-6">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-neutral-900">{plan.price}</span>
                  <span className="text-neutral-600 ml-2">{plan.period}</span>
                </div>
                <button
                  onClick={onNavigateToSignup}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors mb-6 ${
                    plan.highlighted
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-neutral-900 text-white hover:bg-neutral-800'
                  }`}
                >
                  Start Free Trial
                </button>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join teams who are capturing, tracking, and completing tasks faster with TaskFlow.
          </p>
          <button
            onClick={onNavigateToSignup}
            className="px-8 py-4 text-lg font-semibold bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors inline-flex items-center gap-2"
          >
            Start Your Free Trial
            <ArrowRight className="size-5" />
          </button>
          <p className="text-blue-100 mt-4 text-sm">
            14-day free trial • No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <CheckSquare className="size-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-white">TaskFlow</span>
            </div>
            <div className="text-sm">
              © 2026 TaskFlow. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
