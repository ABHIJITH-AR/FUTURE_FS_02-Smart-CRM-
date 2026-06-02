import { LayoutDashboard, Users, LineChart, Settings, LogOut, Menu, X } from "lucide-react";
import Logo from "./Logo";

export default function Sidebar({
  activeTab,
  setActiveTab,
  user,
  onLogout,
  mobileOpen,
  setMobileOpen,
}) {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "clients",
      label: "Leads",
      icon: Users,
    },
    {
      id: "analysis",
      label: "Analysis",
      icon: LineChart,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-slate-900 border-r border-slate-800 p-4" id="sidebar-panel">
      <div>
        {/* Logo and Brand */}
        <div className="flex items-center justify-between mb-8 px-2">
          <Logo size="sm" />
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
            id="btn-close-mobile-menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Menu Navigation */}
        <nav className="space-y-1.5" id="sidebar-nav">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer text-left group ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500/20 to-violet-600/20 text-blue-400 border-l-4 border-violet-500 shadow-[inset_0_0_12px_rgba(139,92,246,0.1)] "
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                }`}
                id={`nav-${item.id}`}
              >
                <Icon
                  size={18}
                  className={`transition-colors duration-200 ${
                    isActive ? "text-violet-400" : "text-slate-400 group-hover:text-slate-200"
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Information & Logout */}
      <div className="border-t border-slate-800 pt-4" id="sidebar-footer">
        {user && (
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center font-bold text-white shadow-[0_0_10px_rgba(59,130,246,0.2)]">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-200 truncate leading-tight">
                {user.fullName}
              </p>
              <p className="text-xs text-slate-505 truncate mt-0.5">
                {user.email}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 cursor-pointer"
          id="btn-logout"
        >
          <LogOut size={16} />
          <span>Logout Securely</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 h-screen shrink-0 sticky top-0" id="desktop-sidebar">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
          id="mobile-backdrop"
        />
      )}

      {/* Mobile Sidebar Cabinet */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 w-64 h-full z-50 transition-transform duration-300 transform ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        id="mobile-sidebar"
      >
        {sidebarContent}
      </div>
    </>
  );
}
