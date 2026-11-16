import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, ArrowUpRight, Tag, Shield } from 'lucide-react';
import { Item } from '../../types';
import { Badge } from '../ui/Badge';

interface ItemCardProps {
  item: Item;
  featured?: boolean;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, featured = false }) => {
  const primaryImage =
    item.images && item.images.length > 0
      ? item.images[0].image_url
      : 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80';

  const formattedDate = new Date(item.date_occurred).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      className={`group bg-campus-white border-2 border-campus-charcoal flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-brutal-lg ${
        featured ? 'md:col-span-2' : ''
      }`}
    >
      <div>
        {/* Image Container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden border-b-2 border-campus-charcoal bg-campus-grey">
          <img
            src={primaryImage}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Top badges bar */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
            <Badge variant={item.type === 'LOST' ? 'lost' : 'found'}>
              {item.type}
            </Badge>
            <Badge variant={item.status.toLowerCase() as any}>
              {item.status}
            </Badge>
          </div>

          {/* Color & Brand Pill */}
          <div className="absolute bottom-2.5 left-2.5 flex items-center space-x-1.5 pointer-events-none">
            <span className="bg-campus-charcoal/90 backdrop-blur-sm text-campus-ivory font-mono text-[10px] px-2 py-0.5 uppercase tracking-wider">
              {item.color} {item.brand ? `• ${item.brand}` : ''}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 sm:p-5">
          {/* Metadata Bar */}
          <div className="flex items-center justify-between text-xs font-mono text-campus-charcoal/60 mb-2">
            <span className="flex items-center">
              <Tag className="w-3.5 h-3.5 mr-1 text-campus-forest" />
              {item.category?.name || 'General'}
            </span>
            <span className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-campus-charcoal/50" />
              {formattedDate}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-serif font-bold text-lg text-campus-charcoal group-hover:text-campus-forest transition-colors line-clamp-1">
            {item.title}
          </h3>

          {/* Description snippet */}
          <p className="mt-1.5 text-xs text-campus-charcoal/70 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          {/* Campus Location */}
          <div className="mt-4 pt-3 border-t border-campus-charcoal/10 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center text-campus-charcoal/80 truncate mr-2">
              <MapPin className="w-3.5 h-3.5 mr-1.5 text-campus-charcoal shrink-0" />
              <span className="truncate">
                {item.location?.building_name || 'Main Campus'}
                {item.floor ? ` (${item.floor})` : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        <Link
          to={`/items/${item.id}`}
          className="w-full py-2 px-3 border border-campus-charcoal bg-campus-ivory text-campus-charcoal text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center hover:bg-campus-charcoal hover:text-campus-lime transition-colors"
        >
          <span>Inspect Report</span>
          <ArrowUpRight className="w-3.5 h-3.5 ml-1.5" />
        </Link>
      </div>
    </div>
  );
};
