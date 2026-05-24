import { useState, useMemo, useCallback, FormEvent } from 'react';
import { CreditCard, Wallet, Landmark, ArrowRight, ShieldCheck, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';

type PaymentMethod = 'card' | 'paypal' | 'local';
type PaidPlanId = 'professional' | 'agency';

interface FormData {
  fullName: string;
  email: string;
  companyName: string;
}

const PLAN_PRICES: Record<PaidPlanId, { label: string; price: string; amount: number }> = {
  professional: { label: 'Professional', price: '$49',  amount: 49  },
  agency:       { label: 'Agency',       price: '$149', amount: 149 }
};

const FALLBACK_PLAN: PaidPlanId = 'professional';

const PAYMENT_METHODS: {
  id: PaymentMethod;
  label: string;
  sub: string;
  Icon: React.ElementType;
}[] = [
  { id: 'card',   label: 'Credit Card',   sub: 'Stripe Secure',      Icon: CreditCard },
  { id: 'paypal', label: 'PayPal Engine', sub: 'Global Node',         Icon: Wallet     },
  { id: 'local',  label: 'Local Billing', sub: 'bKash / Local Cards', Icon: Landmark   }
];

export default function Account() {
  const selectedPlan = useMemo<PaidPlanId>(() => {
    const raw = new URLSearchParams(window.location.search).get('plan') ?? '';
    return raw in PLAN_PRICES ? (raw as PaidPlanId) : FALLBACK_PLAN;
  }, []);

  const planInfo = PLAN_PRICES[selectedPlan];

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    companyName: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [isSubmitting, setIsSubmitting]   = useState(false);

  const handleFieldChange = useCallback(
    (field: keyof FormData) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      },
    []
  );

  // ✅ FIX: double submit guard যোগ করা হয়েছে
  const handleCheckout = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // TODO: Replace with real payment gateway (e.g. Stripe checkout session)
      console.info('Checkout payload:', { formData, paymentMethod, selectedPlan });
      toast.success('Redirecting to secure billing node...');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Activation pipeline failed.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-20 px-4 bg-black min-h-screen text-white">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-start">

        {/* FORM COLUMN */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <span className="text-orange-500 text-[10px] uppercase font-black tracking-widest block mb-2">
              Setup Terminal
            </span>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">
              Account Activation
            </h1>
          </div>

          <form onSubmit={handleCheckout} className="space-y-6">
            <fieldset disabled={isSubmitting} className="space-y-6 disabled:opacity-60">

              {/* 1. INFRASTRUCTURE DETAILS */}
              <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-white/40 mb-2">
                  1. Infrastructure Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="text-[10px] uppercase font-mono text-white/40">
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      required
                      type="text"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={handleFieldChange('fullName')}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white focus:border-orange-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-[10px] uppercase font-mono text-white/40">
                      Email Address
                    </label>
                    <input
                      id="email"
                      required
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleFieldChange('email')}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white focus:border-orange-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label htmlFor="companyName" className="text-[10px] uppercase font-mono text-white/40">
                    Company / Agency Identity (Optional)
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    placeholder="Pixel Pulse Agency"
                    value={formData.companyName}
                    onChange={handleFieldChange('companyName')}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white focus:border-orange-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* 2. BILLING NETWORK */}
              <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-white/40 mb-2">
                  2. Select Billing Network
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="group" aria-label="Payment method">
                  {PAYMENT_METHODS.map(({ id, label, sub, Icon }) => {
                    const isActive = paymentMethod === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPaymentMethod(id)}
                        aria-pressed={isActive}
                        className={`p-4 rounded-xl border text-left flex flex-col justify-between h-28 transition-all ${
                          isActive
                            ? 'bg-white text-black border-white'
                            : 'bg-black text-white border-white/10 hover:border-white/20'
                        }`}
                      >
                        <Icon size={20} className={isActive ? 'text-black' : 'text-white'} />
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider">{label}</div>
                          <div className={`text-[9px] font-mono ${isActive ? 'text-black/50' : 'text-white/40'}`}>
                            {sub}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <><RefreshCcw size={14} className="animate-spin" /><span>Provisioning Uplink...</span></>
                ) : (
                  <><span>Confirm &amp; Proceed</span><ArrowRight size={14} /></>
                )}
              </button>

            </fieldset>
          </form>
        </div>

        {/* ORDER SUMMARY */}
        <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 md:col-span-1 space-y-6">
          <h3 className="text-xs font-black uppercase tracking-wider text-white/30">
            Engine Summary
          </h3>

          <div className="border-b border-white/5 pb-4">
            <div className="text-2xl font-black uppercase italic tracking-tight text-orange-500">
              {planInfo.label} Plan
            </div>
            <div className="text-xs text-white/40 mt-1">Automatic recurring quota allocation.</div>
          </div>

          <div className="space-y-3 font-mono text-xs border-b border-white/5 pb-6">
            <div className="flex justify-between">
              <span className="text-white/40">Subtotal</span>
              <span>{planInfo.price}.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Pipeline Setup</span>
              <span className="text-emerald-400">FREE</span>
            </div>
          </div>

          <div className="flex justify-between items-baseline pt-2">
            <span className="text-xs uppercase font-black tracking-wider text-white/40">Total</span>
            <span className="text-4xl font-black tracking-tight">{planInfo.price}</span>
          </div>

          <div className="bg-white/5 rounded-xl p-4 flex items-start space-x-3 text-[10px] text-white/40 leading-relaxed font-light">
            <ShieldCheck size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            <span>
              Secure billing gateway encryption active. Subscriptions can be configured or terminated anytime inside your interface.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}