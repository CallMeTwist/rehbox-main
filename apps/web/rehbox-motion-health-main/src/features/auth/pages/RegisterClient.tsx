import { Link } from "react-router-dom";
import { Activity, HeartPulse, Trophy } from "lucide-react";
import AuthScaffold from "@/features/auth/components/AuthScaffold";
import RegistrationForm from "@/features/auth/components/RegistrationForm";

const RegisterClient = () => {
  return (
    <AuthScaffold
      accent="pink"
      eyebrow="Start your recovery"
      headline="Your recovery,"
      headlineAccent="guided every step."
      subhead="Follow a personalised plan, track your progress and stay connected with your physiotherapist."
      highlights={[
        { icon: HeartPulse, title: "Personalised plans", desc: "Exercises tailored to your body and your goals." },
        { icon: Activity, title: "Track every session", desc: "AI-assisted tracking keeps your recovery on course." },
        { icon: Trophy, title: "Stay motivated", desc: "Earn rewards and celebrate your milestones." },
      ]}
      stats={[
        { value: "87%", label: "Recovery rate" },
        { value: "5 min", label: "To start" },
        { value: "24/7", label: "Support" },
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
        <h1 className="font-display font-bold text-2xl text-white mb-1">Register as a Patient</h1>
        <p className="text-white/50 text-sm mb-7">
          Choose your plan and create your account to get started.
        </p>

        <RegistrationForm type="client" accent="pink" />

        <p className="text-center text-white/45 text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-pink-300 hover:text-pink-200">
            Sign in
          </Link>
        </p>
        <p className="text-center text-white/35 text-sm mt-2">
          Are you a physiotherapist?{" "}
          <Link to="/register/physio" className="font-semibold text-pink-300 hover:text-pink-200">
            Register here
          </Link>
        </p>
      </div>
    </AuthScaffold>
  );
};

export default RegisterClient;
