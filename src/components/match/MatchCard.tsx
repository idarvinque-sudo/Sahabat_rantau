import React from 'react';
import { MapPin, Briefcase, Ruler, Heart, Sparkles, CigaretteOff, Moon } from 'lucide-react';
import { MatchProfile } from '../../types';
import { VerifiedBadge } from '../common/VerifiedBadge';

interface MatchCardProps {
  profile: MatchProfile;
  onCardClick?: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ profile, onCardClick }) => {
  return (
    <div
      id={`match-profile-card-${profile.id}`}
      onClick={onCardClick}
      className="w-full bg-white rounded-3xl border border-slate-100 shadow-lg shadow-purple-900/5 overflow-hidden transition-all relative"
    >
      {/* Big Professional Photo Container */}
      <div className="relative w-full h-96 sm:h-[420px] bg-slate-100 overflow-hidden">
        <img
          src={profile.photo}
          alt={profile.name}
          className="w-full h-full object-cover"
        />

        {/* Gradient Overlay for crisp readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

        {/* Top Badges: Online Indicator & Verified Badge */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 text-white text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-[11px]">{profile.isOnline ? 'Online' : 'Baru saja'}</span>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-full shadow-md">
            <VerifiedBadge size="md" variant="pill" />
          </div>
        </div>

        {/* Profile Details Overlaid on the Bottom of Photo */}
        <div className="absolute bottom-4 left-4 right-4 text-white z-10">
          {/* Name & Age */}
          <div className="flex items-center gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
              {profile.name}, {profile.age}
            </h3>
            <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>

          {/* Location with Flag */}
          <div className="flex items-center gap-1.5 text-xs text-purple-200 mt-1 font-medium">
            <MapPin size={14} className="text-pink-400" />
            <span>
              {profile.country} {profile.countryFlag} • {profile.city}
            </span>
          </div>

          {/* Bio Quote */}
          <div className="mt-2.5 p-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-xs sm:text-sm text-slate-100 font-normal leading-relaxed">
            "{profile.bio}"
          </div>
        </div>
      </div>

      {/* Information Badges / Chips below the photo */}
      <div className="p-4 bg-white border-t border-slate-100">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Informasi Utama
        </p>

        <div className="grid grid-cols-2 gap-2">
          {/* Agama */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-purple-50/70 border border-purple-100 text-xs font-semibold text-purple-900">
            <div className="w-6 h-6 rounded-lg bg-purple-200/70 text-purple-700 flex items-center justify-center">
              <Moon size={14} />
            </div>
            <span>{profile.religion}</span>
          </div>

          {/* Tinggi Badan */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-purple-50/70 border border-purple-100 text-xs font-semibold text-purple-900">
            <div className="w-6 h-6 rounded-lg bg-purple-200/70 text-purple-700 flex items-center justify-center">
              <Ruler size={14} />
            </div>
            <span>{profile.height}</span>
          </div>

          {/* Pekerjaan */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-purple-50/70 border border-purple-100 text-xs font-semibold text-purple-900">
            <div className="w-6 h-6 rounded-lg bg-purple-200/70 text-purple-700 flex items-center justify-center">
              <Briefcase size={14} />
            </div>
            <span className="truncate">{profile.job}</span>
          </div>

          {/* Kebiasaan Merokok */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-purple-50/70 border border-purple-100 text-xs font-semibold text-purple-900">
            <div className="w-6 h-6 rounded-lg bg-purple-200/70 text-purple-700 flex items-center justify-center">
              <CigaretteOff size={14} />
            </div>
            <span>{profile.smoking}</span>
          </div>
        </div>

        {/* Hobbies list */}
        {profile.hobbies && profile.hobbies.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {profile.hobbies.map((h) => (
              <span
                key={h}
                className="text-[11px] bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-full border border-slate-200"
              >
                ✨ {h}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
