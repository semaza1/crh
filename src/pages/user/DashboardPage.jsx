import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { BookOpen, GraduationCap, Bell, LogOut, User as UserIcon, Home } from 'lucide-react';

import Logo from '../../assets/Logo.png';

const DashboardPage = () => {
  const { user, userProfile, signOut, isAdmin } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  useEffect(() => {
    // Only fetch once when user is available
    if (user && userProfile && !hasFetched.current) {
      hasFetched.current = true;
      fetchDashboardData();
    }
  }, [user, userProfile]);

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...');
      
      // Fetch enrollments
      const { data: enrollmentData, error: enrollError } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses (
            id,
            title,
            description,
            is_premium
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (enrollError) {
        console.error('Enrollment error:', enrollError);
        // Don't throw, just set empty array
        setEnrollments([]);
      } else {
        setEnrollments(enrollmentData || []);
      }

      // Fetch notifications
      const { data: notificationData, error: notifError } = await supabase
        .from('email_notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (notifError) {
        console.error('Notification error:', notifError);
        // Don't throw, just set empty array
        setNotifications([]);
      } else {
        setNotifications(notificationData || []);
      }

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

  // Show loading only if user or profile is not ready
  if (!user || !userProfile || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
              <img src={Logo} alt="CRH Logo" className="h-8 w-8" />
              <span className="ml-2 text-xl font-bold text-gray-900">CRH</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/user/dashboard/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                <Home className="h-4 w-4 mr-1" />
                Home
              </Link>
              <Link to="/user/course" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Courses
              </Link>
              <Link to="/user/resources" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Resources
              </Link>
              <Link to="/user/profile" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                <UserIcon className="h-4 w-4 mr-1" />
                {userProfile?.name || 'Profile'}
              </Link>
              {isAdmin && (
                <Link to="/admin/dashboard" className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700">
                  Admin
                </Link>
              )}
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
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {userProfile?.name}!
          </h1>
          <p className="text-blue-100">
            Continue your learning journey and achieve your goals.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Courses</p>
                  <p className="text-3xl font-bold text-gray-900">{enrollments.length}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <GraduationCap className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Notifications</p>
                  <p className="text-3xl font-bold text-gray-900">{notifications.length}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Bell className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Panel */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Bell className="h-5 w-5 mr-2 text-purple-600" />
              Recent Notifications
            </h3>
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-sm">No new notifications</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div key={notif.id} className="border-l-4 border-blue-500 pl-3 py-2">
                    <p className="text-sm font-medium text-gray-900">{notif.subject}</p>
                    <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
            <Link
              to="/user/course"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Browse All Courses →
            </Link>
          </div>

          {enrollments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No courses yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start your learning journey by enrolling in a course
              </p>
              <Link
                to="/courses"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Explore Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-32">
                    {/* Course image */}
                    <img src={enrollment.courses?.thumbanail_url} alt={enrollment.courses?.title} className="w-full h-32 object-cover" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {enrollment.courses?.title || 'Untitled Course'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {enrollment.courses?.description || 'No description available'}
                    </p>
                    {enrollment.courses?.is_premium && (
                      <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">
                        Premium
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <BookOpen className="h-6 w-6 text-purple-500" />
              <span className="ml-2 text-lg font-bold">Career Connect Hub</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <Link to="/courses" className="hover:text-white transition-colors">Courses</Link>
              <Link to="/resources" className="hover:text-white transition-colors">Resources</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 pt-6 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} Career Connect Hub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardPage;