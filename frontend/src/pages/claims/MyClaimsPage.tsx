import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, ShieldCheck, Clock, CheckCircle2, XCircle, 
  ArrowRight, KeyRound, MapPin, ExternalLink 
} from 'lucide-react';
import { api } from '../../services/api';
import { Claim } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const MyClaimsPage: React.FC = () => {
  const navigate = useNavigate();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const data = await api.getMyClaims();
        setClaims(data);
      } catch (err) {
        console.error('Failed to load user claims:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClaims();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b-2 border-campus-charcoal pb-6">
        <span className="font-mono text-xs uppercase tracking-widest text-campus-forest font-bold">
          Verification Pipeline
        </span>
        <h1 className="font-serif font-black text-3xl sm:text-5xl text-campus-charcoal mt-1">
          Ownership Claims & Handovers
        </h1>
        <p className="text-xs sm:text-sm text-campus-charcoal/70 font-sans mt-1">
          Track the status of your submitted claims, review admin decisions, and retrieve verification PINs for collection
        </p>
      </div>

      {isLoading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-campus-charcoal border-t-campus-lime rounded-full animate-spin mx-auto" />
          <p className="font-mono text-xs uppercase tracking-wider text-campus-charcoal/60">
            Loading your claim records...
          </p>
        </div>
      ) : claims.length === 0 ? (
        <div className="py-20 border-2 border-dashed border-campus-charcoal/30 bg-campus-white/60 text-center space-y-4">
          <FileText className="w-12 h-12 text-campus-charcoal/40 mx-auto" />
          <h3 className="font-serif font-bold text-2xl text-campus-charcoal">
            No Claims Submitted
          </h3>
          <p className="text-xs sm:text-sm text-campus-charcoal/70 font-sans max-w-md mx-auto leading-relaxed">
            You haven&apos;t filed any ownership claims yet. If you locate your missing belonging in the catalog or in your smart match suggestions, open its report and click &quot;Submit Ownership Claim&quot;.
          </p>
          <div className="pt-2">
            <Button variant="primary" size="sm" onClick={() => navigate('/items')}>
              Browse Catalog
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {claims.map((claim) => {
            const isApproved = claim.status === 'APPROVED';
            const isReturned = claim.status === 'RETURNED';
            const isPending = claim.status === 'PENDING' || claim.status === 'UNDER_REVIEW';
            const isRejected = claim.status === 'REJECTED';

            return (
              <div
                key={claim.id}
                className="bg-campus-white border-2 border-campus-charcoal shadow-brutal p-6 flex flex-col justify-between space-y-5"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-campus-charcoal/10">
                    <span className="font-mono text-xs font-bold text-campus-charcoal uppercase">
                      Claim #CLM-{claim.id.toString().padStart(4, '0')}
                    </span>
                    <Badge variant={claim.status.toLowerCase() as any}>
                      {claim.status}
                    </Badge>
                  </div>

                  <h3 className="font-serif font-bold text-xl text-campus-charcoal mt-3 line-clamp-1">
                    {claim.item?.title}
                  </h3>

                  <div className="mt-2 text-xs font-mono text-campus-charcoal/60 flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    <span>Filed: {new Date(claim.created_at).toLocaleDateString()}</span>
                  </div>

                  {/* Submitted proof preview */}
                  <div className="mt-4 p-3 bg-campus-ivory border border-campus-charcoal/20 text-xs">
                    <span className="text-[10px] font-mono uppercase font-bold text-campus-charcoal/60 block mb-1">
                      Your Submitted Proof:
                    </span>
                    <p className="text-campus-charcoal/80 font-mono line-clamp-2 italic">
                      &quot;{claim.ownership_proof}&quot;
                    </p>
                  </div>

                  {/* Handover PIN Section if APPROVED */}
                  {isApproved && claim.handover && (
                    <div className="mt-4 p-4 bg-campus-lime/30 border-2 border-campus-charcoal space-y-2">
                      <div className="flex items-center space-x-1.5 text-xs font-mono font-bold text-campus-charcoal uppercase">
                        <KeyRound className="w-4 h-4 text-campus-charcoal" />
                        <span>Ready For Collection</span>
                      </div>
                      <div className="text-center py-2 bg-campus-white border border-campus-charcoal font-mono">
                        <span className="text-[10px] text-campus-charcoal/60 uppercase block">
                          Verification PIN Code
                        </span>
                        <span className="text-xl font-black text-campus-charcoal tracking-widest">
                          {claim.handover.handover_code}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-campus-charcoal/80 space-y-0.5">
                        <div className="flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1 shrink-0" />
                          <span>{claim.handover.handover_location}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Admin notes if reviewed */}
                  {claim.admin_notes && (
                    <div className="mt-3 p-2.5 bg-campus-grey text-xs font-mono text-campus-charcoal/80 border border-campus-charcoal/20">
                      <span className="font-bold uppercase text-[10px] block">Staff Note:</span>
                      <span>{claim.admin_notes}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-campus-charcoal/10 flex items-center justify-between">
                  <Link
                    to={`/items/${claim.item_id}`}
                    className="text-xs font-mono font-bold text-campus-forest hover:underline flex items-center"
                  >
                    <span>View Item</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Link>
                  <Link
                    to={`/claims/${claim.id}`}
                    className="text-xs font-mono font-bold text-campus-charcoal hover:underline"
                  >
                    View Timeline &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
