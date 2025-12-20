import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockOrders } from '@/data/mockData';
import { Order, OrderStatus, ClientType } from '@/types';
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
import { cn } from '@/lib/utils';
import { Plus, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';

const statusColors: Record<string, string> = {
  'Inquiry': 'bg-info/10 text-info border-info/20',
  'Confirmed': 'bg-gold/10 text-gold border-gold/20',
  'In Progress': 'bg-warning/10 text-warning border-warning/20',
  'Delivered': 'bg-success/10 text-success border-success/20',
  'Closed': 'bg-muted text-muted-foreground border-muted',
};

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [orders] = useState<Order[]>(mockOrders);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout title="Orders" subtitle="Manage all your catering orders">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by client name or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Inquiry">Inquiry</SelectItem>
            <SelectItem value="Confirmed">Confirmed</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Button className="bg-gold hover:bg-gold-light text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          New Order
        </Button>
      </div>

      {/* Orders Table */}
      <div className="card-premium overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="font-display font-semibold">Order ID</TableHead>
              <TableHead className="font-display font-semibold">Client</TableHead>
              <TableHead className="font-display font-semibold">Type</TableHead>
              <TableHead className="font-display font-semibold">Event Date</TableHead>
              <TableHead className="font-display font-semibold">Guests</TableHead>
              <TableHead className="font-display font-semibold">Total Value</TableHead>
              <TableHead className="font-display font-semibold">Status</TableHead>
              <TableHead className="font-display font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id} className="group hover:bg-gold/5">
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {order.id}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-foreground">{order.clientName}</p>
                    <p className="text-xs text-muted-foreground">{order.eventType}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">{order.clientType}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {new Date(order.eventDate).toLocaleDateString('en-PK', { 
                      day: 'numeric', 
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{order.guestCount}</span>
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-gold">
                    Rs {order.totalValue.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge className={cn("border", statusColors[order.status])}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredOrders.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No orders found matching your criteria.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
