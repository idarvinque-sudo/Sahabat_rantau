import React from 'react';
import { Heart, MessageCircle, Sparkles, X, ArrowRight } from 'lucide-react';
import { MatchProfile } from '../../types';
import { APP_CONFIG } from '../../config/appConfig';

interface ItsAMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchedProfile: MatchProfile | null;
  onStartChat: (profile: MatchProfile) => void;
  currentUser?: { photoURL?: string; fullName?: string } | null;
}

export const ItsAMatchModal: React.FC<ItsAMatchModalProps> = ({
  isOpen,
  onClose,
  matchedProfile,
  onStartChat,
  currentUser,
}) => {
  if (!isOpen || !matchedProfile) return null;

  const myAvatar = currentUser?.photoURL || APP_CONFIG.DEFAULT_AVATAR;
  const myName = currentUser?.fullName?.split(' ')[0] || 'Kamu';

  return (
    <div
      id="its-a-match-modal"
      className="fixed inset-0 z-50 bg-purple-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
    >
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 border border-purple-200">
        {/* Confetti / Glow Background */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Match Header Text */}
        <div className="mt-2 mb-6">
          <div className="inline-flex items-center gap-1 bg-pink-100 text-pink-700 text-xs font-bold px-3 py-1 rounded-full mb-2">
            <Sparkles size={14} className="text-pink-600" />
            <span>Koneksi Spesial</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-rose-600 font-heading">
            It's a Match! ❤️
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Kamu dan <strong className="text-slate-900 font-bold">{matchedProfile.name}</strong> saling menyukai.
          </p>
        </div>

        {/* Side-by-side Avatars with pulsing heart */}
        <div className="flex items-center justify-center gap-3 my-6 relative">
          {/* Current User Avatar */}
          <div className="relative">
            <img
              src={myAvatar}
              alt={myName}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-purple-500 shadow-md shadow-purple-500/20"
            />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap">
              {myName}
            </span>
          </div>

          {/* Center Pulsing Heart */}
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-pink-500/40 z-10 animate-bounce">
            <Heart size={22} className="fill-white stroke-[2.5px]" />
          </div>

          {/* Matched Profile Avatar */}
          <div className="relative">
            <img
              src={matchedProfile.photo}
              alt={matchedProfile.name}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-pink-500 shadow-md shadow-pink-500/20"
            />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-pink-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap">
              {matchedProfile.name}
            </span>
          </div>
        </div>

        {/* Quick Tag Info */}
        <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 text-left text-xs mb-5">
          <p className="text-slate-700 italic">
            "{matchedProfile.bio}"
          </p>
          <div className="flex items-center gap-2 mt-2 text-[11px] text-purple-700 font-semibold">
            <span>📍 {matchedProfile.city}, {matchedProfile.country}</span>
            <span>•</span>
            <span>💼 {matchedProfile.job}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            id="btn-match-start-chat"
            onClick={() => onStartChat(matchedProfile)}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:opacity-95 text-white rounded-2xl font-bold text-sm shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
          >
            <MessageCircle size={18} />
            <span>Mulai Chat Sekarang</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
          >
            Lanjut Cari Match Lainnya
          </button>
        </div>
      </div>
    </div>
  );
};
