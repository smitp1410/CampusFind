import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    student_faculty_id: '',
    department: '',
    phone: '',
    role: 'student',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await register(formData);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="text-center space-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-campus-forest font-bold">
            CampusFind Registry
          </span>
          <h2 className="font-serif font-black text-3xl sm:text-4xl text-campus-charcoal">
            Join the Campus Network
          </h2>
          <p className="text-xs text-campus-charcoal/60 font-sans">
            Register with your institutional college email address to file reports and make claims
          </p>
        </div>

        <div className="mt-8 bg-campus-white border-2 border-campus-charcoal p-6 sm:p-8 shadow-brutal-lg">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 border border-red-300 text-xs font-mono text-red-700 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Legal Name *"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Elena Rostova"
                required
              />

              <div>
                <label className="block mb-1.5 text-xs font-mono font-medium uppercase tracking-wider text-campus-charcoal/80">
                  Campus Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full bg-campus-white border border-campus-charcoal/40 text-campus-charcoal text-sm px-3.5 py-2.5 transition-colors focus:outline-none focus:border-campus-charcoal focus:ring-1 focus:ring-campus-charcoal"
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty / Professor</option>
                </select>
              </div>
            </div>

            <Input
              label="College Email Address *"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. yourname@campus.edu"
              helperText="Must belong to your college domain (e.g. @campus.edu)"
              required
            />

            <Input
              label="Password *"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Student / Faculty ID"
                name="student_faculty_id"
                value={formData.student_faculty_id}
                onChange={handleChange}
                placeholder="STU-2024-8192"
              />

              <Input
                label="Department / Major"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Architecture & Design"
              />
            </div>

            <Input
              label="Phone Number (Optional)"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 019-9182"
              helperText="Only used for urgent collection updates by campus staff."
            />

            <div className="pt-3">
              <Button
                type="submit"
                variant="lime"
                size="md"
                className="w-full"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Create Verified Account
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center pt-4 border-t border-campus-charcoal/10">
            <p className="text-xs text-campus-charcoal/70">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-campus-forest hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
