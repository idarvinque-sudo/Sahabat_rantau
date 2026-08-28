import React, { useState, useEffect } from 'react';
import { Users, Shield, Plus, MessageSquare, Check, Sparkles, MapPin, Search, ArrowRight } from 'lucide-react';
import { Community, UserProfile, Post } from '../types';
import { subscribeToCommunities, toggleCommunityMembership } from '../firebase/communityService';
import { Modal } from '../components/common/Modal';

interface CommunityViewProps {
  currentUser?: UserProfile | null;
  onOpenCreatePost?: () => void;
  onNavigateToFeed?: () => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  currentUser,
  onOpenCreatePost,
  onNavigateToFeed,
}) => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCommunityModal, setActiveCommunityModal] = useState<Community | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const currentUid = currentUser?.uid || 'user_siti';

  useEffect(() => {
    const unsub = subscribeToCommunities(currentUid, (comms) => {
      setCommunities(comms);
    });
    return () => unsub();
  }, [currentUid]);

  const categories = ['Semua', 'Negara Penempatan', 'Hukum & BP2MI', 'Kuliner & Hobi', 'Keuangan & Tabungan'];

  const filteredCommunities = communities.filter((c) => {
    if (selectedCategory !== 'Semua' && c.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleToggleJoin = async (community: Community) => {
    if (!currentUser?.uid) return;
    setTogglingId(community.id);
    try {
      await toggleCommunityMembership(currentUser.uid, community.id, !community.isJoined);
      if (activeCommunityModal?.id === community.id) {
        setActiveCommunityModal({
          ...activeCommunityModal,
          isJoined: !community.isJoined,
          membersCount: community.isJoined
            ? Math.max(0, community.membersCount - 1)
            : community.membersCount + 1,
        });
      }
    } catch (err) {
      console.error('Error toggling community membership:', err);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div id="community-view" className="space-y-4 px-4 py-3 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight font-heading flex items-center gap-2">
            <span>Komunitas PMI</span>
            <span className="text-xs px-2.5 py-0.5 bg-purple-100 text-purple-700 font-bold rounded-full">
              Resmi & Guyub
            </span>
          </h1>
          <p className="text-xs text-slate-500">Temukan paguyuban kawan sedaerah di perantauan</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari grup negara, topik kerja, hobi..."
          className="w-full bg-slate-100 border-none text-xs pl-9 pr-4 py-2.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
        />
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-purple-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Community Cards Grid / List */}
      <div className="space-y-3">
        {filteredCommunities.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-xs space-y-1">
            <p className="text-sm font-bold text-slate-700">Komunitas tidak ditemukan.</p>
            <p className="text-xs text-slate-400">Coba gunakan kata kunci pencarian yang lain.</p>
          </div>
        ) : (
          filteredCommunities.map((comm) => (
            <div
              key={comm.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden hover:border-purple-200 transition-all"
            >
              {/* Cover Image */}
              <div className="h-24 w-full relative bg-slate-200 overflow-hidden">
                <img
                  src={comm.coverImage}
                  alt={comm.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                <span className="absolute top-2.5 right-2.5 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {comm.category}
                </span>
              </div>

              {/* Body */}
              <div className="p-3.5 relative">
                {/* Avatar overlapping */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2.5">
                    <img
                      src={comm.avatar}
                      alt=""
                      className="w-11 h-11 rounded-xl object-cover ring-2 ring-white -mt-7 bg-white shadow-sm shrink-0"
                    />
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <span>{comm.name}</span>
                        <span>{comm.countryFlag}</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Users size={12} className="text-purple-600" />
                        <span>{comm.membersCount.toLocaleString()} Anggota</span>
                        <span>•</span>
                        <span>{comm.country}</span>
                      </p>
                    </div>
                  </div>

                  {/* Join / Joined Button */}
                  <button
                    onClick={() => handleToggleJoin(comm)}
                    disabled={togglingId === comm.id}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      comm.isJoined
                        ? 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                        : 'bg-purple-600 text-white hover:bg-purple-700 shadow-xs'
                    }`}
                  >
                    {comm.isJoined ? (
                      <>
                        <Check size={12} />
                        <span>Bergabung</span>
                      </>
                    ) : (
                      <>
                        <Plus size={12} />
                        <span>Gabung</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed line-clamp-2">
                  {comm.description}
                </p>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setActiveCommunityModal(comm)}
                    className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Lihat Aturan & Info</span>
                    <ArrowRight size={13} />
                  </button>

                  <button
                    onClick={() => {
                      if (onNavigateToFeed) onNavigateToFeed();
                    }}
                    className="text-xs text-slate-500 hover:text-purple-600 flex items-center gap-1 cursor-pointer"
                  >
                    <MessageSquare size={13} />
                    <span>Diskusi Grup</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Community Detail Modal */}
      {activeCommunityModal && (
        <Modal
          isOpen={!!activeCommunityModal}
          onClose={() => setActiveCommunityModal(null)}
          title={activeCommunityModal.name}
          subtitle={`Komunitas Resmi • ${activeCommunityModal.membersCount.toLocaleString()} Anggota`}
        >
          <div className="space-y-3.5 text-xs text-slate-700">
            <div className="rounded-xl overflow-hidden h-32 relative">
              <img
                src={activeCommunityModal.coverImage}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h4 className="font-bold text-slate-800 mb-1">Tentang Komunitas:</h4>
              <p className="leading-relaxed text-slate-600">{activeCommunityModal.description}</p>
            </div>

            {activeCommunityModal.rules && (
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                <h4 className="font-bold text-purple-900 mb-1.5 flex items-center gap-1.5">
                  <Shield size={14} className="text-purple-600" />
                  <span>Tata Tertib & Aturan Komunitas:</span>
                </h4>
                <ul className="space-y-1 list-disc list-inside text-purple-950/80 text-[11px]">
                  {activeCommunityModal.rules.map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => handleToggleJoin(activeCommunityModal)}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeCommunityModal.isJoined
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                }`}
              >
                {activeCommunityModal.isJoined ? 'Tinggalkan Grup' : 'Bergabung ke Komunitas'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
