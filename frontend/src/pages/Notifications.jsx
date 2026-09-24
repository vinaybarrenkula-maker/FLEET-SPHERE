import React, { useEffect, useState } from 'react';
import { notificationApi } from '../api';
import { Bell, CheckCheck, Clock, AlertTriangle, Shield, CheckCircle2, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await notificationApi.getAll({ unread: unreadOnly ? 'true' : undefined, limit: 30 });
      setNotifications(data.data || []);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [unreadOnly]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      toast.success('Marked as read');
    } catch (err) {
      toast.error('Failed to update notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const typeIcons = {
    TRIP_ASSIGNED: <CheckCircle2 className="w-5 h-5 text-[#ff6b4a]" />,
    TRIP_DELAYED: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    INCIDENT_REPORTED: <AlertTriangle className="w-5 h-5 text-rose-400" />,
    MAINTENANCE_OVERDUE: <AlertTriangle className="w-5 h-5 text-orange-400" />,
    INSURANCE_EXPIRY: <Clock className="w-5 h-5 text-amber-400" />,
    EXPENSE_APPROVED: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    EXPENSE_REJECTED: <AlertTriangle className="w-5 h-5 text-rose-400" />,
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl pg-heading flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#ff6b4a]" />
            Notification Center
          </h1>
          <p className="text-sm pg-muted mt-1">Operational alerts, trip updates, and maintenance reminders</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setUnreadOnly(!unreadOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              unreadOnly
                ? 'bg-indigo-600 text-white border-[#ff6b4a]'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            {unreadOnly ? 'Showing Unread Only' : 'Show All'}
          </button>
          <button
            onClick={handleMarkAllRead}
            className="pg-card px-3.5 py-1.5 rounded-lg  font-medium text-xs flex items-center gap-1.5 transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            Mark all read
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#ff6b4a]/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="pg-card  rounded-2xl p-12 text-center pg-muted">
            <Bell className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <h3 className="text-base pg-heading">No notifications</h3>
            <p className="text-xs pg-muted mt-1">You are all caught up on fleet activity.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                n.isRead
                  ? 'bg-slate-800/60 border-slate-800 text-slate-400'
                  : 'bg-slate-800 border-slate-700 shadow-sm text-slate-200'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-700/60 mt-0.5 shrink-0">
                  {typeIcons[n.notificationType] || <Info className="w-5 h-5 text-[#ff6b4a]" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-white text-sm">{n.title}</h4>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                  <span className="text-[11px] pg-muted mt-2 block">
                    {new Date(n.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {!n.isRead && (
                <button
                  onClick={() => handleMarkAsRead(n._id)}
                  className="px-2.5 py-1 text-xs rounded bg-slate-700 hover:bg-slate-600 text-slate-300 whitespace-nowrap transition-colors shrink-0"
                >
                  Mark read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
