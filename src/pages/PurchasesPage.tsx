import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockPurchases } from '@/data/mockData';
import { GroceryPurchase } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Plus, Search, ShoppingCart, Calendar, TrendingDown, Eye } from 'lucide-react';

export default function PurchasesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [purchases] = useState<GroceryPurchase[]>(mockPurchases);

  const filteredPurchases = purchases.filter(p =>
    p.ingredient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const totalSpent = purchases.reduce((acc, p) => acc + p.cost, 0);
  const thisMonthSpent = purchases
    .filter(p => new Date(p.purchaseDate).getMonth() === new Date().getMonth())
    .reduce((acc, p) => acc + p.cost, 0);

  return (
    <DashboardLayout title="Purchases" subtitle="Track grocery and supply purchases">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-gold" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Purchases</p>
              <p className="font-display text-2xl font-semibold">{purchases.length}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="font-display text-2xl font-semibold">Rs {(thisMonthSpent / 1000).toFixed(0)}K</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="font-display text-2xl font-semibold">Rs {(totalSpent / 1000).toFixed(0)}K</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by ingredient or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button className="bg-gold hover:bg-gold-light text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Log Purchase
        </Button>
      </div>

      {/* Purchases Table */}
      <div className="card-premium overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="font-display font-semibold">Purchase ID</TableHead>
              <TableHead className="font-display font-semibold">Date</TableHead>
              <TableHead className="font-display font-semibold">Ingredient</TableHead>
              <TableHead className="font-display font-semibold">Supplier</TableHead>
              <TableHead className="font-display font-semibold">Quantity</TableHead>
              <TableHead className="font-display font-semibold">Cost</TableHead>
              <TableHead className="font-display font-semibold">Linked Order</TableHead>
              <TableHead className="font-display font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPurchases.map((purchase) => (
              <TableRow key={purchase.id} className="group hover:bg-gold/5">
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {purchase.id}
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {new Date(purchase.purchaseDate).toLocaleDateString('en-PK', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-foreground">{purchase.ingredient}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">{purchase.supplier}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{purchase.quantity} {purchase.unit}</span>
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-gold">Rs {purchase.cost.toLocaleString()}</span>
                </TableCell>
                <TableCell>
                  {purchase.linkedOrderId ? (
                    <span className="text-xs font-mono bg-secondary px-2 py-1 rounded">
                      {purchase.linkedOrderId}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredPurchases.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No purchases found.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
