import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { OrderCard } from '@/components/dashboard/OrderCard';
import { RevenueChart, BestSellersChart } from '@/components/dashboard/Charts';
import { LowStockAlert } from '@/components/dashboard/LowStockAlert';
import { UpcomingEvents } from '@/components/dashboard/UpcomingEvents';
import { mockOrders, mockInventory, mockDashboardStats } from '@/data/mockData';
import { 
  ClipboardList, 
  Calendar, 
  Package, 
  TrendingUp, 
  Banknote, 
  AlertCircle 
} from 'lucide-react';

const Index = () => {
  return (
    <DashboardLayout 
      title="Dashboard" 
      subtitle="Welcome back to Mommy's Kitchen"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard
          title="Today's Orders"
          value={mockDashboardStats.todaysOrders}
          icon={ClipboardList}
          variant="gold"
        />
        <StatCard
          title="Upcoming Events"
          value={mockDashboardStats.upcomingEvents}
          icon={Calendar}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Stock Value"
          value={`Rs ${(mockDashboardStats.stockValue / 1000).toFixed(0)}K`}
          icon={Package}
        />
        <StatCard
          title="Monthly Profit"
          value={`Rs ${(mockDashboardStats.monthlyProfit / 1000).toFixed(0)}K`}
          icon={TrendingUp}
          variant="success"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Total Revenue"
          value={`Rs ${(mockDashboardStats.totalRevenue / 1000000).toFixed(2)}M`}
          icon={Banknote}
          variant="gold"
        />
        <StatCard
          title="Pending Payments"
          value={`Rs ${(mockDashboardStats.pendingPayments / 1000).toFixed(0)}K`}
          icon={AlertCircle}
          variant="warning"
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
            {mockOrders.slice(0, 4).map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </div>

        {/* Sidebar Alerts */}
        <div className="space-y-6">
          <UpcomingEvents orders={mockOrders} />
          <LowStockAlert items={mockInventory} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
