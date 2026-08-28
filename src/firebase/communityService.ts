import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  increment,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './config';
import { Community } from '../types';

export const DEFAULT_COMMUNITIES: Community[] = [
  {
    id: 'comm_taiwan',
    name: 'Komunitas PMI Taiwan (Taipei & Sekitarnya)',
    country: 'Taiwan',
    countryFlag: '🇹🇼',
    coverImage: 'https://images.unsplash.com/photo-1508248467877-aec1b08de376?auto=format&fit=crop&q=80&w=800',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    membersCount: 14280,
    description: 'Wadah silaturahmi, informasi kerja, kontrak, dan gathering sesama pekerja migran di Taiwan.',
    category: 'Negara Penempatan',
    rules: ['Saling menghormati', 'Dilarang promosi pinjol ilegal', 'Berbagi info valid'],
  },
  {
    id: 'comm_hk',
    name: 'Sahabat PMI Hong Kong & Macau',
    country: 'Hong Kong',
    countryFlag: '🇭🇰',
    coverImage: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80&w=800',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    membersCount: 22150,
    description: 'Komunitas resmi sharing pengalaman libur hari Minggu di Victoria Park dan info KJRI Hong Kong.',
    category: 'Negara Penempatan',
    rules: ['Jaga nama baik PMI', 'Gunakan bahasa santun'],
  },
  {
    id: 'comm_sg',
    name: 'Keluarga PMI Singapura',
    country: 'Singapura',
    countryFlag: '🇸🇬',
    coverImage: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&q=80&w=800',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    membersCount: 8940,
    description: 'Ruang berbagi tips adaptasi, kursus keterampilan, dan konsultasi ketenagakerjaan di Singapura.',
    category: 'Negara Penempatan',
    rules: ['Tidak menyebarkan hoaks', 'Dukung sesama PMI'],
  },
  {
    id: 'comm_my',
    name: 'Solidaritas PMI Malaysia',
    country: 'Malaysia',
    countryFlag: '🇲🇾',
    coverImage: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&q=80&w=800',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    membersCount: 31200,
    description: 'Pusat info perpanjangan paspor, rekalkulasi, dan solidaritas pekerja sektor formal & nonformal.',
    category: 'Negara Penempatan',
  },
  {
    id: 'comm_hukum',
    name: 'Advokasi Hukum & Perlindungan BP2MI',
    country: 'Indonesia / Global',
    countryFlag: '🇮🇩',
    coverImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    membersCount: 45600,
    description: 'Konsultasi hak ketenagakerjaan, asuransi BPJS Ketenagakerjaan, paspor hilang & pengaduan majikan.',
    category: 'Hukum & BP2MI',
    rules: ['Gunakan bahasa santun', 'Sertakan kronologi jelas'],
  },
  {
    id: 'comm_kuliner',
    name: 'Resep Masakan Nusantara & Warung PMI',
    country: 'Global',
    countryFlag: '🍲',
    coverImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800',
    avatar: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=200',
    membersCount: 18900,
    description: 'Berbagi resep sambal terasi, bakso kuah hangat, rendang, dan info warung halal di perantauan.',
    category: 'Kuliner & Hobi',
  },
];

/**
 * Subscribe to communities list
 */
export function subscribeToCommunities(
  currentUid: string,
  callback: (communities: Community[]) => void
) {
  const commCol = collection(db, 'communities');
  return onSnapshot(
    commCol,
    (snapshot) => {
      if (snapshot.empty) {
        callback(DEFAULT_COMMUNITIES);
        return;
      }
      const list: Community[] = [];
      snapshot.forEach((d) => {
        const raw = d.data();
        list.push({
          id: d.id,
          name: raw.name,
          country: raw.country || 'Global',
          countryFlag: raw.countryFlag || '🇮🇩',
          coverImage: raw.coverImage || 'https://images.unsplash.com/photo-1508248467877-aec1b08de376?auto=format&fit=crop&q=80&w=800',
          avatar: raw.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
          membersCount: raw.membersCount || 1000,
          description: raw.description || '',
          category: raw.category || 'Negara Penempatan',
          rules: raw.rules || [],
        });
      });
      callback(list.length > 0 ? list : DEFAULT_COMMUNITIES);
    },
    (err) => {
      console.warn('Error fetching communities, using defaults:', err);
      callback(DEFAULT_COMMUNITIES);
    }
  );
}

/**
 * Toggle join community
 */
export async function toggleJoinCommunity(
  communityId: string,
  userId: string,
  isJoined: boolean
): Promise<void> {
  const memberRef = doc(db, 'communities', communityId, 'members', userId);
  const commRef = doc(db, 'communities', communityId);

  if (isJoined) {
    try {
      await updateDoc(commRef, { membersCount: increment(-1) });
    } catch {
      // Ignored
    }
  } else {
    try {
      await setDoc(memberRef, { userId, joinedAt: new Date().toISOString() });
      await updateDoc(commRef, { membersCount: increment(1) });
    } catch {
      // Ignored
    }
  }
}

export const toggleCommunityMembership = (
  userId: string,
  communityId: string,
  isJoined: boolean
) => toggleJoinCommunity(communityId, userId, isJoined);
