import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, KeyRound, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login({ email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (role: 'student' | 'admin' | 'faculty') => {
    if (role === 'student') {
      setEmail('elena.rostova@campus.edu');
      setPassword('Password123!');
    } else if (role === 'admin') {
      setEmail('admin@campus.edu');
      setPassword('Password123!');
    } else {
      setEmail('dr.chen@campus.edu');
      setPassword('Password123!');
    }
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center space-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-campus-forest font-bold">
            University Authentication Gateway
          </span>
          <h2 className="font-serif font-black text-3xl sm:text-4xl text-campus-charcoal">
            Welcome back to CampusFind
          </h2>
          <p className="text-xs text-campus-charcoal/60 font-sans">
            Sign in with your verified institutional college email address
          </p>
        </div>

        <div className="mt-8 bg-campus-white border-2 border-campus-charcoal p-6 sm:p-8 shadow-brutal-lg">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 border border-red-300 text-xs font-mono text-red-700">
                {error}
              </div>
            )}

            <Input
              label="College Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. yourname@campus.edu"
              required
            />

            <div>
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />
              <div className="flex justify-end mt-1">
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-mono text-campus-charcoal/60 hover:text-campus-charcoal hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In to Account
              </Button>
            </div>
          </form>

          {/* Instant Demo Fill Panel */}
          <div className="mt-6 pt-5 border-t border-campus-charcoal/20">
            <span className="text-[10px] font-mono uppercase tracking-wider text-campus-charcoal/60 block mb-2">
              Instant Demo Fill (Evaluation Mode):
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemoCredentials('student')}
                className="p-1.5 bg-campus-ivory border border-campus-charcoal text-[11px] font-mono font-medium hover:bg-campus-lime transition-colors"
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('faculty')}
                className="p-1.5 bg-campus-ivory border border-campus-charcoal text-[11px] font-mono font-medium hover:bg-campus-lime transition-colors"
              >
                Faculty
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('admin')}
                className="p-1.5 bg-campus-forest text-campus-ivory border border-campus-charcoal text-[11px] font-mono font-medium hover:bg-campus-charcoal transition-colors"
              >
                Super Admin
              </button>
            </div>
          </div>

          <div className="mt-6 text-center pt-4 border-t border-campus-charcoal/10">
            <p className="text-xs text-campus-charcoal/70">
              Don&apos;t have an account yet?{' '}
              <Link to="/register" className="font-bold text-campus-forest hover:underline">
                Create new account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
