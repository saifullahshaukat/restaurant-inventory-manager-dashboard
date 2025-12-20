import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Order } from '@/types';

interface RevenueChartProps {
  orders: Order[];
  purchases: any[];
}

export function RevenueChart({ orders = [], purchases = [] }: RevenueChartProps) {
  // Calculate monthly revenue from delivered/closed orders
  const monthlyData = {} as Record<string, { revenue: number; profit: number }>;
  const currentDate = new Date();
  
  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() - i);
    const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
    monthlyData[monthKey] = { revenue: 0, profit: 0 };
  }

  // Sum delivered orders revenue
  const deliveredOrders = orders.filter(o => o.status === 'Delivered' || o.status === 'Closed');
  deliveredOrders.forEach(order => {
    const orderDate = new Date(order.event_date);
    const monthKey = orderDate.toLocaleDateString('en-US', { month: 'short' });
    if (monthKey in monthlyData) {
      monthlyData[monthKey].revenue += order.total_value ?? 0;
    }
  });

  // Calculate profit (revenue - COGS)
  const totalCOGS = purchases.reduce((acc, p) => acc + ((p.quantity ?? 0) * (p.unit_price ?? 0)), 0);
  const totalRevenue = deliveredOrders.reduce((acc, o) => acc + (o.total_value ?? 0), 0);
  const totalProfit = totalRevenue - totalCOGS;
  const profitPerMonth = totalProfit / 6;
  
  Object.keys(monthlyData).forEach(month => {
    monthlyData[month].profit = profitPerMonth > 0 ? profitPerMonth : 0;
  });

  const chartData = Object.entries(monthlyData).map(([month, data]) => ({
    month,
    revenue: data.revenue,
    profit: data.profit,
  }));

  return (
    <div className="card-premium p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">Revenue Overview</h3>
          <p className="text-sm text-muted-foreground">Monthly revenue and profit trends</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gold" />
            <span className="text-muted-foreground">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-success" />
            <span className="text-muted-foreground">Profit</span>
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} barGap={4}>
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
            tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              boxShadow: 'var(--shadow-card)',
            }}
            formatter={(value: number) => [`Rs ${(value / 1000).toFixed(0)}K`, '']}
            labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
          />
          <Bar 
            dataKey="revenue" 
            fill="hsl(var(--gold))" 
            radius={[4, 4, 0, 0]} 
            name="Revenue"
          />
          <Bar 
            dataKey="profit" 
            fill="hsl(var(--success))" 
            radius={[4, 4, 0, 0]} 
            name="Profit"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface BestSellersChartProps {
  orders: Order[];
}

export function BestSellersChart({ orders = [] }: BestSellersChartProps) {
  // Calculate best selling dishes from order items
  const dishSales = {} as Record<string, { orders: number; revenue: number }>;
  
  orders.forEach(order => {
    // For now, estimate based on total order value
    // In a real scenario, you'd have order_items table
    if (order.total_value) {
      const estimatedDishName = `Event Order`;
      dishSales[estimatedDishName] = (dishSales[estimatedDishName] || { orders: 0, revenue: 0 });
      dishSales[estimatedDishName].orders += 1;
      dishSales[estimatedDishName].revenue += order.total_value;
    }
  });

  const topDishes = Object.entries(dishSales)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="card-premium p-6">
      <div className="mb-6">
        <h3 className="font-display text-lg font-semibold text-foreground">Best Selling Dishes</h3>
        <p className="text-sm text-muted-foreground">Top performers this month</p>
      </div>
      
      <div className="space-y-4">
        {topDishes.length > 0 ? (
          topDishes.map((dish, index) => (
            <div key={dish.name} className="flex items-center gap-4">
              <span className="w-6 h-6 rounded-full bg-gold/10 text-gold text-xs font-bold flex items-center justify-center">
                {index + 1}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-foreground">{dish.name}</span>
                  <span className="text-xs text-muted-foreground">{dish.orders} orders</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full transition-all duration-500"
                    style={{ width: `${(dish.orders / (topDishes[0]?.orders || 1)) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-semibold text-gold">
                Rs {((dish.revenue ?? 0) / 1000).toFixed(0)}K
              </span>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-sm">No sales data available</p>
        )}
      </div>
    </div>
  );
}
