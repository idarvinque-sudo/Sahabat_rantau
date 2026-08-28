import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  increment,
  arrayUnion,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './config';
import { MatchProfile, DatingProfile, UserProfile, VerificationDocument } from '../types';
import { createOrGetChat } from './chatService';

/**
 * Subscribe to match/dating candidate profiles
 */
export function subscribeToMatchProfiles(
  currentUid: string,
  callback: (profiles: MatchProfile[]) => void,
  blockedUids: string[] = []
) {
  const matchCol = collection(db, 'datingProfiles');

  return onSnapshot(
    matchCol,
    (snapshot) => {
      const list: MatchProfile[] = [];
      snapshot.forEach((d) => {
        const raw = d.data();
        // Do not display current user or blocked users
        if (
          raw.userId !== currentUid &&
          d.id !== currentUid &&
          !blockedUids.includes(raw.userId || d.id) &&
          raw.isActive !== false
        ) {
          list.push({
            id: d.id,
            userId: raw.userId || d.id,
            name: raw.nickname || raw.name || 'Sahabat PMI',
            nickname: raw.nickname || raw.name || 'Sahabat PMI',
            age: raw.age || 28,
            gender: raw.gender || 'male',
            isOnline: raw.isOnline ?? true,
            isVerified: raw.isVerified ?? true,
            isActive: raw.isActive ?? true,
            country: raw.country || 'Taiwan',
            countryFlag: raw.countryFlag || '🇹🇼',
            city: raw.city || 'Taipei',
            job: raw.job || 'Caregiver',
            relationshipStatus: raw.relationshipStatus || 'Lajang',
            bio: raw.bio || 'Mencari pasangan hidup yang amanah, saling menghargai & berniat ibadah.',
            goal: raw.goal || 'Hubungan Serius',
            interests: raw.interests || ['Memasak', 'Jalan Santai', 'Pengajian'],
            languages: raw.languages || ['Indonesia', 'Mandarin'],
            partnerPreferences: raw.partnerPreferences || 'Pekerja keras, bertanggung jawab & setia.',
            religion: raw.religion || 'Islam',
            height: raw.height || '168 cm',
            smoking: raw.smoking || 'Tidak Merokok',
            photo: raw.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
            additionalPhotos: raw.additionalPhotos || [],
            distance: raw.distance || `Domisili: ${raw.city || 'Taipei'}`,
            hobbies: raw.interests || ['Memasak', 'Kuliner', 'Olahraga'],
          });
        }
      });
      callback(list);
    },
    (err) => {
      console.warn('Error fetching match profiles:', err);
      callback([]);
    }
  );
}

/**
 * Save / Update user's Dating Profile
 */
export async function saveDatingProfile(
  user: UserProfile,
  datingData: Partial<DatingProfile>
): Promise<void> {
  const datingRef = doc(db, 'datingProfiles', user.uid);
  const nowIso = new Date().toISOString();

  const payload: Partial<DatingProfile> & { updatedAt: string; createdAt?: string } = {
    ...datingData,
    userId: user.uid,
    isVerified: user.verified,
    updatedAt: nowIso,
  };

  const snap = await getDoc(datingRef);
  if (!snap.exists()) {
    payload.createdAt = nowIso;
  }

  await setDoc(datingRef, payload, { merge: true });

  // Update user profile document flag
  const userRef = doc(db, 'users', user.uid);
  await updateDoc(userRef, {
    isDatingActive: datingData.isActive ?? true,
    datingProfile: payload,
  });
}

/**
 * Update Dating Profile by UID
 */
export async function updateDatingProfile(
  uid: string,
  datingData: Partial<DatingProfile>
): Promise<void> {
  const datingRef = doc(db, 'datingProfiles', uid);
  const nowIso = new Date().toISOString();

  await setDoc(datingRef, { ...datingData, updatedAt: nowIso }, { merge: true });

  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    datingProfile: datingData,
  });
}

/**
 * Toggle Dating Status
 */
export async function toggleDatingStatus(uid: string, isActive: boolean): Promise<void> {
  const datingRef = doc(db, 'datingProfiles', uid);
  await setDoc(datingRef, { isActive, updatedAt: new Date().toISOString() }, { merge: true });

  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { isDatingActive: isActive });
}

/**
 * Like a match profile. Check if mutual, create match & chat if mutual.
 */
export async function sendMatchLike(
  fromUser: UserProfile,
  targetProfile: MatchProfile,
  isSuperLike: boolean = false
): Promise<{ isMutual: boolean; matchId?: string; chatId?: string }> {
  const matchLikesCol = collection(db, 'matchLikes');
  const nowIso = new Date().toISOString();

  // 1. Record like
  await addDoc(matchLikesCol, {
    fromUserId: fromUser.uid,
    toUserId: targetProfile.userId || targetProfile.id,
    targetName: targetProfile.name,
    targetPhoto: targetProfile.photo,
    isSuperLike,
    createdAt: nowIso,
  });

  // If super like, deduct diamond from user profile
  if (isSuperLike && (fromUser.matchDiamonds ?? 0) > 0) {
    const userDocRef = doc(db, 'users', fromUser.uid);
    await updateDoc(userDocRef, {
      matchDiamonds: increment(-1),
    });
  }

  // 2. Check if mutual like exists in Firestore from targetUid to fromUser.uid
  const targetUid = targetProfile.userId || targetProfile.id;
  const q = query(
    matchLikesCol,
    where('fromUserId', '==', targetUid),
    where('toUserId', '==', fromUser.uid)
  );
  const reciprocalSnap = await getDocs(q);
  const isMutual = !reciprocalSnap.empty;

  if (isMutual) {
    const matchesCol = collection(db, 'matches');
    const matchDoc = await addDoc(matchesCol, {
      userIds: [fromUser.uid, targetUid],
      createdAt: nowIso,
      status: 'active',
      userProfiles: {
        [fromUser.uid]: {
          name: fromUser.fullName,
          photo: fromUser.photoURL,
          isVerified: fromUser.verified,
        },
        [targetUid]: {
          name: targetProfile.name,
          photo: targetProfile.photo,
          isVerified: targetProfile.isVerified,
        },
      },
    });

    const chatId = await createOrGetChat(
      fromUser,
      targetProfile,
      `Match baru terjalin! Ucapkan salam kenal hangat kepada ${targetProfile.name} ❤️`
    );

    const notifCol = collection(db, 'notifications');
    await addDoc(notifCol, {
      userId: fromUser.uid,
      type: 'match',
      fromUserId: targetUid,
      title: '🎉 Kalian Cocok! (It\'s a Match)',
      message: `Selamat! Kamu dan ${targetProfile.name} saling tertarik. Yuk mulai berkenalan dengan aman.`,
      avatar: targetProfile.photo,
      read: false,
      createdAt: nowIso,
    });

    return {
      isMutual: true,
      matchId: matchDoc.id,
      chatId,
    };
  }

  return { isMutual: false };
}

/**
 * Report an account, post, comment, message, or dating profile
 */
export async function reportTarget(
  reporterId: string,
  targetType: 'user' | 'post' | 'comment' | 'message' | 'dating',
  targetId: string,
  targetName: string,
  reason: any,
  description: string
): Promise<string> {
  const reportsCol = collection(db, 'reports');
  const nowIso = new Date().toISOString();

  const reportDoc = await addDoc(reportsCol, {
    reporterId,
    targetType,
    targetId,
    targetName: targetName || 'Target',
    reason,
    description: description.trim(),
    status: 'Pending',
    createdAt: nowIso,
  });

  return reportDoc.id;
}

export const submitReport = (
  reporterId: string,
  targetType: 'user' | 'post' | 'comment' | 'message' | 'dating',
  targetId: string,
  reason: any,
  description: string,
  targetName?: string
) => reportTarget(reporterId, targetType, targetId, targetName || 'Target', reason, description);

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
 * Submit Verification Request (KTP/Paspor/E-PMI/ARC)
 */
export async function submitVerification(
  user: UserProfile,
  data: {
    fullName: string;
    idNumber: string;
    documentType: 'KTP' | 'Paspor' | 'E-PMI' | 'ARC';
    country: string;
    documentImageUrl: string;
  }
): Promise<string> {
  const verifCol = collection(db, 'verificationRequests');
  const nowIso = new Date().toISOString();

  const docRef = await addDoc(verifCol, {
    userId: user.uid,
    fullName: data.fullName,
    idNumber: data.idNumber,
    documentType: data.documentType,
    country: data.country,
    documentImageUrl: data.documentImageUrl,
    status: 'pending',
    submittedAt: nowIso,
  });

  const userRef = doc(db, 'users', user.uid);
  await updateDoc(userRef, {
    verificationStatus: 'pending',
  });

  return docRef.id;
}

export async function requestVerification(
  userId: string,
  fullName: string,
  idNumber: string,
  documentType: 'KTP' | 'Paspor' | 'E-PMI' | 'ARC',
  country: string,
  documentImageUrl: string
): Promise<string> {
  const verifCol = collection(db, 'verificationRequests');
  const nowIso = new Date().toISOString();

  const docRef = await addDoc(verifCol, {
    userId,
    fullName,
    idNumber,
    documentType,
    country,
    documentImageUrl,
    status: 'pending',
    submittedAt: nowIso,
  });

  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    verificationStatus: 'pending',
  });

  return docRef.id;
}
