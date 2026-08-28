import React, { useState } from 'react';
import { Plus, ChevronRight, X, Heart, Send } from 'lucide-react';
import { Story } from '../../types';
import { APP_CONFIG } from '../../config/appConfig';

interface StoryListProps {
  stories: Story[];
  onCreateStory: () => void;
}

export const StoryList: React.FC<StoryListProps> = ({ stories, onCreateStory }) => {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [storyLiked, setStoryLiked] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>('');

  const handleOpenStory = (story: Story) => {
    setSelectedStory(story);
    setStoryLiked(false);
    setReplyText('');
  };

  return (
    <div id="story-list-section" className="py-2">
      {/* Header */}
      <div className="flex items-center justify-between px-4 mb-2">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 font-heading">
          <span>Cerita Temanmu</span>
          <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
        </h2>
        <button
          onClick={() => handleOpenStory(stories[1] || stories[0])}
          className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-0.5 cursor-pointer"
        >
          Lihat Semua <ChevronRight size={14} />
        </button>
      </div>

      {/* Horizontal Carousel */}
      <div className="flex items-center gap-3.5 overflow-x-auto px-4 py-1 no-scrollbar">
        {/* "Buat Cerita" Item */}
        <button
          id="btn-create-story"
          onClick={onCreateStory}
          className="flex flex-col items-center shrink-0 group cursor-pointer"
        >
          <div className="relative w-15 h-15 rounded-full p-0.5 border-2 border-dashed border-purple-300 group-hover:border-purple-500 transition-colors">
            <img
              src={APP_CONFIG.DEFAULT_AVATAR}
              alt="Profil Saya"
              className="w-full h-full rounded-full object-cover"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-gradient-to-tr from-purple-600 to-pink-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow-xs group-hover:scale-110 transition-transform">
              <Plus size={12} className="stroke-[3px]" />
            </div>
          </div>
          <span className="text-[11px] font-semibold text-slate-700 mt-1 max-w-[64px] truncate text-center">
            Buat Cerita
          </span>
        </button>

        {/* Stories from Friends: Rina, Dewi, Yuni, Tika */}
        {stories.filter(s => !s.isUser).map((story) => (
          <button
            key={story.id}
            id={`story-item-${story.id}`}
            onClick={() => handleOpenStory(story)}
            className="flex flex-col items-center shrink-0 group cursor-pointer"
          >
            <div
              className={`w-15 h-15 rounded-full p-0.5 transition-transform group-hover:scale-105 ${
                story.viewed
                  ? 'border-2 border-slate-200'
                  : 'bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 p-[2.5px]'
              }`}
            >
              <div className="w-full h-full rounded-full bg-white p-0.5 overflow-hidden">
                <img
                  src={story.userAvatar}
                  alt={story.userName}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            <span className="text-[11px] font-medium text-slate-700 mt-1 max-w-[64px] truncate text-center">
              {story.userName}
            </span>
          </button>
        ))}
      </div>

      {/* Story Viewer Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="relative w-full max-w-sm h-full sm:h-[650px] bg-slate-900 sm:rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl">
            {/* Story Top Progress Bar */}
            <div className="absolute top-0 left-0 right-0 z-20 p-4 space-y-2.5 bg-gradient-to-b from-black/70 to-transparent">
              <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full animate-[progress_5s_linear]" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-white">
                  <img
                    src={selectedStory.userAvatar}
                    alt={selectedStory.userName}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-400"
                  />
                  <div>
                    <p className="text-xs font-bold">{selectedStory.userName}</p>
                    <p className="text-[10px] text-white/80">
                      {selectedStory.location || 'Taipei'} • {selectedStory.timeAgo || 'Baru saja'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStory(null)}
                  className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Story Main Image */}
            <div className="w-full h-full flex items-center justify-center overflow-hidden">
              <img
                src={selectedStory.mediaUrl}
                alt="Story"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Story Caption & Bottom Interaction */}
            <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent space-y-3">
              {selectedStory.caption && (
                <p className="text-xs text-white bg-black/40 backdrop-blur-xs p-2.5 rounded-xl border border-white/10 font-medium">
                  {selectedStory.caption}
                </p>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Kirim pesan ke ${selectedStory.userName}...`}
                  className="flex-1 bg-white/20 border border-white/30 text-white text-xs px-3.5 py-2.5 rounded-full placeholder-white/70 focus:outline-none focus:bg-white/30 backdrop-blur-xs"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && replyText.trim()) {
                      alert(`Pesan terkirim ke ${selectedStory.userName}!`);
                      setReplyText('');
                    }
                  }}
                />
                <button
                  onClick={() => setStoryLiked(!storyLiked)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    storyLiked ? 'bg-rose-500 text-white scale-110' : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <Heart size={18} className={storyLiked ? 'fill-white' : ''} />
                </button>
                <button
                  onClick={() => {
                    if (replyText.trim()) {
                      alert(`Pesan terkirim ke ${selectedStory.userName}!`);
                      setReplyText('');
                    }
                  }}
                  className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
