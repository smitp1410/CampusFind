import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, Filter, SlidersHorizontal, ArrowUpDown, 
  MapPin, Tag, RefreshCw, X, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { api } from '../../services/api';
import { Item, Category, Location, PaginatedItems } from '../../types';
import { ItemCard } from '../../components/item/ItemCard';
import { Button } from '../../components/ui/Button';

export const DiscoveryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters from URL or state
  const initialSearch = searchParams.get('search') || '';
  const initialType = searchParams.get('type') || '';
  const initialCategory = searchParams.get('category_id') || '';
  const initialLocation = searchParams.get('location_id') || '';
  const initialStatus = searchParams.get('status') || '';
  const initialSort = searchParams.get('sort_by') || 'date_desc';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [search, setSearch] = useState(initialSearch);
  const [type, setType] = useState(initialType);
  const [categoryId, setCategoryId] = useState(initialCategory);
  const [locationId, setLocationId] = useState(initialLocation);
  const [status, setStatus] = useState(initialStatus);
  const [sortBy, setSortBy] = useState(initialSort);
  const [page, setPage] = useState(initialPage);

  const [itemsData, setItemsData] = useState<PaginatedItems | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load categories and locations on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [cats, locs] = await Promise.all([
          api.getCategories(),
          api.getLocations(),
        ]);
        setCategories(cats);
        setLocations(locs);
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch items whenever filters change
  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        const params: Record<string, any> = {
          page,
          page_size: 12,
          sort_by: sortBy,
        };
        if (search.trim()) params.search = search.trim();
        if (type) params.type = type;
        if (categoryId) params.category_id = categoryId;
        if (locationId) params.location_id = locationId;
        if (status) params.status = status;

        const res = await api.getItems(params);
        setItemsData(res);

        // Synchronize search params in URL
        const newParams = new URLSearchParams();
        if (search.trim()) newParams.set('search', search.trim());
        if (type) newParams.set('type', type);
        if (categoryId) newParams.set('category_id', categoryId);
        if (locationId) newParams.set('location_id', locationId);
        if (status) newParams.set('status', status);
        if (sortBy !== 'date_desc') newParams.set('sort_by', sortBy);
        if (page > 1) newParams.set('page', page.toString());
        setSearchParams(newParams, { replace: true });
      } catch (err) {
        console.error('Failed to query items:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchItems();
  }, [search, type, categoryId, locationId, status, sortBy, page]);

  const handleClearFilters = () => {
    setSearch('');
    setType('');
    setCategoryId('');
    setLocationId('');
    setStatus('');
    setSortBy('date_desc');
    setPage(1);
  };

  const hasActiveFilters = Boolean(search || type || categoryId || locationId || status || sortBy !== 'date_desc');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title & Type Toggles */}
      <div className="border-b-2 border-campus-charcoal pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-campus-forest font-bold">
            Campus Catalog Directory
          </span>
          <h1 className="font-serif font-black text-4xl sm:text-5xl text-campus-charcoal mt-1">
            Browse Registered Property
          </h1>
          <p className="text-xs sm:text-sm text-campus-charcoal/70 font-sans mt-1">
            Displaying live campus lost & found records with full image documentation
          </p>
        </div>

        {/* Type Filter Buttons */}
        <div className="inline-flex border-2 border-campus-charcoal bg-campus-white shadow-brutal p-1">
          <button
            type="button"
            onClick={() => { setType(''); setPage(1); }}
            className={`px-4 py-1.5 text-xs font-mono uppercase tracking-wider font-bold transition-colors ${
              type === '' ? 'bg-campus-charcoal text-campus-lime' : 'text-campus-charcoal hover:bg-campus-grey'
            }`}
          >
            All Items
          </button>
          <button
            type="button"
            onClick={() => { setType('LOST'); setPage(1); }}
            className={`px-4 py-1.5 text-xs font-mono uppercase tracking-wider font-bold transition-colors ${
              type === 'LOST' ? 'bg-campus-forest text-campus-ivory' : 'text-campus-charcoal hover:bg-campus-grey'
            }`}
          >
            Lost
          </button>
          <button
            type="button"
            onClick={() => { setType('FOUND'); setPage(1); }}
            className={`px-4 py-1.5 text-xs font-mono uppercase tracking-wider font-bold transition-colors ${
              type === 'FOUND' ? 'bg-campus-charcoal text-campus-lime' : 'text-campus-charcoal hover:bg-campus-grey'
            }`}
          >
            Found
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-campus-white border-2 border-campus-charcoal p-4 sm:p-5 shadow-brutal space-y-4">
        {/* Main Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-campus-charcoal/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Fuzzy search across title, description, brand, or color..."
              className="w-full pl-10 pr-4 py-2.5 bg-campus-ivory border border-campus-charcoal/40 text-sm text-campus-charcoal placeholder-campus-charcoal/40 focus:outline-none focus:border-campus-charcoal"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-campus-charcoal/50 hover:text-campus-charcoal"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="bg-campus-ivory border border-campus-charcoal/40 text-xs font-mono uppercase px-3 py-2.5 text-campus-charcoal focus:outline-none focus:border-campus-charcoal"
            >
              <option value="date_desc">Sort: Newest Incident</option>
              <option value="date_asc">Sort: Oldest Incident</option>
              <option value="created_desc">Sort: Recently Reported</option>
            </select>
          </div>
        </div>

        {/* Dropdowns Row: Category, Location, Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-campus-charcoal/10">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-campus-charcoal/60 mb-1">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
              className="w-full bg-campus-ivory border border-campus-charcoal/40 text-xs font-mono py-2 px-2.5 text-campus-charcoal focus:outline-none focus:border-campus-charcoal"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-campus-charcoal/60 mb-1">
              Campus Location
            </label>
            <select
              value={locationId}
              onChange={(e) => { setLocationId(e.target.value); setPage(1); }}
              className="w-full bg-campus-ivory border border-campus-charcoal/40 text-xs font-mono py-2 px-2.5 text-campus-charcoal focus:outline-none focus:border-campus-charcoal"
            >
              <option value="">All Locations</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.building_name} ({loc.campus_name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-campus-charcoal/60 mb-1">
              Status Filter
            </label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full bg-campus-ivory border border-campus-charcoal/40 text-xs font-mono py-2 px-2.5 text-campus-charcoal focus:outline-none focus:border-campus-charcoal"
            >
              <option value="">All Active Statuses</option>
              <option value="OPEN">Open Only</option>
              <option value="MATCHED">Matched</option>
              <option value="CLAIMED">Claim In Progress</option>
              <option value="RESOLVED">Resolved / Returned</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="pt-2 flex items-center justify-between text-xs font-mono">
            <span className="text-campus-charcoal/70">
              Active Filters Applied &bull; {itemsData?.total || 0} match(es) found
            </span>
            <button
              onClick={handleClearFilters}
              className="text-red-700 hover:underline flex items-center"
            >
              <X className="w-3.5 h-3.5 mr-1" /> Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Items Grid */}
      {isLoading ? (
        <div className="py-24 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-campus-forest animate-spin mx-auto" />
          <p className="font-mono text-xs uppercase tracking-wider text-campus-charcoal/60">
            Scanning campus registry database...
          </p>
        </div>
      ) : itemsData && itemsData.items.length === 0 ? (
        <div className="py-20 border-2 border-dashed border-campus-charcoal/30 bg-campus-white/60 text-center space-y-3">
          <h3 className="font-serif font-bold text-2xl text-campus-charcoal">
            No Belongings Match Your Search Criteria
          </h3>
          <p className="text-xs text-campus-charcoal/70 font-sans max-w-md mx-auto">
            Try adjusting your search query, clearing filters, or submit a new report if your item is not listed yet.
          </p>
          <div className="pt-2">
            <Button variant="secondary" size="sm" onClick={handleClearFilters}>
              Reset Filters
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {itemsData?.items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>

          {/* Pagination */}
          {itemsData && itemsData.total_pages > 1 && (
            <div className="border-t-2 border-campus-charcoal pt-6 flex items-center justify-between font-mono text-xs">
              <span className="text-campus-charcoal/70">
                Page {itemsData.page} of {itemsData.total_pages} ({itemsData.total} items total)
              </span>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= itemsData.total_pages}
                  onClick={() => setPage(page + 1)}
                  rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
