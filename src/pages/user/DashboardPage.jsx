import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { 
  BookOpen, GraduationCap, Bell, LogOut, User as UserIcon, Home,
  TrendingUp, Award, Clock, PlayCircle, CheckCircle, Star,
  Calendar, ArrowRight, BookMarked, Target, Zap, Menu, X
} from 'lucide-react';
import NotificationBell from '../../components/common/NotificationBell';
   // In your nav: {user && <NotificationBell />}

import Logo from '../../assets/Logo.png';

const DashboardPage = () => {
  const { user, userProfile, signOut, isAdmin } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
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
            console.log(`Course ${enrollment.courses?.title}: ${progress}% complete`);
            return { ...enrollment, progress };
          })
        );
        setEnrollments(enrollmentsWithProgress);
        
        // Calculate statistics with the fetched progress
        await calculateStats(enrollmentsWithProgress);
      }

      // Fetch available courses (not enrolled)
      const enrolledIds = enrollmentData?.map(e => e.course_id) || [];
      
      let coursesQuery = supabase
        .from('courses')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(6);

      if (enrolledIds.length > 0) {
        coursesQuery = coursesQuery.not('id', 'in', `(${enrolledIds.join(',')})`);
      }

      const { data: coursesData, error: coursesError } = await coursesQuery;

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

      // Get completed lessons for this user and course
      const { data: completed, error: progressError } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .eq('status', 'completed');

      if (progressError) throw progressError;

      const totalLessons = lessons.length;
      const completedLessons = completed?.length || 0;

      return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    } catch (error) {
      console.error('Error calculating progress:', error);
      return 0;
    }
  };

  const calculateStats = async (enrollmentsWithProgress) => {
    let completedCount = 0;
    let inProgressCount = 0;

    for (const enrollment of enrollmentsWithProgress) {
      const progress = enrollment.progress || 0;
      
      if (progress === 100) {
        completedCount++;
      } else if (progress > 0) {
        inProgressCount++;
      }
    }

    // Count total certificates (completed courses)
    const certificateCount = completedCount;

    console.log('Stats:', {
      total: enrollmentsWithProgress.length,
      completed: completedCount,
      inProgress: inProgressCount,
      certificates: certificateCount
    });

    setStats({
      totalEnrolled: enrollmentsWithProgress.length,
      completed: completedCount,
      inProgress: inProgressCount,
      certificates: certificateCount,
      totalLearningHours: enrollmentsWithProgress.length * 8,
      currentStreak: 7
    });
  };

  const fetchRecentActivity = async () => {
    try {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('last_accessed_at', { ascending: false })
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
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex text-slate-900">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 fixed h-full z-40">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-brand-600 p-2 rounded-xl">
            <img src={Logo} alt="CRH Logo" className="h-6 w-6 filter brightness-0 invert" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">CRH LMS</span>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">Menu</div>
          
          <Link to="/user/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-brand-50 text-brand-700 font-medium transition-colors">
            <Home className="h-5 w-5" />
            Dashboard
          </Link>
          <Link to="/user/course/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium transition-colors">
            <BookOpen className="h-5 w-5" />
            My Courses
          </Link>
          <Link to="/user/certificates/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium transition-colors">
            <Award className="h-5 w-5" />
            Certificates
          </Link>
          
          <div className="mt-8 mb-4 text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">Settings</div>
          <Link to="/user/profile/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium transition-colors">
            <UserIcon className="h-5 w-5" />
            Profile
          </Link>
          
          {isAdmin && (
            <Link to="/admin/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-purple-600 bg-purple-50 hover:bg-purple-100 font-medium transition-colors mt-4">
              <Target className="h-5 w-5" />
              Admin Panel
            </Link>
          )}
        </div>
        
        <div className="p-4 border-t border-slate-100">
          <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-red-600 hover:bg-red-50 font-medium transition-colors">
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header & Menu */}
      <div className="lg:hidden fixed w-full top-0 bg-white border-b border-slate-200 z-50">
        <div className="flex justify-between items-center px-4 h-16">
          <div className="flex items-center gap-2">
            <img src={Logo} alt="CRH" className="h-8 w-8" />
            <span className="font-bold">CRH</span>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-600">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {isOpen && (
          <div className="bg-white border-b border-slate-200 absolute w-full animate-fade-in shadow-xl">
            <div className="p-4 space-y-2">
              <Link to="/user/dashboard" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-xl bg-brand-50 text-brand-700 font-medium">Dashboard</Link>
              <Link to="/user/course/" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-xl text-slate-600 font-medium">Courses</Link>
              <Link to="/user/profile/" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-xl text-slate-600 font-medium">Profile</Link>
              <button onClick={handleSignOut} className="w-full text-left px-4 py-3 rounded-xl text-red-600 font-medium">Logout</button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between px-8 h-20 bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Welcome back, {userProfile?.name?.split(' ')[0]}! 👋</h2>
            <p className="text-sm text-slate-500">Let's continue your learning journey.</p>
          </div>
          <div className="flex items-center gap-6">
            <NotificationBell />
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-brand-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md shadow-brand-500/30 ring-2 ring-white cursor-pointer transform hover:scale-105 transition-transform">
              {userProfile?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
          
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { label: 'Enrolled Courses', value: stats.totalEnrolled, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'In Progress', value: stats.inProgress, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
              { label: 'Certificates', value: stats.certificates, icon: Award, color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-slate-800 mb-1">{stat.value}</div>
                <div className="text-sm font-medium text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Courses */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Continue Learning */}
              {enrollments.length > 0 && (
                <section>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800">Continue Learning</h3>
                    <Link to="/user/course/" className="text-brand-600 font-semibold text-sm flex items-center hover:text-brand-700">
                      View all <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {enrollments.slice(0, 4).map((enrollment) => (
                      <Link key={enrollment.id} to={`/user/course/${enrollment.course_id}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 flex flex-col">
                        <div className="h-40 overflow-hidden relative">
                          <img 
                            src={enrollment.courses?.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80'} 
                            alt={enrollment.courses?.title}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          <div className="absolute bottom-3 left-4 right-4">
                            <h4 className="text-white font-bold text-lg line-clamp-1">{enrollment.courses?.title}</h4>
                          </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                          <div className="mb-4 flex-1">
                            <div className="flex justify-between text-sm mb-2 font-medium">
                              <span className="text-slate-600">Overall Progress</span>
                              <span className="text-brand-600">{enrollment.progress || 0}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-brand-500 rounded-full transition-all duration-1000" style={{ width: `${enrollment.progress || 0}%` }}></div>
                            </div>
                          </div>
                          <button className="w-full py-2.5 rounded-xl bg-slate-50 text-slate-800 font-semibold group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors flex justify-center items-center gap-2">
                            <PlayCircle className="h-5 w-5" /> Resume Course
                          </button>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Recommended Courses */}
              <section>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-800">Recommended for You</h3>
                </div>
                
                {availableCourses.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium">You've enrolled in all our top courses!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {availableCourses.slice(0, 2).map((course) => (
                      <Link key={course.id} to={`/user/course/${course.id}`} className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all border border-slate-100 flex p-4 gap-4">
                        <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 relative">
                          <img src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="flex flex-col justify-center">
                          <h4 className="font-bold text-slate-800 line-clamp-2 group-hover:text-brand-600 transition-colors">{course.title}</h4>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md uppercase">{course.level}</span>
                            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {course.duration}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Right Column: Activity & Motivation */}
            <div className="space-y-6">
              
              {/* Daily Goal / Streak */}
              <div className="bg-gradient-to-br from-brand-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-brand-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                  <Zap className="h-32 w-32 -mr-8 -mt-8" />
                </div>
                <div className="relative z-10">
                  <h3 className="font-bold text-lg mb-1">Learning Streak</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-5xl font-black">{stats.currentStreak}</span>
                    <span className="text-brand-100 font-medium">Days</span>
                  </div>
                  <p className="text-brand-100 text-sm font-medium mb-6">You're on fire! Complete a lesson today to keep your streak alive.</p>
                  <Link to="/user/course/" className="inline-block px-5 py-2.5 bg-white text-brand-700 rounded-xl font-bold shadow-sm hover:shadow-md transition-shadow">
                    Learn Now
                  </Link>
                </div>
              </div>

              {/* Recent Activity Timeline */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-brand-500" />
                  Recent Activity
                </h3>
                
                {recentActivity.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-4">No recent activity</p>
                ) : (
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                    {recentActivity.map((activity, i) => (
                      <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white z-10 ${
                          activity.status === 'completed' ? 'bg-green-500' : 'bg-brand-500'
                        } shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm`}>
                          {activity.status === 'completed' ? <CheckCircle className="h-4 w-4 text-white" /> : <PlayCircle className="h-4 w-4 text-white" />}
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <p className="text-sm font-bold text-slate-800 mb-1 line-clamp-1">{activity.lessons?.title}</p>
                          <p className="text-xs font-medium text-slate-500 line-clamp-1">{activity.lessons?.courses?.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;