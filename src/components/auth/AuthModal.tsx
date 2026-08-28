import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, MapPin, Briefcase, X } from 'lucide-react';
import { registerWithEmail, loginWithEmail, getFriendlyAuthErrorMessage } from '../../firebase/auth';
import { APP_CONFIG } from '../../config/appConfig';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess: () => void;
  initialMode?: 'login' | 'register';
}

const COUNTRIES = [
  { name: 'Taiwan', flag: '🇹🇼' },
  { name: 'Hong Kong', flag: '🇭🇰' },
  { name: 'Singapura', flag: '🇸🇬' },
  { name: 'Malaysia', flag: '🇲🇾' },
  { name: 'Arab Saudi', flag: '🇸🇦' },
  { name: 'Korea Selatan', flag: '🇰🇷' },
  { name: 'Jepang', flag: '🇯🇵' },
  { name: 'Indonesia', flag: '🇮🇩' },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [country, setCountry] = useState<string>('Taiwan');
  const [city, setCity] = useState<string>('Taipei');
  const [occupation, setOccupation] = useState<string>('Pekerja Rumah Tangga / Caregiver');
  const [gender, setGender] = useState<'female' | 'male'>('female');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Silakan isi alamat email dan kata sandi Anda.');
      return;
    }

    if (mode === 'register') {
      if (!fullName.trim()) {
        setErrorMessage('Silakan masukkan nama lengkap Anda.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Kata sandi minimal terdiri dari 6 karakter.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Konfirmasi kata sandi tidak cocok.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        await registerWithEmail(fullName, email, password, {
          country,
          city: city.trim() || 'Taipei',
          occupation: occupation.trim() || 'PMI',
          gender,
        });
      } else {
        await loginWithEmail(email, password);
      }
      onSuccess();
    } catch (err: any) {
      console.warn('Auth notification:', err?.message || err);
      setErrorMessage(getFriendlyAuthErrorMessage(err?.code || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        id="auth-modal-card"
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
      >
        {/* Top Header with App Identity */}
        <div className="bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 p-5 text-white text-center relative shrink-0">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          )}
          <div className="w-10 h-10 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-center mx-auto mb-1.5 text-xl shadow-inner">
            🇮🇩
          </div>
          <span className="inline-block text-[10px] font-bold bg-white/20 text-purple-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
            {APP_CONFIG.NAME}
          </span>
          <h2 className="text-lg font-extrabold font-heading">
            {mode === 'login' ? 'Masuk ke Akun Anda' : 'Daftar Akun Sahabat PMI'}
          </h2>
          <p className="text-xs text-purple-200 mt-0.5">
            {mode === 'login'
              ? 'Terhubung dengan sesama rekan pekerja migran'
              : 'Gabung komunitas hangat & aman di perantauan'}
          </p>
        </div>

        {/* Form Container */}
        <div className="p-5 space-y-3.5 overflow-y-auto flex-1">
          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Nama Lengkap (Register only) */}
            {mode === 'register' && (
              <>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nama Lengkap</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Contoh: Agnesya Kartika"
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-purple-600 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Negara Kerja</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-purple-600"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Kota Saat Ini</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Contoh: Taipei"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Pekerjaan / Sektor</label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="Caregiver / Pabrik / Hospitality"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-purple-600"
                  />
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Alamat Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-purple-600 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Kata Sandi</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-purple-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Konfirmasi Password (Register only) */}
            {mode === 'register' && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Konfirmasi Kata Sandi</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi Anda"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-purple-600 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              id="btn-auth-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-600/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Masuk ke Aplikasi' : 'Daftar Akun Sekarang'}</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Toggle Login / Register */}
          <div className="pt-2 text-center text-xs text-slate-600 border-t border-slate-100">
            {mode === 'login' ? (
              <p>
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                  }}
                  className="font-bold text-purple-600 hover:underline cursor-pointer"
                >
                  Daftar di Sini
                </button>
              </p>
            ) : (
              <p>
                Sudah punya akun?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="font-bold text-purple-600 hover:underline cursor-pointer"
                >
                  Masuk Sekarang
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
