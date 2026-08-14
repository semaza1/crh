import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowLeft, ArrowRight, CheckCircle, Clock, BookOpen, 
  ChevronLeft, ChevronRight, PlayCircle, FileText
} from 'lucide-react';

const LessonPage = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [allLessons, setAllLessons] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessonData();
  }, [lessonId, userProfile]);

  const fetchLessonData = async () => {
    try {
      // Fetch course
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Fetch current lesson
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

      if (lessonError) throw lessonError;
      setLesson(lessonData);

      // Fetch all lessons for navigation
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (lessonsError) throw lessonsError;
      setAllLessons(lessonsData || []);

      // Check enrollment and progress if user is logged in
      if (userProfile) {
        const { data: enrollmentData } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', userProfile.id)
          .eq('course_id', courseId)
          .maybeSingle();

        if (enrollmentData) {
          setIsEnrolled(true);
        }

        // Check if lesson is completed
        const { data: progressData } = await supabase
          .from('lesson_progress')
          .select('*')
          .eq('user_id', userProfile.id)
          .eq('lesson_id', lessonId)
          .maybeSingle();

        if (progressData && progressData.completed) {
          setIsCompleted(true);
        }
      }
    } catch (error) {
      console.error('Error fetching lesson data:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsComplete = async () => {
    if (!userProfile) {
      alert('Please log in to track your progress');
      return;
    }

    try {
      // First, get the enrollment_id for this course
      const { data: enrollmentData, error: enrollError } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', userProfile.id)
        .eq('course_id', courseId)
        .maybeSingle();

      if (enrollError) throw enrollError;

      if (!enrollmentData) {
        alert('You must be enrolled in this course to track progress');
        return;
      }

      const enrollmentId = enrollmentData.id;

      // Check if progress record exists
      const { data: existingProgress, error: fetchError } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', userProfile.id)
        .eq('lesson_id', lessonId)
        .eq('enrollment_id', enrollmentId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingProgress) {
        // Update existing progress
        const { error } = await supabase
          .from('lesson_progress')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString(),
            last_accessed_at: new Date().toISOString()
          })
          .eq('id', existingProgress.id);

        if (error) throw error;
      } else {
        // Create new progress record
        const { error } = await supabase
          .from('lesson_progress')
          .insert([{
            user_id: userProfile.id,
            lesson_id: lessonId,
            enrollment_id: enrollmentId,
            course_id: courseId,
            status: 'completed',
            completed_at: new Date().toISOString(),
            last_accessed_at: new Date().toISOString()
          }]);

        if (error) throw error;
      }

      setIsCompleted(true);
      alert('Lesson marked as complete! 🎉');
    } catch (error) {
      console.error('Error marking lesson as complete:', error);
      alert('Failed to mark lesson as complete. Please try again.');
    }
  };

  const getCurrentLessonIndex = () => {
    return allLessons.findIndex(l => l.id === lessonId);
  };

  const getPreviousLesson = () => {
    const currentIndex = getCurrentLessonIndex();
    if (currentIndex > 0) {
      return allLessons[currentIndex - 1];
    }
    return null;
  };

  const getNextLesson = () => {
    const currentIndex = getCurrentLessonIndex();
    if (currentIndex < allLessons.length - 1) {
      return allLessons[currentIndex + 1];
    }
    return null;
  };

  const navigateToLesson = (targetLesson) => {
    navigate(`/user/course/${courseId}/lesson/${targetLesson.id}`);
  };

  const getVideoEmbedUrl = (url) => {
    // Convert YouTube watch URL to embed URL
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
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
        <p className="text-slate-400 font-semibold text-sm">Loading lesson classroom...</p>
      </div>
    );
  }

  if (!lesson || !course) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white">
        <div className="bg-slate-800 rounded-3xl p-10 border border-slate-700 text-center max-w-md shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <BookOpen className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Lesson Not Found</h2>
          <p className="text-slate-400 text-sm font-medium mb-6">
            The lesson you are looking for might have been moved or is unavailable.
          </p>
          <Link 
            to={`/user/course/${courseId}`} 
            className="inline-flex items-center justify-center px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-brand-500/25"
          >
            ← Back to Course Outline
          </Link>
        </div>
      </div>
    );
  }

  const previousLesson = getPreviousLesson();
  const nextLesson = getNextLesson();
  const currentIndex = getCurrentLessonIndex();

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Back to Course + Title */}
          <div className="flex items-center gap-4 min-w-0">
            <Link 
              to={`/user/course/${courseId}`}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0"
              title="Back to Course Overview"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            
            <div className="min-w-0">
              <span className="text-xs font-bold text-brand-400 uppercase tracking-wider block truncate">
                {course.title}
              </span>
              <h2 className="text-sm sm:text-base font-bold text-white truncate">
                {lesson.title}
              </h2>
            </div>
          </div>

          {/* Right Action: Lesson counter & Completion Button */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline-block text-xs font-bold px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Lesson {currentIndex + 1} of {allLessons.length}
            </span>

            {isEnrolled && (
              <button
                onClick={markAsComplete}
                disabled={isCompleted}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md ${
                  isCompleted
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                    : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-500/30'
                }`}
              >
                <CheckCircle className="h-4 w-4" />
                <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Video Cinema Area */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Player & Lesson Notes Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player Container with Ambient Glow */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-600 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-black rounded-2xl sm:rounded-3xl overflow-hidden aspect-video border border-slate-800 shadow-2xl">
                <iframe
                  src={getVideoEmbedUrl(lesson.video_url)}
                  title={lesson.title}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>

            {/* Lesson Information Box */}
            <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-white mb-2">
                    {lesson.title}
                  </h1>
                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
                    <span className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
                      <Clock className="h-3.5 w-3.5 text-brand-400" />
                      {formatDuration(lesson.duration)}
                    </span>
                    {lesson.is_preview && (
                      <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg">
                        Free Preview
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {lesson.description && (
                <p className="text-slate-300 font-medium text-sm sm:text-base leading-relaxed mb-6">
                  {lesson.description}
                </p>
              )}

              {/* Lesson Notes / Content */}
              {lesson.content && (
                <div className="border-t border-slate-800 pt-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-brand-400" />
                    Lesson Notes & Resources
                  </h3>
                  <div className="bg-slate-950/60 rounded-2xl p-5 border border-slate-800/80 font-mono text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {lesson.content}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons: Previous / Next */}
            <div className="flex items-center justify-between gap-4 pt-2">
              {previousLesson ? (
                <button
                  onClick={() => navigateToLesson(previousLesson)}
                  className="flex items-center gap-3 px-5 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white rounded-2xl transition-all shadow-md group"
                >
                  <ChevronLeft className="h-5 w-5 text-brand-400 group-hover:-translate-x-1 transition-transform" />
                  <div className="text-left hidden sm:block">
                    <div className="text-xs text-slate-400 font-medium">Previous Lesson</div>
                    <div className="text-sm font-bold truncate max-w-xs">{previousLesson.title}</div>
                  </div>
                  <span className="sm:hidden text-sm font-bold">Previous</span>
                </button>
              ) : (
                <div></div>
              )}

              {nextLesson ? (
                <button
                  onClick={() => navigateToLesson(nextLesson)}
                  className="flex items-center gap-3 px-6 py-3.5 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-brand-500/25 group"
                >
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-brand-200 font-medium">Next Lesson</div>
                    <div className="text-sm font-bold truncate max-w-xs">{nextLesson.title}</div>
                  </div>
                  <span className="sm:hidden text-sm font-bold">Next</span>
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <Link
                  to={`/user/course/${courseId}`}
                  className="flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/25"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>Finish Course</span>
                </Link>
              )}
            </div>
          </div>

          {/* Sidebar Playlist Column */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl sticky top-24">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <PlayCircle className="h-5 w-5 text-brand-400" />
                  Course Content
                </h3>
                <span className="text-xs font-semibold text-slate-400">
                  {allLessons.length} modules
                </span>
              </div>

              {/* Lesson Items List */}
              <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1 custom-scrollbar">
                {allLessons.map((l, index) => {
                  const isActive = l.id === lessonId;

                  return (
                    <button
                      key={l.id}
                      onClick={() => navigateToLesson(l)}
                      className={`w-full text-left p-3.5 rounded-2xl transition-all duration-200 flex items-center gap-3.5 ${
                        isActive
                          ? 'bg-brand-600/20 border border-brand-500/50 shadow-md shadow-brand-500/10'
                          : 'bg-slate-800/40 hover:bg-slate-800 border border-slate-800/60'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                        isActive
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {index + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-bold truncate ${
                          isActive ? 'text-brand-300' : 'text-slate-200'
                        }`}>
                          {l.title}
                        </h4>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">
                          {formatDuration(l.duration)}
                        </p>
                      </div>

                      {isActive && (
                        <div className="w-2 h-2 rounded-full bg-brand-400 shrink-0"></div>
                      )}
                    </button>
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

export default LessonPage;