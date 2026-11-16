import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, Calendar, Tag, ShieldCheck, User as UserIcon, 
  ArrowLeft, Sparkles, AlertCircle, Share2, Shield, Lock, CheckCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { Item, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ClaimModal } from '../../components/item/ClaimModal';

export const ItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [item, setItem] = useState<Item | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItem = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await api.getItemById(parseInt(id, 10));
      setItem(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Item not found.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItem();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-campus-charcoal border-t-campus-lime rounded-full animate-spin mb-3" />
        <p className="font-mono text-xs uppercase tracking-wider text-campus-charcoal/60">
          Retrieving property record #{id}...
        </p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <h2 className="font-serif font-bold text-2xl text-campus-charcoal">
          Property Record Unavailable
        </h2>
        <p className="text-xs text-campus-charcoal/70 font-sans">
          {error || 'This item could not be retrieved from the catalog.'}
        </p>
        <Button variant="outline" size="sm" onClick={() => navigate('/items')}>
          Return to Catalog
        </Button>
      </div>
    );
  }

  const isOwner = user && user.id === item.reporter_id;
  const isFoundItem = item.type === 'FOUND';
  const images = item.images.length > 0
    ? item.images
    : [{ id: 0, image_url: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80', is_primary: true, created_at: '' }];

  const formattedDate = new Date(item.date_occurred).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between pb-4 border-b border-campus-charcoal/20">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-xs font-mono font-medium text-campus-charcoal hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to List
        </button>
        <span className="font-mono text-xs text-campus-charcoal/60 uppercase tracking-widest">
          Protocol ID: CF-ITM-{item.id.toString().padStart(5, '0')}
        </span>
      </div>

      {/* Main Grid: Left Gallery, Right Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Visual Presentation */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] w-full border-2 border-campus-charcoal bg-campus-grey overflow-hidden shadow-brutal-lg">
            <img
              src={images[activeImageIndex]?.image_url}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 flex items-center space-x-2">
              <Badge variant={item.type === 'LOST' ? 'lost' : 'found'}>
                {item.type} REPORT
              </Badge>
              <Badge variant={item.status.toLowerCase() as any}>
                STATUS // {item.status}
              </Badge>
            </div>
          </div>

          {/* Thumbnails if multiple images */}
          {images.length > 1 && (
            <div className="flex items-center space-x-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 border-2 shrink-0 overflow-hidden ${
                    activeImageIndex === idx ? 'border-campus-charcoal shadow-brutal' : 'border-campus-charcoal/30 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Secure Handover Guidance Box */}
          <div className="bg-campus-white border-2 border-campus-charcoal p-5 shadow-brutal space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase text-campus-forest">
              <ShieldCheck className="w-4 h-4 text-campus-forest" />
              <span>Campus Custody & Handover Guarantee</span>
            </div>
            <p className="text-xs text-campus-charcoal/80 leading-relaxed font-sans">
              All found items reported through CampusFind are held at verified security desks until verified ownership is matched. Claimants must provide proof of identification and matching private details before physical item release.
            </p>
          </div>
        </div>

        {/* Right Column: Detailed Metadata */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border-b-2 border-campus-charcoal pb-5 space-y-3">
            <div className="flex items-center space-x-2 font-mono text-xs text-campus-charcoal/60">
              <span className="flex items-center">
                <Tag className="w-3.5 h-3.5 mr-1 text-campus-forest" />
                {item.category?.name}
              </span>
              <span>&bull;</span>
              <span>{item.color}</span>
              {item.brand && (
                <>
                  <span>&bull;</span>
                  <span>{item.brand}</span>
                </>
              )}
            </div>

            <h1 className="font-serif font-black text-3xl sm:text-4xl text-campus-charcoal leading-tight">
              {item.title}
            </h1>

            <div className="flex items-center text-xs font-mono text-campus-charcoal/70">
              <Calendar className="w-4 h-4 mr-1.5 text-campus-charcoal/50" />
              <span>{item.type === 'LOST' ? 'Reported Lost on:' : 'Discovered on:'} {formattedDate}</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <span className="font-mono text-xs uppercase font-bold text-campus-charcoal tracking-wider block">
              Official Incident Description
            </span>
            <p className="text-sm text-campus-charcoal/80 leading-relaxed font-sans whitespace-pre-line bg-campus-white border border-campus-charcoal/20 p-4">
              {item.description}
            </p>
          </div>

          {/* Location Breakdown */}
          <div className="bg-campus-ivory border-2 border-campus-charcoal p-4 space-y-2 font-mono text-xs">
            <span className="uppercase font-bold text-campus-charcoal/60 block text-[10px]">
              Location & Campus Building
            </span>
            <div className="flex items-start space-x-2 text-campus-charcoal">
              <MapPin className="w-4 h-4 text-campus-forest shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm font-sans font-bold">
                  {item.location?.building_name}
                </strong>
                <span className="text-campus-charcoal/70 block">
                  {item.location?.campus_name} {item.floor ? `&bull; Floor: ${item.floor}` : ''}
                </span>
                {item.specific_location && (
                  <span className="text-campus-charcoal/60 block text-[11px] mt-1 italic">
                    Note: {item.specific_location}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Sensitive / Identifying Marks (Masked or Revealed) */}
          {item.identifying_details && (
            <div className="p-3.5 bg-campus-sage/20 border border-campus-charcoal/20 space-y-1">
              <div className="flex items-center space-x-1.5 text-[11px] font-mono font-bold uppercase text-campus-charcoal">
                <Lock className="w-3.5 h-3.5 text-campus-forest" />
                <span>Identifying Details</span>
              </div>
              <p className="text-xs text-campus-charcoal/80 font-mono">
                {item.identifying_details}
              </p>
            </div>
          )}

          {/* Primary Action Button */}
          <div className="pt-2 space-y-3">
            {isFoundItem && item.status !== 'RESOLVED' && !isOwner && (
              <Button
                variant="lime"
                size="lg"
                className="w-full"
                onClick={() => {
                  if (!user) {
                    navigate('/login');
                  } else {
                    setIsClaimModalOpen(true);
                  }
                }}
                leftIcon={<ShieldCheck className="w-5 h-5" />}
              >
                Submit Ownership Claim
              </Button>
            )}

            {isOwner && (
              <div className="p-3 bg-campus-white border border-campus-charcoal font-mono text-xs text-center">
                <span>You reported this item. Status: </span>
                <strong className="uppercase">{item.status}</strong>
              </div>
            )}

            {isAdmin && (
              <div className="p-4 bg-campus-forest/10 border-2 border-campus-forest space-y-2">
                <span className="text-[10px] font-mono uppercase font-bold text-campus-forest block">
                  Staff Administrative Controls
                </span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await api.updateItemStatusAdmin(item.id, 'RESOLVED');
                      fetchItem();
                    }}
                  >
                    Mark as Resolved
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to delete this report?')) {
                        await api.deleteItem(item.id);
                        navigate('/items');
                      }
                    }}
                  >
                    Delete Report
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Claim Modal */}
      {isClaimModalOpen && (
        <ClaimModal
          item={item}
          isOpen={isClaimModalOpen}
          onClose={() => setIsClaimModalOpen(false)}
          onClaimSuccess={() => {
            setIsClaimModalOpen(false);
            fetchItem();
          }}
        />
      )}
    </div>
  );
};
