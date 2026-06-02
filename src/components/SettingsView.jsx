import React, { useState, useEffect } from "react";
import { User, AlertCircle, Save, Key, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

export default function SettingsView({
  user,
  onUpdateProfile,
  onChangePassword,
  setErrorAlert,
  setSuccessAlert,
}) {
  // Profile Info form
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);

  // Sync profile options
  useEffect(() => {
    setFullName(user.fullName);
    setEmail(user.email);
  }, [user]);

  // Password Update form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [pwdError, setPwdError] = useState(null);

  const handleUpdateProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError(null);

    if (!fullName.trim() || !email.trim()) {
      setProfileError("Full Name and Email cannot be empty.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setProfileError("Please provide a valid email format.");
      return;
    }

    setIsUpdatingProfile(true);
    const success = await onUpdateProfile(fullName.trim(), email.trim());
    setIsUpdatingProfile(false);

    if (success) {
      setSuccessAlert("Your CRM profile has been successfully updated.");
    } else {
      setProfileError("Failed to update profile details. Email might already be taken.");
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdError(null);

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPwdError("All password inputs are required.");
      return;
    }

    if (newPassword.length < 6) {
      setPwdError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPwdError("New password and confirm passwords do not match.");
      return;
    }

    setIsUpdatingPassword(true);
    const success = await onChangePassword(currentPassword, newPassword);
    setIsUpdatingPassword(false);

    if (success) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setSuccessAlert("Your security credential password has been updated.");
    } else {
      setPwdError("Current password verification failed.");
    }
  };

  return (
    <div className="space-y-8" id="settings-view">
      {/* Header title */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
          Account Security & Preferences
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-medium">
          Manage your personal administration profile parameters and credential updates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 md:p-8 backdrop-blur-md shadow-xl"
          id="profile-settings-card"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <User size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">CRM Operator Details</h3>
              <p className="text-xs text-slate-500">Correct your identifying credentials.</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfileSubmit} className="space-y-4">
            {profileError && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2 text-xs text-red-400">
                <AlertCircle size={14} />
                <span>{profileError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Operator Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                id="settings-fullname"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                id="settings-email"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl shadow-[0_4px_15px_rgba(59,130,246,0.3)] transition-all cursor-pointer w-full"
              id="btn-settings-profile-save"
            >
              {isUpdatingProfile ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Save size={14} />
                  <span>Update Profile</span>
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Change Password Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 md:p-8 backdrop-blur-md shadow-xl"
          id="password-settings-card"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Key size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Update Encryption Key</h3>
              <p className="text-xs text-slate-505">Alter your dashboard entry password.</p>
            </div>
          </div>

          <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
            {pwdError && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2 text-xs text-red-400">
                <AlertCircle size={14} />
                <span>{pwdError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Current Passcode
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                id="settings-current-pwd"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                New Passcode
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                id="settings-new-pwd"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Confirm New Passcode
              </label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Repeat new passcode"
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                id="settings-confirm-pwd"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl shadow-[0_4px_15px_rgba(139,92,246,0.3)] transition-all cursor-pointer w-full"
              id="btn-settings-password-save"
            >
              {isUpdatingPassword ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <ShieldCheck size={14} />
                  <span>Submit</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
