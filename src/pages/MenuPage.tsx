import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockMenuItems } from '@/data/mockData';
import { MenuItem, DishCategory } from '@/types';
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
import { cn } from '@/lib/utils';
import { Plus, Search, UtensilsCrossed, TrendingUp, Edit, Trash2 } from 'lucide-react';

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
  const [menuItems] = useState<MenuItem[]>(mockMenuItems);

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate summary stats
  const avgMargin = menuItems.reduce((acc, item) => acc + item.marginPercent, 0) / menuItems.length;
  const totalItems = menuItems.length;

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
              <p className="font-display text-2xl font-semibold">{menuItems.filter(i => i.isAvailable).length}</p>
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

        <Button className="bg-gold hover:bg-gold-light text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Add Dish
        </Button>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div key={item.id} className="card-premium p-5 group hover:border-gold/20 transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <Badge className={cn("border", categoryColors[item.category])}>
                {item.category}
              </Badge>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </Button>
              </div>
            </div>

            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              {item.name}
            </h3>

            <div className="flex flex-wrap gap-1 mb-4">
              {item.ingredients.slice(0, 3).map((ing, idx) => (
                <span key={idx} className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                  {ing}
                </span>
              ))}
              {item.ingredients.length > 3 && (
                <span className="text-xs text-muted-foreground">+{item.ingredients.length - 3}</span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">Cost</p>
                <p className="font-semibold text-foreground">Rs {item.costPerServing}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Price</p>
                <p className="font-semibold text-gold">Rs {item.sellingPrice}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Margin</p>
                <p className={cn(
                  "font-semibold",
                  item.marginPercent >= 50 ? "text-success" : "text-warning"
                )}>
                  {item.marginPercent}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="py-12 text-center card-premium">
          <p className="text-muted-foreground">No dishes found matching your criteria.</p>
        </div>
      )}
    </DashboardLayout>
  );
}
