"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import {
  User as UserIcon,
  Mail,
  Lock,
  Edit3,
  ChevronRight,
  X,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { useAuthStore } from "@/stores/authStore";
import axiosInstance from "@/lib/axios";
import { ApiError, ApiSuccess } from "@/app/types";
import {
  profileSchema,
  changePasswordSchema,
  ProfileFormValues,
  ChangePasswordFormValues,
} from "@/lib/validations";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url: string | null;
}

export default function ProfilPage() {
  const router = useRouter();
  const { isAuthenticated, user, accessToken, setAuth } = useAuthStore();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View/Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Avatar upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Password visibility
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Success messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // ── Guard: Redirect if not authenticated ──
  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, router]);

  // ── Fetch Profile on Mount ──
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get<ApiSuccess<UserProfile>>("/auth/me");
      setProfile(res.data.data);
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      setError(axiosErr.response?.data?.message || "Gagal memuat profil");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  // ── Edit Profile Form ──
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
    reset: resetProfile,
    setError: setProfileFormError,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  // Pre-populate Edit Profile Form
  useEffect(() => {
    if (profile) {
      resetProfile({
        name: profile.name,
        email: profile.email,
      });
    }
  }, [profile, resetProfile]);

  // Avatar file upload handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setProfileFormError("root", {
          message: "Ukuran file maksimal adalah 2MB.",
        });
        return;
      }
      if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
        setProfileFormError("root", {
          message: "Format file harus PNG atau JPG.",
        });
        return;
      }
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedFile(null);
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(null);
    }
    if (profile) {
      resetProfile({
        name: profile.name,
        email: profile.email,
      });
    }
  };

  const onEditProfileSubmit = async (values: ProfileFormValues) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email);
      if (selectedFile) {
        formData.append("avatar", selectedFile);
      }
      formData.append("_method", "PUT");

      const res = await axiosInstance.post<ApiSuccess<UserProfile>>(
        "/auth/profile",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const updated = res.data.data;
      setProfile(updated);

      // Sync user name to Zustand Auth Store so navbar greeting updates immediately
      if (accessToken && user) {
        setAuth(accessToken, {
          ...user,
          name: updated.name,
        });
      }

      setSuccessMessage("Profil Anda berhasil diperbarui.");
      setIsEditing(false);
      setSelectedFile(null);
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
        setAvatarPreview(null);
      }
      
      // Clear success notification after 4s
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      const msg = axiosErr.response?.data?.message || "Gagal memperbarui profil";
      setProfileFormError("root", { message: msg });
    }
  };

  // ── Change Password Form ──
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
    reset: resetPassword,
    setError: setPasswordFormError,
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onChangePasswordSubmit = async (values: ChangePasswordFormValues) => {
    try {
      await axiosInstance.put<ApiSuccess<any>>("/auth/change-password", {
        current_password: values.current_password,
        new_password: values.new_password,
      });

      setSuccessMessage("Password Anda berhasil diubah.");
      setIsPasswordModalOpen(false);
      resetPassword();

      // Reset visibility states
      setShowCurrentPass(false);
      setShowNewPass(false);
      setShowConfirmPass(false);

      // Clear success notification after 4s
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      const msg = axiosErr.response?.data?.message || "Gagal mengubah password";
      setPasswordFormError("root", { message: msg });
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-white font-sans pb-24">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm mb-4">
          <Link href="/" className="text-black/25 hover:text-black/50 transition-colors font-medium">
            Beranda
          </Link>
          <svg
            className="h-3 w-3 text-black/25"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <button
            onClick={handleCancelEdit}
            className="text-black/25 hover:text-black/50 transition-colors font-medium cursor-pointer bg-transparent border-0 p-0"
            type="button"
          >
            Lihat Profile
          </button>
          {isEditing && (
            <>
              <svg
                className="h-3 w-3 text-black/25"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-black/70 font-medium">Edit Profile</span>
            </>
          )}
        </div>

        {/* Main Title and Subtitle */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black/70 mb-2">
            {isEditing ? "Edit Profile" : "Profile Saya"}
          </h1>
          <p className="text-black/25 text-lg">
            {isEditing ? "Perbarui informasi profil dan akun Anda" : "Kelola informasi profil dan akun Anda"}
          </p>
        </div>

        {/* Global Toast/Alert Message */}
        {successMessage && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 flex items-start gap-3 shadow-sm animate-fade-in-down">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Berhasil!</p>
              <p className="text-sm opacity-90">{successMessage}</p>
            </div>
          </div>
        )}

        {loading ? (
          /* Initial Loading State */
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-12 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-400 font-medium">Memuat data profil...</p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-12 flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">Gagal Memuat Profil</h3>
            <p className="text-gray-500 mb-6 max-w-sm">{error}</p>
            <button
              onClick={fetchProfile}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              Coba Lagi
            </button>
          </div>
        ) : profile ? (
          
          isEditing ? (
            /* Edit Profile Card (Active Mode) */
            <div className="bg-white border-[0.5px] border-gray-300 rounded-[10px] shadow-sm w-full overflow-hidden">
              {/* Two Column Section */}
              <div className="flex flex-col md:flex-row">
                
                {/* Left Column: Profile Photo Upload */}
                <div className="w-full md:w-[260px] flex-shrink-0 flex flex-col items-center border-b md:border-b-0 md:border-r border-gray-200 p-8 md:p-10">
                  {/* Heading — same size as right column */}
                  <h2 className="text-2xl font-bold text-black/80 mb-6 w-full text-center">
                    Foto Profile
                  </h2>

                  {/* Avatar Circle — centered */}
                  <div className="w-44 h-44 mb-6 rounded-full bg-[#c8d5e8] overflow-hidden flex items-center justify-center mx-auto">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Avatar Current"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      /* Avatar person icon — fully visible, centered, matching reference image */
                      <svg
                        viewBox="0 0 100 90"
                        className="w-[58%] h-[58%] fill-current text-[#4a6fa5]"
                      >
                        {/* Head */}
                        <circle cx="50" cy="28" r="18" />
                        {/* Body/shoulders */}
                        <path d="M50 52c-22 0-34 13-34 24v6h68v-6c0-11-12-24-34-24z" />
                      </svg>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="w-full text-center">
                    <p className="text-gray-700 font-medium mb-3 text-sm">Upload Image :</p>
                    {/* Choose File + filename on one line, no truncation */}
                    <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
                      <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm whitespace-nowrap">
                        <span>Choose File</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/png, image/jpeg"
                          onChange={handleFileChange}
                        />
                      </label>
                      <span className="text-gray-400 text-sm whitespace-nowrap">
                        {selectedFile ? selectedFile.name : "No File Chosen"}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed mb-1">
                      Jika tidak mengubah gambar,<br />kolom ini tidak perlu diiisi
                    </p>
                    <p className="text-gray-400 text-xs">
                      Format : JPG, PNG. Maks 2MB
                    </p>
                  </div>
                </div>

                {/* Right Column: Account Information Form */}
                <div className="flex-1 flex flex-col p-8 md:p-10">
                  {/* Heading — same size as left column */}
                  <h2 className="text-2xl font-bold text-black/80 mb-6">
                    Informasi Akun
                  </h2>

                  <form id="edit-profile-form" onSubmit={handleSubmitProfile(onEditProfileSubmit)} className="space-y-5 flex-grow">
                    
                    {/* Form Root Error */}
                    {profileErrors.root && (
                      <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <span>{profileErrors.root.message}</span>
                      </div>
                    )}

                    {/* Name Input Field */}
                    <div>
                      <label className="block text-gray-800 font-medium mb-1.5 text-sm">
                        Nama
                      </label>
                      <div className="relative">
                        {/* User icon — outline style matching Figma */}
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          {...registerProfile("name")}
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-700 bg-white text-sm transition-all ${
                            profileErrors.name ? "border-red-400 focus:ring-red-400" : "border-gray-300"
                          }`}
                          placeholder=""
                        />
                      </div>
                      {profileErrors.name && (
                        <p className="mt-1 ml-4 text-xs text-red-500">{profileErrors.name.message}</p>
                      )}
                    </div>

                    {/* Email Input Field */}
                    <div>
                      <label className="block text-gray-800 font-medium mb-1.5 text-sm">
                        Email
                      </label>
                      <div className="relative">
                        {/* Mail icon — outline style matching Figma */}
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                          </svg>
                        </div>
                        <input
                          type="email"
                          {...registerProfile("email")}
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-700 bg-white text-sm transition-all ${
                            profileErrors.email ? "border-red-400 focus:ring-red-400" : "border-gray-300"
                          }`}
                          placeholder=""
                        />
                      </div>
                      {profileErrors.email && (
                        <p className="mt-1 ml-4 text-xs text-red-500">{profileErrors.email.message}</p>
                      )}
                    </div>

                  </form>
                </div>
              </div>

              {/* Action Buttons Row — full-width bottom of card */}
              <div className="flex items-center justify-end gap-3 px-8 md:px-10 py-5 border-t border-gray-200 bg-white">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isProfileSubmitting}
                  className="px-8 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  form="edit-profile-form"
                  disabled={isProfileSubmitting}
                  className="px-8 py-2.5 bg-[#1d5bb4] hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 text-sm disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isProfileSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Perubahan</span>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Main Profile Card (View Mode) */
            <div className="bg-white border-[0.5px] border-gray-300 rounded-[10px] shadow-sm p-8 md:p-12 w-full">
              
              {/* Top Section: Account Information */}
              <div className="flex flex-col md:flex-row gap-12">
                
                {/* Large Avatar */}
                <div className="flex-shrink-0 flex justify-center md:justify-start">
                  <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-[#838383]/10 flex items-center justify-center overflow-hidden relative border border-gray-200/50">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg
                        viewBox="0 0 100 100"
                        className="w-2/3 h-2/3 text-[#838383]/40 fill-current translate-y-3.5"
                      >
                        <circle cx="50" cy="35" r="18" />
                        <path d="M50 58c-22 0-32 12-32 22v5h64v-5c0-10-10-22-32-22z" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Information Details */}
                <div className="flex-grow w-full md:pl-4">
                  
                  {/* Section Header & Action Button */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                    <h2 className="text-3xl font-bold text-black/70">
                      Informasi Akun
                    </h2>
                    <button
                      onClick={() => {
                        setIsEditing(true);
                      }}
                      className="bg-[#1d5bb4] hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors text-sm shadow-sm cursor-pointer"
                    >
                      <Edit3 size={16} />
                      <span>Edit Profil</span>
                    </button>
                  </div>

                  {/* Data Fields */}
                  <div className="space-y-8">
                    {/* Name Field */}
                    <div className="flex items-center gap-6">
                      <div className="w-8 flex justify-center">
                        <UserIcon className="w-6 h-7 text-black/70" />
                      </div>
                      <div className="w-24 text-black/25 text-xl font-medium">Nama</div>
                      <div className="text-black/70 text-xl font-semibold truncate">
                        {profile.name}
                      </div>
                    </div>

                    {/* Email Field */}
                    <div className="flex items-center gap-6">
                      <div className="w-8 flex justify-center">
                        <Mail className="w-7 h-7 text-black/70" />
                      </div>
                      <div className="w-24 text-black/25 text-xl font-medium">Email</div>
                      <div className="text-black/70 text-xl font-semibold truncate">
                        {profile.email}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Horizontal Divider stretching full width of card */}
              <hr className="border-t border-gray-300 my-12" />

              {/* Bottom Section: Account Security */}
              <div>
                
                {/* Heading and Button Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                  <h2 className="text-3xl font-bold text-black/70">
                    Keamanan Akun
                  </h2>
                  <button
                    onClick={() => {
                      resetPassword();
                      setIsPasswordModalOpen(true);
                    }}
                    className="border border-[#1d5bb4] text-[#1d5bb4] hover:bg-blue-50 bg-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors text-sm shadow-sm cursor-pointer"
                  >
                    <Lock size={16} />
                    <span>Ubah Password</span>
                  </button>
                </div>

                {/* Password Field Row */}
                <div className="flex items-center gap-6 md:ml-4">
                  <div className="w-8 flex justify-center">
                    <Lock className="w-6 h-7 text-black/70" />
                  </div>
                  <div className="w-24 text-black/25 text-xl font-medium">Pasword</div>
                  <div className="text-black/70 text-4xl tracking-[0.2em] leading-none mt-2 select-none">
                    ••••••••
                  </div>
                </div>

              </div>

            </div>
          )
        ) : null}

      </div>

      {/* ── CHANGE PASSWORD MODAL ── */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 md:p-8 shadow-2xl relative animate-scale-up">
            
            {/* Close Button */}
            <button
              onClick={() => setIsPasswordModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Ubah Password Akun
            </h3>

            <form onSubmit={handleSubmitPassword(onChangePasswordSubmit)} className="space-y-5">
              
              {/* Form Root Error */}
              {passwordErrors.root && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>{passwordErrors.root.message}</span>
                </div>
              )}

              {/* Current Password Input */}
              <div>
                <label htmlFor="current-password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Password Saat Ini
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    id="current-password"
                    {...registerPassword("current_password")}
                    className={`w-full bg-white rounded-xl border px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-shadow text-gray-800 ${
                      passwordErrors.current_password ? "border-red-400" : "border-gray-250"
                    }`}
                    placeholder="Masukkan password saat ini"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordErrors.current_password && (
                  <p className="mt-1 text-xs text-red-500">
                    {passwordErrors.current_password.message}
                  </p>
                )}
              </div>

              {/* New Password Input */}
              <div>
                <label htmlFor="new-password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    id="new-password"
                    {...registerPassword("new_password")}
                    className={`w-full bg-white rounded-xl border px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-shadow text-gray-800 ${
                      passwordErrors.new_password ? "border-red-400" : "border-gray-250"
                    }`}
                    placeholder="Minimal 8 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordErrors.new_password && (
                  <p className="mt-1 text-xs text-red-500">
                    {passwordErrors.new_password.message}
                  </p>
                )}
              </div>

              {/* Confirm New Password Input */}
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    id="confirm-password"
                    {...registerPassword("new_password_confirmation")}
                    className={`w-full bg-white rounded-xl border px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-shadow text-gray-800 ${
                      passwordErrors.new_password_confirmation ? "border-red-400" : "border-gray-250"
                    }`}
                    placeholder="Ulangi password baru"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordErrors.new_password_confirmation && (
                  <p className="mt-1 text-xs text-red-500">
                    {passwordErrors.new_password_confirmation.message}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  disabled={isPasswordSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPasswordSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 transition-colors text-sm disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isPasswordSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mengubah...</span>
                    </>
                  ) : (
                    <span>Ubah Password</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
