import React from 'react';
import { Heart, Users, Briefcase, ChevronRight, Sparkles } from 'lucide-react';

interface RecommendationCardProps {
  onNavigateToMatch: () => void;
  onOpenCommunity: () => void;
  onOpenJobs: () => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  onNavigateToMatch,
  onOpenCommunity,
  onOpenJobs,
}) => {
  return (
    <div id="recommendation-section" className="px-4 py-2">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1 font-heading">
          <span>Untuk Kamu Hari Ini</span>
          <span className="text-purple-600">💜</span>
        </h2>
        <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
          Rekomendasi Pintar
        </span>
      </div>

      {/* 3 Modern Cards Horizontal / Compact Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Card 1: 3 Orang Cocok Untukmu */}
        <button
          id="rec-card-match"
          onClick={onNavigateToMatch}
          className="relative overflow-hidden bg-gradient-to-b from-pink-50 to-white p-3 rounded-2xl border border-pink-200/80 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between h-28 group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Heart size={16} className="fill-pink-500 text-pink-500" />
            </div>
            <span className="text-[10px] font-bold text-pink-700 bg-pink-100/80 px-1.5 py-0.5 rounded-md">
              98%
            </span>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 leading-none block">
              3 Orang
            </span>
            <p className="text-[10px] text-pink-600 font-semibold mt-0.5 leading-tight">
              Cocok Untukmu
            </p>
          </div>
        </button>

        {/* Card 2: Komunitas Aktif di dekatmu */}
        <button
          id="rec-card-community"
          onClick={onOpenCommunity}
          className="relative overflow-hidden bg-gradient-to-b from-purple-50 to-white p-3 rounded-2xl border border-purple-200/80 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between h-28 group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users size={16} />
            </div>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-100/80 px-1.5 py-0.5 rounded-md">
              Dekat
            </span>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 leading-none block">
              Komunitas
            </span>
            <p className="text-[10px] text-purple-600 font-semibold mt-0.5 leading-tight">
              Aktif di dekatmu
            </p>
          </div>
        </button>

        {/* Card 3: Lowongan Baru Lihat sekarang */}
        <button
          id="rec-card-jobs"
          onClick={onOpenJobs}
          className="relative overflow-hidden bg-gradient-to-b from-amber-50 to-white p-3 rounded-2xl border border-amber-200/80 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between h-28 group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Briefcase size={16} />
            </div>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded-md">
              Baru
            </span>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 leading-none block">
              Lowongan
            </span>
            <p className="text-[10px] text-amber-700 font-semibold mt-0.5 leading-tight">
              Lihat sekarang
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
