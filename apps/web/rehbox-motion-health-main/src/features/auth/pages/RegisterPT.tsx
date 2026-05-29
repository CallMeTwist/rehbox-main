import { Link } from "react-router-dom";
import { ShieldCheck, Users, Wallet } from "lucide-react";
import AuthScaffold from "@/features/auth/components/AuthScaffold";
import RegistrationForm from "@/features/auth/components/RegistrationForm";

const RegisterPT = () => {
  return (
    <AuthScaffold
      accent="blue"
      eyebrow="For Physiotherapists"
      headline="Build your"
      headlineAccent="digital practice."
      subhead="Join a vetted network of clinicians and onboard your clients with a platform built for outcomes."
      highlights={[
        { icon: ShieldCheck, title: "Verified credentials", desc: "Get vetted by the ReHboX medical team within 48 hours." },
        { icon: Users, title: "Manage clients with ease", desc: "Assign plans, track adherence and message in one place." },
        { icon: Wallet, title: "Grow your income", desc: "Reach more patients with remote, subscription-based care." },
      ]}
      stats={[
        { value: "48hr", label: "Vetting" },
        { value: "100%", label: "Remote" },
        { value: "1k+", label: "Patients" },
      ]}
    >
      <div
        className="rounded-3xl p-7 sm:p-8"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
        }}
      >
        <h1 className="font-display font-bold text-2xl text-white mb-1">Join as a Physiotherapist</h1>
        <p className="text-white/50 text-sm mb-7">
          Complete your profile to get vetted and start onboarding clients.
        </p>

        <RegistrationForm type="pt" accent="blue" />

        <p className="text-center text-white/45 text-sm mt-6">
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-blue-300 hover:text-blue-200">
            Sign in
          </Link>
        </p>
      </div>
    </AuthScaffold>
  );
};

export default RegisterPT;
