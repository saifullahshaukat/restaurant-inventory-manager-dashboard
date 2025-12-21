import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useOrders, useCreateOrder, useUpdateOrder, useDeleteOrder, useMenuItems } from '@/hooks/api';
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
import { Plus, Search, Filter, Eye, Edit, Trash2, Loader2, X } from 'lucide-react';
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
  const [orderType, setOrderType] = useState<'event' | 'solo'>('event');
  const [selectedMenuItems, setSelectedMenuItems] = useState<Array<{ id: string; name: string; price: number; quantity: number }>>([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedItemQuantity, setSelectedItemQuantity] = useState('1');
  const [formData, setFormData] = useState({
    client_name: '',
    client_type: 'Individual' as ClientType,
    event_date: '',
    event_type: '',
    guest_count: '',
    price_per_head: '',
    order_date: '',
    description: '',
    total_amount: '',
  });

  // API hooks
  const { data: orders = [], isLoading, error, refetch } = useOrders();
  const { data: menuItems = [] } = useMenuItems();
  const createOrder = useCreateOrder();
  const updateOrderStatus = useUpdateOrder();
  const deleteOrder = useDeleteOrder();

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Initialize form with today's date when dialog opens
  const handleDialogOpen = (open: boolean) => {
    setIsNewOrderDialogOpen(open);
    if (open && !formData.event_date && !formData.order_date) {
      const today = getTodayDate();
      setFormData(prev => ({
        ...prev,
        event_date: today,
        order_date: today,
      }));
    }
  };

  const handleAddMenuItem = () => {
    if (!selectedItemId || !selectedItemQuantity) {
      toast.error('Please select an item and quantity');
      return;
    }
    
    const item = menuItems.find(m => m.id === selectedItemId);
    if (!item) {
      toast.error('Menu item not found');
      return;
    }

    const quantity = parseInt(selectedItemQuantity);
    const itemPrice = item.selling_price ?? item.price ?? item.costPerServing ?? 0;
    
    if (itemPrice === 0) {
      toast.warning(`Warning: "${item.name}" has no price set in menu`);
    }
    
    const existingItem = selectedMenuItems.find(m => m.id === selectedItemId);
    
    if (existingItem) {
      // Update quantity if item already added
      setSelectedMenuItems(selectedMenuItems.map(m => 
        m.id === selectedItemId 
          ? { ...m, quantity: m.quantity + quantity }
          : m
      ));
    } else {
      // Add new item
      const itemPrice = item.selling_price ?? item.price ?? item.costPerServing ?? 0;
      setSelectedMenuItems([
        ...selectedMenuItems,
        {
          id: item.id,
          name: item.name,
          price: itemPrice,
          quantity,
        }
      ]);
    }

    setSelectedItemId('');
    setSelectedItemQuantity('1');
  };

  const handleRemoveMenuItem = (itemId: string) => {
    setSelectedMenuItems(selectedMenuItems.filter(m => m.id !== itemId));
  };

  const calculateTotal = () => {
    return selectedMenuItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Helper function to format price display
  const formatPrice = (amount: number) => {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toLocaleString();
  };

  const handleCreateOrder = async () => {
    if (orderType === 'event') {
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
          items: [{
            menu_item_id: null,
            item_name: `${formData.event_type} Event (${parseInt(formData.guest_count)} guests)`,
            quantity: parseInt(formData.guest_count),
            unit_price: parseFloat(formData.price_per_head),
          }],
        });
        toast.success('Event order created successfully!');
        setIsNewOrderDialogOpen(false);
        setFormData({
          client_name: '',
          client_type: 'Individual',
          event_date: '',
          event_type: '',
          guest_count: '',
          price_per_head: '',
          order_date: '',
          description: '',
          total_amount: '',
        });
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to create order');
      }
    } else {
      // Solo/Regular order
      if (!formData.client_name || !formData.order_date || selectedMenuItems.length === 0) {
        toast.error('Please fill in all required fields and select at least one menu item');
        return;
      }

      try {
        const total = calculateTotal();
        if (total === 0) {
          toast.error('Order total cannot be 0. Please check that menu items have prices set.');
          return;
        }
        const itemsDescription = selectedMenuItems
          .map(item => `${item.quantity}x ${item.name}`)
          .join(', ');

        await createOrder.mutateAsync({
          client_name: formData.client_name,
          client_type: formData.client_type,
          event_date: formData.order_date,
          event_type: 'Regular Order',
          guest_count: 1,
          price_per_head: total,
          items: selectedMenuItems.map(item => ({
            menu_item_id: item.id,
            item_name: item.name,
            quantity: item.quantity,
            unit_price: item.price,
          })),
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
          order_date: '',
          description: '',
          total_amount: '',
        });
        setSelectedMenuItems([]);
        setSelectedItemId('');
        setSelectedItemQuantity('1');
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to create order');
      }
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

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteOrder.mutateAsync(orderId);
        toast.success('Order deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete order');
      }
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
      <Dialog open={isNewOrderDialogOpen} onOpenChange={handleDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader className="pl-4">
            <DialogTitle>Create New Order</DialogTitle>
          </DialogHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto scrollbar-gold">
            <div className="pl-4 pr-6">
              {/* Order Type Selector */}
              <div className="flex gap-2 mb-4">
                <Button
                  variant={orderType === 'event' ? 'default' : 'outline'}
                  className={orderType === 'event' ? 'bg-gold hover:bg-gold-light' : ''}
                  onClick={() => setOrderType('event')}
                >
                  Event Order
                </Button>
                <Button
                  variant={orderType === 'solo' ? 'default' : 'outline'}
                  className={orderType === 'solo' ? 'bg-gold hover:bg-gold-light' : ''}
                  onClick={() => setOrderType('solo')}
                >
                  Regular Order
                </Button>
              </div>

              <div className="space-y-4">
                {/* Common Fields */}
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
                  <SelectItem value="Family">Family</SelectItem>
                  <SelectItem value="Wedding">Wedding</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Event Order Fields */}
            {orderType === 'event' && (
              <>
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

                {/* Auto-calculated Total for Event Orders */}
                {formData.guest_count && formData.price_per_head && (
                  <div className="p-3 bg-gold/10 border border-gold/20 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Estimated Total:</p>
                    <p className="text-lg font-semibold text-gold">
                      Rs {(parseInt(formData.guest_count) * parseFloat(formData.price_per_head) || 0).toLocaleString()}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Solo/Regular Order Fields */}
            {orderType === 'solo' && (
              <>
                <div>
                  <label className="text-sm font-medium">Order Date *</label>
                  <Input
                    type="date"
                    value={formData.order_date}
                    onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                  />
                </div>

                {/* Menu Item Selection */}
                <div className="space-y-3 border border-border rounded-lg p-3 bg-secondary/30">
                  <label className="text-sm font-medium">Select Items *</label>
                  
                  <div className="flex gap-2">
                    <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select a menu item..." />
                      </SelectTrigger>
                      <SelectContent>
                        {menuItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} - Rs {(item.selling_price ?? item.price ?? item.costPerServing ?? 0).toLocaleString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={selectedItemQuantity}
                      onChange={(e) => setSelectedItemQuantity(e.target.value)}
                      className="w-20"
                    />
                    
                    <Button
                      size="sm"
                      className="bg-gold hover:bg-gold-light"
                      onClick={handleAddMenuItem}
                    >
                      Add
                    </Button>
                  </div>

                  {/* Selected Items List */}
                  {selectedMenuItems.length > 0 && (
                    <div className="space-y-2 mt-3 max-h-48 overflow-y-auto scrollbar-gold">
                      <div className="text-xs font-medium text-muted-foreground sticky top-0 bg-secondary/30 py-1">Order Items:</div>
                      {selectedMenuItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between bg-background p-2 rounded border border-border">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.quantity}x {item.name}</p>
                            <p className="text-xs text-muted-foreground">Rs {(item.quantity * item.price).toLocaleString()}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveMenuItem(item.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <div className="border-t border-border pt-2 mt-2">
                        <p className="text-sm font-semibold flex justify-between">
                          <span>Total:</span>
                          <span className="text-gold">Rs {calculateTotal().toLocaleString()}</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
              </div>
            </div>          <DialogFooter className="border-t border-border pt-4 mt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsNewOrderDialogOpen(false);
                setSelectedMenuItems([]);
                setSelectedItemId('');
                setSelectedItemQuantity('1');
              }}
            >
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
                <TableHead className="font-display font-semibold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id} className="border-border hover:bg-secondary/50">
                  <TableCell className="font-mono font-medium">{order.id}</TableCell>
                  <TableCell>{order.client_name}</TableCell>
                  <TableCell>{new Date(order.event_date).toLocaleDateString()}</TableCell>
                  <TableCell>{order.guest_count}</TableCell>
                  <TableCell className="font-semibold">Rs {formatPrice(order.total_value ?? (order.guest_count ?? 0) * (order.price_per_head ?? 0))}</TableCell>
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
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteOrder(order.id)}
                      disabled={deleteOrder.isPending}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
