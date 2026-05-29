// Shared cinematic accent presets for the auth pages (login / register).
// Two accents keep the PT and Patient flows visually distinct while staying
// in the same dark, premium family as the login screen.

export type AccentKey = "blue" | "pink";

export interface Accent {
  /** Soft tint used for links / highlighted inline text on dark surfaces. */
  text: string;
  /** Primary CTA gradient. */
  gradient: string;
  /** CTA drop shadow. */
  glow: string;
  /** Focus ring colour (used as a 3px outer glow). */
  ring: string;
  /** Focus border colour. */
  border: string;
  /** Background atmosphere blobs. */
  blob1: string;
  blob2: string;
  /** Panel backgrounds. */
  leftBg: string;
  rightBg: string;
  /** Root page background fallback colour. */
  rootBg: string;
  /** Feature-icon chip styling. */
  iconBg: string;
  iconColor: string;
}

export const ACCENTS: Record<AccentKey, Accent> = {
  blue: {
    text: "#93c5fd",
    gradient: "linear-gradient(135deg,#2C5FC3,#1B3E8F)",
    glow: "0 10px 30px rgba(44,95,195,0.42)",
    ring: "rgba(79,141,247,0.16)",
    border: "rgba(79,141,247,0.5)",
    blob1: "rgba(44,95,195,0.32)",
    blob2: "rgba(229,25,125,0.16)",
    leftBg: "linear-gradient(160deg,#060c1e 0%,#091526 50%,#0e1e42 100%)",
    rightBg: "linear-gradient(180deg,#07101f,#060c1e)",
    rootBg: "#07101f",
    iconBg: "rgba(79,141,247,0.12)",
    iconColor: "#7dabff",
  },
  pink: {
    text: "#FF8FC4",
    gradient: "linear-gradient(135deg,#E5197D,#C4006A)",
    glow: "0 10px 30px rgba(229,25,125,0.42)",
    ring: "rgba(229,25,125,0.16)",
    border: "rgba(229,25,125,0.5)",
    blob1: "rgba(229,25,125,0.26)",
    blob2: "rgba(44,95,195,0.18)",
    leftBg: "linear-gradient(160deg,#0a0612 0%,#15091b 48%,#2a0c26 100%)",
    rightBg: "linear-gradient(180deg,#0b0713,#080410)",
    rootBg: "#0b0713",
    iconBg: "rgba(229,25,125,0.12)",
    iconColor: "#ff8fc4",
  },
};
