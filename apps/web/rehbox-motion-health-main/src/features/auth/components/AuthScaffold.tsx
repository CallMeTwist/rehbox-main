import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ACCENTS, type AccentKey } from "./authTheme";

// Deterministic-ish particle field for the cinematic side panel.
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  size: ((i * 37) % 100) / 100 * 2.2 + 1,
  x: ((i * 53) % 100),
  y: ((i * 29) % 100),
  opacity: ((i * 17) % 100) / 100 * 0.5 + 0.15,
  duration: ((i * 41) % 100) / 100 * 6 + 4,
  delay: ((i * 23) % 100) / 100 * 4,
}));

export interface Highlight {
  icon: LucideIcon;
  title: string;
  desc: string;
}

export interface AuthStat {
  value: string;
  label: string;
}

interface AuthScaffoldProps {
  accent: AccentKey;
  eyebrow: string;
  headline: React.ReactNode;
  /** Gradient-clipped second line of the headline. */
  headlineAccent: string;
  subhead: string;
  highlights: Highlight[];
  stats: AuthStat[];
  children: React.ReactNode;
}

const AuthScaffold = ({
  accent,
  eyebrow,
  headline,
  headlineAccent,
  subhead,
  highlights,
  stats,
  children,
}: AuthScaffoldProps) => {
  const a = ACCENTS[accent];

  return (
    <div className="min-h-screen flex" style={{ background: a.rootBg }}>
      {/* ── Left cinematic panel (desktop only) ──────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[48%] relative overflow-hidden flex-col justify-between p-12"
        style={{ background: a.leftBg }}
      >
        {/* atmosphere */}
        <div
          className="absolute top-[-15%] right-[-8%] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle,${a.blob1},transparent 65%)`, filter: "blur(80px)" }}
        />
        <div
          className="absolute bottom-[-15%] left-[-8%] w-[420px] h-[420px] rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle,${a.blob2},transparent 65%)`, filter: "blur(80px)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle,#ffffff 1px,transparent 1px)", backgroundSize: "36px 36px" }}
        />
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: p.size,
              height: p.size,
              background: p.id % 3 === 0 ? a.iconColor : "#ffffff",
              left: `${p.x}%`,
              top: `${p.y}%`,
              opacity: p.opacity,
              animation: `particle-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        ))}

        {/* top: eyebrow (brand lives in the navbar) */}
        <div className="relative z-10">
          <span
            className="inline-flex items-center gap-2 w-fit rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em]"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: a.text }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: a.iconColor }} />
            {eyebrow}
          </span>
        </div>

        {/* middle: headline + highlights */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative z-10"
        >
          <h2 className="font-display font-bold text-[2.7rem] leading-[1.05] text-white mb-4">
            {headline}
            <br />
            <span
              style={{
                background: a.gradient,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {headlineAccent}
            </span>
          </h2>
          <p className="text-white/55 text-base max-w-md mb-9">{subhead}</p>

          <div className="space-y-4 max-w-md">
            {highlights.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                className="flex items-start gap-3.5"
              >
                <div
                  className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: a.iconBg, border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <Icon size={16} style={{ color: a.iconColor }} />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-tight">{title}</p>
                  <p className="text-white/45 text-[13px] leading-snug mt-0.5">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* bottom: trust stats */}
        <div className="relative z-10 flex gap-8">
          {stats.map(({ value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 + i * 0.1 }}
            >
              <p className="text-white font-display font-bold text-2xl">{value}</p>
              <p className="text-white/40 text-[10px] uppercase tracking-[0.16em] mt-0.5">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────────────────── */}
      <div
        className="flex-1 flex items-center justify-center p-5 sm:p-8 relative overflow-hidden"
        style={{ background: a.rightBg }}
      >
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none lg:hidden"
          style={{ backgroundImage: "radial-gradient(circle,#ffffff 1px,transparent 1px)", backgroundSize: "36px 36px" }}
        />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg relative z-10 my-auto"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default AuthScaffold;
