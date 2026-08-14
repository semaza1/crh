// FILE: src/components/user/NotificationsPage.jsx
// PURPOSE: User notification center - view and manage notifications

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen, Bell, Check, Trash2, Mail, CreditCard, Award, Clock,
  Info, CheckCircle, AlertCircle
} from 'lucide-react';

const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      fetchNotifications();

      // Real-time subscription
      const subscription = supabase
        .channel('notifications')
        .on('postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'email_notifications',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchNotifications();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  useEffect(() => {
    filterNotifications();
  }, [notifications, filterType, filterStatus]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('email_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
      setFilteredNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      showMessage('error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const filterNotifications = () => {
    let filtered = [...notifications];

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

  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('email_notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) throw error;
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
      showMessage('error', 'Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('email_notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      showMessage('success', 'All notifications marked as read!');
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
      showMessage('error', 'Failed to mark all as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('email_notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      showMessage('success', 'Notification deleted!');
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      showMessage('error', 'Failed to delete notification');
    }
  };

  const deleteAllRead = async () => {
    if (!confirm('Delete all read notifications?')) return;

    try {
      const { error } = await supabase
        .from('email_notifications')
        .delete()
        .eq('user_id', user.id)
        .eq('is_read', true);

      if (error) throw error;
      showMessage('success', 'All read notifications deleted!');
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notifications:', error);
      showMessage('error', 'Failed to delete notifications');
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'course': return <BookOpen className="h-5 w-5" />;
      case 'payment': return <CreditCard className="h-5 w-5" />;
      case 'achievement': return <Award className="h-5 w-5" />;
      case 'reminder': return <Clock className="h-5 w-5" />;
      case 'system': return <Info className="h-5 w-5" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'course': return 'bg-blue-100 text-blue-600';
      case 'payment': return 'bg-green-100 text-green-600';
      case 'achievement': return 'bg-yellow-100 text-yellow-600';
      case 'reminder': return 'bg-purple-100 text-purple-600';
      case 'system': return 'bg-gray-100 text-gray-600';
      default: return 'bg-orange-100 text-orange-600';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.is_read).length,
    read: notifications.filter(n => n.is_read).length,
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Top Banner Header */}
      <div className="relative bg-slate-900 text-white overflow-hidden py-14 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/50 via-slate-900 to-slate-900 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <Link
              to="/user/dashboard"
              className="inline-flex items-center text-sm font-semibold text-brand-400 hover:text-brand-300 transition-colors mb-3 group"
            >
              <span className="transform group-hover:-translate-x-1 transition-transform mr-1.5">←</span>
              Back to Dashboard
            </Link>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-white tracking-tight">
              Notification <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">Center</span>
            </h1>
            <p className="text-slate-400 mt-2 text-base font-medium">
              Real-time alerts, course announcements, achievements, and updates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {stats.unread > 0 && (
              <span className="px-4 py-2 rounded-2xl bg-brand-500/20 border border-brand-500/40 text-xs font-bold text-brand-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-ping"></span>
                {stats.unread} Unread Notifications
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Total Inbox</p>
              <p className="text-3xl font-extrabold text-slate-900">{stats.total}</p>
            </div>
            <div className="p-3.5 bg-brand-50 rounded-2xl text-brand-600">
              <Bell className="h-7 w-7" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Unread Alerts</p>
              <p className="text-3xl font-extrabold text-amber-600">{stats.unread}</p>
            </div>
            <div className="p-3.5 bg-amber-50 rounded-2xl text-amber-600">
              <Mail className="h-7 w-7" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Archived Read</p>
              <p className="text-3xl font-extrabold text-emerald-600">{stats.read}</p>
            </div>
            <div className="p-3.5 bg-emerald-50 rounded-2xl text-emerald-600">
              <CheckCircle className="h-7 w-7" />
            </div>
          </div>
        </div>

        {/* Action / Toast Feedback */}
        {message.text && (
          <div className={`mb-6 rounded-2xl p-4 flex items-center shadow-lg animate-fade-in ${message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-700'
              : 'bg-red-500/10 border border-red-500/30 text-red-700'
            }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-3 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-3 shrink-0" />
            )}
            <p className="text-sm font-bold">{message.text}</p>
          </div>
        )}

        {/* Filters & Actions Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-colors"
              >
                <option value="all">All Category Types</option>
                <option value="system">System Updates</option>
                <option value="course">Course & Lessons</option>
                <option value="payment">Billing & Enrollments</option>
                <option value="achievement">Honors & Certs</option>
                <option value="reminder">Reminders</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-colors"
              >
                <option value="all">All Read Status</option>
                <option value="unread">Unread Only</option>
                <option value="read">Read Only</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              {stats.unread > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 bg-slate-900 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Mark All as Read</span>
                </button>
              )}

              {stats.read > 0 && (
                <button
                  onClick={deleteAllRead}
                  className="px-4 py-2 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear Read</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-500/20 border-t-brand-500 mb-3"></div>
            <p className="text-slate-400 font-semibold text-xs">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-4">
              <Bell className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">You're all caught up!</h3>
            <p className="text-slate-500 text-sm font-medium">No new notifications in your inbox right now.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all duration-200 flex items-start gap-4 shadow-sm hover:shadow-md ${!notification.is_read
                    ? 'border-brand-500/60 bg-gradient-to-r from-brand-50/20 to-white'
                    : 'border-slate-200/80'
                  }`}
              >
                {/* Category Icon */}
                <div className={`p-3 rounded-2xl shrink-0 ${notification.notification_type === 'achievement'
                    ? 'bg-amber-100 text-amber-600'
                    : notification.notification_type === 'payment'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-brand-100 text-brand-600'
                  }`}>
                  {getNotificationIcon(notification.notification_type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-base font-bold truncate ${!notification.is_read ? 'text-slate-900' : 'text-slate-700'}`}>
                        {notification.subject}
                      </h4>
                      {!notification.is_read && (
                        <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0"></span>
                      )}
                    </div>

                    <span className="text-xs font-semibold text-slate-400">
                      {formatDate(notification.created_at)}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-slate-600 leading-relaxed mb-4">
                    {notification.message}
                  </p>

                  {/* Footer Meta & Individual Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                      {notification.notification_type || 'General'}
                    </span>

                    <div className="flex items-center gap-2">
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs font-bold text-brand-600 hover:text-brand-700 px-2.5 py-1 rounded-lg hover:bg-brand-50 transition-colors flex items-center gap-1"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Mark Read</span>
                        </button>
                      )}

                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-xs font-bold text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete notification"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;