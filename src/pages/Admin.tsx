import { useState, useEffect, useCallback, useRef, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import {
  ShieldAlert, Save, Key, Database, Zap,
  Eye, EyeOff, RefreshCcw, ToggleLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

const MASTER_EMAIL = import.meta.env.VITE_MASTER_EMAIL || '';

interface Settings {
  YOUTUBE_CLIENT_ID: string;
  YOUTUBE_CLIENT_SECRET: string;
  YOUTUBE_REDIRECT_URI: string;
  FACEBOOK_CLIENT_ID: string;
  FACEBOOK_CLIENT_SECRET: string;
  FACEBOOK_REDIRECT_URI: string;
  TIKTOK_CLIENT_ID: string;
  TIKTOK_CLIENT_SECRET: string;
  TIKTOK_REDIRECT_URI: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  N8N_WEBHOOK_URL: string;
  ENCRYPTION_SECRET: string;
  N8N_SECRET: string;
  APP_URL: string;
  SHOW_N8N_NODE: string;
  N8N_NODE_LINK: string;
  N8N_GUIDE_VIDEO: string;
}

const DEFAULT_SETTINGS: Settings = {
  YOUTUBE_CLIENT_ID: '',
  YOUTUBE_CLIENT_SECRET: '',
  YOUTUBE_REDIRECT_URI: '',
  FACEBOOK_CLIENT_ID: '',
  FACEBOOK_CLIENT_SECRET: '',
  FACEBOOK_REDIRECT_URI: '',
  TIKTOK_CLIENT_ID: '',
  TIKTOK_CLIENT_SECRET: '',
  TIKTOK_REDIRECT_URI: '',
  SUPABASE_URL: '',
  SUPABASE_SERVICE_ROLE_KEY: '',
  N8N_WEBHOOK_URL: '',
  ENCRYPTION_SECRET: '',
  N8N_SECRET: '',
  APP_URL: '',
  SHOW_N8N_NODE: 'false',
  N8N_NODE_LINK: 'n8n-nodes-postatu',
  N8N_GUIDE_VIDEO: '',
};

interface AdminProps {
  user: {
    email?: string;
  };
}

export default function Admin({ user }: AdminProps) {
  const [settings, setSettings]       = useState<Settings>(DEFAULT_SETTINGS);
  const [isFetching, setIsFetching]   = useState(true);   // ✅ fetch আলাদা state
  const [isSaving, setIsSaving]       = useState(false);  // ✅ save আলাদা state
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const hasFetched                    = useRef(false);

  const isMasterAdmin = user.email?.toLowerCase() === MASTER_EMAIL.toLowerCase();

  // ✅ Settings আপডেটের জন্য helper — stale state সমস্যা দূর করে
  const updateSetting = useCallback((key: keyof Settings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('settings').select('key, value');
      if (error) throw error;

      if (data) {
        const loaded: Partial<Settings> = {};
        data.forEach((item) => {
          if (item.key in DEFAULT_SETTINGS) {
            loaded[item.key as keyof Settings] = item.value;
          }
        });
        setSettings((prev) => ({ ...prev, ...loaded }));
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error('Failed to load global matrix configuration.');
    } finally {
      setIsFetching(false); // ✅ শুধু fetch loading বন্ধ
    }
  }, []);

  useEffect(() => {
    if (!hasFetched.current) {
      fetchSettings();
      hasFetched.current = true;
    }
  }, [fetchSettings]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();

    if (!isMasterAdmin) {
      toast.error('Write access denied. Terminal locked.');
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading('Syncing parameters across matrix...');

    try {
      const payload = Object.entries(settings).map(([key, value]) => ({
        key,
        value: value ?? '',
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('settings')
        .upsert(payload, { onConflict: 'key' });

      if (error) throw error;

      toast.success('Global configuration synchronized.', { id: toastId });
    } catch (err: unknown) {
      console.error(err);
      toast.error('Sync pipeline broken. Check console logs.', { id: toastId });
    } finally {
      setIsSaving(false); // ✅ শুধু save loading বন্ধ
    }
  };

  const toggleKeyVisibility = useCallback((key: string) => {
    setVisibleKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // ✅ Access denied screen
  if (!isMasterAdmin) {
    return (
      <div className="pt-40 px-4 max-w-md mx-auto text-center text-white bg-black min-h-screen">
        <ShieldAlert size={48} className="text-red-500 mx-auto mb-6 animate-pulse" />
        <h1 className="text-xl font-black tracking-tighter uppercase italic mb-2">
          ACCESS RESTRICTED
        </h1>
        <p className="text-xs text-white/40 leading-relaxed font-mono">
          Your current security clearance is insufficient to mount this configuration node.
        </p>
        <div className="mt-8">
          <Link to="/" className="text-xs font-mono uppercase text-orange-500 hover:underline">
            &lt; Return to Safe Zone
          </Link>
        </div>
      </div>
    );
  }

  // ✅ Fetch চলাকালীন পুরো page loader
  if (isFetching) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <RefreshCcw size={24} className="text-orange-500 animate-spin" />
      </div>
    );
  }

  const SECTIONS = [
    {
      title: 'OAuth Uplinks',
      icon: <Key size={14} className="text-orange-500" />,
      keys: [
        'YOUTUBE_CLIENT_ID', 'YOUTUBE_CLIENT_SECRET', 'YOUTUBE_REDIRECT_URI',
        'FACEBOOK_CLIENT_ID', 'FACEBOOK_CLIENT_SECRET', 'FACEBOOK_REDIRECT_URI',
        'TIKTOK_CLIENT_ID', 'TIKTOK_CLIENT_SECRET', 'TIKTOK_REDIRECT_URI',
      ],
    },
    {
      title: 'Infrastructure & Storage',
      icon: <Database size={14} className="text-blue-500" />,
      keys: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'ENCRYPTION_SECRET', 'APP_URL'],
    },
    {
      title: 'Automation Core',
      icon: <Zap size={14} className="text-pink-500" />,
      keys: ['N8N_WEBHOOK_URL', 'N8N_SECRET'],
    },
  ];

  return (
    <div className="pt-32 pb-20 px-4 max-w-4xl mx-auto text-white bg-black min-h-screen">

      {/* HEADER */}
      <header className="mb-16">
        <div className="text-[10px] uppercase font-black tracking-widest text-red-500 font-mono mb-2">
          Root Authority Terminal
        </div>
        <h1 className="text-5xl font-black tracking-tight uppercase italic">Global Settings</h1>
      </header>

      <form onSubmit={handleSave} className="space-y-12">

        {/* n8n CUSTOM NODE CONTROL */}
        <section className="bg-white/[0.02] border border-orange-500/30 rounded-[2.5rem] p-8 space-y-6">
          <div className="flex items-center space-x-2 border-b border-white/5 pb-4">
            <ToggleLeft size={16} className="text-orange-500" />
            <h2 className="text-sm font-black uppercase tracking-wider">
              n8n Custom Node Visibility Control
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* TOGGLE */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-mono text-white/40 block">
                Section Status
              </label>
              <div className="flex items-center h-14">
                <button
                  type="button"
                  onClick={() =>
                    updateSetting( // ✅ updateSetting ব্যবহার
                      'SHOW_N8N_NODE',
                      settings.SHOW_N8N_NODE === 'true' ? 'false' : 'true'
                    )
                  }
                  className={`w-full h-full rounded-2xl font-mono text-xs font-black uppercase tracking-wider border transition-all ${
                    settings.SHOW_N8N_NODE === 'true'
                      ? 'bg-orange-500 text-white border-orange-600'
                      : 'bg-white/5 text-white/40 border-white/5 hover:border-white/10'
                  }`}
                >
                  {settings.SHOW_N8N_NODE === 'true' ? '● Active (Showing)' : '○ Hidden (Disabled)'}
                </button>
              </div>
            </div>

            {/* NODE LINK */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="node_link_input" className="text-[10px] uppercase font-mono text-white/40 block">
                Custom Node Link / Package Name
              </label>
              <input
                id="node_link_input"
                type="text"
                value={settings.N8N_NODE_LINK}
                onChange={(e) => updateSetting('N8N_NODE_LINK', e.target.value)} // ✅
                className="w-full bg-white/[0.02] border border-white/10 focus:border-orange-500 rounded-2xl px-6 py-4 text-sm font-mono text-white outline-none transition-all"
                placeholder="e.g., n8n-nodes-postatu"
              />
            </div>
          </div>

          {/* GUIDE VIDEO */}
          <div className="space-y-2">
            <label htmlFor="guide_video_input" className="text-[10px] uppercase font-mono text-white/40 block">
              Guideline YouTube Video URL
            </label>
            <input
              id="guide_video_input"
              type="url"
              value={settings.N8N_GUIDE_VIDEO}
              onChange={(e) => updateSetting('N8N_GUIDE_VIDEO', e.target.value)} // ✅
              className="w-full bg-white/[0.02] border border-white/10 focus:border-orange-500 rounded-2xl px-6 py-4 text-sm font-mono text-white outline-none transition-all"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
        </section>

        {/* DYNAMIC SECTIONS */}
        {SECTIONS.map((sec) => (
          <section
            key={sec.title}
            className="bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-8 space-y-6"
          >
            <div className="flex items-center space-x-2 border-b border-white/5 pb-4">
              {sec.icon}
              <h2 className="text-sm font-black uppercase tracking-wider">{sec.title}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sec.keys.map((key) => {
                const isSecret  = key.includes('SECRET') || key.includes('KEY');
                const isVisible = visibleKeys[key];

                return (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <label
                        htmlFor={`input_${key}`}
                        className="text-[10px] uppercase font-mono text-white/40"
                      >
                        {key.split('_').join(' ')}
                      </label>
                      {isSecret && (
                        <button
                          type="button"
                          onClick={() => toggleKeyVisibility(key)}
                          className="text-white/30 hover:text-white transition-colors"
                          aria-label={isVisible ? 'Hide value' : 'Show value'}
                        >
                          {isVisible ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                      )}
                    </div>

                    <input
                      id={`input_${key}`}
                      type={isSecret && !isVisible ? 'password' : 'text'}
                      value={settings[key as keyof Settings] || ''}
                      onChange={(e) => updateSetting(key as keyof Settings, e.target.value)} // ✅
                      className="w-full bg-white/[0.02] border border-white/10 focus:border-orange-500 rounded-2xl px-6 py-4 text-sm font-mono text-white outline-none transition-all"
                      placeholder={`Enter ${key.toLowerCase().split('_').join(' ')}`}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {/* ✅ type="submit" যোগ করা হয়েছে */}
        <div className="sticky bottom-10 z-20">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-orange-500 text-white font-black py-6 rounded-2xl shadow-2xl shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Save size={20} />
            <span>{isSaving ? 'Syncing...' : 'SYNC GLOBAL CONFIGURATION'}</span>
            {isSaving && <RefreshCcw size={18} className="animate-spin" />}
          </button>
        </div>

      </form>
    </div>
  );
}