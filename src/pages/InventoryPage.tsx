import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Plus, Search, Package, AlertTriangle, TrendingUp, Trash2, Loader2 } from 'lucide-react';
import { useInventory, useLowStockItems, useCreateInventoryItem } from '@/hooks/api';
import { toast } from 'sonner';

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Vegetables',
    unit: 'kg',
    cost_per_unit: '',
    supplier_name: '',
    minimum_stock: '',
  });

  // API hooks
  const { data: inventory = [], isLoading, error, refetch } = useInventory();
  const { data: lowStockItems = [] } = useLowStockItems();
  const createItem = useCreateInventoryItem();

  const filteredItems = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const totalValue = inventory.reduce((acc, item) => acc + (item.current_stock * item.cost_per_unit), 0);
  const lowStockCount = lowStockItems.length;
  const totalItems = inventory.length;

  const handleAddItem = async () => {
    if (!formData.name || !formData.cost_per_unit || !formData.supplier_name) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createItem.mutateAsync({
        name: formData.name,
        category: formData.category,
        unit: formData.unit,
        cost_per_unit: parseFloat(formData.cost_per_unit),
        supplier_name: formData.supplier_name,
        minimum_stock: formData.minimum_stock ? parseFloat(formData.minimum_stock) : 5,
      });
      toast.success('Item added successfully!');
      setIsAddDialogOpen(false);
      setFormData({
        name: '',
        category: 'Vegetables',
        unit: 'kg',
        cost_per_unit: '',
        supplier_name: '',
        minimum_stock: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add item');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout title="Inventory" subtitle="Track your stock levels and supplies">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout title="Inventory" subtitle="Track your stock levels and supplies">
        <div className="p-8 text-red-500 text-center">
          Failed to load inventory. Make sure the backend server is running.
          <Button onClick={() => refetch()} className="mt-4">
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    );
  }

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

        <Button
          className="bg-gold hover:bg-gold-light text-primary-foreground"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Inventory Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Item Name *</label>
              <Input
                placeholder="e.g., Basmati Rice, Chicken Breast"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Input
                placeholder="e.g., Grains, Meat, Vegetables"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Unit</label>
              <Input
                placeholder="e.g., kg, liter, piece"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Cost per Unit (Rs) *</label>
              <Input
                placeholder="e.g., 120"
                type="number"
                value={formData.cost_per_unit}
                onChange={(e) => setFormData({ ...formData, cost_per_unit: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Supplier Name *</label>
              <Input
                placeholder="e.g., Local Supplier"
                value={formData.supplier_name}
                onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Minimum Stock</label>
              <Input
                placeholder="e.g., 5"
                type="number"
                value={formData.minimum_stock}
                onChange={(e) => setFormData({ ...formData, minimum_stock: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gold hover:bg-gold-light"
              onClick={handleAddItem}
              disabled={createItem.isPending}
            >
              {createItem.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Inventory Table */}
      <div className="card-premium overflow-hidden">
        {filteredItems.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="font-display font-semibold">Ingredient</TableHead>
                <TableHead className="font-display font-semibold">Stock Level</TableHead>
                <TableHead className="font-display font-semibold">Unit</TableHead>
                <TableHead className="font-display font-semibold">Supplier</TableHead>
                <TableHead className="font-display font-semibold">Cost/Unit</TableHead>
                <TableHead className="font-display font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => {
                const stockPercentage = (item.current_stock / (item.minimum_stock || 1)) * 100;
                const isLowStock = item.current_stock <= (item.minimum_stock || 0);

                return (
                  <TableRow key={item.id} className="border-border hover:bg-secondary/50">
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{item.current_stock}</span>
                        <Progress value={Math.min(stockPercentage, 100)} className="w-20 h-2" />
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.unit}</TableCell>
                    <TableCell className="text-muted-foreground">{item.supplier_name}</TableCell>
                    <TableCell className="font-semibold">Rs {item.cost_per_unit}</TableCell>
                    <TableCell>
                      {isLowStock ? (
                        <Badge className="bg-warning/10 text-warning border-warning/20 border">
                          Low Stock
                        </Badge>
                      ) : (
                        <Badge className="bg-success/10 text-success border-success/20 border">
                          In Stock
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            No items found. {inventory.length === 0 ? 'Add your first inventory item!' : 'Try different filters.'}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
