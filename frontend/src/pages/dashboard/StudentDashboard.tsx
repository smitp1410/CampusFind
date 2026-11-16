import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PlusCircle, Sparkles, FileText, CheckCircle2, AlertCircle, 
  ArrowUpRight, Clock, MapPin, Tag, User, ShieldCheck, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Item, Match, Claim } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { MatchScoreBadge } from '../../components/item/MatchScoreBadge';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [myItems, setMyItems] = useState<Item[]>([]);
  const [myMatches, setMyMatches] = useState<Match[]>([]);
  const [myClaims, setMyClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async (showSpinner = false) => {
    if (showSpinner) setIsLoading(true);
    try {
      const [itemsRes, matchesRes, claimsRes] = await Promise.all([
        api.getMyItems(),
        api.getMyMatches(),
        api.getMyClaims(),
      ]);
      setMyItems(itemsRes);
      setMyMatches(matchesRes);
      setMyClaims(claimsRes);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      if (showSpinner) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(true);
    const interval = setInterval(() => {
      fetchDashboardData(false);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const lostCount = myItems.filter((i) => i.type === 'LOST').length;
  const foundCount = myItems.filter((i) => i.type === 'FOUND').length;
  const highConfidenceMatches = myMatches.filter((m) => m.score >= 50);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* 1. Header & Quick Actions */}
      <div className="border-b-2 border-campus-charcoal pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-campus-forest text-campus-lime font-mono text-[11px] uppercase tracking-widest px-2.5 py-0.5 border border-campus-charcoal">
              <span>Verified Campus Registry</span>
              <span>&bull;</span>
              <span className="uppercase">{user?.role} Profile</span>
            </div>
            <h1 className="font-serif font-black text-4xl sm:text-5xl text-campus-charcoal">
              Welcome, {user?.full_name}
            </h1>
            <p className="text-sm font-mono text-campus-charcoal/70">
              {user?.department || 'Department Unassigned'} &bull; {user?.email} &bull; ID: {user?.student_faculty_id || 'N/A'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/report/lost')}
              leftIcon={<PlusCircle className="w-4 h-4 text-red-600" />}
            >
              Report Lost Belonging
            </Button>
            <Button
              variant="lime"
              size="md"
              onClick={() => navigate('/report/found')}
              leftIcon={<PlusCircle className="w-4 h-4 text-campus-charcoal" />}
            >
              Report Found Belonging
            </Button>
          </div>
        </div>
      </div>

      {/* 2. KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-campus-white border-2 border-campus-charcoal p-5 shadow-brutal">
          <span className="font-mono text-xs uppercase tracking-wider text-campus-charcoal/60 block mb-1">
            Total Filed Reports
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-serif font-black text-3xl sm:text-4xl text-campus-charcoal">
              {myItems.length}
            </span>
            <div className="text-[11px] font-mono text-campus-charcoal/70">
              {lostCount} Lost / {foundCount} Found
            </div>
          </div>
        </div>

        <div className="bg-campus-white border-2 border-campus-charcoal p-5 shadow-brutal">
          <span className="font-mono text-xs uppercase tracking-wider text-campus-charcoal/60 block mb-1">
            Potential Matches
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-serif font-black text-3xl sm:text-4xl text-campus-forest">
              {myMatches.length}
            </span>
            <span className="bg-campus-lime font-mono text-[10px] font-bold px-2 py-0.5 border border-campus-charcoal">
              {highConfidenceMatches.length} High Conf.
            </span>
          </div>
        </div>

        <div className="bg-campus-white border-2 border-campus-charcoal p-5 shadow-brutal">
          <span className="font-mono text-xs uppercase tracking-wider text-campus-charcoal/60 block mb-1">
            Submitted Claims
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-serif font-black text-3xl sm:text-4xl text-campus-charcoal">
              {myClaims.length}
            </span>
            <span className="text-[11px] font-mono text-amber-700">
              {myClaims.filter((c) => c.status === 'PENDING' || c.status === 'UNDER_REVIEW').length} Pending
            </span>
          </div>
        </div>

        <div className="bg-campus-forest text-campus-ivory border-2 border-campus-charcoal p-5 shadow-brutal">
          <span className="font-mono text-xs uppercase tracking-wider text-campus-lime block mb-1">
            Resolved Items
          </span>
          <div className="flex items-baseline justify-between">
            <span className="font-serif font-black text-3xl sm:text-4xl text-campus-lime">
              {myClaims.filter((c) => c.status === 'RETURNED').length +
                myItems.filter((i) => i.status === 'RESOLVED').length}
            </span>
            <CheckCircle2 className="w-5 h-5 text-campus-lime" />
          </div>
        </div>
      </div>

      {/* 3. Potential Matches Alert Strip (If Any) */}
      {highConfidenceMatches.length > 0 && (
        <div className="bg-campus-lime/30 border-2 border-campus-charcoal p-6 shadow-brutal">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-campus-lime border border-campus-charcoal">
                <Sparkles className="w-5 h-5 text-campus-charcoal" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl text-campus-charcoal">
                  Smart Match Suggestions Detected ({highConfidenceMatches.length})
                </h3>
                <p className="text-xs text-campus-charcoal/80 font-sans">
                  The matching algorithm detected high similarity between your reports and recent opposite campus reports.
                </p>
              </div>
            </div>
            <Link to="/matches">
              <Button variant="primary" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                Review All Matches
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {highConfidenceMatches.slice(0, 2).map((m) => (
              <div
                key={m.id}
                className="bg-campus-white border border-campus-charcoal p-4 flex items-center justify-between"
              >
                <div className="space-y-1 pr-3">
                  <div className="flex items-center space-x-2">
                    <MatchScoreBadge score={m.score} size="sm" />
                    <span className="text-[10px] font-mono text-campus-charcoal/60">
                      {m.lost_item?.location?.building_name}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-campus-charcoal line-clamp-1">
                    {m.found_item?.title}
                  </h4>
                  <p className="text-xs text-campus-charcoal/70 line-clamp-1">
                    Matches your report: &quot;{m.lost_item?.title}&quot;
                  </p>
                </div>
                <Link to="/matches" className="shrink-0">
                  <Button variant="lime" size="sm">
                    Inspect
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Active Claims & Handovers Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-campus-charcoal/20">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-campus-forest" />
            <h2 className="font-serif font-bold text-2xl text-campus-charcoal">
              My Active Claims & Handovers
            </h2>
          </div>
          <Link to="/claims" className="text-xs font-mono uppercase text-campus-forest font-bold hover:underline">
            View All ({myClaims.length})
          </Link>
        </div>

        {myClaims.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-campus-charcoal/30 bg-campus-white/60 text-center space-y-2">
            <p className="text-xs font-mono uppercase text-campus-charcoal/60">
              You have not submitted any ownership claims yet.
            </p>
            <p className="text-xs text-campus-charcoal/80 font-sans">
              If you spot an item in the catalog that belongs to you, open its report and click &quot;Submit Ownership Claim&quot;.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myClaims.slice(0, 3).map((claim) => (
              <div
                key={claim.id}
                className="bg-campus-white border-2 border-campus-charcoal p-5 shadow-brutal flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] uppercase text-campus-charcoal/60">
                      Claim #{claim.id}
                    </span>
                    <Badge variant={claim.status.toLowerCase() as any}>
                      {claim.status}
                    </Badge>
                  </div>
                  <h3 className="font-serif font-bold text-base text-campus-charcoal line-clamp-1">
                    {claim.item?.title}
                  </h3>
                  <p className="text-xs text-campus-charcoal/70 line-clamp-2 mt-1">
                    Proof submitted: &quot;{claim.ownership_proof}&quot;
                  </p>

                  {/* Handover code banner if approved */}
                  {claim.status === 'APPROVED' && claim.handover && (
                    <div className="mt-3 p-3 bg-campus-lime/30 border border-campus-charcoal">
                      <span className="text-[10px] font-mono uppercase font-bold text-campus-charcoal block">
                        Verified Handover Code:
                      </span>
                      <span className="font-mono text-base font-black text-campus-charcoal tracking-widest block my-0.5">
                        {claim.handover.handover_code}
                      </span>
                      <p className="text-[11px] text-campus-charcoal/80 font-sans">
                        Present this code & your ID at: {claim.handover.handover_location}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-campus-charcoal/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-campus-charcoal/60">
                    {new Date(claim.created_at).toLocaleDateString()}
                  </span>
                  <Link
                    to={`/claims/${claim.id}`}
                    className="font-bold text-campus-forest hover:underline flex items-center"
                  >
                    <span>Track Status</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. My Reported Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-campus-charcoal/20">
          <h2 className="font-serif font-bold text-2xl text-campus-charcoal">
            My Incident Reports ({myItems.length})
          </h2>
          <Link
            to="/items"
            className="text-xs font-mono uppercase text-campus-forest font-bold hover:underline"
          >
            Catalog Explorer &rarr;
          </Link>
        </div>

        {myItems.length === 0 ? (
          <div className="p-10 border-2 border-dashed border-campus-charcoal/30 bg-campus-white/60 text-center space-y-3">
            <p className="text-xs font-mono uppercase text-campus-charcoal/60">
              No reports registered under your account.
            </p>
            <div className="flex justify-center space-x-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/report/lost')}>
                Report Lost Belonging
              </Button>
              <Button variant="lime" size="sm" onClick={() => navigate('/report/found')}>
                Report Found Belonging
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-campus-white border-2 border-campus-charcoal shadow-brutal overflow-x-auto">
            <table className="w-full text-left text-xs font-mono divide-y divide-campus-charcoal/20">
              <thead className="bg-campus-ivory text-campus-charcoal uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Item Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-campus-charcoal/10 font-sans">
                {myItems.map((item) => (
                  <tr key={item.id} className="hover:bg-campus-grey/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono">
                      <Badge variant={item.type === 'LOST' ? 'lost' : 'found'} size="sm">
                        {item.type}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-campus-charcoal line-clamp-1">
                        {item.title}
                      </div>
                      <div className="text-[11px] font-mono text-campus-charcoal/60">
                        {item.color} {item.brand ? `• ${item.brand}` : ''}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-campus-charcoal/80">
                      {item.category?.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-campus-charcoal/80">
                      {item.location?.building_name}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <Badge variant={item.status.toLowerCase() as any} size="sm">
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-campus-charcoal/60">
                      {new Date(item.date_occurred).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono">
                      <Link
                        to={`/items/${item.id}`}
                        className="text-xs font-bold text-campus-forest hover:underline"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
