import React, { useState, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Bookmark,
  Send,
  CornerDownRight,
  ShieldAlert,
  UserX,
  Copy,
  Check,
  Sparkles,
  Flag,
} from 'lucide-react';
import { Post, PostComment, UserProfile, ReactionType } from '../../types';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { Modal } from '../common/Modal';
import {
  subscribeToPostComments,
  addCommentToPost,
  setPostReaction,
  toggleLikePost,
} from '../../firebase/postService';
import { toggleFollowUser, checkIsFollowing } from '../../firebase/userService';
import { reportTarget, blockUser } from '../../firebase/matchService';

interface PostCardProps {
  post: Post;
  currentUser?: UserProfile | null;
  onLikeToggle?: (postId: string) => void;
  onAddComment?: (postId: string, commentText: string) => void;
  onOpenReport?: (targetType: 'post' | 'user', targetId: string, targetName: string) => void;
}

const REACTION_ICONS: Record<ReactionType, { emoji: string; label: string; color: string }> = {
  love: { emoji: '❤️', label: 'Cinta', color: 'text-rose-600' },
  like: { emoji: '👍', label: 'Suka', color: 'text-blue-600' },
  care: { emoji: '🤗', label: 'Peduli', color: 'text-amber-500' },
  haha: { emoji: '😆', label: 'Haha', color: 'text-yellow-500' },
  wow: { emoji: '😮', label: 'Kagum', color: 'text-yellow-600' },
  sad: { emoji: '😢', label: 'Sedih', color: 'text-blue-400' },
  support: { emoji: '💪', label: 'Semangat', color: 'text-purple-600' },
};

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  onLikeToggle,
  onAddComment,
  onOpenReport,
}) => {
  const [selectedReaction, setSelectedReaction] = useState<ReactionType | null>(
    (post.userReaction as ReactionType) || (post.isLiked ? 'love' : null)
  );
  const [showReactionPicker, setShowReactionPicker] = useState<boolean>(false);
  const [reactionsMap, setReactionsMap] = useState<Record<string, number>>(post.reactionsCount || {});
  const [likesCount, setLikesCount] = useState<number>(post.likesCount || 0);

  const [isCommentModalOpen, setIsCommentModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  const [newCommentText, setNewCommentText] = useState<string>('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);
  const [commentsList, setCommentsList] = useState<PostComment[]>(post.comments || []);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  // Report Form State
  const [reportReason, setReportReason] = useState<string>('Penipuan');
  const [reportDesc, setReportDesc] = useState<string>('');
  const [reportSuccess, setReportSuccess] = useState<boolean>(false);

  useEffect(() => {
    setSelectedReaction((post.userReaction as ReactionType) || (post.isLiked ? 'love' : null));
    setReactionsMap(post.reactionsCount || {});
    setLikesCount(post.likesCount || 0);
  }, [post.userReaction, post.isLiked, post.reactionsCount, post.likesCount]);

  // Load comments when comment modal opens
  useEffect(() => {
    if (isCommentModalOpen && post.id) {
      const unsub = subscribeToPostComments(post.id, (comments) => {
        setCommentsList(comments);
      });
      return () => unsub();
    }
  }, [isCommentModalOpen, post.id]);

  // Check following state
  useEffect(() => {
    if (currentUser?.uid && post.author.id && post.author.id !== currentUser.uid) {
      checkIsFollowing(currentUser.uid, post.author.id).then(setIsFollowing);
    }
  }, [currentUser?.uid, post.author.id]);

  const totalReactions =
    Object.values(reactionsMap || {}).reduce(
      (a: number, b: any) => a + (typeof b === 'number' ? b : 0),
      0
    ) || likesCount;

  const handleSelectReaction = async (reaction: ReactionType) => {
    setShowReactionPicker(false);
    const prevReaction = selectedReaction;
    const isTogglingOff = prevReaction === reaction;
    const newReaction = isTogglingOff ? null : reaction;

    setSelectedReaction(newReaction);

    // Optimistic counts
    setReactionsMap((prev) => {
      const updated = { ...prev };
      if (prevReaction && updated[prevReaction]) {
        updated[prevReaction] = Math.max(0, (updated[prevReaction] || 1) - 1);
      }
      if (newReaction) {
        updated[newReaction] = (updated[newReaction] || 0) + 1;
      }
      return updated;
    });

    if (currentUser) {
      try {
        await setPostReaction(post.id, currentUser, newReaction, prevReaction);
      } catch (err) {
        console.error('Error setting reaction:', err);
      }
    }
  };

  const handleSendComment = async () => {
    if (!newCommentText.trim()) return;

    if (currentUser) {
      try {
        await addCommentToPost(
          post.id,
          currentUser,
          newCommentText.trim(),
          replyingTo ? replyingTo.id : undefined
        );
      } catch (err) {
        console.error('Error adding comment:', err);
      }
    } else {
      const newComment: PostComment = {
        id: `comm_${Date.now()}`,
        userName: 'Siti Nurhaliza',
        userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
        timeAgo: 'Baru saja',
        text: newCommentText.trim(),
        likes: 0,
        replyToId: replyingTo?.id,
        replyToName: replyingTo?.name,
      };
      setCommentsList((prev) => [newComment, ...prev]);
    }

    if (onAddComment) {
      onAddComment(post.id, newCommentText.trim());
    }
    setNewCommentText('');
    setReplyingTo(null);
  };

  const handleToggleFollow = async () => {
    if (!currentUser?.uid || !post.author.id || currentUser.uid === post.author.id) return;
    const nextFollow = !isFollowing;
    setIsFollowing(nextFollow);
    try {
      await toggleFollowUser(currentUser.uid, post.author.id, isFollowing);
    } catch (err) {
      console.error('Error follow:', err);
    }
  };

  const handleCopyLink = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleReportSubmit = async () => {
    if (!currentUser) return;
    try {
      await reportTarget(
        currentUser.uid,
        'post',
        post.id,
        post.author.name,
        reportReason as any,
        reportDesc
      );
      setReportSuccess(true);
      setTimeout(() => {
        setIsReportModalOpen(false);
        setReportSuccess(false);
        setReportDesc('');
      }, 1500);
    } catch (err) {
      console.error('Error reporting post:', err);
    }
  };

  const handleBlockAuthor = async () => {
    if (!currentUser || !post.author.id) return;
    if (confirm(`Apakah Anda yakin ingin memblokir ${post.author.name}? Konten dari akun ini tidak akan ditampilkan lagi.`)) {
      try {
        await blockUser(currentUser.uid, post.author.id);
        setIsMenuOpen(false);
        alert(`Pengguna ${post.author.name} berhasil diblokir.`);
      } catch (err) {
        console.error('Error blocking user:', err);
      }
    }
  };

  const isOwnPost = currentUser?.uid === post.author.id;

  // Active reaction button details
  const activeReactionConfig = selectedReaction ? REACTION_ICONS[selectedReaction] : null;

  return (
    <article
      id={`post-card-${post.id}`}
      className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden transition-all hover:shadow-md mb-3"
    >
      {/* Post Header: Avatar, Name, Verified Badge, Time, Location */}
      <div className="p-3.5 flex items-start justify-between relative">
        <div className="flex items-center gap-3">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-100"
          />
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                {post.author.name}
              </span>
              {post.author.isVerified && <VerifiedBadge size="sm" />}
              {post.countryFlag && (
                <span className="text-xs" title={post.country}>{post.countryFlag}</span>
              )}

              {!isOwnPost && currentUser && (
                <button
                  onClick={handleToggleFollow}
                  className={`ml-1 text-[11px] font-bold px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                    isFollowing
                      ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                  }`}
                >
                  {isFollowing ? 'Mengikuti' : '+ Ikuti'}
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <span>{post.createdAt}</span>
              <span>•</span>
              <span className="font-medium text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded">
                {post.locationText || `${post.country || 'PMI Global'}`}
              </span>
              {post.category && (
                <>
                  <span>•</span>
                  <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded font-medium">
                    {post.category}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsSaved(!isSaved)}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              isSaved ? 'text-purple-600 bg-purple-50' : 'text-slate-400 hover:text-slate-600'
            }`}
            aria-label="Simpan Postingan"
          >
            <Bookmark size={17} className={isSaved ? 'fill-purple-600' : ''} />
          </button>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Menu Opsi Postingan"
          >
            <MoreHorizontal size={18} />
          </button>
        </div>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute right-3 top-12 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-30 text-xs font-semibold animate-in fade-in zoom-in-95">
            <button
              onClick={() => {
                setIsMenuOpen(false);
                handleCopyLink();
              }}
              className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-purple-50 flex items-center gap-2 cursor-pointer"
            >
              <Copy size={14} className="text-slate-400" />
              <span>Salin Tautan</span>
            </button>

            {!isOwnPost && (
              <>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsReportModalOpen(true);
                  }}
                  className="w-full px-3.5 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                >
                  <ShieldAlert size={14} />
                  <span>Laporkan Konten</span>
                </button>

                <button
                  onClick={handleBlockAuthor}
                  className="w-full px-3.5 py-2 text-left text-slate-600 hover:bg-slate-50 flex items-center gap-2 cursor-pointer border-t border-slate-100"
                >
                  <UserX size={14} className="text-slate-400" />
                  <span>Blokir {post.author.name}</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Post Caption / Text Content */}
      <div className="px-3.5 pb-3">
        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-normal">
          {post.content}
        </p>
      </div>

      {/* Post Photo (if present) */}
      {post.imageUrl && (
        <div className="w-full max-h-[380px] overflow-hidden bg-slate-100 relative">
          <img
            src={post.imageUrl}
            alt="Foto Postingan"
            className="w-full h-full object-cover select-none"
            loading="lazy"
          />
        </div>
      )}

      {/* Counts Row: Reactions, Comments, Shares */}
      <div className="px-4 py-2 border-b border-slate-50 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="flex -space-x-1 items-center">
            {Object.keys(reactionsMap).slice(0, 3).map((rKey) => (
              <span
                key={rKey}
                className="w-5 h-5 rounded-full bg-white shadow-xs border border-slate-100 flex items-center justify-center text-[11px]"
              >
                {REACTION_ICONS[rKey as ReactionType]?.emoji || '❤️'}
              </span>
            ))}
            {Object.keys(reactionsMap).length === 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px]">
                ❤️
              </span>
            )}
          </div>
          <span className="font-semibold text-slate-700 ml-1">{totalReactions}</span>
        </div>
        <div className="flex items-center gap-3">
          <span
            onClick={() => setIsCommentModalOpen(true)}
            className="cursor-pointer hover:underline"
          >
            {commentsList.length > 0 ? commentsList.length : post.commentsCount} Komentar
          </span>
          <span>•</span>
          <span>{post.sharesCount} Bagikan</span>
        </div>
      </div>

      {/* Action Buttons: Multi-Reaction Picker, Komentar, Bagikan */}
      <div className="px-2 py-1 grid grid-cols-3 gap-1 relative">
        {/* Floating Multi-Reaction Picker */}
        {showReactionPicker && (
          <div
            className="absolute -top-12 left-2 z-40 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-xl border border-purple-100 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150"
            onMouseLeave={() => setShowReactionPicker(false)}
          >
            {(Object.keys(REACTION_ICONS) as ReactionType[]).map((rKey) => {
              const item = REACTION_ICONS[rKey];
              return (
                <button
                  key={rKey}
                  onClick={() => handleSelectReaction(rKey)}
                  className="text-lg hover:scale-130 active:scale-95 transition-transform p-0.5 cursor-pointer"
                  title={item.label}
                >
                  {item.emoji}
                </button>
              );
            })}
          </div>
        )}

        {/* Reaction Button */}
        <button
          id={`btn-react-${post.id}`}
          onClick={() => {
            if (selectedReaction) {
              handleSelectReaction(selectedReaction);
            } else {
              handleSelectReaction('love');
            }
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            setShowReactionPicker(!showReactionPicker);
          }}
          onMouseEnter={() => setShowReactionPicker(true)}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeReactionConfig
              ? `${activeReactionConfig.color} bg-rose-50/80 scale-[1.02]`
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          {activeReactionConfig ? (
            <>
              <span className="text-sm">{activeReactionConfig.emoji}</span>
              <span>{activeReactionConfig.label}</span>
            </>
          ) : (
            <>
              <Heart size={17} />
              <span>Suka</span>
            </>
          )}
        </button>

        {/* Komentar */}
        <button
          id={`btn-comment-${post.id}`}
          onClick={() => setIsCommentModalOpen(true)}
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-purple-50/70 hover:text-purple-700 transition-colors cursor-pointer"
        >
          <MessageCircle size={17} />
          <span>Komentar</span>
        </button>

        {/* Bagikan */}
        <button
          id={`btn-share-${post.id}`}
          onClick={() => setIsShareModalOpen(true)}
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-purple-50/70 hover:text-purple-700 transition-colors cursor-pointer"
        >
          <Share2 size={17} />
          <span>Bagikan</span>
        </button>
      </div>

      {/* Comments Modal (Supports nested replies) */}
      <Modal
        isOpen={isCommentModalOpen}
        onClose={() => {
          setIsCommentModalOpen(false);
          setReplyingTo(null);
        }}
        title={`Komentar (${commentsList.length})`}
        subtitle={`Postingan oleh ${post.author.name}`}
      >
        <div className="space-y-4">
          {/* Comment list */}
          <div className="space-y-3 max-h-72 overflow-y-auto no-scrollbar pr-1">
            {commentsList.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-6">
                Belum ada komentar. Jadilah yang pertama memberikan semangat sesama PMI! 💬
              </p>
            ) : (
              commentsList.map((comm) => (
                <div
                  key={comm.id}
                  className={`flex items-start gap-2.5 ${comm.replyToId ? 'ml-6 border-l-2 border-purple-200 pl-2.5' : ''}`}
                >
                  <img
                    src={comm.userAvatar}
                    alt={comm.userName}
                    className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                  />
                  <div className="flex-1 bg-slate-50 p-2.5 rounded-2xl rounded-tl-none border border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-slate-800">{comm.userName}</span>
                        {comm.replyToName && (
                          <span className="text-[10px] text-purple-600 font-medium flex items-center gap-0.5">
                            <CornerDownRight size={10} /> balas @{comm.replyToName}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">{comm.timeAgo}</span>
                    </div>
                    <p className="text-xs text-slate-700 mt-1">{comm.text}</p>

                    <div className="flex items-center gap-3 mt-1.5">
                      <button
                        onClick={() => setReplyingTo({ id: comm.id, name: comm.userName })}
                        className="text-[10px] font-bold text-purple-600 hover:text-purple-800 cursor-pointer"
                      >
                        Balas
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Reply-to Banner */}
          {replyingTo && (
            <div className="flex items-center justify-between bg-purple-50 px-3 py-1.5 rounded-xl text-xs text-purple-700">
              <span>Membalas <b>@{replyingTo.name}</b></span>
              <button
                onClick={() => setReplyingTo(null)}
                className="text-purple-900 font-bold hover:underline cursor-pointer"
              >
                Batal
              </button>
            </div>
          )}

          {/* Comment Input */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder={replyingTo ? `Balas @${replyingTo.name}...` : "Tulis komentar positif sesama PMI..."}
              className="flex-1 px-3.5 py-2 rounded-full border border-slate-200 text-xs focus:outline-none focus:border-purple-600 bg-slate-50"
              onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
            />
            <button
              onClick={handleSendComment}
              disabled={!newCommentText.trim()}
              className="w-9 h-9 rounded-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </Modal>

      {/* Share Modal */}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="Bagikan Postingan"
        subtitle="Sebarkan informasi positif ke sesama rekan PMI"
      >
        <div className="space-y-3">
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-purple-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                {copiedLink ? <Check size={18} /> : <Share2 size={18} />}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {copiedLink ? 'Tautan Berhasil Disalin!' : 'Salin Tautan Postingan'}
                </p>
                <p className="text-[11px] text-slate-500">Kirim tautan ke WhatsApp / Telegram / Line</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-purple-600">
              {copiedLink ? '✓ Tersalin' : 'Salin'}
            </span>
          </button>

          <button
            onClick={() => {
              alert('Postingan berhasil dibagikan ke forum komunitas Pekerja Migran Indonesia!');
              setIsShareModalOpen(false);
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-purple-50 transition-colors text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-xs">
              👥
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Bagikan ke Komunitas PMI</p>
              <p className="text-[11px] text-slate-500">Tampilkan langsung di halaman Paguyuban</p>
            </div>
          </button>
        </div>
      </Modal>

      {/* Report Post Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Laporkan Postingan"
        subtitle="Bantu kami menjaga keamanan & kenyamanan komunitas PMI"
      >
        {reportSuccess ? (
          <div className="p-6 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
              ✓
            </div>
            <p className="text-sm font-bold text-slate-800">Laporan Berhasil Terkirim</p>
            <p className="text-xs text-slate-500">Tim moderator Rekan Migran akan meninjau konten ini dalam 1x24 jam.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Alasan Pelaporan:</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-purple-600"
              >
                <option value="Penipuan">Penipuan / Pinjaman Ilegal</option>
                <option value="Pelecehan">Pelecehan / Kata-kata Kasar</option>
                <option value="Informasi Palsu">Informasi Palsu / Hoaks</option>
                <option value="Spam">Spam / Promosi Berulang</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Penjelasan Tambahan (Opsional):</label>
              <textarea
                value={reportDesc}
                onChange={(e) => setReportDesc(e.target.value)}
                placeholder="Berikan konteks agar moderator dapat menindaklanjuti..."
                rows={3}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-purple-600"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleReportSubmit}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 cursor-pointer shadow-xs"
              >
                Kirim Laporan
              </button>
            </div>
          </div>
        )}
      </Modal>
    </article>
  );
};

