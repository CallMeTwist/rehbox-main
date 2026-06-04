// src/features/auth/components/RegistrationForm.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, Lock, BadgeCheck, Building2, MapPin, FileUp, CheckCircle2, type LucideIcon } from "lucide-react";
import { usePTRegister, useClientRegister } from "@/features/auth/hooks/useAuth";
import { ACCENTS, type Accent, type AccentKey } from "./authTheme";

interface Props {
  type: "pt" | "client";
  accent?: AccentKey;
  onSubmit?: () => void; // kept for compatibility but we handle nav in the hook
}

type ChosenPlan = "free" | "standard";

const FIELD_BASE = "rgba(255,255,255,0.04)";
const FIELD_BORDER = "rgba(255,255,255,0.08)";

// ── Hoisted field primitives (kept at module scope so inputs don't
//    remount — and lose focus — on every keystroke) ──────────────────
const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-medium text-white/65 mb-1.5">{children}</label>
);

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  accent: Accent;
  icon?: LucideIcon;
  extraClass?: string;
}

const TextField = ({ accent, icon: Icon, extraClass = "", ...props }: TextFieldProps) => (
  <div className="relative">
    {Icon && <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35" />}
    <input
      {...props}
      className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none transition-all ${extraClass}`}
      style={{ background: FIELD_BASE, border: `1px solid ${FIELD_BORDER}` }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = accent.border;
        e.currentTarget.style.boxShadow = `0 0 0 3px ${accent.ring}`;
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = FIELD_BORDER;
        e.currentTarget.style.boxShadow = "none";
      }}
    />
  </div>
);

const RegistrationForm = ({ type, accent }: Props) => {
  const a = ACCENTS[accent ?? (type === "pt" ? "blue" : "pink")];

  const ptRegister = usePTRegister();
  const clientRegister = useClientRegister();

  const [step, setStep] = useState(1);
  const [chosenPlan, setChosenPlan] = useState<ChosenPlan>("free");
  const [form, setForm] = useState({
    name: "", email: "", password: "", password_confirmation: "",
    phone: "", license_number: "", hospital_or_clinic: "",
    specialty: "", city: "", activation_code: "",
  });
  const [credentialFile, setCredentialFile] = useState<File | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    if (type === "pt") {
      const fd = new FormData();

      fd.append("name", form.name);
      fd.append("email", form.email);
      fd.append("password", form.password);
      fd.append("password_confirmation", form.password_confirmation);
      fd.append("phone", form.phone);
      fd.append("license_number", form.license_number);
      fd.append("hospital_or_clinic", form.hospital_or_clinic);
      fd.append("specialty", form.specialty);
      fd.append("city", form.city);
      fd.append("agreed_to_terms", "1");

      if (credentialFile) fd.append("credential_document", credentialFile);
      ptRegister.mutate(fd);
    } else {
      clientRegister.mutate({
        name:                  form.name,
        email:                 form.email,
        password:              form.password,
        password_confirmation: form.password_confirmation,
        phone:                 form.phone,
        activation_code:       chosenPlan === "standard" ? (form.activation_code || "") : "",
        subscription_plan:     chosenPlan,
        agreed_to_terms:       "1",
      });
    }
  };

  const isPending = ptRegister.isPending || clientRegister.isPending;
  const totalSteps = type === "pt" ? 3 : 1;

  const focusOn = (e: React.FocusEvent<HTMLElement>) => {
    e.currentTarget.style.borderColor = a.border;
    e.currentTarget.style.boxShadow = `0 0 0 3px ${a.ring}`;
  };
  const focusOff = (e: React.FocusEvent<HTMLElement>) => {
    e.currentTarget.style.borderColor = FIELD_BORDER;
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <div className="space-y-5">
      {/* Step indicator — PT only */}
      {type === "pt" && (
        <div className="flex items-center gap-2.5">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-1.5 text-[11px] font-semibold">
              <span
                className="w-1.5 h-1.5 rounded-full transition-all"
                style={{ background: s <= step ? a.iconColor : "rgba(255,255,255,0.18)" }}
              />
              <span style={{ color: s <= step ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.35)" }}>
                {s === 1 ? "Account" : s === 2 ? "Practice" : "Verify"}
              </span>
              {s < 3 && <span className="w-5 h-px" style={{ background: "rgba(255,255,255,0.12)" }} />}
            </div>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={type === "pt" ? `pt-${step}` : "client"}
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -14 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          {/* ── PT Step 1: Personal ── */}
          {type === "pt" && step === 1 && (
            <>
              <div>
                <FieldLabel>Full Name</FieldLabel>
                <TextField accent={a} icon={User} placeholder="Dr. Adaeze Okafor" value={form.name}
                  onChange={(e) => update("name", e.target.value)} />
              </div>
              <div>
                <FieldLabel>Email</FieldLabel>
                <TextField accent={a} icon={Mail} type="email" placeholder="you@hospital.com" value={form.email}
                  onChange={(e) => update("email", e.target.value)} />
              </div>
              <div>
                <FieldLabel>Phone</FieldLabel>
                <TextField accent={a} icon={Phone} placeholder="+234 800 000 0000" value={form.phone}
                  onChange={(e) => update("phone", e.target.value)} />
              </div>
              <div>
                <FieldLabel>Password</FieldLabel>
                <TextField accent={a} icon={Lock} type="password" placeholder="Create a strong password" value={form.password}
                  onChange={(e) => update("password", e.target.value)} />
              </div>
              <div>
                <FieldLabel>Confirm Password</FieldLabel>
                <TextField accent={a} icon={Lock} type="password" placeholder="Re-enter your password" value={form.password_confirmation}
                  onChange={(e) => update("password_confirmation", e.target.value)} />
              </div>
            </>
          )}

          {/* ── PT Step 2: Professional ── */}
          {type === "pt" && step === 2 && (
            <>
              <div>
                <FieldLabel>License Number</FieldLabel>
                <TextField accent={a} icon={BadgeCheck} placeholder="NMCN-123456" value={form.license_number}
                  onChange={(e) => update("license_number", e.target.value)} />
              </div>
              <div>
                <FieldLabel>Hospital / Clinic</FieldLabel>
                <TextField accent={a} icon={Building2} placeholder="Lagos University Teaching Hospital" value={form.hospital_or_clinic}
                  onChange={(e) => update("hospital_or_clinic", e.target.value)} />
              </div>
              <div>
                <FieldLabel>Specialty</FieldLabel>
                <select
                  className="w-full px-3.5 py-3 rounded-xl text-sm text-white focus:outline-none transition-all appearance-none"
                  style={{ background: FIELD_BASE, border: `1px solid ${FIELD_BORDER}` }}
                  value={form.specialty}
                  onChange={(e) => update("specialty", e.target.value)}
                  onFocus={focusOn}
                  onBlur={focusOff}
                >
                  <option value="" className="bg-[#0e1e42]">Select specialty</option>
                  <option className="bg-[#0e1e42]">Musculoskeletal</option>
                  <option className="bg-[#0e1e42]">Sports Physiotherapy</option>
                  <option className="bg-[#0e1e42]">Neurological</option>
                  <option className="bg-[#0e1e42]">Orthopaedic</option>
                  <option className="bg-[#0e1e42]">General Practice</option>
                </select>
              </div>
              <div>
                <FieldLabel>City</FieldLabel>
                <TextField accent={a} icon={MapPin} placeholder="Lagos" value={form.city}
                  onChange={(e) => update("city", e.target.value)} />
              </div>
            </>
          )}

          {/* ── PT Step 3: Documents + Terms ── */}
          {type === "pt" && step === 3 && (
            <>
              <div
                className="rounded-xl p-6 text-center cursor-pointer transition-all"
                style={{
                  background: FIELD_BASE,
                  border: `1.5px dashed ${credentialFile ? a.border : "rgba(255,255,255,0.16)"}`,
                }}
                onClick={() => document.getElementById("cred-upload")?.click()}
              >
                <input
                  id="cred-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setCredentialFile(file);
                  }}
                />
                <div
                  className="mx-auto w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: a.iconBg, border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  {credentialFile
                    ? <CheckCircle2 size={20} style={{ color: a.iconColor }} />
                    : <FileUp size={20} style={{ color: a.iconColor }} />}
                </div>
                <p className="text-sm font-semibold" style={{ color: credentialFile ? "#fff" : a.text }}>
                  {credentialFile ? credentialFile.name : "Upload Credentials"}
                </p>
                <p className="text-xs text-white/40 mt-1">PDF, JPG or PNG · max 5MB</p>
              </div>

              <div
                className="rounded-xl p-4 text-xs text-white/55 leading-relaxed h-28 overflow-y-auto"
                style={{ background: FIELD_BASE, border: `1px solid ${FIELD_BORDER}` }}
              >
                By registering, you agree to ReHboX's terms of use and privacy policy,
                and consent to the 48-hour vetting process conducted by the ReHboX medical team.
                Your data will be handled in compliance with relevant data protection regulations.
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="mt-0.5 w-4 h-4" style={{ accentColor: a.iconColor }}
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)} />
                <span className="text-sm text-white/55">
                  I agree to the <span className="font-medium" style={{ color: a.text }}>Terms &amp; Conditions</span> and{" "}
                  <span className="font-medium" style={{ color: a.text }}>Privacy Policy</span>
                </span>
              </label>
            </>
          )}

          {/* ── Client: single step ── */}
          {type === "client" && (
            <>
              <div className="space-y-2">
                <FieldLabel>Choose your plan</FieldLabel>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setChosenPlan("free")}
                    className="p-4 rounded-2xl text-left transition-all"
                    style={{
                      background: chosenPlan === "free" ? "rgba(255,255,255,0.06)" : FIELD_BASE,
                      border: `1px solid ${chosenPlan === "free" ? a.border : FIELD_BORDER}`,
                      boxShadow: chosenPlan === "free" ? `0 0 0 3px ${a.ring}` : "none",
                    }}
                  >
                    <p className="font-display font-bold text-sm text-white">Free</p>
                    <p className="text-white/45 text-xs mt-1 leading-snug">General exercises, basic tracking</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChosenPlan("standard")}
                    className="p-4 rounded-2xl text-left transition-all"
                    style={{
                      background: chosenPlan === "standard" ? "rgba(255,255,255,0.06)" : FIELD_BASE,
                      border: `1px solid ${chosenPlan === "standard" ? a.border : FIELD_BORDER}`,
                      boxShadow: chosenPlan === "standard" ? `0 0 0 3px ${a.ring}` : "none",
                    }}
                  >
                    <p className="font-display font-bold text-sm text-white">Standard · <span className="text-white/40 line-through font-normal">₦7,500</span> ₦2,000/mo</p>
                    <p className="text-white/45 text-xs mt-1 leading-snug">Personal PT, AI tracking, custom plan</p>
                  </button>
                </div>
              </div>

              <div>
                <FieldLabel>Full Name</FieldLabel>
                <TextField accent={a} icon={User} placeholder="Your full name" value={form.name}
                  onChange={(e) => update("name", e.target.value)} />
              </div>
              <div>
                <FieldLabel>Email</FieldLabel>
                <TextField accent={a} icon={Mail} type="email" placeholder="you@email.com" value={form.email}
                  onChange={(e) => update("email", e.target.value)} />
              </div>
              <div>
                <FieldLabel>Phone</FieldLabel>
                <TextField accent={a} icon={Phone} placeholder="+234 800 000 0000" value={form.phone}
                  onChange={(e) => update("phone", e.target.value)} />
              </div>
              {chosenPlan === "standard" && (
                <div>
                  <FieldLabel>
                    Activation Code{" "}
                    <span className="text-white/35 font-normal text-[11px]">(optional)</span>
                  </FieldLabel>
                  <TextField
                    accent={a}
                    placeholder="Code from your Physiotherapist"
                    value={form.activation_code}
                    onChange={(e) => update("activation_code", e.target.value.toUpperCase())}
                    extraClass="tracking-widest font-mono"
                  />
                  <p className="text-[11px] text-white/40 mt-1.5 leading-snug">
                    Have a code? Enter it to link with your physiotherapist. You can also add one later.
                  </p>
                </div>
              )}
              <div>
                <FieldLabel>Password</FieldLabel>
                <TextField accent={a} icon={Lock} type="password" placeholder="Create a strong password" value={form.password}
                  onChange={(e) => update("password", e.target.value)} />
              </div>
              <div>
                <FieldLabel>Confirm Password</FieldLabel>
                <TextField accent={a} icon={Lock} type="password" placeholder="Re-enter your password" value={form.password_confirmation}
                  onChange={(e) => update("password_confirmation", e.target.value)} />
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="mt-0.5 w-4 h-4" style={{ accentColor: a.iconColor }}
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)} />
                <span className="text-sm text-white/55">
                  I agree to the <span className="font-medium" style={{ color: a.text }}>Terms &amp; Conditions</span>
                </span>
              </label>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Navigation buttons ── */}
      <div className="flex gap-3 pt-1">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="flex-1 py-3.5 rounded-xl text-sm font-semibold text-white/80 transition-all hover:text-white"
            style={{ background: FIELD_BASE, border: `1px solid ${FIELD_BORDER}` }}
          >
            Back
          </button>
        )}
        {step < totalSteps ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="flex-1 text-white font-bold py-3.5 rounded-xl transition-all hover:scale-[1.01]"
            style={{ background: a.gradient, boxShadow: a.glow }}
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !agreedToTerms || (type === "pt" && !credentialFile)}
            className="flex-1 text-white font-bold py-3.5 rounded-xl transition-all hover:scale-[1.01] disabled:opacity-40 disabled:hover:scale-100"
            style={{ background: a.gradient, boxShadow: a.glow }}
          >
            {isPending
              ? "Submitting…"
              : type === "pt"
                ? "Submit for Review"
                : "Create Account"}
          </button>
        )}
      </div>
    </div>
  );
};

export default RegistrationForm;
