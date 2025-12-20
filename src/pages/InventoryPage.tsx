import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockInventory } from '@/data/mockData';
import { InventoryItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Plus, Search, Package, AlertTriangle, TrendingUp, Edit } from 'lucide-react';

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [inventory] = useState<InventoryItem[]>(mockInventory);

  const filteredItems = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const totalValue = inventory.reduce((acc, item) => acc + (item.currentStock * item.costPerUnit), 0);
  const lowStockCount = inventory.filter(i => i.currentStock <= i.minimumStock).length;
  const totalItems = inventory.length;

  return (
    <DashboardLayout title="Inventory" subtitle="Track your stock levels and supplies">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-gold" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Stock Value</p>
              <p className="font-display text-2xl font-semibold">Rs {(totalValue / 1000).toFixed(0)}K</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Stock Items</p>
              <p className="font-display text-2xl font-semibold">{lowStockCount}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="font-display text-2xl font-semibold">{totalItems}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search ingredients or suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button className="bg-gold hover:bg-gold-light text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Inventory Table */}
      <div className="card-premium overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="font-display font-semibold">Ingredient</TableHead>
              <TableHead className="font-display font-semibold">Stock Level</TableHead>
              <TableHead className="font-display font-semibold">Unit</TableHead>
              <TableHead className="font-display font-semibold">Supplier</TableHead>
              <TableHead className="font-display font-semibold">Cost/Unit</TableHead>
              <TableHead className="font-display font-semibold">Total Value</TableHead>
              <TableHead className="font-display font-semibold">Status</TableHead>
              <TableHead className="font-display font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => {
              const stockPercentage = Math.min((item.currentStock / (item.minimumStock * 2)) * 100, 100);
              const isLow = item.currentStock <= item.minimumStock;
              const isCritical = item.currentStock < item.minimumStock * 0.5;

              return (
                <TableRow key={item.id} className="group hover:bg-gold/5">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                        isLow ? "bg-warning/10 text-warning" : "bg-secondary text-muted-foreground"
                      )}>
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        {item.expiryDate && (
                          <p className="text-xs text-muted-foreground">
                            Expires: {new Date(item.expiryDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.currentStock}</span>
                        <span className="text-muted-foreground">/ {item.minimumStock} min</span>
                      </div>
                      <Progress 
                        value={stockPercentage} 
                        className={cn(
                          "h-1.5",
                          isCritical ? "[&>div]:bg-destructive" : isLow ? "[&>div]:bg-warning" : "[&>div]:bg-success"
                        )}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{item.unit}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{item.supplierName}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">Rs {item.costPerUnit}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-gold">
                      Rs {(item.currentStock * item.costPerUnit).toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "border",
                      isCritical 
                        ? "bg-destructive/10 text-destructive border-destructive/20"
                        : isLow 
                          ? "bg-warning/10 text-warning border-warning/20"
                          : "bg-success/10 text-success border-success/20"
                    )}>
                      {isCritical ? 'Critical' : isLow ? 'Low' : 'In Stock'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
}
