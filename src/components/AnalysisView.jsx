import { useState } from "react";
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  AlertCircle,
  TrendingDown,
  Activity,
  CheckCircle,
  Clock,
  UserX
} from "lucide-react";
import { motion } from "motion/react";

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

export default function AnalysisView({ user, clients }) {
  const [hoveredStatus, setHoveredStatus] = useState(null);

  // Compute stats for visualization
  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === "Active").length;
  const pendingClients = clients.filter((c) => c.status === "Pending").length;
  const inactiveClients = clients.filter((c) => c.status === "Inactive").length;

  const totalDealValue = clients.reduce((acc, c) => acc + (c.dealValue || 0), 0);
  const averageDealValue = totalClients > 0 ? Math.round(totalDealValue / totalClients) : 0;

  const highPriority = clients.filter((c) => c.priority === "High").length;
  const mediumPriority = clients.filter((c) => c.priority === "Medium").length;
  const lowPriority = clients.filter((c) => c.priority === "Low").length;

  // Pie chart segments logic
  const items = [
    { label: "Active", count: activeClients, color: "#10b981", shadow: "rgba(16,185,129,0.3)", tailwindColor: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Pending", count: pendingClients, color: "#f59e0b", shadow: "rgba(245,158,11,0.3)", tailwindColor: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Inactive", count: inactiveClients, color: "#64748b", shadow: "rgba(100,116,139,0.3)", tailwindColor: "text-slate-400", bg: "bg-slate-500/10" },
  ].filter(item => item.count > 0);

  let currentAngle = -90; // Top of the circle (12 o'clock)
  const paths = items.map((item, idx) => {
    const percentage = item.count / totalClients;
    const angleDelta = percentage * 360;
    const start = currentAngle;
    const end = currentAngle + angleDelta;
    currentAngle = end;

    const pathData = getSectorPath(150, 150, 120, start, end);
    return {
      ...item,
      pathData,
      percentage: Math.round(percentage * 100),
      idx
    };
  });

  const hoveredPath = hoveredStatus ? paths.find(p => p.label === hoveredStatus) : null;

  return (
    <div className="space-y-6" id="analysis-view">
      {/* Header Panel */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        id="analysis-header"
      >
        <div>
          <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
            CRM Distribution Analysis
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Keep track of live conversion rates, status divisions, and financial metrics across your customer pipelines.
          </p>
        </div>
      </motion.div>

      {/* Main Analysis Architecture Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in" id="analysis-grid">
        {/* Left Column: Visual Interactive SVG Pie Chart (5 cols) */}
        <div className="lg:col-span-5" id="analysis-pie-card-col">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl flex flex-col items-center relative h-full justify-between"
            id="analysis-chart-card"
          >
            <div className="w-full text-left mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Live Conversion Ratios</h3>
              <p className="text-[10px] text-slate-500 font-medium">Graphical status representation of leads.</p>
            </div>

            {/* Render Circular Pie Chart */}
            <div className="relative h-64 w-64 flex items-center justify-center my-6 select-none" id="svg-pie-wrapper">
              {totalClients > 0 ? (
                <>
                  <svg viewBox="0 0 300 300" className="w-full h-full transform transition-all duration-355">
                    {paths.map((p) => {
                      const isHovered = hoveredStatus === p.label;
                      return (
                        <path
                          key={p.label}
                          d={p.pathData}
                          fill={p.color}
                          stroke="#04091a"
                          strokeWidth={isHovered ? 3 : 1.5}
                          style={{
                            transform: isHovered ? "scale(1.04)" : "scale(1)",
                            transformOrigin: "150px 150px",
                            transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                            filter: isHovered ? `drop-shadow(0 0 10px ${p.shadow})` : "none",
                            cursor: "pointer"
                          }}
                          onMouseEnter={() => setHoveredStatus(p.label)}
                          onMouseLeave={() => setHoveredStatus(null)}
                        />
                      );
                    })}
                    {/* Inner hole mask to convert to high-end donut/pie hybrid */}
                    <circle cx="150" cy="150" r="55" fill="#04091a" />
                  </svg>
                  
                  {/* Center percentage output overlay */}
                  <div className="absolute text-center bg-[#04091a]/80 py-2.5 px-3 rounded-full border border-slate-800/60 backdrop-blur-sm pointer-events-none w-28">
                    <span className="text-xl font-extrabold text-white font-mono leading-none">
                      {hoveredPath ? (
                        `${hoveredPath.percentage}%`
                      ) : (
                        totalClients > 0 ? `${Math.round((activeClients / totalClients) * 100)}%` : "0%"
                      )}
                    </span>
                    <p className="text-[9px] uppercase font-mono tracking-widest text-slate-400 font-bold mt-0.5 leading-none">
                      {hoveredPath ? hoveredPath.label : "Active"}
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-500 text-center">
                  <span className="text-4xl mb-2">📊</span>
                  <p className="text-xs font-mono uppercase tracking-wider">No leads recorded yet</p>
                </div>
              )}
            </div>

            {/* Color Map Labels */}
            <div className="grid grid-cols-3 gap-2 w-full border-t border-slate-800/80 pt-4 text-center font-mono select-none">
              <div 
                className={`py-1 rounded-lg transition-all ${hoveredStatus === "Active" ? "bg-slate-800" : ""}`}
                onMouseEnter={() => setHoveredStatus("Active")}
                onMouseLeave={() => setHoveredStatus(null)}
              >
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 mr-1.5" />
                <span className="text-[10px] text-slate-355 font-semibold">Active ({activeClients})</span>
              </div>
              <div 
                className={`py-1 rounded-lg transition-all ${hoveredStatus === "Pending" ? "bg-slate-800" : ""}`}
                onMouseEnter={() => setHoveredStatus("Pending")}
                onMouseLeave={() => setHoveredStatus(null)}
              >
                <span className="inline-block h-2 w-2 rounded-full bg-amber-500 mr-1.5" />
                <span className="text-[10px] text-slate-355 font-semibold">Pending ({pendingClients})</span>
              </div>
              <div 
                className={`py-1 rounded-lg transition-all ${hoveredStatus === "Inactive" ? "bg-slate-800" : ""}`}
                onMouseEnter={() => setHoveredStatus("Inactive")}
                onMouseLeave={() => setHoveredStatus(null)}
              >
                <span className="inline-block h-2 w-2 rounded-full bg-slate-500 mr-1.5" />
                <span className="text-[10px] text-slate-355 font-semibold">Inactive ({inactiveClients})</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Dynamic Statistics Overview List (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6" id="analysis-stats-col">
          {/* Main Key Figures List Cards */}
          <div className="grid grid-cols-2 gap-4" id="analysis-bento-stats">
            <div className="rounded-xl border border-slate-850 bg-slate-900/60 p-5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-slate-400 mb-2.5 font-mono uppercase tracking-wider text-[10px] font-bold">
                  <DollarSign className="text-emerald-400" size={14} />
                  <span>Pipeline Worth</span>
                </div>
                <p className="text-2xl font-extrabold text-slate-50 font-mono">${totalDealValue.toLocaleString()}</p>
              </div>
              <p className="text-[10px] text-slate-500 mt-4 leading-relaxed font-medium">Accumulated deal contracts from active leads.</p>
            </div>

            <div className="rounded-xl border border-slate-850 bg-slate-900/60 p-5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-slate-400 mb-2.5 font-mono uppercase tracking-wider text-[10px] font-bold">
                  <TrendingUp className="text-purple-400" size={14} />
                  <span>Ticket Rate</span>
                </div>
                <p className="text-2xl font-extrabold text-slate-50 font-mono">${averageDealValue.toLocaleString()}</p>
              </div>
              <p className="text-[10px] text-slate-500 mt-4 leading-relaxed font-medium">Average deal amount computed across database records.</p>
            </div>

            <div className="rounded-xl border border-slate-850 bg-slate-900/60 p-5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-slate-400 mb-2.5 font-mono uppercase tracking-wider text-[10px] font-bold">
                  <AlertCircle className="text-rose-400" size={14} />
                  <span>Urgent Leads</span>
                </div>
                <p className="text-2xl font-extrabold text-slate-50 font-mono">{highPriority}</p>
              </div>
              <p className="text-[10px] text-slate-500 mt-4 leading-relaxed font-semibold text-rose-500/80">Immediate attention action-point records.</p>
            </div>

            <div className="rounded-xl border border-slate-850 bg-slate-900/60 p-5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-slate-400 mb-2.5 font-mono uppercase tracking-wider text-[10px] font-bold">
                  <Activity className="text-blue-400" size={14} />
                  <span>Projections</span>
                </div>
                <p className="text-2xl font-extrabold text-slate-50 font-mono">{mediumPriority + lowPriority}</p>
              </div>
              <p className="text-[10px] text-slate-500 mt-4 leading-relaxed font-medium">Active and pending leads currently in stable priority.</p>
            </div>
          </div>

          {/* detailed Lead ledger progress table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 shadow-lg flex-1">
            <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-widest font-mono mb-4 border-b border-slate-800 pb-2">
              Pipeline Health Indicators
            </h4>
            
            <div className="space-y-4 font-sans">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="p-1 px-1.5 rounded-md bg-emerald-500/10 text-emerald-400 font-bold font-mono">
                    Active
                  </span>
                  <span className="font-medium">Direct Target conversions</span>
                </div>
                <span className="font-mono text-slate-100 font-bold">{activeClients} accounts</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: `${totalClients > 0 ? (activeClients / totalClients) * 100 : 0}%` }} />
              </div>

              <div className="flex items-center justify-between text-xs pt-2">
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="p-1 px-1.5 rounded-md bg-amber-500/10 text-amber-400 font-bold font-mono">
                    Pending
                  </span>
                  <span className="font-medium">Active communications</span>
                </div>
                <span className="font-mono text-slate-100 font-bold">{pendingClients} accounts</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div className="bg-amber-500 h-full" style={{ width: `${totalClients > 0 ? (pendingClients / totalClients) * 100 : 0}%` }} />
              </div>

              <div className="flex items-center justify-between text-xs pt-2">
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="p-1 px-1.5 rounded-md bg-slate-500/15 text-slate-400 font-bold font-mono">
                    Inactive
                  </span>
                  <span className="font-medium font-mono">Cold prospects</span>
                </div>
                <span className="font-mono text-slate-100 font-bold">{inactiveClients} accounts</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div className="bg-slate-500 h-full" style={{ width: `${totalClients > 0 ? (inactiveClients / totalClients) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
