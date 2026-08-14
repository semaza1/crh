import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { 
  BookOpen, Plus, Edit, Trash2, X, Check, AlertCircle, 
  ArrowUp, ArrowDown, Video, Clock, Eye, FileText, ArrowLeft,
  Sparkles, Layers
} from 'lucide-react';

const ManageLessonsPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    video_url: '',
    duration: 0,
    is_preview: false
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchCourseAndLessons();
  }, [courseId]);

  const fetchCourseAndLessons = async () => {
    try {
      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
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
    } catch (error) {
      console.error('Error fetching data:', error);
      showMessage('error', 'Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const lessonData = {
        ...formData,
        course_id: courseId,
        duration: parseInt(formData.duration) || 0,
      };

      if (editingLesson) {
        const { error } = await supabase
          .from('lessons')
          .update(lessonData)
          .eq('id', editingLesson.id);

        if (error) throw error;
        showMessage('success', 'Lesson updated successfully!');
      } else {
        const maxOrder = lessons.length > 0 
          ? Math.max(...lessons.map(l => l.order_index || 0)) 
          : -1;

        const { error } = await supabase
          .from('lessons')
          .insert([{
            ...lessonData,
            order_index: maxOrder + 1
          }]);

        if (error) throw error;
        showMessage('success', 'Lesson created successfully!');
      }

      setShowModal(false);
      setEditingLesson(null);
      resetForm();
      fetchCourseAndLessons();
    } catch (error) {
      console.error('Error saving lesson:', error);
      showMessage('error', error.message || 'Failed to save lesson');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (lessonId) => {
    if (!confirm('Are you sure you want to delete this lesson?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;
      showMessage('success', 'Lesson deleted successfully!');
      fetchCourseAndLessons();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      showMessage('error', 'Failed to delete lesson');
    }
  };

  const handleMoveOrder = async (lesson, direction) => {
    const currentIndex = lessons.findIndex(l => l.id === lesson.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= lessons.length) return;

    const targetLesson = lessons[targetIndex];

    try {
      // Swap order indices
      await Promise.all([
        supabase
          .from('lessons')
          .update({ order_index: targetLesson.order_index })
          .eq('id', lesson.id),
        supabase
          .from('lessons')
          .update({ order_index: lesson.order_index })
          .eq('id', targetLesson.id)
      ]);

      fetchCourseAndLessons();
    } catch (error) {
      console.error('Error updating order:', error);
      showMessage('error', 'Failed to reorder lessons');
    }
  };

  const openModal = (lesson = null) => {
    if (lesson) {
      setEditingLesson(lesson);
      setFormData({
        title: lesson.title,
        description: lesson.description || '',
        content: lesson.content || '',
        video_url: lesson.video_url || '',
        duration: lesson.duration || 0,
        is_preview: lesson.is_preview || false
      });
    } else {
      setEditingLesson(null);
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingLesson(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      video_url: '',
      duration: 0,
      is_preview: false
    });
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  if (loading && !course) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-500/20 border-t-brand-500 mb-4"></div>
        <p className="text-slate-400 font-semibold text-sm">Loading course curriculum...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-brand-500 selection:text-white">
      {/* Top Banner Header */}
      <div className="relative bg-slate-900 text-white overflow-hidden py-14 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/50 via-slate-900 to-slate-900 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <Link 
              to="/admin/courses" 
              className="inline-flex items-center text-sm font-semibold text-brand-400 hover:text-brand-300 transition-colors mb-3 group"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5 transform group-hover:-translate-x-1 transition-transform" />
              Back to Courses List
            </Link>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-white tracking-tight">
              Curriculum: <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">{course?.title}</span>
            </h1>
            <p className="text-slate-400 mt-2 text-base font-medium max-w-xl">
              Arrange lesson sequencing, video playback links, markdown summaries, and free previews.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openModal()}
              className="px-6 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Lesson</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Total Lessons</p>
              <p className="text-2xl font-extrabold text-slate-900">{lessons.length}</p>
            </div>
            <div className="p-3 bg-brand-50 rounded-2xl text-brand-600">
              <BookOpen className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Total Video Time</p>
              <p className="text-2xl font-extrabold text-slate-900">
                {lessons.reduce((acc, l) => acc + (l.duration || 0), 0)} mins
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-2xl text-purple-600">
              <Clock className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Free Previews</p>
              <p className="text-2xl font-extrabold text-emerald-600">
                {lessons.filter(l => l.is_preview).length}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
              <Eye className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Lessons List */}
        {lessons.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm">
            <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Video className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No lessons created yet</h3>
            <p className="text-slate-500 text-sm font-medium mb-6">
              Start building your course syllabus by adding the introductory video or reading module.
            </p>
            <button
              onClick={() => openModal()}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-xl shadow-md shadow-brand-500/25 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add First Lesson</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {lessons.map((lesson, idx) => (
              <div
                key={lesson.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 hover:border-brand-500/40 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left Info */}
                <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                  {/* Step / Order Bubble */}
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 font-extrabold text-sm flex items-center justify-center shrink-0 border border-slate-200">
                    {idx + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="font-bold text-slate-900 text-base truncate">{lesson.title}</h4>
                      {lesson.is_preview && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200">
                          Free Preview
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-brand-600" />
                        <span>{lesson.duration || 0} minutes</span>
                      </div>
                      {lesson.video_url && (
                        <div className="flex items-center gap-1 text-purple-600">
                          <Video className="h-3.5 w-3.5" />
                          <span className="truncate max-w-[200px]">{lesson.video_url}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions & Reordering */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {/* Reorder Buttons */}
                  <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
                    <button
                      onClick={() => handleMoveOrder(lesson, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-brand-600 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      title="Move Up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleMoveOrder(lesson, 'down')}
                      disabled={idx === lessons.length - 1}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-brand-600 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      title="Move Down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Edit / Delete */}
                  <button
                    onClick={() => openModal(lesson)}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-brand-600 rounded-xl transition-colors border border-slate-200"
                    title="Edit Lesson"
                  >
                    <Edit className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(lesson.id)}
                    className="p-2.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-colors border border-slate-200"
                    title="Delete Lesson"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lesson Creation / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 my-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-xl font-playfair font-bold text-slate-900">
                  {editingLesson ? 'Edit Lesson' : 'Create New Lesson'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">Configure video content and study materials</p>
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
                  Lesson Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                  placeholder="e.g. Setting Up the Development Environment"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Video Stream URL
                  </label>
                  <input
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                    placeholder="https://commondatastorage.googleapis.com/... or youtube/vimeo"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                    placeholder="15"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Short Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                  placeholder="Brief summary of what this lesson covers..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Detailed Lesson Notes (Markdown)
                </label>
                <textarea
                  rows="4"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all font-mono"
                  placeholder="Key notes, code snippets, reference links..."
                />
              </div>

              {/* Free Preview Toggle */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Enable Free Preview</h4>
                  <p className="text-xs text-slate-500">Allow non-enrolled students to preview this lesson</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.is_preview}
                  onChange={(e) => setFormData({ ...formData, is_preview: e.target.checked })}
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
                      <span>{editingLesson ? 'Save Changes' : 'Create Lesson'}</span>
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

export default ManageLessonsPage;