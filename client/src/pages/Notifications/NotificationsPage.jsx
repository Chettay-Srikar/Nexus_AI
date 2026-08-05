import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Clock,
  Filter,
  CheckCheck,
  Trash2
} from 'lucide-react';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      const data = res.data.data?.notifications || res.data.notifications || [];
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const filtered = notifications.filter(n => {
    if (filterType === 'All') return true;
    if (filterType === 'Risk') return n.type === 'risk';
    if (filterType === 'Info') return n.type === 'info';
    if (filterType === 'Success') return n.type === 'success';
    return true;
  });

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-400" />
            Notification & AI Alert Center
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Real-time alerts, daily briefs, pending approvals, and project risk escalations.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold flex items-center gap-1.5 border border-gray-700 transition"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All Read</span>
          </button>
          <button
            onClick={handleClearAll}
            className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-red-500/10 text-gray-400 hover:text-red-400 text-xs font-semibold flex items-center gap-1.5 border border-gray-700 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Priority Filters */}
      <div className="flex items-center gap-2">
        {['All', 'Risk', 'Info', 'Success'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterType === t
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-900 border border-gray-800 text-gray-400 hover:bg-gray-800'
            }`}
          >
            {t} Alerts
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-3">
        {filtered.length > 0 ? (
          filtered.map((n) => (
            <div key={n.id} className={`p-4 rounded-xl border flex items-start gap-3 transition ${
              n.is_read ? 'bg-gray-900/30 border-gray-800 opacity-70' : 'bg-gray-900/80 border-gray-700 shadow-md'
            }`}>
              <div className={`p-2 rounded-lg mt-0.5 ${
                n.type === 'risk' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                n.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
              }`}>
                {n.type === 'risk' ? <AlertTriangle className="w-4 h-4" /> :
                 n.type === 'success' ? <CheckCircle className="w-4 h-4" /> :
                 <Info className="w-4 h-4" />}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-200 text-xs">{n.title}</h4>
                  <span className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(n.created_at || Date.now()).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{n.message}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-xs text-gray-500">No active notifications found.</div>
        )}
      </div>
    </div>
  );
};
