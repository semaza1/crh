import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Mail, Lock, AlertCircle } from 'lucide-react';
import Logo from '../../assets/Logo.png';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, userProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Auto-redirect when profile loads
  useEffect(() => {
    if (!authLoading && userProfile) {
      console.log('Redirecting user with role:', userProfile.role);
      const destination = userProfile.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
      navigate(destination, { replace: true });
    }
  }, [authLoading, userProfile, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Logging in...');
      const { error: signInError } = await signIn(email, password);

      if (signInError) {
        console.error('Login failed:', signInError);
        throw signInError;
      }

      console.log('Login successful!');
      // useEffect will handle redirect
    } catch (err) {
      console.error('Login error:', err);
      
      let message = 'Failed to sign in';
      if (err.message?.includes('Invalid login credentials')) {
        message = 'Invalid email or password';
      } else if (err.message?.includes('Email not confirmed')) {
        message = 'Please confirm your email first';
      } else if (err.message) {
        message = err.message;
      }
      
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/40 via-slate-900 to-slate-900"></div>
      <div className="absolute top-1/4 -left-64 w-96 h-96 bg-brand-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-1/3 -right-64 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="max-w-md w-full relative z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6 relative group">
            <div className="absolute inset-0 bg-brand-500 rounded-2xl blur-md opacity-40 group-hover:opacity-70 transition-opacity"></div>
            <img src={Logo} alt="CRH Logo" className="relative h-20 w-20 rounded-2xl bg-white p-2 shadow-xl" />
          </Link>
          <h2 className="text-4xl font-playfair font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-slate-400 font-medium">Sign in to continue your journey</p>
        </div>

        <div className="glass-dark rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/10">
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start animate-fade-in">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 shrink-0" />
              <p className="text-sm font-medium text-red-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-brand-400 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium placeholder-slate-500"
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-brand-400 transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium placeholder-slate-500"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white py-4 rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-brand-500/30 transform hover:-translate-y-0.5 relative overflow-hidden"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
            <p className="text-sm font-medium text-slate-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-brand-400 hover:text-brand-300 font-bold transition-colors">
                Create one now
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

export default LoginPage;