import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, ShieldCheck, KeyRound, Clock, MapPin, 
  CheckCircle2, AlertCircle, FileText, Lock, UserCheck 
} from 'lucide-react';
import { api } from '../../services/api';
import { Claim } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import confetti from 'canvas-confetti';

export const ClaimDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [claim, setClaim] = useState<Claim | null>(null);
  const [handoverInputCode, setHandoverInputCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClaim = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await api.getClaimById(parseInt(id, 10));
      setClaim(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load claim details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClaim();
  }, [id]);

  const handleVerifyHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverInputCode.trim()) return;

    setIsVerifying(true);
    setError(null);

    try {
      await api.verifyHandover(claim!.id, handoverInputCode.trim());
      confetti({ particleCount: 80, spread: 60 });
      await fetchClaim();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Verification code does not match.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-campus-charcoal border-t-campus-lime rounded-full animate-spin mb-3" />
        <p className="font-mono text-xs uppercase tracking-wider text-campus-charcoal/60">
          Loading verification record #{id}...
        </p>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <h2 className="font-serif font-bold text-2xl text-campus-charcoal">
          Claim Record Not Found
        </h2>
        <Button variant="outline" size="sm" onClick={() => navigate('/claims')}>
          Return to My Claims
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between pb-4 border-b border-campus-charcoal/20">
        <button
          onClick={() => navigate('/claims')}
          className="inline-flex items-center text-xs font-mono font-medium text-campus-charcoal hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to My Claims
        </button>
        <span className="font-mono text-xs text-campus-charcoal/60 uppercase tracking-widest">
          Claim Dossier #{claim.id}
        </span>
      </div>

      {/* Main Dossier Header */}
      <div className="bg-campus-white border-2 border-campus-charcoal p-6 sm:p-8 shadow-brutal-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-campus-charcoal/20 gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-campus-charcoal/60 block">
              Item Under Claim
            </span>
            <h1 className="font-serif font-black text-3xl sm:text-4xl text-campus-charcoal mt-1">
              {claim.item?.title}
            </h1>
            <p className="text-xs font-mono text-campus-charcoal/70 mt-1">
              Location: {claim.item?.location?.building_name} &bull; Category: {claim.item?.category?.name}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[10px] font-mono uppercase text-campus-charcoal/60 block mb-1">
              Current Claim State
            </span>
            <Badge variant={claim.status.toLowerCase() as any} size="md">
              {claim.status}
            </Badge>
          </div>
        </div>

        {/* Timeline Progression */}
        <div className="space-y-3">
          <span className="font-mono text-xs uppercase font-bold text-campus-charcoal tracking-wider block">
            Verification Lifecycle
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3 bg-campus-lime/30 border border-campus-charcoal">
              <span className="text-[10px] uppercase font-bold block text-campus-forest">1. Submitted</span>
              <span className="font-bold">{new Date(claim.created_at).toLocaleDateString()}</span>
            </div>
            <div className={`p-3 border ${
              claim.status !== 'PENDING' ? 'bg-campus-lime/30 border-campus-charcoal' : 'bg-campus-ivory border-campus-charcoal/30 opacity-60'
            }`}>
              <span className="text-[10px] uppercase font-bold block text-campus-forest">2. Under Review</span>
              <span>{claim.reviewed_at ? new Date(claim.reviewed_at).toLocaleDateString() : 'Awaiting Review'}</span>
            </div>
            <div className={`p-3 border ${
              claim.status === 'APPROVED' || claim.status === 'RETURNED' ? 'bg-campus-lime/30 border-campus-charcoal' : 'bg-campus-ivory border-campus-charcoal/30 opacity-60'
            }`}>
              <span className="text-[10px] uppercase font-bold block text-campus-forest">3. Handover PIN</span>
              <span className="font-bold">{claim.handover?.handover_code || 'Pending approval'}</span>
            </div>
            <div className={`p-3 border ${
              claim.status === 'RETURNED' ? 'bg-teal-900 text-campus-lime border-teal-950' : 'bg-campus-ivory border-campus-charcoal/30 opacity-60'
            }`}>
              <span className="text-[10px] uppercase font-bold block">4. Item Returned</span>
              <span>{claim.status === 'RETURNED' ? 'Completed' : 'Pending Return'}</span>
            </div>
          </div>
        </div>

        {/* Handover PIN Display Box */}
        {claim.status === 'APPROVED' && claim.handover && (
          <div className="bg-campus-lime/40 border-2 border-campus-charcoal p-6 space-y-4">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-campus-charcoal uppercase">
              <KeyRound className="w-5 h-5 text-campus-charcoal" />
              <span>Approved For Handover — Collection Instructions</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="p-5 bg-campus-white border-2 border-campus-charcoal text-center shadow-brutal">
                <span className="text-xs font-mono uppercase text-campus-charcoal/70 block mb-1">
                  Your Physical Verification Code
                </span>
                <span className="text-3xl font-mono font-black text-campus-charcoal tracking-widest block">
                  {claim.handover.handover_code}
                </span>
                <span className="text-[11px] font-mono text-campus-charcoal/60 mt-2 block">
                  Show this code to the campus safety desk officer.
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-start space-x-2 text-campus-charcoal">
                  <MapPin className="w-4 h-4 text-campus-forest shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Designated Handover Location:</strong>
                    <span>{claim.handover.handover_location}</span>
                  </div>
                </div>
                <div className="p-3 bg-campus-white border border-campus-charcoal/20 text-[11px] leading-relaxed font-sans text-campus-charcoal/80">
                  Please bring your university student or faculty ID card along with this verification PIN code. Campus officers verify your identity before handing over the item.
                </div>
              </div>
            </div>

            {/* Officer Verification Input Form (if viewed by staff/admin) */}
            {isAdmin && (
              <form onSubmit={handleVerifyHandover} className="mt-4 pt-4 border-t-2 border-campus-charcoal space-y-3">
                <span className="font-mono text-xs font-bold uppercase text-campus-forest block">
                  Security Staff Action // Verify & Complete Handover
                </span>
                {error && <p className="text-xs font-mono text-red-600">{error}</p>}
                <div className="flex gap-2 max-w-md">
                  <input
                    type="text"
                    value={handoverInputCode}
                    onChange={(e) => setHandoverInputCode(e.target.value)}
                    placeholder="Enter student code (e.g. CF-XXXX)"
                    className="flex-1 bg-campus-white border border-campus-charcoal px-3 py-2 text-sm font-mono uppercase"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isVerifying}
                  >
                    Confirm & Mark Returned
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Returned Success Box */}
        {claim.status === 'RETURNED' && (
          <div className="bg-teal-50 border-2 border-teal-800 p-6 flex items-start space-x-4">
            <CheckCircle2 className="w-8 h-8 text-teal-800 shrink-0" />
            <div className="space-y-1">
              <h4 className="font-serif font-bold text-xl text-teal-950">
                Item Officially Returned
              </h4>
              <p className="text-xs text-teal-900 leading-relaxed font-sans">
                The verification code was authenticated and this property has been safely transferred back to the verified owner. This file is now closed and logged in campus audit records.
              </p>
            </div>
          </div>
        )}

        {/* Submitted Proof Details */}
        <div className="border-t border-campus-charcoal/20 pt-6 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase text-campus-charcoal">
            <Lock className="w-4 h-4 text-campus-forest" />
            <span>Private Ownership Explanation</span>
          </div>
          <div className="p-4 bg-campus-ivory border border-campus-charcoal/20 text-xs font-mono leading-relaxed text-campus-charcoal/80 whitespace-pre-line">
            {claim.ownership_proof}
          </div>
          {claim.proof_image_url && (
            <div className="pt-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-campus-charcoal/60 block mb-2">
                Attached Proof Photo:
              </span>
              <img
                src={claim.proof_image_url}
                alt="Proof attachment"
                className="w-48 h-48 object-cover border-2 border-campus-charcoal"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
