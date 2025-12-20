# Restaurant Inventory Manager - Database Setup Guide

## Quick Start: Local Database Setup (5 Minutes)

### Step 1: Install PostgreSQL

**Windows:**
- Download: https://www.postgresql.org/download/windows/
- Choose PostgreSQL 15 or 16
- Run installer and remember the `postgres` password
- Default port: `5432`

**Or use package manager:**
```powershell
choco install postgresql
# or
winget install PostgreSQL.PostgreSQL
```

### Step 2: Verify Installation

```powershell
psql --version
# Should show: psql (PostgreSQL) 15.x or 16.x
```

### Step 3: Create Database & User

```powershell
psql -U postgres
```

Then run these SQL commands:

```sql
CREATE DATABASE restaurant_inventory_manager;
CREATE USER rim_user WITH PASSWORD 'your_secure_password_here';
ALTER ROLE rim_user CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE restaurant_inventory_manager TO rim_user;
\q
```

### Step 4: Run the Schema

```powershell
cd d:\Projects\kitchen-command-center-main
psql -U rim_user -d restaurant_inventory_manager -f schema.sql
```

### Step 5: Verify Setup

```powershell
psql -U rim_user -d restaurant_inventory_manager

# List tables
\dt

# Should show 15 tables (users, businesses, orders, etc.)

# Check seed data
SELECT COUNT(*) FROM businesses;  -- Should show 1

\q
```

### Step 6: Create .env File

Create `.env` in project root:

```env
DATABASE_URL=postgresql://rim_user:your_secure_password_here@localhost:5432/restaurant_inventory_manager
NODE_ENV=development
PORT=5000
JWT_SECRET=your_super_secret_key_here
CORS_ORIGIN=http://localhost:8080
```

### Step 7: Common Issues

**Error: "psql: command not found"**
- PostgreSQL not in PATH. Reinstall or add to PATH

**Error: "role 'rim_user' does not exist"**
```powershell
psql -U postgres
CREATE USER rim_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE restaurant_inventory_manager TO rim_user;
\q
```

**PostgreSQL service not running**
```powershell
Start-Service postgresql-x64-15
# Or use Services app: Win+R → services.msc
```

### Useful Commands

```powershell
# Backup
pg_dump -U rim_user restaurant_inventory_manager > backup.sql

# Restore
psql -U rim_user restaurant_inventory_manager < backup.sql

# Delete database (careful!)
psql -U postgres -c "DROP DATABASE restaurant_inventory_manager;"
```

### GUI Tools (Optional)

View data visually with:
- **pgAdmin**: https://www.pgadmin.org/download/
- **DBeaver**: https://dbeaver.io/download/
- **VS Code Extension**: PostgreSQL by Chris Kolkman

---

## Database Recommendation: PostgreSQL

**Why PostgreSQL?**
- ✅ Perfect for complex queries (profit calculations, inventory tracking)
- ✅ JSONB support for flexible menu items & order data
- ✅ Excellent for time-series data (financial reports, trends)
- ✅ Full-text search capabilities
- ✅ Scalable for enterprise use
- ✅ Free and open-source
- ✅ Best for multi-tenant systems (future multi-user support)

---

## Current Features & Future Roadmap

### V1.0 (Current - Production Ready)
- Order management (clients, events, payments)
- Menu & costing (dishes, ingredients, margins)
- Inventory tracking (stock, suppliers, alerts)
- Purchase tracking (grocery purchases, suppliers)
- Financial analytics (profit, revenue, margins)
- Dashboard & reporting

### V1.1 (Planned - Next Phase)
- **User Management** (create, edit, delete users)
- **Role-Based Access Control (RBAC)** (Admin, Chef, Manager, Accountant)
- **Notifications System** (low stock, pending payments, new orders)
- **Audit Logs** (who did what and when)
- **Data Export** (CSV, PDF reports)
- **Multi-location Support**

### V2.0 (Future)
- API & Third-party integrations
- Mobile app
- Barcode scanning
- POS system integration
- Cloud backup & sync
- Payment gateway integration

---

## Database Schema

### 1. USERS TABLE (For v1.1+)
Stores user accounts with roles and permissions.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  role VARCHAR(50) NOT NULL DEFAULT 'user', -- admin, manager, chef, accountant
  business_id UUID, -- for multi-tenant support
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP -- soft delete
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_business_id ON users(business_id);
```

### 2. BUSINESSES TABLE (For multi-location support)
Stores business/restaurant information.

```sql
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  tagline VARCHAR(500),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  currency VARCHAR(3) DEFAULT 'PKR', -- PKR, USD, etc.
  logo_url VARCHAR(500),
  owner_id UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_businesses_owner_id ON businesses(owner_id);
```

### 3. CLIENTS TABLE
Stores customer/client information.

```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  client_type VARCHAR(50) NOT NULL, -- Wedding, Corporate, Family, Individual
  address TEXT,
  city VARCHAR(100),
  preferred_cuisine VARCHAR(100),
  total_orders INT DEFAULT 0,
  total_spent DECIMAL(12, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clients_business_id ON clients(business_id);
CREATE INDEX idx_clients_client_type ON clients(client_type);
```

### 4. ORDERS TABLE
Stores all catering orders.

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  order_number VARCHAR(50) UNIQUE NOT NULL, -- ORD-001, ORD-002
  client_id UUID REFERENCES clients(id),
  client_name VARCHAR(255) NOT NULL,
  client_type VARCHAR(50) NOT NULL, -- Wedding, Corporate, Family, Individual
  event_date DATE NOT NULL,
  event_type VARCHAR(100), -- Wedding, Mehndi, Corporate Lunch, etc.
  event_location TEXT,
  guest_count INT NOT NULL,
  price_per_head DECIMAL(10, 2) NOT NULL,
  total_value DECIMAL(12, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Inquiry', -- Inquiry, Confirmed, In Progress, Delivered, Closed
  advance_received DECIMAL(12, 2) DEFAULT 0,
  remaining_balance DECIMAL(12, 2) NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  delivered_at TIMESTAMP,
  paid_at TIMESTAMP
);

CREATE INDEX idx_orders_business_id ON orders(business_id);
CREATE INDEX idx_orders_client_id ON orders(client_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_event_date ON orders(event_date);
CREATE INDEX idx_orders_order_number ON orders(order_number);
```

### 5. ORDER_ITEMS TABLE (Junction Table)
Stores menu items linked to specific orders.

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  item_name VARCHAR(255) NOT NULL, -- denormalized for history
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  cost_per_unit DECIMAL(10, 2),
  total_price DECIMAL(12, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_menu_item_id ON order_items(menu_item_id);
```

### 6. MENU_ITEMS TABLE
Stores all available dishes and recipes.

```sql
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL, -- Main, BBQ, Rice, Dessert, Live Station, Appetizer
  cost_per_serving DECIMAL(10, 2) NOT NULL,
  selling_price DECIMAL(10, 2) NOT NULL,
  margin_percent DECIMAL(5, 2), -- auto-calculated
  ingredients JSONB, -- Array of ingredient objects
  allergens JSONB, -- Contains nuts, dairy, etc.
  is_available BOOLEAN DEFAULT true,
  is_vegetarian BOOLEAN DEFAULT false,
  prep_time_minutes INT,
  image_url VARCHAR(500),
  seasonal BOOLEAN DEFAULT false,
  season VARCHAR(50), -- Spring, Summer, Fall, Winter
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_menu_items_business_id ON menu_items(business_id);
CREATE INDEX idx_menu_items_category ON menu_items(category);
CREATE INDEX idx_menu_items_is_available ON menu_items(is_available);
```

### 7. MENU_ITEM_INGREDIENTS TABLE
Stores detailed ingredient information for each menu item.

```sql
CREATE TABLE menu_item_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  inventory_item_id UUID REFERENCES inventory_items(id),
  ingredient_name VARCHAR(255) NOT NULL,
  quantity_required DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50), -- kg, liter, piece
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_menu_item_ingredients_menu_item_id ON menu_item_ingredients(menu_item_id);
CREATE INDEX idx_menu_item_ingredients_inventory_item_id ON menu_item_ingredients(inventory_item_id);
```

### 8. INVENTORY_ITEMS TABLE
Stores all stock/ingredient information.

```sql
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100), -- Vegetables, Meat, Spices, Dairy, etc.
  unit VARCHAR(50) NOT NULL, -- kg, liter, piece, dozen, pack
  current_stock DECIMAL(10, 2) NOT NULL,
  minimum_stock DECIMAL(10, 2), -- trigger for low stock alerts
  maximum_stock DECIMAL(10, 2),
  cost_per_unit DECIMAL(10, 2) NOT NULL,
  selling_price DECIMAL(10, 2), -- for retail if applicable
  supplier_id UUID REFERENCES suppliers(id),
  supplier_name VARCHAR(255), -- denormalized for quick access
  barcode VARCHAR(100),
  expiry_date DATE,
  storage_location VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  reorder_quantity INT,
  reorder_point DECIMAL(10, 2),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_inventory_items_business_id ON inventory_items(business_id);
CREATE INDEX idx_inventory_items_supplier_id ON inventory_items(supplier_id);
CREATE INDEX idx_inventory_items_current_stock ON inventory_items(current_stock, minimum_stock);
CREATE INDEX idx_inventory_items_expiry_date ON inventory_items(expiry_date);
```

### 9. SUPPLIERS TABLE
Stores supplier/vendor information.

```sql
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  payment_terms VARCHAR(100), -- Net 30, COD, etc.
  bank_details JSONB,
  contact_person VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  total_purchases DECIMAL(12, 2) DEFAULT 0,
  average_delivery_days INT,
  rating DECIMAL(3, 1), -- 1-5 stars
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_suppliers_business_id ON suppliers(business_id);
CREATE INDEX idx_suppliers_name ON suppliers(name);
```

### 10. PURCHASES TABLE
Stores all grocery and supply purchases.

```sql
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  purchase_order_number VARCHAR(50) UNIQUE NOT NULL, -- PO-001
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  supplier_name VARCHAR(255), -- denormalized
  purchase_date DATE NOT NULL,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  total_amount DECIMAL(12, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  final_amount DECIMAL(12, 2) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'Pending', -- Pending, Partial, Paid
  amount_paid DECIMAL(12, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Ordered', -- Ordered, Received, Partial Received, Cancelled
  notes TEXT,
  linked_order_id UUID REFERENCES orders(id), -- if purchase is for specific order
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP
);

CREATE INDEX idx_purchases_business_id ON purchases(business_id);
CREATE INDEX idx_purchases_supplier_id ON purchases(supplier_id);
CREATE INDEX idx_purchases_status ON purchases(status);
CREATE INDEX idx_purchases_purchase_date ON purchases(purchase_date);
```

### 11. PURCHASE_ITEMS TABLE
Stores individual items in each purchase order.

```sql
CREATE TABLE purchase_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  inventory_item_id UUID REFERENCES inventory_items(id),
  ingredient_name VARCHAR(255) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(12, 2) NOT NULL,
  quantity_received DECIMAL(10, 2),
  received_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_purchase_items_purchase_id ON purchase_items(purchase_id);
CREATE INDEX idx_purchase_items_inventory_item_id ON purchase_items(inventory_item_id);
```

### 12. STOCK_MOVEMENTS TABLE (Audit Trail)
Tracks all inventory changes for audit purposes.

```sql
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id),
  movement_type VARCHAR(50) NOT NULL, -- Purchase, Sale, Adjustment, Waste, Return
  quantity_change DECIMAL(10, 2) NOT NULL,
  previous_stock DECIMAL(10, 2),
  new_stock DECIMAL(10, 2),
  reference_id VARCHAR(100), -- Order ID or Purchase ID
  reference_type VARCHAR(50), -- Order, Purchase, Adjustment
  created_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stock_movements_business_id ON stock_movements(business_id);
CREATE INDEX idx_stock_movements_inventory_item_id ON stock_movements(inventory_item_id);
CREATE INDEX idx_stock_movements_created_at ON stock_movements(created_at);
CREATE INDEX idx_stock_movements_movement_type ON stock_movements(movement_type);
```

### 13. NOTIFICATIONS TABLE (For v1.1+)
Stores notification history for alerts.

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL, -- low_stock, pending_payment, order_confirmed, order_delivered
  title VARCHAR(255) NOT NULL,
  message TEXT,
  reference_id VARCHAR(100), -- Order ID, Inventory Item ID, etc.
  reference_type VARCHAR(50), -- Order, InventoryItem, Payment
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_business_id ON notifications(business_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
```

### 14. PAYMENTS TABLE (For tracking payments)
Stores payment transactions.

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id),
  amount DECIMAL(12, 2) NOT NULL,
  payment_method VARCHAR(50), -- Cash, Bank Transfer, Check, Card
  reference_number VARCHAR(100),
  notes TEXT,
  recorded_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_business_id ON payments(business_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_client_id ON payments(client_id);
CREATE INDEX idx_payments_created_at ON payments(created_at);
```

### 15. AUDIT_LOGS TABLE (For v1.1+)
Tracks all user actions for compliance and debugging.

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL, -- create, update, delete, view
  entity_type VARCHAR(100), -- Order, MenuItem, InventoryItem
  entity_id VARCHAR(100),
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(50),
  user_agent VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_business_id ON audit_logs(business_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

---

## Installation & Setup Instructions

### Prerequisites
- PostgreSQL 12+ installed
- psql command-line tool
- Node.js 18+

### Step 1: Create Database
```bash
# Connect to PostgreSQL as superuser
psql -U postgres

# Create the database
CREATE DATABASE restaurant_inventory_manager;

# Create the user (for security)
CREATE USER rim_user WITH PASSWORD 'strong_password_here';

# Grant privileges
ALTER ROLE rim_user CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE restaurant_inventory_manager TO rim_user;

# Exit psql
\q
```

### Step 2: Run Schema Scripts

Save the SQL schema above to a file: `schema.sql`

```bash
# Connect to your database and run the schema
psql -U rim_user -d restaurant_inventory_manager -f schema.sql

# Or run it interactively:
psql -U rim_user -d restaurant_inventory_manager
\i schema.sql
```

### Step 3: Create Backend API

Install necessary packages:
```bash
npm install express pg dotenv cors helmet bcryptjs jwt
npm install -D @types/express @types/pg typescript
```

### Step 4: Environment Variables
Create `.env` file:
```env
DATABASE_URL=postgresql://rim_user:strong_password_here@localhost:5432/restaurant_inventory_manager
JWT_SECRET=your_secret_key_here
NODE_ENV=development
PORT=5000
```

### Step 5: Connect Frontend to Backend
Install in React project:
```bash
npm install axios react-query
```

---

## Key Relationships & Features

### User Roles & Permissions (v1.1)
```
Admin: Full access
  ├── Manage users & roles
  ├── Business settings
  ├── All financial reports
  └── Audit logs

Manager: Business operations
  ├── Create/edit orders & purchases
  ├── Manage inventory
  ├── View reports
  └── Create notifications

Chef: Kitchen operations
  ├── View orders
  ├── Update inventory
  └── View menu items

Accountant: Financial
  ├── Manage payments
  ├── View financial reports
  └── Manage suppliers
```

### Notification Triggers (v1.1)
```
Low Stock Alert:
  - Trigger when: inventory_item.current_stock <= inventory_item.minimum_stock
  - Send to: Chef, Manager, Accountant

Pending Payment Alert:
  - Trigger when: order.remaining_balance > 0 AND event_date is today
  - Send to: Accountant, Manager

New Order Alert:
  - Trigger when: order.status = 'Inquiry'
  - Send to: Manager, Chef

Order Delivered:
  - Trigger when: order.status = 'Delivered'
  - Send to: Accountant
```

---

## Query Examples

### Get Monthly Revenue Report
```sql
SELECT 
  DATE_TRUNC('month', o.created_at) as month,
  COUNT(o.id) as total_orders,
  SUM(o.total_value) as total_revenue,
  AVG(o.total_value) as avg_order_value
FROM orders o
WHERE o.business_id = 'your-business-id'
GROUP BY DATE_TRUNC('month', o.created_at)
ORDER BY month DESC;
```

### Get Profit Analysis by Event Type
```sql
SELECT 
  o.event_type,
  COUNT(o.id) as number_of_events,
  SUM(o.total_value) as total_revenue,
  SUM(oi.cost_per_unit * oi.quantity) as total_cost,
  (SUM(o.total_value) - SUM(oi.cost_per_unit * oi.quantity)) as profit
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
WHERE o.business_id = 'your-business-id'
GROUP BY o.event_type;
```

### Get Low Stock Items
```sql
SELECT 
  id, name, current_stock, minimum_stock, 
  (minimum_stock - current_stock) as shortage,
  supplier_name
FROM inventory_items
WHERE business_id = 'your-business-id'
AND current_stock <= minimum_stock
AND is_active = true
ORDER BY shortage DESC;
```

### Get Customer Lifetime Value
```sql
SELECT 
  c.id, c.name, c.client_type,
  COUNT(o.id) as total_orders,
  SUM(o.total_value) as total_spent,
  AVG(o.total_value) as avg_order_value,
  MAX(o.created_at) as last_order_date
FROM clients c
LEFT JOIN orders o ON c.id = o.client_id
WHERE c.business_id = 'your-business-id'
GROUP BY c.id, c.name, c.client_type
ORDER BY total_spent DESC;
```

### Get Menu Profitability
```sql
SELECT 
  mi.name,
  mi.category,
  COUNT(oi.id) as times_ordered,
  SUM(oi.quantity) as total_qty,
  AVG(mi.margin_percent) as avg_margin_percent,
  SUM((oi.unit_price - oi.cost_per_unit) * oi.quantity) as total_profit
FROM menu_items mi
LEFT JOIN order_items oi ON mi.id = oi.menu_item_id
WHERE mi.business_id = 'your-business-id'
GROUP BY mi.id, mi.name, mi.category
ORDER BY total_profit DESC;
```

---

## Scalability & Performance Tips

1. **Indexing**: All common queries are indexed. Add more as needed.
2. **Partitioning**: Consider partitioning `orders` and `stock_movements` by date for very large datasets.
3. **Read Replicas**: For reporting queries, use read-only replicas.
4. **Caching**: Cache frequently accessed data (menu items, suppliers).
5. **Archive**: Archive old orders (>2 years) to separate table.

---

## Backup & Recovery

```bash
# Full backup
pg_dump -U rim_user restaurant_inventory_manager > backup.sql

# Restore from backup
psql -U rim_user restaurant_inventory_manager < backup.sql

# Automated backup (cron job)
0 2 * * * pg_dump -U rim_user restaurant_inventory_manager | gzip > /backups/rim_$(date +\%Y\%m\%d).sql.gz
```

---

## Next Steps

1. **Implement User Authentication** (JWT with bcryptjs)
2. **Build REST API** (Express.js endpoints)
3. **Add Database Migrations** (using db-migrate or Alembic)
4. **Implement Notification System** (WebSockets or polling)
5. **Add Full-Text Search** (PostgreSQL search)
6. **Create Admin Dashboard** (user management, audit logs)

---

**Questions?** Open an issue on GitHub!
