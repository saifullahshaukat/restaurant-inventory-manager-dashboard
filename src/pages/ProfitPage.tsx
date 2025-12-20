import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useOrders, usePurchases, useMenuItems, useDashboardStats } from '@/hooks/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Receipt, Percent, Calculator, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProfitPage() {
  // API hooks
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const { data: purchases = [], isLoading: purchasesLoading } = usePurchases();
  const { data: menuItems = [] } = useMenuItems();
  const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats();

  const isLoading = ordersLoading || purchasesLoading || statsLoading;

  // Calculate profit metrics from real data
  // Only count delivered/closed orders as revenue
  const deliveredOrders = orders.filter(o => o.status === 'Delivered' || o.status === 'Closed');
  const totalRevenue = deliveredOrders.reduce((acc, order) => acc + (order.total_value ?? 0), 0);
  const totalCOGS = purchases.reduce((acc, p) => acc + ((p.quantity ?? 0) * (p.unit_price ?? 0)), 0);
  const grossProfit = totalRevenue - totalCOGS;
  const profitMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0';

  // Per-event profit
  const avgProfitPerEvent = deliveredOrders.length > 0 ? grossProfit / deliveredOrders.length : 0;

  // Monthly revenue data (from last 12 months of orders)
  const getMonthlyData = () => {
    const monthlyRevenue = {};
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyRevenue[monthKey] = 0;
    }

    deliveredOrders.forEach(order => {
      const orderDate = new Date(order.event_date);
      const monthKey = orderDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (monthKey in monthlyRevenue) {
        monthlyRevenue[monthKey] += order.total_value ?? 0;
      }
    });

    return Object.entries(monthlyRevenue).map(([month, revenue]) => ({
      month,
      revenue: Math.round(revenue as number),
    }));
  };

  // Category breakdown by order type
  const getCategoryData = () => {
    const categoryRevenue = {};
    
    deliveredOrders.forEach(order => {
      const type = order.client_type ?? 'Other';
      categoryRevenue[type] = (categoryRevenue[type] ?? 0) + (order.total_value ?? 0);
    });

    const colors = {
      'Wedding': 'hsl(38, 45%, 55%)',
      'Corporate': 'hsl(200, 60%, 50%)',
      'Family': 'hsl(145, 50%, 40%)',
      'Individual': 'hsl(35, 15%, 60%)',
      'Government': 'hsl(250, 60%, 50%)',
      'Other': 'hsl(0, 0%, 50%)',
    };

    return Object.entries(categoryRevenue).map(([name, value]) => ({
      name,
      value: Math.round(value as number),
      color: colors[name as keyof typeof colors] || colors['Other'],
    }));
  };

  // Average margin calculation
  const avgMargin = menuItems.length > 0
    ? menuItems.reduce((acc, item) => acc + (item.margin_percent ?? 0), 0) / menuItems.length
    : 0;

  if (isLoading) {
    return (
      <DashboardLayout title="Profit Calculator" subtitle="Analyze your revenue and margins">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Profit Calculator" subtitle="Analyze your revenue and margins">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="stat-card bg-gradient-to-br from-gold/10 to-gold/5 border-gold/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-gold" />
            </div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </div>
          <p className="font-display text-3xl font-semibold text-foreground">
            Rs {(totalRevenue / 1000000).toFixed(2)}M
          </p>
          <p className="text-xs text-success mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> From {orders.length} orders
          </p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-warning" />
            </div>
            <p className="text-sm text-muted-foreground">Cost of Goods</p>
          </div>
          <p className="font-display text-3xl font-semibold text-foreground">
            Rs {(totalCOGS / 1000).toFixed(0)}K
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {purchases.length} purchases made
          </p>
        </div>

        <div className="stat-card bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <p className="text-sm text-muted-foreground">Gross Profit</p>
          </div>
          <p className="font-display text-3xl font-semibold text-foreground">
            Rs {(grossProfit / 1000000).toFixed(2)}M
          </p>
          <p className={`text-xs mt-1 flex items-center gap-1 ${grossProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
            {grossProfit >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {grossProfit >= 0 ? 'Positive margin' : 'Loss'}
          </p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
              <Percent className="w-5 h-5 text-info" />
            </div>
            <p className="text-sm text-muted-foreground">Profit Margin</p>
          </div>
          <p className="font-display text-3xl font-semibold text-foreground">
            {profitMargin}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Avg per dish: {avgMargin.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 card-premium p-6">
          <div className="mb-6">
            <h3 className="font-display text-lg font-semibold text-foreground">Profit Trend</h3>
            <p className="text-sm text-muted-foreground">Monthly revenue analysis</p>
          </div>
          
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={getMonthlyData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(38, 92%, 50%)" 
                strokeWidth={2}
                dot={{ fill: 'hsl(38, 92%, 50%)', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="card-premium p-6">
          <div className="mb-6">
            <h3 className="font-display text-lg font-semibold text-foreground">Revenue by Category</h3>
            <p className="text-sm text-muted-foreground">Order type distribution</p>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={getCategoryData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} (Rs ${(value / 1000).toFixed(0)}K)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {getCategoryData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Delivered Orders</p>
              <p className="font-display text-2xl font-semibold">{deliveredOrders.length}</p>
            </div>
            <Calculator className="w-8 h-8 text-gold opacity-20" />
          </div>
          <p className="text-xs text-muted-foreground">
            Avg profit per event: Rs {(avgProfitPerEvent / 1000).toFixed(1)}K
          </p>
        </div>

        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="font-display text-2xl font-semibold">{orders.length}</p>
            </div>
            <Receipt className="w-8 h-8 text-info opacity-20" />
          </div>
          <p className="text-xs text-muted-foreground">
            Avg order value: Rs {(totalRevenue / orders.length / 1000).toFixed(1)}K
          </p>
        </div>

        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Menu Items</p>
              <p className="font-display text-2xl font-semibold">{menuItems.length}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-success opacity-20" />
          </div>
          <p className="text-xs text-muted-foreground">
            Avg margin: {avgMargin.toFixed(1)}%
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
