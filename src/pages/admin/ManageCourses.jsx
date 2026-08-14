import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { 
  BookOpen, Plus, Edit, Trash2, Search, X, Check, AlertCircle, 
  Clock, BarChart, DollarSign, Eye, ArrowLeft, Video, Sparkles, Layers
} from 'lucide-react';

const ManageCoursesPage = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail_url: '',
    duration: '',
    level: 'beginner',
    is_premium: false,
    price: 0.00,
    status: 'draft'
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    let filtered = [...courses];

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(course => course.status === statusFilter);
    }

    setFilteredCourses(filtered);
  }, [searchTerm, statusFilter, courses]);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
      setFilteredCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      showMessage('error', 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const courseData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        thumbnail_url: formData.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
        description: formData.description || 'No description provided'
      };

      if (editingCourse) {
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', editingCourse.id);

        if (error) throw error;
        showMessage('success', 'Course updated successfully!');
      } else {
        const { error } = await supabase
          .from('courses')
          .insert([{
            ...courseData,
            created_by: userProfile?.id
          }]);

        if (error) throw error;
        showMessage('success', 'Course created successfully!');
      }

      setShowModal(false);
      setEditingCourse(null);
      resetForm();
      fetchCourses();
    } catch (error) {
      console.error('Error saving course:', error);
      showMessage('error', error.message || 'Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this course? This will also delete all lessons and progress.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;
      showMessage('success', 'Course deleted successfully!');
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      showMessage('error', 'Failed to delete course');
    }
  };

  const openModal = (course = null, e = null) => {
    if (e) e.stopPropagation();
    if (course) {
      setEditingCourse(course);
      setFormData({
        title: course.title,
        description: course.description,
        thumbnail_url: course.thumbnail_url,
        duration: course.duration,
        level: course.level || 'beginner',
        is_premium: course.is_premium || false,
        price: course.price || 0.00,
        status: course.status || 'draft'
      });
    } else {
      setEditingCourse(null);
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCourse(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      thumbnail_url: '',
      duration: '',
      level: 'beginner',
      is_premium: false,
      price: 0.00,
      status: 'draft'
    });
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleCourseClick = (courseId) => {
    navigate(`/admin/courses/${courseId}/lessons`);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-brand-500 selection:text-white">
      {/* Top Banner Header */}
      <div className="relative bg-slate-900 text-white overflow-hidden py-14 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/50 via-slate-900 to-slate-900 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <Link 
              to="/admin/dashboard" 
              className="inline-flex items-center text-sm font-semibold text-brand-400 hover:text-brand-300 transition-colors mb-3 group"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5 transform group-hover:-translate-x-1 transition-transform" />
              Back to Command Center
            </Link>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-white tracking-tight">
              Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">Courses</span>
            </h1>
            <p className="text-slate-400 mt-2 text-base font-medium">
              Create and configure course modules, lessons, pricing tiers, and enrollment statuses.
            </p>
          </div>

          <button
            onClick={() => openModal()}
            className="px-6 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Course</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Toast Feedback */}
        {message.text && (
          <div className={`mb-6 rounded-2xl p-4 flex items-center shadow-lg animate-fade-in ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-700' 
              : 'bg-red-500/10 border border-red-500/30 text-red-700'
          }`}>
            {message.type === 'success' ? (
              <Check className="h-5 w-5 mr-3 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-3 shrink-0 text-red-600" />
            )}
            <p className="text-sm font-bold">{message.text}</p>
          </div>
        )}

        {/* Toolbar & Filters */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-colors"
            >
              <option value="all">All Publishing Statuses</option>
              <option value="published">Published Only</option>
              <option value="draft">Drafts Only</option>
              <option value="archived">Archived</option>
            </select>

            <span className="text-xs font-bold text-slate-400">
              {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'}
            </span>
          </div>
        </div>

        {/* Course Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-500/20 border-t-brand-500 mb-3"></div>
            <p className="text-slate-400 font-semibold text-xs">Loading course catalog...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm max-w-md mx-auto">
            <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No courses match</h3>
            <p className="text-slate-500 text-sm font-medium mb-6">
              {searchTerm ? 'Try changing your search terms or filters.' : 'Get started by creating your first course curriculum.'}
            </p>
            <button
              onClick={() => openModal()}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-xl shadow-md shadow-brand-500/25 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Course</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => handleCourseClick(course.id)}
                className="bg-white rounded-3xl border border-slate-200/80 hover:border-brand-500/40 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer group transform hover:-translate-y-1"
              >
                <div>
                  {/* Thumbnail / Video Container */}
                  <div className="relative h-48 bg-slate-900 overflow-hidden">
                    {course.thumbnail_url?.includes('.mp4') || course.thumbnail_url?.includes('.webm') ? (
                      <video
                        src={course.thumbnail_url}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        muted
                        loop
                        autoPlay
                      />
                    ) : (
                      <img
                        src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop'}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full shadow-md backdrop-blur-md ${
                        course.status === 'published' 
                          ? 'bg-emerald-500/90 text-white' 
                          : course.status === 'archived'
                          ? 'bg-red-500/90 text-white'
                          : 'bg-slate-700/90 text-slate-200'
                      }`}>
                        {course.status || 'Draft'}
                      </span>
                    </div>

                    {/* Price Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full shadow-md backdrop-blur-md ${
                        course.is_premium 
                          ? 'bg-amber-500/90 text-white' 
                          : 'bg-brand-600/90 text-white'
                      }`}>
                        {course.is_premium ? `$${course.price}` : 'Free Course'}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-brand-600 transition-colors leading-snug">
                      {course.title}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mb-2">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-brand-600" />
                        <span>{course.duration || 'Flexible'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <BarChart className="h-3.5 w-3.5 text-purple-600" />
                        <span className="capitalize">{course.level || 'All Levels'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Toolbar */}
                <div className="p-6 pt-0">
                  <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCourseClick(course.id);
                      }}
                      className="flex-1 py-2.5 px-3 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Manage Lessons</span>
                    </button>

                    <button
                      onClick={(e) => openModal(course, e)}
                      className="p-2.5 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                      title="Edit Course"
                    >
                      <Edit className="h-4 w-4" />
                    </button>

                    <button
                      onClick={(e) => handleDelete(course.id, e)}
                      className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-slate-200"
                      title="Delete Course"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 my-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-xl font-playfair font-bold text-slate-900">
                  {editingCourse ? 'Edit Course Curriculum' : 'Create New Course'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">Fill in the course details below</p>
              </div>
              <button 
                onClick={closeModal} 
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Course Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                  placeholder="e.g. Masterclass: Full-Stack Web Architecture"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                  placeholder="Provide an overview of key learning outcomes and modules..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Thumbnail Image / Video URL
                  </label>
                  <input
                    type="url"
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Estimated Duration
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                    placeholder="e.g. 6 Weeks (12 Hours)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Difficulty Level
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Publishing Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Course Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    disabled={!formData.is_premium}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Premium Checkbox */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Paid / Premium Course</h4>
                  <p className="text-xs text-slate-500">Require students to checkout before gaining full access</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.is_premium}
                  onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                  className="w-5 h-5 text-brand-600 rounded-lg focus:ring-brand-500 cursor-pointer"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>{editingCourse ? 'Save Changes' : 'Create Course'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCoursesPage;