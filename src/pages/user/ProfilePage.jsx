import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { 
  User, Mail, Phone, Tag, Save, 
  Check, AlertCircle, Lock, Edit2, X, BookOpen, Award,
  TrendingUp, Clock
} from 'lucide-react';

const ProfilePage = () => {
  const { userProfile, setUserProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    totalLearningTime: 0,
    certificates: 0
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interests: '',
    role: 'user'
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    if (!userProfile) {
      navigate('/login');
      return;
    }
    loadProfile();
    fetchUserStats();
  }, [userProfile]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userProfile.id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          interests: data.interests || '',
          role: data.role || 'user'
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      showMessage('error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      // Get enrolled courses
      const { data: enrollments, error: enrollError } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', userProfile.id)
        .eq('status', 'active');

      if (enrollError) throw enrollError;

      const enrolledCount = enrollments?.length || 0;

      // Get completed courses (100% progress)
      let completedCount = 0;
      for (const enrollment of enrollments || []) {
        const { data: lessons } = await supabase
          .from('lessons')
          .select('id')
          .eq('course_id', enrollment.course_id);

        const { data: completed } = await supabase
          .from('lesson_progress')
          .select('lesson_id')
          .eq('user_id', userProfile.id)
          .eq('course_id', enrollment.course_id)
          .eq('completed', true);

        if (lessons?.length > 0 && completed?.length === lessons?.length) {
          completedCount++;
        }
      }

      setStats({
        enrolledCourses: enrolledCount,
        completedCourses: completedCount,
        totalLearningTime: enrolledCount * 8,
        certificates: completedCount
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name,
          phone: formData.phone,
          interests: formData.interests,
          updated_at: new Date().toISOString()
        })
        .eq('id', userProfile.id);

      if (error) throw error;

      // Update auth context
      setUserProfile({ ...userProfile, ...formData });

      showMessage('success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      showMessage('error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('error', 'New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showMessage('error', 'Password must be at least 6 characters');
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      showMessage('success', 'Password updated successfully!');
      setShowPasswordModal(false);
      setPasswordData({
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error updating password:', error);
      showMessage('error', error.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-500/20 border-t-brand-500 mb-4"></div>
        <p className="text-slate-400 font-semibold text-sm">Loading user profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Top Banner Header */}
      <div className="relative bg-slate-900 text-white overflow-hidden py-14 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/50 via-slate-900 to-slate-900 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <button 
                onClick={() => navigate('/user/dashboard')} 
                className="inline-flex items-center text-sm font-semibold text-brand-400 hover:text-brand-300 transition-colors mb-3 group"
              >
                <span className="transform group-hover:-translate-x-1 transition-transform mr-1.5">←</span>
                Back to Dashboard
              </button>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-white tracking-tight">
                Account <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">Settings</span>
              </h1>
              <p className="text-slate-400 mt-2 text-base font-medium">
                Manage your personal profile, credentials, and learning preferences.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-wider text-slate-200">
                {formData.role === 'admin' ? '🛡️ Administrator' : '🎓 Student Member'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Messages */}
        {message.text && (
          <div className={`mb-8 rounded-2xl p-4 flex items-center shadow-lg animate-fade-in ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-700' 
              : 'bg-red-500/10 border border-red-500/30 text-red-700'
          }`}>
            {message.type === 'success' ? (
              <Check className="h-5 w-5 text-emerald-600 mr-3 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 mr-3 shrink-0" />
            )}
            <p className="text-sm font-bold">
              {message.text}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Profile Summary Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 sticky top-8">
              {/* Avatar & Identifiers */}
              <div className="text-center mb-6">
                <div className="relative inline-block mb-4">
                  <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-xl shadow-brand-500/20 border-4 border-white">
                    <span>{formData.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-slate-900">
                  {formData.name || 'User'}
                </h2>
                <p className="text-sm font-medium text-slate-500 mt-0.5">{formData.email}</p>
              </div>

              {/* Learning Stats Grid */}
              <div className="border-t border-slate-100 pt-6 space-y-3">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-brand-100 text-brand-600">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-600">Enrolled Courses</span>
                  </div>
                  <span className="font-extrabold text-slate-900 text-sm">{stats.enrolledCourses}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-600">Completed</span>
                  </div>
                  <span className="font-extrabold text-slate-900 text-sm">{stats.completedCourses}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
                      <Award className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-600">Certificates</span>
                  </div>
                  <span className="font-extrabold text-slate-900 text-sm">{stats.certificates}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-100 text-purple-600">
                      <Clock className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-600">Study Hours</span>
                  </div>
                  <span className="font-extrabold text-slate-900 text-sm">{stats.totalLearningTime}h</span>
                </div>
              </div>

              {/* Password Action */}
              <div className="border-t border-slate-100 pt-6">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-white font-bold text-sm transition-all duration-200 shadow-sm"
                >
                  <Lock className="h-4 w-4 text-brand-600" />
                  <span>Update Password</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
                    <span className="w-2.5 h-6 bg-brand-600 rounded-full"></span>
                    Personal Details
                  </h3>
                  <p className="text-sm font-medium text-slate-500 mt-1">
                    Keep your profile information accurate and updated.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Full Name *
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                {/* Email (Read Only) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Email Address <span className="text-slate-400 font-normal lowercase">(read-only)</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-100/70 border border-slate-200 rounded-2xl font-medium text-slate-500 text-sm cursor-not-allowed"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-slate-400 font-medium">
                    Email cannot be changed for security authentication integrity.
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Phone Number
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                      placeholder="+250 7xx xxx xxx"
                    />
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Learning Interests & Career Goals
                  </label>
                  <div className="relative group">
                    <Tag className="absolute left-4 top-4 h-5 w-5 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
                    <textarea
                      name="interests"
                      rows="3"
                      value={formData.interests}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                      placeholder="e.g. Software Engineering, Digital Marketing, University Applications, Finance"
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-brand-500/25 transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div>
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Profile Changes
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Account Meta */}
              <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-semibold text-slate-400">
                <span>Account ID: <code className="font-mono text-slate-600">{userProfile.id}</code></span>
                <span>Role: <strong className="text-slate-700 capitalize">{formData.role}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Update Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  placeholder="At least 6 characters"
                  minLength="6"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white"
                  placeholder="Repeat new password"
                  minLength="6"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold text-sm shadow-md shadow-brand-500/20 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;