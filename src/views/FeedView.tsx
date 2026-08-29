import React, { useState } from 'react';
import { SlidersHorizontal, Sparkles, Filter, Search, Tag } from 'lucide-react';
import { PostComposer } from '../components/feed/PostComposer';
import { PostCard } from '../components/feed/PostCard';
import { Post, UserProfile, PostCategory } from '../types';
import { Modal } from '../components/common/Modal';
import { ReportModal } from '../components/common/ReportModal';

interface FeedViewProps {
  posts: Post[];
  currentUser?: UserProfile | null;
  onAddPost: (newPost: Post) => void;
  onLikeToggle: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
}

const CATEGORIES: string[] = [
  'Semua',
  'Pengalaman PMI',
  'Tips Kerja',
  'Info Penting',
  'Tanya Jawab',
  'Curhat',
  'Hiburan',
  'Kuliner',
];

export const FeedView: React.FC<FeedViewProps> = ({
  posts,
  currentUser,
  onAddPost,
  onLikeToggle,
  onAddComment,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [activeTab, setActiveTab] = useState<'semua' | 'mengikuti' | 'komunitas'>('semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<string>('all');

  // Report modal state
  const [reportingData, setReportingData] = useState<{
    targetType: 'post' | 'user';
    targetId: string;
    targetName: string;
  } | null>(null);

  const filteredPosts = posts.filter((p) => {
    // Tab filtering
    if (activeTab === 'mengikuti' && p.author.id !== currentUser?.uid) {
      return false;
    }
    if (activeTab === 'komunitas' && p.category !== 'Komunitas') {
      return false;
    }

    // Category filtering
    if (activeCategory !== 'Semua') {
      if (p.category !== activeCategory) {
        return false;
      }
    }

    // Search query filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchContent = p.content.toLowerCase().includes(q);
      const matchAuthor = p.author.name.toLowerCase().includes(q);
      const matchLoc = p.locationText.toLowerCase().includes(q);
      if (!matchContent && !matchAuthor && !matchLoc) {
        return false;
      }
    }

    // Country filtering
    if (selectedCountryFilter !== 'all') {
      if (selectedCountryFilter === 'TW' && !p.locationText.includes('Taiwan')) return false;
      if (selectedCountryFilter === 'HK' && !p.locationText.includes('Hong Kong')) return false;
      if (selectedCountryFilter === 'SG' && !p.locationText.includes('Singapura')) return false;
      if (selectedCountryFilter === 'MY' && !p.locationText.includes('Malaysia')) return false;
    }
    return true;
  });

  return (
    <div id="feed-view" className="space-y-3 px-4 py-3 pb-10">
      {/* Top Header Row with Title & Filter button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight font-heading flex items-center gap-2">
            <span>Kabar Sahabat</span>
            <span className="text-xs px-2.5 py-0.5 bg-purple-100 text-purple-700 font-bold rounded-full">
              Feed PMI
            </span>
          </h1>
          <p className="text-xs text-slate-500">Cerita nyata, tips kerja & info sesama perantau</p>
        </div>

        <button
          id="btn-feed-filter"
          onClick={() => setIsFilterModalOpen(true)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
            selectedCountryFilter !== 'all'
              ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-purple-50'
          }`}
        >
          <SlidersHorizontal size={14} />
          <span>{selectedCountryFilter === 'all' ? 'Negara' : `Negara: ${selectedCountryFilter}`}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari topik, tips kerja, atau nama sahabat..."
          className="w-full bg-slate-100 border-none text-xs pl-9 pr-4 py-2.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
        />
      </div>

      {/* Tabs: Semua | Mengikuti | Komunitas */}
      <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1">
        <button
          id="tab-feed-semua"
          onClick={() => setActiveTab('semua')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'semua'
              ? 'bg-white text-purple-700 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Semua Feed
        </button>

        <button
          id="tab-feed-mengikuti"
          onClick={() => setActiveTab('mengikuti')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'mengikuti'
              ? 'bg-white text-purple-700 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Teman Sahabat
        </button>

        <button
          id="tab-feed-komunitas"
          onClick={() => setActiveTab('komunitas')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'komunitas'
              ? 'bg-white text-purple-700 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Komunitas
        </button>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-purple-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Post Creator / Composer */}
      <PostComposer onAddPost={onAddPost} currentUser={currentUser} />

      {/* Posts Feed Stream */}
      <div className="space-y-3">
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-xs space-y-1">
            <p className="text-sm font-bold text-slate-700">Belum ada postingan untuk kategori ini</p>
            <p className="text-xs text-slate-400">Jadilah yang pertama berbagi cerita hangat ❤️</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              onLikeToggle={onLikeToggle}
              onAddComment={onAddComment}
              onOpenReport={(type, id, name) =>
                setReportingData({ targetType: type, targetId: id, targetName: name })
              }
            />
          ))
        )}
      </div>

      {/* Universal Report Modal */}
      {reportingData && (
        <ReportModal
          isOpen={!!reportingData}
          onClose={() => setReportingData(null)}
          targetType={reportingData.targetType}
          targetId={reportingData.targetId}
          targetName={reportingData.targetName}
          currentUser={currentUser}
        />
      )}

      {/* Filter Modal */}
      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filter Lokasi Negara PMI"
        subtitle="Saring feed berdasarkan negara penempatan"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => {
                  setSelectedCountryFilter('all');
                  setIsFilterModalOpen(false);
                }}
                className={`p-2.5 rounded-xl font-semibold border text-left transition-all ${
                  selectedCountryFilter === 'all'
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-purple-50'
                }`}
              >
                🌏 Semua Negara
              </button>

              <button
                onClick={() => {
                  setSelectedCountryFilter('TW');
                  setIsFilterModalOpen(false);
                }}
                className={`p-2.5 rounded-xl font-semibold border text-left transition-all ${
                  selectedCountryFilter === 'TW'
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-purple-50'
                }`}
              >
                🇹🇼 Taiwan
              </button>

              <button
                onClick={() => {
                  setSelectedCountryFilter('HK');
                  setIsFilterModalOpen(false);
                }}
                className={`p-2.5 rounded-xl font-semibold border text-left transition-all ${
                  selectedCountryFilter === 'HK'
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-purple-50'
                }`}
              >
                🇭🇰 Hong Kong
              </button>

              <button
                onClick={() => {
                  setSelectedCountryFilter('SG');
                  setIsFilterModalOpen(false);
                }}
                className={`p-2.5 rounded-xl font-semibold border text-left transition-all ${
                  selectedCountryFilter === 'SG'
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-purple-50'
                }`}
              >
                🇸🇬 Singapura
              </button>

              <button
                onClick={() => {
                  setSelectedCountryFilter('MY');
                  setIsFilterModalOpen(false);
                }}
                className={`p-2.5 rounded-xl font-semibold border text-left transition-all ${
                  selectedCountryFilter === 'MY'
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-purple-50'
                }`}
              >
                🇲🇾 Malaysia
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
