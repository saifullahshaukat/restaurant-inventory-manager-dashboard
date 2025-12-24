# Backend API Setup Guide

This guide explains how to set up and run the backend API server that powers the Restaurant Inventory Manager dashboard.

## Prerequisites

Before starting the backend, make sure you have:

- ✅ Node.js 18+ installed
- ✅ PostgreSQL database set up (see [DATABASE_SETUP.md](DATABASE_SETUP.md))
- ✅ `.env` file configured with `DATABASE_URL` and other settings
- ✅ npm dependencies installed: `npm install`

## Getting Started

### Option 1: Run Backend Only

```bash
npm run dev:backend
```

This starts the Express.js server on `http://localhost:5000`

### Option 2: Run Frontend Only

```bash
npm run dev
```

This starts the Vite dev server on `http://localhost:8080`

### Option 3: Run Both Simultaneously

First, install concurrently:
```bash
npm install -D concurrently
```

Then run:
```bash
npm run dev:both
```

This runs both frontend (port 8080) and backend (port 5000) in the same terminal.

## Testing Backend Connection

Once the backend is running, test the API endpoints:

**Option 1: Browser**
```
http://localhost:5000/api/menu-items
http://localhost:5000/api/inventory
http://localhost:5000/api/orders
http://localhost:5000/api/profile
```

**Option 2: curl**
```bash
curl http://localhost:5000/api/menu-items
curl http://localhost:5000/api/profile
```

**Option 3: Postman**
- Import endpoints from the API documentation below
- All endpoints accept JSON
- No authentication required for MVP

---

## Next Steps: Wire Frontend to Backend

The API server is running, but the frontend pages still need to be updated to use real data from the backend instead of mock data.

### Files You Have

1. **`src/lib/api.ts`** - API service layer (handles HTTP requests)
2. **`src/hooks/api.ts`** - React hooks for data fetching (handles state & caching)
3. **`API_INTEGRATION_GUIDE.md`** - Step-by-step integration instructions
4. **`server.js`** - The Express backend (already implemented)

### Update Each Page

Follow `API_INTEGRATION_GUIDE.md` to update:

- [ ] **MenuPage** - Add real menu items
  - Replace `mockMenuItems` with `useMenuItems()` hook
  - Connect "Add Dish" button to `useCreateMenuItem()`
  - Connect delete buttons to `useDeleteMenuItem()`

- [ ] **InventoryPage** - Add real inventory items
  - Replace `mockInventory` with `useInventory()` hook
  - Update "Add Item" to create real items
  - Wire up stock updates

- [ ] **OrdersPage** - Add real orders
  - Replace `mockOrders` with `useOrders()` hook
  - Create new order dialog
  - Update order status

- [ ] **PurchasesPage** - Add real purchases
  - Replace mock data with `usePurchases()` hook
  - Create "Log Purchase" dialog

- [ ] **Header.tsx** - Profile & Search
  - Add profile dropdown with `useProfile()` hook
  - Add search bar with `useSearch()` hook
  - Show real business name and email

---

## API Endpoints Available

### Menu Items
```
GET    /api/menu-items
POST   /api/menu-items
PUT    /api/menu-items/:id
DELETE /api/menu-items/:id
```

### Inventory
```
GET    /api/inventory
POST   /api/inventory
PUT    /api/inventory/:id
PUT    /api/inventory/:id/stock
```

### Purchases
```
GET    /api/purchases
POST   /api/purchases
PUT    /api/purchases/:id
```

### Orders
```
GET    /api/orders
POST   /api/orders
PUT    /api/orders/:id
```

### Other
```
GET    /api/search?q=query
GET    /api/profile
GET    /api/dashboard/stats
GET    /health
```

---

## Example: Updating MenuPage

Here's what to change in `src/pages/MenuPage.tsx`:

**BEFORE:**
```typescript
import { mockMenuItems } from '@/data/mockData';

export default function MenuPage() {
  const [menuItems] = useState<MenuItem[]>(mockMenuItems);
```

**AFTER:**
```typescript
import { useMenuItems, useCreateMenuItem, useDeleteMenuItem } from '@/hooks/api';
import { toast } from 'sonner';

export default function MenuPage() {
  const { data: menuItems = [], isLoading } = useMenuItems();
  const createMenuItem = useCreateMenuItem();
  const deleteMenuItem = useDeleteMenuItem();

  const handleAddDish = async (formData) => {
    try {
      await createMenuItem.mutateAsync(formData);
      toast.success('Dish added!');
    } catch (error) {
      toast.error('Failed to add dish');
    }
  };

  if (isLoading) return <div>Loading...</div>;
```

---

## Testing Backend

### Test Menu Items
```bash
# Get all menu items
curl http://localhost:5000/api/menu-items

# Create a new dish
curl -X POST http://localhost:5000/api/menu-items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Biryani",
    "description": "Fragrant rice dish",
    "category": "Main",
    "cost_per_serving": 150,
    "selling_price": 350,
    "is_vegetarian": false,
    "prep_time_minutes": 45
  }'
```

### Test Inventory
```bash
# Get all inventory
curl http://localhost:5000/api/inventory

# Create inventory item
curl -X POST http://localhost:5000/api/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Basmati Rice",
    "category": "Grains",
    "unit": "kg",
    "cost_per_unit": 120,
    "supplier_name": "Local Supplier",
    "minimum_stock": 5
  }'
```

---

## Troubleshooting

### "npm: command not found"

The backend script requires npm to be installed. Install Node.js from https://nodejs.org

### Backend won't start - "Cannot find module 'express'"

Install dependencies:
```bash
npm install
```

### Backend won't connect to database

Check that:
1. PostgreSQL is running
2. `DATABASE_URL` in `.env` file is correct
3. The database user password is correct
4. The database exists: `restaurant_inventory_manager`

Example .env:
```env
DATABASE_URL=postgresql://rim_user:your_password@localhost:5432/restaurant_inventory_manager
```

### Port 5000 already in use

Either:
1. Stop the other process using port 5000
2. Change the PORT in `.env`:
```env
PORT=5001
```

### Frontend can't connect to backend

Make sure:
1. Backend is running on `http://localhost:5000`
2. No CORS errors in browser console
3. Database is connected (check backend terminal for "Database connected" message)
4. Frontend and backend are NOT using the same port

---

## Commands Reference

```bash
# Install all dependencies (run once after cloning)
npm install

# Start frontend development server
npm run dev

# Start backend API server
npm run dev:backend

# Start both frontend and backend together
npm run dev:both

# Check if backend is running
curl http://localhost:5000/health

# View all endpoints
curl http://localhost:5000/api/menu-items
```

---

## How the Backend Works

### Architecture

```
Frontend (React)
    ↓ (HTTP requests via fetch/axios)
API Layer (src/lib/api.ts)
    ↓
React Hooks (src/hooks/api.ts)
    ↓
Backend API (server.js, Express.js)
    ↓
Database (PostgreSQL)
```

### Data Flow for Adding a Menu Item

1. User clicks "Add Dish" button in MenuPage
2. Form validation
3. API call: `POST /api/menu-items` with form data
4. Backend validates and inserts into database
5. Response sent back to frontend
6. Hook invalidates cache and refetches data
7. UI updates with new item
