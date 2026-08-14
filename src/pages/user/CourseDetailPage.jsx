import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import EnrollButton from './EnrollButton';
import { 
  BookOpen, Clock, BarChart, PlayCircle, Lock, CheckCircle, 
  ArrowLeft, Video, FileText, Users, Star, Award
} from 'lucide-react';

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseProgress, setCourseProgress] = useState(0);

  useEffect(() => {
    fetchCourseData();
  }, [courseId, userProfile]);

  // Refresh data when returning to the page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && userProfile) {
        fetchCourseData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [courseId, userProfile]);

  const fetchCourseData = async () => {
    try {
      // Fetch course
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .eq('status', 'published')
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Fetch lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (lessonsError) throw lessonsError;
      setLessons(lessonsData || []);

      // Check enrollment if user is logged in
      if (userProfile) {
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', userProfile.id)
          .eq('course_id', courseId)
          .maybeSingle();

        if (enrollmentData) {
          setIsEnrolled(true);

          // Fetch completed lessons
          const { data: progressData, error: progressError } = await supabase
            .from('lesson_progress')
            .select('lesson_id')
            .eq('user_id', userProfile.id)
            .eq('course_id', courseId)
            .eq('status', 'completed');

          if (progressData) {
            setCompletedLessons(progressData.map(p => p.lesson_id));
            
            // Calculate progress percentage
            const totalLessons = lessonsData?.length || 0;
            const completedCount = progressData.length;
            const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
            setCourseProgress(progressPercentage);
            
            console.log(`Course Progress: ${completedCount}/${totalLessons} = ${progressPercentage}%`);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonClick = (lesson) => {
    // Allow access if: enrolled, or lesson is preview, or course is free
    if (isEnrolled || lesson.is_preview || !course.is_premium) {
      navigate(`/user/course/${courseId}/lesson/${lesson.id}`);
    }
  };

  const canAccessLesson = (lesson) => {
    return isEnrolled || lesson.is_preview || !course.is_premium;
  };

  const isLessonCompleted = (lessonId) => {
    return completedLessons.includes(lessonId);
  };

  const calculateProgress = () => {
    if (lessons.length === 0) return 0;
    return courseProgress;
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-500/20 border-t-brand-500 mb-4"></div>
        <p className="text-slate-400 font-semibold text-sm">Loading course details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center max-w-md shadow-lg">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Course Not Found</h2>
          <p className="text-slate-500 text-sm font-medium mb-6">
            The course you're looking for might have been archived or moved.
          </p>
          <Link 
            to="/user/course" 
            className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 hover:bg-brand-600 text-white font-bold rounded-xl transition-colors shadow-md"
          >
            ← Back to All Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Course Header Banner */}
      <div className="relative bg-slate-900 text-white overflow-hidden py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/50 via-slate-900 to-slate-900 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto">
          {/* Breadcrumb navigation */}
          <div className="mb-6">
            <Link 
              to="/user/course" 
              className="inline-flex items-center text-sm font-semibold text-slate-400 hover:text-brand-400 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 mr-2 transform group-hover:-translate-x-1 transition-transform" />
              Back to Course Catalog
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            {/* Course Info Left Col */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${
                  course.is_premium 
                    ? 'bg-amber-500 text-white shadow-amber-500/20' 
                    : 'bg-emerald-500 text-white shadow-emerald-500/20'
                }`}>
                  {course.is_premium ? `Premium Course • $${course.price}` : 'Free Course'}
                </span>
                
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-slate-200 backdrop-blur-md uppercase tracking-wider">
                  {course.level || 'All Levels'}
                </span>

                {isEnrolled && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-500/20 border border-brand-500/40 text-brand-300 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Enrolled
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-white tracking-tight leading-tight">
                {course.title}
              </h1>

              <p className="text-base sm:text-lg text-slate-300 font-medium leading-relaxed max-w-2xl">
                {course.description}
              </p>

              {/* Meta stats */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-sm font-semibold text-slate-300">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-white/10 text-brand-400">
                    <Clock className="h-4 w-4" />
                  </div>
                  <span>{course.duration || 'Self-paced'}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-white/10 text-purple-400">
                    <Video className="h-4 w-4" />
                  </div>
                  <span>{lessons.length} Structured Lessons</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-white/10 text-amber-400">
                    <Award className="h-4 w-4" />
                  </div>
                  <span>Certificate Included</span>
                </div>
              </div>
            </div>

            {/* Sticky Card Right Col */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 text-slate-900 relative">
                {/* Thumbnail */}
                <div className="relative h-48 rounded-2xl overflow-hidden mb-6 bg-slate-900">
                  <img
                    src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent"></div>
                  
                  {isEnrolled && (
                    <div className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                      <PlayCircle className="w-3.5 h-3.5" /> Enrolled
                    </div>
                  )}
                </div>

                {isEnrolled ? (
                  <div className="space-y-5">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-bold text-slate-700">Course Progress</span>
                        <span className="font-extrabold text-brand-600 text-base">{calculateProgress()}%</span>
                      </div>
                      
                      <div className="w-full bg-slate-100 rounded-full h-3.5 p-0.5 overflow-hidden border border-slate-200">
                        <div 
                          className="bg-gradient-to-r from-brand-600 to-purple-600 h-full rounded-full transition-all duration-700 shadow-sm"
                          style={{ width: `${Math.max(calculateProgress(), 3)}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between text-xs font-medium text-slate-500 mt-2">
                        <span>{completedLessons.length} completed</span>
                        <span>{lessons.length} total lessons</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const firstIncompleteLesson = lessons.find(l => !isLessonCompleted(l.id));
                        if (firstIncompleteLesson) {
                          handleLessonClick(firstIncompleteLesson);
                        } else if (lessons.length > 0) {
                          handleLessonClick(lessons[0]);
                        }
                      }}
                      className="w-full py-4 px-6 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-bold text-base transition-all duration-300 shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                    >
                      <PlayCircle className="h-5 w-5" />
                      <span>{calculateProgress() === 100 ? 'Review Full Course' : 'Resume Learning'}</span>
                    </button>
                  </div>
                ) : (
                  <EnrollButton course={course} onEnrollSuccess={fetchCourseData} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Page Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-10">
            {/* What You'll Learn Box */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/80">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <span className="w-2.5 h-7 bg-brand-600 rounded-full"></span>
                What You'll Learn
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  'Master the core fundamentals & advanced theoretical concepts',
                  'Build real-world projects from scratch with production standards',
                  'Get hands-on experience with modern industry tools and workflows',
                  'Earn a verifiable credential certificate upon completion'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="p-1.5 rounded-xl bg-emerald-100 text-emerald-600 shrink-0 mt-0.5">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 leading-snug">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Curriculum */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/80">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    <span className="w-2.5 h-7 bg-purple-600 rounded-full"></span>
                    Course Curriculum
                  </h2>
                  <p className="text-sm font-medium text-slate-500 mt-1">
                    {lessons.length} Lessons • {course.duration || 'Self-paced'}
                  </p>
                </div>
              </div>
              
              {lessons.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                  <Video className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 font-semibold text-sm">No lessons have been published for this course yet.</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {lessons.map((lesson, index) => {
                    const accessible = canAccessLesson(lesson);
                    const completed = isLessonCompleted(lesson.id);

                    return (
                      <div
                        key={lesson.id}
                        onClick={() => accessible && handleLessonClick(lesson)}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex items-center gap-4 ${
                          accessible 
                            ? 'bg-slate-50/70 hover:bg-white border-slate-200 hover:border-brand-500/50 hover:shadow-md cursor-pointer group' 
                            : 'bg-slate-50/40 border-slate-200/60 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        {/* Number or Check */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm transition-colors ${
                          completed 
                            ? 'bg-emerald-500 text-white' 
                            : accessible 
                              ? 'bg-white border border-slate-200 text-slate-700 group-hover:border-brand-500 group-hover:text-brand-600' 
                              : 'bg-slate-200 text-slate-400'
                        }`}>
                          {completed ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <span>{index + 1}</span>
                          )}
                        </div>

                        {/* Lesson Content Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-brand-600 transition-colors truncate">
                              {lesson.title}
                            </h3>
                            {lesson.is_preview && (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                                Free Preview
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm font-medium text-slate-500 line-clamp-1">
                            {lesson.description || 'Interactive lecture & exercise modules'}
                          </p>
                        </div>

                        {/* Right Meta */}
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="hidden sm:flex items-center text-xs font-semibold text-slate-500">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            <span>{formatDuration(lesson.duration)}</span>
                          </div>
                          
                          {accessible ? (
                            <div className="w-8 h-8 rounded-full bg-brand-50 group-hover:bg-brand-600 group-hover:text-white text-brand-600 flex items-center justify-center transition-colors">
                              <PlayCircle className="h-5 w-5" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                              <Lock className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Right Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
              <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                <Award className="h-5 w-5 text-brand-600" />
                This course includes:
              </h3>
              
              <div className="space-y-4">
                {[
                  { icon: Video, label: 'Comprehensive Lessons', desc: `${lessons.length} HD video modules` },
                  { icon: FileText, label: 'Downloadable Resources', desc: 'Notes, guides and code' },
                  { icon: Award, label: 'Certificate of Completion', desc: 'Shareable on LinkedIn' },
                  { icon: Clock, label: 'Full Lifetime Access', desc: 'Learn at your pace 24/7' }
                ].map((perk, i) => {
                  const Icon = perk.icon;
                  return (
                    <div key={i} className="flex items-start gap-3.5">
                      <div className="p-2.5 rounded-2xl bg-brand-50 text-brand-600 shrink-0">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-800">{perk.label}</div>
                        <div className="text-xs font-medium text-slate-500">{perk.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;