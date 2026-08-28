import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, Check, Loader2, X, Lock } from 'lucide-react';
import { Modal } from './Modal';
import { submitReport } from '../../firebase/matchService';
import { blockUser } from '../../firebase/userService';
import { UserProfile } from '../../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'user' | 'post' | 'comment' | 'message' | 'dating';
  targetId: string;
  targetName?: string;
  currentUser?: UserProfile | null;
  onSuccess?: () => void;
}

const REPORT_REASONS = [
  'Penipuan / Meminta Uang',
  'Akun Palsu / Foto Curian',
  'Pelecehan / Kata-kata Kasar',
  'Spam / Promosi Ilegal',
  'Konten Tidak Pantas / Porno',
  'Ancaman / Pemerasan',
  'Lainnya',
] as const;

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetName = 'konten ini',
  currentUser,
  onSuccess,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>(REPORT_REASONS[0]);
  const [description, setDescription] = useState<string>('');
  const [alsoBlockUser, setAlsoBlockUser] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.uid) return;

    setIsSubmitting(true);
    try {
      // 1. Submit report to Firestore
      await submitReport(
        currentUser.uid,
        targetType,
        targetId,
        selectedReason as any,
        description.trim() || `Laporan untuk ${targetType}: ${selectedReason}`,
        targetName
      );

      // 2. Optionally block the target user
      if (alsoBlockUser && (targetType === 'user' || targetType === 'dating')) {
        await blockUser(currentUser.uid, targetId);
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      console.error('Error submitting report:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Laporkan & Amankan Akun"
      subtitle={`Laporan untuk ${targetName}`}
    >
      {isSuccess ? (
        <div className="p-6 text-center space-y-2 bg-emerald-50 rounded-2xl border border-emerald-200">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <Check size={24} />
          </div>
          <h3 className="text-sm font-bold text-emerald-900">Laporan Telah Dikirim</h3>
          <p className="text-xs text-emerald-700">
            Terima kasih telah membantu menjaga komunitas PMI tetap aman dan terpercaya. Tim kami akan segera meninjau.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-700">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800">
            <AlertTriangle size={18} className="shrink-0 text-rose-600 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Komunitas Rekan Migran berkomitmen melindungi seluruh PMI dari penipuan uang, investasi bodong, dan akun palsu.
            </p>
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1.5">Alasan Pelaporan:</label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                    selectedReason === reason
                      ? 'bg-purple-50 border-purple-500 text-purple-900 font-semibold'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>{reason}</span>
                  <input
                    type="radio"
                    name="reportReason"
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="accent-purple-600"
                  />
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">
              Keterangan Tambahan (Opsional):
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ceritakan rincian kejadian agar tim admin kami dapat menindaklanjuti..."
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-purple-600 text-xs resize-none"
            />
          </div>

          {(targetType === 'user' || targetType === 'dating') && (
            <label className="flex items-center gap-2 p-2.5 bg-slate-100 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={alsoBlockUser}
                onChange={(e) => setAlsoBlockUser(e.target.checked)}
                className="rounded accent-purple-600"
              />
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <Lock size={13} className="text-slate-600" />
                Blokir pengguna ini agar tidak dapat menghubungi Anda lagi
              </span>
            </label>
          )}

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/30 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <ShieldAlert size={15} />
                  <span>Kirim Laporan</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
