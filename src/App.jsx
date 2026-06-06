import { useState, useEffect } from "react";
import AuthView from "./components/AuthView";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import DashboardView from "./components/DashboardView";
import ClientsView from "./components/ClientsView";
import SettingsView from "./components/SettingsView";
import AnalysisView from "./components/AnalysisView";
import { motion, AnimatePresence } from "motion/react";
import { AlertCircle, CheckCircle2, Info, Loader2 } from "lucide-react";

export default function App() {
  const [token, setToken] = useState(() => {
    return localStorage.getItem("smart_crm_token") || sessionStorage.getItem("smart_crm_token") || null;
  });
  const [user, setUser] = useState(null);
  const [clients, setClients] = useState([]);

  // Page Routing & Layout States
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isInitializing, setIsInitializing] = useState(true);
  const [isClientsLoading, setIsClientsLoading] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Global Toast Alert Notification System
  const [alert, setAlert] = useState(null);

  const showToast = (message, type = "success") => {
    setAlert({ message, type });
    // Automatically fade out after 4 seconds
    setTimeout(() => {
      setAlert((prev) => (prev && prev.message === message ? null : prev));
    }, 4000);
  };

  const safeParseJson = async (response) => {
    try {
      const text = await response.text();
      return text.trim() ? JSON.parse(text) : {};
    } catch (err) {
      console.warn("CRM JSON parsing failed, returning empty error fallback.", err);
      return { error: `Server answered with status code ${response.status}.` };
    }
  };

  // 1. Authenticate cached token and boot state setup
  useEffect(() => {
    const initCRM = async () => {
      if (!token) {
        setIsInitializing(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const userData = await safeParseJson(response);
          setUser(userData);
          // Load CRM Client Ledger
          await fetchClients(token);
        } else {
          // Token is dead, discard silently
          localStorage.removeItem("smart_crm_token");
          sessionStorage.removeItem("smart_crm_token");
          setToken(null);
        }
      } catch (err) {
        console.error("Connection failed during CRM initialization", err);
        showToast("Operator connection error. Running offline mode...", "info");
      } finally {
        setIsInitializing(false);
      }
    };

    initCRM();
  }, [token]);

  // Fetch client leads helper
  const fetchClients = async (authToken) => {
    setIsClientsLoading(true);
    try {
      const response = await fetch("/api/clients", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const clientsData = await safeParseJson(response);
        setClients(Array.isArray(clientsData) ? clientsData : []);
      }
    } catch (err) {
      console.error("Failed to sync clients ledger", err);
    } finally {
      setIsClientsLoading(false);
    }
  };

  // AuthSuccess handler called from AuthView
  const handleAuthSuccess = (newToken, authenticatedUser, rememberMe) => {
    if (rememberMe) {
      localStorage.setItem("smart_crm_token", newToken);
      sessionStorage.removeItem("smart_crm_token");
    } else {
      sessionStorage.setItem("smart_crm_token", newToken);
      localStorage.removeItem("smart_crm_token");
    }
    setToken(newToken);
    setUser(authenticatedUser);
    fetchClients(newToken);
  };

  // Logout routine
  const handleLogout = async () => {
    if (token) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error("Logout request error", err);
      }
    }

    localStorage.removeItem("smart_crm_token");
    sessionStorage.removeItem("smart_crm_token");
    setToken(null);
    setUser(null);
    setClients([]);
    setActiveTab("dashboard");
    showToast("Session disconnected successfully.", "info");
  };

  // CRUD API integrations

  // 1. Add Client Lead
  const handleAddClient = async (clientData) => {
    if (!token) return false;
    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(clientData),
      });

      const data = await safeParseJson(response);
      if (response.ok) {
        setClients((prev) => [...prev, data.client]);
        showToast(`Lead for ${clientData.fullName} acquired successfully!`, "success");
        return true;
      } else {
        showToast(data.error || "Failed to add client lead.", "error");
        return false;
      }
    } catch (err) {
      showToast("Network failure. Please retry.", "error");
      return false;
    }
  };

  // 2. Edit Client Lead
  const handleEditClient = async (clientId, clientData) => {
    if (!token) return false;
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(clientData),
      });

      const data = await safeParseJson(response);
      if (response.ok) {
        setClients((prev) =>
          prev.map((c) => (c.id === clientId ? data.client : c))
        );
        showToast("Prospect ledger record saved successfully.", "success");
        return true;
      } else {
        showToast(data.error || "Failed to save prospect changes.", "error");
        return false;
      }
    } catch (err) {
      showToast("Network failure. Please retry.", "error");
      return false;
    }
  };

  // 3. Delete Client Lead
  const handleDeleteClient = async (clientId) => {
    if (!token) return false;
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await safeParseJson(response);
      if (response.ok) {
        setClients((prev) => prev.filter((c) => c.id !== clientId));
        showToast("Client record permanently discarded.", "success");
        return true;
      } else {
        showToast(data.error || "Failed to discard prospect lead.", "error");
        return false;
      }
    } catch (err) {
      showToast("Network failure. Please retry.", "error");
      return false;
    }
  };

  // 3b. Seed Sample Client Leads
  const handleSeedClients = async () => {
    if (!token) return false;
    try {
      const response = await fetch("/api/clients/seed", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await safeParseJson(response);
      if (response.ok) {
        setClients((prev) => [...prev, ...(data.clients || [])]);
        showToast("Seeded 6 professional sample leads successfully!", "success");
        return true;
      } else {
        showToast(data.error || "Failed to seed sample leads.", "error");
        return false;
      }
    } catch (err) {
      showToast("Network failure. Please retry.", "error");
      return false;
    }
  };

  // 4. Update Profile Operator Information
  const handleUpdateProfile = async (fullName, email) => {
    if (!token) return false;
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName, email }),
      });

      const data = await safeParseJson(response);
      if (response.ok) {
        setUser((prev) => (prev ? { ...prev, fullName, email } : null));
        return true;
      } else {
        showToast(data.error || "Failed to update profile.", "error");
        return false;
      }
    } catch (err) {
      showToast("Network failure. Please retry.", "error");
      return false;
    }
  };

  // 5. Change Password
  const handleChangePassword = async (currentPass, newPass) => {
    if (!token) return false;
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass }),
      });

      const data = await safeParseJson(response);
      if (response.ok) {
        return true;
      } else {
        showToast(data.error || "Password update failed.", "error");
        return false;
      }
    } catch (err) {
      showToast("Network failure. Please retry.", "error");
      return false;
    }
  };

  // Show splash loader screen
  if (isInitializing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#04091a] text-white">
        <Loader2 className="h-10 w-10 animate-spin text-violet-500 mb-4" />
        <p className="text-sm font-mono tracking-widest text-slate-400 uppercase">
          Initializing Smart CRM Operational Environment...
        </p>
      </div>
    );
  }

  // Not Logged In Layout
  if (!token || !user) {
    return (
      <>
        <AuthView
          onAuthSuccess={handleAuthSuccess}
          setErrorAlert={(msg) => showToast(msg, "error")}
          setSuccessAlert={(msg) => showToast(msg, "success")}
        />
        {/* Toast Toast alerts */}
        <AnimatePresence>
          {alert && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`fixed bottom-6 right-6 z-50 rounded-xl p-4 flex items-center gap-3 shadow-2xl border text-sm max-w-sm ${
                alert.type === "success"
                  ? "bg-slate-900 border-emerald-500/35 text-emerald-400"
                  : alert.type === "error"
                  ? "bg-slate-900 border-red-500/35 text-red-400"
                  : "bg-slate-900 border-blue-500/35 text-blue-400"
              }`}
            >
              {alert.type === "success" ? (
                <CheckCircle2 size={18} className="shrink-0" />
              ) : alert.type === "error" ? (
                <AlertCircle size={18} className="shrink-0" />
              ) : (
                <Info size={18} className="shrink-0" />
              )}
              <span className="font-semibold">{alert.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Main Authenticated Workspace Layout
  return (
    <div className="flex min-h-screen bg-[#04091a] text-slate-200" id="crm-app-root">
      {/* Sidebar navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main viewport */}
      <div className="flex-1 flex flex-col min-w-0" id="main-viewport-content">
        <Navbar
          user={user}
          setMobileOpen={setMobileSidebarOpen}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
        />

        {/* View container */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto pb-16 overflow-y-auto">
          {activeTab === "dashboard" && (
            <DashboardView
              user={user}
              clients={clients}
              setActiveTab={setActiveTab}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              token={token}
            />
          )}

          {activeTab === "clients" && (
            <ClientsView
              clients={clients}
              onAddClient={handleAddClient}
              onEditClient={handleEditClient}
              onDeleteClient={handleDeleteClient}
              isAddModalOpen={isAddModalOpen}
              setIsAddModalOpen={setIsAddModalOpen}
               onSeedClients={handleSeedClients}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "analysis" && user && token && (
            <AnalysisView
              user={user}
              clients={clients}
              token={token}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "settings" && (
            <SettingsView
              user={user}
              onUpdateProfile={handleUpdateProfile}
              onChangePassword={handleChangePassword}
              setErrorAlert={(msg) => showToast(msg, "error")}
              setSuccessAlert={(msg) => showToast(msg, "success")}
              setActiveTab={setActiveTab}
            />
          )}
        </main>
      </div>

      {/* Global animated floating toast notification drawer */}
      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 z-50 rounded-2xl p-4.5 flex items-center gap-3 shadow-[0_15px_40px_rgba(0,0,0,0.4)] border text-sm max-w-sm backdrop-blur-md ${
              alert.type === "success"
                ? "bg-slate-900/95 border-emerald-500/35 text-emerald-400"
                : alert.type === "error"
                ? "bg-slate-900/95 border-red-500/35 text-red-400"
                : "bg-slate-900/95 border-blue-500/35 text-blue-450"
            }`}
          >
            {alert.type === "success" ? (
              <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
            ) : alert.type === "error" ? (
              <AlertCircle size={18} className="shrink-0 text-red-400" />
            ) : (
              <Info size={18} className="shrink-0 text-blue-400" />
            )}
            <span className="font-semibold text-xs leading-5">{alert.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
