import { Order } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Calendar, Users, CreditCard } from 'lucide-react';

interface OrderCardProps {
  order: Order;
}

const statusColors: Record<string, string> = {
  'Inquiry': 'bg-info/10 text-info border-info/20',
  'Confirmed': 'bg-gold/10 text-gold border-gold/20',
  'In Progress': 'bg-warning/10 text-warning border-warning/20',
  'Delivered': 'bg-success/10 text-success border-success/20',
  'Closed': 'bg-muted text-muted-foreground border-muted',
};

const clientTypeColors: Record<string, string> = {
  'Wedding': 'bg-gold/20 text-gold',
  'Corporate': 'bg-info/20 text-info',
  'Family': 'bg-success/20 text-success',
  'Individual': 'bg-secondary text-secondary-foreground',
};

export function OrderCard({ order }: OrderCardProps) {
  return (
    <div className="card-premium p-5 hover:shadow-elevated transition-all duration-300 hover:border-gold/20">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-muted-foreground font-mono">{order.id}</p>
          <h3 className="font-display text-lg font-semibold text-foreground mt-1">
            {order.clientName}
          </h3>
        </div>
        <Badge className={cn("border", statusColors[order.status])}>
          {order.status}
        </Badge>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className={cn("text-xs font-medium px-2 py-1 rounded-full", clientTypeColors[order.clientType])}>
          {order.clientType}
        </span>
        <span className="text-xs text-muted-foreground">•</span>
        <span className="text-xs text-muted-foreground">{order.eventType}</span>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{new Date(order.eventDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{order.guestCount} guests</span>
        </div>
        <div className="flex items-center gap-2 text-gold font-semibold">
          <CreditCard className="w-4 h-4" />
          <span>Rs {(order.totalValue / 1000).toFixed(0)}K</span>
        </div>
      </div>

      {order.remainingBalance > 0 && (
        <div className="mt-4 pt-3 border-t border-border">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Balance Due</span>
            <span className="font-semibold text-warning">Rs {order.remainingBalance.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
