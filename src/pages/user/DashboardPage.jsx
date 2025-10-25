import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { 
  BookOpen, GraduationCap, Bell, LogOut, User as UserIcon, Home,
  TrendingUp, Award, Clock, PlayCircle, CheckCircle, Star,
  Calendar, ArrowRight, BookMarked, Target, Zap
} from 'lucide-react';

import Logo from '../../assets/Logo.png';

const DashboardPage = () => {
  const { user, userProfile, signOut, isAdmin } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    totalEnrolled: 0,
    completed: 0,
    inProgress: 0,
    certificates: 0,
    totalLearningHours: 0,
    currentStreak: 7
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (user && userProfile && !hasFetched.current) {
      hasFetched.current = true;
      fetchDashboardData();
    }
  }, [user, userProfile]);

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...');
      
      // Fetch enrollments with course details
      const { data: enrollmentData, error: enrollError } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses (
            id,
            title,
            description,
            thumbnail_url,
            is_premium,
            level,
            duration,
            price
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (enrollError) {
        console.error('Enrollment error:', enrollError);
        setEnrollments([]);
      } else {
        const enrollmentsWithProgress = await Promise.all(
          (enrollmentData || []).map(async (enrollment) => {
            const progress = await calculateCourseProgress(enrollment.course_id);
            return { ...enrollment, progress };
          })
        );
        setEnrollments(enrollmentsWithProgress);
      }

      // Fetch available courses (not enrolled)
      const enrolledIds = enrollmentData?.map(e => e.course_id) || [];
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('status', 'published')
        .not('id', 'in', `(${enrolledIds.length > 0 ? enrolledIds.join(',') : 'null'})`)
        .order('created_at', { ascending: false })
        .limit(6);

      if (coursesError) {
        console.error('Courses error:', coursesError);
        setAvailableCourses([]);
      } else {
        setAvailableCourses(coursesData || []);
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
        setNotifications([]);
      } else {
        setNotifications(notificationData || []);
      }

      // Calculate statistics
      await calculateStats(enrollmentData || []);

      // Fetch recent activity
      await fetchRecentActivity();

      console.log('Dashboard data loaded');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCourseProgress = async (courseId) => {
    try {
      // Get total lessons for the course
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('id')
        .eq('course_id', courseId);

      if (lessonsError) throw lessonsError;

      if (!lessons || lessons.length === 0) return 0;

      const lessonIds = lessons.map(l => l.id);

      // Get completed lessons for this user that match course lessons
      const { data: completed, error: progressError } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('user_id', user.id)
        .in('lesson_id', lessonIds)
        .eq('completed', true);

      if (progressError) throw progressError;

      const totalLessons = lessons.length;
      const completedLessons = completed?.length || 0;

      return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    } catch (error) {
      console.error('Error calculating progress:', error);
      return 0;
    }
  };

  const calculateStats = async (enrollmentData) => {
    let completedCount = 0;
    let inProgressCount = 0;

    for (const enrollment of enrollmentData) {
      const progress = await calculateCourseProgress(enrollment.course_id);
      if (progress === 100) {
        completedCount++;
      } else if (progress > 0) {
        inProgressCount++;
      }
    }

    setStats({
      totalEnrolled: enrollmentData.length,
      completed: completedCount,
      inProgress: inProgressCount,
      certificates: completedCount,
      totalLearningHours: enrollmentData.length * 8,
      currentStreak: 7
    });
  };

  const fetchRecentActivity = async () => {
    try {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Fetch lesson details for each progress record
      const activityWithDetails = await Promise.all(
        (data || []).map(async (progress) => {
          const { data: lesson } = await supabase
            .from('lessons')
            .select('title, course_id')
            .eq('id', progress.lesson_id)
            .single();

          if (lesson) {
            const { data: course } = await supabase
              .from('courses')
              .select('title')
              .eq('id', lesson.course_id)
              .single();

            return {
              ...progress,
              lessons: {
                title: lesson.title,
                courses: {
                  title: course?.title
                }
              }
            };
          }
          return progress;
        })
      );

      setRecentActivity(activityWithDetails.filter(a => a.lessons));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      setRecentActivity([]);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

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
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src={Logo} alt="CRH Logo" className="h-12 w-12" />
              <span className="ml-2 text-xl font-bold text-gray-900">CRH</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/user/dashboard" className="text-blue-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                <Home className="h-4 w-4 mr-1" />
                Dashboard
              </Link>
              <Link to="/user/course" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Courses
              </Link>
              <Link to="/user/resources/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                Resources
              </Link>
              <Link to="/user/profile" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                <UserIcon className="h-4 w-4 mr-1" />
                Profile
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {getGreeting()}, {userProfile?.name}!
              </h1>
              <p className="text-blue-100 mb-4">
                Ready to continue your learning journey today?
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-white bg-opacity-20 rounded-lg px-4 py-2">
                  <Zap className="h-5 w-5 mr-2" />
                  <span className="font-semibold">{stats.currentStreak} day streak</span>
                </div>
                <div className="flex items-center bg-white bg-opacity-20 rounded-lg px-4 py-2">
                  <Target className="h-5 w-5 mr-2" />
                  <span className="font-semibold">{stats.totalLearningHours}h learned</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <GraduationCap className="h-16 w-16" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-blue-100 p-3 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.totalEnrolled}</span>
            </div>
            <p className="text-sm text-gray-600">Enrolled Courses</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.completed}</span>
            </div>
            <p className="text-sm text-gray-600">Completed</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-orange-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.inProgress}</span>
            </div>
            <p className="text-sm text-gray-600">In Progress</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.certificates}</span>
            </div>
            <p className="text-sm text-gray-600">Certificates</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Continue Learning */}
            {enrollments.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Continue Learning</h2>
                  <Link to="/user/course" className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center">
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {enrollments.slice(0, 4).map((enrollment) => (
                    <Link
                      key={enrollment.id}
                      to={`/user/course/${enrollment.course_id}`}
                      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all group"
                    >
                      <div className="relative h-40 bg-gradient-to-r from-blue-500 to-purple-500">
                        {enrollment.courses?.thumbnail_url ? (
                          <img 
                            src={enrollment.courses.thumbnail_url} 
                            alt={enrollment.courses?.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="h-12 w-12 text-white opacity-50" />
                          </div>
                        )}
                        {enrollment.courses?.is_premium && (
                          <span className="absolute top-3 right-3 bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded">
                            Premium
                          </span>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {enrollment.courses?.title || 'Untitled Course'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {enrollment.courses?.description || 'No description available'}
                        </p>
                        
                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Progress</span>
                            <span className="font-semibold">{enrollment.progress || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${enrollment.progress || 0}%` }}
                            ></div>
                          </div>
                        </div>

                        <button className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center">
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Continue
                        </button>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Available Courses */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
                <Link to="/user/course/" className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center">
                  Explore All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>

              {availableCourses.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <BookMarked className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No new courses available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {availableCourses.map((course) => (
                    <Link
                      key={course.id}
                      to={`/user/course/${course.id}`}
                      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all group"
                    >
                      <div className="relative h-40 bg-gradient-to-r from-purple-500 to-pink-500">
                        {course.thumbnail_url ? (
                          <img 
                            src={course.thumbnail_url} 
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="h-12 w-12 text-white opacity-50" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <span className={`${
                            course.is_premium 
                              ? 'bg-yellow-500' 
                              : 'bg-green-500'
                          } text-white text-xs font-semibold px-2 py-1 rounded`}>
                            {course.is_premium ? `$${course.price}` : 'Free'}
                          </span>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold text-gray-500 uppercase">{course.level}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {course.duration}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {course.description}
                        </p>
                        <button className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all">
                          View Course
                        </button>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Notifications */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Bell className="h-5 w-5 mr-2 text-purple-600" />
                Notifications
                {notifications.length > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {notifications.length}
                  </span>
                )}
              </h3>
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No new notifications</p>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="border-l-4 border-blue-500 pl-3 py-2 hover:bg-gray-50 rounded transition-colors">
                      <p className="text-sm font-medium text-gray-900">{notif.subject}</p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notif.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Recent Activity
              </h3>
              {recentActivity.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className={`mt-1 p-1.5 rounded-full ${
                        activity.completed ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        {activity.completed ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <PlayCircle className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {activity.lessons?.title}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {activity.lessons?.courses?.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(activity.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-sm p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/user/course/"
                  className="block w-full py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-center font-medium transition-all"
                >
                  Browse Courses
                </Link>
                <Link
                  to="/user/course/"
                  className="block w-full py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-center font-medium transition-all"
                >
                  My Learning
                </Link>
                <Link
                  to="/user/profile/"
                  className="block w-full py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-center font-medium transition-all"
                >
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <img src={Logo} alt="CRH Logo" className="h-12 w-12 rounded-full" />
              <span className="ml-2 text-lg font-bold">Career Connect Hub</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link to="/user/dashboard/" className="hover:text-white transition-colors">Home</Link>
              <Link to="/user/course/" className="hover:text-white transition-colors">Courses</Link>
              <Link to="/user/resources/" className="hover:text-white transition-colors">Resources</Link>
              <Link to="#" className="hover:text-white transition-colors">Contact</Link>
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