import { useState } from "react";
import { Users, UserCheck, Clock, ShieldAlert, Award, Plus, ArrowRight, Sparkles, Loader2, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// SVG Arc path generator for Pie Chart sectors
function getSectorPath(cx, cy, r, startAngle, endAngle) {
  if (endAngle - startAngle >= 360) {
    endAngle = startAngle + 359.99;
  }
  const rad = Math.PI / 180;
  const x1 = cx + r * Math.cos(startAngle * rad);
  const y1 = cy + r * Math.sin(startAngle * rad);
  const x2 = cx + r * Math.cos(endAngle * rad);
  const y2 = cy + r * Math.sin(endAngle * rad);
  
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
}

export default function DashboardView({
  user,
  clients,
  setActiveTab,
  onOpenAddModal,
  token,
}) {
  // Interactive Pie Chart hover state
  const [hoveredStatus, setHoveredStatus] = useState(null);

  // Compute Stats
  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === "Active").length;
  const pendingClients = clients.filter((c) => c.status === "Pending").length;
  const inactiveClients = clients.filter((c) => c.status === "Inactive").length;

  const conversionRate = totalClients > 0 
    ? Math.round((activeClients / totalClients) * 100) 
    : 0;

  // Get 4 most recent leads
  const recentLeads = [...clients]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const stats = [
    {
      id: "stat-total",
      label: "Total Leads",
      value: totalClients,
      icon: Users,
      color: "from-blue-500 to-indigo-600",
      shadow: "shadow-blue-500/15",
    },
    {
      id: "stat-active",
      label: "Active Prospects",
      value: activeClients,
      icon: UserCheck,
      color: "from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-500/15",
    },
    {
      id: "stat-pending",
      label: "Pending Pipeline",
      value: pendingClients,
      icon: Clock,
      color: "from-amber-500 to-orange-600",
      shadow: "shadow-amber-500/15",
    },
    {
      id: "stat-conversion",
      label: "Conversion Efficiency",
      value: `${conversionRate}%`,
      icon: Award,
      color: "from-violet-500 to-purple-600",
      shadow: "shadow-violet-500/15",
    },
  ];

  const chartSegments = [
    { label: "Active", count: activeClients, color: "#10b981", shadow: "rgba(16,185,129,0.35)", textColor: "text-emerald-400" },
    { label: "Pending", count: pendingClients, color: "#f59e0b", shadow: "rgba(245,158,11,0.35)", textColor: "text-amber-400" },
    { label: "Inactive", count: inactiveClients, color: "#94a3b8", shadow: "rgba(148,163,184,0.35)", textColor: "text-slate-400" },
  ].filter(item => item.count > 0);

  let tempAngle = -90;
  const sectors = chartSegments.map((item) => {
    const percentage = item.count / totalClients;
    const angleDelta = percentage * 360;
    const start = tempAngle;
    const end = tempAngle + angleDelta;
    tempAngle = end;
    const pathData = getSectorPath(100, 100, 85, start, end);
    return {
      ...item,
      pathData,
      percentage: Math.round(percentage * 100)
    };
  });

  const activeHoveredSector = hoveredStatus ? sectors.find(s => s.label === hoveredStatus) : null;

  return (
    <div className="space-y-8" id="dashboard-view">
      {/* Personalized Welcome Header */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/60 to-slate-900 p-6 md:p-8"
        id="dashboard-header"
      >
        <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-br from-violet-500/10 to-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Welcome Back, {user.fullName} 👋
            </h1>
            <p className="text-slate-400 text-sm mt-1.5 font-medium">
              We have compiled your real-time client acquisition analytics pipeline below.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white font-semibold text-sm px-4.5 py-2.5 rounded-xl shadow-[0_4px_15px_rgba(139,92,246,0.3)] transition-all cursor-pointer group"
              id="btn-quick-add"
            >
              <Plus size={16} className="group-hover:rotate-90 transition-transform duration-200" />
              <span>Acquire New Lead</span>
            </button>
            <button
              onClick={() => setActiveTab("clients")}
              className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-sm font-semibold px-4.5 py-2.5 rounded-xl transition-all cursor-pointer"
              id="btn-quick-view"
            >
              <span>Manage Leads</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Analytics Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="stats-grid">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ 
                y: -6, 
                scale: 1.02,
                borderColor: stat.id === "stat-total" ? "rgba(6, 182, 212, 0.4)" : 
                             stat.id === "stat-active" ? "rgba(16, 185, 129, 0.4)" :
                             stat.id === "stat-pending" ? "rgba(245, 158, 11, 0.4)" :
                                                         "rgba(139, 92, 246, 0.4)",
                 boxShadow: stat.id === "stat-total" ? "0 10px 25px -5px rgba(6, 182, 212, 0.15)" : 
                            stat.id === "stat-active" ? "0 10px 25px -5px rgba(16, 185, 129, 0.15)" :
                            stat.id === "stat-pending" ? "0 10px 25px -5px rgba(245, 158, 11, 0.15)" :
                                                        "0 10px 25px -5px rgba(139, 92, 246, 0.15)"
              }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 18,
                opacity: { duration: 0.3, delay: idx * 0.04 },
                y: { type: "spring", stiffness: 300, damping: 15 }
              }}
              className="group relative overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/60 p-5 shadow-lg backdrop-blur-md transition-all duration-300 cursor-pointer"
              id={stat.id}
            >
              <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-br from-slate-800 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-105" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono tracking-wider text-slate-400 font-semibold uppercase">
                  {stat.label}
                </span>
                <motion.div 
                  variants={{
                    hover: { scale: 1.1, rotate: [0, -10, 10, 0] }
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg ${stat.shadow}`}
                >
                  <Icon size={18} />
                </motion.div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white tracking-tight">
                  {stat.value}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Visual Analytics Section & Recent Clients Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Interactive SVG Pie Chart Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl flex flex-col justify-between"
          id="visual-charts-card"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white font-display tracking-tight">Status Breakdown & Pipelines</h3>
              <p className="text-xs text-slate-505 font-medium">Real-time graphic status division of your indexed client accounts.</p>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-850 border border-slate-800 text-cyan-455 px-3 py-1 rounded-full">
              ● Live Distribution
            </span>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-around gap-8 py-6">
            {/* Interactive Pie Chart SVG */}
            <div className="relative h-56 w-56 flex items-center justify-center select-none" id="dashboard-pie-svg-wrapper">
              {totalClients > 0 ? (
                <>
                  <svg viewBox="0 0 200 200" className="w-full h-full transform transition-all duration-300">
                    {sectors.map((p) => {
                      const isHovered = hoveredStatus === p.label;
                      return (
                        <path
                          key={p.label}
                          d={p.pathData}
                          fill={p.color}
                          stroke="#071130"
                          strokeWidth={isHovered ? 2.5 : 1}
                          style={{
                            transform: isHovered ? "scale(1.05)" : "scale(1)",
                            transformOrigin: "100px 100px",
                            transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                            filter: isHovered ? `drop-shadow(0 0 8px ${p.shadow})` : "none",
                            cursor: "pointer"
                          }}
                          onMouseEnter={() => setHoveredStatus(p.label)}
                          onMouseLeave={() => setHoveredStatus(null)}
                        />
                      );
                    })}
                    {/* Donut inner core mask */}
                    <circle cx="100" cy="100" r="45" fill="#071130" />
                  </svg>
                  
                  {/* Center overlay indicator */}
                  <div className="absolute text-center bg-[#071130]/90 py-2 px-3 rounded-full border border-slate-800/80 backdrop-blur-md pointer-events-none w-24">
                    <span className="text-lg font-extrabold text-white font-mono leading-none">
                      {activeHoveredSector ? (
                        `${activeHoveredSector.percentage}%`
                      ) : (
                        `${conversionRate}%`
                      )}
                    </span>
                    <p className="text-[9px] uppercase font-mono tracking-wider text-slate-400 font-bold mt-0.5 leading-none">
                      {activeHoveredSector ? activeHoveredSector.label : "Success"}
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-500 text-center">
                  <span className="text-3xl mb-2">📊</span>
                  <p className="text-xs font-mono uppercase tracking-wider">No leads recorded</p>
                </div>
              )}
            </div>

            {/* Custom Interactive Legend Keys */}
            <div className="space-y-4 shrink-0 font-sans w-full md:w-auto">
              {[
                { label: "Active", count: activeClients, color: "bg-emerald-500" },
                { label: "Pending", count: pendingClients, color: "bg-amber-500" },
                { label: "Inactive", count: inactiveClients, color: "bg-slate-400" }
              ].map((item) => {
                const isHovered = hoveredStatus === item.label;
                const ratio = totalClients > 0 ? Math.round((item.count / totalClients) * 100) : 0;
                return (
                  <div 
                    key={item.label}
                    className={`flex items-center justify-between md:justify-start gap-4 p-2.5 rounded-xl border transition-all duration-200 ${
                      isHovered ? "bg-slate-850 border-slate-750" : "bg-transparent border-transparent"
                    }`}
                    style={{ minWidth: "180px", cursor: "pointer" }}
                    onMouseEnter={() => setHoveredStatus(item.label)}
                    onMouseLeave={() => setHoveredStatus(null)}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`h-3 w-3 rounded-full ${item.color}`} />
                      <div>
                        <p className="text-xs font-bold text-slate-200">{item.label} Leads</p>
                        <p className="text-[10px] text-slate-500 font-semibold font-mono">{ratio}% ratio</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-extrabold text-slate-350 ml-auto bg-slate-900 px-2 py-0.5 rounded-md border border-slate-850">
                      {item.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 border-t border-slate-800/60 pt-4 text-center">
            <p className="text-[10px] text-slate-500 font-mono tracking-tight">
              Interactive visualization updates automatically when client parameters change.
            </p>
          </div>
        </motion.div>

        {/* Recent Client List */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl flex flex-col justify-between"
          id="dashboard-recent-leads"
        >
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">Recent Prospects</h3>
              <button
                onClick={() => setActiveTab("clients")}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
                id="btn-recent-see-all"
              >
                See All
              </button>
            </div>

            {recentLeads.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No leads created yet. Click "Acquire New Lead" to begin.
              </div>
            ) : (
              <div className="space-y-3">
                {recentLeads.map((cli) => (
                  <div
                    key={cli.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-800/60 bg-slate-950/40 hover:bg-slate-950/80 transition-all"
                  >
                    <div className="min-w-0 flex-1 flex items-center gap-3 pr-3">
                      {cli.photo ? (
                        <img
                          src={cli.photo}
                          referrerPolicy="no-referrer"
                          className="h-8 w-8 rounded-full object-cover border border-slate-800/80 flex-shrink-0"
                          alt={cli.fullName}
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-slate-800 text-slate-350 border border-slate-700 flex items-center justify-center font-bold text-[10px] font-mono flex-shrink-0 select-none">
                          {cli.fullName ? cli.fullName.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase() : "?"}
                        </div>
                      )}
                      
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-100 truncate">{cli.fullName}</p>
                        <p className="text-[11px] text-slate-400 truncate">{cli.companyName}</p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                        cli.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : cli.status === "Pending"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                      }`}
                    >
                      {cli.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 border-t border-slate-800/60 pt-4 text-center">
            <p className="text-[11px] text-slate-505">
              Smart CRM utilizes an elite local JSON index structure.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
