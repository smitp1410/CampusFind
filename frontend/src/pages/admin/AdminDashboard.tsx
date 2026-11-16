import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, FileText, CheckCircle2, Clock, 
  AlertTriangle, Eye, ArrowUpRight, ShieldAlert, KeyRound, 
  Trash2, RefreshCw, BarChart3, History, Check, X, Filter 
} from 'lucide-react';
import { api } from '../../services/api';
import { Item, Claim, User, AdminAnalytics } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Textarea, Input } from '../../components/ui/Input';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'claims' | 'items' | 'users' | 'audit'>('overview');
  
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('');
  const [overviewFilter, setOverviewFilter] = useState<'ALL' | 'PENDING' | 'LOST' | 'FOUND'>('ALL');
  const [itemSearchQuery, setItemSearchQuery] = useState('');

  // Claim review modal state
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [claimActionStatus, setClaimActionStatus] = useState<string>('APPROVED');
  const [adminNote, setAdminNote] = useState('');
  const [handoverLocation, setHandoverLocation] = useState('Main Campus Security Post, Window 1');
  const [isUpdatingClaim, setIsUpdatingClaim] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const fetchAllAdminData = async (showSpinner = false) => {
    if (showSpinner) setIsLoading(true);
    try {
      const [statsRes, analyticsRes, claimsRes, itemsRes, usersRes, logsRes] = await Promise.all([
        api.getAdminStats(),
        api.getPlatformAnalytics(),
        api.getAdminClaims(),
        api.getAdminItems(),
        api.getAdminUsers(),
        api.getAuditLogs(50),
      ]);
      setStats(statsRes);
      setAnalytics(analyticsRes);
      setClaims(claimsRes);
      setItems(itemsRes);
      setUsers(usersRes);
      setAuditLogs(logsRes);
      setLastSyncedTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      if (showSpinner) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAdminData(true);
    // Real-time live auto-sync polling every 4 seconds
    const interval = setInterval(() => {
      fetchAllAdminData(false);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleDirectApproveItem = async (itemId: number, title: string) => {
    try {
      await api.updateItemStatusAdmin(itemId, 'VERIFIED');
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, status: 'VERIFIED' as any } : i))
      );
      showNotification(`Item #${itemId} ("${title}") verified and approved!`);
      fetchAllAdminData(false);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to verify item.');
    }
  };

  const handleDirectApproveClaim = async (claim: Claim) => {
    try {
      await api.updateClaimStatus(claim.id, {
        status: 'APPROVED',
        admin_notes: 'Ownership verified & approved by Campus Administrator.',
        handover_location: 'Main Campus Security Post, Window 1',
      });
      showNotification(`Claim #CLM-${claim.id} for "${claim.item?.title}" APPROVED! Handover PIN generated.`);
      fetchAllAdminData(false);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to approve claim.');
    }
  };

  const handleClaimStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim) return;

    setIsUpdatingClaim(true);
    try {
      await api.updateClaimStatus(selectedClaim.id, {
        status: claimActionStatus,
        admin_notes: adminNote,
        handover_location: handoverLocation,
      });
      showNotification(`Claim #CLM-${selectedClaim.id} updated to ${claimActionStatus}!`);
      setSelectedClaim(null);
      setAdminNote('');
      await fetchAllAdminData(false);
    } catch (err) {
      console.error('Failed to update claim:', err);
    } finally {
      setIsUpdatingClaim(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await api.updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole as any } : u))
      );
      showNotification(`User role updated to ${newRole}!`);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update user role.');
    }
  };

  const handleItemStatusChange = async (itemId: number, newStatus: string) => {
    try {
      await api.updateItemStatusAdmin(itemId, newStatus);
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, status: newStatus as any } : i))
      );
      showNotification(`Item #${itemId} status updated to ${newStatus}!`);
    } catch (err) {
      console.error('Failed to update item status:', err);
    }
  };

  // Filtered items for overview and moderation
  const filteredOverviewItems = items.filter((it) => {
    if (overviewFilter === 'PENDING') return it.status === 'PENDING' || it.status === 'OPEN';
    if (overviewFilter === 'LOST') return it.type === 'LOST';
    if (overviewFilter === 'FOUND') return it.type === 'FOUND';
    return true;
  });

  const pendingItemsCount = items.filter((i) => i.status === 'PENDING' || i.status === 'OPEN').length;
  const pendingClaimsCount = claims.filter((c) => c.status === 'PENDING' || c.status === 'UNDER_REVIEW').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Toast alert */}
      {actionSuccessMsg && (
        <div className="bg-campus-lime border-2 border-campus-charcoal p-4 shadow-brutal flex items-center justify-between animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center space-x-2 font-mono text-xs font-bold text-campus-charcoal">
            <CheckCircle2 className="w-4 h-4 text-campus-forest shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-campus-charcoal hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Admin Title Bar */}
      <div className="border-b-2 border-campus-charcoal pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-campus-forest text-campus-lime font-mono text-xs font-bold uppercase px-2.5 py-0.5 border border-campus-charcoal">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Campus Safety Command & Control</span>
          </div>
          <h1 className="font-serif font-black text-3xl sm:text-5xl text-campus-charcoal mt-1">
            Administrative Operations
          </h1>
          <p className="text-xs sm:text-sm text-campus-charcoal/70 font-sans mt-1">
            Institutional oversight for claim verification, property moderation, and ownership approvals
          </p>
        </div>

        {/* Live sync status & refresh */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="flex items-center space-x-1.5 bg-campus-lime/30 text-campus-forest text-[11px] font-mono px-3 py-1.5 border border-campus-forest font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            <span>LIVE SYNC ACTIVE</span>
            {lastSyncedTime && <span className="text-[10px] text-campus-charcoal/60 ml-1">({lastSyncedTime})</span>}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAllAdminData(true)}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh Live
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b-2 border-campus-charcoal overflow-x-auto space-x-2 font-mono text-xs uppercase tracking-wider">
        {[
          { key: 'overview', label: `Dashboard Overview (${pendingItemsCount + pendingClaimsCount} Action Required)`, icon: BarChart3 },
          { key: 'claims', label: `Claims Verification (${pendingClaimsCount} Pending)`, icon: KeyRound },
          { key: 'items', label: `Item Moderation (${items.length})`, icon: FileText },
          { key: 'users', label: `User Registry (${users.length})`, icon: Users },
          { key: 'audit', label: 'Security Audit Logs', icon: History },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-3 border-t-2 border-x-2 border-campus-charcoal font-bold flex items-center space-x-2 -mb-[2px] transition-colors shrink-0 ${
              activeTab === tab.key
                ? 'bg-campus-charcoal text-campus-lime border-b-2 border-b-campus-charcoal'
                : 'bg-campus-white text-campus-charcoal hover:bg-campus-grey border-b-2 border-b-transparent'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-campus-white border-2 border-campus-charcoal p-5 shadow-brutal">
              <span className="font-mono text-[10px] uppercase text-campus-charcoal/60 block mb-1">
                Institutional Recovery Rate
              </span>
              <span className="font-serif font-black text-3xl sm:text-4xl text-campus-forest">
                {stats?.recovery_rate || 0}%
              </span>
              <span className="text-[11px] font-mono text-campus-charcoal/60 block mt-1">
                {stats?.total_recovered || 0} items returned to owners
              </span>
            </div>

            <div className="bg-campus-white border-2 border-campus-charcoal p-5 shadow-brutal">
              <span className="font-mono text-[10px] uppercase text-campus-charcoal/60 block mb-1">
                Active Catalog Volume
              </span>
              <span className="font-serif font-black text-3xl sm:text-4xl text-campus-charcoal">
                {(stats?.total_lost || 0) + (stats?.total_found || 0)}
              </span>
              <span className="text-[11px] font-mono text-campus-charcoal/60 block mt-1">
                {stats?.total_lost || 0} Lost / {stats?.total_found || 0} Found
              </span>
            </div>

            <div className="bg-campus-white border-2 border-campus-charcoal p-5 shadow-brutal">
              <span className="font-mono text-[10px] uppercase text-amber-800 font-bold block mb-1">
                Pending Claim Reviews
              </span>
              <span className="font-serif font-black text-3xl sm:text-4xl text-amber-600">
                {stats?.pending_claims || pendingClaimsCount}
              </span>
              <span className="text-[11px] font-mono text-campus-charcoal/60 block mt-1">
                Awaiting staff ownership approval
              </span>
            </div>

            <div className="bg-campus-forest text-campus-ivory border-2 border-campus-charcoal p-5 shadow-brutal">
              <span className="font-mono text-[10px] uppercase text-campus-lime block mb-1">
                Verified Users
              </span>
              <span className="font-serif font-black text-3xl sm:text-4xl text-campus-lime">
                {stats?.total_users || users.length}
              </span>
              <span className="text-[11px] font-mono text-campus-ivory/70 block mt-1">
                Students, faculty & staff
              </span>
            </div>
          </div>

          {/* REAL-TIME INCOMING REPORTS QUEUE */}
          <div className="bg-campus-white border-2 border-campus-charcoal shadow-brutal p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-campus-charcoal/20 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="font-serif font-bold text-2xl text-campus-charcoal">
                    Live Incoming Reports & Ownership Verification
                  </h2>
                  <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono bg-campus-forest text-campus-lime uppercase font-bold">
                    Real-time feed
                  </span>
                </div>
                <p className="text-xs font-sans text-campus-charcoal/70 mt-1">
                  Latest lost and found reports submitted by students and faculty. Verify submissions with one click to approve and publish.
                </p>
              </div>

              {/* Filter pills */}
              <div className="inline-flex border border-campus-charcoal bg-campus-ivory p-1 font-mono text-xs uppercase tracking-wider shrink-0">
                <button
                  onClick={() => setOverviewFilter('ALL')}
                  className={`px-3 py-1 font-bold transition-colors ${
                    overviewFilter === 'ALL' ? 'bg-campus-charcoal text-campus-lime' : 'text-campus-charcoal hover:bg-campus-grey'
                  }`}
                >
                  All ({items.length})
                </button>
                <button
                  onClick={() => setOverviewFilter('PENDING')}
                  className={`px-3 py-1 font-bold transition-colors ${
                    overviewFilter === 'PENDING' ? 'bg-amber-600 text-white' : 'text-amber-800 hover:bg-campus-grey'
                  }`}
                >
                  Pending ({pendingItemsCount})
                </button>
                <button
                  onClick={() => setOverviewFilter('LOST')}
                  className={`px-3 py-1 font-bold transition-colors ${
                    overviewFilter === 'LOST' ? 'bg-campus-forest text-campus-ivory' : 'text-campus-charcoal hover:bg-campus-grey'
                  }`}
                >
                  Lost ({items.filter((i) => i.type === 'LOST').length})
                </button>
                <button
                  onClick={() => setOverviewFilter('FOUND')}
                  className={`px-3 py-1 font-bold transition-colors ${
                    overviewFilter === 'FOUND' ? 'bg-campus-charcoal text-campus-lime' : 'text-campus-charcoal hover:bg-campus-grey'
                  }`}
                >
                  Found ({items.filter((i) => i.type === 'FOUND').length})
                </button>
              </div>
            </div>

            {/* Reports Table */}
            {filteredOverviewItems.length === 0 ? (
              <div className="py-12 text-center space-y-2 border border-dashed border-campus-charcoal/30">
                <FileText className="w-8 h-8 text-campus-charcoal/30 mx-auto" />
                <p className="font-mono text-xs uppercase tracking-wider text-campus-charcoal/60">
                  No incident reports match this filter.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono divide-y divide-campus-charcoal/20">
                  <thead className="bg-campus-ivory text-campus-charcoal uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-3">Item</th>
                      <th className="py-3 px-3">Type</th>
                      <th className="py-3 px-3">Photo</th>
                      <th className="py-3 px-3">Location & Date</th>
                      <th className="py-3 px-3">Reporter</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Verification Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-campus-charcoal/10 font-sans">
                    {filteredOverviewItems.slice(0, 10).map((it) => {
                      const isPending = it.status === 'PENDING' || it.status === 'OPEN';
                      const isVerified = it.status === 'VERIFIED';
                      const thumb = it.images && it.images.length > 0 ? it.images[0].image_url : null;
                      const timeStr = new Date(it.created_at).toLocaleString();

                      return (
                        <tr key={it.id} className="hover:bg-campus-grey/40">
                          <td className="py-3.5 px-3 font-mono">
                            <span className="font-bold text-campus-forest">#{it.id}</span>
                            <div className="font-bold text-campus-charcoal text-sm mt-0.5">{it.title}</div>
                            <div className="text-[11px] font-mono text-campus-charcoal/60">
                              {it.category?.name} &bull; {it.color}
                            </div>
                          </td>
                          <td className="py-3.5 px-3 font-mono">
                            <Badge variant={it.type === 'LOST' ? 'lost' : 'found'} size="sm">
                              {it.type}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-3">
                            {thumb ? (
                              <img src={thumb} alt={it.title} className="w-10 h-10 object-cover border border-campus-charcoal" />
                            ) : (
                              <div className="w-10 h-10 bg-campus-grey flex items-center justify-center text-[10px] font-mono text-campus-charcoal/40 border border-campus-charcoal/30">
                                No img
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-3 font-mono text-xs">
                            <div className="font-bold text-campus-charcoal">{it.location?.building_name}</div>
                            <div className="text-[10px] text-campus-charcoal/60">{timeStr}</div>
                          </td>
                          <td className="py-3.5 px-3 font-mono text-xs">
                            <div className="font-bold text-campus-charcoal">{it.reporter?.full_name || 'Anonymous'}</div>
                            <div className="text-[10px] text-campus-charcoal/60">{it.reporter?.email}</div>
                            <span className="inline-block text-[9px] uppercase px-1.5 py-0.2 bg-campus-grey border border-campus-charcoal/20 mt-0.5">
                              {it.reporter?.role || 'User'}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 font-mono">
                            <Badge variant={it.status.toLowerCase() as any} size="sm">
                              {it.status === 'PENDING' ? 'Pending Review' : it.status}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-3 text-right space-x-2 font-mono">
                            {isPending && (
                              <Button
                                variant="lime"
                                size="sm"
                                onClick={() => handleDirectApproveItem(it.id, it.title)}
                                leftIcon={<Check className="w-3.5 h-3.5 text-campus-charcoal" />}
                              >
                                Approve & Verify
                              </Button>
                            )}
                            {isVerified && (
                              <span className="inline-flex items-center text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 border border-emerald-400">
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                                Verified & Live
                              </span>
                            )}
                            <select
                              value={it.status}
                              onChange={(e) => handleItemStatusChange(it.id, e.target.value)}
                              className="bg-campus-ivory border border-campus-charcoal text-[11px] px-2 py-1 uppercase"
                            >
                              <option value="PENDING">Pending</option>
                              <option value="VERIFIED">Verified</option>
                              <option value="OPEN">Open</option>
                              <option value="MATCHED">Matched</option>
                              <option value="CLAIMED">Claimed</option>
                              <option value="RESOLVED">Resolved</option>
                              <option value="CLOSED">Closed</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* PENDING CLAIMS VERIFICATION QUEUE */}
          <div className="bg-campus-white border-2 border-campus-charcoal shadow-brutal p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-campus-charcoal/20 pb-4">
              <div>
                <h3 className="font-serif font-bold text-2xl text-campus-charcoal">
                  Ownership Claims Verification Pipeline
                </h3>
                <p className="text-xs font-sans text-campus-charcoal/70 mt-1">
                  Students claiming found property. Verify their ownership proofs and approve to generate secure handover PINs.
                </p>
              </div>
              <span className="font-mono text-xs bg-amber-100 text-amber-900 border border-amber-400 font-bold px-2.5 py-1">
                {pendingClaimsCount} Pending Decisions
              </span>
            </div>

            {claims.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-campus-charcoal/60">
                No active ownership claims filed yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono divide-y divide-campus-charcoal/20">
                  <thead className="bg-campus-ivory text-campus-charcoal uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-3">Claim ID</th>
                      <th className="py-3 px-3">Claimed Item</th>
                      <th className="py-3 px-3">Claimant</th>
                      <th className="py-3 px-3">Ownership Proof</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Handover PIN</th>
                      <th className="py-3 px-3 text-right">Approval Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-campus-charcoal/10 font-sans">
                    {claims.slice(0, 6).map((claim) => {
                      const isPendingClaim = claim.status === 'PENDING' || claim.status === 'UNDER_REVIEW';
                      return (
                        <tr key={claim.id} className="hover:bg-campus-grey/40">
                          <td className="py-3 px-3 font-mono font-bold">#CLM-{claim.id}</td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-campus-charcoal">{claim.item?.title}</div>
                            <div className="text-[10px] font-mono text-campus-charcoal/60">
                              {claim.item?.location?.building_name}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-campus-charcoal">{claim.claimant?.full_name}</div>
                            <div className="text-[10px] font-mono text-campus-charcoal/60">{claim.claimant?.email}</div>
                          </td>
                          <td className="py-3 px-3 max-w-xs">
                            <p className="line-clamp-2 text-xs font-mono text-campus-charcoal/80 bg-campus-ivory p-1.5 border border-campus-charcoal/20">
                              {claim.ownership_proof}
                            </p>
                          </td>
                          <td className="py-3 px-3 font-mono">
                            <Badge variant={claim.status.toLowerCase() as any} size="sm">
                              {claim.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-campus-forest">
                            {claim.handover?.handover_code || '—'}
                          </td>
                          <td className="py-3 px-3 text-right space-x-2">
                            {isPendingClaim && (
                              <Button
                                variant="lime"
                                size="sm"
                                onClick={() => handleDirectApproveClaim(claim)}
                              >
                                Approve Ownership
                              </Button>
                            )}
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setSelectedClaim(claim);
                                setClaimActionStatus(claim.status === 'PENDING' ? 'APPROVED' : claim.status);
                                setAdminNote(claim.admin_notes || '');
                              }}
                            >
                              Review
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Hotspots & Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-campus-white border-2 border-campus-charcoal p-6 shadow-brutal space-y-4">
              <h3 className="font-serif font-bold text-xl text-campus-charcoal border-b border-campus-charcoal/10 pb-2">
                Campus Incident Hotspots
              </h3>
              <div className="space-y-3 font-mono text-xs">
                {analytics?.location_hotspots.map((loc) => (
                  <div key={loc.location_id} className="flex items-center justify-between p-2.5 bg-campus-ivory border border-campus-charcoal/20">
                    <div>
                      <strong className="block text-campus-charcoal">{loc.building_name}</strong>
                      <span className="text-[10px] text-campus-charcoal/60">{loc.campus_name}</span>
                    </div>
                    <span className="bg-campus-charcoal text-campus-lime font-bold px-2 py-1">
                      {loc.total_reports} Reports
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-campus-white border-2 border-campus-charcoal p-6 shadow-brutal space-y-4">
              <h3 className="font-serif font-bold text-xl text-campus-charcoal border-b border-campus-charcoal/10 pb-2">
                Inventory by Category
              </h3>
              <div className="space-y-3 font-mono text-xs">
                {analytics?.category_breakdown.map((cat) => (
                  <div key={cat.category_id} className="flex items-center justify-between p-2.5 bg-campus-ivory border border-campus-charcoal/20">
                    <span className="font-bold text-campus-charcoal">{cat.category_name}</span>
                    <div className="space-x-3 text-campus-charcoal/80">
                      <span>{cat.lost_count} Lost</span>
                      <span>&bull;</span>
                      <span>{cat.found_count} Found</span>
                      <span>&bull;</span>
                      <span className="text-campus-forest font-bold">{cat.recovered_count} Returned</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CLAIMS VERIFICATION */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          <div className="bg-campus-white border-2 border-campus-charcoal shadow-brutal overflow-x-auto">
            <table className="w-full text-left text-xs font-mono divide-y divide-campus-charcoal/20">
              <thead className="bg-campus-ivory text-campus-charcoal uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Claim ID</th>
                  <th className="py-3 px-4">Item Under Claim</th>
                  <th className="py-3 px-4">Claimant</th>
                  <th className="py-3 px-4">Ownership Proof</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">PIN Code</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-campus-charcoal/10 font-sans">
                {claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-campus-grey/40">
                    <td className="py-3.5 px-4 font-mono font-bold">
                      #CLM-{claim.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-campus-charcoal">{claim.item?.title}</div>
                      <div className="text-[11px] font-mono text-campus-charcoal/60">
                        {claim.item?.location?.building_name}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-campus-charcoal">{claim.claimant?.full_name}</div>
                      <div className="text-[11px] font-mono text-campus-charcoal/60">{claim.claimant?.email}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="line-clamp-2 text-xs font-mono text-campus-charcoal/80 bg-campus-ivory p-1.5 border border-campus-charcoal/20">
                        {claim.ownership_proof}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <Badge variant={claim.status.toLowerCase() as any} size="sm">
                        {claim.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-campus-forest">
                      {claim.handover?.handover_code || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {(claim.status === 'PENDING' || claim.status === 'UNDER_REVIEW') && (
                        <Button
                          variant="lime"
                          size="sm"
                          onClick={() => handleDirectApproveClaim(claim)}
                        >
                          Approve
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedClaim(claim);
                          setClaimActionStatus(claim.status === 'PENDING' ? 'APPROVED' : claim.status);
                          setAdminNote(claim.admin_notes || '');
                        }}
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ITEM MODERATION */}
      {activeTab === 'items' && (
        <div className="bg-campus-white border-2 border-campus-charcoal shadow-brutal overflow-x-auto">
          <table className="w-full text-left text-xs font-mono divide-y divide-campus-charcoal/20">
            <thead className="bg-campus-ivory text-campus-charcoal uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Title & Details</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Reporter</th>
                <th className="py-3 px-4 text-right">Moderation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-campus-charcoal/10 font-sans">
              {items.map((it) => {
                const isPending = it.status === 'PENDING' || it.status === 'OPEN';
                return (
                  <tr key={it.id} className="hover:bg-campus-grey/40">
                    <td className="py-3.5 px-4 font-mono font-bold">#{it.id}</td>
                    <td className="py-3.5 px-4 font-mono">
                      <Badge variant={it.type === 'LOST' ? 'lost' : 'found'} size="sm">
                        {it.type}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-campus-charcoal">{it.title}</div>
                      <div className="text-[11px] font-mono text-campus-charcoal/60">
                        {it.category?.name} &bull; {it.color}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs">
                      {it.location?.building_name}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <Badge variant={it.status.toLowerCase() as any} size="sm">
                        {it.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-campus-charcoal/80">
                      {it.reporter?.email}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2 font-mono">
                      {isPending && (
                        <Button
                          variant="lime"
                          size="sm"
                          onClick={() => handleDirectApproveItem(it.id, it.title)}
                        >
                          Verify & Approve
                        </Button>
                      )}
                      <select
                        value={it.status}
                        onChange={(e) => handleItemStatusChange(it.id, e.target.value)}
                        className="bg-campus-ivory border border-campus-charcoal text-[11px] px-2 py-1 uppercase"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="VERIFIED">Verified</option>
                        <option value="OPEN">Open</option>
                        <option value="MATCHED">Matched</option>
                        <option value="CLAIMED">Claimed</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-campus-white border-2 border-campus-charcoal shadow-brutal overflow-x-auto">
          <table className="w-full text-left text-xs font-mono divide-y divide-campus-charcoal/20">
            <thead className="bg-campus-ivory text-campus-charcoal uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">College Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">ID & Department</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Role Assignment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-campus-charcoal/10 font-sans">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-campus-grey/40">
                  <td className="py-3.5 px-4 font-bold text-campus-charcoal">
                    {u.full_name}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-campus-forest">
                    {u.email}
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className="uppercase text-[11px] font-bold px-2 py-0.5 bg-campus-grey border border-campus-charcoal/30">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-campus-charcoal/70">
                    {u.student_faculty_id || 'N/A'} &bull; {u.department || 'N/A'}
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className={`text-[10px] font-bold px-2 py-0.5 ${u.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                      {u.is_active ? 'ACTIVE' : 'SUSPENDED'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="bg-campus-ivory border border-campus-charcoal text-[11px] px-2 py-1 uppercase"
                    >
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-campus-white border-2 border-campus-charcoal shadow-brutal p-6 space-y-4">
          <h3 className="font-serif font-bold text-2xl text-campus-charcoal">
            Institutional Audit Trail
          </h3>
          <p className="text-xs font-sans text-campus-charcoal/70">
            Immutable system event logs recorded for compliance, chain-of-custody, and security oversight.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono divide-y divide-campus-charcoal/20">
              <thead className="bg-campus-ivory text-campus-charcoal uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Event ID</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-campus-charcoal/10 font-sans">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-campus-grey/40">
                    <td className="py-3 px-4 font-mono font-bold">#{log.id}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-campus-charcoal/70">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-campus-forest">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      {log.target_type} #{log.target_id}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-campus-charcoal">
                      {log.user_email}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-campus-charcoal/80 max-w-md">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Claim Review Modal */}
      {selectedClaim && (
        <Modal
          isOpen={!!selectedClaim}
          onClose={() => setSelectedClaim(null)}
          title={`Review Ownership Claim: #CLM-${selectedClaim.id}`}
        >
          <form onSubmit={handleClaimStatusSubmit} className="space-y-6">
            <div className="bg-campus-ivory border border-campus-charcoal/30 p-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-campus-charcoal/60">Claimant:</span>
                <strong className="text-campus-charcoal">{selectedClaim.claimant?.full_name} ({selectedClaim.claimant?.email})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-campus-charcoal/60">Item Claimed:</span>
                <strong className="text-campus-charcoal">{selectedClaim.item?.title} (#{selectedClaim.item?.id})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-campus-charcoal/60">Location Found:</span>
                <span>{selectedClaim.item?.location?.building_name}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-campus-charcoal">
                Claimant's Submitted Ownership Proof:
              </label>
              <div className="p-3 bg-campus-white border-2 border-campus-charcoal font-sans text-xs leading-relaxed text-campus-charcoal">
                {selectedClaim.ownership_proof}
              </div>
              {selectedClaim.proof_image_url && (
                <div className="pt-2">
                  <span className="block text-[11px] font-mono text-campus-charcoal/60 mb-1">Attached Proof Document:</span>
                  <img
                    src={selectedClaim.proof_image_url}
                    alt="Proof"
                    className="w-40 h-40 object-cover border-2 border-campus-charcoal"
                  />
                </div>
              )}
            </div>

            {/* Action Decision Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-campus-charcoal">
                Super Admin Verification Action *
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setClaimActionStatus('APPROVED')}
                  className={`p-2.5 border-2 text-center font-bold transition-all ${
                    claimActionStatus === 'APPROVED'
                      ? 'bg-campus-lime border-campus-charcoal text-campus-charcoal shadow-brutal'
                      : 'bg-campus-white border-campus-charcoal/30 hover:border-campus-charcoal'
                  }`}
                >
                  ✓ Approve Ownership
                </button>
                <button
                  type="button"
                  onClick={() => setClaimActionStatus('UNDER_REVIEW')}
                  className={`p-2.5 border-2 text-center font-bold transition-all ${
                    claimActionStatus === 'UNDER_REVIEW'
                      ? 'bg-amber-200 border-campus-charcoal text-campus-charcoal shadow-brutal'
                      : 'bg-campus-white border-campus-charcoal/30 hover:border-campus-charcoal'
                  }`}
                >
                  ⏳ Request Info
                </button>
                <button
                  type="button"
                  onClick={() => setClaimActionStatus('REJECTED')}
                  className={`p-2.5 border-2 text-center font-bold transition-all ${
                    claimActionStatus === 'REJECTED'
                      ? 'bg-red-200 border-campus-charcoal text-red-900 shadow-brutal'
                      : 'bg-campus-white border-campus-charcoal/30 hover:border-campus-charcoal'
                  }`}
                >
                  ✕ Reject Claim
                </button>
                <button
                  type="button"
                  onClick={() => setClaimActionStatus('RETURNED')}
                  className={`p-2.5 border-2 text-center font-bold transition-all ${
                    claimActionStatus === 'RETURNED'
                      ? 'bg-teal-800 text-campus-lime border-campus-charcoal shadow-brutal'
                      : 'bg-campus-white border-campus-charcoal/30 hover:border-campus-charcoal'
                  }`}
                >
                  🤝 Mark Returned
                </button>
              </div>
            </div>

            {claimActionStatus === 'APPROVED' && (
              <Input
                label="Physical Handover Post & Instructions"
                value={handoverLocation}
                onChange={(e) => setHandoverLocation(e.target.value)}
                placeholder="e.g. Main Campus Security Post, Window 1"
                helperText="A unique verification PIN code will be automatically dispatched to the student's dashboard."
              />
            )}

            <Textarea
              label="Staff Reviewer Feedback Note (Optional)"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="e.g. 'Proof verified. MacBook lockscreen wallpaper and architectural sticker match item.'"
              rows={2}
            />

            <div className="pt-2 border-t border-campus-charcoal/20 flex justify-end space-x-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedClaim(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="lime" size="md" isLoading={isUpdatingClaim}>
                Confirm Decision & Execute Protocol
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
