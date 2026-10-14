import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogoIcon } from '../components/BrandLogoIcon';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { Lock, User, KeyRound, Sparkles, ArrowLeft, ShieldCheck } from 'lucide-react';

export const AuthView: React.FC = () => {
  const { login, loginWithGoogle, register, forgotPassword, themeClasses, siteSettings } = useApp();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const res = login(username, password);
    if (!res.success) {
      setErrorMsg(res.message || 'Username atau password salah.');
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    await loginWithGoogle();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!fullName.trim()) {
      setErrorMsg('Nama lengkap wajib diisi.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password minimal 6 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok.');
      return;
    }

    const success = register(username, fullName, password);
    if (!success) {
      setErrorMsg('Gagal membuat akun.');
    }
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (password.length < 6) {
      setErrorMsg('Password minimal 6 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi password baru tidak cocok.');
      return;
    }

    forgotPassword(username, password);
    setMode('login');
  };

  return (
    <div
      className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden"
      style={{
        background:
          'radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--brand-primary, #047857) 35%, #0f172a) 0%, #0f172a 75%)',
      }}
    >
      {/* Background Architectural Accent */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <img
          src="/src/assets/images/banner_academic_pattern_1791464114520.jpg"
          alt="Backdrop"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Card Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100/10 backdrop-blur-xl">
          {/* Logo & School Header */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden shadow-md ring-2 ring-slate-200 mb-3 bg-slate-50 flex items-center justify-center p-1">
              <BrandLogoIcon className="w-full h-full object-contain" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {siteSettings.appName || 'Sistem Rapor Digital'}
            </h1>
            <p className={`text-xs ${themeClasses.primaryText} font-semibold mt-1`}>
              {siteSettings.subHeader || 'Pengumpulan Soal & Evaluasi Rapor Ujian'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {siteSettings.schoolName || 'Pesantren & Madrasah Baiturrahman'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center animate-in fade-in">
              {errorMsg}
            </div>
          )}

          {/* MODE: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Username Akun
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Masukkan username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 ${themeClasses.focusRing} focus:bg-white focus:outline-none transition-all font-medium`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Kata Sandi (Password)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 ${themeClasses.focusRing} focus:bg-white focus:outline-none transition-all font-medium`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-3 ${themeClasses.primary} ${themeClasses.primaryHover} text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer`}
              >
                <Lock className="w-4 h-4 text-white/80" />
                <span>Masuk ke Sistem (Login)</span>
              </button>

              {/* Google Sign-in Button */}
              <div className="relative my-3 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative bg-white px-3 text-[11px] font-medium text-slate-500">
                  atau lanjutkan dengan
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 shadow-xs transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Masuk dengan Akun Google</span>
              </button>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setMode('register');
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Daftar Akun Pendidik Baru
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setMode('forgot');
                  }}
                  className={`w-full py-1 text-xs ${themeClasses.primaryText} hover:opacity-80 font-medium hover:underline block text-center cursor-pointer`}
                >
                  Lupa Password?
                </button>

                <div className="pt-1">
                  <PWAInstallButton variant="auth" />
                </div>
              </div>
            </form>
          )}

          {/* MODE: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900">Pendaftaran Akun Guru</h2>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Kembali</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Username Unik
                </label>
                <input
                  type="text"
                  required
                  placeholder="Pilih username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 ${themeClasses.focusRing} focus:outline-none`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap & Gelar
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ust. Ahmad Fauzi, S.Pd."
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 ${themeClasses.focusRing} focus:outline-none`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kata Sandi
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 ${themeClasses.focusRing} focus:outline-none`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Konfirmasi Kata Sandi
                </label>
                <input
                  type="password"
                  required
                  placeholder="Ulangi kata sandi"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 ${themeClasses.focusRing} focus:outline-none`}
                />
              </div>

              <button
                type="submit"
                className={`w-full py-3 ${themeClasses.primary} ${themeClasses.primaryHover} text-white font-bold text-xs rounded-xl shadow-md transition-all mt-2 cursor-pointer`}
              >
                ✅ Daftar Sekarang
              </button>

              <div className="relative flex items-center justify-center py-1">
                <div className="border-t border-slate-200 w-full"></div>
                <span className="bg-white px-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  atau
                </span>
                <div className="border-t border-slate-200 w-full"></div>
              </div>

              <button
                type="button"
                disabled={isGoogleLoading}
                onClick={async () => {
                  setIsGoogleLoading(true);
                  await loginWithGoogle();
                  setIsGoogleLoading(false);
                }}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>
                  {isGoogleLoading
                    ? 'Menghubungkan Google...'
                    : 'Daftar dengan Akun Google'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Sudah punya akun? Masuk di sini
              </button>
            </form>
          )}

          {/* MODE: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900">Reset Kata Sandi</h2>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Kembali</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Username Anda
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 ${themeClasses.focusRing} focus:outline-none`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kata Sandi Baru
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 ${themeClasses.focusRing} focus:outline-none`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Konfirmasi Sandi Baru
                </label>
                <input
                  type="password"
                  required
                  placeholder="Ulangi kata sandi baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 ${themeClasses.focusRing} focus:outline-none`}
                />
              </div>

              <button
                type="submit"
                className={`w-full py-3 ${themeClasses.primary} ${themeClasses.primaryHover} text-white font-bold text-xs rounded-xl shadow-md transition-all mt-2 cursor-pointer`}
              >
                Reset Kata Sandi
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Batal & Kembali ke Login
              </button>
            </form>
          )}
        </div>

        <p className="text-[11px] text-slate-400 text-center mt-6">
          © {new Date().getFullYear()} {siteSettings.appName || 'Sistem Rapor Digital'} ·{' '}
          {siteSettings.schoolName || 'Pesantren & Madrasah Baiturrahman'}
        </p>
      </div>
    </div>
  );
};
