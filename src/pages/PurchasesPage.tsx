import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { usePurchases, useCreatePurchase, useSuppliers, useCreateSupplier } from '@/hooks/api';
import { GroceryPurchase } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Plus, Search, ShoppingCart, Calendar, TrendingDown, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PurchasesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLogPurchaseDialogOpen, setIsLogPurchaseDialogOpen] = useState(false);
  const [isAddSupplierDialogOpen, setIsAddSupplierDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    item_id: '',
    supplier_id: '',
    purchase_date: '',
    quantity: '',
    cost: '',
  });
  const [supplierFormData, setSupplierFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
  });

  // API hooks
  const { data: purchases = [], isLoading, error, refetch } = usePurchases();
  const { data: suppliers = [] } = useSuppliers();
  const createPurchase = useCreatePurchase();
  const createSupplier = useCreateSupplier();

  const filteredPurchases = purchases.filter(p =>
    (p.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (p.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  // Stats
  const totalSpent = purchases.reduce((acc, p) => acc + (p.quantity * p.cost_per_unit), 0);
  const thisMonthSpent = purchases
    .filter(p => new Date(p.purchase_date).getMonth() === new Date().getMonth())
    .reduce((acc, p) => acc + (p.quantity * p.cost_per_unit), 0);

  const handleAddSupplier = async () => {
    if (!supplierFormData.name) {
      toast.error('Please fill in supplier name');
      return;
    }

    try {
      await createSupplier.mutateAsync({
        name: supplierFormData.name,
        email: supplierFormData.email,
        phone: supplierFormData.phone,
        address: supplierFormData.address,
        city: supplierFormData.city,
      });
      toast.success('Supplier added successfully!');
      setIsAddSupplierDialogOpen(false);
      setSupplierFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
      });
    } catch (error) {
      toast.error('Failed to add supplier');
    }
  };

  const handleLogPurchase = async () => {
    if (!formData.supplier_id || !formData.purchase_date || !formData.quantity || !formData.cost) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createPurchase.mutateAsync({
        supplier_id: formData.supplier_id,
        purchase_date: formData.purchase_date,
        items: [{
          quantity: parseFloat(formData.quantity),
          unit_price: parseFloat(formData.cost),
        }],
      });
      toast.success('Purchase logged successfully!');
      setIsLogPurchaseDialogOpen(false);
      setFormData({
        item_id: '',
        supplier_id: '',
        purchase_date: '',
        quantity: '',
        cost: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to log purchase');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout title="Purchases" subtitle="Track grocery and supply purchases">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout title="Purchases" subtitle="Track grocery and supply purchases">
        <div className="p-8 text-red-500 text-center">
          Failed to load purchases. Make sure the backend server is running.
          <Button onClick={() => refetch()} className="mt-4">
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Purchases" subtitle="Track grocery and supply purchases">
      {/* Dialog for Log Purchase */}
      <Dialog open={isLogPurchaseDialogOpen} onOpenChange={setIsLogPurchaseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log New Purchase</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Supplier *</label>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setIsAddSupplierDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add New
                </Button>
              </div>
              <Select value={formData.supplier_id} onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Purchase Date *</label>
              <Input
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Quantity *</label>
              <Input
                type="number"
                placeholder="e.g., 10"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Cost per Unit (Rs) *</label>
              <Input
                type="number"
                placeholder="e.g., 120"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLogPurchaseDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gold hover:bg-gold-light"
              onClick={handleLogPurchase}
              disabled={createPurchase.isPending}
            >
              {createPurchase.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Log Purchase
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for Add Supplier */}
      <Dialog open={isAddSupplierDialogOpen} onOpenChange={setIsAddSupplierDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Supplier Name *</label>
              <Input
                placeholder="e.g., Fresh Vegetables Ltd"
                value={supplierFormData.name}
                onChange={(e) => setSupplierFormData({ ...supplierFormData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="supplier@example.com"
                value={supplierFormData.email}
                onChange={(e) => setSupplierFormData({ ...supplierFormData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input
                placeholder="0300-1234567"
                value={supplierFormData.phone}
                onChange={(e) => setSupplierFormData({ ...supplierFormData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Address</label>
              <Input
                placeholder="Street address"
                value={supplierFormData.address}
                onChange={(e) => setSupplierFormData({ ...supplierFormData, address: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">City</label>
              <Input
                placeholder="City"
                value={supplierFormData.city}
                onChange={(e) => setSupplierFormData({ ...supplierFormData, city: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSupplierDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gold hover:bg-gold-light"
              onClick={handleAddSupplier}
              disabled={createSupplier.isPending}
            >
              {createSupplier.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Supplier
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            placeholder="Search by supplier or item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button 
          className="bg-gold hover:bg-gold-light text-primary-foreground"
          onClick={() => setIsLogPurchaseDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Log Purchase
        </Button>
      </div>

      {/* Purchases Table */}
      <div className="card-premium overflow-hidden">
        {filteredPurchases.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="font-display font-semibold">Purchase ID</TableHead>
                <TableHead className="font-display font-semibold">Date</TableHead>
                <TableHead className="font-display font-semibold">Supplier</TableHead>
                <TableHead className="font-display font-semibold">Quantity</TableHead>
                <TableHead className="font-display font-semibold">Cost per Unit</TableHead>
                <TableHead className="font-display font-semibold">Total Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPurchases.map((purchase) => (
                <TableRow key={purchase.id} className="border-border hover:bg-secondary/50">
                  <TableCell className="font-mono font-medium">{purchase.id}</TableCell>
                  <TableCell className="text-sm">
                    {new Date(purchase.purchase_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{purchase.supplier_name}</TableCell>
                  <TableCell className="text-sm">{purchase.quantity}</TableCell>
                  <TableCell className="font-semibold">Rs {purchase.cost_per_unit}</TableCell>
                  <TableCell className="font-semibold text-gold">Rs {(purchase.quantity * purchase.cost_per_unit).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            No purchases found. {purchases.length === 0 ? 'Log your first purchase!' : 'Try different filters.'}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
