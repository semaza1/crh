import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { 
  BookOpen, Users, FileText, Bell, LogOut, 
  BarChart3, TrendingUp, GraduationCap, Home,
  Plus, Edit, Trash2, Eye, ArrowUpRight, ShieldCheck,
  CheckCircle, Sparkles, Layers
} from 'lucide-react';

const AdminDashboard = () => {
  const { signOut, userProfile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalResources: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchDashboardData();
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [usersCount, coursesCount, enrollmentsCount, resourcesCount] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('enrollments').select('*', { count: 'exact', head: true }),
        supabase.from('resources').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        totalUsers: usersCount.count || 0,
        totalCourses: coursesCount.count || 0,
        totalEnrollments: enrollmentsCount.count || 0,
        totalResources: resourcesCount.count || 0
      });

      // Fetch recent users
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentUsers(usersData || []);

      // Fetch recent enrollments with course info
      const { data: enrollmentsData } = await supabase
        .from('enrollments')
        .select(`
          *,
          users (name, email),
          courses (title)
        `)
        .order('enrolled_at', { ascending: false })
        .limit(5);
      setRecentEnrollments(enrollmentsData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-500/20 border-t-brand-500 mb-4"></div>
        <p className="text-slate-400 font-semibold text-sm">Loading administrator command center...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-brand-500 selection:text-white">
      {/* Top Navbar */}
      <nav className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-600/30">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-playfair text-xl font-bold tracking-tight text-white">
                  CRH <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">Admin</span>
                </span>
                <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  Command Center
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link 
                to="/" 
                className="text-slate-300 hover:text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold hover:bg-white/5 transition-colors flex items-center gap-1.5"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Landing Page</span>
              </Link>
              
              <Link 
                to="/user/dashboard" 
                className="text-slate-300 hover:text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold hover:bg-white/5 transition-colors flex items-center gap-1.5"
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Student View</span>
              </Link>

              <button
                onClick={handleSignOut}
                className="text-slate-300 hover:text-red-400 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold hover:bg-red-500/10 transition-colors flex items-center gap-1.5"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Welcome Banner */}
      <div className="relative bg-slate-900 text-white overflow-hidden py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/50 via-slate-900 to-slate-900 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="h-3.5 w-3.5" /> Platform Health: All Systems Operational
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-white tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">{userProfile?.name || 'Administrator'}</span>
            </h1>
            <p className="text-slate-400 mt-2 text-base font-medium max-w-xl">
              Monitor real-time student activity, manage curriculum content, and oversee operations across Career Reach Hub.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/admin/courses"
              className="px-5 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Course</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Registered Students</span>
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{stats.totalUsers}</p>
            <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Active Platform Base</span>
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Courses</span>
              <div className="p-3 bg-brand-50 rounded-2xl text-brand-600">
                <BookOpen className="h-6 w-6" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{stats.totalCourses}</p>
            <p className="text-xs text-slate-500 font-medium mt-2">
              Published & Draft Curriculum
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Enrollments</span>
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                <GraduationCap className="h-6 w-6" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{stats.totalEnrollments}</p>
            <p className="text-xs text-slate-500 font-medium mt-2">
              Student course seats
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Career Resources</span>
              <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                <FileText className="h-6 w-6" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{stats.totalResources}</p>
            <p className="text-xs text-slate-500 font-medium mt-2">
              Toolkits, guides, & articles
            </p>
          </div>
        </div>

        {/* Quick Launchers */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-slate-900">Administration Portals</h2>
            <span className="text-xs font-bold text-slate-400">Quick Navigation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            <Link
              to="/admin/courses"
              className="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-brand-500/50 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1 group-hover:text-brand-600 transition-colors">Courses & Modules</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Create, edit, pricing, and curriculum order.</p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-brand-600">
                <span>Manage</span>
                <ArrowUpRight className="h-4 w-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </Link>

            <Link
              to="/admin/users"
              className="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-brand-500/50 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center justify-center mb-4">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1 group-hover:text-brand-600 transition-colors">User Accounts</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Admin roles, account directory, and status.</p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-brand-600">
                <span>Manage</span>
                <ArrowUpRight className="h-4 w-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </Link>

            <Link
              to="/admin/enrollments"
              className="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-brand-500/50 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors flex items-center justify-center mb-4">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1 group-hover:text-brand-600 transition-colors">Enrollments</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Student course access and completion status.</p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-brand-600">
                <span>Manage</span>
                <ArrowUpRight className="h-4 w-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </Link>

            <Link
              to="/admin/resources"
              className="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-brand-500/50 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1 group-hover:text-brand-600 transition-colors">Resource Library</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Upload toolkits, PDFs, links, and guides.</p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-brand-600">
                <span>Manage</span>
                <ArrowUpRight className="h-4 w-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </Link>

            <Link
              to="/admin/notifications"
              className="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-brand-500/50 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors flex items-center justify-center mb-4">
                  <Bell className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1 group-hover:text-brand-600 transition-colors">Announcements</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Broadcast messages and student alerts.</p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-brand-600">
                <span>Manage</span>
                <ArrowUpRight className="h-4 w-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </Link>
          </div>
        </div>

        {/* Live Activity Feeds Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Recent Student Signups</h3>
              </div>
              <Link 
                to="/admin/users" 
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {recentUsers.length === 0 ? (
              <p className="text-slate-400 text-xs font-medium py-8 text-center">No recent signups registered.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentUsers.map((user) => (
                  <div key={user.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold text-sm flex items-center justify-center">
                        {user.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{user.name || 'Anonymous Student'}</p>
                        <p className="text-xs text-slate-500 font-medium truncate max-w-xs">{user.email}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {user.role || 'student'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Enrollments Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Latest Course Enrollments</h3>
              </div>
              <Link 
                to="/admin/enrollments" 
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {recentEnrollments.length === 0 ? (
              <p className="text-slate-400 text-xs font-medium py-8 text-center">No recent course enrollments found.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentEnrollments.map((enrollment) => (
                  <div key={enrollment.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                    <div className="min-w-0 pr-4">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {enrollment.users?.name || 'Registered Student'}
                      </p>
                      <p className="text-xs text-slate-500 font-medium truncate">
                        enrolled in <span className="text-brand-600 font-semibold">{enrollment.courses?.title || 'Selected Course'}</span>
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 shrink-0">
                      {new Date(enrollment.enrolled_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;