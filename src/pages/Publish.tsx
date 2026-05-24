import { useState, useEffect, useCallback, FormEvent, ChangeEvent, ReactElement } from 'react';
import { supabase } from '../services/supabase';
import {
  Send, Image as ImageIcon, Video, AlertCircle,
  CheckCircle2, RefreshCcw, Youtube, Facebook, Instagram, Music2
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
}

interface PublishProps {
  user: {
    id: string;
    email?: string;
  };
}

interface ContentState {
  title: string;
  description: string;
  mediaUrl: string;
}

// ==================== CONSTANTS ====================

const PLATFORM_ICONS: Record<string, ReactElement> = {
  youtube:   <Youtube   size={14} className="text-red-500"   />,
  facebook:  <Facebook  size={14} className="text-blue-600"  />,
  instagram: <Instagram size={14} className="text-pink-500"  />,
  tiktok:    <Music2    size={14} className="text-white"     />,
};

// ✅ FIX: video extension check — query param 제거 후 확인
const VIDEO_EXTENSIONS = /\.(mp4|mov|avi|mkv|webm)$/i;

const isVideoUrl = (url: string): boolean => {
  try {
    const pathname = new URL(url).pathname;
    return VIDEO_EXTENSIONS.test(pathname);
  } catch {
    return VIDEO_EXTENSIONS.test(url);
  }
};

const EMPTY_CONTENT: ContentState = { title: '', description: '', mediaUrl: '' };

// ==================== COMPONENT ====================

export default function Publish({ user }: PublishProps) {
  const [accounts, setAccounts]                 = useState<SocialAccount[]>([]);
  const [loading, setLoading]                   = useState(true);
  const [publishing, setPublishing]             = useState(false);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [content, setContent]                   = useState<ContentState>(EMPTY_CONTENT);

  // ✅ FIX: useCallback — useEffect dependency 안정화
  const fetchAccounts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data ?? []);
    } catch (err: unknown) {
      console.error('Error fetching accounts:', err);
      toast.error('Failed to sync engine grid.');
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const toggleAccount = useCallback((id: string) => {
    setSelectedAccounts((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }, []);

  // ✅ FIX: Select All / Deselect All
  const toggleAll = useCallback(() => {
    setSelectedAccounts((prev) =>
      prev.length === accounts.length ? [] : accounts.map((a) => a.id)
    );
  }, [accounts]);

  const handleFieldChange = useCallback(
    (field: keyof ContentState) =>
      (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setContent((prev) => ({ ...prev, [field]: e.target.value }));
      },
    []
  );

  const handlePublish = async (e: FormEvent) => {
    e.preventDefault();

    if (selectedAccounts.length === 0) {
      toast.error('Select at least one engine to broadcast.');
      return;
    }

    // ✅ FIX: mediaUrl은 필수 — title만으로는 broadcast 불가
    if (!content.mediaUrl.trim()) {
      toast.error('A media source URL is required to broadcast.');
      return;
    }

    if (!content.title.trim()) {
      toast.error('A signal title is required.');
      return;
    }

    setPublishing(true);
    const toastId = toast.loading('Broadcasting to engines...');

    try {
      await axios.post('/api/broadcast', {
        userId:     user.id,
        accountIds: selectedAccounts,
        content
      });

      toast.success('Broadcast successfully initiated!', { id: toastId });
      setContent(EMPTY_CONTENT);
      setSelectedAccounts([]);
    } catch (err: unknown) {
      console.error('Publish error:', err);
      // ✅ FIX: any → unknown + axios type guard
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.error || 'Broadcast failed. Check matrix settings.'
        : 'Unexpected error during broadcast.';
      toast.error(msg, { id: toastId });
    } finally {
      setPublishing(false);
    }
  };

  // ==================== RENDER ====================

  if (loading) {
    return (
      <div className="pt-40 flex flex-col items-center justify-center gap-3 text-white/50">
        <RefreshCcw size={18} className="animate-spin text-orange-500" />
        <span className="font-mono text-[10px] uppercase tracking-widest">Scanning Uplinks...</span>
      </div>
    );
  }

  const allSelected = accounts.length > 0 && selectedAccounts.length === accounts.length;

  return (
    <div className="pt-32 pb-20 px-4 max-w-5xl mx-auto text-white bg-black min-h-screen">

      {/* HEADER */}
      <header className="mb-16">
        <h1 className="text-5xl font-black tracking-tight mb-4 uppercase italic">Broadcast Center</h1>
        <p className="text-white/40 max-w-xl font-light">
          Prepare and distribute your signal across the multi-channel grid.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* FORM COLUMN */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8">
            <form onSubmit={handlePublish} className="space-y-6">
              <fieldset disabled={publishing} className="space-y-6 disabled:opacity-60">

                {/* TITLE */}
                <div className="space-y-2">
                  <label htmlFor="signalTitle" className="text-[10px] uppercase font-black text-white/30 tracking-widest ml-1">
                    Signal Title <span className="text-orange-500">*</span>
                  </label>
                  <input
                    id="signalTitle"
                    required
                    type="text"
                    placeholder="Transmission Headline..."
                    value={content.title}
                    onChange={handleFieldChange('title')}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-white/20 transition-all font-bold text-white"
                  />
                </div>

                {/* DESCRIPTION */}
                <div className="space-y-2">
                  <label htmlFor="metadataDesc" className="text-[10px] uppercase font-black text-white/30 tracking-widest ml-1">
                    Metadata / Description
                  </label>
                  <textarea
                    id="metadataDesc"
                    placeholder="Contextual data for the engines..."
                    rows={4}
                    value={content.description}
                    onChange={handleFieldChange('description')}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-white/20 transition-all resize-none text-sm leading-relaxed text-white"
                  />
                </div>

                {/* MEDIA URL */}
                <div className="space-y-2">
                  <label htmlFor="mediaUrl" className="text-[10px] uppercase font-black text-white/30 tracking-widest ml-1">
                    Media Source URL <span className="text-orange-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="mediaUrl"
                      required
                      type="url"
                      placeholder="https://..."
                      value={content.mediaUrl}
                      onChange={handleFieldChange('mediaUrl')}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-white/20 transition-all font-mono text-xs pr-12 text-orange-200/50"
                    />
                    {/* ✅ FIX: URL pathname থেকে extension check */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20">
                      {content.mediaUrl && isVideoUrl(content.mediaUrl)
                        ? <Video size={18} />
                        : <ImageIcon size={18} />}
                    </div>
                  </div>
                </div>

                {/* ✅ FIX: selectedAccounts.length === 0 হলেও disabled */}
                <button
                  type="submit"
                  disabled={publishing || accounts.length === 0 || selectedAccounts.length === 0}
                  className="w-full bg-white text-black font-black py-5 rounded-3xl mt-8 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3 disabled:opacity-20 disabled:grayscale disabled:hover:scale-100"
                >
                  {publishing
                    ? <RefreshCcw size={20} className="animate-spin" />
                    : <Send size={20} />}
                  <span className="uppercase tracking-widest text-xs">
                    {publishing ? 'Broadcasting...' : 'Execute Global Broadcast'}
                  </span>
                </button>

              </fieldset>
            </form>
          </section>
        </div>

        {/* ENGINE SELECTOR */}
        <div className="space-y-8">
          <section>
            <div className="flex items-center justify-between mb-6 px-1">
              <h2 className="text-[10px] uppercase font-black text-white/30 tracking-widest">Engine Grid</h2>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-white/20">
                  {selectedAccounts.length} / {accounts.length} Wired
                </span>
                {/* ✅ FIX: Select All / Deselect All */}
                {accounts.length > 1 && (
                  <button
                    type="button"
                    onClick={toggleAll}
                    className="text-[9px] uppercase font-black text-orange-500/60 hover:text-orange-500 transition-colors tracking-wider"
                  >
                    {allSelected ? 'Clear' : 'All'}
                  </button>
                )}
              </div>
            </div>

            {accounts.length === 0 ? (
              <div className="bg-red-500/5 border border-red-500/20 rounded-[2rem] p-8 text-center">
                <AlertCircle size={24} className="text-red-500 mx-auto mb-4" />
                <div className="text-[10px] uppercase font-bold text-red-500 mb-2 tracking-tighter italic underline decoration-2">
                  NO ENGINES DETECTED
                </div>
                <p className="text-[10px] text-white/30 leading-relaxed">
                  Establish uplinks in the control room before broadcasting.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {accounts.map((acc) => {
                  const isSelected = selectedAccounts.includes(acc.id);
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => toggleAccount(acc.id)}
                      // ✅ FIX: aria-pressed
                      aria-pressed={isSelected}
                      aria-label={`${isSelected ? 'Deselect' : 'Select'} ${acc.platform_account_name}`}
                      className={`w-full flex items-center space-x-4 p-4 rounded-2xl border transition-all ${
                        isSelected
                          ? 'bg-white/10 border-white/20'
                          : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/5 overflow-hidden flex items-center justify-center shrink-0">
                        {acc.platform_account_image ? (
                          <img
                            src={acc.platform_account_image}
                            alt={acc.platform_account_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-white/20">
                            {PLATFORM_ICONS[acc.platform.toLowerCase()]}
                          </div>
                        )}
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <div className="font-bold text-xs truncate text-white">
                          {acc.platform_account_name}
                        </div>
                        <div className="flex items-center space-x-2 mt-0.5">
                          {PLATFORM_ICONS[acc.platform.toLowerCase()]}
                          <span className="text-[9px] uppercase tracking-widest text-white/30 font-mono">
                            {acc.platform}
                          </span>
                        </div>
                      </div>
                      <div className={`transition-all shrink-0 ${isSelected ? 'text-white' : 'text-white/0'}`}>
                        <CheckCircle2 size={16} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* NOTICE */}
          <div className="bg-orange-500/5 border border-orange-500/10 rounded-3xl p-6">
            <h3 className="text-[10px] uppercase font-black text-orange-500/60 mb-2">Notice</h3>
            <p className="text-[10px] text-white/30 leading-relaxed">
              Each engine uses its own distribution logic. Ensure media URLs are publicly accessible for automated ingest.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}