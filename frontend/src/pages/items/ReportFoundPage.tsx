import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, ArrowRight, ShieldCheck, MapPin, Calendar, 
  Tag, Info, AlertCircle, CheckCircle2, Lock 
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Category, Location } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { ImageUpload } from '../../components/ui/ImageUpload';
import confetti from 'canvas-confetti';

export const ReportFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [images, setImages] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    description: '',
    color: '',
    brand: '',
    date_occurred: new Date().toISOString().split('T')[0],
    location_id: '',
    floor: '',
    specific_location: '',
    storage_location: 'Central Library Security Desk',
    identifying_details: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<number | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [cats, locs] = await Promise.all([
          api.getCategories(),
          api.getLocations(),
        ]);
        setCategories(cats);
        setLocations(locs);
        if (cats.length > 0) setFormData((prev) => ({ ...prev, category_id: cats[0].id.toString() }));
        if (locs.length > 0) setFormData((prev) => ({ ...prev, location_id: locs[0].id.toString() }));
      } catch (err) {
        console.error('Failed to load categories/locations:', err);
      }
    };
    fetchMetadata();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.color) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        type: 'FOUND',
        title: formData.title.trim(),
        category_id: parseInt(formData.category_id, 10),
        description: formData.description.trim(),
        color: formData.color.trim(),
        brand: formData.brand.trim() || undefined,
        date_occurred: new Date(formData.date_occurred).toISOString(),
        location_id: parseInt(formData.location_id, 10),
        floor: formData.floor.trim() || undefined,
        specific_location: formData.specific_location.trim() || undefined,
        storage_location: formData.storage_location.trim() || undefined,
        identifying_details: formData.identifying_details.trim() || undefined,
        image_urls: images,
      };

      const created = await api.createItem(payload);
      setSuccessId(created.id);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        navigate('/my-reports');
      }, 1800);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="border-b-2 border-campus-charcoal pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-campus-forest font-bold">
            Step 1 // Found Property Registration
          </span>
          <h1 className="font-serif font-black text-3xl sm:text-5xl text-campus-charcoal mt-1">
            Report a Found Item
          </h1>
          <p className="text-xs sm:text-sm text-campus-charcoal/70 font-sans mt-1">
            Register an unattended item you encountered on campus so the owner can securely discover and claim it.
          </p>
        </div>

        {user && (
          <div className="bg-campus-white border border-campus-charcoal p-2.5 font-mono text-xs shrink-0">
            <span className="text-[10px] uppercase text-campus-charcoal/60 block">Verified Finder:</span>
            <span className="font-bold text-campus-charcoal">{user.full_name}</span>
            <span className="text-campus-forest block text-[11px] uppercase">[{user.role}]</span>
          </div>
        )}
      </div>

      {successId ? (
        <div className="bg-campus-white border-2 border-campus-charcoal p-10 shadow-brutal-lg text-center space-y-4">
          <CheckCircle2 className="w-16 h-16 text-campus-forest mx-auto" />
          <h2 className="font-serif font-bold text-3xl text-campus-charcoal">
            Found Item Registered!
          </h2>
          <p className="text-sm text-campus-charcoal/70 max-w-md mx-auto">
            Item #{successId} is now safely logged. If an owner filed a matching report, notifications have been automatically dispatched.
          </p>
          <div className="pt-2 font-mono text-xs text-campus-charcoal/60">
            Opening property record...
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-400 text-xs font-mono text-red-800 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Item Identity */}
          <div className="bg-campus-white border-2 border-campus-charcoal p-6 sm:p-8 shadow-brutal space-y-5">
            <h3 className="font-serif font-bold text-xl text-campus-charcoal border-b border-campus-charcoal/10 pb-3 flex items-center justify-between">
              <span>1. Item Details</span>
              <span className="font-mono text-xs text-campus-charcoal/50">Required</span>
            </h3>

            <Input
              label="Item Name / Title *"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. 'AirPods Pro with White Case' or 'Silver Keyring with Car Fob'"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block mb-1.5 text-xs font-mono font-medium uppercase tracking-wider text-campus-charcoal/80">
                  Category *
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="w-full bg-campus-white border border-campus-charcoal/40 text-campus-charcoal text-sm px-3.5 py-2.5 focus:outline-none focus:border-campus-charcoal"
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Primary Color *"
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="e.g. White, Silver, Black"
                required
              />

              <Input
                label="Brand / Logo"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g. Apple, Anker, Casio"
              />
            </div>

            <Textarea
              label="Public Visual Description *"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide a general description of the item so the owner recognizes it. DO NOT list unique secret markings that only the owner should know..."
              rows={4}
              required
            />
          </div>

          {/* Section 2: Discovery Location */}
          <div className="bg-campus-white border-2 border-campus-charcoal p-6 sm:p-8 shadow-brutal space-y-5">
            <h3 className="font-serif font-bold text-xl text-campus-charcoal border-b border-campus-charcoal/10 pb-3 flex items-center justify-between">
              <span>2. Discovery Location</span>
              <span className="font-mono text-xs text-campus-charcoal/50">Campus Spot</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Date Discovered *"
                type="date"
                name="date_occurred"
                value={formData.date_occurred}
                onChange={handleChange}
                required
              />

              <div>
                <label className="block mb-1.5 text-xs font-mono font-medium uppercase tracking-wider text-campus-charcoal/80">
                  Campus Building *
                </label>
                <select
                  name="location_id"
                  value={formData.location_id}
                  onChange={handleChange}
                  className="w-full bg-campus-white border border-campus-charcoal/40 text-campus-charcoal text-sm px-3.5 py-2.5 focus:outline-none focus:border-campus-charcoal"
                  required
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.building_name} ({loc.campus_name})
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Floor / Room"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                placeholder="e.g. 1st Floor Atrium"
              />
            </div>

            <Input
              label="Exact Discovery Spot"
              name="specific_location"
              value={formData.specific_location}
              onChange={handleChange}
              placeholder="e.g. 'Left on dining atrium couch' or 'Found near stairwell B'"
            />
          </div>

          {/* Section 3: Safe Custody & Handover Details */}
          <div className="bg-campus-white border-2 border-campus-charcoal p-6 sm:p-8 shadow-brutal space-y-5">
            <h3 className="font-serif font-bold text-xl text-campus-charcoal border-b border-campus-charcoal/10 pb-3 flex items-center justify-between">
              <span>3. Custody & Storage Location</span>
              <span className="font-mono text-xs text-campus-charcoal/50">Safety Desk</span>
            </h3>

            <Input
              label="Current Storage Location / Handover Post *"
              name="storage_location"
              value={formData.storage_location}
              onChange={handleChange}
              placeholder="e.g. 'Central Library Security Desk Room 102' or 'Student Union Desk'"
              helperText="Specify where the item is securely placed or where the owner should meet campus staff."
              required
            />

            <ImageUpload
              value={images}
              onChange={setImages}
              maxImages={4}
              label="Photographs of Found Item"
              helperText="Upload clear photos of the item for catalog listing."
            />

            <Textarea
              label="Private Identifying Details (Protected from Public)"
              name="identifying_details"
              value={formData.identifying_details}
              onChange={handleChange}
              placeholder="Note any secret scratches, serial numbers, or stickers that the owner must recite to claim the item. This text is never shown to regular public viewers."
              rows={3}
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="lime"
              size="lg"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Publish Found Property Entry
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
