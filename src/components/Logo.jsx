import { Users } from "lucide-react";
import { motion } from "motion/react";

export default function Logo({ size = "md", className = "", showSubtitle = true }) {
  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 26,
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
      whileHover="hover"
      className={`flex select-none ${size === "lg" ? "flex-col items-center text-center gap-2" : "items-center gap-3"} ${className}`} 
      id="smart-crm-logo"
    >
      <motion.div 
        variants={{
          hover: { 
            scale: 1.1, 
            rotate: [0, -4, 4, 0],
            boxShadow: "0 0 25px rgba(6, 182, 212, 0.6)"
          }
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 12,
          rotate: { type: "tween", ease: "easeInOut", duration: 0.4 }
        }}
        className="flex items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 shadow-[0_0_15px_rgba(6,182,212,0.35)] relative overflow-hidden"
        style={{
          width: size === "sm" ? "30px" : size === "md" ? "42px" : "56px",
          height: size === "sm" ? "30px" : size === "md" ? "42px" : "56px",
        }}
      >
        {/* Shimmer overlay effect */}
        <motion.div 
          animate={{ x: ["-100%", "100%"] }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />
        <Users className="text-white relative z-10" size={iconSizes[size]} />
      </motion.div>
      <div className={size === "lg" ? "flex flex-col items-center" : ""}>
        <h1 
          className="font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(6,182,212,0.3)]"
          style={{
            fontSize: size === "sm" ? "1.1rem" : size === "md" ? "1.40rem" : "2.1rem",
            letterSpacing: "-0.03em"
          }}
        >
          Smart CRM
        </h1>
        {showSubtitle && (
          <p 
            className="font-display italic text-cyan-300 font-semibold leading-none mt-1.5 opacity-95"
            style={{
              fontSize: size === "sm" ? "10px" : size === "md" ? "12px" : "16px",
              letterSpacing: "0.08em"
            }}
          >
            Client Lead Management
          </p>
        )}
      </div>
    </motion.div>
  );
}
