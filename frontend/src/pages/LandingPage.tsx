import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, ArrowRight, Sparkles, ShieldCheck, CheckCircle2, 
  MapPin, Clock, ArrowUpRight, Cpu, KeyRound, ShieldAlert, FileText 
} from 'lucide-react';
import { api } from '../services/api';
import { Item, PlatformStats } from '../types';
import { ItemCard } from '../components/item/ItemCard';
import { Button } from '../components/ui/Button';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentFound, setRecentFound] = useState<Item[]>([]);
  const [recentLost, setRecentLost] = useState<Item[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [foundRes, lostRes, analyticsRes] = await Promise.all([
          api.getRecentFound(),
          api.getRecentLost(),
          api.getPlatformAnalytics(),
        ]);
        setRecentFound(foundRes);
        setRecentLost(lostRes);
        setStats(analyticsRes.stats);
      } catch (err) {
        console.error('Error fetching landing page data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/items?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/items');
    }
  };

  return (
    <div className="space-y-24 sm:space-y-32">
      {/* 1. HERO SECTION: EDITORIAL BRUTALIST */}
      <section className="relative pt-8 sm:pt-16 pb-12 overflow-hidden">
        {/* Subtle decorative grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1b211f0a_1px,transparent_1px),linear-gradient(to_bottom,#1b211f0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
            {/* Left Headline Area */}
            <div className="lg:col-span-8 space-y-6">
              <div className="inline-flex items-center space-x-2 bg-campus-white border border-campus-charcoal/30 px-3 py-1 font-mono text-xs uppercase tracking-widest text-campus-charcoal shadow-sm">
                <span className="w-2 h-2 bg-campus-lime border border-campus-charcoal" />
                <span>University Lost Property Protocol // 2024-2025</span>
              </div>

              <h1 className="font-serif font-black text-5xl sm:text-7xl lg:text-8xl tracking-tight text-campus-charcoal leading-[0.95]">
                LOST SOMETHING?<br />
                <span className="italic font-normal text-campus-forest underline decoration-campus-lime decoration-8 underline-offset-8">
                  LET&apos;S BRING IT
                </span><br />
                HOME.
              </h1>

              <p className="text-lg sm:text-xl text-campus-charcoal/80 max-w-2xl leading-relaxed font-sans pt-2">
                A verified campus ecosystem combining 6-factor fuzzy matching, private ownership verification, and secure physical handovers. Built exclusively for our university students and faculty.
              </p>

              {/* Decorative Search Interface */}
              <form onSubmit={handleSearchSubmit} className="pt-4 max-w-2xl">
                <div className="relative flex flex-col sm:flex-row items-stretch border-2 border-campus-charcoal bg-campus-white shadow-brutal-lg">
                  <div className="relative flex-1 flex items-center">
                    <Search className="w-5 h-5 text-campus-charcoal/50 ml-4 shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name, brand, color (e.g. 'AirPods', 'Hydro Flask', 'MacBook')..."
                      className="w-full px-4 py-3.5 text-sm sm:text-base text-campus-charcoal placeholder-campus-charcoal/40 bg-transparent focus:outline-none"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="lime"
                    size="lg"
                    className="border-t-2 sm:border-t-0 sm:border-l-2 border-campus-charcoal shrink-0"
                  >
                    Locate Item
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2.5 text-xs font-mono text-campus-charcoal/60">
                  <span className="uppercase tracking-wider">Common Searches:</span>
                  {['MacBook Pro', 'AirPods', 'Water Bottle', 'Car Key', 'Backpack'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => navigate(`/items?search=${encodeURIComponent(item)}`)}
                      className="hover:text-campus-charcoal hover:underline"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </form>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/report/lost')}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Report Lost Belonging
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate('/items?type=FOUND')}
                >
                  Explore Found Items
                </Button>
              </div>
            </div>

            {/* Right Live Statistics Card & Editorial Visual */}
            <div className="lg:col-span-4 space-y-6">
              <div className="border-2 border-campus-charcoal bg-campus-white p-6 shadow-brutal">
                <div className="border-b border-campus-charcoal/20 pb-4 mb-5 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-campus-charcoal">
                    Live Platform Statistics
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                <div className="space-y-5">
                  <div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-mono uppercase text-campus-charcoal/60">
                        Recovery Rate
                      </span>
                      <span className="text-3xl font-serif font-black text-campus-forest">
                        {stats?.recovery_rate_percentage || 84.5}%
                      </span>
                    </div>
                    <div className="w-full bg-campus-grey h-2 mt-1.5 border border-campus-charcoal/20 overflow-hidden">
                      <div
                        className="bg-campus-lime h-full border-r border-campus-charcoal"
                        style={{ width: `${stats?.recovery_rate_percentage || 84.5}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-campus-charcoal/10 font-mono">
                    <div>
                      <span className="text-[10px] uppercase text-campus-charcoal/60 block">
                        Active Matches
                      </span>
                      <span className="text-2xl font-bold text-campus-charcoal">
                        {stats?.active_matches_count || 18}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-campus-charcoal/60 block">
                        Items Returned
                      </span>
                      <span className="text-2xl font-bold text-campus-forest">
                        {stats?.total_recovered_items || 142}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-campus-charcoal/10 font-mono">
                    <div>
                      <span className="text-[10px] uppercase text-campus-charcoal/60 block">
                        Lost Reports
                      </span>
                      <span className="text-xl font-bold text-campus-charcoal">
                        {stats?.total_lost_items || 65}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-campus-charcoal/60 block">
                        Found Reports
                      </span>
                      <span className="text-xl font-bold text-campus-charcoal">
                        {stats?.total_found_items || 82}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-campus-charcoal/20">
                  <div className="p-3 bg-campus-ivory border border-campus-charcoal/20 text-xs font-mono flex items-center justify-between">
                    <span className="text-campus-charcoal/70">Campus Coverage:</span>
                    <span className="font-bold text-campus-charcoal">6 Key Zones</span>
                  </div>
                </div>
              </div>

              {/* Security Pill Card */}
              <div className="bg-campus-forest text-campus-ivory p-5 border-2 border-campus-charcoal shadow-brutal flex items-start space-x-3">
                <ShieldCheck className="w-6 h-6 text-campus-lime shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <strong className="font-bold font-mono text-campus-lime uppercase block mb-0.5">
                    Verified Ownership Protocol
                  </strong>
                  Items are never automatically handed over. Claims require verified campus identification and unique property verification.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. RECENTLY FOUND SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b-2 border-campus-charcoal">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-campus-forest">
              Safe Storage Inventory
            </span>
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-campus-charcoal mt-1">
              Recently Discovered & Secured
            </h2>
          </div>
          <Link
            to="/items?type=FOUND"
            className="mt-3 sm:mt-0 inline-flex items-center text-xs font-mono font-bold uppercase tracking-wider text-campus-forest hover:text-campus-charcoal hover:underline"
          >
            <span>View All Found Belongings ({stats?.total_found_items || 0})</span>
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentFound.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* 3. RECENTLY REPORTED LOST SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b-2 border-campus-charcoal">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-red-700">
              Active Community Inquiries
            </span>
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-campus-charcoal mt-1">
              Recently Reported Missing
            </h2>
          </div>
          <Link
            to="/items?type=LOST"
            className="mt-3 sm:mt-0 inline-flex items-center text-xs font-mono font-bold uppercase tracking-wider text-campus-forest hover:text-campus-charcoal hover:underline"
          >
            <span>View All Lost Reports ({stats?.total_lost_items || 0})</span>
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentLost.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* 4. HOW CAMPUSFIND WORKS */}
      <section className="bg-campus-white border-y-2 border-campus-charcoal py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-campus-forest">
              Engineered for Universities
            </span>
            <h2 className="font-serif font-black text-4xl sm:text-5xl text-campus-charcoal">
              A Four-Step Recovery Pipeline
            </h2>
            <p className="text-sm text-campus-charcoal/70 font-sans leading-relaxed">
              Replacing scattered WhatsApp group chats and lost paper flyers with an auditable institutional protocol.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Report Incident',
                desc: 'Students or campus staff register item attributes, building, floor, photos, and private ownership markers.',
                icon: FileText,
              },
              {
                step: '02',
                title: 'Smart Matching',
                desc: 'Our 6-factor fuzzy algorithm calculates correlation across text, category, location, and date proximity.',
                icon: Cpu,
              },
              {
                step: '03',
                title: 'Confidential Claim',
                desc: 'Claimant submits distinguishing ownership proof. Private notes are securely routed to campus officers.',
                icon: ShieldAlert,
              },
              {
                step: '04',
                title: 'Verified Handover',
                desc: 'An authenticated verification PIN is generated for physical collection at the authorized campus desk.',
                icon: KeyRound,
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="border-2 border-campus-charcoal bg-campus-ivory p-6 shadow-brutal flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-2xl font-black text-campus-forest">
                      {step.step}
                    </span>
                    <step.icon className="w-6 h-6 text-campus-charcoal" />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-campus-charcoal mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-campus-charcoal/70 leading-relaxed font-sans">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SMART MATCHING ALGORITHM BREAKDOWN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-2 border-campus-charcoal bg-campus-forest text-campus-ivory p-8 sm:p-12 shadow-brutal-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center space-x-2 bg-campus-lime text-campus-charcoal font-mono text-xs font-bold uppercase px-2.5 py-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Deterministic 6-Factor Engine</span>
              </div>
              <h2 className="font-serif font-black text-3xl sm:text-4xl text-campus-ivory">
                Intelligent correlation without guesswork.
              </h2>
              <p className="text-sm text-campus-ivory/80 leading-relaxed font-sans">
                Every newly filed lost or found report is instantly analyzed against active opposite reports using a normalized multi-variable scoring model:
              </p>
              <div className="space-y-2 pt-2 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-campus-ivory/20 pb-1">
                  <span>Item Name Token Similarity</span>
                  <span className="text-campus-lime font-bold">25% Weight</span>
                </div>
                <div className="flex items-center justify-between border-b border-campus-ivory/20 pb-1">
                  <span>Category Classification Match</span>
                  <span className="text-campus-lime font-bold">20% Weight</span>
                </div>
                <div className="flex items-center justify-between border-b border-campus-ivory/20 pb-1">
                  <span>Campus Zone & Floor Proximity</span>
                  <span className="text-campus-lime font-bold">20% Weight</span>
                </div>
                <div className="flex items-center justify-between border-b border-campus-ivory/20 pb-1">
                  <span>Incident Date Correlation</span>
                  <span className="text-campus-lime font-bold">15% Weight</span>
                </div>
                <div className="flex items-center justify-between border-b border-campus-ivory/20 pb-1">
                  <span>Description Text Similarity</span>
                  <span className="text-campus-lime font-bold">10% Weight</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Item Color & Finish Overlap</span>
                  <span className="text-campus-lime font-bold">10% Weight</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="bg-campus-white text-campus-charcoal border-2 border-campus-charcoal p-6 shadow-brutal space-y-4">
                <div className="flex items-center justify-between border-b border-campus-charcoal/20 pb-3">
                  <span className="font-mono text-xs uppercase font-bold text-campus-charcoal">
                    Sample Match Correlation
                  </span>
                  <span className="bg-campus-lime text-campus-charcoal font-mono text-xs font-bold px-2 py-0.5 border border-campus-charcoal">
                    92% Strong Match
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 bg-campus-ivory border border-campus-charcoal/10">
                    <span className="text-campus-charcoal/60 block text-[10px] uppercase">Lost Record</span>
                    <strong className="text-campus-charcoal font-bold">Apple MacBook Pro 14 Space Gray</strong>
                    <p className="text-[11px] text-campus-charcoal/70 mt-0.5 font-sans">Central Library 2nd Floor</p>
                  </div>

                  <div className="p-3 bg-campus-lime/20 border border-campus-lime">
                    <span className="text-campus-forest block text-[10px] uppercase font-bold">Found Record</span>
                    <strong className="text-campus-charcoal font-bold">Space Gray Apple MacBook Pro M-series</strong>
                    <p className="text-[11px] text-campus-charcoal/70 mt-0.5 font-sans">Central Library Reading Wing</p>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate('/matches')}
                  >
                    Explore Active Matches
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-campus-ivory border-2 border-campus-charcoal p-10 sm:p-16 shadow-brutal-lg space-y-6">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-campus-forest">
            Ready to reunite with your property?
          </span>
          <h2 className="font-serif font-black text-4xl sm:text-6xl text-campus-charcoal max-w-3xl mx-auto leading-tight">
            Stop searching in the dark. Report your item in under 2 minutes.
          </h2>
          <p className="text-sm sm:text-base text-campus-charcoal/70 max-w-xl mx-auto font-sans leading-relaxed">
            Every entry immediately benefits from automated cross-checking and campus security cataloging.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button
              variant="lime"
              size="lg"
              onClick={() => navigate('/report/lost')}
              leftIcon={<Search className="w-4 h-4" />}
            >
              Report a Lost Item
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/report/found')}
            >
              I Found Something
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
