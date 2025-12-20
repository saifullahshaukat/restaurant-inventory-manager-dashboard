import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useOrders, useCreateOrder, useUpdateOrder } from '@/hooks/api';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Plus, Search, Filter, Eye, Edit, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
  const [isNewOrderDialogOpen, setIsNewOrderDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    client_name: '',
    client_type: 'Individual' as ClientType,
    event_date: '',
    event_type: '',
    guest_count: '',
    price_per_head: '',
  });

  // API hooks
  const { data: orders = [], isLoading, error, refetch } = useOrders();
  const createOrder = useCreateOrder();
  const updateOrderStatus = useUpdateOrder();

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateOrder = async () => {
    if (!formData.client_name || !formData.event_date || !formData.guest_count || !formData.price_per_head) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createOrder.mutateAsync({
        client_name: formData.client_name,
        client_type: formData.client_type,
        event_date: formData.event_date,
        event_type: formData.event_type,
        guest_count: parseInt(formData.guest_count),
        price_per_head: parseFloat(formData.price_per_head),
        status: 'Inquiry',
      });
      toast.success('Order created successfully!');
      setIsNewOrderDialogOpen(false);
      setFormData({
        client_name: '',
        client_type: 'Individual',
        event_date: '',
        event_type: '',
        guest_count: '',
        price_per_head: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create order');
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus.mutateAsync({
        id: orderId,
        data: { status: newStatus as OrderStatus },
      });
      toast.success('Order status updated!');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout title="Orders" subtitle="Manage all your catering orders">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout title="Orders" subtitle="Manage all your catering orders">
        <div className="p-8 text-red-500 text-center">
          Failed to load orders. Make sure the backend server is running.
          <Button onClick={() => refetch()} className="mt-4">
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Orders" subtitle="Manage all your catering orders">
      {/* Dialog for New Order */}
      <Dialog open={isNewOrderDialogOpen} onOpenChange={setIsNewOrderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Client Name *</label>
              <Input
                placeholder="e.g., John Smith"
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Client Type</label>
              <Select value={formData.client_type} onValueChange={(value) => setFormData({ ...formData, client_type: value as ClientType })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Individual">Individual</SelectItem>
                  <SelectItem value="Corporate">Corporate</SelectItem>
                  <SelectItem value="Government">Government</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Event Date *</label>
              <Input
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Event Type</label>
              <Input
                placeholder="e.g., Wedding, Birthday, Conference"
                value={formData.event_type}
                onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Guest Count *</label>
              <Input
                type="number"
                placeholder="e.g., 50"
                value={formData.guest_count}
                onChange={(e) => setFormData({ ...formData, guest_count: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Price per Head (Rs) *</label>
              <Input
                type="number"
                placeholder="e.g., 500"
                value={formData.price_per_head}
                onChange={(e) => setFormData({ ...formData, price_per_head: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewOrderDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gold hover:bg-gold-light"
              onClick={handleCreateOrder}
              disabled={createOrder.isPending}
            >
              {createOrder.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Order
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Inquiry">Inquiry</SelectItem>
            <SelectItem value="Confirmed">Confirmed</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Button
          className="bg-gold hover:bg-gold-light text-primary-foreground"
          onClick={() => setIsNewOrderDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Order
        </Button>
      </div>

      {/* Orders Table */}
      <div className="card-premium overflow-hidden">
        {filteredOrders.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="font-display font-semibold">Order ID</TableHead>
                <TableHead className="font-display font-semibold">Client</TableHead>
                <TableHead className="font-display font-semibold">Event Date</TableHead>
                <TableHead className="font-display font-semibold">Guests</TableHead>
                <TableHead className="font-display font-semibold">Total</TableHead>
                <TableHead className="font-display font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id} className="border-border hover:bg-secondary/50">
                  <TableCell className="font-mono font-medium">{order.id}</TableCell>
                  <TableCell>{order.client_name}</TableCell>
                  <TableCell>{new Date(order.event_date).toLocaleDateString()}</TableCell>
                  <TableCell>{order.guest_count}</TableCell>
                  <TableCell className="font-semibold">Rs {(order.guest_count * order.price_per_head).toLocaleString()}</TableCell>
                  <TableCell>
                    <Select 
                      value={order.status} 
                      onValueChange={(value) => handleStatusChange(order.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inquiry">Inquiry</SelectItem>
                        <SelectItem value="Confirmed">Confirmed</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            No orders found. {orders.length === 0 ? 'Create your first order!' : 'Try different filters.'}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
