import React, { useState } from 'react';
import { AlertCircle, Heart, Users, Briefcase, MessageSquare, Sparkles, ChevronRight, PhoneCall, ShieldAlert, BookOpen, MapPin, Search, ShieldCheck, Lock, Send } from 'lucide-react';
import { Modal } from '../common/Modal';
import { APP_CONFIG } from '../../config/appConfig';
import { UserProfile } from '../../types';

interface QuickActionProps {
  onNavigateToMatch: () => void;
  onOpenChatWithAdmin?: () => void;
  currentUser?: UserProfile | null;
}

export const QuickAction: React.FC<QuickActionProps> = ({
  onNavigateToMatch,
  onOpenChatWithAdmin,
  currentUser,
}) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [sosCountdown, setSosCountdown] = useState<number | null>(null);

  const handleTriggerSOS = () => {
    setSosCountdown(5);
    const interval = setInterval(() => {
      setSosCountdown((prev) => {
        if (prev !== null && prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev !== null ? prev - 1 : null;
      });
    }, 1000);
  };

  const handleChatAdminClick = () => {
    if (onOpenChatWithAdmin) {
      onOpenChatWithAdmin();
    } else {
      setActiveModal('chat_admin');
    }
  };

  return (
    <div id="quick-action-section" className="px-4 py-3">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 font-heading">
          <span>Fitur Utama</span>
          <span className="w-2 h-2 rounded-full bg-purple-500" />
        </h2>
        <button
          onClick={() => setActiveModal('all_features')}
          className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-0.5 cursor-pointer"
        >
          Lihat Semua <ChevronRight size={14} />
        </button>
      </div>

      {/* 5 Main Large Icons Grid */}
      <div className="grid grid-cols-5 gap-2">
        {/* 1. 🆘 SOS */}
        <button
          id="quick-action-sos"
          onClick={() => setActiveModal('sos')}
          className="flex flex-col items-center justify-start group cursor-pointer"
        >
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-600 text-white flex items-center justify-center shadow-md shadow-rose-500/25 group-hover:scale-105 group-active:scale-95 transition-all">
            <ShieldAlert size={24} className="stroke-[2.2px] animate-pulse" />
          </div>
          <span className="text-[11px] font-bold text-rose-600 mt-1.5 text-center leading-tight">
            🆘 SOS
          </span>
        </button>

        {/* 2. ❤️ Match */}
        <button
          id="quick-action-match"
          onClick={onNavigateToMatch}
          className="flex flex-col items-center justify-start group cursor-pointer"
        >
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-400 to-purple-500 text-white flex items-center justify-center shadow-md shadow-pink-500/25 group-hover:scale-105 group-active:scale-95 transition-all">
            <Heart size={24} className="stroke-[2.2px] fill-white/20" />
          </div>
          <span className="text-[11px] font-bold text-slate-700 group-hover:text-purple-600 mt-1.5 text-center leading-tight">
            ❤️ Match
          </span>
        </button>

        {/* 3. 👥 Komunitas */}
        <button
          id="quick-action-komunitas"
          onClick={() => setActiveModal('komunitas')}
          className="flex flex-col items-center justify-start group cursor-pointer"
        >
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-500/25 group-hover:scale-105 group-active:scale-95 transition-all">
            <Users size={24} className="stroke-[2.2px]" />
          </div>
          <span className="text-[11px] font-bold text-slate-700 group-hover:text-purple-600 mt-1.5 text-center leading-tight">
            👥 Komunitas
          </span>
        </button>

        {/* 4. 💼 Lowongan */}
        <button
          id="quick-action-lowongan"
          onClick={() => setActiveModal('lowongan')}
          className="flex flex-col items-center justify-start group cursor-pointer"
        >
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25 group-hover:scale-105 group-active:scale-95 transition-all">
            <Briefcase size={24} className="stroke-[2.2px]" />
          </div>
          <span className="text-[11px] font-bold text-slate-700 group-hover:text-purple-600 mt-1.5 text-center leading-tight">
            💼 Lowongan
          </span>
        </button>

        {/* 5. 💬 CHAT ADMIN */}
        <button
          id="quick-action-chat-admin"
          onClick={handleChatAdminClick}
          className="flex flex-col items-center justify-start group cursor-pointer"
        >
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-600 text-white flex items-center justify-center shadow-md shadow-purple-500/25 group-hover:scale-105 group-active:scale-95 transition-all relative">
            <MessageSquare size={24} className="stroke-[2.2px]" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <span className="text-[11px] font-bold text-purple-700 group-hover:text-purple-800 mt-1.5 text-center leading-tight">
            💬 CHAT ADMIN
          </span>
        </button>
      </div>

      {/* SOS Modal */}
      <Modal
        isOpen={activeModal === 'sos'}
        onClose={() => {
          setActiveModal(null);
          setSosCountdown(null);
        }}
        title="🆘 Pusat Bantuan Darurat & SOS"
        subtitle="Khusus Pekerja Migran Indonesia (24 Jam Siaga)"
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-xs font-bold text-rose-900">Tombol Darurat Otomatis</h4>
                <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed">
                  Menekan tombol ini akan mengirimkan koordinat GPS Anda ke kontak darurat terdaftar dan satgas perlindungan PMI terdekat.
                </p>
              </div>
            </div>
            {sosCountdown !== null ? (
              <div className="mt-3 p-3 bg-white rounded-xl text-center border border-rose-300">
                {sosCountdown > 0 ? (
                  <>
                    <p className="text-xs font-bold text-rose-600">
                      Mengirim sinyal SOS dalam {sosCountdown} detik...
                    </p>
                    <button
                      onClick={() => setSosCountdown(null)}
                      className="mt-2 text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                    >
                      Batalkan
                    </button>
                  </>
                ) : (
                  <p className="text-xs font-bold text-emerald-600">
                    ✓ Sinyal SOS & Lokasi telah dikirim ke KBRI/KJRI & Kontak Darurat.
                  </p>
                )}
              </div>
            ) : (
              <button
                onClick={handleTriggerSOS}
                className="mt-3 w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-md shadow-red-600/30 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <ShieldAlert size={18} /> AKTIFKAN DARURAT SEKARANG
              </button>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800">Nomor Penting Wilayah Anda:</h4>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-800">KDEI Taipei (Hotline PMI)</p>
                <p className="text-slate-500 text-[11px]">+886 901 023 888 (24 Jam)</p>
              </div>
              <a
                href="tel:1955"
                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold flex items-center gap-1 hover:bg-emerald-700"
              >
                <PhoneCall size={14} /> Panggil 1955
              </a>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-800">Hotline Ketenagakerjaan Taiwan (Bahasa Indo)</p>
                <p className="text-slate-500 text-[11px]">Bebas Pulsa: 1955</p>
              </div>
              <span className="text-[11px] bg-purple-100 text-purple-700 font-bold px-2 py-1 rounded">
                Bebas Pulsa
              </span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Chat Admin Modal (If not opening full chat tab) */}
      <Modal
        isOpen={activeModal === 'chat_admin'}
        onClose={() => setActiveModal(null)}
        title="💬 Chat Pribadi dengan Admin"
        subtitle="Layanan Konsultasi & Bantuan Privat 1-on-1"
      >
        <div className="space-y-3.5">
          {/* Admin Profile Card */}
          <div className="p-3 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 rounded-2xl border border-purple-200/80 flex items-center gap-3">
            <div className="relative shrink-0">
              <img
                src={APP_CONFIG.ADMIN.AVATAR}
                alt={APP_CONFIG.ADMIN.NAME}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-slate-800 truncate">
                  {APP_CONFIG.ADMIN.NAME}
                </h4>
                <ShieldCheck size={14} className="text-purple-600 shrink-0 fill-purple-100" />
              </div>
              <p className="text-[11px] text-purple-700 font-medium">
                {APP_CONFIG.ADMIN.ROLE}
              </p>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online & Siap Membantu
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 text-slate-600">
            <div className="flex items-center gap-1.5 text-purple-700 font-bold">
              <Lock size={14} />
              <span>Privasi Terjamin (End-to-End Private)</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Percakapan ini hanya dapat dibaca oleh Anda dan Admin <strong>{APP_CONFIG.ADMIN.NAME}</strong>. Tidak terlihat oleh pengguna lain di publik.
            </p>
          </div>

          <div className="pt-1">
            <button
              onClick={() => {
                setActiveModal(null);
                if (onOpenChatWithAdmin) onOpenChatWithAdmin();
              }}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-600/30 hover:opacity-95 active:scale-98 transition-all cursor-pointer"
            >
              <MessageSquare size={16} /> Buka Ruang Chat Privat Sekarang
            </button>
          </div>
        </div>
      </Modal>

      {/* Komunitas Modal */}
      <Modal
        isOpen={activeModal === 'komunitas'}
        onClose={() => setActiveModal(null)}
        title="👥 Komunitas Pekerja Migran"
        subtitle="Temukan Teman Sekampung & Paguyuban Terdekat"
      >
        <div className="space-y-3">
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                TW
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Paguyuban PMI Taipei Raya</h4>
                <p className="text-[11px] text-slate-500">12.450 Anggota • 140 Online</p>
              </div>
            </div>
            <button className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700">
              Gabung
            </button>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-sm">
                HK
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Sahabat Kuliner PMI Hong Kong</h4>
                <p className="text-[11px] text-slate-500">8.920 Anggota • 95 Online</p>
              </div>
            </div>
            <button className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700">
              Gabung
            </button>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                SG
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Keluarga Muslim PMI Singapura</h4>
                <p className="text-[11px] text-slate-500">6.100 Anggota • 54 Online</p>
              </div>
            </div>
            <button className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700">
              Gabung
            </button>
          </div>
        </div>
      </Modal>

      {/* Lowongan Modal */}
      <Modal
        isOpen={activeModal === 'lowongan'}
        onClose={() => setActiveModal(null)}
        title="💼 Bursa Kerja & Peluang Resmi"
        subtitle="Terverifikasi BP2MI & Agensi Resmi"
      >
        <div className="space-y-3">
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded">
                  ✓ Resmi Agensi A+
                </span>
                <h4 className="text-xs font-bold text-slate-800 mt-1">
                  Operator Pabrik Elektronik (Taiwan)
                </h4>
                <p className="text-[11px] text-slate-500">Hsinchu Science Park • Gaji NT$ 27,470/bln</p>
              </div>
              <span className="text-xs font-bold text-purple-700">≈ Rp 14 Jt</span>
            </div>
            <button className="mt-2.5 w-full py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold hover:bg-purple-100 transition-colors">
              Lihat Syarat & Detail
            </button>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded">
                  ✓ Caregiver Lansia
                </span>
                <h4 className="text-xs font-bold text-slate-800 mt-1">
                  Pengasuh Pasien Rumah Sakit (Jepang / Tokutei Ginou)
                </h4>
                <p className="text-[11px] text-slate-500">Tokyo & Osaka • Gaji ¥ 220,000/bln</p>
              </div>
              <span className="text-xs font-bold text-purple-700">≈ Rp 23 Jt</span>
            </div>
            <button className="mt-2.5 w-full py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold hover:bg-purple-100 transition-colors">
              Lihat Syarat & Detail
            </button>
          </div>
        </div>
      </Modal>

      {/* All Features Modal */}
      <Modal
        isOpen={activeModal === 'all_features'}
        onClose={() => setActiveModal(null)}
        title="Daftar Lengkap Layanan"
        subtitle="Semua Fasilitas Khusus Pekerja Migran"
      >
        <div className="grid grid-cols-3 gap-3 text-center">
          <div
            onClick={() => setActiveModal('sos')}
            className="p-3 bg-rose-50 rounded-xl border border-rose-100 cursor-pointer hover:bg-rose-100"
          >
            <ShieldAlert className="mx-auto text-rose-600 mb-1" size={24} />
            <span className="text-xs font-bold text-slate-800">Tombol SOS</span>
          </div>
          <div
            onClick={() => {
              setActiveModal(null);
              onNavigateToMatch();
            }}
            className="p-3 bg-pink-50 rounded-xl border border-pink-100 cursor-pointer hover:bg-pink-100"
          >
            <Heart className="mx-auto text-pink-600 mb-1" size={24} />
            <span className="text-xs font-bold text-slate-800">Cari Jodoh</span>
          </div>
          <div
            onClick={() => {
              setActiveModal(null);
              handleChatAdminClick();
            }}
            className="p-3 bg-purple-50 rounded-xl border border-purple-100 cursor-pointer hover:bg-purple-100"
          >
            <MessageSquare className="mx-auto text-purple-600 mb-1" size={24} />
            <span className="text-xs font-bold text-slate-800">Chat Admin</span>
          </div>
          <div
            onClick={() => setActiveModal('komunitas')}
            className="p-3 bg-blue-50 rounded-xl border border-blue-100 cursor-pointer hover:bg-blue-100"
          >
            <Users className="mx-auto text-blue-600 mb-1" size={24} />
            <span className="text-xs font-bold text-slate-800">Komunitas</span>
          </div>
          <div
            onClick={() => setActiveModal('lowongan')}
            className="p-3 bg-amber-50 rounded-xl border border-amber-100 cursor-pointer hover:bg-amber-100"
          >
            <Briefcase className="mx-auto text-amber-600 mb-1" size={24} />
            <span className="text-xs font-bold text-slate-800">Lowongan</span>
          </div>
          <div
            onClick={() => alert('Fitur Info Kurs Realtime update otomatis setiap jam.')}
            className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 cursor-pointer hover:bg-emerald-100"
          >
            <BookOpen className="mx-auto text-emerald-600 mb-1" size={24} />
            <span className="text-xs font-bold text-slate-800">Info Kurs</span>
          </div>
        </div>
      </Modal>
    </div>
  );
};
