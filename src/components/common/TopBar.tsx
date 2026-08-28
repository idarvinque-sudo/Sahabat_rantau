import React from 'react';
import { Bell, Search, Sparkles } from 'lucide-react';
import { APP_CONFIG } from '../../config/appConfig';
import { UserProfile } from '../../types';

interface TopBarProps {
  onOpenNotifications: () => void;
  onOpenSearch: () => void;
  onProfileClick: () => void;
  unreadCount?: number;
  currentUser?: UserProfile | null;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenNotifications,
  onOpenSearch,
  onProfileClick,
  unreadCount = 0,
  currentUser,
}) => {
  const displayName = currentUser?.fullName?.split(' ')[0] || 'Sahabat';
  const displayAvatar = currentUser?.photoURL || APP_CONFIG.DEFAULT_AVATAR;

  return (
    <header
      id="top-bar"
      className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-purple-100/60 px-4 py-3 transition-all"
    >
      <div className="flex items-center justify-between">
        {/* User Greeting & Small Avatar */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onProfileClick}>
          <div className="relative">
            <img
              src={displayAvatar}
              alt={displayName}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500/30 p-0.5"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100/80">
                {APP_CONFIG.NAME}
              </span>
            </div>
            <h1 className="text-base font-bold text-slate-800 flex items-center gap-1 leading-tight">
              Halo, {displayName} <span className="animate-pulse">👋</span>
            </h1>
            <p className="text-[11px] text-slate-500 leading-tight">
              Selamat datang di Sahabat PMI
            </p>
          </div>
        </div>

        {/* Action Icons: Notification & Search */}
        <div className="flex items-center gap-2">
          <button
            id="topbar-search-btn"
            onClick={onOpenSearch}
            className="w-9 h-9 rounded-full bg-slate-50 hover:bg-purple-50 text-slate-600 hover:text-purple-700 border border-slate-200/70 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
            aria-label="Cari di Aplikasi"
          >
            <Search size={18} />
          </button>

          <button
            id="topbar-notif-btn"
            onClick={onOpenNotifications}
            className="relative w-9 h-9 rounded-full bg-slate-50 hover:bg-purple-50 text-slate-600 hover:text-purple-700 border border-slate-200/70 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
            aria-label="Notifikasi"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
