import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockOrders, mockPurchases, mockMenuItems, monthlyRevenueData } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Receipt, Percent, Calculator } from 'lucide-react';

export default function ProfitPage() {
  // Calculate profit metrics
  const totalRevenue = mockOrders.reduce((acc, order) => acc + order.totalValue, 0);
  const totalCOGS = mockPurchases.reduce((acc, p) => acc + p.cost, 0);
  const grossProfit = totalRevenue - totalCOGS;
  const profitMargin = ((grossProfit / totalRevenue) * 100).toFixed(1);

  // Per-event profit
  const eventsCompleted = mockOrders.filter(o => o.status === 'Delivered' || o.status === 'Closed').length;
  const avgProfitPerEvent = eventsCompleted > 0 ? grossProfit / eventsCompleted : 0;

  // Category breakdown for pie chart
  const categoryData = [
    { name: 'Wedding', value: 875000, color: 'hsl(38, 45%, 55%)' },
    { name: 'Corporate', value: 90000, color: 'hsl(200, 60%, 50%)' },
    { name: 'Family', value: 216000, color: 'hsl(145, 50%, 40%)' },
    { name: 'Individual', value: 37500, color: 'hsl(35, 15%, 60%)' },
  ];

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
            <TrendingUp className="w-3 h-3" /> +12% from last month
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
            Direct ingredient costs
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
          <p className="text-xs text-success mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Healthy margins
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
            Industry avg: 35%
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 card-premium p-6">
          <div className="mb-6">
            <h3 className="font-display text-lg font-semibold text-foreground">Profit Trend</h3>
            <p className="text-sm text-muted-foreground">Monthly profit analysis</p>
          </div>
          
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`Rs ${value.toLocaleString()}`, 'Profit']}
              />
              <Bar 
                dataKey="profit" 
                fill="hsl(var(--success))" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Category */}
        <div className="card-premium p-6">
          <div className="mb-6">
            <h3 className="font-display text-lg font-semibold text-foreground">Revenue by Client</h3>
            <p className="text-sm text-muted-foreground">Distribution analysis</p>
          </div>
          
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`Rs ${(value / 1000).toFixed(0)}K`, '']}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-2 mt-4">
            {categoryData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-medium">Rs {(item.value / 1000).toFixed(0)}K</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dish Profitability */}
      <div className="card-premium p-6">
        <div className="mb-6">
          <h3 className="font-display text-lg font-semibold text-foreground">Dish Profitability</h3>
          <p className="text-sm text-muted-foreground">Margin analysis per menu item</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {mockMenuItems.map((item) => (
            <div key={item.id} className="p-4 rounded-lg bg-secondary/30 border border-border/50">
              <p className="font-medium text-foreground text-sm mb-2">{item.name}</p>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-muted-foreground">Cost: Rs {item.costPerServing}</span>
                <span className="text-gold font-medium">Price: Rs {item.sellingPrice}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-success to-success/70 rounded-full"
                  style={{ width: `${item.marginPercent}%` }}
                />
              </div>
              <p className="text-xs text-success font-semibold mt-1">{item.marginPercent}% margin</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
