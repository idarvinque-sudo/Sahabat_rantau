import React from 'react';
import { Home, Heart, Plus, MessageCircle, Bell, Users, User as UserIcon } from 'lucide-react';
import { TabType } from '../../types';

interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenCreate: () => void;
  unreadChatCount?: number;
  unreadNotifCount?: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  onOpenCreate,
  unreadChatCount = 0,
  unreadNotifCount = 0,
}) => {
  return (
    <nav
      id="bottom-navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] max-w-md mx-auto"
    >
      <div className="flex items-center justify-between px-3 py-1.5 safe-area-bottom">
        {/* Beranda / Feed */}
        <button
          id="nav-tab-beranda"
          onClick={() => onTabChange('beranda')}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'beranda'
              ? 'text-purple-600 font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <div className="relative">
            <Home
              size={22}
              className={activeTab === 'beranda' ? 'stroke-[2.4px] fill-purple-50' : 'stroke-[1.8px]'}
            />
            {activeTab === 'beranda' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-purple-600 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-0.5">Beranda</span>
        </button>

        {/* Jodoh ❤️ */}
        <button
          id="nav-tab-jodoh"
          onClick={() => onTabChange('jodoh')}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'jodoh'
              ? 'text-pink-600 font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <div className="relative">
            <Heart
              size={22}
              className={activeTab === 'jodoh' ? 'stroke-[2.4px] fill-pink-50 text-pink-600' : 'stroke-[1.8px]'}
            />
            {activeTab === 'jodoh' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-pink-500 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-0.5">Jodoh</span>
        </button>

        {/* Buat (Elevated Center Button) */}
        <div className="flex flex-col items-center justify-center -mt-5 px-1">
          <button
            id="nav-btn-create"
            onClick={onOpenCreate}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 via-purple-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/35 hover:shadow-purple-500/50 hover:scale-105 active:scale-95 transition-all cursor-pointer border-4 border-white"
            aria-label="Buat Postingan Baru"
          >
            <Plus size={24} className="stroke-[2.8px]" />
          </button>
          <span className="text-[10px] font-semibold text-purple-600 mt-0.5">Posting</span>
        </div>

        {/* Pesan / Chat */}
        <button
          id="nav-tab-pesan"
          onClick={() => onTabChange('pesan')}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all cursor-pointer relative ${
            activeTab === 'pesan'
              ? 'text-purple-600 font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <div className="relative">
            <MessageCircle
              size={22}
              className={activeTab === 'pesan' ? 'stroke-[2.4px] fill-purple-50' : 'stroke-[1.8px]'}
            />
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 bg-pink-500 text-white text-[9px] font-bold px-1 rounded-full flex items-center justify-center border border-white">
                {unreadChatCount}
              </span>
            )}
            {activeTab === 'pesan' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-purple-600 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-0.5">Pesan</span>
        </button>

        {/* Notifikasi */}
        <button
          id="nav-tab-notifikasi"
          onClick={() => onTabChange('notifikasi')}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all cursor-pointer relative ${
            activeTab === 'notifikasi'
              ? 'text-purple-600 font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <div className="relative">
            <Bell
              size={22}
              className={activeTab === 'notifikasi' ? 'stroke-[2.4px] fill-purple-50' : 'stroke-[1.8px]'}
            />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full" />
            )}
            {activeTab === 'notifikasi' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-purple-600 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-0.5">Notifikasi</span>
        </button>
      </div>
    </nav>
  );
};

