import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';
import { NotificationItem } from '../types';
import { formatTimeAgo } from './postService';

/**
 * Subscribe to current user notifications in real-time
 */
export function subscribeToNotifications(
  userId: string,
  callback: (notifications: NotificationItem[]) => void
) {
  const notifQuery = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    notifQuery,
    (snapshot) => {
      const list: NotificationItem[] = snapshot.docs.map((d) => {
        const raw = d.data();
        return {
          id: d.id,
          userId: raw.userId,
          type: raw.type || 'system',
          title: raw.title,
          message: raw.message,
          timeAgo: formatTimeAgo(raw.createdAt),
          isRead: raw.read ?? false,
          avatar: raw.avatar,
          fromUserId: raw.fromUserId,
          createdAt: raw.createdAt,
        };
      });
      callback(list);
    },
    (err) => {
      console.warn('Error fetching notifications:', err);
      callback([]);
    }
  );
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(notifId: string): Promise<void> {
  const notifRef = doc(db, 'notifications', notifId);
  await updateDoc(notifRef, { read: true });
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string, notifs: NotificationItem[]): Promise<void> {
  const batch = writeBatch(db);
  notifs.forEach((n) => {
    if (!n.isRead) {
      const ref = doc(db, 'notifications', n.id);
      batch.update(ref, { read: true });
    }
  });
  await batch.commit();
}
