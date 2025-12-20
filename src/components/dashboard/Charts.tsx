import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { monthlyRevenueData, bestSellingDishes } from '@/data/mockData';

export function RevenueChart() {
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
        <BarChart data={monthlyRevenueData} barGap={4}>
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
            formatter={(value: number) => [`Rs ${value.toLocaleString()}`, '']}
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

export function BestSellersChart() {
  return (
    <div className="card-premium p-6">
      <div className="mb-6">
        <h3 className="font-display text-lg font-semibold text-foreground">Best Selling Dishes</h3>
        <p className="text-sm text-muted-foreground">Top performers this month</p>
      </div>
      
      <div className="space-y-4">
        {bestSellingDishes.map((dish, index) => (
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
                  style={{ width: `${(dish.orders / 52) * 100}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-semibold text-gold">
              Rs {(dish.revenue / 1000).toFixed(0)}K
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
