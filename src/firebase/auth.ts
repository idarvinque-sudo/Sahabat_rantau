import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './config';
import { UserProfile } from '../types';
import { APP_CONFIG } from '../config/appConfig';

/**
 * Maps Firebase Auth errors to user-friendly Indonesian messages
 */
export function getFriendlyAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/operation-not-allowed':
      return 'Layanan login Email/Password belum diaktifkan di Firebase Console. Pastikan Email/Password Provider aktif di Firebase Authentication.';
    case 'auth/invalid-email':
      return 'Format email tidak valid. Silakan periksa kembali alamat email Anda.';
    case 'auth/user-disabled':
      return 'Akun pengguna ini telah dinonaktifkan.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email atau kata sandi tidak sesuai. Silakan periksa kembali.';
    case 'auth/email-already-in-use':
      return 'Email ini sudah terdaftar. Silakan gunakan email lain atau langsung Masuk.';
    case 'auth/weak-password':
      return 'Kata sandi terlalu lemah. Minimal 6 karakter.';
    case 'auth/network-request-failed':
      return 'Koneksi jaringan terputus. Silakan periksa koneksi internet Anda dan coba lagi.';
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan masuk yang gagal. Silakan tunggu beberapa saat.';
    default:
      return 'Terjadi kendala autentikasi. Silakan periksa data Anda.';
  }
}

/**
 * Register a new real user with Email and Password and create their Firestore User profile
 */
export async function registerWithEmail(
  fullName: string,
  email: string,
  pass: string,
  details?: {
    country?: string;
    city?: string;
    occupation?: string;
    gender?: 'female' | 'male' | 'other';
    avatar?: string;
  }
): Promise<UserProfile> {
  const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  const fbUser = userCredential.user;
  const chosenAvatar = details?.avatar || APP_CONFIG.DEFAULT_AVATAR;

  // Update display name in Firebase Auth
  await updateProfile(fbUser, {
    displayName: fullName.trim(),
    photoURL: chosenAvatar,
  });

  const nowIso = new Date().toISOString();
  const username = `@${fullName.trim().toLowerCase().replace(/[^a-z0-9]/g, '') || 'sahabat'}_${Math.floor(1000 + Math.random() * 9000)}`;

  // Create real user document in Firestore users/{uid}
  const initialProfile: UserProfile = {
    uid: fbUser.uid,
    fullName: fullName.trim(),
    username,
    email: email.trim().toLowerCase(),
    photoURL: chosenAvatar,
    coverURL: APP_CONFIG.DEFAULT_COVER,
    bio: 'Pekerja Migran Indonesia penuh semangat & saling mendukung ❤️',
    gender: details?.gender || 'female',
    age: 27,
    country: details?.country || 'Taiwan',
    city: details?.city || 'Taipei',
    occupation: details?.occupation || 'Pekerja Migran Indonesia',
    verified: false,
    verificationStatus: 'unverified',
    premium: false,
    premiumUntil: null,
    balance: 0,
    matchDiamonds: 5,
    isDatingActive: false,
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

  const userDocRef = doc(db, 'users', fbUser.uid);
  await setDoc(userDocRef, initialProfile, { merge: true });

  return initialProfile;
}

/**
 * Sign in existing user with Email and Password
 */
export async function loginWithEmail(email: string, pass: string): Promise<FirebaseUser> {
  const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
  
  // Update lastActive timestamp
  try {
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    await updateDoc(userDocRef, {
      lastActive: new Date().toISOString(),
      online: true,
    });
  } catch (err) {
    console.warn('Could not update lastActive:', err);
  }

  return userCredential.user;
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
  if (auth.currentUser) {
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userDocRef, {
        online: false,
        lastActive: new Date().toISOString(),
      });
    } catch {
      // ignore
    }
  }
  await signOut(auth);
}

/**
 * Subscribe to auth state changes
 */
export function subscribeToAuth(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}
