import React from 'react';
import { BalanceCard } from '../components/home/BalanceCard';
import { QuickAction } from '../components/home/QuickAction';
import { StoryList } from '../components/home/StoryList';
import { RecommendationCard } from '../components/home/RecommendationCard';
import { PostCard } from '../components/feed/PostCard';
import { Post, Story, UserProfile } from '../types';
import { Sparkles, ArrowRight } from 'lucide-react';

interface HomeViewProps {
  balance: number;
  currentUser?: UserProfile | null;
  stories: Story[];
  posts: Post[];
  onNavigateToMatch: () => void;
  onNavigateToFeed: () => void;
  onCreateStory: () => void;
  onLikeToggle: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onOpenCommunity: () => void;
  onOpenJobs: () => void;
  onOpenChatWithAdmin?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  balance,
  currentUser,
  stories,
  posts,
  onNavigateToMatch,
  onNavigateToFeed,
  onCreateStory,
  onLikeToggle,
  onAddComment,
  onOpenCommunity,
  onOpenJobs,
  onOpenChatWithAdmin,
}) => {
  return (
    <div id="home-view" className="space-y-2 pb-6">
      {/* 1. Kartu Saldo */}
      <BalanceCard balance={balance} userId={currentUser?.uid} />

      {/* 2. Fitur Utama */}
      <QuickAction
        onNavigateToMatch={onNavigateToMatch}
        onOpenChatWithAdmin={onOpenChatWithAdmin}
        currentUser={currentUser}
      />

      {/* 3. Cerita Temanmu */}
      <StoryList stories={stories} onCreateStory={onCreateStory} />

      {/* 4. Rekomendasi Hari Ini */}
      <RecommendationCard
        onNavigateToMatch={onNavigateToMatch}
        onOpenCommunity={onOpenCommunity}
        onOpenJobs={onOpenJobs}
      />

      {/* 5. Postingan Terbaru (Social Media Preview) */}
      <div id="recent-posts-section" className="px-4 pt-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-bold text-slate-800 font-heading">
              Postingan Terbaru
            </h2>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
          </div>
          <button
            id="btn-view-all-feed"
            onClick={onNavigateToFeed}
            className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-0.5 cursor-pointer"
          >
            Buka Feed <ArrowRight size={14} />
          </button>
        </div>

        {/* Display latest posts or empty state */}
        <div className="space-y-3">
          {posts.length === 0 ? (
            <div className="p-6 bg-slate-50 border border-slate-200/80 rounded-2xl text-center space-y-2">
              <p className="text-xs font-semibold text-slate-700">Belum ada postingan terbaru</p>
              <p className="text-[11px] text-slate-400">
                Jadilah yang pertama berbagi cerita, info kerja, atau sapa sahabat PMI di seluruh dunia.
              </p>
              <button
                onClick={onNavigateToFeed}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-xs"
              >
                Buat Postingan Pertama
              </button>
            </div>
          ) : (
            posts.slice(0, 2).map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={currentUser}
                onLikeToggle={onLikeToggle}
                onAddComment={onAddComment}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
