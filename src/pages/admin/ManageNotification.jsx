// FILE: src/components/admin/ManageNotificationsPage.jsx
// FIXED: Changed full_name to name (adjust based on your column name)

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { 
  BookOpen, Bell, Plus, Edit, Trash2, Search, X, Check, AlertCircle,
  Send, Users, Filter, Mail, CreditCard, Award, Clock, Info
} from 'lucide-react';

const ManageNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [formData, setFormData] = useState({
    user_id: '',
    subject: '',
    message: '',
    notification_type: 'system',
    send_to_all: false
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, searchTerm, filterType, filterStatus]);

  const fetchData = async () => {
    try {
      // FIXED: Changed full_name to name
      const { data: notifData, error: notifError } = await supabase
        .from('email_notifications')
        .select(`
          *,
          users (
            id,
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (notifError) throw notifError;
      setNotifications(notifData || []);
      setFilteredNotifications(notifData || []);

      // FIXED: Changed full_name to name
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, name, email')
        .order('name', { ascending: true });

      if (usersError) throw usersError;
      setUsers(usersData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      showMessage('error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filterNotifications = () => {
    let filtered = [...notifications];

    if (searchTerm) {
      filtered = filtered.filter(notif =>
        notif.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notif.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notif.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notif.users?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(notif => notif.notification_type === filterType);
    }

    if (filterStatus === 'read') {
      filtered = filtered.filter(notif => notif.is_read);
    } else if (filterStatus === 'unread') {
      filtered = filtered.filter(notif => !notif.is_read);
    }

    setFilteredNotifications(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.send_to_all) {
        const notificationsToInsert = users.map(user => ({
          user_id: user.id,
          subject: formData.subject,
          message: formData.message,
          notification_type: formData.notification_type
        }));

        const { error } = await supabase
          .from('email_notifications')
          .insert(notificationsToInsert);

        if (error) throw error;
        showMessage('success', `Notification sent to ${users.length} users!`);
      } else {
        const notificationData = {
          user_id: formData.user_id,
          subject: formData.subject,
          message: formData.message,
          notification_type: formData.notification_type
        };

        if (editingNotification) {
          const { error } = await supabase
            .from('email_notifications')
            .update(notificationData)
            .eq('id', editingNotification.id);

          if (error) throw error;
          showMessage('success', 'Notification updated successfully!');
        } else {
          const { error } = await supabase
            .from('email_notifications')
            .insert([notificationData]);

          if (error) throw error;
          showMessage('success', 'Notification sent successfully!');
        }
      }

      setShowModal(false);
      setEditingNotification(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving notification:', error);
      showMessage('error', error.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (notificationId) => {
    if (!confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('email_notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      showMessage('success', 'Notification deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting notification:', error);
      showMessage('error', 'Failed to delete notification');
    }
  };

  const openModal = (notification = null) => {
    if (notification) {
      setEditingNotification(notification);
      setFormData({
        user_id: notification.user_id,
        subject: notification.subject || '',
        message: notification.message || '',
        notification_type: notification.notification_type,
        send_to_all: false
      });
    } else {
      setEditingNotification(null);
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingNotification(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      user_id: '',
      subject: '',
      message: '',
      notification_type: 'system',
      send_to_all: false
    });
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'course':
        return <BookOpen className="h-5 w-5" />;
      case 'payment':
        return <CreditCard className="h-5 w-5" />;
      case 'achievement':
        return <Award className="h-5 w-5" />;
      case 'reminder':
        return <Clock className="h-5 w-5" />;
      case 'system':
        return <Info className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'course':
        return 'bg-blue-100 text-blue-600';
      case 'payment':
        return 'bg-green-100 text-green-600';
      case 'achievement':
        return 'bg-yellow-100 text-yellow-600';
      case 'reminder':
        return 'bg-purple-100 text-purple-600';
      case 'system':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-orange-100 text-orange-600';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.is_read).length,
    system: notifications.filter(n => n.notification_type === 'system').length,
    course: notifications.filter(n => n.notification_type === 'course').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Notifications</h1>
          <p className="text-gray-600">Send and manage notifications to users</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Notifications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Bell className="h-10 w-10 text-purple-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Unread</p>
                <p className="text-2xl font-bold text-orange-600">{stats.unread}</p>
              </div>
              <Mail className="h-10 w-10 text-orange-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">System</p>
                <p className="text-2xl font-bold text-blue-600">{stats.system}</p>
              </div>
              <Info className="h-10 w-10 text-blue-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Course Related</p>
                <p className="text-2xl font-bold text-green-600">{stats.course}</p>
              </div>
              <BookOpen className="h-10 w-10 text-green-600 opacity-20" />
            </div>
          </div>
        </div>

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

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="system">System</option>
              <option value="course">Course</option>
              <option value="payment">Payment</option>
              <option value="achievement">Achievement</option>
              <option value="reminder">Reminder</option>
              <option value="other">Other</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="read">Read</option>
              <option value="unread">Unread</option>
            </select>

            <button
              onClick={() => openModal()}
              className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors whitespace-nowrap"
            >
              <Send className="h-5 w-5 mr-2" />
              Send Notification
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all' ? 'No notifications found' : 'No notifications yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all' ? 'Try adjusting your filters' : 'Start by sending your first notification'}
            </p>
            {!searchTerm && filterType === 'all' && filterStatus === 'all' && (
              <button
                onClick={() => openModal()}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Send className="h-5 w-5 mr-2" />
                Send Notification
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredNotifications.map((notification) => (
                    <tr key={notification.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full ${getNotificationColor(notification.notification_type)}`}>
                          {getNotificationIcon(notification.notification_type)}
                          <span className="ml-2 text-xs font-medium capitalize">{notification.notification_type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {notification.users?.name || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {notification.users?.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-md truncate">
                          {notification.subject}
                        </div>
                        <div className="text-sm text-gray-500 max-w-md truncate">
                          {notification.message}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {notification.is_read ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Check className="h-3 w-3 mr-1" />
                            Read
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <Mail className="h-3 w-3 mr-1" />
                            Unread
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(notification.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openModal(notification)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {editingNotification ? 'Edit Notification' : 'Send Notification'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Type *
                </label>
                <select
                  required
                  value={formData.notification_type}
                  onChange={(e) => setFormData({ ...formData, notification_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="system">System</option>
                  <option value="course">Course</option>
                  <option value="payment">Payment</option>
                  <option value="achievement">Achievement</option>
                  <option value="reminder">Reminder</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {!editingNotification && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="send_to_all"
                    checked={formData.send_to_all}
                    onChange={(e) => setFormData({ ...formData, send_to_all: e.target.checked })}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="send_to_all" className="ml-2 text-sm text-gray-700 flex items-center">
                    <Users className="h-4 w-4 mr-1 text-purple-600" />
                    Send to all users ({users.length} users)
                  </label>
                </div>
              )}

              {!formData.send_to_all && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient *
                  </label>
                  <select
                    required
                    value={formData.user_id}
                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    disabled={editingNotification}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">Select a user...</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Notification subject..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows="5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Notification message..."
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
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {editingNotification ? 'Update' : 'Send'}
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

export default ManageNotificationsPage;