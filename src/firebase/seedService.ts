import {
  collection,
  doc,
  getDocs,
  setDoc,
  limit,
  query,
} from 'firebase/firestore';
import { db } from './config';
import { DEFAULT_COMMUNITIES } from './communityService';

/**
 * Initialize official public community groups if the collection is empty.
 * No dummy profiles or mock posts are injected.
 */
export async function seedInitialDataIfNeeded(): Promise<void> {
  try {
    const commCol = collection(db, 'communities');
    const commSnap = await getDocs(query(commCol, limit(1)));

    if (commSnap.empty) {
      for (const comm of DEFAULT_COMMUNITIES) {
        await setDoc(doc(db, 'communities', comm.id), comm);
      }
    }
  } catch (err) {
    console.warn('Community init note:', err);
  }
}


