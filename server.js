/**
 * Restaurant Inventory Manager - Backend Server
 * Express.js API Server
 * Connects React frontend to PostgreSQL database
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  credentials: true,
}));
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Database connected:', res.rows[0].now);
  }
});

// ============================================================================
// MENU ITEMS ENDPOINTS
// ============================================================================

// GET all menu items
app.get('/api/menu-items', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, name, description, category, cost_per_serving, 
        selling_price, margin_percent, is_available, 
        is_vegetarian, prep_time_minutes, image_url
      FROM menu_items
      WHERE deleted_at IS NULL
      ORDER BY category, name
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single menu item
app.get('/api/menu-items/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM menu_items WHERE id = $1 AND deleted_at IS NULL
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }

    // Get ingredients for this menu item
    const ingredients = await pool.query(`
      SELECT mii.*, ii.current_stock, ii.unit 
      FROM menu_item_ingredients mii
      LEFT JOIN inventory_items ii ON mii.inventory_item_id = ii.id
      WHERE mii.menu_item_id = $1
    `, [req.params.id]);

    res.json({ 
      success: true, 
      data: {
        ...result.rows[0],
        ingredients: ingredients.rows
      }
    });
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// CREATE menu item
app.post('/api/menu-items', async (req, res) => {
  const { 
    name, description, category, cost_per_serving, 
    selling_price, is_vegetarian, prep_time_minutes, 
    image_url, ingredients 
  } = req.body;

  try {
    // Get the business ID (for now, using the first/only business)
    const businessResult = await pool.query('SELECT id FROM businesses LIMIT 1');
    const businessId = businessResult.rows[0]?.id;

    if (!businessId) {
      return res.status(400).json({ success: false, error: 'No business found' });
    }

    // Insert menu item
    const itemResult = await pool.query(`
      INSERT INTO menu_items 
      (business_id, name, description, category, cost_per_serving, selling_price, 
       margin_percent, is_vegetarian, prep_time_minutes, image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      businessId, name, description, category, cost_per_serving, selling_price,
      ((selling_price - cost_per_serving) / selling_price * 100),
      is_vegetarian, prep_time_minutes, image_url
    ]);

    const itemId = itemResult.rows[0].id;

    // Insert ingredients
    if (ingredients && ingredients.length > 0) {
      for (const ingredient of ingredients) {
        await pool.query(`
          INSERT INTO menu_item_ingredients 
          (menu_item_id, inventory_item_id, ingredient_name, quantity_required, unit)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          itemId, ingredient.inventory_item_id, 
          ingredient.ingredient_name, ingredient.quantity_required, ingredient.unit
        ]);
      }
    }

    res.status(201).json({ 
      success: true, 
      message: 'Menu item created successfully',
      data: itemResult.rows[0]
    });
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// UPDATE menu item
app.put('/api/menu-items/:id', async (req, res) => {
  const { name, description, category, cost_per_serving, selling_price, is_vegetarian, prep_time_minutes } = req.body;

  try {
    const result = await pool.query(`
      UPDATE menu_items 
      SET name = $1, description = $2, category = $3, 
          cost_per_serving = $4, selling_price = $5,
          margin_percent = $6, is_vegetarian = $7, prep_time_minutes = $8,
          updated_at = NOW()
      WHERE id = $9 AND deleted_at IS NULL
      RETURNING *
    `, [
      name, description, category, cost_per_serving, selling_price,
      ((selling_price - cost_per_serving) / selling_price * 100),
      is_vegetarian, prep_time_minutes, req.params.id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }

    res.json({ 
      success: true, 
      message: 'Menu item updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE menu item (soft delete)
app.delete('/api/menu-items/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      UPDATE menu_items 
      SET deleted_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }

    res.json({ success: true, message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// INVENTORY ITEMS ENDPOINTS
// ============================================================================

// GET all inventory items
app.get('/api/inventory', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, name, category, unit, current_stock, minimum_stock, 
        cost_per_unit, supplier_id, supplier_name, expiry_date, is_active
      FROM inventory_items
      WHERE is_active = true
      ORDER BY name
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET low stock items
app.get('/api/inventory/low-stock', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, name, category, current_stock, minimum_stock, 
        (minimum_stock - current_stock) as shortage, supplier_name
      FROM inventory_items
      WHERE is_active = true AND current_stock <= minimum_stock
      ORDER BY shortage DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// CREATE inventory item
app.post('/api/inventory', async (req, res) => {
  const { 
    name, category, unit, cost_per_unit, 
    supplier_id, supplier_name, minimum_stock 
  } = req.body;

  try {
    // Get the business ID (for now, using the first/only business)
    const businessResult = await pool.query('SELECT id FROM businesses LIMIT 1');
    const businessId = businessResult.rows[0]?.id;

    if (!businessId) {
      return res.status(400).json({ success: false, error: 'No business found' });
    }

    const result = await pool.query(`
      INSERT INTO inventory_items 
      (business_id, name, category, unit, current_stock, cost_per_unit, 
       supplier_id, supplier_name, minimum_stock, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
      RETURNING *
    `, [
      businessId, name, category, unit, 0, cost_per_unit,
      supplier_id, supplier_name, minimum_stock
    ]);

    res.status(201).json({ 
      success: true, 
      message: 'Inventory item created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// UPDATE inventory item
app.put('/api/inventory/:id', async (req, res) => {
  const { name, category, unit, cost_per_unit, supplier_id, supplier_name, minimum_stock } = req.body;

  try {
    const result = await pool.query(`
      UPDATE inventory_items 
      SET name = $1, category = $2, unit = $3, cost_per_unit = $4,
          supplier_id = $5, supplier_name = $6, minimum_stock = $7,
          updated_at = NOW()
      WHERE id = $8 AND is_active = true
      RETURNING *
    `, [
      name, category, unit, cost_per_unit, 
      supplier_id, supplier_name, minimum_stock, req.params.id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Inventory item not found' });
    }

    res.json({ 
      success: true, 
      message: 'Inventory item updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// UPDATE stock (add/remove)
app.put('/api/inventory/:id/stock', async (req, res) => {
  const { quantity, movement_type, reference_id } = req.body;

  try {
    // Get current stock
    const current = await pool.query(`
      SELECT current_stock FROM inventory_items WHERE id = $1
    `, [req.params.id]);

    if (current.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Inventory item not found' });
    }

    const previousStock = current.rows[0].current_stock;
    const newStock = previousStock + quantity;

    // Update stock
    const result = await pool.query(`
      UPDATE inventory_items 
      SET current_stock = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [newStock, req.params.id]);

    // Log stock movement
    await pool.query(`
      INSERT INTO stock_movements (business_id, inventory_item_id, movement_type, 
                                   quantity_change, previous_stock, new_stock, reference_id, reference_type)
      SELECT 
        'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
        $1, $2, $3, $4, $5, $6, 'Purchase'
      FROM businesses LIMIT 1
    `, [req.params.id, movement_type, quantity, previousStock, newStock, reference_id]);

    res.json({ 
      success: true, 
      message: 'Stock updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// PURCHASES ENDPOINTS
// ============================================================================

// GET all purchases
app.get('/api/purchases', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, purchase_order_number, supplier_name, purchase_date, 
        total_amount, payment_status, status, created_at
      FROM purchases
      ORDER BY purchase_date DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// CREATE purchase
app.post('/api/purchases', async (req, res) => {
  const { supplier_id, supplier_name, purchase_date, items } = req.body;

  try {
    // Get the business ID (for now, using the first/only business)
    const businessResult = await pool.query('SELECT id FROM businesses LIMIT 1');
    const businessId = businessResult.rows[0]?.id;

    if (!businessId) {
      return res.status(400).json({ success: false, error: 'No business found' });
    }

    // Safely calculate totals with default empty array
    const itemsArray = items || [];
    const totalAmount = itemsArray.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

    // Generate purchase order number
    const purchaseNum = await pool.query(`SELECT COUNT(*) as count FROM purchases`);
    const purchaseOrderNumber = `PO-${String(purchaseNum.rows[0].count + 1).padStart(4, '0')}`;

    // Create purchase order
    const purchaseResult = await pool.query(`
      INSERT INTO purchases 
      (business_id, purchase_order_number, supplier_id, supplier_name, purchase_date, total_amount, final_amount, payment_status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pending')
      RETURNING *
    `, [businessId, purchaseOrderNumber, supplier_id, supplier_name, purchase_date, totalAmount, totalAmount]);

    const purchaseId = purchaseResult.rows[0].id;

    // Add items to purchase
    if (itemsArray && itemsArray.length > 0) {
      for (const item of itemsArray) {
        await pool.query(`
          INSERT INTO purchase_items 
          (purchase_id, inventory_item_id, ingredient_name, quantity, unit, unit_price, total_price)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          purchaseId, item.inventory_item_id, item.ingredient_name,
          item.quantity, item.unit, item.unit_price, item.quantity * item.unit_price
        ]);

        // Update inventory stock
        await pool.query(`
          UPDATE inventory_items 
          SET current_stock = current_stock + $1, updated_at = NOW()
          WHERE id = $2
        `, [item.quantity, item.inventory_item_id]);
      }
    }

    res.status(201).json({ 
      success: true, 
      message: 'Purchase order created successfully',
      data: purchaseResult.rows[0]
    });
  } catch (error) {
    console.error('Error creating purchase:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// UPDATE purchase
app.put('/api/purchases/:id', async (req, res) => {
  const { payment_status, status } = req.body;

  try {
    const result = await pool.query(`
      UPDATE purchases 
      SET payment_status = COALESCE($1, payment_status),
          status = COALESCE($2, status),
          updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `, [payment_status, status, req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Purchase not found' });
    }

    res.json({ 
      success: true, 
      message: 'Purchase updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating purchase:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// ORDERS ENDPOINTS
// ============================================================================

// GET all orders
app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, order_number, client_name, client_type, event_date, event_type,
        guest_count, total_value, advance_received, remaining_balance, 
        status, created_at
      FROM orders
      ORDER BY event_date DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// CREATE order
app.post('/api/orders', async (req, res) => {
  const { 
    client_name, client_type, event_date, event_type, 
    event_location, guest_count, price_per_head, items 
  } = req.body;

  try {
    // Get the business ID (for now, using the first/only business)
    const businessResult = await pool.query('SELECT id FROM businesses LIMIT 1');
    const businessId = businessResult.rows[0]?.id;

    if (!businessId) {
      return res.status(400).json({ success: false, error: 'No business found' });
    }

    const totalValue = guest_count * price_per_head;

    // Generate order number
    const orderNum = await pool.query(`SELECT COUNT(*) as count FROM orders`);
    const orderNumber = `ORD-${String(orderNum.rows[0].count + 1).padStart(4, '0')}`;

    // Create order
    const orderResult = await pool.query(`
      INSERT INTO orders 
      (business_id, order_number, client_name, client_type, event_date, event_type, 
       event_location, guest_count, price_per_head, total_value, remaining_balance, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Inquiry')
      RETURNING *
    `, [
      businessId, orderNumber, client_name, client_type, event_date, event_type,
      event_location, guest_count, price_per_head, totalValue, totalValue
    ]);

    const orderId = orderResult.rows[0].id;

    // Add items to order
    if (items && items.length > 0) {
      for (const item of items) {
        await pool.query(`
          INSERT INTO order_items 
          (order_id, menu_item_id, item_name, quantity, unit_price, total_price)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          orderId, item.menu_item_id, item.item_name,
          item.quantity, item.unit_price, item.quantity * item.unit_price
        ]);
      }
    }

    res.status(201).json({ 
      success: true, 
      message: 'Order created successfully',
      data: orderResult.rows[0]
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// UPDATE order
app.put('/api/orders/:id', async (req, res) => {
  const { status, advance_received } = req.body;

  try {
    // Get order details
    const order = await pool.query(`SELECT total_value FROM orders WHERE id = $1`, [req.params.id]);
    
    if (order.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const remainingBalance = order.rows[0].total_value - (advance_received || 0);

    const result = await pool.query(`
      UPDATE orders 
      SET status = COALESCE($1, status),
          advance_received = COALESCE($2, advance_received),
          remaining_balance = $3,
          updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `, [status, advance_received, remainingBalance, req.params.id]);

    res.json({ 
      success: true, 
      message: 'Order updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// SEARCH ENDPOINT
// ============================================================================

// Global search
app.get('/api/search', async (req, res) => {
  const { q } = req.query;

  if (!q || q.length < 2) {
    return res.json({ success: true, data: { orders: [], menuItems: [], inventory: [] } });
  }

  try {
    const searchTerm = `%${q}%`;

    const orders = await pool.query(`
      SELECT id, order_number as name, 'order' as type FROM orders 
      WHERE client_name ILIKE $1 OR order_number ILIKE $1 LIMIT 5
    `, [searchTerm]);

    const menuItems = await pool.query(`
      SELECT id, name, 'menu' as type FROM menu_items 
      WHERE name ILIKE $1 AND deleted_at IS NULL LIMIT 5
    `, [searchTerm]);

    const inventory = await pool.query(`
      SELECT id, name, 'inventory' as type FROM inventory_items 
      WHERE name ILIKE $1 AND is_active = true LIMIT 5
    `, [searchTerm]);

    res.json({ 
      success: true, 
      data: {
        orders: orders.rows,
        menuItems: menuItems.rows,
        inventory: inventory.rows
      }
    });
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// USER/PROFILE ENDPOINT
// ============================================================================

// GET user profile (demo)
app.get('/api/profile', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, tagline, email, phone, address, city FROM businesses LIMIT 1
    `);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Business not found' });
    }

    res.json({ 
      success: true, 
      data: {
        id: result.rows[0].id,
        name: result.rows[0].name,
        tagline: result.rows[0].tagline,
        email: result.rows[0].email,
        phone: result.rows[0].phone,
        address: result.rows[0].address,
        city: result.rows[0].city,
        role: 'Admin'
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// UPDATE profile
app.put('/api/profile', async (req, res) => {
  const { name, tagline, email, phone, address, city } = req.body;

  try {
    const result = await pool.query(`
      UPDATE businesses 
      SET name = COALESCE($1, name), 
          tagline = COALESCE($2, tagline),
          email = COALESCE($3, email),
          phone = COALESCE($4, phone),
          address = COALESCE($5, address),
          city = COALESCE($6, city),
          updated_at = NOW()
      WHERE id = (SELECT id FROM businesses LIMIT 1)
      RETURNING id, name, tagline, email, phone, address, city
    `, [name, tagline, email, phone, address, city]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Business not found' });
    }

    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// DASHBOARD STATS ENDPOINT
// ============================================================================

// GET dashboard statistics
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM orders WHERE status IN ('Inquiry', 'Confirmed', 'In Progress')) as pending_orders,
        (SELECT COUNT(DISTINCT DATE(event_date)) FROM orders WHERE DATE(event_date) >= CURRENT_DATE AND status != 'Closed') as upcoming_events,
        (SELECT COUNT(*) FROM inventory_items WHERE current_stock <= minimum_stock AND is_active = true) as low_stock_count,
        (SELECT SUM(current_stock * cost_per_unit) FROM inventory_items WHERE is_active = true) as inventory_value,
        (SELECT SUM(total_value) FROM orders WHERE DATE_TRUNC('month', event_date) = DATE_TRUNC('month', CURRENT_DATE) AND status IN ('In Progress', 'Delivered')) as monthly_revenue,
        (SELECT SUM(total_value) FROM orders WHERE status = 'Delivered') as total_sales
    `);

    res.json({ success: true, data: stats.rows[0] });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// ROLES ENDPOINTS (v2.1)
// ============================================================================

// GET all roles for business
app.get('/api/roles', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, 
        (SELECT json_agg(permission) FROM role_permissions WHERE role_id = r.id) as permissions
      FROM roles r
      ORDER BY r.name
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// CREATE role
app.post('/api/roles', async (req, res) => {
  const { name, description } = req.body;

  try {
    const result = await pool.query(`
      INSERT INTO roles (name, description, is_system_role)
      VALUES ($1, $2, false)
      RETURNING id, name, description
    `, [name, description]);

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// UPDATE role
app.put('/api/roles/:id', async (req, res) => {
  const { name, description } = req.body;

  try {
    const result = await pool.query(`
      UPDATE roles
      SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND is_system_role = false
      RETURNING id, name, description
    `, [name, description, req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Role not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// STAFF ENDPOINTS (v2.1)
// ============================================================================

// GET all staff
app.get('/api/staff', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, r.name as role_name, r.description as role_description
      FROM staff s
      LEFT JOIN roles r ON s.role_id = r.id
      WHERE s.deleted_at IS NULL
      ORDER BY s.name
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single staff member
app.get('/api/staff/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, r.name as role_name
      FROM staff s
      LEFT JOIN roles r ON s.role_id = r.id
      WHERE s.id = $1 AND s.deleted_at IS NULL
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Staff member not found' });
    }

    // Get permissions for this staff member's role
    const permissions = await pool.query(`
      SELECT permission FROM role_permissions WHERE role_id = $1
    `, [result.rows[0].role_id]);

    res.json({ 
      success: true, 
      data: {
        ...result.rows[0],
        permissions: permissions.rows.map(p => p.permission)
      }
    });
  } catch (error) {
    console.error('Error fetching staff member:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// CREATE staff member
app.post('/api/staff', async (req, res) => {
  const { name, email, phone, role_id, position, hire_date } = req.body;

  try {
    const result = await pool.query(`
      INSERT INTO staff (name, email, phone, role_id, position, hire_date, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, true)
      RETURNING id, name, email, phone, role_id, position, hire_date
    `, [name, email, phone, role_id, position, hire_date]);

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating staff member:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// UPDATE staff member
app.put('/api/staff/:id', async (req, res) => {
  const { name, email, phone, role_id, position, is_active } = req.body;

  try {
    const result = await pool.query(`
      UPDATE staff
      SET name = $1, email = $2, phone = $3, role_id = $4, position = $5, is_active = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7 AND deleted_at IS NULL
      RETURNING id, name, email, phone, role_id, position, is_active
    `, [name, email, phone, role_id, position, is_active, req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Staff member not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating staff member:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE staff member (soft delete)
app.delete('/api/staff/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      UPDATE staff
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Staff member not found' });
    }

    res.json({ success: true, message: 'Staff member deleted' });
  } catch (error) {
    console.error('Error deleting staff member:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/health', (req, res) => {
  res.json({ status: 'OK', server: 'Running', timestamp: new Date() });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`\n🍽️  Restaurant Inventory Manager API`);
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 Frontend: http://localhost:8080`);
  console.log(`🗄️  Database: ${process.env.DB_NAME || 'restaurant_inventory_manager'}`);
  console.log(`\n📚 Available endpoints:`);
  console.log(`   GET    /api/menu-items`);
  console.log(`   POST   /api/menu-items`);
  console.log(`   PUT    /api/menu-items/:id`);
  console.log(`   DELETE /api/menu-items/:id`);
  console.log(`   GET    /api/inventory`);
  console.log(`   POST   /api/inventory`);
  console.log(`   PUT    /api/inventory/:id`);
  console.log(`   PUT    /api/inventory/:id/stock`);
  console.log(`   GET    /api/purchases`);
  console.log(`   POST   /api/purchases`);
  console.log(`   GET    /api/orders`);
  console.log(`   POST   /api/orders`);
  console.log(`   PUT    /api/orders/:id`);
  console.log(`   GET    /api/search?q=query`);
  console.log(`   GET    /api/profile`);
  console.log(`   PUT    /api/profile`);
  console.log(`   GET    /api/dashboard/stats`);
  console.log(`   GET    /api/roles`);
  console.log(`   POST   /api/roles`);
  console.log(`   PUT    /api/roles/:id`);
  console.log(`   GET    /api/staff`);
  console.log(`   GET    /api/staff/:id`);
  console.log(`   POST   /api/staff`);
  console.log(`   PUT    /api/staff/:id`);
  console.log(`   DELETE /api/staff/:id`);
  console.log(`\n`);
});
