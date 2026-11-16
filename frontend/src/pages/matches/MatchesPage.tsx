import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, ArrowRight, CheckCircle2, XCircle, RefreshCw, 
  MapPin, Calendar, Tag, ShieldCheck, ArrowUpRight 
} from 'lucide-react';
import { api } from '../../services/api';
import { Match, Item } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { MatchScoreBadge } from '../../components/item/MatchScoreBadge';
import { ClaimModal } from '../../components/item/ClaimModal';

export const MatchesPage: React.FC = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [selectedClaimItem, setSelectedClaimItem] = useState<Item | null>(null);

  const fetchMatches = async () => {
    setIsLoading(true);
    try {
      const data = await api.getMyMatches();
      setMatches(data);
    } catch (err) {
      console.error('Failed to load matches:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      await api.recalculateMatches();
      await fetchMatches();
    } catch (err) {
      console.error('Recalculation failed:', err);
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleUpdateStatus = async (matchId: number, newStatus: 'ACCEPTED' | 'DISMISSED') => {
    try {
      await api.updateMatchStatus(matchId, newStatus);
      setMatches((prev) =>
        prev.map((m) => (m.id === matchId ? { ...m, status: newStatus } : m))
      );
    } catch (err) {
      console.error('Failed to update match status:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b-2 border-campus-charcoal pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-campus-lime text-campus-charcoal font-mono text-xs font-bold uppercase px-2.5 py-0.5 border border-campus-charcoal">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Matching Engine</span>
          </div>
          <h1 className="font-serif font-black text-3xl sm:text-5xl text-campus-charcoal mt-1">
            Potential Item Correlations
          </h1>
          <p className="text-xs sm:text-sm text-campus-charcoal/70 font-sans mt-1">
            Analyzed by the 6-factor fuzzy algorithm comparing your reports with opposite registered belongings
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          isLoading={isRecalculating}
          onClick={handleRecalculate}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Recalculate Matches
        </Button>
      </div>

      {isLoading ? (
        <div className="py-24 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-campus-forest animate-spin mx-auto" />
          <p className="font-mono text-xs uppercase tracking-wider text-campus-charcoal/60">
            Evaluating match factors across campus database...
          </p>
        </div>
      ) : matches.length === 0 ? (
        <div className="py-20 border-2 border-dashed border-campus-charcoal/30 bg-campus-white/60 text-center space-y-4">
          <Sparkles className="w-12 h-12 text-campus-charcoal/40 mx-auto" />
          <h3 className="font-serif font-bold text-2xl text-campus-charcoal">
            No Active Matches Identified Yet
          </h3>
          <p className="text-xs sm:text-sm text-campus-charcoal/70 font-sans max-w-md mx-auto leading-relaxed">
            The smart matching engine continuously monitors new lost and found reports. As soon as an opposite report matches your items, it will appear here.
          </p>
          <div className="pt-2 flex justify-center space-x-3">
            <Button variant="primary" size="sm" onClick={() => navigate('/items')}>
              Browse General Catalog
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/report/lost')}>
              File a Lost Report
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {matches.map((match) => {
            const lost = match.lost_item;
            const found = match.found_item;
            const factors = match.breakdown?.factors;

            return (
              <div
                key={match.id}
                className="bg-campus-white border-2 border-campus-charcoal shadow-brutal p-6 space-y-6"
              >
                {/* Match Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-campus-charcoal/20 gap-3">
                  <div className="flex items-center space-x-3">
                    <MatchScoreBadge score={match.score} classification={match.classification} size="lg" />
                    <span className="font-mono text-xs text-campus-charcoal/60">
                      Match ID: #M-{match.id} &bull; Status: <strong className="uppercase">{match.status}</strong>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {match.status !== 'DISMISSED' && (
                      <button
                        onClick={() => handleUpdateStatus(match.id, 'DISMISSED')}
                        className="text-xs font-mono text-campus-charcoal/60 hover:text-red-700 hover:underline px-2 py-1"
                      >
                        Dismiss Match
                      </button>
                    )}
                    {found && (
                      <Button
                        variant="lime"
                        size="sm"
                        onClick={() => setSelectedClaimItem(found)}
                        leftIcon={<ShieldCheck className="w-4 h-4" />}
                      >
                        Claim This Item
                      </Button>
                    )}
                  </div>
                </div>

                {/* Side-by-Side Comparison Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                  {/* Lost Item Card */}
                  <div className="border border-campus-charcoal/30 bg-campus-ivory p-4 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="lost">Lost Report</Badge>
                        <span className="font-mono text-[10px] text-campus-charcoal/60">
                          {lost && new Date(lost.date_occurred).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-lg text-campus-charcoal line-clamp-1">
                        {lost?.title}
                      </h4>
                      <p className="text-xs text-campus-charcoal/70 line-clamp-2 mt-1 font-sans">
                        {lost?.description}
                      </p>
                      <div className="mt-3 pt-2 border-t border-campus-charcoal/10 font-mono text-xs space-y-1">
                        <div className="flex items-center text-campus-charcoal/80">
                          <MapPin className="w-3.5 h-3.5 mr-1.5 text-campus-forest shrink-0" />
                          <span>{lost?.location?.building_name} ({lost?.floor || 'Floor N/A'})</span>
                        </div>
                        <div className="flex items-center text-campus-charcoal/80">
                          <Tag className="w-3.5 h-3.5 mr-1.5 text-campus-charcoal/60 shrink-0" />
                          <span>{lost?.category?.name} &bull; Color: {lost?.color}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Link
                        to={`/items/${lost?.id}`}
                        className="text-xs font-mono font-bold text-campus-forest hover:underline inline-flex items-center"
                      >
                        View Full Lost Report <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                      </Link>
                    </div>
                  </div>

                  {/* Found Item Card */}
                  <div className="border-2 border-campus-charcoal bg-campus-lime/10 p-4 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="found">Found Item</Badge>
                        <span className="font-mono text-[10px] text-campus-charcoal/60">
                          {found && new Date(found.date_occurred).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-lg text-campus-charcoal line-clamp-1">
                        {found?.title}
                      </h4>
                      <p className="text-xs text-campus-charcoal/70 line-clamp-2 mt-1 font-sans">
                        {found?.description}
                      </p>
                      <div className="mt-3 pt-2 border-t border-campus-charcoal/10 font-mono text-xs space-y-1">
                        <div className="flex items-center text-campus-charcoal/80">
                          <MapPin className="w-3.5 h-3.5 mr-1.5 text-campus-forest shrink-0" />
                          <span>{found?.location?.building_name} ({found?.floor || 'Floor N/A'})</span>
                        </div>
                        <div className="flex items-center text-campus-charcoal/80">
                          <Tag className="w-3.5 h-3.5 mr-1.5 text-campus-charcoal/60 shrink-0" />
                          <span>{found?.category?.name} &bull; Color: {found?.color}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Link
                        to={`/items/${found?.id}`}
                        className="text-xs font-mono font-bold text-campus-forest hover:underline inline-flex items-center"
                      >
                        View Full Found Report <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* 6-Factor Algorithmic Breakdown */}
                {factors && (
                  <div className="bg-campus-ivory border border-campus-charcoal/20 p-4 space-y-3 font-mono text-xs">
                    <span className="font-bold uppercase tracking-wider text-campus-charcoal/70 block text-[10px]">
                      Algorithmic Breakdown Analysis:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      <div>
                        <span className="text-[10px] text-campus-charcoal/60 block">Name (25%)</span>
                        <strong className="text-campus-charcoal">{factors.name_similarity?.score} / 25 pts</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-campus-charcoal/60 block">Category (20%)</span>
                        <strong className="text-campus-charcoal">{factors.category_match?.score} / 20 pts</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-campus-charcoal/60 block">Location (20%)</span>
                        <strong className="text-campus-charcoal">{factors.location_proximity?.score} / 20 pts</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-campus-charcoal/60 block">Date (15%)</span>
                        <strong className="text-campus-charcoal">{factors.date_proximity?.score} / 15 pts</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-campus-charcoal/60 block">Description (10%)</span>
                        <strong className="text-campus-charcoal">{factors.description_similarity?.score} / 10 pts</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-campus-charcoal/60 block">Color (10%)</span>
                        <strong className="text-campus-charcoal">{factors.color_match?.score} / 10 pts</strong>
                      </div>
                    </div>
                    {match.breakdown?.summary && (
                      <p className="text-[11px] text-campus-forest italic pt-1 border-t border-campus-charcoal/10 font-sans">
                        Note: {match.breakdown.summary}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Claim Modal if triggered directly from match */}
      {selectedClaimItem && (
        <ClaimModal
          item={selectedClaimItem}
          isOpen={Boolean(selectedClaimItem)}
          onClose={() => setSelectedClaimItem(null)}
          onClaimSuccess={() => {
            setSelectedClaimItem(null);
            fetchMatches();
          }}
        />
      )}
    </div>
  );
};
