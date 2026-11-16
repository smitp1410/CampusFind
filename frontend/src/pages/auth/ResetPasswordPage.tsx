import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { KeyRound, ArrowRight, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenFromUrl = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.resetPassword({
        token: token.trim(),
        new_password: newPassword,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update password. Token may be invalid or expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center space-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-campus-forest font-bold">
            Security Update
          </span>
          <h2 className="font-serif font-black text-3xl sm:text-4xl text-campus-charcoal">
            Choose New Password
          </h2>
        </div>

        <div className="mt-8 bg-campus-white border-2 border-campus-charcoal p-6 sm:p-8 shadow-brutal-lg">
          {success ? (
            <div className="text-center space-y-4 py-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="font-serif font-bold text-xl text-campus-charcoal">
                Password Successfully Reset
              </h4>
              <p className="text-xs text-campus-charcoal/70">
                Redirecting you to the sign in page...
              </p>
              <Link to="/login">
                <Button variant="primary" size="sm">
                  Go to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 bg-red-50 border border-red-300 text-xs font-mono text-red-700">
                  {error}
                </div>
              )}

              <Input
                label="Security Reset Token *"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste reset token here"
                required
              />

              <Input
                label="New Password *"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="lime"
                  size="md"
                  className="w-full"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Save New Password
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
