import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, PlusCircle, ArrowUpRight, ArrowDownLeft, Send, History, Sparkles, ChevronRight, Check } from 'lucide-react';
import { Modal } from '../common/Modal';
import { updateBalance, subscribeToTransactions } from '../../firebase/walletService';
import { Transaction } from '../../types';

interface BalanceCardProps {
  balance?: number;
  userId?: string;
  onNavigateToRemittance?: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance = 0,
  userId,
}) => {
  const [showBalance, setShowBalance] = useState<boolean>(true);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [topUpAmount, setTopUpAmount] = useState<string>('500000');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccessMessage, setIsSuccessMessage] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Transfer form state
  const [transferRecipient, setTransferRecipient] = useState<string>('');
  const [transferBank, setTransferBank] = useState<string>('BCA');
  const [transferAmount, setTransferAmount] = useState<string>('500000');

  useEffect(() => {
    if (userId) {
      const unsub = subscribeToTransactions(userId, (txs) => {
        setTransactions(txs || []);
      });
      return () => unsub();
    } else {
      setTransactions([]);
    }
  }, [userId]);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleTopUp = async () => {
    const val = parseInt(topUpAmount, 10);
    if (!isNaN(val) && val > 0 && userId) {
      setIsProcessing(true);
      try {
        await updateBalance(userId, val, 'topup', `Top Up Saldo Dompet (+${formatRupiah(val)})`);
        setIsSuccessMessage(`Top Up ${formatRupiah(val)} berhasil ditambahkan ke saldo!`);
        setTimeout(() => {
          setIsSuccessMessage(null);
          setActiveModal(null);
        }, 1800);
      } catch (err) {
        console.error('Error top up:', err);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSendMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(transferAmount, 10);
    if (!userId || isNaN(val) || val <= 0 || !transferRecipient.trim()) return;
    if (balance < val) {
      alert('Saldo dompet tidak mencukupi untuk transfer ini.');
      return;
    }

    setIsProcessing(true);
    try {
      await updateBalance(userId, -val, 'transfer', `Kirim Uang ke ${transferRecipient.trim()} (${transferBank})`);
      setIsSuccessMessage(`Pengiriman ${formatRupiah(val)} ke ${transferRecipient.trim()} berhasil diproses!`);
      setTimeout(() => {
        setIsSuccessMessage(null);
        setActiveModal(null);
        setTransferRecipient('');
      }, 1800);
    } catch (err) {
      console.error('Error sending money:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div id="balance-card-wrapper" className="px-4 pt-3 pb-1">
      {/* Primary Balance Container */}
      <div
        id="balance-card"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 text-white p-5 shadow-lg shadow-purple-900/20 border border-purple-400/20"
      >
        {/* Subtle background glow aesthetic */}
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-purple-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top row: Label & Toggle visibility */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-purple-200 uppercase tracking-wider">
              Saldo Saya
            </span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-purple-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Tampilkan / Sembunyikan Saldo"
            >
              {showBalance ? <Eye size={15} /> : <EyeOff size={15} />}
            </button>
          </div>
          <span className="text-[11px] font-medium bg-white/15 px-2.5 py-0.5 rounded-full backdrop-blur-xs border border-white/10 text-purple-100 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Dompet PMI Terverifikasi
          </span>
        </div>

        {/* Balance Amount */}
        <div className="mt-2.5 mb-4 relative z-10">
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
            {showBalance ? formatRupiah(balance) : 'Rp ••••••••'}
          </div>
          <p className="text-[11px] text-purple-200/80 mt-0.5">
            Estimasi: ≈ NT$ {Math.round(balance / 505).toLocaleString('id-ID')} • Aman & Terenkripsi Cloud Firestore
          </p>
        </div>

        {/* Action Buttons: + Top Up & Tarik Dana */}
        <div className="grid grid-cols-2 gap-2.5 relative z-10 pt-1">
          <button
            id="btn-top-up"
            onClick={() => setActiveModal('topup')}
            className="flex items-center justify-center gap-1.5 bg-white text-purple-800 hover:bg-purple-50 font-bold text-xs py-2.5 px-3 rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
          >
            <PlusCircle size={15} className="text-purple-600" />
            <span>+ Top Up</span>
          </button>

          <button
            id="btn-tarik-dana"
            onClick={() => setActiveModal('tarik')}
            className="flex items-center justify-center gap-1.5 bg-purple-600/60 hover:bg-purple-600/80 text-white font-semibold text-xs py-2.5 px-3 rounded-xl border border-white/20 backdrop-blur-xs transition-all active:scale-98 cursor-pointer"
          >
            <ArrowDownLeft size={15} className="text-purple-200" />
            <span>Tarik Dana</span>
          </button>
        </div>
      </div>

      {/* 4 Shortcuts Under Balance Card: Pemasukan, Pengeluaran, Kirim Uang, Riwayat */}
      <div
        id="balance-shortcuts-grid"
        className="mt-3 bg-white rounded-2xl p-3 shadow-xs border border-slate-100 grid grid-cols-4 gap-2 text-center"
      >
        {/* Pemasukan */}
        <button
          id="btn-shortcut-pemasukan"
          onClick={() => setActiveModal('pemasukan')}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl hover:bg-purple-50/60 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform border border-emerald-100">
            <ArrowDownLeft size={18} className="stroke-[2.2px]" />
          </div>
          <span className="text-[11px] font-semibold text-slate-700">Pemasukan</span>
        </button>

        {/* Pengeluaran */}
        <button
          id="btn-shortcut-pengeluaran"
          onClick={() => setActiveModal('pengeluaran')}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl hover:bg-purple-50/60 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform border border-rose-100">
            <ArrowUpRight size={18} className="stroke-[2.2px]" />
          </div>
          <span className="text-[11px] font-semibold text-slate-700">Pengeluaran</span>
        </button>

        {/* Kirim Uang (Remittance) */}
        <button
          id="btn-shortcut-kirim-uang"
          onClick={() => setActiveModal('kirim')}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl hover:bg-purple-50/60 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform border border-purple-100">
            <Send size={18} className="stroke-[2.2px]" />
          </div>
          <span className="text-[11px] font-semibold text-slate-700">Kirim Uang</span>
        </button>

        {/* Riwayat */}
        <button
          id="btn-shortcut-riwayat"
          onClick={() => setActiveModal('riwayat')}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl hover:bg-purple-50/60 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform border border-blue-100">
            <History size={18} className="stroke-[2.2px]" />
          </div>
          <span className="text-[11px] font-semibold text-slate-700">Riwayat</span>
        </button>
      </div>

      {/* Top Up Modal */}
      <Modal
        isOpen={activeModal === 'topup'}
        onClose={() => setActiveModal(null)}
        title="Top Up Saldo Dompet"
        subtitle="Pengisian Saldo Dompet PMI (Disimpan ke Cloud Firestore)"
      >
        {isSuccessMessage ? (
          <div className="py-6 text-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
              ✓
            </div>
            <h4 className="text-base font-bold text-slate-800">{isSuccessMessage}</h4>
            <p className="text-xs text-slate-500 mt-1">Saldo Anda telah diperbarui secara real-time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Pilih nominal top up cepat untuk kebutuhan remitansi atau tabungan:
            </p>
            <div className="grid grid-cols-3 gap-2">
              {['200000', '500000', '1000000', '2000000', '5000000', '10000000'].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setTopUpAmount(amt)}
                  className={`py-2 px-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    topUpAmount === amt
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-purple-50'
                  }`}
                >
                  {formatRupiah(parseInt(amt, 10))}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={handleTopUp}
                disabled={isProcessing}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-sm shadow-md shadow-purple-600/30 hover:opacity-95 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? 'Menyimpan ke Cloud...' : `Konfirmasi Top Up ${formatRupiah(parseInt(topUpAmount, 10))}`}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Tarik Dana Modal */}
      <Modal
        isOpen={activeModal === 'tarik'}
        onClose={() => setActiveModal(null)}
        title="Tarik Dana Saldo"
        subtitle="Penarikan ke Rekening Bank Pribadi"
      >
        <div className="space-y-3 py-2 text-center">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-2 text-xl font-bold">
            🏦
          </div>
          <h4 className="text-sm font-bold text-slate-800">Layanan Penarikan Terproteksi</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Untuk keamanan transaksi luar negeri, fitur penarikan dana otomatis terintegrasi dengan verifikasi identitas e-KTP dan approval bank mitra.
          </p>
          <div className="pt-3">
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700"
            >
              Mengerti
            </button>
          </div>
        </div>
      </Modal>

      {/* Kirim Uang Modal */}
      <Modal
        isOpen={activeModal === 'kirim'}
        onClose={() => setActiveModal(null)}
        title="Kirim Uang ke Indonesia 🇮🇩"
        subtitle="Layanan Kirim Uang Aman untuk Keluarga"
      >
        {isSuccessMessage ? (
          <div className="py-6 text-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
              ✓
            </div>
            <h4 className="text-base font-bold text-slate-800">{isSuccessMessage}</h4>
            <p className="text-xs text-slate-500 mt-1">Saldo dompet telah diperbarui di Firestore.</p>
          </div>
        ) : (
          <form onSubmit={handleSendMoney} className="space-y-3">
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-purple-700 font-medium">Kurs Hari Ini (NTD ke IDR)</span>
                <p className="text-sm font-bold text-purple-900">1 NT$ = Rp 505</p>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                Bebas Biaya Admin
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Nama Penerima di Indonesia:
              </label>
              <input
                type="text"
                value={transferRecipient}
                onChange={(e) => setTransferRecipient(e.target.value)}
                placeholder="Contoh: Ibu Siti / Bapak Sutrisno"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-purple-600 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Bank Tujuan:
                </label>
                <select
                  value={transferBank}
                  onChange={(e) => setTransferBank(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-purple-600 text-xs"
                >
                  <option value="BCA">BCA</option>
                  <option value="BRI">BRI</option>
                  <option value="Mandiri">Mandiri</option>
                  <option value="BNI">BNI</option>
                  <option value="BSI">BSI Syariah</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nominal (Rp):
                </label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="500000"
                  step="50000"
                  min="50000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-purple-600 text-xs"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing || !userId}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-sm shadow-md shadow-purple-600/30 hover:opacity-95 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing
                  ? 'Memproses Transfer...'
                  : `Kirim ${formatRupiah(parseInt(transferAmount, 10) || 0)} Sekarang`}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Riwayat / Pemasukan / Pengeluaran Modal */}
      <Modal
        isOpen={activeModal === 'riwayat' || activeModal === 'pemasukan' || activeModal === 'pengeluaran'}
        onClose={() => setActiveModal(null)}
        title="Riwayat Mutasi & Transaksi"
        subtitle="Aktivitas Keuangan Realtime Terkoneksi Firestore"
      >
        <div className="space-y-2.5 max-h-72 overflow-y-auto no-scrollbar pr-1">
          {transactions.length > 0 ? (
            transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      tx.amount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {tx.amount > 0 ? '+' : '-'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{tx.description}</p>
                    <span className="text-[10px] text-slate-400">
                      {new Date(tx.createdAt).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} • {tx.type.toUpperCase()}
                    </span>
                  </div>
                </div>
                <span className={`text-xs font-bold ${tx.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {tx.amount > 0 ? `+${formatRupiah(tx.amount)}` : `-${formatRupiah(Math.abs(tx.amount))}`}
                </span>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-slate-400 space-y-1">
              <History size={24} className="mx-auto text-slate-300 mb-1" />
              <p className="font-semibold text-slate-600 text-xs">Belum ada riwayat transaksi</p>
              <p className="text-[11px] text-slate-400">
                Setiap transaksi top up dan pengiriman uang akan tercatat otomatis secara aman di sini.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
