import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';
import { db } from './config';
import { ChatConversation, ChatMessage, MatchProfile, UserProfile } from '../types';
import { APP_CONFIG } from '../config/appConfig';

/**
 * Subscribe to user's chat conversations in real-time
 */
export function subscribeToUserChats(
  currentUid: string,
  callback: (chats: ChatConversation[]) => void
) {
  const chatsQuery = query(
    collection(db, 'chats'),
    where('participants', 'array-contains', currentUid)
  );

  return onSnapshot(
    chatsQuery,
    (snapshot) => {
      const chats: ChatConversation[] = snapshot.docs.map((d) => {
        const raw = d.data();
        return {
          id: d.id,
          participants: raw.participants || [],
          participantDetails: raw.participantDetails || {},
          lastMessage: raw.lastMessage || 'Percakapan dimulai...',
          lastMessageAt: raw.lastMessageAt || new Date().toISOString(),
          unreadCount: raw.unreadCount || 0,
          createdAt: raw.createdAt || new Date().toISOString(),
        };
      });

      // Sort by lastMessageAt descending
      chats.sort(
        (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );

      callback(chats);
    },
    (err) => {
      console.warn('Error subscribing to chats:', err);
      callback([]);
    }
  );
}

/**
 * Subscribe to realtime messages in a specific chat
 */
export function subscribeToChatMessages(
  chatId: string,
  callback: (messages: ChatMessage[]) => void
) {
  const messagesQuery = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(
    messagesQuery,
    (snapshot) => {
      const msgs: ChatMessage[] = snapshot.docs.map((d) => {
        const raw = d.data();
        const dateObj = new Date(raw.createdAt);
        const timeStr = !isNaN(dateObj.getTime())
          ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'Baru saja';

        return {
          id: d.id,
          senderId: raw.senderId,
          text: raw.text,
          createdAt: raw.createdAt,
          time: timeStr,
          seen: raw.seen ?? true,
        };
      });
      callback(msgs);
    },
    (err) => {
      console.warn(`Error subscribing to messages for ${chatId}:`, err);
      callback([]);
    }
  );
}

import { APP_CONFIG } from '../config/appConfig';

/**
 * Send a message in a chat conversation
 */
export async function sendChatMessage(
  chatId: string,
  senderId: string,
  text: string,
  targetName?: string
): Promise<void> {
  const messagesCol = collection(db, 'chats', chatId, 'messages');
  const chatDocRef = doc(db, 'chats', chatId);
  const nowIso = new Date().toISOString();

  await addDoc(messagesCol, {
    senderId,
    text: text.trim(),
    createdAt: nowIso,
    seen: false,
  });

  await updateDoc(chatDocRef, {
    lastMessage: text.trim(),
    lastMessageAt: nowIso,
  });

  // If chatting with Admin Agnesya Kartika, provide an automatic helpful reassurance reply
  if (
    targetName?.toLowerCase().includes('agnesya') ||
    chatId.includes(APP_CONFIG.ADMIN.UID) ||
    chatId.includes('agnesya')
  ) {
    setTimeout(async () => {
      try {
        const replyText =
          `Halo, pesan Anda sudah kami terima secara privat. Admin ${APP_CONFIG.ADMIN.NAME} sedang meninjau dan akan segera membalas konsultasi/bantuan Anda. Tetap tenang dan jaga keselamatan ya!`;
        await addDoc(messagesCol, {
          senderId: APP_CONFIG.ADMIN.UID,
          text: replyText,
          createdAt: new Date().toISOString(),
          seen: true,
        });
        await updateDoc(chatDocRef, {
          lastMessage: replyText,
          lastMessageAt: new Date().toISOString(),
        });
      } catch {
        // ignore
      }
    }, 1500);
  }
}

/**
 * Helper to start or open a private 1-on-1 chat room with Admin Agnesya Kartika
 */
export async function getOrCreateAdminChat(
  currentUser: UserProfile
): Promise<{ chatId: string; recipient: { id: string; name: string; avatar: string; isVerified: boolean; online: boolean; role: string } }> {
  const adminRecipient = {
    id: APP_CONFIG.ADMIN.UID,
    name: APP_CONFIG.ADMIN.NAME,
    avatar: APP_CONFIG.ADMIN.AVATAR,
    isVerified: APP_CONFIG.ADMIN.IS_VERIFIED,
    online: true,
    role: APP_CONFIG.ADMIN.ROLE,
  };

  const welcomeMessage = `Halo ${currentUser.fullName.split(' ')[0]}! Saya ${APP_CONFIG.ADMIN.NAME}, Admin Resmi Sahabat Rantau. Ruang obrolan ini 100% privat antara Anda dan saya. Ada yang bisa saya bantu terkait kendala kerja, dokumen, atau darurat hari ini?`;

  const chatId = await createOrGetChat(currentUser, adminRecipient, welcomeMessage);

  return {
    chatId,
    recipient: adminRecipient,
  };
}

/**
 * Create or retrieve an existing chat between current user and target user/profile
 */
export async function createOrGetChat(
  currentUser: UserProfile,
  targetProfile: MatchProfile | { id: string; name: string; avatar: string; isVerified: boolean; role?: string },
  initialWelcomeText?: string
): Promise<string> {
  const targetId = 'userId' in targetProfile && targetProfile.userId ? targetProfile.userId : targetProfile.id;
  const chatId = [currentUser.uid, targetId].sort().join('_');
  const chatDocRef = doc(db, 'chats', chatId);
  const snap = await getDoc(chatDocRef);

  const nowIso = new Date().toISOString();

  const targetRole = 'role' in targetProfile ? targetProfile.role : 'Match Baru ❤️';
  const targetPhoto = 'photo' in targetProfile ? targetProfile.photo : (targetProfile as any).avatar;

  if (!snap.exists()) {
    await setDoc(chatDocRef, {
      id: chatId,
      participants: [currentUser.uid, targetId],
      participantDetails: {
        [currentUser.uid]: {
          id: currentUser.uid,
          name: currentUser.fullName,
          avatar: currentUser.photoURL,
          isVerified: currentUser.verified,
          online: true,
          role: currentUser.occupation,
        },
        [targetId]: {
          id: targetId,
          name: targetProfile.name,
          avatar: targetPhoto,
          isVerified: targetProfile.isVerified,
          online: true,
          role: targetRole,
        },
      },
      lastMessage: initialWelcomeText || 'Halo! Senang bisa terhubung denganmu.',
      lastMessageAt: nowIso,
      createdAt: nowIso,
    });

    // Add initial greeting message
    const msgCol = collection(db, 'chats', chatId, 'messages');
    await addDoc(msgCol, {
      senderId: targetId,
      text: initialWelcomeText || `Halo ${currentUser.fullName.split(' ')[0]}! Salam kenal ya, senang bisa match denganmu di platform PMI 😊`,
      createdAt: nowIso,
      seen: true,
    });
  }

  return chatId;
}
