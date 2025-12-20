/**
 * API INTEGRATION GUIDE FOR DEVELOPERS
 * 
 * This guide shows how to update each frontend page component
 * to fetch and display real data from the PostgreSQL database via the backend API.
 * 
 * PREREQUISITES:
 * - Backend server running: npm run dev:backend
 * - Database set up with schema.sql executed
 * - .env file configured with DATABASE_URL
 */

// ============================================================================
// OVERVIEW: How It Works
// ============================================================================

/*
Architecture:
  User interacts with React component
       ↓
  Component calls API hook (e.g., useMenuItems())
       ↓
  Hook uses React Query to fetch from backend (src/lib/api.ts)
       ↓
  Backend Express server queries PostgreSQL database (server.js)
       ↓
  Data returns to component as state
       ↓
  Component renders with real data from database

The hooks handle:
- Loading states
- Error handling
- Caching (React Query)
- Automatic refetching when data changes
- Mutations (create, update, delete operations)
*/

// ============================================================================
// INTEGRATION CHECKLIST: Steps for Each Page
// ============================================================================

/*
For EVERY page (MenuPage, InventoryPage, OrdersPage, etc.):

1. REMOVE mock data import
   - Delete: import { mockMenuItems } from '@/data/mockData';

2. ADD API hooks import
   - Add: import { useMenuItems, useCreateMenuItem } from '@/hooks/api';

3. REPLACE state with hooks
   - Before: const [items] = useState(mockItems);
   - After:  const { data: items = [], isLoading, error } = useMenuItems();

4. ADD loading/error UI
   ```typescript
   if (isLoading) return <Spinner />;
   if (error) return <ErrorMessage />;
   ```

5. CREATE a dialog/form component for adding new items

6. WIRE UP buttons to mutations
   - "Add" button → onClick={() => setIsDialogOpen(true)}
   - Form submit → await createMenuItem.mutateAsync(formData)
   - "Delete" button → await deleteMenuItem.mutateAsync(itemId)

7. ADD toast notifications
   ```typescript
   import { toast } from 'sonner';
   toast.success('Item created!');
   toast.error('Failed to create item');
   ```

8. TEST in browser
   - Should fetch real data from database
   - Should be able to add/edit/delete items
   - Should show loading states
   - Should show error messages
*/

// ============================================================================
// 1. MENU PAGE (src/pages/MenuPage.tsx)
// ============================================================================

/*
GOAL: Replace mock menu items with real data from database

STEP 1: Update imports
```typescript
// REMOVE THIS:
import { mockMenuItems } from '@/data/mockData';

// ADD THESE:
import { useMenuItems, useCreateMenuItem, useDeleteMenuItem, useUpdateMenuItem } from '@/hooks/api';
import { toast } from 'sonner';
```

STEP 2: Replace mock data with API hook
```typescript
// REMOVE THIS:
const [menuItems] = useState<MenuItem[]>(mockMenuItems);

// ADD THIS:
const { data: menuItems = [], isLoading, error } = useMenuItems();
const createMenuItem = useCreateMenuItem();
const updateMenuItem = useUpdateMenuItem();
const deleteMenuItem = useDeleteMenuItem();
```

STEP 3: Add loading/error states
```typescript
if (isLoading) {
  return (
    <DashboardLayout title="Menu & Costing">
      <div className="p-8 text-center">Loading menu items...</div>
    </DashboardLayout>
  );
}

if (error) {
  return (
    <DashboardLayout title="Menu & Costing">
      <div className="p-8 text-red-500">Failed to load menu items</div>
    </DashboardLayout>
  );
}
```

STEP 4: Create AddDishDialog component
Create a new file: src/components/dialogs/AddDishDialog.tsx
```typescript
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateMenuItem } from '@/hooks/api';
import { useState } from 'react';
import { toast } from 'sonner';

export function AddDishDialog({ open, onOpenChange }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Main',
    cost_per_serving: 0,
    selling_price: 0,
  });
  
  const createMenuItem = useCreateMenuItem();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMenuItem.mutateAsync(formData);
      toast.success('Dish added successfully!');
      onOpenChange(false);
      setFormData({ name: '', description: '', category: 'Main', cost_per_serving: 0, selling_price: 0 });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add dish');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Dish</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Dish name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <Input
            placeholder="Cost per serving"
            type="number"
            value={formData.cost_per_serving}
            onChange={(e) => setFormData({ ...formData, cost_per_serving: parseFloat(e.target.value) })}
            required
          />
          <Input
            placeholder="Selling price"
            type="number"
            value={formData.selling_price}
            onChange={(e) => setFormData({ ...formData, selling_price: parseFloat(e.target.value) })}
            required
          />
          <Button type="submit" className="w-full bg-gold text-primary-foreground">
            Add Dish
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

STEP 5: Wire up the "Add Dish" button in MenuPage
```typescript
const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

// In JSX, change the "Add Dish" button:
<Button 
  className="bg-gold hover:bg-gold-light"
  onClick={() => setIsAddDialogOpen(true)}
>
  <Plus className="w-4 h-4 mr-2" />
  Add Dish
</Button>

// And add the dialog:
<AddDishDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
```

STEP 6: Wire up delete buttons
In the table where you display menu items:
```typescript
<Button
  variant="ghost"
  size="sm"
  onClick={() => handleDeleteDish(item.id)}
>
  <Trash2 className="w-4 h-4" />
</Button>

// Add the handler:
const handleDeleteDish = async (id) => {
  if (confirm('Are you sure?')) {
    try {
      await deleteMenuItem.mutateAsync(id);
      toast.success('Dish deleted');
    } catch (error) {
      toast.error('Failed to delete dish');
    }
  }
};
```

RESULT: MenuPage now fetches real dishes from database!
*/

// ============================================================================
// 2. INVENTORY PAGE (src/pages/InventoryPage.tsx)
// ============================================================================

/*
GOAL: Replace mock inventory with real data

SAME PATTERN AS MENU PAGE:

1. Import hooks:
```typescript
import { useInventory, useLowStockItems, useCreateInventoryItem, useUpdateStock } from '@/hooks/api';
```

2. Replace mock data:
```typescript
const { data: inventory = [], isLoading } = useInventory();
const { data: lowStockItems = [] } = useLowStockItems();
```

3. Add loading/error UI

4. Create AddInventoryItemDialog component

5. Wire up "Add Item" button

6. Wire up stock update functionality

KEY DIFFERENCE: This page shows two data sources
- useInventory() → all items
- useLowStockItems() → items with current_stock <= minimum_stock

Use both hooks to power different sections of the page!

ADDITIONAL FEATURE:
For stock updates in the table, add an "Update Stock" action:
```typescript
const handleAddStock = async (itemId, quantity) => {
  try {
    await updateStock.mutateAsync(itemId, {
      quantity,
      movement_type: 'Received',
      reference_id: 'manual-update'
    });
    toast.success('Stock updated');
  } catch (error) {
    toast.error('Failed to update stock');
  }
};
```
*/

// ============================================================================
// 3. ORDERS PAGE (src/pages/OrdersPage.tsx)
// ============================================================================

/*
GOAL: Replace mock orders with real data

PATTERN:

1. Import hooks:
```typescript
import { useOrders, useCreateOrder, useUpdateOrder } from '@/hooks/api';
```

2. Replace mock data:
```typescript
const { data: orders = [], isLoading } = useOrders();
```

3. Add loading/error states

4. Create NewOrderDialog component with form

5. Wire up "New Order" button

6. Wire up status update dropdown:
```typescript
const handleStatusChange = async (orderId, newStatus) => {
  try {
    await updateOrder.mutateAsync(orderId, { status: newStatus });
    toast.success('Order updated');
  } catch (error) {
    toast.error('Failed to update order');
  }
};
```

FORM FIELDS NEEDED:
- client_name (text)
- client_type (select: Wedding, Corporate, Family, Individual)
- event_date (date picker)
- event_type (text)
- guest_count (number)
- price_per_head (number)
- items (array - optional for MVP)
*/

// ============================================================================
// 4. PURCHASES PAGE (src/pages/PurchasesPage.tsx)
// ============================================================================

/*
GOAL: Replace mock purchases with real data

PATTERN (Same as Orders and Inventory):

1. Import hooks:
```typescript
import { usePurchases, useCreatePurchase, useUpdatePurchase } from '@/hooks/api';
```

2. Replace mock data:
```typescript
const { data: purchases = [], isLoading } = usePurchases();
```

3. Create LogPurchaseDialog component

4. Wire up "Log Purchase" button

5. Wire up status/payment status updates

FORM FIELDS:
- supplier_id / supplier_name (dropdown)
- purchase_date (date)
- items (array of inventory items + quantities)
- total_amount (auto-calculated)
*/

// ============================================================================
// 5. HEADER - Profile Dropdown & Search
// ============================================================================

/*
FILE: src/components/layout/Header.tsx

PROFILE DROPDOWN:

1. Import hook:
```typescript
import { useProfile } from '@/hooks/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
```

2. Get profile data:
```typescript
const { data: profile } = useProfile();
```

3. Replace button with dropdown:
```typescript
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full bg-gold/10">
      <User className="w-5 h-5 text-gold" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-56">
    <DropdownMenuLabel>
      <div>
        <p className="font-semibold">{profile?.name}</p>
        <p className="text-sm text-muted-foreground">{profile?.email}</p>
        <p className="text-xs text-muted-foreground">{profile?.city}</p>
      </div>
    </DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile Settings</DropdownMenuItem>
    <DropdownMenuItem>Logout</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

SEARCH BAR:

1. Import hook:
```typescript
import { useSearch } from '@/hooks/api';
import { useNavigate } from 'react-router-dom';
```

2. Add search state:
```typescript
const [searchQuery, setSearchQuery] = useState('');
const { data: searchResults = {} } = useSearch(searchQuery);
const navigate = useNavigate();
```

3. Update input:
```typescript
<Input 
  placeholder="Search orders, menu..." 
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>
```

4. Show results dropdown:
```typescript
{searchQuery && searchResults.orders?.length > 0 && (
  <div className="absolute top-full mt-2 w-full bg-card border rounded shadow-lg">
    {searchResults.orders?.map(item => (
      <div 
        key={item.id}
        className="p-2 hover:bg-secondary cursor-pointer"
        onClick={() => {
          navigate(`/orders/${item.id}`);
          setSearchQuery('');
        }}
      >
        {item.name}
      </div>
    ))}
  </div>
)}
```
*/

// ============================================================================
// COMMON PATTERNS & BEST PRACTICES
// ============================================================================

/*
LOADING STATE:
```typescript
if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
```

MUTATION WITH ERROR HANDLING:
```typescript
const handleCreate = async (data) => {
  try {
    await createMutation.mutateAsync(data);
    toast.success('Created successfully!');
    // Close dialog, clear form, etc.
  } catch (error) {
    const errorMsg = error.response?.data?.error || 'An error occurred';
    toast.error(errorMsg);
  }
};
```

DISPLAYING LIST WITH EMPTY STATE:
```typescript
{menuItems && menuItems.length > 0 ? (
  <Table>
    {/* table content */}
  </Table>
) : (
  <div className="p-8 text-center text-muted-foreground">
    No items found. <Button onClick={() => setIsDialogOpen(true)}>Add one</Button>
  </div>
)}
```

CONFIRMATION BEFORE DELETE:
```typescript
const handleDelete = async (id) => {
  if (!window.confirm('Are you sure you want to delete this?')) return;
  
  try {
    await deleteMutation.mutateAsync(id);
    toast.success('Deleted successfully!');
  } catch (error) {
    toast.error('Failed to delete');
  }
};
```

FILTERING (Frontend-side):
```typescript
const filteredItems = menuItems.filter(item => {
  const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
  return matchesSearch && matchesCategory;
});
```
*/

// ============================================================================
// TESTING YOUR INTEGRATIONS
// ============================================================================

/*
CHECKLIST FOR EACH PAGE:

✓ Data loads on component mount (useEffect or hook auto-runs)
✓ Loading spinner shows while fetching
✓ Error message shows if API fails
✓ Data displays correctly in table/list
✓ "Add" button opens dialog
✓ Form validates input
✓ Submit button creates new item in database
✓ List updates immediately after adding (React Query refetch)
✓ Delete button removes item from database
✓ Delete has confirmation dialog
✓ All operations show toast notifications
✓ No console errors

IF SOMETHING ISN'T WORKING:

1. Check browser DevTools → Network tab
   - Is API call being made?
   - What's the response status?
   - Any error messages?

2. Check browser DevTools → Console tab
   - Any red error messages?

3. Check backend terminal
   - Is backend still running?
   - Any error messages when API was called?

4. Test API directly in browser:
   - Go to: http://localhost:5000/api/menu-items
   - Does it return JSON data?
   - If not, backend has problem (not your component)

5. Check that:
   - Backend is running: npm run dev:backend
   - Database is connected
   - .env has correct DATABASE_URL
   - All dependencies installed: npm install
*/

export default {};

// ============================================================================
// 2. INVENTORY PAGE - Integration Example
// ============================================================================

/*
BEFORE:
```typescript
import { mockInventory } from '@/data/mockData';

export default function InventoryPage() {
  const [inventory] = useState<InventoryItem[]>(mockInventory);
  // ...
}
```

AFTER:
```typescript
import { useInventory, useLowStockItems, useCreateInventoryItem, useUpdateStock } from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function InventoryPage() {
  const { data: inventory = [], isLoading } = useInventory();
  const { data: lowStock = [] } = useLowStockItems();
  const createItem = useCreateInventoryItem();
  const updateStock = useUpdateStock();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleAddItem = async (formData) => {
    try {
      await createItem.mutateAsync(formData);
      toast.success('Item added to inventory!');
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Failed to add item');
    }
  };

  const handleUpdateStock = async (itemId, quantity) => {
    try {
      await updateStock.mutateAsync(itemId, {
        quantity,
        movement_type: 'Purchase',
      });
      toast.success('Stock updated!');
    } catch (error) {
      toast.error('Failed to update stock');
    }
  };

  // ... rest of component
}
```

STEPS TO IMPLEMENT:
1. Import hooks: `import { useInventory, useLowStockItems, useCreateInventoryItem, useUpdateStock } from '@/hooks/api';`
2. Replace mockInventory with useInventory() hook
3. Add LowStockAlert component that uses useLowStockItems()
4. Create dialog for "Add Item" button
5. Connect form submission to createItem.mutateAsync()
6. Connect stock update to updateStock.mutateAsync()
*/

// ============================================================================
// 3. ORDERS PAGE - Integration Example
// ============================================================================

/*
BEFORE:
```typescript
import { mockOrders } from '@/data/mockData';

export default function OrdersPage() {
  const [orders] = useState<Order[]>(mockOrders);
  // ...
}
```

AFTER:
```typescript
import { useOrders, useCreateOrder, useUpdateOrder } from '@/hooks/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function OrdersPage() {
  const { data: orders = [], isLoading } = useOrders();
  const createOrder = useCreateOrder();
  const updateOrder = useUpdateOrder();
  const [isNewOrderDialog, setIsNewOrderDialog] = useState(false);

  const handleCreateOrder = async (formData) => {
    try {
      await createOrder.mutateAsync(formData);
      toast.success('Order created successfully!');
      setIsNewOrderDialog(false);
    } catch (error) {
      toast.error('Failed to create order');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateOrder.mutateAsync(orderId, { status: newStatus });
      toast.success('Order status updated!');
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  // ... rest of component
}
```

STEPS TO IMPLEMENT:
1. Import hooks: `import { useOrders, useCreateOrder, useUpdateOrder } from '@/hooks/api';`
2. Replace mockOrders with useOrders()
3. Create "New Order" dialog
4. Connect form to createOrder.mutateAsync()
5. Add status update buttons that call updateOrder.mutateAsync()
*/

// ============================================================================
// 4. HEADER SEARCH - Integration Example
// ============================================================================

/*
BEFORE:
```typescript
export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header>
      <Input placeholder="Search orders, menu..." />
      {/* Placeholder button */}
    </header>
  );
}
```

AFTER:
```typescript
import { useSearch } from '@/hooks/api';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Header({ title, subtitle }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: searchResults = {} } = useSearch(searchQuery);
  const navigate = useNavigate();

  const handleSearchSelect = (item) => {
    switch (item.type) {
      case 'order':
        navigate(`/orders/${item.id}`);
        break;
      case 'menu':
        navigate(`/menu/${item.id}`);
        break;
      case 'inventory':
        navigate(`/inventory/${item.id}`);
        break;
    }
    setSearchQuery('');
  };

  return (
    <header>
      <div className="relative">
        <Input 
          placeholder="Search orders, menu..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <div className="absolute top-full mt-2 w-full bg-card border rounded shadow-lg">
            {/* Display search results */}
            {searchResults.orders?.map(item => (
              <div 
                key={item.id} 
                onClick={() => handleSearchSelect(item)}
                className="p-2 hover:bg-secondary cursor-pointer"
              >
                {item.name}
              </div>
            ))}
            {/* ... menu items and inventory */}
          </div>
        )}
      </div>
    </header>
  );
}
```

STEPS TO IMPLEMENT:
1. Import hook: `import { useSearch } from '@/hooks/api';`
2. Add searchQuery state
3. Connect input to setSearchQuery
4. Display search results in dropdown
5. Handle search result clicks to navigate to detail pages
*/

// ============================================================================
// 5. PROFILE DROPDOWN - Integration Example
// ============================================================================

/*
BEFORE:
```typescript
<Button variant="ghost" size="icon">
  <User className="w-5 h-5" />
</Button>
```

AFTER:
```typescript
import { useProfile } from '@/hooks/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const { data: profile } = useProfile();

  return (
    <header>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full bg-gold/10">
            <User className="w-5 h-5 text-gold" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div>
              <p className="font-semibold">{profile?.name || 'Loading...'}</p>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
              <p className="text-xs text-muted-foreground">{profile?.city}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile Settings</DropdownMenuItem>
          <DropdownMenuItem>Business Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-500">Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
```

STEPS TO IMPLEMENT:
1. Import hook: `import { useProfile } from '@/hooks/api';`
2. Add DropdownMenu components
3. Display profile data (name, email, city)
4. Add menu items for settings and logout
*/

// ============================================================================
// 6. PURCHASES PAGE - Integration Example
// ============================================================================

/*
BEFORE:
```typescript
const [purchases] = useState(mockPurchases);
```

AFTER:
```typescript
import { usePurchases, useCreatePurchase, useUpdatePurchase } from '@/hooks/api';

export default function PurchasesPage() {
  const { data: purchases = [], isLoading } = usePurchases();
  const createPurchase = useCreatePurchase();
  const updatePurchase = useUpdatePurchase();

  const handleLogPurchase = async (formData) => {
    try {
      await createPurchase.mutateAsync(formData);
      toast.success('Purchase logged successfully!');
    } catch (error) {
      toast.error('Failed to log purchase');
    }
  };

  // ... rest of component
}
```

STEPS TO IMPLEMENT:
1. Import hooks: `import { usePurchases, useCreatePurchase } from '@/hooks/api';`
2. Replace mock data with usePurchases()
3. Connect "Log Purchase" button to createPurchase.mutateAsync()
4. Add form for purchase details (supplier, items, date, etc.)
*/

// ============================================================================
// COMMON PATTERNS & BEST PRACTICES
// ============================================================================

/*
1. LOADING STATES:
```typescript
if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
```

2. MUTATIONS WITH ERROR HANDLING:
```typescript
const handleAction = async (data) => {
  try {
    await mutation.mutateAsync(data);
    toast.success('Success message');
  } catch (error) {
    toast.error(error.response?.data?.error || 'An error occurred');
  }
};
```

3. REFETCHING DATA:
```typescript
// Automatically refetches when component mounts
const { refetch } = useMenuItems();

// Manual refetch
const handleRefresh = () => refetch();
```

4. FILTERING & PAGINATION (Frontend):
```typescript
const { data: allItems = [] } = useInventory();
const [searchTerm, setSearchTerm] = useState('');

const filteredItems = allItems.filter(item =>
  item.name.toLowerCase().includes(searchTerm.toLowerCase())
);
```

5. COMBINING MULTIPLE QUERIES:
```typescript
const { data: orders } = useOrders();
const { data: lowStockItems } = useLowStockItems();

// Use both data sources
const combinedData = { orders, lowStockItems };
```
*/

// ============================================================================
// DIALOG/FORM COMPONENTS TO CREATE
// ============================================================================

/*
You'll need to create these dialog components:

1. AddDishDialog - for MenuPage "Add Dish" button
2. AddInventoryItemDialog - for InventoryPage "Add Item" button
3. NewOrderDialog - for OrdersPage "New Order" button
4. LogPurchaseDialog - for PurchasesPage "Log Purchase" button
5. SearchResultsDropdown - for Header search bar

Each dialog should have:
- Form fields for required data
- Validation
- Submit handler using the appropriate mutation hook
- Error/success handling with toast notifications
- Close on success
*/

// ============================================================================
// API RESPONSE FORMAT
// ============================================================================

/*
All API endpoints return responses in this format:

SUCCESS (200):
{
  "success": true,
  "data": { /* actual data */ }
  "message": "Optional success message"
}

ERROR (4xx/5xx):
{
  "success": false,
  "error": "Error message"
}

When using hooks, the data is automatically extracted from response.data.data
*/

export default {};
