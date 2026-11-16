import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, PlusCircle, Search, Filter, MapPin, 
  Calendar, Tag, ArrowUpRight, Sparkles, CheckCircle2, 
  Clock, ShieldAlert, AlertCircle, RefreshCw, Eye, KeyRound
} from 'lucide-react';
import { api } from '../../services/api';
import { Item, User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const MyReportsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState<Item[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'LOST' | 'FOUND'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  const fetchMyReports = async (showSpinner = false) => {
    if (showSpinner) setIsLoading(true);
    try {
      const data = await api.getMyItems();
      setItems(data);
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to load my reports:', err);
    } finally {
      if (showSpinner) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReports(true);
    // Real-time auto sync every 4 seconds so student sees approval instantly
    const interval = setInterval(() => {
      fetchMyReports(false);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const filteredItems = items.filter((item) => {
    if (activeTab === 'LOST' && item.type !== 'LOST') return false;
    if (activeTab === 'FOUND' && item.type !== 'FOUND') return false;
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchBrand = item.brand?.toLowerCase().includes(q) || false;
      const matchColor = item.color.toLowerCase().includes(q);
      return matchTitle || matchBrand || matchColor;
    }
    return true;
  });

  const lostCount = items.filter((i) => i.type === 'LOST').length;
  const foundCount = items.filter((i) => i.type === 'FOUND').length;
  const pendingCount = items.filter((i) => i.status === 'PENDING' || i.status === 'OPEN').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b-2 border-campus-charcoal pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-campus-forest text-campus-lime font-mono text-xs font-bold uppercase px-2.5 py-0.5 border border-campus-charcoal">
            <span>{user?.role?.toUpperCase()} INCIDENT LOG</span>
            <span>&bull;</span>
            <span>{user?.full_name}</span>
          </div>
          <h1 className="font-serif font-black text-3xl sm:text-5xl text-campus-charcoal mt-1">
            My Incident Reports
          </h1>
          <p className="text-xs sm:text-sm text-campus-charcoal/70 font-sans mt-1">
            Review all lost belongings and found items you have registered with the university
          </p>
        </div>

        {/* Live sync indicator & Quick Report CTAs */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5 bg-campus-lime/30 text-campus-forest text-[11px] font-mono px-2.5 py-1.5 border border-campus-forest font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            <span>LIVE SYNC ACTIVE</span>
            {lastSyncTime && <span className="text-[10px] text-campus-charcoal/60 ml-1">({lastSyncTime})</span>}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/report/lost')}
            leftIcon={<PlusCircle className="w-3.5 h-3.5 text-red-600" />}
          >
            Report Lost
          </Button>
          <Button
            variant="lime"
            size="sm"
            onClick={() => navigate('/report/found')}
            leftIcon={<PlusCircle className="w-3.5 h-3.5 text-campus-charcoal" />}
          >
            Report Found
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-campus-white border-2 border-campus-charcoal p-5 shadow-brutal flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-campus-charcoal/60 block">
              Total Reports Filed
            </span>
            <span className="font-serif font-black text-3xl text-campus-charcoal">
              {items.length}
            </span>
          </div>
          <FileText className="w-8 h-8 text-campus-charcoal/30" />
        </div>

        <div className="bg-campus-white border-2 border-campus-charcoal p-5 shadow-brutal flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-red-700 block">
              My Lost Belongings
            </span>
            <span className="font-serif font-black text-3xl text-campus-forest">
              {lostCount}
            </span>
          </div>
          <span className="px-2.5 py-1 bg-red-100 text-red-800 font-mono text-xs font-bold border border-red-300">
            Lost
          </span>
        </div>

        <div className="bg-campus-white border-2 border-campus-charcoal p-5 shadow-brutal flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-campus-forest block">
              My Found Discoveries
            </span>
            <span className="font-serif font-black text-3xl text-campus-charcoal">
              {foundCount}
            </span>
          </div>
          <span className="px-2.5 py-1 bg-campus-lime/40 text-campus-charcoal font-mono text-xs font-bold border border-campus-charcoal">
            Found
          </span>
        </div>
      </div>

      {/* Filter and Tab Bar */}
      <div className="bg-campus-white border-2 border-campus-charcoal p-4 shadow-brutal flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Type Tabs */}
        <div className="inline-flex border border-campus-charcoal bg-campus-ivory p-1 font-mono text-xs uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 font-bold transition-colors ${
              activeTab === 'ALL' ? 'bg-campus-charcoal text-campus-lime' : 'text-campus-charcoal hover:bg-campus-grey'
            }`}
          >
            All Reports ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('LOST')}
            className={`px-3 py-1.5 font-bold transition-colors ${
              activeTab === 'LOST' ? 'bg-campus-forest text-campus-ivory' : 'text-campus-charcoal hover:bg-campus-grey'
            }`}
          >
            Lost ({lostCount})
          </button>
          <button
            onClick={() => setActiveTab('FOUND')}
            className={`px-3 py-1.5 font-bold transition-colors ${
              activeTab === 'FOUND' ? 'bg-campus-charcoal text-campus-lime' : 'text-campus-charcoal hover:bg-campus-grey'
            }`}
          >
            Found ({foundCount})
          </button>
        </div>

        {/* Search & Status Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-campus-charcoal/50 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search my reports..."
              className="w-full pl-9 pr-3 py-1.5 bg-campus-ivory border border-campus-charcoal/40 text-xs font-mono text-campus-charcoal placeholder-campus-charcoal/40 focus:outline-none focus:border-campus-charcoal"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto bg-campus-ivory border border-campus-charcoal/40 text-xs font-mono py-1.5 px-3 uppercase text-campus-charcoal focus:outline-none focus:border-campus-charcoal"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Under Admin Review</option>
            <option value="VERIFIED">Verified & Active</option>
            <option value="OPEN">Open</option>
            <option value="MATCHED">Matched</option>
            <option value="CLAIMED">Claim In Progress</option>
            <option value="RESOLVED">Resolved / Returned</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchMyReports(true)}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Reports Listing */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-campus-forest animate-spin mx-auto" />
          <p className="font-mono text-xs uppercase tracking-wider text-campus-charcoal/60">
            Loading your reports...
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-16 border-2 border-dashed border-campus-charcoal/30 bg-campus-white/60 text-center space-y-3">
          <FileText className="w-10 h-10 text-campus-charcoal/40 mx-auto" />
          <h3 className="font-serif font-bold text-xl text-campus-charcoal">
            No Reports Found Matching Criteria
          </h3>
          <p className="text-xs text-campus-charcoal/60 font-sans max-w-sm mx-auto">
            You can file a new report for missing or discovered campus items at any time.
          </p>
          <div className="pt-2 flex justify-center space-x-3">
            <Button variant="outline" size="sm" onClick={() => navigate('/report/lost')}>
              + Report Lost Belonging
            </Button>
            <Button variant="lime" size="sm" onClick={() => navigate('/report/found')}>
              + Report Found Belonging
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.map((item) => {
            const isLost = item.type === 'LOST';
            const primaryImage =
              item.images && item.images.length > 0
                ? item.images[0].image_url
                : 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80';

            const claimsOnItem = item.claims || [];
            const hasPendingClaims = claimsOnItem.some((c) => c.status === 'PENDING' || c.status === 'UNDER_REVIEW');
            const hasApprovedClaim = claimsOnItem.some((c) => c.status === 'APPROVED');
            const isPending = item.status === 'PENDING';
            const isVerified = item.status === 'VERIFIED';

            return (
              <div
                key={item.id}
                className="bg-campus-white border-2 border-campus-charcoal shadow-brutal p-5 flex flex-col justify-between space-y-4 hover:shadow-brutal-lg transition-all"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-campus-charcoal/10">
                    <div className="flex items-center space-x-2">
                      <Badge variant={isLost ? 'lost' : 'found'}>
                        {item.type}
                      </Badge>
                      <Badge variant={item.status.toLowerCase() as any}>
                        {isPending ? 'Under Review' : isVerified ? 'Verified & Active' : item.status}
                      </Badge>
                    </div>
                    <span className="font-mono text-xs text-campus-charcoal/60">
                      #{item.id}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="flex space-x-4 mt-4">
                    <img
                      src={primaryImage}
                      alt={item.title}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover border-2 border-campus-charcoal shrink-0"
                    />

                    <div className="flex-1 space-y-1 min-w-0">
                      <h3 className="font-serif font-bold text-lg text-campus-charcoal leading-tight line-clamp-1">
                        {item.title}
                      </h3>
                      <div className="flex items-center text-xs font-mono text-campus-charcoal/70">
                        <Tag className="w-3 h-3 mr-1" />
                        <span>{item.category?.name || 'Item'} &bull; {item.color}</span>
                      </div>
                      <div className="flex items-center text-xs font-mono text-campus-charcoal/70">
                        <MapPin className="w-3 h-3 mr-1 text-campus-forest" />
                        <span className="truncate">{item.location?.building_name || 'Campus Grounds'}</span>
                      </div>
                      <div className="flex items-center text-xs font-mono text-campus-charcoal/60">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{new Date(item.date_occurred).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Real-time Status Explanation Alert */}
                  {isPending && (
                    <div className="mt-3 p-2.5 bg-amber-50 border border-amber-300 text-[11px] font-mono text-amber-900 flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span><strong>Status: Pending Verification</strong> — Awaiting Super Admin review and ownership verification.</span>
                    </div>
                  )}

                  {isVerified && (
                    <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-300 text-[11px] font-mono text-emerald-950 flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span><strong>Status: Verified & Live</strong> — Approved by Campus Safety and actively scanned by the smart matching engine.</span>
                    </div>
                  )}

                  {item.status === 'MATCHED' && (
                    <div className="mt-3 p-2.5 bg-campus-lime/30 border border-campus-charcoal text-[11px] font-mono text-campus-charcoal flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-3.5 h-3.5 text-campus-forest shrink-0" />
                        <span>Potential Smart Match identified!</span>
                      </div>
                      <Link to="/matches" className="underline font-bold text-campus-forest hover:opacity-80">
                        View Matches &rarr;
                      </Link>
                    </div>
                  )}

                  {item.status === 'CLAIMED' && (
                    <div className="mt-3 p-2.5 bg-blue-50 border border-blue-300 text-[11px] font-mono text-blue-900 flex items-center space-x-2">
                      <KeyRound className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                      <span>An ownership claim is currently being processed for this item.</span>
                    </div>
                  )}

                  {item.status === 'RESOLVED' && (
                    <div className="mt-3 p-2.5 bg-teal-50 border border-teal-300 text-[11px] font-mono text-teal-900 flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                      <span><strong>Resolved:</strong> Belonging returned to owner. Case closed.</span>
                    </div>
                  )}

                  {/* Active Claim Badge on Found Items */}
                  {!isLost && hasPendingClaims && (
                    <div className="mt-3 p-2 bg-amber-50 border border-amber-300 text-xs font-mono text-amber-900 flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-700" />
                        <span>Claim pending admin verification</span>
                      </div>
                      <Link to="/claims" className="underline text-[11px] font-bold">
                        Details &rarr;
                      </Link>
                    </div>
                  )}
                </div>

                {/* Bottom Card Actions */}
                <div className="pt-3 border-t border-campus-charcoal/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-campus-charcoal/60">
                    Reported: {new Date(item.created_at).toLocaleDateString()}
                  </span>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/items/${item.id}`)}
                      rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                    >
                      View Report
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
