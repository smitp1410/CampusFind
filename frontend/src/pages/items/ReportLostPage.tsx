import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, ArrowRight, ShieldCheck, MapPin, Calendar, 
  Tag, Info, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Category, Location } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { ImageUpload } from '../../components/ui/ImageUpload';
import confetti from 'canvas-confetti';

export const ReportLostPage: React.FC = () => {
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
        type: 'LOST',
        title: formData.title.trim(),
        category_id: parseInt(formData.category_id, 10),
        description: formData.description.trim(),
        color: formData.color.trim(),
        brand: formData.brand.trim() || undefined,
        date_occurred: new Date(formData.date_occurred).toISOString(),
        location_id: parseInt(formData.location_id, 10),
        floor: formData.floor.trim() || undefined,
        specific_location: formData.specific_location.trim() || undefined,
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
      setError(err.response?.data?.detail || 'Failed to submit report. Please review your input.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="border-b-2 border-campus-charcoal pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-red-700 font-bold">
            Step 1 // Lost Property Registration
          </span>
          <h1 className="font-serif font-black text-3xl sm:text-5xl text-campus-charcoal mt-1">
            Report a Missing Item
          </h1>
          <p className="text-xs sm:text-sm text-campus-charcoal/70 font-sans mt-1">
            Detailed descriptions increase matching accuracy across campus security databases.
          </p>
        </div>

        {user && (
          <div className="bg-campus-white border border-campus-charcoal p-2.5 font-mono text-xs shrink-0">
            <span className="text-[10px] uppercase text-campus-charcoal/60 block">Verified Reporter:</span>
            <span className="font-bold text-campus-charcoal">{user.full_name}</span>
            <span className="text-campus-forest block text-[11px] uppercase">[{user.role}]</span>
          </div>
        )}
      </div>

      {successId ? (
        <div className="bg-campus-white border-2 border-campus-charcoal p-10 shadow-brutal-lg text-center space-y-4">
          <CheckCircle2 className="w-16 h-16 text-campus-forest mx-auto" />
          <h2 className="font-serif font-bold text-3xl text-campus-charcoal">
            Report Successfully Filed!
          </h2>
          <p className="text-sm text-campus-charcoal/70 max-w-md mx-auto">
            Your item #{successId} has been registered and our 6-factor matching engine is comparing it against campus found items.
          </p>
          <div className="pt-2 font-mono text-xs text-campus-charcoal/60">
            Redirecting to item record...
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
              <span>1. Item Identification</span>
              <span className="font-mono text-xs text-campus-charcoal/50">Required</span>
            </h3>

            <Input
              label="Item Name / Title *"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. 'Apple MacBook Pro 14 Space Gray' or 'Black Hydro Flask 32oz'"
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
                placeholder="e.g. Matte Black, Navy Blue, Silver"
                required
              />

              <Input
                label="Brand / Manufacturer"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g. Apple, Sony, Nike, North Face"
              />
            </div>

            <Textarea
              label="Detailed Physical Description *"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe physical shape, condition, stickers, scratches, protective cases, or other visible characteristics..."
              rows={4}
              required
            />
          </div>

          {/* Section 2: Location & Date */}
          <div className="bg-campus-white border-2 border-campus-charcoal p-6 sm:p-8 shadow-brutal space-y-5">
            <h3 className="font-serif font-bold text-xl text-campus-charcoal border-b border-campus-charcoal/10 pb-3 flex items-center justify-between">
              <span>2. When and Where was it Lost?</span>
              <span className="font-mono text-xs text-campus-charcoal/50">Location Data</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Date Lost *"
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
                label="Floor / Level"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                placeholder="e.g. 2nd Floor, Basement, Ground"
              />
            </div>

            <Input
              label="Exact Desk / Room / Spot (Optional)"
              name="specific_location"
              value={formData.specific_location}
              onChange={handleChange}
              placeholder="e.g. 'Near east window quiet study booth #14' or 'Lecture Hall A row 3'"
            />
          </div>

          {/* Section 3: Identifying Marks & Photos */}
          <div className="bg-campus-white border-2 border-campus-charcoal p-6 sm:p-8 shadow-brutal space-y-5">
            <h3 className="font-serif font-bold text-xl text-campus-charcoal border-b border-campus-charcoal/10 pb-3 flex items-center justify-between">
              <span>3. Visual Documentation & Secret Proof</span>
              <span className="font-mono text-xs text-campus-charcoal/50">Verification</span>
            </h3>

            <ImageUpload
              value={images}
              onChange={setImages}
              maxImages={4}
              label="Item Photographs (Optional but Recommended)"
              helperText="Upload any existing photos of the item or identical model photos to help campus staff identify it."
            />

            <Textarea
              label="Secret Identifying Marks (Private Verification)"
              name="identifying_details"
              value={formData.identifying_details}
              onChange={handleChange}
              placeholder="e.g. 'Serial number ends in 891', 'Lock screen wallpaper is a dog', 'Inner pocket contains student bus card'..."
              rows={3}
              helperText="This information is kept confidential and only used to verify your ownership when potential matches are inspected."
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
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Publish Lost Report & Start Matching
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
