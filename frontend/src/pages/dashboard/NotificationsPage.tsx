import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, Sparkles, FileText, CheckCircle2, Info, 
  ExternalLink, Check, Trash2 
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../../components/ui/Button';

export const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, refreshNotifications, isLoading } = useNotifications();
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'MATCHES') return n.type === 'MATCH_FOUND';
    if (filterType === 'CLAIMS') return n.type === 'CLAIM_SUBMITTED' || n.type === 'CLAIM_STATUS';
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'MATCH_FOUND':
        return <Sparkles className="w-5 h-5 text-emerald-600" />;
      case 'CLAIM_SUBMITTED':
      case 'CLAIM_STATUS':
        return <FileText className="w-5 h-5 text-amber-600" />;
      case 'ITEM_RETURNED':
        return <CheckCircle2 className="w-5 h-5 text-teal-600" />;
      default:
        return <Info className="w-5 h-5 text-campus-charcoal" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b-2 border-campus-charcoal pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-campus-forest font-bold">
            Activity Stream
          </span>
          <h1 className="font-serif font-black text-3xl sm:text-5xl text-campus-charcoal mt-1">
            Notifications Center
          </h1>
          <p className="text-xs sm:text-sm text-campus-charcoal/70 font-sans mt-1">
            Real-time automated alerts for smart matches, claims review, and security handovers
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            leftIcon={<Check className="w-4 h-4" />}
          >
            Mark All as Read ({unreadCount})
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex border-2 border-campus-charcoal bg-campus-white shadow-brutal p-1 font-mono text-xs uppercase tracking-wider max-w-md">
        {['ALL', 'MATCHES', 'CLAIMS'].map((f) => (
          <button
            key={f}
            onClick={() => setFilterType(f)}
            className={`flex-1 py-1.5 font-bold transition-colors ${
              filterType === f
                ? 'bg-campus-charcoal text-campus-lime'
                : 'text-campus-charcoal hover:bg-campus-grey'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-campus-white border-2 border-campus-charcoal shadow-brutal divide-y divide-campus-charcoal/15">
        {filteredNotifications.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Bell className="w-10 h-10 text-campus-charcoal/30 mx-auto" />
            <h3 className="font-serif font-bold text-xl text-campus-charcoal">
              No Notifications In This View
            </h3>
            <p className="text-xs text-campus-charcoal/60 font-mono">
              You are completely up to date.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-5 flex items-start justify-between gap-4 transition-colors ${
                !notif.is_read ? 'bg-campus-lime/10' : 'hover:bg-campus-grey/30'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="p-2.5 bg-campus-white border-2 border-campus-charcoal shadow-sm shrink-0">
                  {getIcon(notif.type)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-campus-charcoal font-serif">
                      {notif.title}
                    </h4>
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-campus-lime border border-campus-charcoal" />
                    )}
                  </div>
                  <p className="text-xs text-campus-charcoal/80 leading-relaxed font-sans max-w-xl">
                    {notif.message}
                  </p>
                  <div className="flex items-center space-x-4 pt-1 text-[11px] font-mono text-campus-charcoal/60">
                    <span>{new Date(notif.created_at).toLocaleString()}</span>
                    {notif.link && (
                      <Link
                        to={notif.link}
                        className="text-campus-forest font-bold hover:underline flex items-center"
                      >
                        <span>Open Target &rarr;</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {!notif.is_read && (
                <button
                  onClick={() => markAsRead(notif.id)}
                  className="text-xs font-mono text-campus-charcoal/60 hover:text-campus-charcoal hover:underline shrink-0"
                >
                  Mark Read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
