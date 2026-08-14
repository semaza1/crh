import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { 
  BookOpen, Search, Filter, Clock, BarChart, Star, Users, PlayCircle, Lock
} from 'lucide-react';

const CoursesPage = () => {
  const { userProfile } = useAuth();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoursesAndEnrollments();
  }, [userProfile]);

  useEffect(() => {
    filterCourses();
  }, [searchTerm, selectedLevel, selectedType, courses]);

  const fetchCoursesAndEnrollments = async () => {
    try {
      // Fetch published courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;
      setCourses(coursesData || []);
      setFilteredCourses(coursesData || []);

      // Fetch user enrollments if logged in
      if (userProfile) {
        const { data: enrollmentsData, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('user_id', userProfile.id);

        if (enrollmentsError) throw enrollmentsError;
        setEnrolledCourseIds(enrollmentsData.map(e => e.course_id));
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = [...courses];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Level filter
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }

    // Type filter (free/premium)
    if (selectedType === 'free') {
      filtered = filtered.filter(course => !course.is_premium);
    } else if (selectedType === 'premium') {
      filtered = filtered.filter(course => course.is_premium);
    }

    setFilteredCourses(filtered);
  };

  const isEnrolled = (courseId) => enrolledCourseIds.includes(courseId);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Top Header / Banner */}
      <div className="relative bg-slate-900 text-white overflow-hidden py-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/50 via-slate-900 to-slate-900 pointer-events-none"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div>
              <Link 
                to="/user/dashboard" 
                className="inline-flex items-center text-sm font-semibold text-brand-400 hover:text-brand-300 transition-colors mb-3 group"
              >
                <span className="transform group-hover:-translate-x-1 transition-transform mr-1.5">←</span>
                Back to Dashboard
              </Link>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-white tracking-tight">
                Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">Courses</span>
              </h1>
              <p className="text-slate-400 mt-2 text-base sm:text-lg max-w-2xl font-medium">
                Unlock career-ready skills with world-class curriculum and interactive learning.
              </p>
            </div>

            {userProfile && (
              <div className="hidden sm:flex items-center gap-3 glass-dark p-3.5 rounded-2xl border border-white/10 shrink-0">
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold">
                  {enrolledCourseIds.length}
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Your Enrollments</div>
                  <div className="text-sm font-bold text-white">{enrolledCourseIds.length} Active Courses</div>
                </div>
              </div>
            )}
          </div>

          {/* Search Bar in Header */}
          <div className="max-w-3xl">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-brand-400 transition-colors" />
              <input
                type="text"
                placeholder="Search by course title, skill, or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium text-sm sm:text-base shadow-xl"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs bg-slate-800 px-2 py-1 rounded-md"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filter and Controls Toolbar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-wider mr-1">
                <Filter className="h-4 w-4 text-brand-600" />
                Filters
              </div>

              {/* Level Filter */}
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none cursor-pointer transition-colors"
              >
                <option value="all">All Difficulty Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>

              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none cursor-pointer transition-colors"
              >
                <option value="all">All Access Types</option>
                <option value="free">Free Courses</option>
                <option value="premium">Premium Only</option>
              </select>
            </div>

            <div className="text-sm font-semibold text-slate-500 flex items-center justify-between sm:justify-end gap-2">
              <span>Showing <strong className="text-slate-900">{filteredCourses.length}</strong> {filteredCourses.length === 1 ? 'course' : 'courses'}</span>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-500/20 border-t-brand-600 mb-4"></div>
            <p className="text-slate-500 font-semibold text-sm">Loading course catalog...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm max-w-lg mx-auto">
            <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 mx-auto mb-4">
              <BookOpen className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No courses match your criteria</h3>
            <p className="text-slate-500 text-sm font-medium mb-6">
              Try adjusting your search keywords or resetting your filter options.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedLevel('all');
                setSelectedType('all');
              }}
              className="px-5 py-2.5 bg-slate-900 hover:bg-brand-600 text-white rounded-xl text-sm font-bold transition-colors shadow-md"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => {
              const enrolled = isEnrolled(course.id);

              return (
                <Link
                  key={course.id}
                  to={`/user/course/${course.id}`}
                  className="group bg-white rounded-3xl border border-slate-200/80 hover:border-brand-500/40 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden transform hover:-translate-y-1"
                >
                  {/* Course Image Container */}
                  <div className="relative h-52 bg-slate-900 overflow-hidden">
                    <img
                      src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                    
                    {/* Top Status Badges */}
                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                      {enrolled ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 backdrop-blur-md">
                          <PlayCircle className="h-3.5 w-3.5 mr-1" />
                          Enrolled
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-md text-slate-800 uppercase tracking-wider">
                          {course.level || 'All Levels'}
                        </span>
                      )}

                      {/* Pricing Tag */}
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                        course.is_premium 
                          ? 'bg-amber-500 text-white shadow-amber-500/30' 
                          : 'bg-brand-600 text-white shadow-brand-500/30'
                      }`}>
                        {course.is_premium ? (
                          <>
                            <Lock className="h-3 w-3 mr-1" />
                            ${course.price}
                          </>
                        ) : (
                          'Free'
                        )}
                      </span>
                    </div>

                    {/* Bottom overlay in image: Duration */}
                    <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center text-xs font-semibold text-slate-200">
                      <Clock className="h-3.5 w-3.5 mr-1.5 text-brand-400" />
                      <span>{course.duration || 'Self-paced'}</span>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
                        {course.title}
                      </h3>
                      <p className="text-sm font-medium text-slate-500 mb-5 line-clamp-2 leading-relaxed">
                        {course.description || 'Comprehensive curriculum designed to give you practical skills and real-world mastery.'}
                      </p>
                    </div>

                    {/* Meta & Button */}
                    <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span className="flex items-center gap-1">
                          <BarChart className="h-3.5 w-3.5 text-brand-600" />
                          <span className="capitalize">{course.level || 'All Levels'}</span>
                        </span>
                        <span className="text-brand-600 font-bold group-hover:underline">
                          View Details →
                        </span>
                      </div>

                      <button 
                        tabIndex="-1"
                        className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-md ${
                          enrolled 
                            ? 'bg-slate-900 hover:bg-brand-600 text-white' 
                            : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-500/25'
                        }`}
                      >
                        {enrolled ? 'Continue Learning' : (course.is_premium ? 'Enroll Now' : 'Start Course Free')}
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;