import { InventoryItem } from '@/types';
import { AlertTriangle, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LowStockAlertProps {
  items: InventoryItem[];
}

export function LowStockAlert({ items }: LowStockAlertProps) {
  const lowStockItems = items.filter(item => item.currentStock <= item.minimumStock);

  if (lowStockItems.length === 0) {
    return (
      <div className="card-premium p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
            <Package className="w-5 h-5 text-success" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">Stock Status</h3>
            <p className="text-sm text-muted-foreground">All items well stocked</p>
          </div>
        </div>
        <p className="text-sm text-success">✓ No low stock alerts</p>
      </div>
    );
  }

  return (
    <div className="card-premium p-6 border-warning/20 bg-gradient-to-br from-warning/5 to-transparent">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-warning" />
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">Low Stock Alert</h3>
          <p className="text-sm text-muted-foreground">{lowStockItems.length} items need restocking</p>
        </div>
      </div>

      <div className="space-y-3">
        {lowStockItems.map((item) => {
          const stockPercentage = (item.currentStock / item.minimumStock) * 100;
          const isCritical = stockPercentage < 50;
          
          return (
            <div key={item.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <div>
                <p className="font-medium text-sm text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.currentStock} / {item.minimumStock} {item.unit}
                </p>
              </div>
              <span className={cn(
                "text-xs font-semibold px-2 py-1 rounded-full",
                isCritical ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"
              )}>
                {isCritical ? 'Critical' : 'Low'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
