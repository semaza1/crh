// FILE: src/components/common/NotificationBell.jsx
// PURPOSE: Show notification bell with unread count in navbar

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { 
  Bell, Check, X, BookOpen, CreditCard, Award, Clock, Info
} from 'lucide-react';

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('email_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Real-time subscription
      const subscription = supabase
        .channel('user_notifications')
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
  }, [user, fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (notificationId, e) => {
    e.preventDefault();
    e.stopPropagation();

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
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'course':
        return <BookOpen className="h-4 w-4" />;
      case 'payment':
        return <CreditCard className="h-4 w-4" />;
      case 'achievement':
        return <Award className="h-4 w-4" />;
      case 'reminder':
        return <Clock className="h-4 w-4" />;
      case 'system':
        return <Info className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
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

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-all focus:outline-none"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 glass rounded-2xl shadow-2xl border border-white/40 z-50 animate-fade-in-up origin-top-right overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100/50 bg-white/50">
            <h3 className="text-lg font-bold text-slate-800">Notifications</h3>
            <button
              onClick={() => setShowDropdown(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto bg-white/80">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="h-8 w-8 text-slate-300" />
                </div>
                <p className="text-slate-500 text-sm font-medium">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100/50">
                {notifications.map((notification) => (
                  <Link
                    key={notification.id}
                    to="/notifications"
                    onClick={() => setShowDropdown(false)}
                    className={`block p-4 hover:bg-slate-50 transition-colors ${
                      !notification.is_read ? 'bg-brand-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={`p-2.5 rounded-xl ${getNotificationColor(notification.notification_type)} flex-shrink-0 shadow-sm`}>
                        {getNotificationIcon(notification.notification_type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <p className={`text-sm font-bold ${!notification.is_read ? 'text-slate-900' : 'text-slate-600'} line-clamp-1`}>
                            {notification.subject}
                          </p>
                          {!notification.is_read && (
                            <span className="w-2 h-2 bg-brand-500 rounded-full ml-2 flex-shrink-0 mt-1.5 shadow-sm shadow-brand-500/50"></span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-2 font-medium">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-400">
                            {formatTime(notification.created_at)}
                          </span>
                          {!notification.is_read && (
                            <button
                              onClick={(e) => markAsRead(notification.id, e)}
                              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 bg-brand-50 px-2 py-1 rounded-md transition-colors"
                            >
                              <Check className="h-3 w-3" />
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-100/50 bg-slate-50/80">
              <Link
                to="/notifications"
                onClick={() => setShowDropdown(false)}
                className="block w-full text-center py-2.5 text-sm font-bold text-brand-600 hover:text-brand-700 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-200"
              >
                View All Notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;