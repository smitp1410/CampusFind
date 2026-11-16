import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.forgotPassword(email.trim());
      setMessage(res.message);
      if (res.reset_token) {
        setResetToken(res.reset_token);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to process password request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center space-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-campus-forest font-bold">
            Account Recovery
          </span>
          <h2 className="font-serif font-black text-3xl sm:text-4xl text-campus-charcoal">
            Reset Password
          </h2>
          <p className="text-xs text-campus-charcoal/60 font-sans">
            Enter your college email address to receive secure reset credentials.
          </p>
        </div>

        <div className="mt-8 bg-campus-white border-2 border-campus-charcoal p-6 sm:p-8 shadow-brutal-lg">
          {resetToken ? (
            <div className="space-y-4 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="font-serif font-bold text-xl text-campus-charcoal">
                Reset Token Generated
              </h4>
              <p className="text-xs text-campus-charcoal/70 leading-relaxed font-sans">
                In this local campus environment, your token has been created directly:
              </p>
              <div className="p-3 bg-campus-ivory border border-campus-charcoal/20 font-mono text-[10px] break-all select-all">
                {resetToken}
              </div>
              <div className="pt-2">
                <Link to={`/reset-password?token=${encodeURIComponent(resetToken)}`}>
                  <Button variant="lime" size="md" className="w-full">
                    Continue to Set New Password
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 bg-red-50 border border-red-300 text-xs font-mono text-red-700">
                  {error}
                </div>
              )}
              {message && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-xs font-mono text-emerald-800">
                  {message}
                </div>
              )}

              <Input
                label="College Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. elena.rostova@campus.edu"
                required
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Send Recovery Link
                </Button>
              </div>

              <div className="pt-4 border-t border-campus-charcoal/10 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center text-xs font-mono text-campus-charcoal hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
