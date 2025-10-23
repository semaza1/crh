import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { 
  BookOpen, Users, FileText, Bell, LogOut, 
  BarChart, TrendingUp, GraduationCap, Home,
  Plus, Edit, Trash2, Eye
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
      console.log('Fetching admin dashboard data...');

      // Fetch stats
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

      console.log('Dashboard data loaded');
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-purple-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">CRH Admin</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                <Home className="h-4 w-4 mr-1" />
                Home
              </Link>
              <Link to="/user/dashboard" className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium">
                User View
              </Link>
              <button
                onClick={handleSignOut}
                className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-purple-100">
            Welcome back, {userProfile?.name}! Manage your platform effectively.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                <p className="text-xs text-green-600 mt-2 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Active platform
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalCourses}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Available courses
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <BookOpen className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Enrollments</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalEnrollments}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Total enrollments
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <GraduationCap className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Resources</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalResources}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Available resources
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <FileText className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/courses"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center mb-3">
                <div className="bg-purple-100 p-2 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="ml-3 font-semibold text-gray-900">Courses</h3>
              </div>
              <p className="text-sm text-gray-600">Manage all courses</p>
            </Link>

            <Link
              to="/admin/users"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center mb-3">
                <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="ml-3 font-semibold text-gray-900">Users</h3>
              </div>
              <p className="text-sm text-gray-600">Manage user accounts</p>
            </Link>

            <Link
              to="/admin/resources"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center mb-3">
                <div className="bg-orange-100 p-2 rounded-lg group-hover:bg-orange-200 transition-colors">
                  <FileText className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="ml-3 font-semibold text-gray-900">Resources</h3>
              </div>
              <p className="text-sm text-gray-600">Manage resources</p>
            </Link>

            <Link
              to="/admin/enrollments"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center mb-3">
                <div className="bg-green-100 p-2 rounded-lg group-hover:bg-green-200 transition-colors">
                  <GraduationCap className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="ml-3 font-semibold text-gray-900">Enrollments</h3>
              </div>
              <p className="text-sm text-gray-600">View enrollments</p>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Recent Users
              </h3>
              <Link to="/admin/users" className="text-sm text-blue-600 hover:text-blue-700">
                View all →
              </Link>
            </div>
            {recentUsers.length === 0 ? (
              <p className="text-gray-500 text-sm">No users yet</p>
            ) : (
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Enrollments */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <GraduationCap className="h-5 w-5 mr-2 text-green-600" />
                Recent Enrollments
              </h3>
              <Link to="/admin/enrollments" className="text-sm text-green-600 hover:text-green-700">
                View all →
              </Link>
            </div>
            {recentEnrollments.length === 0 ? (
              <p className="text-gray-500 text-sm">No enrollments yet</p>
            ) : (
              <div className="space-y-3">
                {recentEnrollments.map((enrollment) => (
                  <div key={enrollment.id} className="py-2 border-b border-gray-100 last:border-0">
                    <p className="font-medium text-gray-900 text-sm">
                      {enrollment.users?.name || 'Unknown User'}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      enrolled in <span className="font-medium">{enrollment.courses?.title || 'Unknown Course'}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(enrollment.enrolled_at).toLocaleDateString()}
                    </p>
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