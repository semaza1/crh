import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowLeft, ArrowRight, CheckCircle, Clock, BookOpen, 
  ChevronLeft, ChevronRight, PlayCircle, FileText, Menu, X, Home
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
  const [isOpen, setIsOpen] = useState(false);

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
          .single();

        if (enrollmentData) {
          setIsEnrolled(true);
        }

        // Check if lesson is completed
        const { data: progressData } = await supabase
          .from('lesson_progress')
          .select('*')
          .eq('user_id', userProfile.id)
          .eq('lesson_id', lessonId)
          .single();

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
      const { data: existingProgress } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', userProfile.id)
        .eq('lesson_id', lessonId)
        .single();

      if (existingProgress) {
        // Update existing progress
        const { error } = await supabase
          .from('lesson_progress')
          .update({ completed: true, completed_at: new Date().toISOString() })
          .eq('id', existingProgress.id);

        if (error) throw error;
      } else {
        // Create new progress record
        const { error } = await supabase
          .from('lesson_progress')
          .insert([{
            user_id: userProfile.id,
            lesson_id: lessonId,
            course_id: courseId,
            completed: true,
            completed_at: new Date().toISOString()
          }]);

        if (error) throw error;
      }

      setIsCompleted(true);
    } catch (error) {
      console.error('Error marking lesson as complete:', error);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!lesson || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lesson Not Found</h2>
          <Link to={`/user/course/${courseId}`} className="text-purple-600 hover:text-purple-700">
            ← Back to Course
          </Link>
        </div>
      </div>
    );
  }

  const previousLesson = getPreviousLesson();
  const nextLesson = getNextLesson();
  const currentIndex = getCurrentLessonIndex();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Row */}
        <div className="flex items-center justify-between h-16">
          {/* Left Section: Back to Course */}
          <div className="flex items-center">
            <Link
              to={`/user/course/${courseId}`}
              className="flex items-center text-gray-700 hover:text-purple-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span className="font-medium truncate">{course.title}</span>
            </Link>
          </div>

          {/* Right Section (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Lesson {currentIndex + 1} of {allLessons.length}
            </span>

            <Link
              to="/user/dashboard"
              className="flex items-center text-gray-700 hover:text-blue-600 text-sm font-medium"
            >
              <Home className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>

            {isEnrolled && (
              <button
                onClick={markAsComplete}
                disabled={isCompleted}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  isCompleted
                    ? "bg-green-100 text-green-700 cursor-default"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                }`}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {isCompleted ? "Completed" : "Mark as Complete"}
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-purple-600 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-sm">
          <div className="px-4 pt-4 pb-6 space-y-3 flex flex-col">
            <span className="text-sm text-gray-600">
              Lesson {currentIndex + 1} of {allLessons.length}
            </span>

            <Link
              to="/user/dashboard"
              className="flex items-center text-gray-700 hover:text-blue-600 text-sm font-medium"
              onClick={() => setIsOpen(false)}
            >
              <Home className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>

            {isEnrolled && (
              <button
                onClick={() => {
                  markAsComplete();
                  setIsOpen(false);
                }}
                disabled={isCompleted}
                className={`flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  isCompleted
                    ? "bg-green-100 text-green-700 cursor-default"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                }`}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {isCompleted ? "Completed" : "Mark as Complete"}
              </button>
            )}
          </div>
        </div>
      )}
    </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <div className="bg-black rounded-lg overflow-hidden mb-6 aspect-video">
              <iframe
                src={getVideoEmbedUrl(lesson.video_url)}
                title={lesson.title}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            {/* Lesson Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatDuration(lesson.duration)}
                    </span>
                    {lesson.is_preview && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                        Free Preview
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mb-6">{lesson.description}</p>

              {/* Lesson Content */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Lesson Notes
                </h2>
                <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                  {lesson.content}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              {previousLesson ? (
                <button
                  onClick={() => navigateToLesson(previousLesson)}
                  className="flex items-center px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 mr-2" />
                  <div className="text-left">
                    <p className="text-xs text-gray-500">Previous</p>
                    <p className="font-medium text-gray-900 line-clamp-1">{previousLesson.title}</p>
                  </div>
                </button>
              ) : (
                <div></div>
              )}

              {nextLesson ? (
                <button
                  onClick={() => navigateToLesson(nextLesson)}
                  className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <div className="text-right">
                    <p className="text-xs text-purple-100">Next</p>
                    <p className="font-medium line-clamp-1">{nextLesson.title}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 ml-2" />
                </button>
              ) : (
                <Link
                  to={`/user/course/${courseId}`}
                  className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Complete Course
                </Link>
              )}
            </div>
          </div>

          {/* Sidebar - Lessons List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Course Content</h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {allLessons.map((l, index) => (
                  <button
                    key={l.id}
                    onClick={() => navigateToLesson(l)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      l.id === lessonId
                        ? 'bg-purple-50 border-2 border-purple-600'
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        l.id === lessonId
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-medium line-clamp-2 ${
                          l.id === lessonId ? 'text-purple-900' : 'text-gray-900'
                        }`}>
                          {l.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDuration(l.duration)}
                        </p>
                      </div>
                      {l.id === lessonId && (
                        <PlayCircle className="h-5 w-5 text-purple-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPage;