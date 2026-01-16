
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Plus, Sparkles, Loader2, ArrowUpDown, RefreshCw } from 'lucide-react';
import { CountdownEvent, CreateEventFormData, SortOption } from './types';
import CountdownCard from './components/CountdownCard';
import AddEventModal from './components/AddEventModal';
import { fetchUpcomingHolidays } from './services/geminiService';

const CACHE_KEY_HOLIDAYS = 'timeflux_cached_holidays';
const CACHE_KEY_TIMESTAMP = 'timeflux_holidays_last_fetch';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const App: React.FC = () => {
  const [holidays, setHolidays] = useState<CountdownEvent[]>([]);
  const [customEvents, setCustomEvents] = useState<CountdownEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>(SortOption.DATE_ASC);

  // Parallax Refs
  const bgLayer1Ref = useRef<HTMLDivElement>(null);
  const bgLayer2Ref = useRef<HTMLDivElement>(null);

  // Load custom events from local storage
  const loadCustomEvents = useCallback(() => {
    const saved = localStorage.getItem('custom_events');
    if (saved) {
      try {
        const events = JSON.parse(saved) as CountdownEvent[];
        // Backfill createdAt if missing for legacy events
        return events.map(e => ({
          ...e,
          createdAt: e.createdAt || 0
        }));
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    }
    return [];
  }, []);

  // Fetch Holidays with Cache Logic
  const fetchHolidays = useCallback(async (force = false) => {
    if (force) setRefreshing(true);

    const currentTime = Date.now();
    const lastFetchStr = localStorage.getItem(CACHE_KEY_TIMESTAMP);
    const cachedDataStr = localStorage.getItem(CACHE_KEY_HOLIDAYS);

    // Use cache if available and fresh (less than 24 hours old)
    if (!force && lastFetchStr && cachedDataStr) {
      const lastFetchTime = parseInt(lastFetchStr, 10);
      if (currentTime - lastFetchTime < CACHE_DURATION) {
        try {
          const parsedHolidays = JSON.parse(cachedDataStr);
          setHolidays(parsedHolidays);
          setRefreshing(false);
          // If we have data, we can stop loading for the holiday part
          return;
        } catch (e) {
          console.error("Cache parse error", e);
        }
      }
    }

    // Fetch new data if cache is invalid or forced
    try {
      const data = await fetchUpcomingHolidays();
      setHolidays(data);
      localStorage.setItem(CACHE_KEY_HOLIDAYS, JSON.stringify(data));
      localStorage.setItem(CACHE_KEY_TIMESTAMP, currentTime.toString());
    } catch (error) {
      console.error("Fetch error", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Initial Initialization
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      // Load custom events
      setCustomEvents(loadCustomEvents());
      // Fetch holidays (will use cache if valid)
      await fetchHolidays();
      setLoading(false);
    };

    initData();
  }, [loadCustomEvents, fetchHolidays]);

  // Periodic Refresh Check (Every minute)
  // Checks if the holiday cache has expired (24h), if so, refetches in background
  useEffect(() => {
    const checkInterval = setInterval(() => {
      fetchHolidays(false);
    }, 60 * 1000); // Check every minute

    return () => clearInterval(checkInterval);
  }, [fetchHolidays]);

  // Global Timer for countdown sync (1 second)
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Parallax Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;

      // Since elements are fixed, moving them negatively (up) makes them travel
      // with the scroll but at a slower rate than the content (which moves up at 1x speed).
      if (bgLayer1Ref.current) {
        bgLayer1Ref.current.style.transform = `translateY(-${scrolled * 0.2}px)`;
      }
      if (bgLayer2Ref.current) {
        bgLayer2Ref.current.style.transform = `translateY(-${scrolled * 0.5}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handlers
  const handleAddEvent = (data: CreateEventFormData) => {
    const newEvent: CountdownEvent = {
      id: `custom-${Date.now()}`,
      title: data.title,
      date: `${data.date}T${data.time || '00:00'}:00`,
      type: 'custom',
      color: data.color,
      createdAt: Date.now()
    };

    const updatedCustoms = [...customEvents, newEvent];
    localStorage.setItem('custom_events', JSON.stringify(updatedCustoms));
    setCustomEvents(updatedCustoms);
  };

  const handleDeleteEvent = (id: string) => {
    const updatedCustoms = customEvents.filter(e => e.id !== id);
    localStorage.setItem('custom_events', JSON.stringify(updatedCustoms));
    setCustomEvents(updatedCustoms);
  };

  const handleManualRefresh = () => {
    fetchHolidays(true);
  };

  // Combine and sort events
  const displayEvents = useMemo(() => {
    const combined = [...holidays, ...customEvents];

    return combined.sort((a, b) => {
      switch (sortBy) {
        case SortOption.DATE_ASC:
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case SortOption.TITLE_ASC:
          return a.title.localeCompare(b.title, 'zh-CN');
        case SortOption.CREATED_DESC:
          // For events with same created time (rare), fallback to ID or Title
          return b.createdAt - a.createdAt;
        default:
          return 0;
      }
    });
  }, [holidays, customEvents, sortBy]);

  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case SortOption.DATE_ASC: return "日期 (最近)";
      case SortOption.TITLE_ASC: return "名称 (A-Z)";
      case SortOption.CREATED_DESC: return "创建时间 (最新)";
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden font-sans selection:bg-primary-500/30">

      {/* --- Premium Background --- */}
      <div className="fixed inset-0 bg-background -z-50" />

      {/* Ambient Light Orbs */}
      <div className="fixed inset-0 -z-40 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-600/20 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob" />
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 left-1/3 w-[600px] h-[600px] bg-purple-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob animation-delay-4000" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 -z-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none" />

      {/* --- Navbar --- */}
      <nav className="fixed top-6 left-0 right-0 z-40 px-4 sm:px-6 lg:px-8 flex justify-center">
        <div className="glass px-6 py-3 rounded-2xl flex items-center justify-between w-full max-w-5xl shadow-2xl shadow-black/20 ring-1 ring-white/10 transition-all hover:ring-white/20">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-primary-600 to-cyan-500 p-2 rounded-xl shadow-lg shadow-primary-500/20">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
              TimeFlux
            </span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="group relative flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-all shadow-[0_0_20px_-5px_var(--tw-shadow-color)] shadow-primary-500/30 hover:shadow-primary-500/50 active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
            <Plus size={18} />
            <span className="hidden sm:inline">Add Event</span>
          </button>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto relative z-10">

        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="animate-slide-up">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
              Upcoming <span className="text-gradient">Moments</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-lg leading-relaxed">
              Track holidays and personal milestones in a fluid, elegant timeline.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {/* Sort Dropdown */}
            <div className="relative group z-20">
              <div className="glass px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white cursor-pointer transition-colors ring-1 ring-white/5 hover:ring-white/10">
                <ArrowUpDown size={16} className="text-primary-400" />
                <span>{getSortLabel(sortBy)}</span>
              </div>

              <div className="absolute right-0 top-full mt-2 w-48 glass rounded-xl shadow-2xl overflow-hidden hidden group-hover:block ring-1 ring-white/10 p-1 transform origin-top-right transition-all">
                {[
                  { id: SortOption.DATE_ASC, label: 'Date (Nearest)' },
                  { id: SortOption.TITLE_ASC, label: 'Name (A-Z)' },
                  { id: SortOption.CREATED_DESC, label: 'Created (Newest)' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSortBy(opt.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${sortBy === opt.id ? 'bg-primary-600/20 text-primary-300' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className={`p-2 glass rounded-xl text-slate-400 hover:text-white hover:ring-white/10 transition-all ${refreshing ? 'opacity-50' : 'active:scale-95'}`}
            >
              <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 gap-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-primary-500/30 border-t-primary-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-400 animate-pulse" />
              </div>
            </div>
            <p className="text-slate-500 font-mono text-sm tracking-widest uppercase animate-pulse">同步时光流中...</p>
          </div>
        ) : (
          <div className="space-y-8">

            {/* Holiday Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">节假日</h2>
                  </div>
                </div>
                <span className="text-xs text-slate-500">显示最近 3 个</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {holidays.length > 0 ? (
                  holidays.slice(0, 3).map((event, index) => (
                    <div key={event.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                      <CountdownCard event={event} now={now} />
                    </div>
                  ))
                ) : (
                  <div className="glass-card rounded-2xl p-6 text-center col-span-full">
                    <p className="text-slate-400">暂无节假日数据</p>
                  </div>
                )}
              </div>
            </section>

            {/* Personal Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">个人事件</h2>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-sm px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                >
                  + 添加
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {customEvents.length > 0 ? (
                  customEvents.slice(0, 3).map((event, index) => (
                    <div key={event.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                      <CountdownCard
                        event={event}
                        now={now}
                        onDelete={handleDeleteEvent}
                      />
                    </div>
                  ))
                ) : (
                  <div
                    onClick={() => setIsModalOpen(true)}
                    className="group glass-card rounded-2xl p-6 text-center cursor-pointer hover:bg-white/10 transition-all col-span-full"
                  >
                    <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 group-hover:bg-emerald-900/50 flex items-center justify-center mb-3 transition-colors">
                      <Plus className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    </div>
                    <p className="text-slate-400 group-hover:text-white transition-colors">创建第一个倒计时</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      <AddEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddEvent}
      />
    </div>
  );
};

export default App;
