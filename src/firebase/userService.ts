import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  collection,
  deleteDoc,
  increment,
  arrayUnion,
  arrayRemove,
  writeBatch,
  query,
  where,
} from 'firebase/firestore';
import { db } from './config';
import { UserProfile, FriendRequest } from '../types';
import { APP_CONFIG } from '../config/appConfig';

/**
 * Subscribe to user profile document in real-time
 */
export function subscribeToUserProfile(
  uid: string,
  callback: (profile: UserProfile | null) => void
) {
  const userDocRef = doc(db, 'users', uid);
  return onSnapshot(
    userDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as UserProfile);
      } else {
        callback(null);
      }
    },
    (err) => {
      console.error('Error listening to user profile:', err);
      callback(null);
    }
  );
}

/**
 * Get user profile once
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userDocRef = doc(db, 'users', uid);
  const snap = await getDoc(userDocRef);
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }
  return null;
}

/**
 * Update user profile fields in Firestore
 */
export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Block a user
 */
export async function blockUser(currentUid: string, targetUid: string): Promise<void> {
  const userRef = doc(db, 'users', currentUid);
  await updateDoc(userRef, {
    blockedUsers: arrayUnion(targetUid),
  });
}

/**
 * Unblock a user
 */
export async function unblockUser(currentUid: string, targetUid: string): Promise<void> {
  const userRef = doc(db, 'users', currentUid);
  await updateDoc(userRef, {
    blockedUsers: arrayRemove(targetUid),
  });
}

/**
 * Ensure user document exists (e.g. for existing auth users)
 */
export async function ensureUserDocExists(
  uid: string,
  email: string,
  displayName?: string | null,
  photoURL?: string | null
): Promise<UserProfile> {
  const userDocRef = doc(db, 'users', uid);
  const snap = await getDoc(userDocRef);
  const nowIso = new Date().toISOString();

  if (snap.exists()) {
    return snap.data() as UserProfile;
  }

  const newProfile: UserProfile = {
    uid,
    fullName: displayName || 'Sahabat PMI',
    username: `@${(displayName || 'sahabatpmi').toLowerCase().replace(/\s+/g, '')}`,
    email: email || '',
    photoURL: photoURL || APP_CONFIG.DEFAULT_AVATAR,
    coverURL: APP_CONFIG.DEFAULT_COVER,
    bio: 'Pekerja Migran Indonesia penuh semangat & saling mendukung sesama pejuang devisa ❤️',
    gender: 'female',
    age: 25,
    country: 'Taiwan',
    city: 'Taipei',
    occupation: 'Caregiver / Pekerja Migran Indonesia',
    relationshipStatus: 'Lajang',
    verified: false,
    verificationStatus: 'unverified',
    premium: false,
    premiumUntil: null,
    balance: 0,
    matchDiamonds: 5,
    isDatingActive: true,
    createdAt: nowIso,
    updatedAt: nowIso,
    lastActive: nowIso,
    online: true,
    followersCount: 0,
    followingCount: 0,
    friendsCount: 0,
    postsCount: 0,
    likesReceived: 0,
    matchCount: 0,
    blockedUsers: [],
  };

  await setDoc(userDocRef, newProfile);
  return newProfile;
}

/**
 * Follow or Unfollow another user
 */
export async function toggleFollowUser(
  currentUid: string,
  targetUid: string,
  isCurrentlyFollowing: boolean
): Promise<void> {
  if (currentUid === targetUid) return;

  const batch = writeBatch(db);
  const myFollowingRef = doc(db, 'users', currentUid, 'following', targetUid);
  const targetFollowerRef = doc(db, 'users', targetUid, 'followers', currentUid);
  const myProfileRef = doc(db, 'users', currentUid);
  const targetProfileRef = doc(db, 'users', targetUid);

  if (isCurrentlyFollowing) {
    batch.delete(myFollowingRef);
    batch.delete(targetFollowerRef);
    batch.update(myProfileRef, { followingCount: increment(-1) });
    batch.update(targetProfileRef, { followersCount: increment(-1) });
  } else {
    const nowIso = new Date().toISOString();
    batch.set(myFollowingRef, { targetUid, createdAt: nowIso });
    batch.set(targetFollowerRef, { followerUid: currentUid, createdAt: nowIso });
    batch.update(myProfileRef, { followingCount: increment(1) });
    batch.update(targetProfileRef, { followersCount: increment(1) });
  }

  await batch.commit();
}

/**
 * Check if current user is following target user
 */
export async function checkIsFollowing(
  currentUid: string,
  targetUid: string
): Promise<boolean> {
  if (!currentUid || !targetUid) return false;
  const myFollowingRef = doc(db, 'users', currentUid, 'following', targetUid);
  const snap = await getDoc(myFollowingRef);
  return snap.exists();
}

/**
 * Send Friend Request
 */
export async function sendFriendRequest(
  currentUser: UserProfile,
  targetUser: { uid: string; fullName: string }
): Promise<void> {
  const reqRef = doc(db, 'users', targetUser.uid, 'friendRequests', currentUser.uid);
  const nowIso = new Date().toISOString();

  await setDoc(reqRef, {
    fromUserId: currentUser.uid,
    toUserId: targetUser.uid,
    fromUserName: currentUser.fullName,
    fromUserAvatar: currentUser.photoURL,
    fromUserCountry: currentUser.country,
    status: 'pending',
    createdAt: nowIso,
  });

  // Create notification
  const notifRef = doc(collection(db, 'notifications'));
  await setDoc(notifRef, {
    userId: targetUser.uid,
    type: 'friend_request',
    fromUserId: currentUser.uid,
    title: '🤝 Permintaan Pertemanan Baru',
    message: `${currentUser.fullName} ingin berteman denganmu di platform PMI.`,
    avatar: currentUser.photoURL,
    read: false,
    createdAt: nowIso,
  });
}

/**
 * Accept Friend Request
 */
export async function acceptFriendRequest(
  currentUser: UserProfile,
  fromUserId: string,
  fromUserName: string,
  fromUserAvatar: string
): Promise<void> {
  const batch = writeBatch(db);
  const nowIso = new Date().toISOString();

  // Delete the request
  const reqRef = doc(db, 'users', currentUser.uid, 'friendRequests', fromUserId);
  batch.delete(reqRef);

  // Add to friends subcollections
  const myFriendRef = doc(db, 'users', currentUser.uid, 'friends', fromUserId);
  const otherFriendRef = doc(db, 'users', fromUserId, 'friends', currentUser.uid);

  batch.set(myFriendRef, { friendUid: fromUserId, name: fromUserName, avatar: fromUserAvatar, createdAt: nowIso });
  batch.set(otherFriendRef, { friendUid: currentUser.uid, name: currentUser.fullName, avatar: currentUser.photoURL, createdAt: nowIso });

  // Increment friendsCount
  const myProfileRef = doc(db, 'users', currentUser.uid);
  const otherProfileRef = doc(db, 'users', fromUserId);
  batch.update(myProfileRef, { friendsCount: increment(1) });
  batch.update(otherProfileRef, { friendsCount: increment(1) });

  await batch.commit();

  // Notify the other user
  const notifRef = doc(collection(db, 'notifications'));
  await setDoc(notifRef, {
    userId: fromUserId,
    type: 'friend_accepted',
    fromUserId: currentUser.uid,
    title: '🎉 Permintaan Pertemanan Diterima!',
    message: `${currentUser.fullName} telah menerima permintaan pertemananmu.`,
    avatar: currentUser.photoURL,
    read: false,
    createdAt: nowIso,
  });
}
