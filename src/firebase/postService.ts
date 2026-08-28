import {
  collection,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  updateDoc,
  increment,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';
import { Post, PostComment, ReactionType, UserProfile, PostCategory } from '../types';

/**
 * Reaction metadata mapping
 */
export const REACTION_MAP: Record<ReactionType, { emoji: string; label: string; color: string }> = {
  like: { emoji: '👍', label: 'Mantap', color: 'text-blue-500' },
  love: { emoji: '❤️', label: 'Suka', color: 'text-pink-500' },
  care: { emoji: '🙏', label: 'Peduli', color: 'text-amber-500' },
  haha: { emoji: '😂', label: 'Haha', color: 'text-yellow-500' },
  wow: { emoji: '😮', label: 'Wow', color: 'text-amber-600' },
  sad: { emoji: '😢', label: 'Sedih', color: 'text-indigo-400' },
  support: { emoji: '💪', label: 'Semangat', color: 'text-purple-600' },
};

/**
 * Subscribe to posts list in real-time with reactions and categories
 */
export function subscribeToPosts(
  currentUid: string,
  callback: (posts: Post[]) => void,
  categoryFilter?: string
) {
  let postsQuery = query(
    collection(db, 'posts'),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  return onSnapshot(
    postsQuery,
    async (snapshot) => {
      const postsData: Post[] = [];

      for (const d of snapshot.docs) {
        const raw = d.data();

        // Check if current user reacted
        let userReaction: ReactionType | null = null;
        let isLiked = false;
        if (currentUid) {
          try {
            const reactionRef = doc(db, 'posts', d.id, 'reactions', currentUid);
            const reactionSnap = await getDoc(reactionRef);
            if (reactionSnap.exists()) {
              userReaction = reactionSnap.data().type as ReactionType;
              isLiked = true;
            } else {
              // Backward compatibility with likes collection
              const likeRef = doc(db, 'posts', d.id, 'likes', currentUid);
              const likeSnap = await getDoc(likeRef);
              if (likeSnap.exists()) {
                userReaction = 'love';
                isLiked = true;
              }
            }
          } catch {
            userReaction = null;
            isLiked = false;
          }
        }

        postsData.push({
          id: d.id,
          userId: raw.userId,
          author: {
            id: raw.userId || 'unknown',
            name: raw.authorName || 'Rekan PMI',
            fullName: raw.authorFullName || raw.authorName || 'Rekan PMI',
            username: raw.authorUsername || `@${(raw.authorName || 'pmi').toLowerCase().replace(/\s+/g, '')}`,
            avatar: raw.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
            location: raw.locationText || raw.location || 'Taiwan 🇹🇼',
            country: raw.country || 'Taiwan',
            countryFlag: raw.countryFlag || '🇹🇼',
            isVerified: raw.isVerified ?? true,
          },
          createdAt: formatTimeAgo(raw.createdAt),
          locationText: raw.locationText || raw.location || 'Taiwan 🇹🇼',
          content: raw.content || '',
          imageUrl: raw.imageUrl || raw.imageURL || undefined,
          videoUrl: raw.videoUrl || undefined,
          category: raw.category || 'Umum',
          visibility: raw.visibility || 'public',
          likesCount: raw.likesCount || 0,
          reactionsCount: raw.reactionsCount || { love: raw.likesCount || 0 },
          userReaction,
          commentsCount: raw.commentsCount || 0,
          sharesCount: raw.sharesCount || 0,
          isLiked,
          comments: [],
        });
      }

      callback(postsData);
    },
    (err) => {
      console.error('Error listening to posts:', err);
      callback([]);
    }
  );
}

/**
 * Create a new post in Firestore
 */
export async function createPost(
  user: UserProfile,
  content: string,
  locationText: string,
  imageUrl?: string,
  category: PostCategory | string = 'Umum',
  visibility: 'public' | 'friends' | 'private' = 'public',
  videoUrl?: string
): Promise<string> {
  const postsCol = collection(db, 'posts');
  const nowIso = new Date().toISOString();

  const countryFlagMap: Record<string, string> = {
    Taiwan: '🇹🇼',
    'Hong Kong': '🇭🇰',
    Singapura: '🇸🇬',
    Malaysia: '🇲🇾',
    'Arab Saudi': '🇸🇦',
    'Korea Selatan': '🇰🇷',
    Jepang: '🇯🇵',
    Indonesia: '🇮🇩',
  };

  const newPostDoc = await addDoc(postsCol, {
    userId: user.uid,
    authorName: user.fullName,
    authorFullName: user.fullName,
    authorUsername: user.username || `@${user.fullName.toLowerCase().replace(/\s+/g, '')}`,
    authorAvatar: user.photoURL,
    isVerified: user.verified,
    country: user.country,
    countryFlag: countryFlagMap[user.country] || '🇮🇩',
    content: content.trim(),
    locationText: locationText || `${user.city}, ${user.country}`,
    imageUrl: imageUrl || null,
    videoUrl: videoUrl || null,
    category: category || 'Umum',
    visibility,
    likesCount: 0,
    reactionsCount: {},
    commentsCount: 0,
    sharesCount: 0,
    createdAt: nowIso,
    updatedAt: nowIso,
  });

  // Increment user's postsCount
  try {
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      postsCount: increment(1),
    });
  } catch (err) {
    console.warn('Could not increment user postsCount:', err);
  }

  return newPostDoc.id;
}

/**
 * Delete a post (by author)
 */
export async function deletePost(postId: string, userId: string): Promise<void> {
  const postRef = doc(db, 'posts', postId);
  await deleteDoc(postRef);

  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      postsCount: increment(-1),
    });
  } catch (err) {
    console.warn('Could not decrement user postsCount:', err);
  }
}

/**
 * Set or switch reaction for a post (posts/{postId}/reactions/{uid})
 */
export async function setPostReaction(
  postId: string,
  user: UserProfile,
  reactionType: ReactionType | null,
  previousReaction?: ReactionType | null
): Promise<void> {
  const postRef = doc(db, 'posts', postId);
  const reactionRef = doc(db, 'posts', postId, 'reactions', user.uid);
  const batch = writeBatch(db);

  if (reactionType === null) {
    // Remove reaction
    batch.delete(reactionRef);
    const updates: Record<string, any> = {
      likesCount: increment(-1),
    };
    if (previousReaction) {
      updates[`reactionsCount.${previousReaction}`] = increment(-1);
    }
    batch.update(postRef, updates);
  } else {
    // Add or replace reaction
    batch.set(reactionRef, {
      userId: user.uid,
      userName: user.fullName,
      userAvatar: user.photoURL,
      type: reactionType,
      createdAt: new Date().toISOString(),
    });

    const updates: Record<string, any> = {
      [`reactionsCount.${reactionType}`]: increment(1),
    };

    if (previousReaction) {
      updates[`reactionsCount.${previousReaction}`] = increment(-1);
    } else {
      updates.likesCount = increment(1);
    }

    batch.update(postRef, updates);
  }

  await batch.commit();
}

/**
 * Toggle like for a post (legacy fallback)
 */
export async function toggleLikePost(
  postId: string,
  user: UserProfile,
  isCurrentlyLiked: boolean
): Promise<void> {
  if (isCurrentlyLiked) {
    await setPostReaction(postId, user, null, 'love');
  } else {
    await setPostReaction(postId, user, 'love', null);
  }
}

/**
 * Add a comment or nested reply to a post
 */
export async function addCommentToPost(
  postId: string,
  user: UserProfile,
  text: string,
  replyToId?: string
): Promise<void> {
  const commentsCol = collection(db, 'posts', postId, 'comments');
  const postRef = doc(db, 'posts', postId);
  const nowIso = new Date().toISOString();

  const batch = writeBatch(db);
  const newCommentRef = doc(commentsCol);

  batch.set(newCommentRef, {
    commentId: newCommentRef.id,
    userId: user.uid,
    userName: user.fullName,
    userAvatar: user.photoURL,
    isVerified: user.verified,
    text: text.trim(),
    createdAt: nowIso,
    likes: 0,
    replyToId: replyToId || null,
  });

  batch.update(postRef, {
    commentsCount: increment(1),
  });

  await batch.commit();
}

/**
 * Delete a comment
 */
export async function deleteComment(postId: string, commentId: string): Promise<void> {
  const commentRef = doc(db, 'posts', postId, 'comments', commentId);
  const postRef = doc(db, 'posts', postId);

  const batch = writeBatch(db);
  batch.delete(commentRef);
  batch.update(postRef, {
    commentsCount: increment(-1),
  });

  await batch.commit();
}

/**
 * Like a comment
 */
export async function likeComment(postId: string, commentId: string, currentLikes: number): Promise<void> {
  const commentRef = doc(db, 'posts', postId, 'comments', commentId);
  await updateDoc(commentRef, {
    likes: increment(1),
  });
}

/**
 * Subscribe to comments for a specific post
 */
export function subscribeToPostComments(
  postId: string,
  callback: (comments: PostComment[]) => void
) {
  const commentsQuery = query(
    collection(db, 'posts', postId, 'comments'),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(
    commentsQuery,
    (snapshot) => {
      const flatList: PostComment[] = snapshot.docs.map((d) => {
        const raw = d.data();
        return {
          id: d.id,
          userId: raw.userId,
          userName: raw.userName || 'Rekan PMI',
          userAvatar: raw.userAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
          timeAgo: formatTimeAgo(raw.createdAt),
          text: raw.text || raw.content || '',
          likes: raw.likes || 0,
          createdAt: raw.createdAt,
          replyToId: raw.replyToId || undefined,
          replies: [],
        };
      });

      // Organize top-level comments and nested replies
      const topLevel: PostComment[] = [];
      const replyMap = new Map<string, PostComment[]>();

      for (const item of flatList) {
        if (item.replyToId) {
          const arr = replyMap.get(item.replyToId) || [];
          arr.push(item);
          replyMap.set(item.replyToId, arr);
        } else {
          topLevel.push(item);
        }
      }

      for (const item of topLevel) {
        item.replies = replyMap.get(item.id) || [];
      }

      callback(topLevel);
    },
    (err) => {
      console.warn(`Error fetching comments for ${postId}:`, err);
      callback([]);
    }
  );
}

/**
 * Formats ISO date string to concise Indonesian time-ago
 */
export function formatTimeAgo(isoString?: string): string {
  if (!isoString) return 'Baru saja';
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} mnt lalu`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return new Date(isoString).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
}

