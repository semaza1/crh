import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Mail, Lock, User, Phone, List, AlertCircle, CheckCircle } from 'lucide-react';
import Logo from '../../assets/Logo.png';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    interests: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    setLoading(true);

    try {
      console.log('Starting signup...');
      
      const { data, error: signUpError } = await signUp(
        formData.email.trim(),
        formData.password,
        formData.name.trim(),
        formData.phone.trim(),
        formData.interests.trim()
      );

      if (signUpError) {
        throw signUpError;
      }
      
      if (!data?.user) {
        throw new Error('No user data returned');
      }

      console.log('Signup successful!');
      setSuccess(true);
      
      // Check if email confirmation is required
      if (!data.session) {
        // Email confirmation required - redirect to login
        setTimeout(() => {
          alert('Please check your email to confirm your account before signing in.');
          navigate('/login');
        }, 2000);
      } else {
        // Auto logged in - redirect to dashboard
        setTimeout(() => {
          navigate('/user/dashboard');
        }, 2000);
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/40 via-slate-900 to-slate-900"></div>
      <div className="absolute top-1/4 -right-64 w-96 h-96 bg-brand-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-1/3 -left-64 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="max-w-xl w-full relative z-10 animate-fade-in-up py-12">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6 relative group">
            <div className="absolute inset-0 bg-brand-500 rounded-2xl blur-md opacity-40 group-hover:opacity-70 transition-opacity"></div>
            <img src={Logo} alt="CRH Logo" className="relative h-20 w-20 rounded-2xl bg-white p-2 shadow-xl" />
          </Link>
          <h2 className="text-4xl font-playfair font-bold text-white mb-2">Create Account</h2>
          <p className="text-slate-400 font-medium">Join CRH and start learning today</p>
        </div>

        <div className="glass-dark rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/10">
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start animate-fade-in">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-sm font-medium text-red-200">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-500/10 border border-green-500/50 rounded-xl p-4 flex items-start animate-fade-in">
              <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-sm font-medium text-green-200">Account created successfully! Redirecting...</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-slate-300 mb-2">
                  Full Name *
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-brand-400 transition-colors" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium placeholder-slate-500"
                    placeholder="John Doe"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-bold text-slate-300 mb-2">
                  Phone Number *
                </label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-brand-400 transition-colors" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium placeholder-slate-500"
                    placeholder="+250 7xx xxx xxx"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="interests" className="block text-sm font-bold text-slate-300 mb-2">
                Interests (optional)
              </label>
              <div className="relative group">
                <List className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-brand-400 transition-colors" />
                <input
                  id="interests"
                  name="interests"
                  type="text"
                  value={formData.interests}
                  onChange={handleChange}
                  className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium placeholder-slate-500"
                  placeholder="technology, health, business"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-slate-300 mb-2">
                Email Address *
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-brand-400 transition-colors" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium placeholder-slate-500"
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="password" className="block text-sm font-bold text-slate-300 mb-2">
                  Password *
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-brand-400 transition-colors" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium placeholder-slate-500"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-bold text-slate-300 mb-2">
                  Confirm Password *
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-brand-400 transition-colors" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium placeholder-slate-500"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white py-4 rounded-xl font-bold mt-4 transition-all disabled:opacity-50 shadow-lg shadow-brand-500/30 transform hover:-translate-y-0.5 relative overflow-hidden"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </div>
              ) : 'Sign Up'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
            <p className="text-sm font-medium text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-400 hover:text-brand-300 font-bold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link to="/" className="inline-flex items-center text-sm font-semibold text-slate-400 hover:text-white transition-colors group">
            <span className="transform group-hover:-translate-x-1 transition-transform inline-block mr-2">←</span> 
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;