import { Eyebrow } from "@/features/auth/components/public/primitives";

// Logo plates live in /public/sponsors. Some files bundle several partner marks.
const SPONSORS = [
  { src: "/sponsors/i2m-ukaid-risa.jpeg", alt: "I2M, UK aid & RISA" },
  { src: "/sponsors/africa-oxford.jpeg", alt: "Africa Oxford Initiative & University of Oxford" },
  { src: "/sponsors/royal-academy-engineering.jpeg", alt: "Royal Academy of Engineering" },
  { src: "/sponsors/womhub.jpeg", alt: "WomHub" },
  { src: "/sponsors/founder-institute.jpeg", alt: "Founder Institute" },
];

const SponsorsMarquee = () => {
  // Render the row twice so the -50% keyframe wraps with no visible seam.
  const row = [...SPONSORS, ...SPONSORS];

  return (
    <section className="px-6 md:px-12 py-20 overflow-hidden" style={{ background: "var(--pub-ivory)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex mb-4"><Eyebrow tone="light">Backed by</Eyebrow></div>
          <h2 className="font-display font-bold text-2xl md:text-4xl tracking-tight" style={{ color: "var(--pub-ink-text)" }}>
            Supported by world-class partners
          </h2>
          <p className="text-sm md:text-base mt-3 max-w-xl mx-auto" style={{ color: "var(--pub-ink-mute)" }}>
            ReHboX is proud to be backed by leading innovation programmes, universities, and funds.
          </p>
        </div>

        <div className="pub-marquee-mask relative w-full overflow-hidden">
          <div className="pub-marquee-track flex w-max items-center gap-5">
            {row.map((s, i) => (
              <div
                key={`${s.src}-${i}`}
                aria-hidden={i >= SPONSORS.length}
                className="flex-shrink-0 flex items-center justify-center rounded-2xl px-8 py-6 h-28 transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "var(--pub-card-light)",
                  border: "1px solid var(--pub-border-light)",
                  boxShadow: "0 8px 30px rgba(10,20,48,0.06)",
                }}
              >
                <img
                  src={s.src}
                  alt={s.alt}
                  loading="lazy"
                  className="max-h-16 w-auto object-contain opacity-100 grayscale-0 transition-all duration-300 md:opacity-80 md:grayscale md:hover:opacity-100 md:hover:grayscale-0"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SponsorsMarquee;
