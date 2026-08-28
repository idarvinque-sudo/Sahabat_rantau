import React, { useState } from 'react';
import {
  Bell,
  Heart,
  MessageCircle,
  Users,
  ShieldCheck,
  CheckCheck,
  CreditCard,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { NotificationItem, UserProfile } from '../types';
import { markAllNotificationsAsRead } from '../firebase/notifService';

interface NotificationViewProps {
  notifications: NotificationItem[];
  currentUser?: UserProfile | null;
  onNavigateToTab?: (tab: any) => void;
}

export const NotificationView: React.FC<NotificationViewProps> = ({
  notifications,
  currentUser,
  onNavigateToTab,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filteredNotifs = notifications.filter((n) => {
    if (filterType === 'all') return true;
    if (filterType === 'reaction' && (n.type === 'like' || n.type === 'reaction')) return true;
    if (filterType === 'comment' && (n.type === 'comment' || n.type === 'reply')) return true;
    if (filterType === 'match' && (n.type === 'match' || n.type === 'friend_request' || n.type === 'friend_accepted')) return true;
    if (filterType === 'security' && (n.type === 'security' || n.type === 'system')) return true;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    if (currentUser?.uid) {
      await markAllNotificationsAsRead(currentUser.uid, notifications);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'like':
      case 'reaction':
        return <Heart size={16} className="text-pink-500 fill-pink-500" />;
      case 'comment':
      case 'reply':
        return <MessageCircle size={16} className="text-purple-600" />;
      case 'match':
        return <Sparkles size={16} className="text-amber-500" />;
      case 'friend_request':
      case 'friend_accepted':
        return <Users size={16} className="text-blue-600" />;
      case 'security':
        return <ShieldCheck size={16} className="text-emerald-600" />;
      default:
        return <Bell size={16} className="text-purple-600" />;
    }
  };

  return (
    <div id="notification-view" className="space-y-3 px-4 py-3 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight font-heading flex items-center gap-2">
            <span>Pusat Notifikasi</span>
            {unreadCount > 0 && (
              <span className="text-xs px-2.5 py-0.5 bg-rose-100 text-rose-700 font-bold rounded-full">
                {unreadCount} Baru
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500">Pembaruan interaksi, jodoh & info resmi PMI</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
          >
            <CheckCheck size={14} />
            <span>Tandai Dibaca</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {[
          { label: 'Semua', value: 'all' },
          { label: 'Reaksi', value: 'reaction' },
          { label: 'Komentar', value: 'comment' },
          { label: 'Jodoh & Teman', value: 'match' },
          { label: 'Keamanan', value: 'security' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilterType(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filterType === f.value
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-purple-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notification Stream */}
      <div className="space-y-2.5">
        {filteredNotifs.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-100 shadow-xs space-y-1">
            <Bell size={28} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-700">Tidak ada notifikasi baru.</p>
            <p className="text-xs text-slate-400">Semua aktivitas akun dan teman PMI akan muncul di sini.</p>
          </div>
        ) : (
          filteredNotifs.map((notif) => (
            <div
              key={notif.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                notif.isRead
                  ? 'bg-white border-slate-100 text-slate-600'
                  : 'bg-purple-50/70 border-purple-200/80 text-slate-800 shadow-xs'
              }`}
            >
              {/* Avatar or Icon */}
              <div className="relative shrink-0">
                {notif.avatar ? (
                  <img
                    src={notif.avatar}
                    alt=""
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-purple-100"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Bell size={20} />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-xs border border-slate-100">
                  {getIconForType(notif.type)}
                </div>
              </div>

              {/* Body */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800">{notif.title}</h4>
                  <span className="text-[10px] text-slate-400 font-medium">{notif.timeAgo}</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>

                {/* Context action buttons */}
                {notif.type === 'match' && onNavigateToTab && (
                  <button
                    onClick={() => onNavigateToTab('pesan')}
                    className="mt-2 text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1 cursor-pointer bg-pink-50 hover:bg-pink-100 px-2.5 py-1 rounded-lg border border-pink-200 transition-colors inline-flex"
                  >
                    <span>Kirim Pesan Pertama</span>
                    <ArrowRight size={12} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
