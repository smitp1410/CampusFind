import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, FileText, CheckCircle2, Clock, 
  AlertTriangle, Eye, ArrowUpRight, ShieldAlert, KeyRound, 
  Trash2, RefreshCw, BarChart3, History 
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

  // Claim review modal state
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [claimActionStatus, setClaimActionStatus] = useState<string>('APPROVED');
  const [adminNote, setAdminNote] = useState('');
  const [handoverLocation, setHandoverLocation] = useState('Main Campus Security Post, Window 1');
  const [isUpdatingClaim, setIsUpdatingClaim] = useState(false);

  const fetchAllAdminData = async () => {
    setIsLoading(true);
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
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAdminData();
  }, []);

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
      setSelectedClaim(null);
      setAdminNote('');
      await fetchAllAdminData();
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
    } catch (err) {
      console.error('Failed to update item status:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
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
            Institutional oversight for claim verification, property moderation, and audit compliance
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchAllAdminData}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Live Data
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b-2 border-campus-charcoal overflow-x-auto space-x-2 font-mono text-xs uppercase tracking-wider">
        {[
          { key: 'overview', label: 'Dashboard Overview', icon: BarChart3 },
          { key: 'claims', label: `Claims Verification (${claims.filter(c => c.status === 'PENDING').length} Pending)`, icon: KeyRound },
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
                {stats?.total_recovered} items returned to owners
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
                {stats?.total_lost} Lost / {stats?.total_found} Found
              </span>
            </div>

            <div className="bg-campus-white border-2 border-campus-charcoal p-5 shadow-brutal">
              <span className="font-mono text-[10px] uppercase text-campus-charcoal/60 block mb-1">
                Pending Claim Reviews
              </span>
              <span className="font-serif font-black text-3xl sm:text-4xl text-amber-600">
                {stats?.pending_claims || 0}
              </span>
              <span className="text-[11px] font-mono text-campus-charcoal/60 block mt-1">
                Awaiting staff decision
              </span>
            </div>

            <div className="bg-campus-forest text-campus-ivory border-2 border-campus-charcoal p-5 shadow-brutal">
              <span className="font-mono text-[10px] uppercase text-campus-lime block mb-1">
                Verified Users
              </span>
              <span className="font-serif font-black text-3xl sm:text-4xl text-campus-lime">
                {stats?.total_users || 0}
              </span>
              <span className="text-[11px] font-mono text-campus-ivory/70 block mt-1">
                Students, faculty & staff
              </span>
            </div>
          </div>

          {/* Hotspots & Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Campus Hotspots */}
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

            {/* Category Breakdown */}
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
                    <td className="py-3.5 px-4 text-right">
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
                <th className="py-3 px-4 text-right">Change Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-campus-charcoal/10 font-sans">
              {items.map((it) => (
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
                  <td className="py-3.5 px-4 text-right font-mono">
                    <select
                      value={it.status}
                      onChange={(e) => handleItemStatusChange(it.id, e.target.value)}
                      className="bg-campus-ivory border border-campus-charcoal text-[11px] px-2 py-1 uppercase"
                    >
                      <option value="OPEN">Open</option>
                      <option value="MATCHED">Matched</option>
                      <option value="CLAIMED">Claimed</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </td>
                </tr>
              ))}
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
                  <td className="py-3.5 px-4 font-mono text-xs text-campus-charcoal/80">
                    {u.email}
                  </td>
                  <td className="py-3.5 px-4 font-mono uppercase font-bold text-campus-forest">
                    {u.role}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-campus-charcoal/70">
                    {u.student_faculty_id || '—'} &bull; {u.department || '—'}
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className={`px-2 py-0.5 text-[10px] uppercase font-bold ${
                      u.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {u.is_active ? 'Active' : 'Suspended'}
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
                      <option value="admin">Staff Admin</option>
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
        <div className="bg-campus-white border-2 border-campus-charcoal shadow-brutal overflow-x-auto">
          <table className="w-full text-left text-xs font-mono divide-y divide-campus-charcoal/20">
            <thead className="bg-campus-ivory text-campus-charcoal uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Log ID</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-campus-charcoal/10 font-sans">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-campus-grey/40">
                  <td className="py-3 px-4 font-mono text-campus-charcoal/60">#{log.id}</td>
                  <td className="py-3 px-4 font-mono font-bold text-campus-charcoal uppercase">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 font-mono uppercase text-campus-forest text-[11px]">
                    {log.target_type} #{log.target_id}
                  </td>
                  <td className="py-3 px-4 text-xs font-sans text-campus-charcoal/80">
                    {log.details}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-campus-charcoal/70">
                    {log.user_email}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-[11px] text-campus-charcoal/60">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Claim Moderation Modal */}
      {selectedClaim && (
        <Modal
          isOpen={Boolean(selectedClaim)}
          onClose={() => setSelectedClaim(null)}
          title={`Verify Claim #CLM-${selectedClaim.id}`}
          subtitle={`Property: ${selectedClaim.item?.title}`}
          maxWidth="xl"
        >
          <form onSubmit={handleClaimStatusSubmit} className="space-y-5">
            {/* Claimant & Item Header Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-campus-white border-2 border-campus-charcoal space-y-1 font-mono text-xs shadow-sm">
                <span className="text-[10px] uppercase font-bold text-campus-forest block">
                  Claimant Identity (Verified):
                </span>
                <p className="text-campus-charcoal font-bold text-sm">
                  {selectedClaim.claimant?.full_name}
                </p>
                <p className="text-campus-charcoal/80">
                  {selectedClaim.claimant?.email}
                </p>
                <p className="text-campus-charcoal/60 text-[11px]">
                  Dept: {selectedClaim.claimant?.department || 'N/A'} &bull; ID: {selectedClaim.claimant?.student_faculty_id || 'N/A'}
                </p>
              </div>

              <div className="p-3.5 bg-campus-white border-2 border-campus-charcoal space-y-1 font-mono text-xs shadow-sm">
                <span className="text-[10px] uppercase font-bold text-campus-charcoal/60 block">
                  Found Item Custody:
                </span>
                <p className="text-campus-charcoal font-bold text-sm line-clamp-1">
                  {selectedClaim.item?.title}
                </p>
                <p className="text-campus-charcoal/70">
                  Location: {selectedClaim.item?.location?.building_name} ({selectedClaim.item?.floor || 'Floor N/A'})
                </p>
                <p className="text-campus-forest font-semibold text-[11px]">
                  Storage Post: {selectedClaim.item?.storage_location || 'Campus Safety Main Post'}
                </p>
              </div>
            </div>

            {/* Proof Comparison Box */}
            <div className="border-2 border-campus-charcoal bg-campus-ivory p-4 space-y-3">
              <div>
                <span className="block text-xs font-mono font-bold uppercase tracking-wider text-campus-charcoal mb-1">
                  Claimant&apos;s Submitted Proof of Ownership:
                </span>
                <div className="p-3 bg-campus-white border border-campus-charcoal/40 text-xs font-mono text-campus-charcoal leading-relaxed whitespace-pre-line">
                  {selectedClaim.ownership_proof}
                </div>
              </div>

              {selectedClaim.item?.identifying_details && (
                <div>
                  <span className="block text-xs font-mono font-bold uppercase tracking-wider text-campus-forest mb-1">
                    Original Finder&apos;s Secret Notes (For Verification Comparison):
                  </span>
                  <div className="p-2.5 bg-campus-sage/20 border border-campus-forest/30 text-xs font-mono text-campus-forest">
                    {selectedClaim.item?.identifying_details}
                  </div>
                </div>
              )}

              {selectedClaim.proof_image_url && (
                <div>
                  <span className="block text-xs font-mono font-bold uppercase tracking-wider text-campus-charcoal mb-1">
                    Attached Proof Photo:
                  </span>
                  <img
                    src={selectedClaim.proof_image_url}
                    alt="Claim proof"
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
