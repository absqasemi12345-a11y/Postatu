import { Check } from 'lucide-react';

interface Tier {
  id: string;
  name: string;
  price: string;
  period?: string;
  desc: string;
  features: string[];
  popular?: boolean;
  ctaLabel?: string;
}

const TIERS: Tier[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 'Free',
    desc: 'Perfect for solo creators starting their automation journey.',
    features: [
      'Connect 4 Social Engines (YT, FB, IG, TikTok)',
      'Limit: Maximum 1 account per platform',
      'Broadcast up to 2 videos per day',
      'Basic automation uplink access',
      'Standard video processing speed'
    ],
    ctaLabel: 'Get Started Free'
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$49',
    period: '/ month',
    desc: 'Built for professional creators and growing brands.',
    features: [
      'Connect up to 10 accounts per platform',
      'Broadcast up to 20 videos per day',
      'Priority video engine processing',
      'Global caption signature settings',
      'Advanced automation n8n custom node access'
    ],
    popular: true,
    ctaLabel: 'Initialize Engine'
  },
  {
    id: 'agency',
    name: 'Agency',
    price: '$149',
    period: '/ month',
    desc: 'Maximum scaling with full multi-account seat provisioning.',
    features: [
      'Includes 1,000 Professional plan seats',
      'Provision and link seats to external accounts',
      'Manage up to 1,000 linked sub-accounts',
      'Dedicated support & team workspace',
      'Full API access & custom automation logic'
    ],
    ctaLabel: 'Contact Sales'
  }
];

export default function Services() {
  const handleSelectPlan = (tierId: string) => {
    if (tierId === 'starter') {
      // Free plan bypasses checkout and goes straight to dashboard activation
      window.location.href = '/dashboard?action=activate_free';
    } else {
      // Premium plans route to the account information and billing terminal
      window.location.href = `/account?plan=${tierId}`;
    }
  };

  return (
    <div className="pt-32 pb-20 px-4 bg-black min-h-screen text-white">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-24">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-6 uppercase italic">
            Select your power level.
          </h1>
          <p className="text-white/40 max-w-xl mx-auto font-light">
            Choose the right distribution engine capacity for your content scale.
          </p>
        </div>

        {/* PRICING GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`relative flex flex-col p-10 rounded-[3rem] border transition-all duration-500 hover:scale-[1.02] ${
                tier.popular
                  ? 'bg-white text-black border-white shadow-2xl shadow-white/10'
                  : 'bg-white/[0.02] text-white border-white/5'
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 right-12 -translate-y-1/2 bg-orange-500 text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Most Popular
                </div>
              )}

              <h3
                className={`text-xl font-black uppercase tracking-widest mb-4 ${
                  tier.popular ? 'text-black/40' : 'text-white/20'
                }`}
              >
                {tier.name}
              </h3>

              <div className="flex items-baseline mb-8">
                <span className="text-6xl font-black tracking-tighter">{tier.price}</span>
                {tier.period && (
                  <span
                    className={`ml-2 text-xs uppercase font-bold ${
                      tier.popular ? 'text-black/40' : 'text-white/40'
                    }`}
                  >
                    {tier.period}
                  </span>
                )}
              </div>

              <p
                className={`text-sm mb-12 font-medium leading-relaxed ${
                  tier.popular ? 'text-black/60' : 'text-white/30'
                }`}
              >
                {tier.desc}
              </p>

              <div className={`h-px w-full mb-10 ${tier.popular ? 'bg-black/10' : 'bg-white/5'}`} />

              <ul className="space-y-6 mb-12 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start space-x-3 text-xs font-bold leading-tight">
                    <Check size={16} className="shrink-0 text-orange-500 mt-0.5" aria-hidden="true" />
                    <span className={tier.popular ? 'text-black/80' : 'text-white/70'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => handleSelectPlan(tier.id)}
                aria-label={`Select ${tier.name} plan`}
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all active:scale-[0.98] ${
                  tier.popular
                    ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-xl shadow-orange-500/30'
                    : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                {tier.ctaLabel ?? 'Initialize Engine'}
              </button>
            </div>
          ))}
        </div>

        {/* FOOTER NOTE */}
        <div className="mt-24 text-center">
          <p className="text-[10px] uppercase font-black tracking-[0.3em] text-white/20">
            All plans include secure end-to-end encryption and automated sync.
          </p>
        </div>
      </div>
    </div>
  );
}
