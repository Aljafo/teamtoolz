import { useState } from 'react';
import { CheckSquare, Building2, User, Mail, Lock, ArrowRight, ArrowLeft, Check, AlertCircle, Loader2, CreditCard } from 'lucide-react';

interface DesktopSignupProps {
  onSignup: (data: SignupData) => Promise<void>;
  onNavigateToLogin: () => void;
  onNavigateToLanding: () => void;
}

export interface SignupData {
  // Step 1: Organization
  organizationName: string;
  industry: string;

  // Step 2: Admin Account
  adminName: string;
  adminEmail: string;
  adminPassword: string;

  // Step 3: Subscription
  subscriptionTier: 'standard' | 'premium';
}

export function DesktopSignup({ onSignup, onNavigateToLogin, onNavigateToLanding }: DesktopSignupProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [organizationName, setOrganizationName] = useState('');
  const [industry, setIndustry] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [subscriptionTier, setSubscriptionTier] = useState<'standard' | 'premium'>('standard');

  const totalSteps = 3;

  const validateStep1 = () => {
    if (!organizationName.trim()) {
      setError('Please enter your organization name');
      return false;
    }
    if (!industry) {
      setError('Please select your industry');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!adminName.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (!adminEmail.trim()) {
      setError('Please enter your email');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!adminPassword) {
      setError('Please enter a password');
      return false;
    }
    if (adminPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (adminPassword !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');

    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;

    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      await onSignup({
        organizationName,
        industry,
        adminName,
        adminEmail,
        adminPassword,
        subscriptionTier,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account. Please try again.');
      setLoading(false);
    }
  };

  const industries = [
    'Construction',
    'Facilities Management',
    'Manufacturing',
    'Healthcare',
    'Education',
    'Retail',
    'Technology',
    'Other'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <button
            onClick={onNavigateToLanding}
            className="inline-flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity"
          >
            <div className="size-12 rounded-xl bg-blue-600 flex items-center justify-center">
              <CheckSquare className="size-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-neutral-900">TaskFlow</span>
          </button>
          <h1 className="text-2xl font-semibold text-neutral-900 mb-2">Create your organization</h1>
          <p className="text-neutral-600">Start your 14-day free trial, no credit card required</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center">
                <div
                  className={`size-10 rounded-full flex items-center justify-center font-semibold border-2 transition-colors ${
                    step > num
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : step === num
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-neutral-300 text-neutral-400'
                  }`}
                >
                  {step > num ? <Check className="size-5" /> : num}
                </div>
                {num < totalSteps && (
                  <div
                    className={`w-24 h-0.5 mx-2 transition-colors ${
                      step > num ? 'bg-blue-600' : 'bg-neutral-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between max-w-md mx-auto mt-3 text-xs font-medium text-neutral-600">
            <span className={step >= 1 ? 'text-blue-600' : ''}>Organization</span>
            <span className={step >= 2 ? 'text-blue-600' : ''}>Admin Account</span>
            <span className={step >= 3 ? 'text-blue-600' : ''}>Subscription</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-8">
          {/* Step 1: Organization Details */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <div className="size-12 rounded-lg bg-blue-100 flex items-center justify-center mx-auto mb-3">
                  <Building2 className="size-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-neutral-900">Tell us about your organization</h2>
              </div>

              <div>
                <label htmlFor="orgName" className="block text-sm font-medium text-neutral-700 mb-2">
                  Organization Name *
                </label>
                <input
                  id="orgName"
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="ACME Construction"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-neutral-700 mb-2">
                  Industry *
                </label>
                <select
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select your industry</option>
                  {industries.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Admin Account */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <div className="size-12 rounded-lg bg-blue-100 flex items-center justify-center mx-auto mb-3">
                  <User className="size-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-neutral-900">Create your admin account</h2>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                  Full Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-neutral-400" />
                  <input
                    id="email"
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="john@acme.com"
                    className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-neutral-400" />
                  <input
                    id="password"
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-neutral-400" />
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Subscription Selection */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <div className="size-12 rounded-lg bg-blue-100 flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="size-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-neutral-900">Choose your plan</h2>
                <p className="text-sm text-neutral-600 mt-2">14-day free trial • No credit card required</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Standard Plan */}
                <button
                  onClick={() => setSubscriptionTier('standard')}
                  className={`p-6 border-2 rounded-xl text-left transition-all ${
                    subscriptionTier === 'standard'
                      ? 'border-blue-600 bg-blue-50 shadow-md'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900">Standard</h3>
                      <p className="text-sm text-neutral-600">Perfect for small teams</p>
                    </div>
                    {subscriptionTier === 'standard' && (
                      <div className="size-6 rounded-full bg-blue-600 flex items-center justify-center">
                        <Check className="size-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-neutral-900">$29</span>
                    <span className="text-neutral-600 ml-1">/month</span>
                  </div>
                  <ul className="space-y-2 text-sm text-neutral-700">
                    <li className="flex items-center gap-2">
                      <Check className="size-4 text-blue-600" />
                      Up to 50 users
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="size-4 text-blue-600" />
                      Photos & documents
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="size-4 text-blue-600" />
                      Mobile & desktop apps
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="size-4 text-blue-600" />
                      Standard support
                    </li>
                  </ul>
                </button>

                {/* Premium Plan */}
                <button
                  onClick={() => setSubscriptionTier('premium')}
                  className={`p-6 border-2 rounded-xl text-left transition-all relative ${
                    subscriptionTier === 'premium'
                      ? 'border-blue-600 bg-blue-50 shadow-md'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                    Popular
                  </div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900">Premium</h3>
                      <p className="text-sm text-neutral-600">For growing organizations</p>
                    </div>
                    {subscriptionTier === 'premium' && (
                      <div className="size-6 rounded-full bg-blue-600 flex items-center justify-center">
                        <Check className="size-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-neutral-900">$79</span>
                    <span className="text-neutral-600 ml-1">/month</span>
                  </div>
                  <ul className="space-y-2 text-sm text-neutral-700">
                    <li className="flex items-center gap-2">
                      <Check className="size-4 text-blue-600" />
                      Up to 100 users
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="size-4 text-blue-600" />
                      Video attachments (15s)
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="size-4 text-blue-600" />
                      Priority support
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="size-4 text-blue-600" />
                      Advanced reporting
                    </li>
                  </ul>
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-neutral-700">
                <p className="font-medium mb-1">What happens next?</p>
                <ul className="space-y-1 text-neutral-600">
                  <li>• Access all features for 14 days completely free</li>
                  <li>• Add your billing details anytime during the trial</li>
                  <li>• Cancel anytime before the trial ends - no charges</li>
                </ul>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-5 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle className="size-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="flex-1 py-3 border-2 border-neutral-300 text-neutral-700 rounded-lg font-semibold hover:border-neutral-400 hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="size-5" />
                Back
              </button>
            )}

            {step < totalSteps ? (
              <button
                onClick={handleNext}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="size-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Start Free Trial
                    <Check className="size-5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Login Link */}
        <p className="text-center text-sm text-neutral-600 mt-6">
          Already have an account?{' '}
          <button onClick={onNavigateToLogin} className="text-blue-600 hover:text-blue-700 font-medium">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
