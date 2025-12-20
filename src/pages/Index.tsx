import { useState, useEffect } from 'react';
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
import axios from 'axios';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, ordersRes, stockRes] = await Promise.all([
        axios.get('/api/dashboard/stats'),
        axios.get('/api/orders'),
        axios.get('/api/inventory/low-stock'),
      ]);

      setStats(statsRes.data.data);
      setOrders(ordersRes.data.data.slice(0, 5));
      setLowStockItems(stockRes.data.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

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
          {error}
          <Button onClick={fetchDashboardData} className="mt-4">
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const defaultStats = {
    pending_orders: 0,
    upcoming_events: 0,
    low_stock_count: 0,
    inventory_value: 0,
    monthly_revenue: 0,
    total_sales: 0,
  };

  const data = stats || defaultStats;

  return (
    <DashboardLayout 
      title="Dashboard" 
      subtitle="Welcome back"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard
          title="Pending Orders"
          value={data.pending_orders}
          icon={ClipboardList}
          variant="gold"
        />
        <StatCard
          title="Upcoming Events"
          value={data.upcoming_events}
          icon={Calendar}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Low Stock Items"
          value={data.low_stock_count}
          icon={Package}
          variant={data.low_stock_count > 0 ? 'warning' : 'success'}
        />
        <StatCard
          title="Inventory Value"
          value={`Rs ${(data.inventory_value / 1000).toFixed(0)}K`}
          icon={TrendingUp}
        />
        <StatCard
          title="Monthly Revenue"
          value={`Rs ${(data.monthly_revenue / 1000).toFixed(0)}K`}
          icon={Banknote}
          variant="gold"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Total Sales"
          value={`Rs ${(data.total_sales / 1000000).toFixed(2)}M`}
          icon={AlertCircle}
          variant="success"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <BestSellersChart />
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
            {orders.length > 0 ? (
              orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            ) : (
              <p className="text-muted-foreground">No recent orders</p>
            )}
          </div>
        </div>

        {/* Sidebar Alerts */}
        <div className="space-y-6">
          <UpcomingEvents orders={orders} />
          <LowStockAlert items={lowStockItems} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
