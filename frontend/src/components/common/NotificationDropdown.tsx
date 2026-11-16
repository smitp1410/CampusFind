import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Sparkles, FileText, CheckCircle, Info, ExternalLink } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'MATCH_FOUND':
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
      case 'CLAIM_SUBMITTED':
      case 'CLAIM_STATUS':
        return <FileText className="w-4 h-4 text-amber-600" />;
      case 'ITEM_RETURNED':
        return <CheckCircle className="w-4 h-4 text-teal-600" />;
      default:
        return <Info className="w-4 h-4 text-campus-charcoal" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-campus-charcoal hover:bg-campus-grey transition-colors border border-transparent hover:border-campus-charcoal/20"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-mono font-bold bg-campus-lime text-campus-charcoal border border-campus-charcoal">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-campus-ivory border-2 border-campus-charcoal shadow-brutal-lg z-50">
          <div className="flex items-center justify-between p-3.5 border-b border-campus-charcoal/20 bg-campus-white">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-campus-charcoal">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-mono bg-campus-lime px-1.5 py-0.2 border border-campus-charcoal">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-mono text-campus-charcoal/70 hover:text-campus-charcoal hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-campus-charcoal/10">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 mx-auto text-campus-charcoal/30 mb-2" />
                <p className="text-xs font-mono text-campus-charcoal/60 uppercase">
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.slice(0, 5).map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && markAsRead(n.id)}
                  className={`p-3.5 hover:bg-campus-grey/60 transition-colors cursor-pointer ${
                    !n.is_read ? 'bg-campus-lime/10' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5 p-1.5 bg-campus-white border border-campus-charcoal/20">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-campus-charcoal truncate">
                          {n.title}
                        </p>
                        <span className="text-[10px] font-mono text-campus-charcoal/50 shrink-0 ml-2">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-campus-charcoal/80 mt-1 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                      {n.link && (
                        <Link
                          to={n.link}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center text-[11px] font-mono font-medium text-campus-forest hover:underline mt-1.5"
                        >
                          View Details <ExternalLink className="w-3 h-3 ml-1" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2.5 border-t border-campus-charcoal/20 bg-campus-white text-center">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-mono font-medium uppercase tracking-wider text-campus-charcoal hover:underline"
            >
              See All Notifications ({notifications.length})
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
