import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { 
  BookOpen, GraduationCap, Search, X, Check, AlertCircle, 
  Plus, Edit, Trash2, User, Calendar, TrendingUp, Filter
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
    progress: 0,
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

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(e => e.status === statusFilter);
    }

    // Apply search filter
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
      // Fetch enrollments with user and course info
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

      // Calculate stats
      const statsData = {
        total: enrollmentData?.length || 0,
        active: enrollmentData?.filter(e => e.status === 'active').length || 0,
        completed: enrollmentData?.filter(e => e.status === 'completed').length || 0,
        dropped: enrollmentData?.filter(e => e.status === 'dropped').length || 0
      };
      setStats(statsData);

      // Fetch users for dropdown
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, name, email')
        .order('name');

      if (userError) throw userError;
      setUsers(userData || []);

      // Fetch courses for dropdown
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('id, title, is_premium')
        .eq('status', 'published')
        .order('title');

      if (courseError) throw courseError;
      setCourses(courseData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      showMessage('error', 'Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const enrollmentData = {
        user_id: formData.user_id,
        course_id: formData.course_id,
        status: formData.status,
        progress: parseInt(formData.progress),
        expires_at: formData.expires_at || null
      };

      if (editingEnrollment) {
        // Update existing enrollment
        const { error } = await supabase
          .from('enrollments')
          .update(enrollmentData)
          .eq('id', editingEnrollment.id);

        if (error) throw error;
        showMessage('success', 'Enrollment updated successfully!');
      } else {
        // Check if enrollment already exists
        const { data: existing } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', formData.user_id)
          .eq('course_id', formData.course_id)
          .single();

        if (existing) {
          throw new Error('User is already enrolled in this course');
        }

        // Create new enrollment
        const { error } = await supabase
          .from('enrollments')
          .insert([enrollmentData]);

        if (error) throw error;
        showMessage('success', 'Enrollment created successfully!');
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
    if (!confirm('Are you sure you want to delete this enrollment?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('enrollments')
        .delete()
        .eq('id', enrollmentId);

      if (error) throw error;
      showMessage('success', 'Enrollment deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting enrollment:', error);
      showMessage('error', 'Failed to delete enrollment');
    }
  };

  const updateEnrollmentStatus = async (enrollmentId, newStatus) => {
    try {
      const updates = { status: newStatus };
      
      // If marking as completed, set completed_at
      if (newStatus === 'completed') {
        updates.completed_at = new Date().toISOString();
        updates.progress = 100;
      }

      const { error } = await supabase
        .from('enrollments')
        .update(updates)
        .eq('id', enrollmentId);

      if (error) throw error;
      showMessage('success', 'Status updated successfully!');
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      showMessage('error', 'Failed to update status');
    }
  };

  const openModal = (enrollment = null) => {
    if (enrollment) {
      setEditingEnrollment(enrollment);
      setFormData({
        user_id: enrollment.user_id,
        course_id: enrollment.course_id,
        status: enrollment.status,
        progress: enrollment.progress,
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
      user_id: '',
      course_id: '',
      status: 'active',
      progress: 0,
      expires_at: ''
    });
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'dropped':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-purple-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">CRH Admin</span>
            </div>
            <Link to="/admin/dashboard" className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Enrollments</h1>
          <p className="text-gray-600">View and manage course enrollments</p>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 rounded-lg p-4 flex items-center ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <Check className="h-5 w-5 text-green-600 mr-3" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
            )}
            <p className={`text-sm ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              {message.text}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <GraduationCap className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Enrollments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-lg">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Dropped</p>
                <p className="text-2xl font-bold text-gray-900">{stats.dropped}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by user or course..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="dropped">Dropped</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>

            {/* Add Button */}
            <button
              onClick={() => openModal()}
              className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium whitespace-nowrap"
            >
              <Plus className="h-5 w-5 mr-2" />
              Enroll Student
            </button>
          </div>
        </div>

        {/* Enrollments Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : filteredEnrollments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No enrollments found' : 'No enrollments yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Get started by enrolling students in courses'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={() => openModal()}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Enroll Student
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enrolled
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <p className="font-medium text-gray-900">{enrollment.users?.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-600">{enrollment.users?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{enrollment.courses?.title || 'Unknown Course'}</p>
                      {enrollment.courses?.is_premium && (
                        <span className="inline-block mt-1 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded">
                          Premium
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${enrollment.progress}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-600">{enrollment.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={enrollment.status}
                        onChange={(e) => updateEnrollmentStatus(enrollment.id, e.target.value)}
                        className={`text-xs font-semibold px-3 py-1 rounded capitalize cursor-pointer border-0 ${getStatusColor(enrollment.status)}`}
                      >
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="dropped">Dropped</option>
                        <option value="expired">Expired</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openModal(enrollment)}
                        className="inline-flex items-center text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(enrollment.id)}
                        className="inline-flex items-center text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {editingEnrollment ? 'Edit Enrollment' : 'Enroll Student'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student *
                </label>
                <select
                  required
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  disabled={!!editingEnrollment}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Select a student...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course *
                </label>
                <select
                  required
                  value={formData.course_id}
                  onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                  disabled={!!editingEnrollment}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Select a course...</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title} {course.is_premium ? '(Premium)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="dropped">Dropped</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Progress (%) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date (optional)
                </label>
                <input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingEnrollment ? 'Update' : 'Enroll'}
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