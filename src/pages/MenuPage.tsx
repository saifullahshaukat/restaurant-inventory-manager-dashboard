import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Plus, Search, UtensilsCrossed, TrendingUp, Edit, Trash2, Loader2 } from 'lucide-react';
import { useMenuItems, useCreateMenuItem, useDeleteMenuItem } from '@/hooks/api';
import { toast } from 'sonner';

const categoryColors: Record<string, string> = {
  'Main': 'bg-gold/10 text-gold border-gold/20',
  'BBQ': 'bg-destructive/10 text-destructive border-destructive/20',
  'Rice': 'bg-warning/10 text-warning border-warning/20',
  'Dessert': 'bg-info/10 text-info border-info/20',
  'Live Station': 'bg-success/10 text-success border-success/20',
  'Appetizer': 'bg-secondary text-secondary-foreground border-border',
};

export default function MenuPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Main',
    cost_per_serving: '',
    selling_price: '',
  });

  // API hooks
  const { data: menuItems = [], isLoading, error, refetch } = useMenuItems();
  const createMenuItem = useCreateMenuItem();
  const deleteMenuItem = useDeleteMenuItem();

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate summary stats
  const avgMargin = menuItems.length > 0
    ? menuItems.reduce((acc, item) => acc + (item.margin_percent || 0), 0) / menuItems.length
    : 0;
  const totalItems = menuItems.length;
  const activeItems = menuItems.filter(i => i.is_available).length;

  const handleAddDish = async () => {
    if (!formData.name || !formData.cost_per_serving || !formData.selling_price) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createMenuItem.mutateAsync({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        cost_per_serving: parseFloat(formData.cost_per_serving),
        selling_price: parseFloat(formData.selling_price),
        is_vegetarian: false,
        prep_time_minutes: 30,
      });
      toast.success('Dish added successfully!');
      setIsAddDialogOpen(false);
      setFormData({
        name: '',
        description: '',
        category: 'Main',
        cost_per_serving: '',
        selling_price: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add dish');
    }
  };

  const handleDeleteDish = async (id) => {
    if (!window.confirm('Are you sure you want to delete this dish?')) return;

    try {
      await deleteMenuItem.mutateAsync(id);
      toast.success('Dish deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete dish');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout title="Menu & Costing" subtitle="Manage your dishes and pricing">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout title="Menu & Costing" subtitle="Manage your dishes and pricing">
        <div className="p-8 text-red-500 text-center">
          Failed to load menu items. Make sure the backend server is running.
          <Button onClick={() => refetch()} className="mt-4">
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Menu & Costing" subtitle="Manage your dishes and pricing">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-gold" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Dishes</p>
              <p className="font-display text-2xl font-semibold">{totalItems}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Margin</p>
              <p className="font-display text-2xl font-semibold">{avgMargin.toFixed(0)}%</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Items</p>
              <p className="font-display text-2xl font-semibold">{activeItems}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search dishes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Main">Main</SelectItem>
            <SelectItem value="BBQ">BBQ</SelectItem>
            <SelectItem value="Rice">Rice</SelectItem>
            <SelectItem value="Dessert">Dessert</SelectItem>
            <SelectItem value="Live Station">Live Station</SelectItem>
            <SelectItem value="Appetizer">Appetizer</SelectItem>
          </SelectContent>
        </Select>

        <Button
          className="bg-gold hover:bg-gold-light text-primary-foreground"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Dish
        </Button>
      </div>

      {/* Add Dish Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Dish</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Dish Name *</label>
              <Input
                placeholder="e.g., Biryani, Karahi, Haleem"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                placeholder="Brief description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Main">Main</SelectItem>
                  <SelectItem value="BBQ">BBQ</SelectItem>
                  <SelectItem value="Rice">Rice</SelectItem>
                  <SelectItem value="Dessert">Dessert</SelectItem>
                  <SelectItem value="Live Station">Live Station</SelectItem>
                  <SelectItem value="Appetizer">Appetizer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Cost per Serving (Rs) *</label>
              <Input
                placeholder="e.g., 150"
                type="number"
                value={formData.cost_per_serving}
                onChange={(e) => setFormData({ ...formData, cost_per_serving: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Selling Price (Rs) *</label>
              <Input
                placeholder="e.g., 350"
                type="number"
                value={formData.selling_price}
                onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gold hover:bg-gold-light"
              onClick={handleAddDish}
              disabled={createMenuItem.isPending}
            >
              {createMenuItem.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Dish
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div key={item.id} className="card-premium p-5 group hover:border-gold/20 transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <Badge className={cn("border", categoryColors[item.category])}>
                {item.category}
              </Badge>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleDeleteDish(item.id)}
                >
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </Button>
              </div>
            </div>

            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              {item.name}
            </h3>

            {item.description && (
              <p className="text-xs text-muted-foreground mb-3">{item.description}</p>
            )}

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">Cost</p>
                <p className="font-semibold text-foreground">Rs {Number(item.cost_per_serving || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Price</p>
                <p className="font-semibold text-gold">Rs {Number(item.selling_price || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Margin</p>
                <p className={cn(
                  "font-semibold",
                  (Number(item.margin_percent) || 0) >= 50 ? "text-success" : "text-warning"
                )}>
                  {Number(item.margin_percent || 0).toFixed(0)}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="py-12 text-center card-premium">
          <p className="text-muted-foreground mb-4">No dishes found. {menuItems.length === 0 ? 'Start by adding your first dish!' : 'Try different filters.'}</p>
          {menuItems.length === 0 && (
            <Button
              className="bg-gold hover:bg-gold-light"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Dish
            </Button>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
