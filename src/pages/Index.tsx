import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { OrderCard } from '@/components/dashboard/OrderCard';
import { RevenueChart, BestSellersChart } from '@/components/dashboard/Charts';
import { LowStockAlert } from '@/components/dashboard/LowStockAlert';
import { UpcomingEvents } from '@/components/dashboard/UpcomingEvents';
import { 
  ClipboardList, 
  Calendar, 
  Package, 
  TrendingUp, 
  Banknote, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDashboardStats, useOrders, useLowStockItems, usePurchases, useOrderItems } from '@/hooks/api';
import { useState } from 'react';

const Index = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  // API hooks
  const { data: stats, isLoading: statsLoading, isError: statsError } = useDashboardStats();
  const { data: allOrders = [], isLoading: ordersLoading, isError: ordersError } = useOrders();
  const { data: allPurchases = [], isLoading: purchasesLoading, isError: purchasesError } = usePurchases();
  const { data: allOrderItems = [], isLoading: itemsLoading, isError: itemsError } = useOrderItems();
  const { data: allLowStockItems = [], isLoading: stockLoading, isError: stockError } = useLowStockItems();

  const loading = statsLoading || ordersLoading || purchasesLoading || itemsLoading || stockLoading;
  const error = statsError || ordersError || purchasesError || itemsError || stockError;
  
  // Get first 5 items
  const orders = allOrders.slice(0, 5);
  const lowStockItems = allLowStockItems.slice(0, 5);

  if (loading) {
    return (
      <DashboardLayout title="Dashboard" subtitle="Welcome back">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Dashboard" subtitle="Welcome back">
        <div className="p-8 text-red-500 text-center card-premium">
          Failed to load dashboard data
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Filter data by selected month
  const getFilteredData = () => {
    // TODO: Implement proper month filtering after debugging date formats
    return {
      orders: allOrders,
      purchases: allPurchases,
      orderItems: allOrderItems,
    };
  };

  const { orders: filteredOrders, purchases: filteredPurchases, orderItems: filteredOrderItems } = getFilteredData();

  const defaultStats = {
    pending_orders: 0,
    upcoming_events: 0,
    low_stock_count: 0,
    inventory_value: 0,
    monthly_revenue: 0,
    total_sales: 0,
  };

  const data = stats || defaultStats;
  
  // Calculate filtered stats
  const filteredStats = {
    pending_orders: filteredOrders.filter(o => o.status === 'pending').length,
    total_revenue: filteredOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || '0'), 0),
    total_orders: filteredOrders.length,
  };

  return (
    <DashboardLayout 
      title="Dashboard" 
      subtitle="Welcome back"
    >
      {/* Month Selector */}
      <div className="mb-6 flex items-center gap-4">
        <label className="text-sm font-medium text-foreground">View by Month:</label>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Months" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {Array.from({ length: 12 }, (_, i) => {
              const date = new Date();
              date.setMonth(date.getMonth() - i);
              const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
              const displayName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
              return (
                <SelectItem key={i} value={monthKey}>
                  {displayName}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard
          title="Pending Orders"
          value={data.pending_orders ?? 0}
          icon={ClipboardList}
          variant="gold"
        />
        <StatCard
          title="Upcoming Events"
          value={data.upcoming_events ?? 0}
          icon={Calendar}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Low Stock Items"
          value={data.low_stock_count ?? 0}
          icon={Package}
          variant={(data.low_stock_count ?? 0) > 0 ? 'warning' : 'success'}
        />
        <StatCard
          title="Inventory Value"
          value={`Rs ${((data.inventory_value ?? 0) / 1000).toFixed(0)}K`}
          icon={TrendingUp}
        />
        <StatCard
          title="Monthly Revenue"
          value={`Rs ${((data.monthly_revenue ?? 0) / 1000).toFixed(0)}K`}
          icon={Banknote}
          variant="gold"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Total Sales"
          value={`Rs ${((data.total_sales ?? 0) / 1000000).toFixed(2)}M`}
          icon={AlertCircle}
          variant="success"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <RevenueChart orders={filteredOrders} purchases={filteredPurchases} />
        </div>
        <div>
          <BestSellersChart orders={filteredOrders} orderItems={filteredOrderItems} />
        </div>
      </div>

      {/* Orders and Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold text-foreground">Recent Orders</h2>
            <a href="/orders" className="text-sm text-gold hover:text-gold-light transition-colors">
              View all →
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOrders.slice(0, 5).length > 0 ? (
              filteredOrders.slice(0, 5).map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            ) : (
              <p className="text-muted-foreground">No recent orders</p>
            )}
          </div>
        </div>

        {/* Sidebar Alerts */}
        <div className="space-y-6">
          <UpcomingEvents orders={filteredOrders} />
          <LowStockAlert items={lowStockItems} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
