const HUD = [
  { label: "Range of Motion", value: "142°", note: "▲ optimal", pos: { left: "-4%", top: "20%" }, delay: "0s", show: "" },
  { label: "Form Accuracy",   value: "98%",  note: "· live",    pos: { right: "-6%", top: "42%" }, delay: "1.5s", show: "" },
  { label: "Session",         value: "Rep 12", note: "/ 15",    pos: { left: "2%", bottom: "10%" }, delay: "2.5s", show: "hidden lg:block" },
];

const HeroFigure = () => (
  <div className="hero-figure relative flex items-center justify-center min-h-[460px] md:min-h-[540px]">
    {/* spotlight */}
    <div
      className="absolute rounded-full pointer-events-none"
      style={{ width: "88%", height: "74%", background: "radial-gradient(circle, rgba(224,71,155,0.28), rgba(38,198,218,0.12) 45%, transparent 70%)" }}
      aria-hidden="true"
    />
    {/* orbital rings */}
    <div className="pub-anim-spin absolute rounded-full hidden sm:block pointer-events-none" style={{ width: 430, height: 430, border: "1px solid rgba(124,92,255,0.22)" }} aria-hidden="true" />
    <div className="pub-anim-spin-rev absolute rounded-full hidden sm:block pointer-events-none" style={{ width: 520, height: 520, border: "1px solid rgba(38,198,218,0.14)" }} aria-hidden="true" />

    {/* athlete */}
    <img
      src="/hero-runner.png"
      alt="Athlete performing a guided rehabilitation exercise"
      className="relative z-[2] w-full max-w-md object-contain"
      style={{ filter: "drop-shadow(0 0 50px rgba(38,198,218,0.4))" }}
    />

    {/* AI motion-tracking overlay (decorative) */}
    <div className="absolute inset-0 z-[3]" aria-hidden="true">
      {/* scan line */}
      <span
        className="pub-anim-scan absolute"
        style={{ left: "18%", right: "18%", height: 2, background: "linear-gradient(90deg,transparent,rgba(38,198,218,0.9),transparent)", boxShadow: "0 0 14px rgba(38,198,218,0.8)" }}
      />
      {/* HUD chips */}
      {HUD.map((h) => (
        <div
          key={h.label}
          className={`hero-hud pub-anim-float absolute rounded-2xl px-3.5 py-2.5 ${h.show}`}
          style={{ ...h.pos, animationDelay: h.delay, background: "rgba(8,18,40,0.55)", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "0 12px 30px rgba(0,0,0,0.35)", backdropFilter: "blur(12px)" }}
        >
          <div className="font-mono uppercase tracking-[0.12em] text-[9px]" style={{ color: "#9fc0ff" }}>{h.label}</div>
          <div className="font-display font-bold text-[1.05rem] text-white mt-0.5">
            {h.value} <span className="text-[0.7rem] font-sans font-semibold" style={{ color: "#34D399" }}>{h.note}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default HeroFigure;
