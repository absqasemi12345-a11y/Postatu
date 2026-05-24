import { useEffect, useState, useCallback, FormEvent, ReactElement } from 'react';
import { supabase } from '../services/supabase';
import {
  Youtube, Facebook, Instagram, Music2, Plus, Trash2,
  Sliders, Shield, RefreshCcw, Copy, Users, ExternalLink,
  Video, CheckCircle2, XCircle, Clock, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

// ==================== TYPES ====================

interface SocialAccount {
  id: string;
  platform: string;
  platform_account_name: string;
  platform_account_handle: string;
  platform_account_image: string;
  created_at: string;
}

interface SubAccount {
  id: string;
  email: string;
  status: string;
  created_at: string;
}

interface Job {
  id: string;
  video_url: string;
  title: string;
  platforms: string[];
  status: 'pending' | 'processing' | 'done' | 'partial' | 'failed';
  result: Record<string, string>;
  source: 'n8n' | 'manual';
  created_at: string;
}

interface DashboardProps {
  user: {
    id: string;
    email?: string;
    tier?: 'starter' | 'professional' | 'agency';
    api_key?: string;
  };
}

interface N8NConfig {
  SHOW_N8N_NODE:   boolean;
  N8N_NODE_LINK:   string;
  N8N_GUIDE_VIDEO: string;
}

// ==================== CONSTANTS ====================

const PLATFORMS = ['youtube', 'facebook', 'instagram', 'tiktok'] as const;
type Platform = typeof PLATFORMS[number];

const PLATFORM_ICONS: Record<Platform, ReactElement> = {
  youtube:   <Youtube   size={16} className="text-red-500"   />,
  facebook:  <Facebook  size={16} className="text-blue-500"  />,
  instagram: <Instagram size={16} className="text-pink-500"  />,
  tiktok:    <Music2    size={16} className="text-white"     />,
};

const DEFAULT_N8N_CONFIG: N8NConfig = {
  SHOW_N8N_NODE:   false,
  N8N_NODE_LINK:   'n8n-nodes-postatu',
  N8N_GUIDE_VIDEO: '',
};

const STATUS_STYLES: Record<string, string> = {
  pending:    'bg-yellow-500/10 text-yellow-400',
  processing: 'bg-blue-500/10  text-blue-400',
  done:       'bg-emerald-500/10 text-emerald-400',
  partial:    'bg-orange-500/10 text-orange-400',
  failed:     'bg-red-500/10   text-red-400',
};

const STATUS_ICONS: Record<string, ReactElement> = {
  pending:    <Clock        size={12} />,
  processing: <RefreshCcw   size={12} className="animate-spin" />,
  done:       <CheckCircle2 size={12} />,
  partial:    <Zap          size={12} />,
  failed:     <XCircle      size={12} />,
};

// ==================== COMPONENT ====================

export default function Dashboard({ user }: DashboardProps) {
  const [accounts,    setAccounts]    = useState<SocialAccount[]>([]);
  const [subAccounts, setSubAccounts] = useState<SubAccount[]>([]);
  const [jobs,        setJobs]        = useState<Job[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [subEmail,    setSubEmail]    = useState('');
  const [addingSub,   setAddingSub]   = useState(false);
  const [deletingId,  setDeletingId]  = useState<string | null>(null);
  const [n8nConfig,   setN8nConfig]   = useState<N8NConfig>(DEFAULT_N8N_CONFIG);

  const fetchN8NConfig = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value');
      if (error) throw error;
      if (data) {
        const config: Partial<N8NConfig> = {};
        data.forEach((item) => {
          if (item.key === 'SHOW_N8N_NODE')   config.SHOW_N8N_NODE   = item.value === 'true';
          if (item.key === 'N8N_NODE_LINK')   config.N8N_NODE_LINK   = item.value;
          if (item.key === 'N8N_GUIDE_VIDEO') config.N8N_GUIDE_VIDEO = item.value;
        });
        setN8nConfig((prev) => ({ ...prev, ...config }));
      }
    } catch (err: unknown) {
      console.error('n8n config error:', err);
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      const { data } = await axios.get<Job[]>(`/api/jobs/user/${user.id}?limit=10`);
      setJobs(data ?? []);
    } catch (err: unknown) {
      console.error('Jobs fetch error:', err);
    }
  }, [user.id]);

  const fetchData = useCallback(async () => {
    try {
      const [accountsRes, subsRes] = await Promise.all([
        supabase
          .from('social_accounts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('sub_accounts')
          .select('*')
          .eq('parent_id', user.id)
          .order('created_at', { ascending: false }),
      ]);
      if (accountsRes.error) throw accountsRes.error;
      if (subsRes.error)     throw subsRes.error;
      setAccounts(accountsRes.data ?? []);
      setSubAccounts(subsRes.data ?? []);
    } catch (err: unknown) {
      console.error('Sync failure:', err);
      toast.error('Matrix uplink failed to synchronize.');
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchData();
    fetchN8NConfig();
    fetchJobs();
  }, [fetchData, fetchN8NConfig, fetchJobs]);

  const handleAddSubAccount = async (e: FormEvent) => {
    e.preventDefault();
    if (!subEmail.trim()) return;
    const targetEmail = subEmail.trim().toLowerCase();
    if (subAccounts.some((s) => s.email === targetEmail)) {
      toast.error('This email already has a provisioned seat.');
      return;
    }
    setAddingSub(true);
    try {
      const { data, error } = await supabase
        .from('sub_accounts')
        .insert([{ parent_id: user.id, email: targetEmail, status: 'active' }])
        .select()
        .single();
      if (error) throw error;
      setSubAccounts((prev) => [data, ...prev]);
      setSubEmail('');
      toast.success('Sub-account node provisioned.');
    } catch (err: unknown) {
      console.error(err);
      toast.error('Failed to link sub-account node.');
    } finally {
      setAddingSub(false);
    }
  };

  const handleDeleteAccount = async (
    id: string,
    table: 'social_accounts' | 'sub_accounts'
  ) => {
    setDeletingId(id);
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      if (table === 'social_accounts') {
        setAccounts((prev) => prev.filter((a) => a.id !== id));
      } else {
        setSubAccounts((prev) => prev.filter((a) => a.id !== id));
      }
      toast.success('Matrix link severed.');
    } catch (err: unknown) {
      console.error(err);
      toast.error('Termination sequence rejected.');
    } finally {
      setDeletingId(null);
    }
  };

  // ==================== RENDER ====================

  if (loading) {
    return (
      <div className="pt-40 flex flex-col items-center justify-center gap-3 text-white/50 bg-black min-h-screen">
        <RefreshCcw size={18} className="animate-spin text-orange-500" />
        <span className="font-mono text-[10px] uppercase tracking-widest">Syncing Core Dashboard...</span>
      </div>
    );
  }

  const displayApiKey = user.api_key
    ? `${user.api_key.slice(0, 8)}${'•'.repeat(24)}${user.api_key.slice(-4)}`
    : 'NO_API_KEY_ASSIGNED';

  return (
    <div className="pt-32 pb-20 px-4 max-w-5xl mx-auto text-white bg-black min-h-screen">

      {/* HEADER */}
      <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-orange-500 text-[10px] uppercase font-black tracking-widest font-mono">
              System Core
            </span>
            <span className="bg-white/10 px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider text-white/60">
              {user.tier ?? 'Starter'} Matrix
            </span>
          </div>
          <h1 className="text-5xl font-black tracking-tight uppercase italic">Control Room</h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-12">

          {/* LINKED ENGINES */}
          <section>
            <h2 className="text-[10px] uppercase font-black text-white/30 tracking-widest mb-6 px-1">
              Active Social Engines ({accounts.length})
            </h2>
            {accounts.length === 0 ? (
              <div className="border border-white/5 bg-white/[0.01] rounded-[2rem] p-12 text-center text-white/30">
                <Sliders size={24} className="mx-auto mb-4 text-white/10" />
                <p className="text-xs font-mono">No active channels linked to this matrix.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl"
                  >
                    <div className="flex items-center space-x-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/5 overflow-hidden flex items-center justify-center shrink-0">
                        {acc.platform_account_image ? (
                          <img
                            src={acc.platform_account_image}
                            alt={acc.platform_account_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          PLATFORM_ICONS[acc.platform.toLowerCase() as Platform]
                        )}
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-xs text-white truncate">
                          {acc.platform_account_name}
                        </div>
                        <div className="text-[9px] font-mono text-white/30 mt-0.5 uppercase tracking-wider">
                          {acc.platform}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteAccount(acc.id, 'social_accounts')}
                      disabled={deletingId === acc.id}
                      aria-label="Disconnect Engine"
                      className="p-2 text-white/20 hover:text-red-400 rounded-lg transition-colors disabled:opacity-40"
                    >
                      {deletingId === acc.id
                        ? <RefreshCcw size={14} className="animate-spin" />
                        : <Trash2 size={14} />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ✅ JOB HISTORY — n8n ও manual সব job এখানে দেখাবে */}
          <section className="border-t border-white/5 pt-12">
            <div className="flex items-center justify-between mb-6 px-1">
              <h2 className="text-[10px] uppercase font-black text-white/30 tracking-widest">
                Recent Jobs ({jobs.length})
              </h2>
              <button
                type="button"
                onClick={fetchJobs}
                className="text-white/30 hover:text-white transition-colors"
                aria-label="Refresh jobs"
              >
                <RefreshCcw size={12} />
              </button>
            </div>

            {jobs.length === 0 ? (
              <div className="border border-white/5 bg-white/[0.01] rounded-[2rem] p-8 text-center text-white/30">
                <Zap size={20} className="mx-auto mb-3 text-white/10" />
                <p className="text-xs font-mono">No jobs yet. Send from n8n or Broadcast page.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white/[0.02] border border-white/5 rounded-2xl p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {/* Status badge */}
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] uppercase font-black tracking-wider ${STATUS_STYLES[job.status] ?? ''}`}>
                            {STATUS_ICONS[job.status]}
                            {job.status}
                          </span>
                          {/* Source badge */}
                          <span className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-lg ${
                            job.source === 'n8n'
                              ? 'bg-pink-500/10 text-pink-400'
                              : 'bg-white/5 text-white/30'
                          }`}>
                            {job.source}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-white truncate">
                          {job.title || 'Untitled'}
                        </p>
                        <p className="text-[10px] font-mono text-white/30 truncate mt-0.5">
                          {job.video_url}
                        </p>
                      </div>
                      <div className="text-[9px] font-mono text-white/20 shrink-0">
                        {new Date(job.created_at).toLocaleTimeString()}
                      </div>
                    </div>

                    {/* Platform results */}
                    {job.result && Object.keys(job.result).length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {Object.entries(job.result).map(([platform, result]) => (
                          <span
                            key={platform}
                            className={`inline-flex items-center gap-1 text-[9px] font-mono px-2 py-1 rounded-lg ${
                              result === 'success'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-red-500/10 text-red-400'
                            }`}
                          >
                            {result === 'success'
                              ? <CheckCircle2 size={10} />
                              : <XCircle size={10} />}
                            {platform}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* AGENCY SEATS */}
          {user.tier === 'agency' && (
            <section className="border-t border-white/5 pt-12">
              <div className="flex items-center space-x-2 mb-6 px-1">
                <Users size={12} className="text-orange-500" />
                <h2 className="text-[10px] uppercase font-black text-white/30 tracking-widest">
                  Seat Provisioning ({subAccounts.length} Linked)
                </h2>
              </div>
              <form onSubmit={handleAddSubAccount} className="flex gap-3 mb-6">
                <input
                  required
                  type="email"
                  placeholder="operator@agency.com"
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  disabled={addingSub}
                  className="flex-1 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-xs font-mono text-white outline-none focus:border-white/20 transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={addingSub}
                  className="bg-white text-black font-black text-[10px] uppercase tracking-widest px-6 rounded-xl hover:bg-white/90 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {addingSub ? <RefreshCcw size={12} className="animate-spin" /> : <Plus size={12} />}
                  <span>Provision</span>
                </button>
              </form>
              {subAccounts.length > 0 && (
                <div className="bg-white/[0.01] border border-white/5 rounded-2xl divide-y divide-white/5 max-h-60 overflow-y-auto">
                  {subAccounts.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between p-4 text-xs">
                      <span className="font-mono text-white/70">{sub.email}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-[9px] uppercase tracking-widest font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">
                          {sub.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteAccount(sub.id, 'sub_accounts')}
                          disabled={deletingId === sub.id}
                          className="text-white/20 hover:text-red-400 transition-colors disabled:opacity-40"
                        >
                          {deletingId === sub.id
                            ? <RefreshCcw size={12} className="animate-spin" />
                            : <Trash2 size={12} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* N8N CUSTOM NODE */}
          {n8nConfig.SHOW_N8N_NODE && (
            <section className="border-t border-white/5 pt-12">
              <div className="bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 rounded-[2.5rem] p-8 space-y-6">
                <div>
                  <span className="text-orange-500 text-[9px] uppercase font-black tracking-widest font-mono block mb-1">
                    Extension Pack
                  </span>
                  <h3 className="text-xl font-black uppercase italic tracking-tight">
                    Install Custom n8n Node
                  </h3>
                  <p className="text-xs text-white/40 mt-1">
                    Use the community module package name below to integrate the engine directly into your local n8n setup.
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-mono text-white/30 block">
                    Node Package Identity
                  </span>
                  <div className="flex items-center justify-between bg-black/60 p-4 rounded-2xl border border-white/5 gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-bold text-white bg-white/10 px-2.5 py-1 rounded-lg">Name</span>
                      <code className="text-xs font-mono text-orange-200/70 truncate">
                        {n8nConfig.N8N_NODE_LINK}
                      </code>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(n8nConfig.N8N_NODE_LINK);
                        toast.success('n8n Node installation link copied!');
                      }}
                      aria-label="Copy package name"
                      className="bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded-xl transition-all text-white/60 hover:text-white shrink-0"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
                {n8nConfig.N8N_GUIDE_VIDEO && (
                  <div className="bg-black/20 border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-red-500/10 text-red-500 rounded-xl shrink-0">
                        <Video size={16} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wide">Guideline Video</h4>
                        <p className="text-[11px] text-white/40 mt-0.5">
                          Watch the setup tutorial for this node.
                        </p>
                      </div>
                    </div>
                    <a
                      href={n8nConfig.N8N_GUIDE_VIDEO}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold px-4 py-2.5 rounded-xl transition-all hover:text-red-400"
                    >
                      <span>Watch Tutorial</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>
            </section>
          )}

        </div>

        {/* RIGHT COLUMN: API KEY + n8n ENDPOINT */}
        <div className="space-y-6">

          {/* API KEY */}
          <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
            <div className="flex items-center space-x-2 px-1">
              <Shield size={14} className="text-orange-500" />
              <h2 className="text-[10px] uppercase font-black text-white/30 tracking-widest">
                Developer Core
              </h2>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-mono text-white/40 block ml-1">
                Uplink Authentication Key
              </label>
              <div className="flex items-center space-x-2">
                <code className="bg-black/60 p-4 rounded-2xl flex-1 text-xs font-mono border border-white/5 text-orange-200/70 truncate">
                  {displayApiKey}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    if (!user.api_key) { toast.error('No API key available.'); return; }
                    navigator.clipboard.writeText(user.api_key);
                    toast.success('API Key secured to clipboard.');
                  }}
                  aria-label="Copy API Key"
                  className="bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-2xl transition-all text-white/60 hover:text-white"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>

            {/* n8n Payload Example */}
            <div className="bg-black/40 rounded-3xl p-6 border border-white/5">
              <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest mb-3">
                n8n → Postatu Payload
              </div>
              <pre className="text-[10px] font-mono text-white/40 leading-relaxed overflow-x-auto">
{`POST /api/ingest
Header: x-n8n-secret: ***

{
  "userId": "your-user-id",
  "video_url": "https://...",
  "title": "ভিডিও টাইটেল",
  "description": "বিবরণ",
  "hashtags": ["#viral"],
  "platforms": [
    "youtube",
    "facebook",
    "tiktok"
  ]
}`}
              </pre>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
