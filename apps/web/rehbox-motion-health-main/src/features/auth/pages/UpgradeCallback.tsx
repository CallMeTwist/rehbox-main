import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle, Crown } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

type Phase = 'verifying' | 'success' | 'pending' | 'error';

const MAX_ATTEMPTS = 6;
const RETRY_DELAY_MS = 2500;

export default function UpgradeCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const updateUser = useAuthStore((s) => s.updateUser);
  const reference = params.get('reference');

  const [phase, setPhase] = useState<Phase>(reference ? 'verifying' : 'error');
  const startedRef = useRef(false);

  useEffect(() => {
    if (!reference || startedRef.current) return;
    startedRef.current = true;

    let cancelled = false;
    let attempts = 0;

    const poll = async () => {
      attempts += 1;
      try {
        const { data } = await api.get<{ status: string; subscription_plan?: string }>(
          '/client/subscribe/verify',
          { params: { reference } },
        );

        if (cancelled) return;

        if (data.status === 'active') {
          updateUser({
            subscriptionPlan: (data.subscription_plan as 'standard' | 'enterprise') ?? 'standard',
            subscription_status: 'active',
          });
          setPhase('success');
          setTimeout(() => navigate('/client/home', { replace: true }), 1800);
          return;
        }

        if (attempts < MAX_ATTEMPTS) {
          setTimeout(poll, RETRY_DELAY_MS);
        } else {
          setPhase('pending');
        }
      } catch {
        if (cancelled) return;
        if (attempts < MAX_ATTEMPTS) {
          setTimeout(poll, RETRY_DELAY_MS);
        } else {
          setPhase('error');
        }
      }
    };

    poll();

    return () => {
      cancelled = true;
    };
  }, [reference, navigate, updateUser]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: 'linear-gradient(160deg,#060c1e 0%,#091526 50%,#0e1e42 100%)' }}
    >
      <div className="absolute top-[-15%] right-[-8%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(229,25,125,0.22),transparent 65%)', filter: 'blur(80px)' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 max-w-md w-full rounded-3xl p-10 text-center"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {phase === 'verifying' && (
          <>
            <Loader2 size={44} className="mx-auto mb-6 animate-spin" style={{ color: '#FF6BB5' }} />
            <h1 className="font-display font-bold text-2xl text-white mb-2">Confirming your payment…</h1>
            <p className="text-white/55 text-sm">Hang tight — this only takes a moment.</p>
          </>
        )}

        {phase === 'success' && (
          <>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: 'rgba(229,25,125,0.10)', border: '1px solid rgba(229,25,125,0.22)' }}>
              <Crown size={14} className="text-pink-400" />
              <span className="text-pink-200 text-xs font-medium">Standard unlocked</span>
            </div>
            <CheckCircle2 size={44} className="mx-auto mb-6 text-emerald-400" />
            <h1 className="font-display font-bold text-2xl text-white mb-2">You're all set!</h1>
            <p className="text-white/55 text-sm">Taking you to your dashboard…</p>
          </>
        )}

        {phase === 'pending' && (
          <>
            <Loader2 size={44} className="mx-auto mb-6" style={{ color: '#FF6BB5' }} />
            <h1 className="font-display font-bold text-2xl text-white mb-2">Almost there</h1>
            <p className="text-white/55 text-sm mb-6">
              Your payment is processing. It can take a minute to reflect — your access will unlock automatically.
            </p>
            <Link to="/client/home" className="inline-block py-3 px-6 rounded-2xl text-white font-bold"
              style={{ background: 'linear-gradient(135deg,#E5197D,#C4006A)' }}>
              Back to dashboard
            </Link>
          </>
        )}

        {phase === 'error' && (
          <>
            <XCircle size={44} className="mx-auto mb-6 text-red-400" />
            <h1 className="font-display font-bold text-2xl text-white mb-2">We couldn't confirm that</h1>
            <p className="text-white/55 text-sm mb-6">
              {reference
                ? "If you were charged, your access will still unlock shortly. Otherwise, try upgrading again."
                : 'No payment reference was found.'}
            </p>
            <Link to="/upgrade" className="inline-block py-3 px-6 rounded-2xl text-white font-bold"
              style={{ background: 'linear-gradient(135deg,#E5197D,#C4006A)' }}>
              Back to upgrade
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
}
