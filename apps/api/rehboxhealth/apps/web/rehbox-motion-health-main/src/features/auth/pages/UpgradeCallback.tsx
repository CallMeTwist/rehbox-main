import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

type Status = 'verifying' | 'success' | 'failed';

const MAX_ATTEMPTS = 5;

export default function UpgradeCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const reference = params.get('reference');
  const updateUser = useAuthStore((s) => s.updateUser);
  const [status, setStatus] = useState<Status>('verifying');
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    if (!reference) {
      setStatus('failed');
      return;
    }

    let cancelled = false;

    const verify = async (attempt: number): Promise<void> => {
      try {
        const { data } = await api.get<{ status: string; subscription_plan?: string }>(
          '/client/subscribe/verify',
          { params: { reference } },
        );

        if (cancelled) return;

        if (data.status === 'active') {
          updateUser({
            subscriptionPlan: (data.subscription_plan as 'standard') ?? 'standard',
            subscription_status: 'active',
          });
          setStatus('success');
          toast.success('Subscription active — welcome to Standard!');
          setTimeout(() => navigate('/client/home', { replace: true }), 1600);
          return;
        }

        // Payment not confirmed yet (webhook may still be in flight) — retry.
        if (attempt < MAX_ATTEMPTS) {
          setTimeout(() => verify(attempt + 1), 2000);
        } else {
          setStatus('failed');
        }
      } catch {
        if (cancelled) return;
        setStatus('failed');
      }
    };

    verify(1);

    return () => {
      cancelled = true;
    };
  }, [reference, navigate, updateUser]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#07101f' }}>
      <div
        className="w-full max-w-md rounded-3xl p-10 text-center"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {status === 'verifying' && (
          <>
            <Loader2 size={40} className="text-pink-400 mx-auto mb-5 animate-spin" />
            <h1 className="font-display font-bold text-xl text-white mb-2">Confirming your payment…</h1>
            <p className="text-white/50 text-sm">This only takes a moment. Please don't close this page.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 size={40} className="text-green-400 mx-auto mb-5" />
            <h1 className="font-display font-bold text-xl text-white mb-2">You're all set!</h1>
            <p className="text-white/50 text-sm">Taking you to your dashboard…</p>
          </>
        )}

        {status === 'failed' && (
          <>
            <XCircle size={40} className="text-red-400 mx-auto mb-5" />
            <h1 className="font-display font-bold text-xl text-white mb-2">We couldn't confirm your payment</h1>
            <p className="text-white/50 text-sm mb-6">
              If you were charged, it may take a minute to reflect. Otherwise you can try again.
            </p>
            <Link
              to="/upgrade"
              className="inline-flex items-center justify-center px-6 py-3 rounded-2xl text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg,#E5197D,#C4006A)' }}
            >
              Back to Upgrade
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
