import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { 
  BookOpen, Bell, Plus, Edit, Trash2, Search, X, Check, AlertCircle,
  Send, Users, Filter, Mail, CreditCard, Award, Clock, Info, ArrowLeft,
  CheckCircle, Megaphone
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

      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, name, email')
        .order('name', { ascending: true });

      if (usersError) throw usersError;
      setUsers(usersData || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      showMessage('error', 'Failed to load notifications');
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
        // Create a notification for every registered user
        const notificationsToInsert = users.map(user => ({
          user_id: user.id,
          subject: formData.subject,
          message: formData.message,
          notification_type: formData.notification_type,
          is_read: false
        }));

        const { error } = await supabase
          .from('email_notifications')
          .insert(notificationsToInsert);

        if (error) throw error;
        showMessage('success', `Broadcast sent to ${users.length} users successfully!`);
      } else {
        const { error } = await supabase
          .from('email_notifications')
          .insert([{
            user_id: formData.user_id,
            subject: formData.subject,
            message: formData.message,
            notification_type: formData.notification_type,
            is_read: false
          }]);

        if (error) throw error;
        showMessage('success', 'Notification dispatched to student!');
      }

      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error creating notification:', error);
      showMessage('error', error.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (notifId) => {
    if (!confirm('Delete this notification record?')) return;

    try {
      const { error } = await supabase
        .from('email_notifications')
        .delete()
        .eq('id', notifId);

      if (error) throw error;
      showMessage('success', 'Notification deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting notification:', error);
      showMessage('error', 'Failed to delete notification');
    }
  };

  const resetForm = () => {
    setFormData({
      user_id: users[0]?.id || '',
      subject: '',
      message: '',
      notification_type: 'system',
      send_to_all: false
    });
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'course': return <BookOpen className="h-4 w-4" />;
      case 'payment': return <CreditCard className="h-4 w-4" />;
      case 'achievement': return <Award className="h-4 w-4" />;
      case 'reminder': return <Clock className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
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
              Announcements & <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">Alerts</span>
            </h1>
            <p className="text-slate-400 mt-2 text-base font-medium">
              Broadcast platform notices, achievement celebrations, and personalized reminders to students.
            </p>
          </div>

          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-6 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <Megaphone className="h-4 w-4" />
            <span>Send Announcement</span>
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
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search notifications by subject, text, or recipient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-colors"
            >
              <option value="all">All Category Types</option>
              <option value="system">System Notices</option>
              <option value="course">Course Alerts</option>
              <option value="payment">Billing</option>
              <option value="achievement">Honors & Certs</option>
              <option value="reminder">Reminders</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-colors"
            >
              <option value="all">All Read Statuses</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </select>

            <span className="text-xs font-bold text-slate-400">
              {filteredNotifications.length} {filteredNotifications.length === 1 ? 'alert' : 'alerts'}
            </span>
          </div>
        </div>

        {/* Notifications Dispatch Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-500/20 border-t-brand-500 mb-3"></div>
              <p className="text-slate-400 font-semibold text-xs">Loading announcement logs...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 mb-1">No dispatched notifications found</h3>
              <p className="text-xs text-slate-500">Send an announcement to inform students of updates.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-6">Subject & Message</th>
                    <th className="py-4 px-6">Recipient</th>
                    <th className="py-4 px-6">Type</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Sent Date</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredNotifications.map((notif) => (
                    <tr key={notif.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 max-w-sm">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                            notif.notification_type === 'achievement'
                              ? 'bg-amber-100 text-amber-600'
                              : notif.notification_type === 'payment'
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-brand-100 text-brand-600'
                          }`}>
                            {getNotificationIcon(notif.notification_type)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{notif.subject}</p>
                            <p className="text-xs text-slate-500 line-clamp-1">{notif.message}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 font-medium text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{notif.users?.name || 'All Users'}</span>
                          <span className="text-xs text-slate-400">({notif.users?.email || 'Broadcast'})</span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {notif.notification_type || 'System'}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full ${
                          notif.is_read
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {notif.is_read ? 'Read' : 'Unread'}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-xs text-slate-500 font-medium">
                        {notif.created_at ? new Date(notif.created_at).toLocaleDateString() : 'N/A'}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDelete(notif.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Delete Record"
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
      </div>

      {/* Broadcast Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-xl font-playfair font-bold text-slate-900">
                  Compose Announcement
                </h3>
                <p className="text-xs text-slate-500 font-medium">Send notifications and reminders to students</p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Broadcast Switch */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Broadcast to All Registered Students</h4>
                  <p className="text-xs text-slate-500">Every active student account will receive this announcement</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.send_to_all}
                  onChange={(e) => setFormData({ ...formData, send_to_all: e.target.checked })}
                  className="w-5 h-5 text-brand-600 rounded-lg focus:ring-brand-500 cursor-pointer"
                />
              </div>

              {!formData.send_to_all && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Target Student *
                  </label>
                  <select
                    required={!formData.send_to_all}
                    value={formData.user_id}
                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="">Select a student recipient...</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name || u.email} ({u.email})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Notification Category
                  </label>
                  <select
                    value={formData.notification_type}
                    onChange={(e) => setFormData({ ...formData, notification_type: e.target.value })}
                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="system">System Announcement</option>
                    <option value="course">Course Module Update</option>
                    <option value="achievement">Honors & Achievement</option>
                    <option value="payment">Billing / Invoice</option>
                    <option value="reminder">Study Reminder</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Subject Line *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                    placeholder="e.g. New Live Masterclass Added!"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Message Content *
                </label>
                <textarea
                  required
                  rows="4"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                  placeholder="Write the full announcement message for the student inbox..."
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
                      <Send className="h-4 w-4" />
                      <span>{formData.send_to_all ? 'Send Broadcast' : 'Send Alert'}</span>
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