import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Sparkles,
  Heart,
  RotateCcw,
  X,
  Star,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  AlertTriangle,
  Grid,
  CreditCard,
  Edit,
  Eye,
  EyeOff,
  Filter,
  Check,
  MapPin,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Info,
  Flag,
} from 'lucide-react';
import { MatchProfile, UserProfile, RelationshipGoal } from '../types';
import { MatchCard } from '../components/match/MatchCard';
import { MatchActionButtons } from '../components/match/MatchActionButtons';
import { ItsAMatchModal } from '../components/match/ItsAMatchModal';
import { Modal } from '../components/common/Modal';
import { ReportModal } from '../components/common/ReportModal';
import { sendMatchLike, toggleDatingStatus, updateDatingProfile } from '../firebase/matchService';
import { VerifiedBadge } from '../components/common/VerifiedBadge';

interface MatchViewProps {
  profiles: MatchProfile[];
  diamondsCount: number;
  currentUser?: UserProfile | null;
  onStartChatWithProfile: (profile: MatchProfile) => void;
}

export const MatchView: React.FC<MatchViewProps> = ({
  profiles,
  diamondsCount,
  currentUser,
  onStartChatWithProfile,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [history, setHistory] = useState<number[]>([]);
  const [matchedProfile, setMatchedProfile] = useState<MatchProfile | null>(null);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState<boolean>(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState<boolean>(false);
  const [isSafetyGuideOpen, setIsSafetyGuideOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'card' | 'grid'>('card');
  const [swipeFeedback, setSwipeFeedback] = useState<'like' | 'skip' | 'super' | null>(null);

  // Reporting / Blocking state
  const [reportTarget, setReportTarget] = useState<MatchProfile | null>(null);

  // Dating Profile state
  const [isDatingActive, setIsDatingActive] = useState<boolean>(currentUser?.isDatingActive ?? true);
  const [editNickname, setEditNickname] = useState<string>(
    currentUser?.datingProfile?.nickname || currentUser?.fullName?.split(' ')[0] || 'Sahabat'
  );
  const [editAge, setEditAge] = useState<number>(currentUser?.datingProfile?.age || 28);
  const [editGoal, setEditGoal] = useState<RelationshipGoal>(
    currentUser?.datingProfile?.goal || 'Hubungan Serius'
  );
  const [editBio, setEditBio] = useState<string>(
    currentUser?.datingProfile?.bio || 'Mencari pasangan jujur, bertanggung jawab, dan siap melangkah ke jenjang pernikahan.'
  );
  const [editReligion, setEditReligion] = useState<string>(currentUser?.datingProfile?.religion || 'Islam');
  const [editJob, setEditJob] = useState<string>(currentUser?.datingProfile?.job || 'Caregiver / Asisten Lansia');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);

  // Filters state
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedGoalFilter, setSelectedGoalFilter] = useState<string>('all');
  const [selectedAgeMax, setSelectedAgeMax] = useState<number>(45);

  const currentDiamonds = currentUser?.matchDiamonds ?? diamondsCount;

  // Filter profiles
  const filteredProfiles = profiles.filter((p) => {
    if (selectedCountry !== 'all' && p.country !== selectedCountry) return false;
    if (selectedGoalFilter !== 'all' && p.goal !== selectedGoalFilter) return false;
    if (p.age > selectedAgeMax) return false;
    return true;
  });

  const currentProfile = filteredProfiles[currentIndex % (filteredProfiles.length || 1)];

  const handleToggleDating = async () => {
    if (!currentUser?.uid) {
      setIsDatingActive(!isDatingActive);
      return;
    }
    const newStatus = !isDatingActive;
    setIsDatingActive(newStatus);
    try {
      await toggleDatingStatus(currentUser.uid, newStatus);
    } catch (err) {
      console.error('Error toggling dating status:', err);
    }
  };

  const handleSaveDatingProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.uid) return;

    setIsSavingProfile(true);
    try {
      await updateDatingProfile(currentUser.uid, {
        nickname: editNickname.trim(),
        age: Number(editAge),
        goal: editGoal,
        bio: editBio.trim(),
        religion: editReligion,
        job: editJob.trim(),
      });
      setIsEditProfileModalOpen(false);
    } catch (err) {
      console.error('Error saving dating profile:', err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSkip = () => {
    setSwipeFeedback('skip');
    setTimeout(() => {
      setSwipeFeedback(null);
      setHistory((prev) => [...prev, currentIndex]);
      setCurrentIndex((prev) => (prev + 1) % (filteredProfiles.length || 1));
    }, 250);
  };

  const handleLike = async () => {
    if (!currentProfile) return;
    setSwipeFeedback('like');

    try {
      if (currentUser) {
        const res = await sendMatchLike(currentUser, currentProfile, false);
        if (res.isMutual) {
          setMatchedProfile(currentProfile);
          setIsMatchModalOpen(true);
        }
      } else {
        setMatchedProfile(currentProfile);
        setIsMatchModalOpen(true);
      }
    } catch (err) {
      console.error('Error sending match like:', err);
    }

    setTimeout(() => {
      setSwipeFeedback(null);
      setHistory((prev) => [...prev, currentIndex]);
      setCurrentIndex((prev) => (prev + 1) % (filteredProfiles.length || 1));
    }, 300);
  };

  const handleSuperLike = async () => {
    if (!currentProfile) return;
    if (currentDiamonds < 1) {
      alert('Token Match (💎) kamu sudah habis.');
      return;
    }

    setSwipeFeedback('super');
    try {
      if (currentUser) {
        const res = await sendMatchLike(currentUser, currentProfile, true);
        if (res.isMutual) {
          setMatchedProfile(currentProfile);
          setIsMatchModalOpen(true);
        }
      } else {
        setMatchedProfile(currentProfile);
        setIsMatchModalOpen(true);
      }
    } catch (err) {
      console.error('Error sending super like:', err);
    }

    setTimeout(() => {
      setSwipeFeedback(null);
      setHistory((prev) => [...prev, currentIndex]);
      setCurrentIndex((prev) => (prev + 1) % (filteredProfiles.length || 1));
    }, 300);
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const prevIndex = history[history.length - 1];
      setHistory((prev) => prev.slice(0, -1));
      setCurrentIndex(prevIndex);
    }
  };

  const handleNextProfile = () => {
    setIsMatchModalOpen(false);
    setCurrentIndex((prev) => (prev + 1) % (filteredProfiles.length || 1));
  };

  return (
    <div id="match-view" className="space-y-3 px-4 py-3 pb-10">
      {/* Top Header Row with Title, Diamonds, Toggle and Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight font-heading flex items-center gap-1.5">
            <span>Jodoh Sahabat</span>
            <span className="text-pink-500">❤️</span>
          </h1>
          <p className="text-xs text-slate-500">Koneksi cinta aman & terpercaya sesama PMI</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Diamonds Indicator 💎 */}
          <div
            id="match-diamond-indicator"
            className="flex items-center gap-1.5 bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200/80 px-2.5 py-1 rounded-full text-xs font-bold text-purple-800 shadow-xs"
          >
            <span className="text-xs">💎</span>
            <span>{currentDiamonds}</span>
          </div>

          {/* View Mode Switcher */}
          <button
            onClick={() => setViewMode(viewMode === 'card' ? 'grid' : 'card')}
            className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors shadow-xs cursor-pointer"
            title={viewMode === 'card' ? 'Tampilan Grid' : 'Tampilan Kartu Swipe'}
          >
            <Grid size={16} />
          </button>

          {/* Filter Button */}
          <button
            id="btn-match-filter"
            onClick={() => setIsFilterModalOpen(true)}
            className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors shadow-xs cursor-pointer"
            aria-label="Filter Kriteria Pasangan"
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Profile Active Status Bar & Edit Shortcut */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleToggleDating}
            className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
              isDatingActive ? 'bg-pink-500' : 'bg-slate-300'
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                isDatingActive ? 'left-4.5' : 'left-0.5'
              }`}
            />
          </button>
          <div>
            <p className="text-xs font-bold text-slate-800">
              {isDatingActive ? 'Profil Jodoh Aktif & Terlihat' : 'Profil Jodoh Dinonaktifkan'}
            </p>
            <p className="text-[10px] text-slate-400">
              {isDatingActive
                ? 'Profilmu dapat ditemukan oleh PMI terverifikasi'
                : 'Aktifkan untuk mulai mencari pasangan'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditProfileModalOpen(true)}
          className="text-xs font-bold text-pink-600 hover:bg-pink-50 px-2.5 py-1 rounded-xl flex items-center gap-1 border border-pink-200 cursor-pointer transition-colors"
        >
          <Edit size={12} />
          <span>Edit Biodata</span>
        </button>
      </div>

      {/* Anti-Fraud & Scam Warning Card (Safety Guidelines) */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-2xl p-3 shadow-xs">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsSafetyGuideOpen(!isSafetyGuideOpen)}
        >
          <div className="flex items-center gap-2 text-amber-900">
            <ShieldAlert size={18} className="text-amber-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold">Panduan Aman Berkenalan di Rekan Migran</h4>
              <p className="text-[10px] text-amber-700">Waspada penipuan, pinjam uang & akun palsu</p>
            </div>
          </div>
          <button className="text-amber-700">
            {isSafetyGuideOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {isSafetyGuideOpen && (
          <div className="mt-2.5 pt-2.5 border-t border-amber-200/70 text-[11px] text-amber-900/90 space-y-1.5 animate-in fade-in">
            <p className="flex items-start gap-1.5">
              <span className="text-rose-600 font-bold">🚫 1.</span>
              <span><strong>JANGAN PERNAH</strong> mentransfer uang, remitansi, atau memberikan nomor rekening kepada siapa pun yang baru Anda kenal.</span>
            </p>
            <p className="flex items-start gap-1.5">
              <span className="text-rose-600 font-bold">🚫 2.</span>
              <span>Waspadai modus investasi bodong, pinjaman online, atau janji manis penempatan kerja palsu.</span>
            </p>
            <p className="flex items-start gap-1.5">
              <span className="text-emerald-700 font-bold">🛡️ 3.</span>
              <span>Selalu lakukan Video Call untuk memastikan keaslian orang yang bersangkutan sebelum bertukar kontak pribadi.</span>
            </p>
            <p className="flex items-start gap-1.5">
              <span className="text-purple-700 font-bold">🚩 4.</span>
              <span>Segera gunakan tombol <strong>Laporkan Akun</strong> jika ada pengguna yang meminta uang atau bersikap mencurigakan.</span>
            </p>
          </div>
        )}
      </div>

      {/* Main Single Profile Card Display OR Grid View */}
      {viewMode === 'card' ? (
        currentProfile ? (
          <div className="relative">
            {/* Visual animation stamp when liking/skipping */}
            {swipeFeedback === 'like' && (
              <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none animate-in zoom-in-50 duration-200">
                <div className="bg-gradient-to-r from-pink-500 to-rose-600 text-white font-extrabold text-xl px-6 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border-2 border-white">
                  <Heart size={24} className="fill-white" /> SUKA!
                </div>
              </div>
            )}

            {swipeFeedback === 'skip' && (
              <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none animate-in zoom-in-50 duration-200">
                <div className="bg-slate-800 text-white font-extrabold text-xl px-6 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border-2 border-white">
                  LEWATI
                </div>
              </div>
            )}

            {swipeFeedback === 'super' && (
              <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none animate-in zoom-in-50 duration-200">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xl px-6 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border-2 border-white">
                  ⭐ SUPER LIKE!
                </div>
              </div>
            )}

            <MatchCard profile={currentProfile} />

            {/* Safety & Report Button beneath card */}
            <div className="flex items-center justify-between px-2 pt-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>Terverifikasi Paspor/ARC</span>
              </span>
              <button
                onClick={() => setReportTarget(currentProfile)}
                className="text-slate-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Flag size={12} />
                <span>Laporkan Profil</span>
              </button>
            </div>

            {/* Action Buttons: ↩, ❌, ❤️, ⭐ */}
            <MatchActionButtons
              onUndo={handleUndo}
              onSkip={handleSkip}
              onLike={handleLike}
              onSuperLike={handleSuperLike}
              canUndo={history.length > 0}
            />
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm space-y-3">
            <div className="w-16 h-16 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mx-auto text-2xl">
              ❤️
            </div>
            <h3 className="text-base font-bold text-slate-800">Semua Rekomendasi Sudah Dilihat</h3>
            <p className="text-xs text-slate-500">
              Kami terus memperbarui rekomendasi profil rekan PMI baru setiap harinya.
            </p>
            <button
              onClick={() => setCurrentIndex(0)}
              className="px-5 py-2.5 bg-purple-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 mx-auto hover:bg-purple-700 transition-colors shadow-xs cursor-pointer"
            >
              <RotateCcw size={14} /> Muat Ulang Profil
            </button>
          </div>
        )
      ) : (
        /* Grid Gallery View */
        <div className="grid grid-cols-2 gap-3">
          {filteredProfiles.map((p, idx) => (
            <div
              key={p.id}
              onClick={() => {
                setCurrentIndex(idx);
                setViewMode('card');
              }}
              className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden cursor-pointer hover:border-pink-300 hover:shadow-md transition-all group"
            >
              <div className="h-44 relative bg-slate-100 overflow-hidden">
                <img
                  src={p.photo}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 text-white">
                  <h4 className="text-xs font-bold flex items-center gap-1">
                    <span>{p.name}, {p.age}</span>
                    <VerifiedBadge size="sm" />
                  </h4>
                  <p className="text-[10px] text-purple-200">{p.city}, {p.country} {p.countryFlag}</p>
                </div>
              </div>
              <div className="p-2.5">
                <span className="text-[10px] font-semibold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200">
                  {p.goal}
                </span>
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">{p.job}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Celebration Modal "It's a Match! ❤️" */}
      <ItsAMatchModal
        isOpen={isMatchModalOpen}
        onClose={handleNextProfile}
        matchedProfile={matchedProfile}
        onStartChat={(prof) => {
          setIsMatchModalOpen(false);
          onStartChatWithProfile(prof);
        }}
      />

      {/* Report Modal */}
      {reportTarget && (
        <ReportModal
          isOpen={!!reportTarget}
          onClose={() => setReportTarget(null)}
          targetType="dating"
          targetId={reportTarget.id}
          targetName={reportTarget.name}
          currentUser={currentUser}
        />
      )}

      {/* Edit Dating Profile Modal */}
      <Modal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        title="Edit Biodata Jodoh"
        subtitle="Lengkapi informasi kriteria pasangan idealmu"
      >
        <form onSubmit={handleSaveDatingProfile} className="space-y-3 text-xs text-slate-700">
          <div>
            <label className="font-bold text-slate-800 block mb-1">Nama Panggilan:</label>
            <input
              type="text"
              value={editNickname}
              onChange={(e) => setEditNickname(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-pink-500 text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Usia:</label>
              <input
                type="number"
                min="18"
                max="65"
                value={editAge}
                onChange={(e) => setEditAge(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-pink-500 text-xs"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-800 block mb-1">Agama:</label>
              <input
                type="text"
                value={editReligion}
                onChange={(e) => setEditReligion(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-pink-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">Tujuan Hubungan:</label>
            <select
              value={editGoal}
              onChange={(e) => setEditGoal(e.target.value as RelationshipGoal)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-pink-500 text-xs"
            >
              <option value="Hubungan Serius">Hubungan Serius (Menuju Nikah)</option>
              <option value="Mencari Jodoh">Mencari Jodoh</option>
              <option value="Teman">Teman Curhat & Berbagi Cerita</option>
              <option value="Kenalan">Kenalan Sesama PMI</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">Pekerjaan di Perantauan:</label>
            <input
              type="text"
              value={editJob}
              onChange={(e) => setEditJob(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-pink-500 text-xs"
            />
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">Bio / Kriteria Pasangan:</label>
            <textarea
              rows={3}
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-pink-500 text-xs resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl font-bold text-xs shadow-md shadow-pink-500/30 flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-95"
            >
              <span>Simpan Biodata Jodoh</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Filter Modal */}
      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filter Pencarian Pasangan"
        subtitle="Sesuaikan kriteria jodoh idealmu"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-800 block mb-1">
              Batas Maksimal Usia: <span className="text-pink-600 font-extrabold">{selectedAgeMax} Tahun</span>
            </label>
            <input
              type="range"
              min="20"
              max="50"
              value={selectedAgeMax}
              onChange={(e) => setSelectedAgeMax(Number(e.target.value))}
              className="w-full accent-pink-600"
            />
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1.5">Negara Penempatan:</label>
            <div className="grid grid-cols-2 gap-1.5">
              {['all', 'Taiwan', 'Hong Kong', 'Singapura', 'Malaysia'].map((country) => (
                <button
                  key={country}
                  onClick={() => setSelectedCountry(country)}
                  className={`p-2 rounded-xl text-left border transition-colors cursor-pointer ${
                    selectedCountry === country
                      ? 'bg-pink-50 border-pink-500 text-pink-800 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {country === 'all' ? '🌏 Semua Negara' : country}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1.5">Tujuan Hubungan:</label>
            <div className="space-y-1.5">
              {['all', 'Hubungan Serius', 'Mencari Jodoh', 'Teman'].map((goal) => (
                <button
                  key={goal}
                  onClick={() => setSelectedGoalFilter(goal)}
                  className={`w-full p-2 rounded-xl text-left border transition-colors cursor-pointer ${
                    selectedGoalFilter === goal
                      ? 'bg-purple-50 border-purple-500 text-purple-800 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {goal === 'all' ? '✨ Semua Tujuan Hubungan' : goal}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setIsFilterModalOpen(false)}
              className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold text-xs shadow-md shadow-pink-600/30 transition-all cursor-pointer"
            >
              Terapkan Filter
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
