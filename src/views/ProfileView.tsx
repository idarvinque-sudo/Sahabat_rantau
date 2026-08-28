import React, { useState } from 'react';
import {
  ShieldCheck,
  Settings,
  Heart,
  Globe,
  Bell,
  ChevronRight,
  Lock,
  LogOut,
  Smartphone,
  Edit3,
  Check,
  Loader2,
  Users,
  FileText,
  UploadCloud,
  ShieldAlert,
  UserX,
  Sparkles,
} from 'lucide-react';
import { APP_CONFIG } from '../config/appConfig';
import { VerifiedBadge } from '../components/common/VerifiedBadge';
import { Modal } from '../components/common/Modal';
import { UserProfile } from '../types';
import { updateUserProfile, unblockUser } from '../firebase/userService';
import { requestVerification } from '../firebase/matchService';

interface ProfileViewProps {
  currentUser?: UserProfile | null;
  onLogout?: () => void;
  onOpenAuthModal?: () => void;
  onNavigateToMatch?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onLogout,
  onOpenAuthModal,
  onNavigateToMatch,
}) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Edit profile form states
  const [editFullName, setEditFullName] = useState<string>(
    currentUser?.fullName || ''
  );
  const [editBio, setEditBio] = useState<string>(
    currentUser?.bio || 'Bekerja dengan penuh cinta dan doa untuk keluarga di tanah air.'
  );
  const [editCity, setEditCity] = useState<string>(currentUser?.city || 'Taipei');
  const [editCountry, setEditCountry] = useState<string>(currentUser?.country || 'Taiwan');
  const [editOccupation, setEditOccupation] = useState<string>(
    currentUser?.occupation || 'Pekerja Migran Indonesia'
  );
  const [editPhotoURL, setEditPhotoURL] = useState<string>(
    currentUser?.photoURL || APP_CONFIG.DEFAULT_AVATAR
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Verification request form states
  const [verifDocType, setVerifDocType] = useState<'ARC' | 'Paspor' | 'E-PMI' | 'KTP'>('ARC');
  const [verifDocNumber, setVerifDocNumber] = useState<string>('');
  const [isSubmittingVerif, setIsSubmittingVerif] = useState<boolean>(false);
  const [verifSuccess, setVerifSuccess] = useState<boolean>(false);

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
  ];

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.uid) return;

    setIsSaving(true);
    try {
      await updateUserProfile(currentUser.uid, {
        fullName: editFullName.trim(),
        bio: editBio.trim(),
        city: editCity.trim(),
        country: editCountry.trim(),
        occupation: editOccupation.trim(),
        photoURL: editPhotoURL,
      });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setActiveModal(null);
      }, 1200);
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.uid || !verifDocNumber.trim()) return;

    setIsSubmittingVerif(true);
    try {
      await requestVerification(
        currentUser.uid,
        currentUser.fullName,
        verifDocNumber.trim(),
        verifDocType,
        currentUser.country,
        'https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?auto=format&fit=crop&q=80&w=600'
      );
      setVerifSuccess(true);
      setTimeout(() => {
        setVerifSuccess(false);
        setActiveModal(null);
      }, 1500);
    } catch (err) {
      console.error('Error submitting verification:', err);
    } finally {
      setIsSubmittingVerif(false);
    }
  };

  const handleUnblock = async (blockedUid: string) => {
    if (!currentUser?.uid) return;
    try {
      await unblockUser(currentUser.uid, blockedUid);
    } catch (err) {
      console.error('Error unblocking user:', err);
    }
  };

  const displayName = currentUser?.fullName || 'Sahabat Tamu';
  const displayAvatar = currentUser?.photoURL || APP_CONFIG.DEFAULT_AVATAR;
  const displayOccupation = currentUser?.occupation || 'Pekerja Migran';
  const displayLocation = currentUser ? `${currentUser.city}, ${currentUser.country}` : 'Indonesia';
  const diamonds = currentUser?.matchDiamonds ?? 0;
  const followingCount = currentUser?.followingCount ?? 0;
  const postsCount = currentUser?.postsCount ?? 0;
  const isVerified = currentUser?.verified ?? false;

  return (
    <div id="profile-view" className="space-y-3 px-4 py-3 pb-10">
      {!currentUser && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-3xl text-center space-y-2">
          <Sparkles className="mx-auto text-purple-600" size={24} />
          <h3 className="text-sm font-bold text-purple-950">Belum Masuk Akun</h3>
          <p className="text-xs text-purple-700">
            Daftar atau masuk dengan email untuk menyimpan profil, membuat postingan, dan terhubung dengan sesama rekan PMI.
          </p>
          <button
            onClick={onOpenAuthModal}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
          >
            Masuk / Daftar Akun Sahabat
          </button>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 rounded-3xl p-5 text-white text-center relative overflow-hidden shadow-lg shadow-purple-900/15">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-500/20 rounded-full blur-xl pointer-events-none" />

        {/* Profile Avatar with Ring */}
        <div className="relative inline-block mx-auto mb-3">
          <img
            src={displayAvatar}
            alt={displayName}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-white/80 p-0.5 shadow-md"
          />
          {isVerified && (
            <span className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-[10px]">
              ✓
            </span>
          )}
        </div>

        {/* Name & Role */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1.5">
            <h2 className="text-lg font-bold text-white font-heading">
              {displayName}
            </h2>
            {isVerified && <VerifiedBadge size="sm" variant="solid" />}
          </div>
          <p className="text-xs text-purple-200">{displayOccupation}</p>
          <p className="text-[11px] text-purple-300/90 flex items-center justify-center gap-1">
            <span>📍 {displayLocation}</span>
          </p>
          {currentUser?.bio && (
            <p className="text-xs text-purple-100/90 max-w-xs mx-auto italic pt-1">
              "{currentUser.bio}"
            </p>
          )}
        </div>

        {/* User Stats: Postingan, Sahabat, Diamond */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/10 text-center">
          <div>
            <span className="text-base font-extrabold text-white">{postsCount}</span>
            <p className="text-[10px] text-purple-200">Postingan</p>
          </div>
          <div>
            <span className="text-base font-extrabold text-white">{followingCount}</span>
            <p className="text-[10px] text-purple-200">Teman Sahabat</p>
          </div>
          <div>
            <span className="text-base font-extrabold text-pink-300">💎 {diamonds}</span>
            <p className="text-[10px] text-purple-200">Token Match</p>
          </div>
        </div>
      </div>

      {/* Security & Verification Status Card */}
      <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck size={22} className="stroke-[2.2px]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-950">Status PMI Terverifikasi</h4>
            <p className="text-[11px] text-emerald-800">
              Dokumen ARC/Paspor aman & terlindungi di Cloud Firestore
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            if (!currentUser) {
              if (onOpenAuthModal) onOpenAuthModal();
              return;
            }
            setActiveModal('verification_request');
          }}
          className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded-xl cursor-pointer shrink-0 transition-colors"
        >
          {isVerified ? 'Cek Status' : 'Ajukan Verifikasi'}
        </button>
      </div>

      {/* Menu Options */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs divide-y divide-slate-100 overflow-hidden text-xs">
        {/* Edit Profil */}
        <button
          onClick={() => {
            if (!currentUser) {
              if (onOpenAuthModal) onOpenAuthModal();
              return;
            }
            setEditFullName(currentUser.fullName);
            setEditBio(currentUser.bio || '');
            setEditCity(currentUser.city || 'Taipei');
            setEditCountry(currentUser.country || 'Taiwan');
            setEditOccupation(currentUser.occupation || 'Pekerja Migran');
            setEditPhotoURL(currentUser.photoURL || APP_CONFIG.DEFAULT_AVATAR);
            setActiveModal('edit_profile');
          }}
          className="w-full flex items-center justify-between p-3.5 hover:bg-purple-50/60 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3 text-slate-700">
            <Edit3 size={18} className="text-purple-600" />
            <div>
              <span className="font-semibold">Edit Profil & Biodata</span>
              <p className="text-[10px] text-slate-400">Ubah foto profil, nama, kota & pekerjaan</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-400" />
        </button>

        {/* Jodoh & Pasangan Settings */}
        <button
          onClick={() => {
            if (onNavigateToMatch) onNavigateToMatch();
          }}
          className="w-full flex items-center justify-between p-3.5 hover:bg-pink-50/60 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3 text-slate-700">
            <Heart size={18} className="text-pink-500" />
            <div>
              <span className="font-semibold">Pengaturan Jodoh Sahabat</span>
              <p className="text-[10px] text-slate-400">Atur kriteria pasangan & token swipe</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-400" />
        </button>

        {/* Daftar Pengguna Diblokir */}
        <button
          onClick={() => setActiveModal('blocked_users')}
          className="w-full flex items-center justify-between p-3.5 hover:bg-purple-50/60 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3 text-slate-700">
            <UserX size={18} className="text-rose-500" />
            <div>
              <span className="font-semibold">Daftar Pengguna Diblokir</span>
              <p className="text-[10px] text-slate-400">Kelola akun yang tidak dapat menghubungi Anda</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-400" />
        </button>

        {/* Info Aplikasi */}
        <button
          onClick={() => setActiveModal('about_app')}
          className="w-full flex items-center justify-between p-3.5 hover:bg-purple-50/60 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3 text-slate-700">
            <Smartphone size={18} className="text-blue-600" />
            <div>
              <span className="font-semibold">Konfigurasi Aplikasi</span>
              <p className="text-[10px] text-slate-400">Nama: {APP_CONFIG.NAME} • v{APP_CONFIG.VERSION}</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-400" />
        </button>

        {/* Keamanan & Privasi */}
        <button
          onClick={() => setActiveModal('security')}
          className="w-full flex items-center justify-between p-3.5 hover:bg-purple-50/60 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3 text-slate-700">
            <Lock size={18} className="text-amber-600" />
            <span className="font-semibold">Privasi & Keamanan Akun</span>
          </div>
          <ChevronRight size={16} className="text-slate-400" />
        </button>

        {/* Logout / Switch Account */}
        <button
          onClick={() => {
            if (onLogout) onLogout();
            if (onOpenAuthModal) onOpenAuthModal();
          }}
          className="w-full flex items-center justify-between p-3.5 hover:bg-rose-50/60 transition-colors text-left cursor-pointer text-rose-600"
        >
          <div className="flex items-center gap-3">
            <LogOut size={18} />
            <span className="font-semibold">Keluar / Ganti Akun</span>
          </div>
          <ChevronRight size={16} className="text-rose-400" />
        </button>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={activeModal === 'edit_profile'}
        onClose={() => setActiveModal(null)}
        title="Edit Profil Sahabat PMI"
        subtitle="Data tersimpan otomatis ke Cloud Firestore"
      >
        <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs text-slate-700">
          {saveSuccess && (
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 flex items-center gap-2">
              <Check size={16} />
              <span>Profil berhasil diperbarui di Firestore!</span>
            </div>
          )}

          {/* Photo selection */}
          <div>
            <label className="font-bold text-slate-800 block mb-1.5">Pilih Foto Profil:</label>
            <div className="flex items-center gap-2">
              {sampleAvatars.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Avatar ${i}`}
                  onClick={() => setEditPhotoURL(url)}
                  className={`w-12 h-12 rounded-full object-cover cursor-pointer border-2 transition-all ${
                    editPhotoURL === url ? 'border-purple-600 ring-2 ring-purple-300 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">Nama Lengkap:</label>
            <input
              type="text"
              value={editFullName}
              onChange={(e) => setEditFullName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-purple-600 text-xs"
              required
            />
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">Pekerjaan / Sektor:</label>
            <input
              type="text"
              value={editOccupation}
              onChange={(e) => setEditOccupation(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-purple-600 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Kota Saat Ini:</label>
              <input
                type="text"
                value={editCity}
                onChange={(e) => setEditCity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-purple-600 text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-800 block mb-1">Negara:</label>
              <input
                type="text"
                value={editCountry}
                onChange={(e) => setEditCountry(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-purple-600 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">Bio / Status:</label>
            <textarea
              rows={2}
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-purple-600 text-xs"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-600/30 flex items-center justify-center gap-1.5 hover:opacity-95 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Perubahan</span>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Verification Request Modal */}
      <Modal
        isOpen={activeModal === 'verification_request'}
        onClose={() => setActiveModal(null)}
        title="Verifikasi Resmi Akun PMI"
        subtitle="Dapatkan badge centang biru terpercaya di Rekan Migran"
      >
        {verifSuccess ? (
          <div className="p-6 text-center space-y-2 bg-emerald-50 rounded-2xl border border-emerald-200">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check size={24} />
            </div>
            <h3 className="text-sm font-bold text-emerald-900">Pengajuan Berhasil Disimpan</h3>
            <p className="text-xs text-emerald-700">
              Dokumen Anda telah masuk ke sistem verifikasi. Status akun Anda otomatis aktif!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitVerification} className="space-y-3.5 text-xs text-slate-700">
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-900">
              <p className="font-bold flex items-center gap-1.5 mb-1">
                <ShieldCheck size={16} className="text-purple-600" />
                <span>Manfaat Akun Terverifikasi:</span>
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-purple-800">
                <li>Badge centang biru terpercaya</li>
                <li>Prioritas interaksi di Feed & Jodoh</li>
                <li>Perlindungan ekstra dari akun peniru</li>
              </ul>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Jenis Dokumen Resmi:</label>
              <select
                value={verifDocType}
                onChange={(e) => setVerifDocType(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-purple-600 text-xs"
              >
                <option value="ARC">Alien Resident Certificate (ARC Taiwan / Hong Kong HKID)</option>
                <option value="Paspor">Paspor Republik Indonesia</option>
                <option value="E-PMI">E-PMI / Kartu Tenaga Kerja Luar Negeri</option>
                <option value="KTP">KTP Elektronik Indonesia</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Nomor Dokumen:</label>
              <input
                type="text"
                value={verifDocNumber}
                onChange={(e) => setVerifDocNumber(e.target.value)}
                placeholder="Contoh: A123456789"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-purple-600 text-xs"
                required
              />
            </div>

            <div className="p-3 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-500 bg-slate-50">
              <UploadCloud size={24} className="mx-auto mb-1 text-slate-400" />
              <p className="text-xs font-semibold">Contoh Foto Dokumen Terlampir</p>
              <p className="text-[10px] text-slate-400">Data Anda dienkripsi dan hanya digunakan untuk validasi.</p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmittingVerif}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-600/30 flex items-center justify-center gap-1.5 hover:opacity-95 cursor-pointer disabled:opacity-50"
              >
                {isSubmittingVerif ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Memproses Verifikasi...</span>
                  </>
                ) : (
                  <span>Ajukan Verifikasi Sekarang</span>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Blocked Users Modal */}
      <Modal
        isOpen={activeModal === 'blocked_users'}
        onClose={() => setActiveModal(null)}
        title="Daftar Pengguna Diblokir"
        subtitle="Akun yang dibatasi dari interaksi dengan Anda"
      >
        <div className="space-y-2 text-xs">
          {(!currentUser?.blockedUsers || currentUser.blockedUsers.length === 0) ? (
            <div className="p-6 text-center text-slate-400">
              <UserX size={24} className="mx-auto mb-1 text-slate-300" />
              <p className="font-semibold text-slate-600">Tidak ada pengguna yang diblokir.</p>
              <p className="text-[11px] text-slate-400">Anda dapat memblokir akun mencurigakan kapan saja.</p>
            </div>
          ) : (
            currentUser.blockedUsers.map((uid) => (
              <div
                key={uid}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-slate-800">Pengguna #{uid.slice(0, 8)}</p>
                  <p className="text-[10px] text-slate-400">Diblokir dari pesan & feed</p>
                </div>
                <button
                  onClick={() => handleUnblock(uid)}
                  className="px-2.5 py-1 bg-white hover:bg-purple-50 text-purple-700 font-bold rounded-lg border border-slate-200 cursor-pointer"
                >
                  Buka Blokir
                </button>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* About App Modal */}
      <Modal
        isOpen={activeModal === 'about_app'}
        onClose={() => setActiveModal(null)}
        title="Tentang Aplikasi"
        subtitle="Informasi Konfigurasi Single-Const"
      >
        <div className="space-y-3 text-xs text-slate-700">
          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
            <p className="font-bold text-purple-900">Nama Konfigurasi:</p>
            <p className="text-sm font-extrabold text-purple-700 mt-0.5">{APP_CONFIG.NAME}</p>
            <p className="text-[11px] text-slate-500 mt-2">
              Nama aplikasi diatur melalui konfigurasi tunggal di <code>src/config/appConfig.ts</code>.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="font-bold text-slate-800">Versi Platform:</p>
            <p className="text-slate-600">v{APP_CONFIG.VERSION} • Tahap 3 (Social Platform PMI)</p>
          </div>
        </div>
      </Modal>

      {/* Security Modal */}
      <Modal
        isOpen={activeModal === 'security'}
        onClose={() => setActiveModal(null)}
        title="Privasi & Keamanan"
        subtitle="Perlindungan Data Pekerja Migran"
      >
        <div className="space-y-3 text-xs text-slate-700">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-800">Enkripsi Data Cloud Firestore</h4>
            <p className="text-slate-500 mt-0.5">
              Semua percakapan dan saldo dompet dilindungi dengan aturan keamanan Firestore.
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-800">Verifikasi Identitas & Anti-Penipuan</h4>
            <p className="text-slate-500 mt-0.5">
              Sistem pelaporan & pemblokiran menjaga komunitas dari penipuan dan investasi bodong.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
