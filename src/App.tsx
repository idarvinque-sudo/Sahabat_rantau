/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppShell } from './components/common/AppShell';
import { TopBar } from './components/common/TopBar';
import { BottomNavigation } from './components/common/BottomNavigation';
import { Modal } from './components/common/Modal';
import { PostComposer } from './components/feed/PostComposer';
import { HomeView } from './views/HomeView';
import { FeedView } from './views/FeedView';
import { MatchView } from './views/MatchView';
import { ChatView } from './views/ChatView';
import { CommunityView } from './views/CommunityView';
import { NotificationView } from './views/NotificationView';
import { ProfileView } from './views/ProfileView';
import { AuthModal } from './components/auth/AuthModal';

import { Post, Story, MatchProfile, TabType, UserProfile, NotificationItem } from './types';
import { APP_CONFIG } from './config/appConfig';
import { Search } from 'lucide-react';

// Firebase Services
import { subscribeToAuth, logout } from './firebase/auth';
import { subscribeToUserProfile } from './firebase/userService';
import { subscribeToPosts, toggleLikePost, addCommentToPost } from './firebase/postService';
import { subscribeToMatchProfiles } from './firebase/matchService';
import { subscribeToNotifications } from './firebase/notifService';
import { seedInitialDataIfNeeded } from './firebase/seedService';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('beranda');

  // Firebase Real-time State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const [posts, setPosts] = useState<Post[]>([]);
  const [matchProfiles, setMatchProfiles] = useState<MatchProfile[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Chat recipient when transitioning from Match
  const [selectedChatRecipient, setSelectedChatRecipient] = useState<MatchProfile | null>(null);

  // 1. Initial Seeding and Auth listener
  useEffect(() => {
    seedInitialDataIfNeeded().catch(console.error);

    let unsubProfile: (() => void) | null = null;

    const unsubAuth = subscribeToAuth(async (firebaseUser) => {
      if (firebaseUser) {
        if (unsubProfile) unsubProfile();
        unsubProfile = subscribeToUserProfile(firebaseUser.uid, (profile) => {
          setCurrentUser(profile);
          setIsAuthLoading(false);
        });
      } else {
        if (unsubProfile) {
          unsubProfile();
          unsubProfile = null;
        }
        setCurrentUser(null);
        setIsAuthLoading(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  // 2. Real-time Posts Subscription from Firestore
  useEffect(() => {
    const currentUid = currentUser?.uid || '';
    const unsubPosts = subscribeToPosts(currentUid, (firestorePosts) => {
      setPosts(firestorePosts || []);
    });
    return () => unsubPosts();
  }, [currentUser?.uid]);

  // 3. Real-time Match Profiles Subscription from Firestore
  useEffect(() => {
    const currentUid = currentUser?.uid || '';
    const unsubMatch = subscribeToMatchProfiles(currentUid, (profiles) => {
      setMatchProfiles(profiles || []);
    });
    return () => unsubMatch();
  }, [currentUser?.uid]);

  // 4. Real-time Notifications Subscription
  useEffect(() => {
    if (currentUser?.uid) {
      const unsubNotifs = subscribeToNotifications(currentUser.uid, (notifs) => {
        setNotifications(notifs || []);
      });
      return () => unsubNotifs();
    } else {
      setNotifications([]);
    }
  }, [currentUser?.uid]);

  // Unread notification count
  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;

  const handleAddPost = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleLikeToggle = async (postId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const target = posts.find((p) => p.id === postId);
    const isLiked = !!target?.isLiked;

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              isLiked: !isLiked,
              likesCount: isLiked ? Math.max(0, p.likesCount - 1) : p.likesCount + 1,
            }
          : p
      )
    );

    try {
      await toggleLikePost(postId, currentUser, isLiked);
    } catch (err) {
      console.warn('Error toggling like:', err);
    }
  };

  const handleAddComment = async (postId: string, commentText: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    const newComment = {
      id: `comm_${Date.now()}`,
      userName: currentUser.fullName,
      userAvatar: currentUser.photoURL,
      timeAgo: 'Baru saja',
      text: commentText,
      likes: 0,
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            comments: [newComment, ...(p.comments || [])],
          };
        }
        return p;
      })
    );

    try {
      await addCommentToPost(postId, currentUser, commentText);
    } catch (err) {
      console.warn('Error adding comment:', err);
    }
  };

  const handleCreateStory = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const newStory: Story = {
      id: `story_${Date.now()}`,
      userName: currentUser.fullName,
      userAvatar: currentUser.photoURL,
      isUser: true,
      viewed: false,
      mediaUrl: currentUser.photoURL,
      caption: 'Halo rekan-rekan PMI di perantauan! 🇮🇩✨',
      location: `${currentUser.city} 🇹🇼`,
      timeAgo: 'Baru saja',
    };
    setStories((prev) => [newStory, ...prev.filter((s) => !s.isUser)]);
  };

  const handleStartChatFromMatch = (profile: MatchProfile) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setSelectedChatRecipient(profile);
    setActiveTab('pesan');
  };

  const currentBalance = currentUser?.balance ?? 0;

  return (
    <AppShell>
      {/* Universal Top Header */}
      <TopBar
        onOpenNotifications={() => setActiveTab('notifikasi')}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onProfileClick={() => setActiveTab('profil')}
        unreadCount={unreadNotifCount}
        currentUser={currentUser}
      />

      {/* Main View Router based on active tab */}
      {activeTab === 'beranda' && (
        <HomeView
          balance={currentBalance}
          currentUser={currentUser}
          stories={stories}
          posts={posts}
          onNavigateToMatch={() => setActiveTab('jodoh')}
          onNavigateToFeed={() => setActiveTab('feed')}
          onCreateStory={handleCreateStory}
          onLikeToggle={handleLikeToggle}
          onAddComment={handleAddComment}
          onOpenCommunity={() => setActiveTab('komunitas')}
          onOpenJobs={() => alert('Membuka direktori lowongan resmi & terverifikasi BP2MI.')}
        />
      )}

      {activeTab === 'feed' && (
        <FeedView
          posts={posts}
          currentUser={currentUser}
          onAddPost={handleAddPost}
          onLikeToggle={handleLikeToggle}
          onAddComment={handleAddComment}
        />
      )}

      {activeTab === 'jodoh' && (
        <MatchView
          profiles={matchProfiles}
          diamondsCount={currentUser?.matchDiamonds ?? 0}
          currentUser={currentUser}
          onStartChatWithProfile={handleStartChatFromMatch}
        />
      )}

      {activeTab === 'komunitas' && (
        <CommunityView
          currentUser={currentUser}
          onOpenCreatePost={() => setIsCreateModalOpen(true)}
          onNavigateToFeed={() => setActiveTab('feed')}
        />
      )}

      {activeTab === 'pesan' && (
        <ChatView
          initialRecipient={selectedChatRecipient}
          currentUser={currentUser}
        />
      )}

      {activeTab === 'notifikasi' && (
        <NotificationView
          notifications={notifications}
          currentUser={currentUser}
          onNavigateToTab={(tab) => setActiveTab(tab)}
        />
      )}

      {activeTab === 'profil' && (
        <ProfileView
          currentUser={currentUser}
          onLogout={logout}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onNavigateToMatch={() => setActiveTab('jodoh')}
        />
      )}

      {/* Fixed Modern Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'pesan') {
            setSelectedChatRecipient(null);
          }
        }}
        onOpenCreate={() => {
          if (!currentUser) {
            setIsAuthModalOpen(true);
            return;
          }
          setIsCreateModalOpen(true);
        }}
        unreadChatCount={0}
        unreadNotifCount={unreadNotifCount}
      />

      {/* Modal: Buat Postingan Baru (Floating + button action) */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Buat Postingan Baru"
        subtitle="Bagikan cerita, tips, atau sapa sahabat PMI"
      >
        <PostComposer
          currentUser={currentUser}
          onAddPost={(newPost) => {
            handleAddPost(newPost);
            setIsCreateModalOpen(false);
            setActiveTab('feed');
          }}
          isOpenAsModal={true}
          onCloseModal={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Modal: Pencarian Cepat */}
      <Modal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        title="Pencarian Sahabat PMI"
        subtitle="Cari teman, kota, tips kerja, atau komunitas"
      >
        <div className="space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ketik nama teman, kata kunci, atau topik..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-600"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Topik Populer Hari Ini:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {['#PMITaiwan', '#VictoriaPark', '#KulinerNusantara', '#KDEITaipei', '#JodohPMI', '#TipsRemitansi'].map(
                (tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearchQuery(tag);
                      setIsSearchModalOpen(false);
                      setActiveTab('feed');
                    }}
                    className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium px-2.5 py-1 rounded-full border border-purple-200 transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Auth Modal for Login / Register */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setIsAuthModalOpen(false)}
      />
    </AppShell>
  );
}
