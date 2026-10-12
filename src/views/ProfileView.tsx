import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  User as UserIcon,
  Edit2,
  KeyRound,
  LogOut,
  ShieldCheck,
  X,
  Database,
  Settings,
  ArrowRight,
  Camera,
  Upload,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    isSuperAdmin,
    themeClasses,
    updateProfile,
    changePassword,
    logout,
    isSyncing,
    lastSyncedAt,
    setCurrentView,
    setManageTab,
    showToast,
  } = useApp();

  // Modal States
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // Edit profile state
  const [editFullName, setEditFullName] = useState(currentUser?.fullName || '');
  const [editAvatarUrl, setEditAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const directFileInputRef = useRef<HTMLInputElement | null>(null);
  const modalFileInputRef = useRef<HTMLInputElement | null>(null);

  // Change password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Close modals on Escape key
  useEffect(() => {
    if (!showEditProfileModal && !showChangePasswordModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowEditProfileModal(false);
        setShowChangePasswordModal(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showEditProfileModal, showChangePasswordModal]);

  if (!currentUser) return null;

  // Compress and center-crop uploaded image to a crisp 320x320 square Data URL
  const processImageFileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Format file harus berupa gambar (JPG, PNG, WEBP).'));
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
      reader.onload = () => {
        const resultStr = reader.result as string;
        const img = new window.Image();
        img.onerror = () => resolve(resultStr);
        img.onload = () => {
          try {
            const targetSize = 320;
            const canvas = document.createElement('canvas');
            canvas.width = targetSize;
            canvas.height = targetSize;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(resultStr);
              return;
            }
            // Center-crop square
            const minSide = Math.min(img.width, img.height);
            const sx = (img.width - minSide) / 2;
            const sy = (img.height - minSide) / 2;
            ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, targetSize, targetSize);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
            resolve(compressedDataUrl);
          } catch {
            resolve(resultStr);
          }
        };
        img.src = resultStr;
      };
      reader.readAsDataURL(file);
    });
  };

  // Direct upload from main profile card
  const handleDirectAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsProcessingImage(true);
      const dataUrl = await processImageFileToDataUrl(file);
      updateProfile(currentUser.fullName, dataUrl);
      setEditAvatarUrl(dataUrl);
    } catch (err: any) {
      showToast(err?.message || 'Gagal mengunggah foto profil.', 'error');
    } finally {
      setIsProcessingImage(false);
      e.target.value = '';
    }
  };

  // Upload inside Edit Profile Modal
  const handleModalAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsProcessingImage(true);
      const dataUrl = await processImageFileToDataUrl(file);
      setEditAvatarUrl(dataUrl);
      showToast('Foto berhasil dipilih. Klik Simpan Perubahan untuk menerapkan.', 'info');
    } catch (err: any) {
      showToast(err?.message || 'Gagal membaca gambar.', 'error');
    } finally {
      setIsProcessingImage(false);
      e.target.value = '';
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFullName.trim()) return;
    updateProfile(editFullName.trim(), editAvatarUrl);
    setShowEditProfileModal(false);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (newPassword.length < 6) {
      setPasswordError('Password baru minimal 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi password tidak cocok.');
      return;
    }
    changePassword(oldPassword, newPassword);
    setShowChangePasswordModal(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UserIcon className={`w-5 h-5 ${themeClasses.primaryText}`} />
            <span>Profil Pengguna & Akun</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Informasi akun, foto profil, keamanan kredensial, dan status hak akses sistem.
          </p>
        </div>

        {isSuperAdmin && (
          <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full ${themeClasses.badge} border text-xs font-bold`}>
            <ShieldCheck className="w-4 h-4 text-current" />
            <span>Mode Super Admin Aktif</span>
          </div>
        )}
      </div>

      {/* Main Profile Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs text-center space-y-5">
        {/* Hidden File Input for Direct Avatar Upload */}
        <input
          ref={directFileInputRef}
          type="file"
          accept="image/*"
          onChange={handleDirectAvatarUpload}
          className="hidden"
        />

        {/* Avatar with Interactive Upload Overlay & Camera Button */}
        <div className="flex flex-col items-center gap-2.5">
          <div
            onClick={() => directFileInputRef.current?.click()}
            className="relative inline-block group cursor-pointer"
            title="Klik untuk mengganti foto profil"
          >
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.fullName}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover mx-auto ring-4 ring-slate-200 group-hover:ring-slate-300 shadow-md transition-all"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold gap-1">
              <Camera className="w-5 h-5" />
              <span>Ganti Foto</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                directFileInputRef.current?.click();
              }}
              className={`absolute bottom-0.5 right-0.5 w-8 h-8 rounded-full ${themeClasses.primary} ${themeClasses.primaryHover} ring-2 ring-white flex items-center justify-center text-white shadow-sm transition-transform hover:scale-105 cursor-pointer`}
              title="Upload Foto Profil Baru"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => directFileInputRef.current?.click()}
            disabled={isProcessingImage}
            className="inline-flex items-center gap-1.5 h-7 px-3 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/90 text-[11px] font-semibold transition-colors cursor-pointer"
          >
            <Upload className="w-3 h-3" />
            <span>{isProcessingImage ? 'Memproses Gambar...' : 'Upload Foto Profil'}</span>
          </button>
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">{currentUser.fullName}</h2>
          <p className="text-xs text-slate-500 font-medium">@{currentUser.username}</p>
          <div className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full ${themeClasses.badge} border text-xs font-semibold`}>
            <ShieldCheck className="w-3.5 h-3.5 text-current" />
            <span>
              {isSuperAdmin
                ? 'Super Administrator (Akses Penuh)'
                : currentUser.role === 'wali_kelas'
                ? 'Wali Kelas'
                : 'Tenaga Pendidik / Guru'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-1 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => {
              setEditFullName(currentUser.fullName);
              setEditAvatarUrl(currentUser.avatarUrl);
              setShowEditProfileModal(true);
            }}
            className={`btn-precision w-full ${themeClasses.primary} ${themeClasses.primaryHover} text-white transition-colors shadow-2xs cursor-pointer`}
          >
            <Edit2 className="w-3.5 h-3.5 text-current shrink-0" />
            <span>Edit Profil</span>
          </button>

          <button
            type="button"
            onClick={() => setShowChangePasswordModal(true)}
            className="btn-precision w-full bg-slate-800 hover:bg-slate-700 text-white transition-colors shadow-2xs cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-current shrink-0" />
            <span>Ubah Password</span>
          </button>
        </div>

        {/* Account Info Details */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 text-left max-w-md mx-auto space-y-2 text-xs">
          <h3 className="font-bold text-slate-800 border-b border-slate-200/60 pb-2 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <Database className={`w-4 h-4 ${themeClasses.primaryText}`} />
              <span>Status Koneksi Database</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {isSyncing ? 'Sinkron DB...' : 'Terhubung DB'}
            </span>
          </h3>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Seluruh perubahan data santri, nilai akademik, tahfidz, rapor digital, identitas lembaga, dan bank soal tersinkronisasi secara otomatis dengan database setiap ada perubahan pada web
            {lastSyncedAt ? ` (Sinkron terakhir: ${lastSyncedAt})` : ''}.
          </p>
        </div>

        {/* Account Credentials Details */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 text-left max-w-md mx-auto space-y-2 text-xs">
          <h3 className="font-bold text-slate-800 border-b border-slate-200/60 pb-2 flex items-center gap-2">
            <UserIcon className={`w-4 h-4 ${themeClasses.primaryText}`} />
            <span>Informasi Kredensial Akun</span>
          </h3>
          <div className="flex justify-between items-center text-slate-600">
            <span>Username:</span>
            <span className="font-semibold text-slate-900">@{currentUser.username}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span>Nama Lengkap:</span>
            <span className="font-semibold text-slate-900">{currentUser.fullName}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span>Email Terdaftar:</span>
            <span className="font-semibold text-slate-900">{currentUser.email || '-'}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span>Tipe Akses:</span>
            <span className={`font-semibold ${themeClasses.primaryText}`}>{currentUser.role}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span>Bergabung Sejak:</span>
            <span className="font-semibold text-slate-900">{currentUser.joinedDate}</span>
          </div>
        </div>

        {/* Super Admin Centralized Settings Shortcut */}
        {isSuperAdmin && (
          <div className={`p-4 rounded-xl ${themeClasses.primaryLightBg} border ${themeClasses.primaryBorder} text-left max-w-md mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
            <div>
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Settings className={`w-4 h-4 ${themeClasses.primaryText}`} />
                <span>Pengaturan Super Admin Terpusat</span>
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                Seluruh pengaturan warna web, tampilan, identitas lembaga, format rapor PDF, pengguna & database berada di halaman <strong>Kelola Data</strong>.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setCurrentView('manage');
                setManageTab('superadmin');
              }}
              className={`btn-precision w-full sm:w-auto ${themeClasses.primary} ${themeClasses.primaryHover} text-white shrink-0 cursor-pointer shadow-2xs`}
            >
              <span>Kelola Data</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Logout Button */}
        <div className="pt-2 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => logout()}
            className="btn-precision w-full bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors border border-rose-200 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-700" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </div>

      {/* EDIT PROFILE MODAL (Closes automatically when clicking outside on the backdrop) */}
      {showEditProfileModal && (
        <div
          onClick={() => setShowEditProfileModal(false)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Edit Profil & Foto Pengguna</h3>
              <button
                type="button"
                onClick={() => setShowEditProfileModal(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4 text-current" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {/* Avatar Live Preview & Upload Button */}
              <div className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <img
                  src={editAvatarUrl || currentUser.avatarUrl}
                  alt="Preview"
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-200 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <label className="block text-xs font-bold text-slate-800">
                    Foto Profil Anda
                  </label>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Unggah foto dari komputer/HP Anda (JPG, PNG, WEBP).
                  </p>
                  <input
                    ref={modalFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleModalAvatarUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => modalFileInputRef.current?.click()}
                    disabled={isProcessingImage}
                    className={`h-8 px-3 rounded-lg ${themeClasses.primary} ${themeClasses.primaryHover} text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isProcessingImage ? 'Memproses...' : 'Pilih & Upload Gambar'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full h-9 px-3 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-600 block mb-1.5">
                  Atau Pilih Avatar Bawaan:
                </span>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      setEditAvatarUrl('/src/assets/images/avatar_muhammad_siroj_1791464103883.jpg')
                    }
                    className={`w-10 h-10 rounded-full overflow-hidden ring-2 focus:outline-none cursor-pointer transition-all ${
                      editAvatarUrl === '/src/assets/images/avatar_muhammad_siroj_1791464103883.jpg'
                        ? 'ring-emerald-600 scale-105'
                        : 'ring-slate-300 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img
                      src="/src/assets/images/avatar_muhammad_siroj_1791464103883.jpg"
                      alt="Ustadz Siroj"
                      className="w-full h-full object-cover"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEditAvatarUrl('/src/assets/images/logo_baiturrahman_1791464090153.jpg')
                    }
                    className={`w-10 h-10 rounded-full overflow-hidden ring-2 focus:outline-none cursor-pointer transition-all ${
                      editAvatarUrl === '/src/assets/images/logo_baiturrahman_1791464090153.jpg'
                        ? 'ring-emerald-600 scale-105'
                        : 'ring-slate-300 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img
                      src="/src/assets/images/logo_baiturrahman_1791464090153.jpg"
                      alt="Logo Emblem"
                      className="w-full h-full object-cover"
                    />
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:flex sm:justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="btn-precision w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`btn-precision w-full sm:w-auto ${themeClasses.primary} ${themeClasses.primaryHover} text-white`}
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL (Closes automatically when clicking outside on the backdrop) */}
      {showChangePasswordModal && (
        <div
          onClick={() => setShowChangePasswordModal(false)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Ubah Password Akun</h3>
              <button
                type="button"
                onClick={() => setShowChangePasswordModal(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4 text-current" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3">
              {passwordError && (
                <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium">
                  {passwordError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password Lama
                </label>
                <input
                  type="password"
                  required
                  placeholder="Masukkan password saat ini"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password Baru
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimal 6 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  required
                  placeholder="Ulangi password baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:flex sm:justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(false)}
                  className="btn-precision w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`btn-precision w-full sm:w-auto ${themeClasses.primary} ${themeClasses.primaryHover} text-white`}
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
