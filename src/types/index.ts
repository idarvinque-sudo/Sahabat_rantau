export interface User {
  id: string;
  name: string;
  fullName: string;
  username?: string;
  avatar: string;
  location: string;
  country: string;
  countryFlag: string;
  isVerified: boolean;
  role?: string;
  email?: string;
}

export type ReactionType = 'like' | 'love' | 'haha' | 'sad' | 'wow' | 'support' | 'care';

export interface ReactionDetail {
  userId: string;
  userName: string;
  userAvatar: string;
  type: ReactionType;
  createdAt: string;
}

export interface PostComment {
  id: string;
  userId?: string;
  userName: string;
  userAvatar: string;
  timeAgo: string;
  text: string;
  likes: number;
  isLiked?: boolean;
  createdAt?: string;
  replies?: PostComment[];
  replyToId?: string;
  replyToName?: string;
}

export type PostVisibility = 'public' | 'friends' | 'private';

export type PostCategory =
  | 'Umum'
  | 'Pengalaman PMI'
  | 'Tips Kerja'
  | 'Info Penting'
  | 'Tanya Jawab'
  | 'Curhat'
  | 'Hiburan'
  | 'Kuliner'
  | 'Lowongan'
  | 'Jodoh'
  | 'Kabar'
  | 'Bantuan'
  | 'Komunitas'
  | 'Semua';

export interface Post {
  id: string;
  author: User;
  createdAt: string;
  locationText: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  category?: PostCategory | string;
  visibility?: PostVisibility;
  likesCount: number;
  reactionsCount?: Record<string, number>;
  userReaction?: ReactionType | null;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  isSaved?: boolean;
  comments: PostComment[];
  userId?: string;
  country?: string;
  countryFlag?: string;
}

export interface Story {
  id: string;
  userName: string;
  userAvatar: string;
  isUser?: boolean;
  viewed?: boolean;
  mediaUrl: string;
  caption?: string;
  location?: string;
  timeAgo?: string;
}

export type RelationshipGoal =
  | 'Kenalan'
  | 'Teman'
  | 'Hubungan Serius'
  | 'Mencari Jodoh'
  | 'Menikah';

export interface DatingProfile {
  id: string;
  userId: string;
  isActive: boolean;
  nickname: string;
  age: number;
  gender: 'female' | 'male' | 'other';
  country: string;
  countryFlag: string;
  city: string;
  job: string;
  relationshipStatus: 'Lajang' | 'Pernah Menikah' | 'Mencari Pasangan Serius';
  bio: string;
  goal: RelationshipGoal;
  interests: string[];
  languages: string[];
  photo: string;
  additionalPhotos?: string[];
  partnerPreferences?: string;
  isVerified: boolean;
  isOnline: boolean;
  religion?: string;
  height?: string;
  smoking?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MatchProfile extends DatingProfile {
  name: string;
  distance?: string;
  hobbies?: string[];
}

export interface MatchLike {
  id?: string;
  fromUserId: string;
  toUserId: string;
  createdAt: string;
  isSuperLike?: boolean;
}

export interface MatchRecord {
  id: string;
  userIds: string[];
  userProfiles?: Record<string, Partial<UserProfile | MatchProfile>>;
  createdAt: string;
  status: 'active' | 'unmatched' | 'blocked';
}

export interface ChatParticipant {
  id: string;
  name: string;
  avatar: string;
  isVerified: boolean;
  online: boolean;
  role?: string;
}

export interface ChatConversation {
  id: string;
  participants: string[];
  participantDetails: Record<string, ChatParticipant>;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount?: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  imageUrl?: string;
  createdAt: string;
  time: string;
  seen: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

export type NotificationType =
  | 'like'
  | 'reaction'
  | 'comment'
  | 'reply'
  | 'follow'
  | 'friend_request'
  | 'friend_accepted'
  | 'match'
  | 'message'
  | 'system'
  | 'security'
  | 'remittance';

export interface NotificationItem {
  id: string;
  userId?: string;
  type: NotificationType;
  title: string;
  message: string;
  timeAgo: string;
  isRead: boolean;
  avatar?: string;
  fromUserId?: string;
  targetPostId?: string;
  targetChatId?: string;
  createdAt?: string;
}

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface VerificationDocument {
  id?: string;
  userId: string;
  fullName: string;
  idNumber: string;
  documentType: 'KTP' | 'Paspor' | 'E-PMI' | 'ARC';
  country: string;
  documentImageUrl: string;
  selfieImageUrl?: string;
  status: VerificationStatus;
  notes?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface Community {
  id: string;
  name: string;
  country: string;
  countryFlag: string;
  coverImage: string;
  avatar: string;
  membersCount: number;
  description: string;
  category: string;
  isJoined?: boolean;
  rules?: string[];
}

export interface ReportItem {
  id?: string;
  reporterId: string;
  targetType: 'user' | 'post' | 'comment' | 'message' | 'dating';
  targetId: string;
  targetName?: string;
  reason:
    | 'Penipuan'
    | 'Meminta uang'
    | 'Akun palsu'
    | 'Pelecehan'
    | 'Spam'
    | 'Konten tidak pantas'
    | 'Ancaman'
    | 'Lainnya';
  description: string;
  evidenceUrl?: string;
  status: 'Pending' | 'Review' | 'Resolved' | 'Rejected';
  createdAt: string;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  fromUserCountry: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  fullName: string;
  username?: string;
  email: string;
  photoURL: string;
  coverURL?: string;
  bio: string;
  gender: 'female' | 'male' | 'other';
  birthDate?: string;
  age?: number;
  country: string;
  city: string;
  occupation: string;
  relationshipStatus?: string;
  verified: boolean;
  verificationStatus?: VerificationStatus;
  premium: boolean;
  premiumUntil?: string | null;
  balance: number;
  matchDiamonds: number;
  isDatingActive?: boolean;
  datingProfile?: Partial<DatingProfile>;
  photos?: string[];
  createdAt: string;
  updatedAt: string;
  lastActive: string;
  online: boolean;
  followersCount: number;
  followingCount: number;
  friendsCount?: number;
  postsCount?: number;
  likesReceived: number;
  matchCount: number;
  blockedUsers?: string[];
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense' | 'topup' | 'withdraw' | 'transfer';
  amount: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  formattedDate?: string;
}

export type TabType = 'beranda' | 'feed' | 'jodoh' | 'pesan' | 'notifikasi' | 'profil' | 'komunitas' | 'teman';
