import { useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Brain, Users, Globe, Heart, Zap, Shield } from "lucide-react";
import {
  Eyebrow, SectionHeading, GradientText, StatCounter,
} from "@/features/auth/components/public/primitives";
import {
  revealOnScroll, prefersReducedMotion, useCountUp,
} from "@/features/auth/components/public/useReveal";

// ── Data ──────────────────────────────────────────────────────────────────────
const stats = [
  { value: 500, suffix: "+", label: "Patients" },
  { value: 80, suffix: "+", label: "Certified PTs" },
  { value: 95, suffix: "%", label: "Recovery Rate" },
  { value: 5, suffix: "", label: "Languages" },
];

const pillars = [
  {
    icon: Brain, title: "AI Motion Tracking",
    desc: "Real-time pose analysis gives patients instant feedback on every rep, so they train correctly even without a PT in the room.",
  },
  {
    icon: Users, title: "Vetted Physiotherapists",
    desc: "Every PT on ReHboX is screened and credentialled before joining. Your recovery is guided by experts, not algorithms alone.",
  },
  {
    icon: Globe, title: "Built for Nigeria",
    desc: "Available in English, Pidgin, Yoruba, Igbo, and Hausa — physiotherapy that speaks your language.",
  },
  {
    icon: Heart, title: "Patient-First Design",
    desc: "Every feature is designed around patient outcomes — from the coin reward system to detailed PT-to-patient messaging.",
  },
  {
    icon: Zap, title: "Instant Feedback",
    desc: "MediaPipe-powered goniometric tracking measures range of motion live, giving you data that used to require clinic visits.",
  },
  {
    icon: Shield, title: "Secure & Private",
    desc: "Your health data is encrypted and stored securely. We never share your information without your explicit consent.",
  },
];

const steps = [
  { n: "01", title: "Register", desc: "Create your patient profile in under 2 minutes." },
  { n: "02", title: "Connect with a PT", desc: "Get matched with a certified physiotherapist." },
  { n: "03", title: "Follow your plan", desc: "Complete guided exercise sessions from home." },
  { n: "04", title: "Track progress", desc: "See your recovery data and earn coins for consistency." },
];

const team = [
  {
    name: "PT Stephanie Ede",
    role: "Founder & CEO",
    tag: "CEO",
    img: "/team/stephanie-ede.jpg",
    bio: "Physiotherapist on a mission to make world-class rehabilitation accessible to every Nigerian home.",
    objectPosition: "50% 22%",
  },
  {
    name: "PT Edison Eluke",
    role: "Engineer & Product Architect",
    tag: "Engineering",
    img: "/team/edison-eluke.jpg",
    bio: "The engineer behind the platform, turning AI motion tracking and clinical care into the product you use today.",
    objectPosition: "50% 28%",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────
const About = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  useCountUp();

  useGSAP(() => {
    if (!prefersReducedMotion()) {
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .from(".about-title", { opacity: 0, y: 26, duration: 0.7 })
        .from(".about-sub", { opacity: 0, y: 20, duration: 0.55 }, "-=0.32")
        .from(".about-stats", { opacity: 0, y: 16, duration: 0.5, stagger: 0.07 }, "-=0.28")
        .from(".about-figure", { opacity: 0, scale: 0.94, duration: 0.8, ease: "power2.out" }, "-=0.6");
    }

    const scope = containerRef.current;
    if (!scope) return;
    revealOnScroll(scope);
    revealOnScroll(scope, ".pillar-card", { stagger: 0.07 });
    revealOnScroll(scope, ".step-item", { stagger: 0.1 });
    revealOnScroll(scope, ".team-card", { stagger: 0.08 });
  }, { scope: containerRef });

  return (
    <div ref={containerRef}>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-pub-hero pt-16">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.035) 1px,transparent 1px)",
            backgroundSize: "46px 46px",
            maskImage: "radial-gradient(circle at 30% 40%, #000, transparent 75%)",
            WebkitMaskImage: "radial-gradient(circle at 30% 40%, #000, transparent 75%)",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-6 md:px-12 py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Eyebrow tone="dark" live>Our mission</Eyebrow>
            <h1 className="about-title font-display font-bold text-4xl md:text-[3.5rem] text-white leading-[1.05] tracking-tight mt-6">
              Bringing physiotherapy to <GradientText>every Nigerian home.</GradientText>
            </h1>
            <p className="about-sub text-lg leading-relaxed mt-5 max-w-md" style={{ color: "#AEBCD8" }}>
              ReHboX combines certified physiotherapists with AI-powered motion tracking to deliver
              world-class rehabilitation — accessible, affordable, and in your language.
            </p>
            <div className="flex flex-wrap gap-x-10 gap-y-6 mt-12">
              {stats.map((s) => (
                <div key={s.label} className="about-stats">
                  <StatCounter value={s.value} suffix={s.suffix} label={s.label} tone="dark" />
                </div>
              ))}
            </div>
          </div>
          <div className="about-figure relative flex items-center justify-center">
            <div
              className="absolute w-[78%] h-[68%] rounded-full"
              style={{ background: "radial-gradient(circle, rgba(38,198,218,0.22), rgba(224,71,155,0.12) 45%, transparent 70%)" }}
            />
            <img
              src="/exercise-pose.jpg"
              alt="Patient performing a guided exercise with live AI pose overlay"
              className="relative w-full rounded-3xl object-cover"
              style={{ border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 30px 60px rgba(0,0,0,0.45)" }}
            />
          </div>
        </div>
      </section>

      {/* ── WHY REHBOX / PILLARS ─────────────────────────────────────────── */}
      <section className="px-6 md:px-12 py-24" style={{ background: "var(--pub-ivory)" }}>
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            tone="light"
            eyebrow="Why ReHboX"
            title="Technology and expertise, together."
            subtitle="Every feature pairs AI precision with certified human care — accessible, affordable, and in your language."
          />
          <div className="pillars-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((p) => (
              <div
                key={p.title}
                className="pillar-card rounded-3xl p-7 transition-transform duration-300 hover:-translate-y-1.5"
                style={{ background: "var(--pub-card-light)", border: "1px solid var(--pub-border-light)", boxShadow: "0 8px 30px rgba(10,20,48,0.06)" }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: "var(--pub-grad-accent)" }}>
                  <p.icon size={22} className="text-white" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2" style={{ color: "var(--pub-ink-text)" }}>{p.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--pub-ink-mute)" }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION BAND ─────────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 py-24" style={{ background: "var(--pub-canvas-dark)" }}>
        <div className="reveal max-w-3xl mx-auto text-center">
          <div className="mb-6"><Eyebrow tone="dark">The problem we solve</Eyebrow></div>
          <p className="font-display font-semibold text-2xl md:text-4xl text-white leading-snug tracking-tight">
            We built ReHboX to solve a real problem: millions of Nigerians need physiotherapy
            but can't access it. <GradientText>We're changing that.</GradientText>
          </p>
        </div>
      </section>

      {/* ── STEPS ────────────────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 py-24" style={{ background: "var(--pub-ivory)" }}>
        <div className="max-w-5xl mx-auto">
          <SectionHeading tone="light" eyebrow="How it works" title="From sign-up to recovery" />
          <div className="steps-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={s.n} className="step-item relative">
                {i < steps.length - 1 && (
                  <div
                    className="hidden md:block absolute top-5 left-[calc(50%+24px)] right-0 h-px"
                    style={{ background: "linear-gradient(90deg, var(--pub-border-light), transparent)" }}
                  />
                )}
                <span className="pub-gradient-text font-display font-bold text-3xl md:text-4xl leading-none">{s.n}</span>
                <h3 className="font-display font-bold text-lg mt-3 mb-1.5" style={{ color: "var(--pub-ink-text)" }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--pub-ink-mute)" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ─────────────────────────────────────────────────────────── */}
      <section className="relative px-6 md:px-12 py-28 overflow-hidden" style={{ background: "var(--pub-card-light)" }}>
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[60%] pointer-events-none opacity-60"
          style={{ background: "radial-gradient(ellipse at top, rgba(38,198,218,0.10), transparent 65%)" }}
        />
        <div className="relative max-w-5xl mx-auto">
          <SectionHeading tone="light" eyebrow="Our team" title="The people behind ReHboX" subtitle="A clinician and an engineer, building recovery you can trust." />
          <div className="team-grid grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10 max-w-3xl mx-auto">
            {team.map((m) => (
              <article
                key={m.name}
                className="team-card group relative rounded-[28px] overflow-hidden transition-all duration-500 hover:-translate-y-2"
                style={{ border: "1px solid var(--pub-border-light)", boxShadow: "0 18px 50px rgba(10,20,48,0.12)" }}
              >
                {/* portrait */}
                <div className="relative aspect-square overflow-hidden" style={{ background: "var(--pub-ivory)" }}>
                  <img
                    src={m.img}
                    alt={`${m.name} — ${m.role}`}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                    style={{ objectPosition: m.objectPosition }}
                  />
                  {/* scrim */}
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(7,12,30,0.92) 0%, rgba(7,12,30,0.45) 32%, transparent 58%)" }}
                  />
                  {/* role pill */}
                  <span
                    className="absolute top-4 left-4 inline-flex items-center text-[11px] font-semibold uppercase tracking-[0.14em] px-3 py-1.5 rounded-full text-white backdrop-blur-sm"
                    style={{ background: "var(--pub-grad-accent)", boxShadow: "0 6px 18px rgba(224,71,155,0.35)" }}
                  >
                    {m.tag}
                  </span>
                  {/* name + role overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-display font-bold text-xl text-white leading-tight">{m.name}</h3>
                    <p className="text-sm mt-1 font-medium" style={{ color: "#A9E8F0" }}>{m.role}</p>
                  </div>
                </div>
                {/* bio footer */}
                <div className="p-6" style={{ background: "var(--pub-ivory)" }}>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--pub-ink-mute)" }}>{m.bio}</p>
                </div>
                {/* accent baseline */}
                <div
                  className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500"
                  style={{ background: "var(--pub-grad-accent)" }}
                />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 py-24" style={{ background: "var(--pub-ink-base)" }}>
        <div
          className="reveal max-w-4xl mx-auto rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
          style={{ background: "linear-gradient(120deg,#1a1030,#0c1830)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(224,71,155,0.22), transparent 70%)" }} />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(38,198,218,0.16), transparent 70%)" }} />
          <div className="relative">
            <h2 className="font-display font-bold text-3xl md:text-5xl text-white mb-5 leading-tight">
              Ready to start <GradientText>healing?</GradientText>
            </h2>
            <p className="text-lg mb-10 max-w-lg mx-auto" style={{ color: "#9FB2D8" }}>
              Join thousands of Nigerians recovering smarter with ReHboX.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register/client"
                className="inline-flex items-center justify-center gap-2 font-bold px-10 py-4 rounded-2xl text-white hover:opacity-90 transition-opacity"
                style={{ background: "var(--pub-grad-magenta)", boxShadow: "0 12px 32px rgba(224,71,155,0.4)" }}
              >
                Register as Patient <ArrowRight size={16} />
              </Link>
              <Link
                to="/register/physio"
                className="inline-flex items-center justify-center gap-2 font-semibold px-10 py-4 rounded-2xl text-white hover:bg-white/10 transition-colors"
                style={{ border: "1px solid rgba(255,255,255,0.3)" }}
              >
                Register as PT
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
