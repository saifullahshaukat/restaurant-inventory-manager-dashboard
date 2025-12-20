import { Calendar, Clock, MapPin } from 'lucide-react';
import { Order } from '@/types';
import { cn } from '@/lib/utils';

interface UpcomingEventsProps {
  orders: Order[];
}

export function UpcomingEvents({ orders }: UpcomingEventsProps) {
  const upcomingOrders = orders
    .filter(o => o.status !== 'Delivered' && o.status !== 'Closed')
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
    .slice(0, 4);

  return (
    <div className="card-premium p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">Upcoming Events</h3>
          <p className="text-sm text-muted-foreground">Next scheduled orders</p>
        </div>
        <Calendar className="w-5 h-5 text-gold" />
      </div>

      <div className="space-y-4">
        {upcomingOrders.map((order, index) => {
          const eventDate = new Date(order.eventDate);
          const today = new Date();
          const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          const isUrgent = daysUntil <= 2;

          return (
            <div 
              key={order.id}
              className={cn(
                "p-4 rounded-lg border transition-all duration-200 hover:border-gold/30",
                isUrgent ? "bg-warning/5 border-warning/20" : "bg-secondary/30 border-transparent"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-foreground text-sm">{order.clientName}</p>
                  <p className="text-xs text-muted-foreground">{order.eventType}</p>
                </div>
                <span className={cn(
                  "text-xs font-semibold px-2 py-0.5 rounded-full",
                  isUrgent ? "bg-warning/10 text-warning" : "bg-gold/10 text-gold"
                )}>
                  {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{eventDate.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>{order.guestCount} guests</span>
                </div>
              </div>
            </div>
          );
        })}

        {upcomingOrders.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No upcoming events</p>
        )}
      </div>
    </div>
  );
}
