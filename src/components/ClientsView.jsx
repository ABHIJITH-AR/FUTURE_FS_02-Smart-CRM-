import React, { useState } from "react";
import { Search, Filter, Plus, Edit2, Trash2, X, AlertCircle, Sparkles, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const GRADIENTS = [
  "from-cyan-500 to-blue-600 text-cyan-50",
  "from-purple-500 to-indigo-600 text-purple-50",
  "from-pink-500 to-rose-600 text-pink-50",
  "from-amber-500 to-orange-600 text-amber-50",
  "from-emerald-500 to-teal-600 text-emerald-50",
  "from-violet-500 to-fuchsia-600 text-violet-50"
];

function getAvatarFallback(fullName) {
  const name = fullName || "?";
  const index = Math.abs(name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % GRADIENTS.length;
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?";
  return { initials, gradient: GRADIENTS[index] };
}

export default function ClientsView({
  clients,
  onAddClient,
  onEditClient,
  onDeleteClient,
  isAddModalOpen,
  setIsAddModalOpen,
  onSeedClients,
  setActiveTab,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isSeeding, setIsSeeding] = useState(false);

  // Add/Edit Modals Internal Form states
  const [editingClient, setEditingClient] = useState(null);
  const [isDeletingId, setIsDeletingId] = useState(null);

  // Form Inputs
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [status, setStatus] = useState("Active");
  const [priority, setPriority] = useState("Medium");
  const [dealValue, setDealValue] = useState("");
  const [leadSource, setLeadSource] = useState("Direct Web");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState("");

  // Errors inside forms
  const [validationError, setValidationError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Open Add modal logic
  const openAddForm = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setCompanyName("");
    setStatus("Active");
    setPriority("Medium");
    setDealValue("");
    setLeadSource("Direct Web");
    setNotes("");
    setPhoto("");
    setValidationError(null);
    setIsAddModalOpen(true);
  };

  // Open Edit form logic
  const openEditForm = (client) => {
    setEditingClient(client);
    setFullName(client.fullName);
    setEmail(client.email);
    setPhone(client.phone);
    setCompanyName(client.companyName);
    setStatus(client.status);
    setPriority(client.priority || "Medium");
    setDealValue(client.dealValue !== undefined ? String(client.dealValue) : "");
    setLeadSource(client.leadSource || "Direct Web");
    setNotes(client.notes || "");
    setPhoto(client.photo || "");
    setValidationError(null);
  };

  const handleSeedAction = async () => {
    if (!onSeedClients) return;
    setIsSeeding(true);
    await onSeedClients();
    setIsSeeding(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setValidationError(null);

    if (!fullName.trim() || !email.trim() || !phone.trim() || !companyName.trim()) {
      setValidationError("All fields are required. Please prevent blank fields.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setValidationError("Please enter a valid email format.");
      return;
    }

    setIsSubmitting(true);
    const success = await onAddClient({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      companyName: companyName.trim(),
      status,
      priority,
      dealValue: dealValue.trim() !== "" ? Number(dealValue) : 0,
      leadSource: leadSource.trim(),
      notes: notes.trim(),
      photo: photo,
    });
    setIsSubmitting(false);

    if (success) {
      setIsAddModalOpen(false);
    } else {
      setValidationError("Failed to create client lead. Please try again.");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setValidationError(null);

    if (!fullName.trim() || !email.trim() || !phone.trim() || !companyName.trim()) {
      setValidationError("All fields are required. Please prevent blank fields.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setValidationError("Please enter a valid email format.");
      return;
    }

    if (!editingClient) return;

    setIsSubmitting(true);
    const success = await onEditClient(editingClient.id, {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      companyName: companyName.trim(),
      status,
      priority,
      dealValue: dealValue.trim() !== "" ? Number(dealValue) : 0,
      leadSource: leadSource.trim(),
      notes: notes.trim(),
      photo: photo,
    });
    setIsSubmitting(false);

    if (success) {
      setEditingClient(null);
    } else {
      setValidationError("Failed to update client lead. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    setIsDeletingId(id);
  };

  const confirmDelete = async () => {
    if (!isDeletingId) return;
    const success = await onDeleteClient(isDeletingId);
    if (success) {
      setIsDeletingId(null);
    }
  };

  // Searching and Filtering algorithm
  const filteredClients = clients.filter((client) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      client.fullName.toLowerCase().includes(term) ||
      client.email.toLowerCase().includes(term) ||
      client.companyName.toLowerCase().includes(term) ||
      client.phone.includes(searchTerm) ||
      (client.priority || "").toLowerCase().includes(term) ||
      (client.leadSource || "").toLowerCase().includes(term) ||
      (client.notes || "").toLowerCase().includes(term);

    const matchesStatus = statusFilter === "All" || client.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getSourceBadgeClass = (source) => {
    const s = source || "Direct Web";
    if (s.includes("Web") || s.includes("Direct")) return "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20";
    if (s.includes("Referral") || s.includes("Partner")) return "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20";
    if (s.includes("Outbound") || s.includes("Cold")) return "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20";
    if (s.includes("Conference") || s.includes("Tech")) return "bg-amber-500/10 text-amber-300 border border-amber-500/20";
    if (s.includes("Social")) return "bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/20";
    return "bg-slate-500/10 text-slate-400 border border-slate-500/10";
  };

  return (
    <div className="space-y-6" id="clients-view">
      {setActiveTab && (
        <button
          onClick={() => setActiveTab("dashboard")}
          className="group inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-all duration-200 cursor-pointer"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
          <span>Back to Dashboard</span>
        </button>
      )}
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4" id="ledger-header">
        <div>
          <h2 className="font-display font-extrabold text-2xl md:text-3xl tracking-tight bg-gradient-to-r from-cyan-400 via-purple-400 to-rose-450 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            Client Lead Management
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Acquire, track, search, filter, and modify system accounts dynamically.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openAddForm}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white font-semibold text-sm px-4.5 py-2.5 rounded-xl transition-all cursor-pointer shadow-[0_4px_15px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_20px_rgba(139,92,246,0.4)]"
            id="btn-add-lead-top"
          >
            <Plus size={16} />
            <span>Add Client Lead</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      {clients.length === 0 ? (
        <div className="text-center py-20 px-6 rounded-2xl bg-gradient-to-br from-slate-900/60 to-slate-950/80 border border-slate-800/80 relative overflow-hidden flex flex-col items-center justify-center shadow-lg" id="empty-ledger-box">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(6,182,212,0.06),transparent_50%)] pointer-events-none animate-pulse" />
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-cyan-400/10 via-blue-500/10 to-violet-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 shadow-[0_0_20px_rgba(6,182,212,0.15)] animate-glow-slow">
            <Sparkles className="h-8 w-8 animate-pulse text-cyan-455" />
          </div>
          <h3 className="font-display text-xl md:text-2xl font-bold text-white tracking-tight drop-shadow-md">
            Your Lead Ledger is Empty!
          </h3>
          <p className="text-slate-400 text-sm max-w-lg mt-3 font-medium leading-relaxed">
            Add new client contacts to view dashboard statistics, interactive graphs, and apply search filters!
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={openAddForm}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all cursor-pointer shadow-[0_4px_15px_rgba(59,130,246,0.3)]"
            >
              <Plus size={16} />
              <span>Add Custom Lead</span>
            </button>
            <button
              onClick={handleSeedAction}
              disabled={isSeeding}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 font-semibold text-sm px-6 py-3 rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              <Sparkles size={16} className={isSeeding ? "animate-spin text-cyan-400" : "text-cyan-400"} />
              <span>{isSeeding ? "Seeding..." : "Create 5 Sample Clients"}</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="ledger-controls">
            <div className="md:col-span-2 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search leads by name, email, company, list..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                id="search-input"
              />
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Filter size={16} />
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-violet-500 cursor-pointer appearance-none"
                id="status-filter-select"
              >
                <option value="All">All Pipelines</option>
                <option value="Active">Active Leads</option>
                <option value="Pending">Pending Review</option>
                <option value="Inactive">Inactive leads</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md" id="ledger-table-container">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/50 text-xs font-semibold tracking-wider text-slate-400 uppercase">
                    <th className="px-6 py-4">Full Name & Source</th>
                    <th className="px-6 py-4">Company & Priority</th>
                    <th className="px-6 py-4">Deal Value</th>
                    <th className="px-6 py-4">Status & Notes</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-base">
                        No leads match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredClients.map((client) => (
                      <tr key={client.id} className="hover:bg-slate-950/40 transition-colors group">
                        <td className="px-6 py-4.5">
                          <div className="flex items-center gap-3">
                            {/* Lead Avatar */}
                            {(() => {
                              const { initials, gradient } = getAvatarFallback(client.fullName);
                              return (
                                <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${gradient} border-2 border-slate-800 shadow-md flex-shrink-0 flex items-center justify-center font-bold text-sm tracking-wide select-none uppercase font-sans`}>
                                  {initials}
                                </div>
                              );
                            })()}

                            <div>
                              <div className="font-semibold text-white flex items-center gap-2 flex-wrap">
                                 <span>{client.fullName}</span>
                                <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md font-mono ${getSourceBadgeClass(client.leadSource || "Direct Web")}`}>
                                  {client.leadSource || "Direct Web"}
                                </span>
                              </div>
                              <div className="text-xs text-slate-400 mt-1">{client.email}</div>
                              <div className="text-xs text-slate-500 font-mono mt-0.5">{client.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4.5 font-medium text-slate-200">
                          <div className="text-slate-100 font-semibold">{client.companyName}</div>
                          <div className="mt-1.5">
                            {client.priority === "High" ? (
                              <span className="text-[10px] font-bold tracking-wide text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full select-none font-mono">
                                High Priority
                              </span>
                            ) : client.priority === "Low" ? (
                              <span className="text-[10px] font-medium text-slate-400 bg-slate-800/80 border border-slate-700/40 px-2 py-0.5 rounded-full select-none font-mono">
                                Low Priority
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full select-none font-mono">
                                Medium Priority
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4.5 font-mono text-cyan-400 font-bold text-sm">
                          ${(client.dealValue || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4.5">
                          <div>
                            <span
                              className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
                                client.status === "Active"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : client.status === "Pending"
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                  : "bg-slate-500/10 text-slate-400 border-slate-500/10"
                              }`}
                            >
                              {client.status}
                            </span>
                          </div>
                          {client.notes && (
                            <p className="text-xs text-slate-400 max-w-[180px] break-words mt-1.5 leading-snug line-clamp-2" title={client.notes}>
                              {client.notes}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4.5 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            <button
                              onClick={() => openEditForm(client)}
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/25 hover:border-blue-500/40 transition-all duration-200 cursor-pointer"
                              title="Edit Lead"
                            >
                              <Edit2 size={13} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(client.id)}
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 hover:border-red-500/40 transition-all duration-200 cursor-pointer"
                              title="Delete Lead"
                            >
                              <Trash2 size={13} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-900/30 border-t border-slate-850 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Total Matches: {filteredClients.length} of {clients.length} listed</span>
              <span>Indexed JSON File System storage active</span>
            </div>
          </div>
        </>
      )}

      {/* ----------------- POPUP DIALOGS & MODAL COMPLEMENTS ----------------- */}

      {/* 1. Add Client Lead Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-800">
                <h3 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                  Acquire New Client Lead
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                {validationError && (
                  <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2.5 text-xs text-red-400">
                    <AlertCircle size={15} />
                    <span>{validationError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Jean-Luc Picard"
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. picard@starfleet.org"
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +1 (555) 123-4567"
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. USS Enterprise"
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Estimated Deal Value ($)
                    </label>
                    <input
                      type="number"
                      value={dealValue}
                      onChange={(e) => setDealValue(e.target.value)}
                      placeholder="e.g. 50000"
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Lead Acquisition Source
                    </label>
                    <select
                      value={leadSource}
                      onChange={(e) => setLeadSource(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-blue-500 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%252394a3b8%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-10"
                    >
                      <option value="Direct Web">Direct Web</option>
                      <option value="Referral">Partner Referral</option>
                      <option value="Cold Outbound">Cold Outbound</option>
                      <option value="Conference">Tech Conference</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Priority Level
                    </label>
                    <div className="flex gap-2">
                       {["High", "Medium", "Low"].map((pr) => (
                        <button
                          key={pr}
                          type="button"
                          onClick={() => setPriority(pr)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold font-mono border cursor-pointer transition-all ${
                            priority === pr
                              ? pr === "High"
                                ? "bg-rose-500/10 text-rose-400 border-rose-500 font-extrabold"
                                : pr === "Medium"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500 font-extrabold"
                                : "bg-slate-800 text-slate-300 border-slate-600 font-extrabold"
                              : "bg-slate-950 text-slate-500 border-slate-850 hover:bg-slate-800/50"
                          }`}
                        >
                          {pr}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Pipeline Lead Status
                    </label>
                    <div className="flex gap-2">
                      {["Active", "Pending", "Inactive"].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setStatus(st)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold font-mono border cursor-pointer transition-all ${
                            status === st
                              ? st === "Active"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500 font-extrabold"
                                : st === "Pending"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500 font-extrabold"
                                : "bg-slate-500/10 text-slate-300 border-slate-500 font-extrabold"
                              : "bg-slate-950 text-slate-500 border-slate-850 hover:bg-slate-800/50"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Prospect Notes & Requirements
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Briefly log client requirements, tech stack preferences, timeline boundaries..."
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-blue-500 resize-none animate-fade-in"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-2.5 border border-slate-800 text-slate-400 hover:text-white rounded-xl font-semibold text-sm transition-all focus:outline-none hover:bg-slate-800 cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white rounded-xl font-semibold text-sm transition-all shadow-[0_4px_15px_rgba(59,130,246,0.3)] cursor-pointer py-2.5"
                  >
                    {isSubmitting ? "Creating..." : "Create Now"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Edit Client Lead Modal */}
      <AnimatePresence>
        {editingClient && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-800">
                <h3 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                  Modify Prospect Lead
                </h3>
                <button
                  onClick={() => setEditingClient(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                {validationError && (
                  <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2.5 text-xs text-red-400">
                    <AlertCircle size={15} />
                    <span>{validationError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Jean-Luc Picard"
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. picard@starfleet.org"
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +1 (555) 123-4567"
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. USS Enterprise"
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Estimated Deal Value ($)
                    </label>
                    <input
                      type="number"
                      value={dealValue}
                      onChange={(e) => setDealValue(e.target.value)}
                      placeholder="e.g. 50000"
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Lead Acquisition Source
                    </label>
                    <select
                      value={leadSource}
                      onChange={(e) => setLeadSource(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-blue-500 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%252394a3b8%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-10"
                    >
                      <option value="Direct Web">Direct Web</option>
                      <option value="Referral">Partner Referral</option>
                      <option value="Cold Outbound">Cold Outbound</option>
                      <option value="Conference">Tech Conference</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Priority Level
                    </label>
                    <div className="flex gap-2">
                       {["High", "Medium", "Low"].map((pr) => (
                        <button
                          key={pr}
                          type="button"
                          onClick={() => setPriority(pr)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold font-mono border cursor-pointer transition-all ${
                            priority === pr
                              ? pr === "High"
                                ? "bg-rose-500/10 text-rose-400 border-rose-500 font-extrabold"
                                : pr === "Medium"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500 font-extrabold"
                                : "bg-slate-800 text-slate-300 border-slate-600 font-extrabold"
                              : "bg-slate-950 text-slate-500 border-slate-850 hover:bg-slate-800/50"
                          }`}
                        >
                          {pr}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Pipeline Lead Status
                    </label>
                    <div className="flex gap-2">
                      {["Active", "Pending", "Inactive"].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setStatus(st)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold font-mono border cursor-pointer transition-all ${
                            status === st
                              ? st === "Active"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500 font-extrabold"
                                : st === "Pending"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500 font-extrabold"
                                : "bg-slate-500/10 text-slate-300 border-slate-500 font-extrabold"
                              : "bg-slate-950 text-slate-500 border-slate-850 hover:bg-slate-800/50"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Prospect Notes & Requirements
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Briefly log client requirements, tech stack preferences, timeline boundaries..."
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-blue-500 resize-none animate-fade-in"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingClient(null)}
                    className="flex-1 py-2.5 border border-slate-800 text-slate-400 hover:text-white rounded-xl font-semibold text-sm transition-all focus:outline-none hover:bg-slate-800 cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white rounded-xl font-semibold text-sm transition-all shadow-[0_4px_15px_rgba(59,130,246,0.3)] cursor-pointer py-2.5"
                  >
                    {isSubmitting ? "Updating..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Delete Lead Modal Confirmation */}
      <AnimatePresence>
        {isDeletingId && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 text-center"
            >
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500/15 text-red-500 mb-4 border border-red-500/20">
                <AlertCircle size={22} />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Delete Client Lead Ledger Entry</h3>
              <p className="text-xs text-slate-400 mb-6">
                Are you extremely certain? This operation permanently excludes this prospect record from your CRM database.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeletingId(null)}
                  className="flex-1 py-2.5 border border-slate-800 text-slate-400 hover:text-white rounded-xl font-semibold text-xs uppercase tracking-wider transition-all hover:bg-slate-800 cursor-pointer"
                >
                  No, Keep Lead
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-[0_4px_15px_rgba(220,38,38,0.25)] cursor-pointer"
                >
                  Yes, Remove
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
