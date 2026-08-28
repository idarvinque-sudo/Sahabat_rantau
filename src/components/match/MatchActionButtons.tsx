import React from 'react';
import { RotateCcw, X, Heart, Star } from 'lucide-react';

interface MatchActionButtonsProps {
  onUndo: () => void;
  onSkip: () => void;
  onLike: () => void;
  onSuperLike: () => void;
  canUndo?: boolean;
}

export const MatchActionButtons: React.FC<MatchActionButtonsProps> = ({
  onUndo,
  onSkip,
  onLike,
  onSuperLike,
  canUndo = false,
}) => {
  return (
    <div
      id="match-action-buttons-group"
      className="flex items-center justify-center gap-3.5 py-4 px-2"
    >
      {/* ↩ Kembali / Undo */}
      <button
        id="btn-match-undo"
        onClick={onUndo}
        disabled={!canUndo}
        className={`w-12 h-12 rounded-full border border-amber-200 bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm transition-all cursor-pointer ${
          canUndo ? 'hover:bg-amber-100 hover:scale-110 active:scale-95' : 'opacity-40 cursor-not-allowed'
        }`}
        aria-label="Kembali ke profil sebelumnya"
        title="Kembali"
      >
        <RotateCcw size={20} className="stroke-[2.2px]" />
      </button>

      {/* ❌ Skip / Tolak */}
      <button
        id="btn-match-skip"
        onClick={onSkip}
        className="w-14 h-14 rounded-full border border-rose-200 bg-white text-rose-500 hover:bg-rose-50 hover:text-rose-600 hover:scale-110 active:scale-95 shadow-md shadow-rose-500/10 flex items-center justify-center transition-all cursor-pointer"
        aria-label="Lewati Profil"
        title="Lewati"
      >
        <X size={26} className="stroke-[2.8px]" />
      </button>

      {/* ❤️ Like / Suka (Utama) */}
      <button
        id="btn-match-like"
        onClick={onLike}
        className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 text-white hover:scale-110 active:scale-95 shadow-lg shadow-pink-500/35 flex items-center justify-center transition-all cursor-pointer border-2 border-white"
        aria-label="Sukai Profil"
        title="Suka (Match)"
      >
        <Heart size={32} className="stroke-[2.5px] fill-white" />
      </button>

      {/* ⭐ Super Like */}
      <button
        id="btn-match-superlike"
        onClick={onSuperLike}
        className="w-12 h-12 rounded-full border border-purple-200 bg-purple-50 text-purple-600 hover:bg-purple-100 hover:scale-110 active:scale-95 shadow-sm flex items-center justify-center transition-all cursor-pointer"
        aria-label="Super Like"
        title="Super Like"
      >
        <Star size={22} className="stroke-[2.2px] fill-purple-600" />
      </button>
    </div>
  );
};
