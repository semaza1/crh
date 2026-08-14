import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { 
  BookOpen, GraduationCap, Search, X, Check, AlertCircle, 
  Plus, Edit, Trash2, User, Calendar, TrendingUp, Filter,
  ArrowLeft, CheckCircle2, Clock
} from 'lucide-react';

const ManageEnrollmentsPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState([]);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState(null);
  const [formData, setFormData] = useState({
    user_id: '',
    course_id: '',
    status: 'active',
    expires_at: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    dropped: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = enrollments;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(e => e.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(e =>
        e.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.courses?.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEnrollments(filtered);
  }, [searchTerm, statusFilter, enrollments]);

  const fetchData = async () => {
    try {
      const { data: enrollmentData, error: enrollError } = await supabase
        .from('enrollments')
        .select(`
          *,
          users (id, name, email),
          courses (id, title, is_premium)
        `)
        .order('enrolled_at', { ascending: false });

      if (enrollError) throw enrollError;

      setEnrollments(enrollmentData || []);
      setFilteredEnrollments(enrollmentData || []);

      setStats({
        total: enrollmentData?.length || 0,
        active: enrollmentData?.filter(e => e.status === 'active').length || 0,
        completed: enrollmentData?.filter(e => e.status === 'completed').length || 0,
        dropped: enrollmentData?.filter(e => e.status === 'dropped').length || 0
      });

      // Fetch users for dropdown
      const { data: usersData } = await supabase
        .from('users')
        .select('id, name, email')
        .order('name', { ascending: true });
      setUsers(usersData || []);

      // Fetch courses for dropdown
      const { data: coursesData } = await supabase
        .from('courses')
        .select('id, title')
        .order('title', { ascending: true });
      setCourses(coursesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      showMessage('error', 'Failed to load enrollment records');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingEnrollment) {
        const { error } = await supabase
          .from('enrollments')
          .update({
            status: formData.status,
            expires_at: formData.expires_at || null
          })
          .eq('id', editingEnrollment.id);

        if (error) throw error;
        showMessage('success', 'Enrollment updated successfully!');
      } else {
        const { error } = await supabase
          .from('enrollments')
          .insert([{
            user_id: formData.user_id,
            course_id: formData.course_id,
            status: formData.status,
            expires_at: formData.expires_at || null,
            enrolled_at: new Date().toISOString()
          }]);

        if (error) throw error;
        showMessage('success', 'Student enrolled successfully!');
      }

      setShowModal(false);
      setEditingEnrollment(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving enrollment:', error);
      showMessage('error', error.message || 'Failed to save enrollment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (enrollmentId) => {
    if (!confirm('Are you sure you want to remove this enrollment record?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('enrollments')
        .delete()
        .eq('id', enrollmentId);

      if (error) throw error;
      showMessage('success', 'Enrollment removed successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting enrollment:', error);
      showMessage('error', 'Failed to delete enrollment');
    }
  };

  const openModal = (enrollment = null) => {
    if (enrollment) {
      setEditingEnrollment(enrollment);
      setFormData({
        user_id: enrollment.user_id,
        course_id: enrollment.course_id,
        status: enrollment.status || 'active',
        expires_at: enrollment.expires_at ? enrollment.expires_at.split('T')[0] : ''
      });
    } else {
      setEditingEnrollment(null);
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEnrollment(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      user_id: users[0]?.id || '',
      course_id: courses[0]?.id || '',
      status: 'active',
      expires_at: ''
    });
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
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
              Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">Enrollments</span>
            </h1>
            <p className="text-slate-400 mt-2 text-base font-medium">
              Track course participants, update completion statuses, and manually assign enrollments.
            </p>
          </div>

          <button
            onClick={() => openModal()}
            className="px-6 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Enroll Student</span>
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

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Total Seats</p>
              <p className="text-3xl font-extrabold text-slate-900">{stats.total}</p>
            </div>
            <div className="p-3.5 bg-blue-50 rounded-2xl text-blue-600">
              <GraduationCap className="h-7 w-7" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Active Learners</p>
              <p className="text-3xl font-extrabold text-emerald-600">{stats.active}</p>
            </div>
            <div className="p-3.5 bg-emerald-50 rounded-2xl text-emerald-600">
              <TrendingUp className="h-7 w-7" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Course Graduates</p>
              <p className="text-3xl font-extrabold text-brand-600">{stats.completed}</p>
            </div>
            <div className="p-3.5 bg-brand-50 rounded-2xl text-brand-600">
              <CheckCircle2 className="h-7 w-7" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Dropped / Other</p>
              <p className="text-3xl font-extrabold text-slate-400">{stats.dropped}</p>
            </div>
            <div className="p-3.5 bg-slate-100 rounded-2xl text-slate-500">
              <Clock className="h-7 w-7" />
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, email, or course..."
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
              <option value="all">All Progress Statuses</option>
              <option value="active">Active Only</option>
              <option value="completed">Completed (Graduated)</option>
              <option value="dropped">Dropped Only</option>
            </select>

            <span className="text-xs font-bold text-slate-400">
              {filteredEnrollments.length} {filteredEnrollments.length === 1 ? 'record' : 'records'}
            </span>
          </div>
        </div>

        {/* Enrollments Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-500/20 border-t-brand-500 mb-3"></div>
              <p className="text-slate-400 font-semibold text-xs">Loading enrollment records...</p>
            </div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="p-12 text-center">
              <GraduationCap className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 mb-1">No enrollment records found</h3>
              <p className="text-xs text-slate-500">Try adjusting your filters or manually enroll a student.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-6">Student</th>
                    <th className="py-4 px-6">Enrolled Course</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Enrolled Date</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredEnrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {enrollment.users?.name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{enrollment.users?.name || 'Registered Student'}</p>
                            <p className="text-xs text-slate-400">{enrollment.users?.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 font-bold text-slate-900">
                        {enrollment.courses?.title || 'Selected Course'}
                      </td>

                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full ${
                          enrollment.status === 'completed'
                            ? 'bg-brand-100 text-brand-700 border border-brand-200'
                            : enrollment.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {enrollment.status || 'Active'}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-xs text-slate-500 font-medium">
                        {enrollment.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleDateString() : 'N/A'}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openModal(enrollment)}
                            className="p-2 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                            title="Edit Enrollment"
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(enrollment.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-slate-200"
                            title="Remove Enrollment"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Enrollment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-xl font-playfair font-bold text-slate-900">
                  {editingEnrollment ? 'Edit Enrollment' : 'Enroll Student'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">Assign student to a course curriculum</p>
              </div>
              <button 
                onClick={closeModal} 
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingEnrollment ? (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Select Student *
                    </label>
                    <select
                      required
                      value={formData.user_id}
                      onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                      className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    >
                      <option value="">Select a student...</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name || u.email} ({u.email})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Select Course *
                    </label>
                    <select
                      required
                      value={formData.course_id}
                      onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                      className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    >
                      <option value="">Select a course...</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-4">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Student</p>
                  <p className="text-sm font-bold text-slate-900 mb-2">{editingEnrollment.users?.name} ({editingEnrollment.users?.email})</p>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Course</p>
                  <p className="text-sm font-bold text-brand-600">{editingEnrollment.courses?.title}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Enrollment Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="active">Active Learner</option>
                  <option value="completed">Completed / Graduated</option>
                  <option value="dropped">Dropped / Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Access Expiration Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
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
                      <span>{editingEnrollment ? 'Save Status' : 'Enroll Student'}</span>
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

export default ManageEnrollmentsPage;