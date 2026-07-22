import { useEffect, useMemo, useState, type ComponentType } from 'react';
import {
  Archive,
  ArrowRight,
  Backpack,
  BarChart3,
  BookOpen,
  CalendarDays,
  Carrot,
  Check,
  ChevronRight,
  CircleCheck,
  Cloud,
  Coins,
  Crown,
  Droplets,
  Flame,
  Flower2,
  Frown,
  Gem,
  Hammer,
  Heart,
  Home,
  Leaf,
  Lock,
  Meh,
  MoreHorizontal,
  Package,
  Palette,
  PenLine,
  Plus,
  Quote,
  Save,
  ShoppingBag,
  Smile,
  Sparkles,
  Sprout,
  Star,
  Sun,
  Timer,
  Trophy,
  Wheat,
  Wrench,
  X,
} from 'lucide-react';

type Section =
  | 'home'
  | 'quotes'
  | 'journal'
  | 'mood'
  | 'farm'
  | 'inventory'
  | 'upgrades'
  | 'store'
  | 'subscription'
  | 'progress';

type MoodKey = 'radiant' | 'good' | 'steady' | 'low' | 'heavy';
type QuoteCategory = 'Gratitude' | 'Confidence' | 'Calm' | 'Focus';

interface QuoteItem {
  id: string;
  category: QuoteCategory;
  text: string;
  author: string;
}

interface JournalEntry {
  id: string;
  date: string;
  day: string;
  prompt: string;
  text: string;
}

interface MoodEntry {
  id: string;
  date: string;
  mood: MoodKey;
  note: string;
}

interface Plot {
  id: number;
  plantedAt: number | null;
  wateredAt: number | null;
}

interface AppState {
  coins: number;
  coinsEarned: number;
  seeds: number;
  carrots: number;
  strawberries: number;
  wood: number;
  journalEntries: JournalEntry[];
  moods: MoodEntry[];
  favorites: string[];
  plots: Plot[];
  cropsHarvested: number;
  farmXP: number;
  upgrades: {
    wateringCan: number;
    backpack: number;
    storage: number;
    plotCount: number;
  };
  store: {
    lantern: boolean;
    overalls: boolean;
    storageBonus: number;
  };
  plan: string;
}

interface NavItem {
  id: Section;
  label: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
}

interface ToastState {
  message: string;
  kind: 'success' | 'notice';
}

const STORAGE_KEY = 'quotes-mindset-builder-v1';

const quotes: QuoteItem[] = [
  { id: 'g1', category: 'Gratitude', text: 'The quiet things you notice become the life you remember.', author: 'Mira Sol' },
  { id: 'g2', category: 'Gratitude', text: 'Enough is already blooming around you. Pause long enough to see it.', author: 'Lena Hart' },
  { id: 'g3', category: 'Gratitude', text: 'Gratitude turns an ordinary morning into a place worth returning to.', author: 'Noor Vale' },
  { id: 'g4', category: 'Gratitude', text: 'Small joys are not small when they soften your whole day.', author: 'Avery Moss' },
  { id: 'c1', category: 'Confidence', text: 'You do not need to feel fearless to take one brave step.', author: 'Elia North' },
  { id: 'c2', category: 'Confidence', text: 'Trust the version of you that kept going when no one was watching.', author: 'Mira Sol' },
  { id: 'c3', category: 'Confidence', text: 'Your pace is still proof that you are moving.', author: 'Sage Rowan' },
  { id: 'c4', category: 'Confidence', text: 'Take up the space your becoming requires.', author: 'Noor Vale' },
  { id: 'ca1', category: 'Calm', text: 'Let this moment be simple: one breath, one choice, one gentle beginning.', author: 'Avery Moss' },
  { id: 'ca2', category: 'Calm', text: 'Peace can be practiced before it is perfected.', author: 'Lena Hart' },
  { id: 'ca3', category: 'Calm', text: 'You are allowed to move softly through a loud world.', author: 'Elia North' },
  { id: 'ca4', category: 'Calm', text: 'Rest is not leaving the path. It is part of the path.', author: 'Sage Rowan' },
  { id: 'f1', category: 'Focus', text: 'Give today one clear intention and let the noise fall behind it.', author: 'Noor Vale' },
  { id: 'f2', category: 'Focus', text: 'A meaningful life is built in the minutes you choose on purpose.', author: 'Mira Sol' },
  { id: 'f3', category: 'Focus', text: 'You do not need more time; begin by protecting this moment.', author: 'Elia North' },
  { id: 'f4', category: 'Focus', text: 'One finished seed matters more than a field of postponed plans.', author: 'Avery Moss' },
];

const prompts = [
  'What is one small thing you can be proud of today?',
  'Where could you choose gentleness instead of pressure?',
  'What would make today feel meaningful, even in a small way?',
  'Name one worry you can set down for the next hour.',
  'What are you quietly growing into?',
  'Describe a moment today that you want to remember.',
  'What deserves more of your attention this week?',
];

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'quotes', label: 'Quotes', icon: Quote },
  { id: 'journal', label: 'Journal', icon: BookOpen },
  { id: 'mood', label: 'Mood', icon: Smile },
  { id: 'farm', label: 'Farm', icon: Sprout },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'upgrades', label: 'Upgrades', icon: Wrench },
  { id: 'store', label: 'Store', icon: ShoppingBag },
  { id: 'subscription', label: 'Plans', icon: Crown },
  { id: 'progress', label: 'Progress', icon: BarChart3 },
];

const primaryMobile: Section[] = ['home', 'quotes', 'farm', 'journal'];

const moodOptions: Array<{
  id: MoodKey;
  label: string;
  sub: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
}> = [
  { id: 'radiant', label: 'Radiant', sub: 'Bright & energized', icon: Sun },
  { id: 'good', label: 'Good', sub: 'Warm & positive', icon: Smile },
  { id: 'steady', label: 'Steady', sub: 'Balanced & present', icon: Meh },
  { id: 'low', label: 'Low', sub: 'Quiet & tired', icon: Cloud },
  { id: 'heavy', label: 'Heavy', sub: 'Tender & difficult', icon: Frown },
];

const emptyPlots: Plot[] = Array.from({ length: 8 }, (_, id) => ({ id, plantedAt: null, wateredAt: null }));

const initialState: AppState = {
  coins: 90,
  coinsEarned: 90,
  seeds: 0,
  carrots: 0,
  strawberries: 0,
  wood: 0,
  journalEntries: [],
  moods: [],
  favorites: [],
  plots: emptyPlots,
  cropsHarvested: 0,
  farmXP: 0,
  upgrades: { wateringCan: 1, backpack: 1, storage: 1, plotCount: 4 },
  store: { lantern: false, overalls: false, storageBonus: 0 },
  plan: 'Free',
};

function localDay(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function loadState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialState;
    const parsed = JSON.parse(saved) as Partial<AppState>;
    return {
      ...initialState,
      ...parsed,
      upgrades: { ...initialState.upgrades, ...parsed.upgrades },
      store: { ...initialState.store, ...parsed.store },
      plots: Array.from({ length: 8 }, (_, id) => parsed.plots?.[id] ?? emptyPlots[id]),
    };
  } catch {
    return initialState;
  }
}

function calculateStreak(entries: JournalEntry[]) {
  const days = [...new Set(entries.map((entry) => entry.day))].sort().reverse();
  if (!days.length) return 0;
  const cursor = new Date();
  if (days[0] !== localDay(cursor)) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  for (const day of days) {
    if (day !== localDay(cursor)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function formatEntryDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

function getPhase(plot: Plot, now: number, duration: number) {
  if (!plot.plantedAt) return 'empty';
  if (!plot.wateredAt) return 'dry';
  const progress = (now - plot.wateredAt) / duration;
  if (progress >= 1) return 'ready';
  if (progress >= 0.66) return 'growing';
  if (progress >= 0.32) return 'sprout';
  return 'watered';
}

function getProgress(plot: Plot, now: number, duration: number) {
  if (!plot.wateredAt) return 0;
  return Math.max(0, Math.min(100, ((now - plot.wateredAt) / duration) * 100));
}

function QuotesMindsetBuilder() {
  const [state, setState] = useState<AppState>(loadState);
  const [section, setSection] = useState<Section>('home');
  const [moreOpen, setMoreOpen] = useState(false);
  const [rewardOpen, setRewardOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [now, setNow] = useState(Date.now());
  const [quoteFilter, setQuoteFilter] = useState<'All' | QuoteCategory>('All');
  const [journalText, setJournalText] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodKey | null>(null);
  const [moodNote, setMoodNote] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const dayIndex = Math.floor(new Date(localDay()).getTime() / 86_400_000);
  const dailyQuote = quotes[Math.abs(dayIndex) % quotes.length];
  const prompt = prompts[Math.abs(dayIndex) % prompts.length];
  const streak = calculateStreak(state.journalEntries);
  const farmLevel = Math.floor(state.farmXP / 100) + 1;
  const levelProgress = state.farmXP % 100;
  const growthDuration = Math.max(7000, 15000 - (state.upgrades.wateringCan - 1) * 2000);
  const storageCapacity = 20 + (state.upgrades.storage - 1) * 8 + state.store.storageBonus;
  const storageUsed = state.seeds + state.carrots + state.strawberries + state.wood;
  const backpackCapacity = 8 + state.upgrades.backpack * 4;
  const readyCrops = state.plots.slice(0, 4).filter((plot) => getPhase(plot, now, growthDuration) === 'ready').length;
  const wateredCrops = state.plots.slice(0, 4).filter((plot) => ['watered', 'sprout', 'growing'].includes(getPhase(plot, now, growthDuration))).length;

  const visibleQuotes = useMemo(
    () => (quoteFilter === 'All' ? quotes : quotes.filter((item) => item.category === quoteFilter)),
    [quoteFilter],
  );

  const notify = (message: string, kind: ToastState['kind'] = 'success') => setToast({ message, kind });

  const navigate = (next: Section) => {
    setSection(next);
    setMoreOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveJournal = () => {
    const cleaned = journalText.trim();
    if (cleaned.length < 10) {
      notify('Write at least 10 characters before saving.', 'notice');
      return;
    }
    const timestamp = new Date();
    const entry: JournalEntry = {
      id: `${timestamp.getTime()}`,
      date: timestamp.toISOString(),
      day: localDay(timestamp),
      prompt,
      text: cleaned,
    };
    setState((current) => ({
      ...current,
      journalEntries: [entry, ...current.journalEntries],
      seeds: current.seeds + 3,
      coins: current.coins + 10,
      coinsEarned: current.coinsEarned + 10,
    }));
    setJournalText('');
    setRewardOpen(true);
  };

  const toggleFavorite = (id: string) => {
    const saved = state.favorites.includes(id);
    setState((current) => ({
      ...current,
      favorites: saved ? current.favorites.filter((item) => item !== id) : [...current.favorites, id],
    }));
    notify(saved ? 'Removed from favorites' : 'Saved to favorites');
  };

  const saveMood = () => {
    if (!selectedMood) {
      notify('Choose how you feel first.', 'notice');
      return;
    }
    const entry: MoodEntry = {
      id: `${Date.now()}`,
      date: new Date().toISOString(),
      mood: selectedMood,
      note: moodNote.trim(),
    };
    setState((current) => ({ ...current, moods: [entry, ...current.moods].slice(0, 30) }));
    setSelectedMood(null);
    setMoodNote('');
    notify('Mood check-in saved');
  };

  const plantPlot = (plotId: number) => {
    if (state.seeds < 1) {
      notify('Write a reflection to earn carrot seeds.', 'notice');
      return;
    }
    setState((current) => ({
      ...current,
      seeds: current.seeds - 1,
      plots: current.plots.map((plot) =>
        plot.id === plotId ? { ...plot, plantedAt: Date.now(), wateredAt: null } : plot,
      ),
    }));
    notify('Carrot seed planted · now water it');
  };

  const waterPlot = (plotId: number) => {
    setState((current) => ({
      ...current,
      plots: current.plots.map((plot) =>
        plot.id === plotId ? { ...plot, wateredAt: Date.now() } : plot,
      ),
    }));
    notify(`Crop watered · ready in ${Math.ceil(growthDuration / 1000)} seconds`);
  };

  const harvestPlot = (plotId: number) => {
    const plot = state.plots[plotId];
    if (getPhase(plot, now, growthDuration) !== 'ready') return;
    if (storageUsed >= storageCapacity) {
      notify('Storage is full. Upgrade it before harvesting.', 'notice');
      return;
    }
    setState((current) => ({
      ...current,
      carrots: current.carrots + 1,
      cropsHarvested: current.cropsHarvested + 1,
      farmXP: current.farmXP + 25,
      coins: current.coins + 5,
      coinsEarned: current.coinsEarned + 5,
      plots: current.plots.map((item) =>
        item.id === plotId ? { ...item, plantedAt: null, wateredAt: null } : item,
      ),
    }));
    notify('Carrot harvested · added to inventory · +5 coins');
  };

  const buyStoreItem = (item: 'seeds' | 'lantern' | 'storage' | 'overalls', cost: number) => {
    if (state.coins < cost) {
      notify(`You need ${cost - state.coins} more coins.`, 'notice');
      return;
    }
    if (item === 'lantern' && state.store.lantern) return;
    if (item === 'overalls' && state.store.overalls) return;
    setState((current) => ({
      ...current,
      coins: current.coins - cost,
      seeds: item === 'seeds' ? current.seeds + 6 : current.seeds,
      store: {
        ...current.store,
        lantern: item === 'lantern' ? true : current.store.lantern,
        overalls: item === 'overalls' ? true : current.store.overalls,
        storageBonus: item === 'storage' ? current.store.storageBonus + 6 : current.store.storageBonus,
      },
    }));
    const labels = { seeds: 'Seed pouch added', lantern: 'Moon lantern equipped', storage: 'Storage expanded', overalls: 'Lavender overalls equipped' };
    notify(labels[item]);
  };

  const buyUpgrade = (kind: 'wateringCan' | 'backpack' | 'storage' | 'plotCount') => {
    const value = state.upgrades[kind];
    const max = kind === 'plotCount' ? 8 : 4;
    if (value >= max) return;
    const costs = {
      wateringCan: 45 + state.upgrades.wateringCan * 25,
      backpack: 50 + state.upgrades.backpack * 30,
      storage: 60 + state.upgrades.storage * 35,
      plotCount: 80 + (state.upgrades.plotCount - 3) * 45,
    };
    const cost = costs[kind];
    if (state.coins < cost) {
      notify(`You need ${cost - state.coins} more coins.`, 'notice');
      return;
    }
    setState((current) => ({
      ...current,
      coins: current.coins - cost,
      upgrades: { ...current.upgrades, [kind]: current.upgrades[kind] + 1 },
    }));
    notify('Upgrade complete');
  };

  const selectPlan = (name: string) => {
    setState((current) => ({ ...current, plan: name }));
    notify(`${name} selected for this demo · no payment was processed`);
  };

  const sectionTitles: Record<Section, { eyebrow: string; title: string; subtitle: string }> = {
    home: { eyebrow: 'YOUR GENTLE SPACE', title: 'Good afternoon, Emy', subtitle: 'A small pause for your mind, and a little care for your garden.' },
    quotes: { eyebrow: 'WORDS TO KEEP', title: 'Quote garden', subtitle: 'Find the words you need and keep your favorites close.' },
    journal: { eyebrow: 'TODAY’S REFLECTION', title: 'Make space for yourself', subtitle: 'Your thoughts become seeds for the cozy farm.' },
    mood: { eyebrow: 'EMOTIONAL WEATHER', title: 'How are you feeling?', subtitle: 'No fixing required. Simply notice what is here.' },
    farm: { eyebrow: 'MINDFUL FARM', title: 'Your moonlit garden', subtitle: 'Plant what your reflections earn, then care for it slowly.' },
    inventory: { eyebrow: 'COLLECTION', title: 'Farm inventory', subtitle: 'Everything you have grown, found and equipped.' },
    upgrades: { eyebrow: 'GROW WITH EASE', title: 'Farm upgrades', subtitle: 'Use earned coins to make caring for your garden smoother.' },
    store: { eyebrow: 'COZY MARKET', title: 'Farm store', subtitle: 'Use demo coins for seeds, space and a little beauty.' },
    subscription: { eyebrow: 'DEMONSTRATION MODE', title: 'Choose your experience', subtitle: 'Explore the plan design. No real payment will be taken.' },
    progress: { eyebrow: 'YOUR JOURNEY', title: 'Quiet progress adds up', subtitle: 'Every reflection and harvest is part of the story.' },
  };

  const title = sectionTitles[section];

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <aside className="sidebar" aria-label="Main navigation">
        <button className="brand" onClick={() => navigate('home')} aria-label="Go home">
          <span className="brand-mark"><Leaf size={21} /></span>
          <span><strong>Mindset</strong><small>COZY GROWTH</small></span>
        </button>
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} className={section === item.id ? 'active' : ''} onClick={() => navigate(item.id)}>
                <Icon size={19} strokeWidth={1.8} /><span>{item.label}</span>
                {item.id === 'farm' && readyCrops > 0 && <b>{readyCrops}</b>}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-plan">
          <span><Crown size={17} /> {state.plan} plan</span>
          <button onClick={() => navigate('subscription')}>View plans <ChevronRight size={15} /></button>
        </div>
      </aside>

      <div className="mobile-topbar">
        <button className="mobile-profile" onClick={() => navigate('home')} aria-label="Go home">
          <span className="profile-bloom"><Flower2 size={19} /></span>
          <span><small>WELCOME BACK</small><strong>Emy’s Garden</strong></span>
        </button>
        <div className="mobile-resources">
          <button onClick={() => navigate('store')} aria-label={`${state.coins} coins`}><Coins size={14} /> {state.coins}</button>
          <button onClick={() => navigate('inventory')} aria-label={`${state.seeds} seeds`}><Wheat size={14} /> {state.seeds}</button>
        </div>
      </div>

      <main className="main-content">
        <header className="page-heading">
          <div>
            <p className="eyebrow">{title.eyebrow}</p>
            <h1>{title.title}</h1>
            <p>{title.subtitle}</p>
          </div>
          <div className="desktop-resources">
            <span><Coins size={17} /> {state.coins}</span>
            <span><Wheat size={17} /> {state.seeds}</span>
            <span><Carrot size={17} /> {state.carrots}</span>
          </div>
        </header>

        {section === 'home' && (
          <div className="page-grid home-page">
            <section className="daily-quote-card glass-card">
              <div className="quote-orbit"><span /><span /><Quote size={23} /></div>
              <p className="card-label">TODAY’S THOUGHT · {dailyQuote.category.toUpperCase()}</p>
              <blockquote>“{dailyQuote.text}”</blockquote>
              <footer>
                <span>— {dailyQuote.author}</span>
                <button className={state.favorites.includes(dailyQuote.id) ? 'icon-button saved' : 'icon-button'} onClick={() => toggleFavorite(dailyQuote.id)} aria-label="Save daily quote">
                  <Heart size={19} fill={state.favorites.includes(dailyQuote.id) ? 'currentColor' : 'none'} />
                </button>
              </footer>
            </section>

            <section className="stats-row">
              <button className="stat-card" onClick={() => navigate('journal')}>
                <span className="stat-icon purple"><Flame size={20} /></span><strong>{streak}</strong><small>day streak</small>
              </button>
              <button className="stat-card" onClick={() => navigate('farm')}>
                <span className="stat-icon green"><Sprout size={20} /></span><strong>Lv. {farmLevel}</strong><small>farm level</small>
              </button>
              <button className="stat-card" onClick={() => navigate('store')}>
                <span className="stat-icon gold"><Coins size={20} /></span><strong>{state.coins}</strong><small>coins</small>
              </button>
              <button className="stat-card" onClick={() => navigate('inventory')}>
                <span className="stat-icon cream"><Wheat size={20} /></span><strong>{state.seeds}</strong><small>seeds</small>
              </button>
            </section>

            <section className="reflection-cta glass-card">
              <div className="reflection-copy">
                <span className="soft-icon"><PenLine size={22} /></span>
                <div><p className="card-label">A TWO-MINUTE PAUSE</p><h2>What is one small thing you can be proud of today?</h2><p>Your reflection helps your garden grow.</p></div>
              </div>
              <button className="primary-button" onClick={() => navigate('journal')}>Write today’s reflection <ArrowRight size={17} /></button>
              <div className="reward-note"><Sparkles size={15} /> Earn 3 carrot seeds + 10 coins</div>
            </section>

            <section className="farm-snapshot glass-card">
              <div className="section-row"><div><p className="card-label">FARM STATUS</p><h2>Your cozy plot</h2></div><button className="text-button" onClick={() => navigate('farm')}>Open farm <ChevronRight size={16} /></button></div>
              <div className="mini-farm">
                {state.plots.slice(0, 4).map((plot) => {
                  const phase = getPhase(plot, now, growthDuration);
                  return <div key={plot.id} className={`mini-plot ${phase}`}><PlantVisual phase={phase} /></div>;
                })}
                {state.store.lantern && <div className="tiny-lantern"><Sparkles size={15} /></div>}
              </div>
              <div className="farm-status-line"><span><Droplets size={16} /> {wateredCrops} growing</span><span><Carrot size={16} /> {readyCrops} ready</span></div>
            </section>

            <section className="checkin-card glass-card">
              <span className="soft-icon rose"><Smile size={22} /></span>
              <div><p className="card-label">MOOD CHECK-IN</p><h2>How does today feel?</h2><p>A quick check-in helps you notice patterns.</p></div>
              <button className="secondary-button" onClick={() => navigate('mood')}>Check in</button>
            </section>
          </div>
        )}

        {section === 'quotes' && (
          <div className="quotes-page">
            <div className="filter-chips" role="group" aria-label="Quote categories">
              {(['All', 'Gratitude', 'Confidence', 'Calm', 'Focus'] as const).map((category) => (
                <button key={category} className={quoteFilter === category ? 'active' : ''} onClick={() => setQuoteFilter(category)}>{category}</button>
              ))}
            </div>
            <div className="quote-grid">
              {visibleQuotes.map((item) => {
                const saved = state.favorites.includes(item.id);
                return (
                  <article className="quote-card glass-card" key={item.id}>
                    <div className={`category-gem ${item.category.toLowerCase()}`}><Gem size={17} /></div>
                    <p className="card-label">{item.category.toUpperCase()}</p>
                    <blockquote>“{item.text}”</blockquote>
                    <footer><span>— {item.author}</span><button className={saved ? 'icon-button saved' : 'icon-button'} onClick={() => toggleFavorite(item.id)} aria-label={saved ? 'Remove favorite' : 'Save favorite'}><Heart size={18} fill={saved ? 'currentColor' : 'none'} /></button></footer>
                  </article>
                );
              })}
            </div>
            <p className="center-note"><Heart size={15} /> {state.favorites.length} favorite {state.favorites.length === 1 ? 'quote' : 'quotes'} saved on this device</p>
          </div>
        )}

        {section === 'journal' && (
          <div className="journal-layout">
            <section className="writing-card glass-card">
              <div className="prompt-badge"><Sparkles size={16} /> TODAY’S PROMPT</div>
              <h2>{prompt}</h2>
              <textarea value={journalText} onChange={(event) => setJournalText(event.target.value)} placeholder="Let your thoughts arrive without editing them..." aria-label="Journal reflection" />
              <div className="writing-footer">
                <span className={journalText.trim().length >= 10 ? 'valid' : ''}>{journalText.trim().length}/10 minimum</span>
                <button className="primary-button" onClick={saveJournal}><Save size={17} /> Save reflection</button>
              </div>
              <div className="reward-strip"><span><Wheat size={18} /> +3 carrot seeds</span><span><Coins size={18} /> +10 coins</span><small>each saved reflection</small></div>
            </section>
            <aside className="recent-panel glass-card">
              <div className="section-row"><div><p className="card-label">YOUR PAGES</p><h2>Recent reflections</h2></div><span className="count-badge">{state.journalEntries.length}</span></div>
              {state.journalEntries.length === 0 ? (
                <EmptyState icon={BookOpen} title="Your first page is waiting" text="Write at least 10 characters, save it, and your first seeds will appear." />
              ) : (
                <div className="entry-list">
                  {state.journalEntries.slice(0, 5).map((entry) => <article key={entry.id}><time>{formatEntryDate(entry.date)}</time><p>{entry.text}</p></article>)}
                </div>
              )}
            </aside>
          </div>
        )}

        {section === 'mood' && (
          <div className="mood-layout">
            <section className="mood-checkin glass-card">
              <p className="card-label">CHOOSE WHAT FEELS CLOSEST</p>
              <div className="mood-options">
                {moodOptions.map((mood) => {
                  const Icon = mood.icon;
                  return <button key={mood.id} className={selectedMood === mood.id ? `mood-${mood.id} selected` : `mood-${mood.id}`} onClick={() => setSelectedMood(mood.id)}><span><Icon size={26} /></span><strong>{mood.label}</strong><small>{mood.sub}</small>{selectedMood === mood.id && <Check className="mood-check" size={15} />}</button>;
                })}
              </div>
              <label className="field-label" htmlFor="mood-note">A small note <span>optional</span></label>
              <textarea id="mood-note" value={moodNote} onChange={(event) => setMoodNote(event.target.value)} placeholder="What is shaping this feeling?" />
              <button className="primary-button wide" onClick={saveMood}>Save check-in <ArrowRight size={17} /></button>
            </section>
            <section className="mood-history glass-card">
              <div className="section-row"><div><p className="card-label">RECENT WEATHER</p><h2>Mood history</h2></div><CalendarDays size={20} /></div>
              {state.moods.length === 0 ? <EmptyState icon={Smile} title="No check-ins yet" text="Your recent moods will collect here without judgment." /> : (
                <div className="mood-history-list">{state.moods.slice(0, 7).map((entry) => {
                  const details = moodOptions.find((mood) => mood.id === entry.mood)!;
                  const Icon = details.icon;
                  return <article key={entry.id}><span className={`history-icon mood-${entry.mood}`}><Icon size={19} /></span><div><strong>{details.label}</strong><small>{formatEntryDate(entry.date)}</small>{entry.note && <p>{entry.note}</p>}</div></article>;
                })}</div>
              )}
            </section>
          </div>
        )}

        {section === 'farm' && (
          <div className="farm-page">
            <section className="farm-toolbar glass-card">
              <div><span className="farm-level">LV. {farmLevel}</span><div><strong>Moon Garden</strong><small>{levelProgress}/100 XP to the next level</small></div></div>
              <div className="farm-resources"><span><Wheat size={17} /> {state.seeds} seeds</span><span><Carrot size={17} /> {state.carrots} carrots</span></div>
            </section>
            <section className="garden-scene glass-card" aria-label="Interactive moonlit garden with four crop beds"><img className="garden-art" src="./resources/garden.jpg" alt="Cozy moonlit cottage garden with four soil beds beside a river" draggable={false} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = 'https://raw.githubusercontent.com/emy881212-prog/daily-mindset-builder/main/public/resources/garden.jpg'; }} /><div className="garden-vignette" /><div className="garden-scene-hint"><Sparkles size={14} /><span>Tap a bed to plant and grow</span></div>{state.plots.slice(0, 4).map((plot) => { const phase = getPhase(plot, now, growthDuration); const progress = getProgress(plot, now, growthDuration); const seconds = plot.wateredAt ? Math.max(0, Math.ceil((growthDuration - (now - plot.wateredAt)) / 1000)) : 0; return <article className={'garden-bed garden-bed-' + (plot.id + 1) + ' ' + phase} key={plot.id} aria-label={'Garden bed ' + (plot.id + 1) + ', ' + phase}><span className="bed-number">{plot.id + 1}</span><div className="bed-plant"><PlantVisual phase={phase} /></div><div className="plot-action">{phase === 'empty' && <button onClick={() => plantPlot(plot.id)} aria-label={'Plant bed ' + (plot.id + 1)}><Plus size={15} /><span><b>Plant</b><small>Use 1 seed</small></span></button>}{phase === 'dry' && <button className="water-action" onClick={() => waterPlot(plot.id)} aria-label={'Water bed ' + (plot.id + 1)}><Droplets size={15} /><span><b>Water</b><small>Start growth</small></span></button>}{['watered', 'sprout', 'growing'].includes(phase) && <><button className="grow-action" onClick={() => notify('Your carrot is growing · ' + seconds + ' seconds remaining')} aria-label={'Check growth in bed ' + (plot.id + 1)}><Timer size={14} /><span><b>Grow</b><small>{seconds}s remaining</small></span></button><div className="growth-track"><span style={{ width: progress + '%' }} /></div></>}{phase === 'ready' && <button className="harvest-action" onClick={() => harvestPlot(plot.id)} aria-label={'Harvest bed ' + (plot.id + 1)}><Carrot size={15} /><span><b>Harvest</b><small>Collect carrot</small></span></button>}</div></article>; })}</section>
            <div className="farm-guide">
              <span><i className="step-number">1</i><b>Plant</b><small>Use one seed</small></span><ArrowRight size={16} /><span><i className="step-number">2</i><b>Water</b><small>Start growth</small></span><ArrowRight size={16} /><span><i className="step-number">3</i><b>Grow</b><small>Watch it bloom</small></span><ArrowRight size={16} /><span><i className="step-number">4</i><b>Harvest</b><small>Fill inventory</small></span>
            </div>
            {state.seeds === 0 && state.plots.slice(0, 4).every((plot) => !plot.plantedAt) && <button className="loop-hint" onClick={() => navigate('journal')}><PenLine size={19} /><span><strong>Need your first seeds?</strong><small>Save a reflection to earn 3 carrot seeds.</small></span><ArrowRight size={18} /></button>}
          </div>
        )}

        {section === 'inventory' && (
          <div className="inventory-page">
            <section className="capacity-card glass-card">
              <div><span className="soft-icon"><Archive size={22} /></span><div><p className="card-label">STORAGE SLOTS</p><h2>{storageUsed} of {storageCapacity} used</h2></div></div>
              <div className="capacity-track"><span style={{ width: `${Math.min(100, (storageUsed / storageCapacity) * 100)}%` }} /></div>
              <button className="text-button" onClick={() => navigate('upgrades')}>Expand storage <ChevronRight size={16} /></button>
            </section>
            <section className="inventory-section"><div className="inventory-title"><h2>Seeds</h2><span>Ready to plant</span></div><div className="inventory-grid"><InventoryItem icon={Wheat} name="Carrot seeds" count={state.seeds} tone="gold" /><InventoryItem icon={Flower2} name="Lavender seeds" count={0} locked /><InventoryItem icon={Star} name="Starfruit seeds" count={0} locked /></div></section>
            <section className="inventory-section"><div className="inventory-title"><h2>Harvested produce</h2><span>Grown with care</span></div><div className="inventory-grid"><InventoryItem icon={Carrot} name="Carrots" count={state.carrots} tone="orange" /><InventoryItem icon={Flower2} name="Strawberries" count={state.strawberries} tone="rose" /><InventoryItem icon={Leaf} name="Herbs" count={0} locked /></div></section>
            <section className="inventory-section"><div className="inventory-title"><h2>Materials & tools</h2><span>Your farm kit</span></div><div className="inventory-grid"><InventoryItem icon={Hammer} name="Softwood" count={state.wood} /><InventoryItem icon={Droplets} name={`Watering can · Lv. ${state.upgrades.wateringCan}`} count={1} tone="blue" /><InventoryItem icon={Backpack} name={`Backpack · ${backpackCapacity} slots`} count={1} tone="purple" />{state.store.lantern && <InventoryItem icon={Sparkles} name="Moon lantern" count={1} tone="gold" />}</div></section>
          </div>
        )}

        {section === 'upgrades' && (
          <div className="upgrades-page">
            <div className="balance-banner"><Coins size={18} /><span>Your balance</span><strong>{state.coins} coins</strong><small>Earn coins through reflections and harvests.</small></div>
            <div className="upgrade-grid">
              <UpgradeCard icon={Droplets} title="Watering can" level={state.upgrades.wateringCan} max={4} detail={`${Math.ceil(growthDuration / 1000)}s crop growth`} next="Grow crops 2 seconds faster" cost={45 + state.upgrades.wateringCan * 25} coins={state.coins} onBuy={() => buyUpgrade('wateringCan')} tone="blue" />
              <UpgradeCard icon={Backpack} title="Backpack size" level={state.upgrades.backpack} max={4} detail={`${backpackCapacity} carry slots`} next="Add 4 carrying slots" cost={50 + state.upgrades.backpack * 30} coins={state.coins} onBuy={() => buyUpgrade('backpack')} tone="purple" />
              <UpgradeCard icon={Archive} title="Farm storage" level={state.upgrades.storage} max={4} detail={`${storageCapacity} total slots`} next="Add 8 storage slots" cost={60 + state.upgrades.storage * 35} coins={state.coins} onBuy={() => buyUpgrade('storage')} tone="gold" />
              <UpgradeCard icon={Sprout} title="Garden beds" level={4} max={4} detail="4 interactive beds" next="All garden beds unlocked" cost={0} coins={state.coins} onBuy={() => buyUpgrade('plotCount')} tone="green" />
            </div>
          </div>
        )}

        {section === 'store' && (
          <div className="store-page">
            <div className="demo-banner"><Sparkles size={19} /><div><strong>Prototype market</strong><span>Everything here uses demo coins only. No real money is involved.</span></div></div>
            <div className="store-grid">
              <StoreCard icon={Wheat} category="SEED PACK" title="Carrot seed pouch" detail="Adds 6 carrot seeds to your inventory." price={25} action="Buy seeds" onBuy={() => buyStoreItem('seeds', 25)} tone="gold" />
              <StoreCard icon={Sparkles} category="DECORATION" title="Moon lantern" detail="Adds a gentle golden glow to your farm." price={70} action={state.store.lantern ? 'Equipped' : 'Add to farm'} owned={state.store.lantern} onBuy={() => buyStoreItem('lantern', 70)} tone="purple" />
              <StoreCard icon={Archive} category="EXPANSION" title="Storage baskets" detail="Adds 6 permanent storage slots." price={95} action="Expand" onBuy={() => buyStoreItem('storage', 95)} tone="green" />
              <StoreCard icon={Palette} category="COSMETIC" title="Lavender overalls" detail="A cozy cosmetic set for your farm profile." price={110} action={state.store.overalls ? 'Equipped' : 'Try the look'} owned={state.store.overalls} onBuy={() => buyStoreItem('overalls', 110)} tone="rose" />
            </div>
          </div>
        )}

        {section === 'subscription' && (
          <div className="plans-page">
            <div className="demo-banner important"><Lock size={19} /><div><strong>Subscription demonstration mode</strong><span>Plan selection is visual only. This prototype does not collect payment details or charge you.</span></div></div>
            <div className="plan-grid">
              {[
                { name: 'Free', price: '$0', desc: 'A gentle daily beginning', features: ['Daily quote', 'Basic journal', '4 farm plots'] },
                { name: 'Standard', price: '$5.99', desc: 'Build a steady rhythm', features: ['All quote categories', 'Mood history', '6 farm plots'] },
                { name: 'Premium', price: '$9.99', desc: 'The complete cozy journey', features: ['Advanced insights', 'Premium farm themes', 'Expanded inventory'], popular: true },
                { name: 'Premium Plus', price: '$14.99', desc: 'More room to grow', features: ['Seasonal gardens', 'Extra cosmetics', 'Priority content'] },
                { name: 'Pro', price: '$19.99', desc: 'Every feature unlocked', features: ['Unlimited journaling tools', 'All farm expansions', 'Future Pro releases'] },
              ].map((plan) => (
                <article className={plan.popular ? 'plan-card popular' : 'plan-card'} key={plan.name}>
                  {plan.popular && <span className="popular-label"><Sparkles size={13} /> MOST LOVED</span>}
                  <p className="card-label">{plan.name.toUpperCase()}</p><h2>{plan.price}<small>/month</small></h2><p>{plan.desc}</p>
                  <ul>{plan.features.map((feature) => <li key={feature}><CircleCheck size={16} />{feature}</li>)}</ul>
                  <button className={state.plan === plan.name ? 'plan-button selected' : 'plan-button'} onClick={() => selectPlan(plan.name)}>{state.plan === plan.name ? <><Check size={16} /> Selected</> : 'Choose demo plan'}</button>
                </article>
              ))}
            </div>
            <p className="center-note"><Lock size={14} /> No checkout, card form or real billing is connected.</p>
          </div>
        )}

        {section === 'progress' && (
          <div className="progress-page">
            <section className="journey-card glass-card">
              <div className="journey-level"><span><Leaf size={24} /></span><div><p className="card-label">FARM LEVEL {farmLevel}</p><h2>{farmLevel === 1 ? 'Gentle Beginner' : farmLevel < 4 ? 'Steady Grower' : 'Moon Gardener'}</h2></div></div>
              <div className="level-copy"><span>{levelProgress} XP</span><span>100 XP</span></div><div className="level-track"><span style={{ width: `${levelProgress}%` }} /></div><p>Harvest {Math.ceil((100 - levelProgress) / 25)} more {Math.ceil((100 - levelProgress) / 25) === 1 ? 'crop' : 'crops'} to reach the next level.</p>
            </section>
            <section className="progress-stats">
              <ProgressStat icon={BookOpen} value={state.journalEntries.length} label="Journal entries" tone="purple" />
              <ProgressStat icon={Flame} value={streak} label="Day streak" tone="rose" />
              <ProgressStat icon={Carrot} value={state.cropsHarvested} label="Crops harvested" tone="green" />
              <ProgressStat icon={Coins} value={state.coinsEarned} label="Coins earned" tone="gold" />
            </section>
            <section className="achievements glass-card">
              <div className="section-row"><div><p className="card-label">MILESTONES</p><h2>Your achievements</h2></div><Trophy size={23} /></div>
              <div className="achievement-grid">
                <Achievement icon={PenLine} title="First page" detail="Save your first reflection" unlocked={state.journalEntries.length >= 1} />
                <Achievement icon={Sprout} title="Tiny gardener" detail="Harvest your first carrot" unlocked={state.cropsHarvested >= 1} />
                <Achievement icon={Smile} title="Inner weather" detail="Record 3 mood check-ins" unlocked={state.moods.length >= 3} />
                <Achievement icon={Heart} title="Quote keeper" detail="Save 3 favorite quotes" unlocked={state.favorites.length >= 3} />
                <Achievement icon={Carrot} title="Full basket" detail="Harvest 10 crops" unlocked={state.cropsHarvested >= 10} />
                <Achievement icon={Flame} title="Week of care" detail="Reach a 7-day journal streak" unlocked={streak >= 7} />
              </div>
            </section>
          </div>
        )}
      </main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navItems.filter((item) => primaryMobile.includes(item.id)).map((item) => {
          const Icon = item.icon;
          return <button key={item.id} className={section === item.id ? 'active' : ''} onClick={() => navigate(item.id)}><span><Icon size={20} />{item.id === 'farm' && readyCrops > 0 && <b>{readyCrops}</b>}</span><small>{item.label}</small></button>;
        })}
        <button className={!primaryMobile.includes(section) || moreOpen ? 'active' : ''} onClick={() => setMoreOpen(true)}><span><MoreHorizontal size={20} /></span><small>More</small></button>
      </nav>

      {moreOpen && <div className="sheet-backdrop" onClick={() => setMoreOpen(false)}><section className="more-sheet" onClick={(event) => event.stopPropagation()}><div className="sheet-handle" /><div className="section-row"><div><p className="card-label">EXPLORE</p><h2>More spaces</h2></div><button className="icon-button" onClick={() => setMoreOpen(false)} aria-label="Close menu"><X size={19} /></button></div><div className="more-grid">{navItems.filter((item) => !primaryMobile.includes(item.id)).map((item) => { const Icon = item.icon; return <button key={item.id} className={section === item.id ? 'active' : ''} onClick={() => navigate(item.id)}><span><Icon size={21} /></span><strong>{item.label}</strong><small>{item.id === 'subscription' ? 'Demo only' : item.id === 'inventory' ? `${storageUsed}/${storageCapacity} used` : 'Open section'}</small></button>; })}</div></section></div>}

      {rewardOpen && (
        <div className="reward-backdrop" role="presentation" onClick={() => setRewardOpen(false)}>
          <section className="reward-modal" role="dialog" aria-modal="true" aria-labelledby="reward-title" onClick={(event) => event.stopPropagation()}>
            <button className="reward-close" onClick={() => setRewardOpen(false)} aria-label="Close reward"><X size={18} /></button>
            <div className="reward-stars"><i /><i /><i /><i /><Sparkles size={21} /></div>
            <p className="card-label">GREAT REFLECTION</p>
            <h2 id="reward-title">You earned seeds!</h2>
            <p>Your words planted something beautiful today.</p>
            <div className="reward-bag"><span><Wheat size={39} /></span><i /><i /></div>
            <div className="reward-items">
              <div><span><Wheat size={20} /></span><strong>+3</strong><small>Carrot seeds</small></div>
              <div><span><Coins size={20} /></span><strong>+10</strong><small>Coins</small></div>
              <div><span><Flame size={20} /></span><strong>+1</strong><small>Streak day</small></div>
            </div>
            <button className="reward-button" onClick={() => { setRewardOpen(false); navigate('farm'); }}>Plant in my garden <Sprout size={17} /></button>
            <button className="reward-later" onClick={() => setRewardOpen(false)}>Keep journaling</button>
          </section>
        </div>
      )}

      {toast && <div className={`toast ${toast.kind}`} role="status">{toast.kind === 'success' ? <CircleCheck size={18} /> : <Sparkles size={18} />}<span>{toast.message}</span></div>}
    </div>
  );
}

function PlantVisual({ phase }: { phase: string }) {
  if (phase === 'empty') return <div className="plant-visual empty-seed"><Plus size={18} /></div>;
  if (phase === 'dry') return <div className="plant-visual seed-stage"><span /></div>;
  if (phase === 'watered') return <div className="plant-visual seed-stage watered-seed"><span /><i /></div>;
  if (phase === 'sprout') return <div className="plant-visual sprout-stage"><span className="stem" /><span className="leaf left" /><span className="leaf right" /></div>;
  if (phase === 'growing') return <div className="plant-visual growing-stage"><span className="stem" /><span className="leaf one" /><span className="leaf two" /><span className="leaf three" /></div>;
  return <div className="plant-visual carrot-stage"><span className="carrot-root" /><span className="leaf one" /><span className="leaf two" /><span className="leaf three" /><Sparkles size={15} /></div>;
}

function EmptyState({ icon: Icon, title, text }: { icon: ComponentType<{ size?: number }>; title: string; text: string }) {
  return <div className="empty-state"><span><Icon size={25} /></span><strong>{title}</strong><p>{text}</p></div>;
}

function InventoryItem({ icon: Icon, name, count, tone = 'neutral', locked = false }: { icon: ComponentType<{ size?: number }>; name: string; count: number; tone?: string; locked?: boolean }) {
  return <article className={locked ? 'inventory-item locked' : 'inventory-item'}><span className={`item-art ${tone}`}><Icon size={27} /></span><div><strong>{name}</strong><small>{locked ? 'Discover later' : `${count} in storage`}</small></div><b>{locked ? <Lock size={14} /> : `×${count}`}</b></article>;
}

function UpgradeCard({ icon: Icon, title, level, max, detail, next, cost, coins, onBuy, tone }: { icon: ComponentType<{ size?: number }>; title: string; level: number; max: number; detail: string; next: string; cost: number; coins: number; onBuy: () => void; tone: string }) {
  const complete = level >= max;
  return <article className="upgrade-card glass-card"><div className={`upgrade-art ${tone}`}><Icon size={29} /></div><div className="upgrade-head"><div><p className="card-label">LEVEL {level} OF {max}</p><h2>{title}</h2></div><span>{detail}</span></div><div className="upgrade-pips">{Array.from({ length: max }, (_, index) => <i key={index} className={index < level ? 'filled' : ''} />)}</div><p className="next-benefit"><Sparkles size={15} />{complete ? 'Maximum upgrade reached' : next}</p><button disabled={complete} onClick={onBuy}>{complete ? <><Check size={16} /> Fully upgraded</> : <><Coins size={16} /> Upgrade · {cost}</>} </button>{!complete && coins < cost && <small className="need-coins">Need {cost - coins} more coins</small>}</article>;
}

function StoreCard({ icon: Icon, category, title, detail, price, action, onBuy, tone, owned = false }: { icon: ComponentType<{ size?: number }>; category: string; title: string; detail: string; price: number; action: string; onBuy: () => void; tone: string; owned?: boolean }) {
  return <article className="store-card glass-card"><div className={`store-art ${tone}`}><span><Icon size={34} /></span><i /><i /></div><p className="card-label">{category}</p><h2>{title}</h2><p>{detail}</p><div className="store-footer"><span className="price"><Coins size={16} />{price}</span><button disabled={owned} onClick={onBuy}>{owned && <Check size={15} />}{action}</button></div></article>;
}

function ProgressStat({ icon: Icon, value, label, tone }: { icon: ComponentType<{ size?: number }>; value: number; label: string; tone: string }) {
  return <article className="progress-stat glass-card"><span className={tone}><Icon size={21} /></span><strong>{value}</strong><small>{label}</small></article>;
}

function Achievement({ icon: Icon, title, detail, unlocked }: { icon: ComponentType<{ size?: number }>; title: string; detail: string; unlocked: boolean }) {
  return <article className={unlocked ? 'achievement unlocked' : 'achievement'}><span>{unlocked ? <Icon size={22} /> : <Lock size={19} />}</span><div><strong>{title}</strong><small>{detail}</small></div>{unlocked && <Check size={17} />}</article>;
}

export default QuotesMindsetBuilder;
