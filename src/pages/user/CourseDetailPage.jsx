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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
          <Link to="/user/course" className="text-purple-600 hover:text-purple-700">
            ← Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Course Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link 
            to="/user/course" 
            className="inline-flex items-center text-purple-100 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  course.is_premium 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-blue-500 text-white'
                }`}>
                  {course.is_premium ? `Premium - $${course.price}` : 'Free'}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-white bg-opacity-20 capitalize">
                  {course.level}
                </span>
              </div>

              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-purple-100 mb-6">{course.description}</p>

              <div className="flex flex-wrap items-center gap-6 text-purple-100">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center">
                  <Video className="h-5 w-5 mr-2" />
                  <span>{lessons.length} Lessons</span>
                </div>
                <div className="flex items-center">
                  <BarChart className="h-5 w-5 mr-2" />
                  <span className="capitalize">{course.level}</span>
                </div>
              </div>
            </div>

            {/* Enrollment Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 text-gray-900">
                <img
                  src={course.thumbnail_url || 'https://via.placeholder.com/400x300'}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />

                {isEnrolled ? (
                  <div>
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-medium text-gray-700">Your Progress</span>
                        <span className="font-bold text-purple-600">{calculateProgress()}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${calculateProgress()}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {completedLessons.length} of {lessons.length} lessons completed
                      </p>
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
                      className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                    >
                      {calculateProgress() === 100 ? 'Review Course' : 'Continue Learning'}
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

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* What You'll Learn */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What You'll Learn</h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">Master the fundamentals and advanced concepts</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">Build real-world projects from scratch</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">Get hands-on experience with best practices</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">Receive a certificate upon completion</p>
                </div>
              </div>
            </div>

            {/* Course Curriculum */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Curriculum</h2>
              
              {lessons.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No lessons available yet</p>
              ) : (
                <div className="space-y-3">
                  {lessons.map((lesson, index) => {
                    const accessible = canAccessLesson(lesson);
                    const completed = isLessonCompleted(lesson.id);

                    return (
                      <div
                        key={lesson.id}
                        onClick={() => accessible && handleLessonClick(lesson)}
                        className={`border border-gray-200 rounded-lg p-4 transition-all ${
                          accessible 
                            ? 'hover:border-purple-300 hover:shadow-md cursor-pointer' 
                            : 'opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Lesson Number */}
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            completed 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {completed ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <span>{index + 1}</span>
                            )}
                          </div>

                          {/* Lesson Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {lesson.title}
                              </h3>
                              {lesson.is_preview && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  Preview
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-1">
                              {lesson.description}
                            </p>
                          </div>

                          {/* Lesson Meta */}
                          <div className="flex items-center gap-4 flex-shrink-0">
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{formatDuration(lesson.duration)}</span>
                            </div>
                            {accessible ? (
                              <PlayCircle className="h-5 w-5 text-purple-600" />
                            ) : (
                              <Lock className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Course Features */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">This course includes:</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <Video className="h-5 w-5 text-purple-600 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Video Lessons</p>
                    <p className="text-sm text-gray-600">{lessons.length} comprehensive lessons</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FileText className="h-5 w-5 text-purple-600 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Course Materials</p>
                    <p className="text-sm text-gray-600">Downloadable resources</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Award className="h-5 w-5 text-purple-600 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Certificate</p>
                    <p className="text-sm text-gray-600">Upon course completion</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-purple-600 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Lifetime Access</p>
                    <p className="text-sm text-gray-600">Learn at your own pace</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;