import { Menu, User, LogOut, Settings as SettingsIcon } from "lucide-react";
import { useState } from "react";

export default function Navbar({
  user,
  setMobileOpen,
  setActiveTab,
  onLogout,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="bg-slate-900/60 border-b border-slate-800/80 sticky top-0 z-30 backdrop-blur-md px-6 py-4 flex items-center justify-between" id="top-navbar">
      {/* Mobile Menu trigger */}
      <div className="flex items-center gap-3.5 mr-2">
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
          id="btn-trigger-mobile-sidebar"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* User Dropdown */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/50 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer text-slate-300 hover:text-white"
          id="btn-profile-dropdown"
        >
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center font-bold text-white text-xs">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs font-semibold hidden sm:inline">{user.fullName}</span>
          <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {dropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setDropdownOpen(false)}
            />
            <div className="absolute right-0 mt-2.5 w-52 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl z-50 animate-scale-in" id="dropdown-menu">
              <div className="px-3 py-2 border-b border-slate-800 mb-1.5 text-slate-400">
                <p className="text-xs font-bold text-slate-200 truncate">{user.fullName}</p>
                <p className="text-[10px] font-mono truncate mt-0.5">{user.email}</p>
              </div>

              <button
                onClick={() => {
                  setActiveTab("settings");
                  setDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left cursor-pointer"
                id="dropdown-settings"
              >
                <SettingsIcon size={14} />
                <span>Account Settings</span>
              </button>

              <button
                onClick={() => {
                  onLogout();
                  setDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left mt-1 cursor-pointer"
                id="dropdown-logout"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
