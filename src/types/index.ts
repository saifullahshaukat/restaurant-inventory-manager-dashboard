export type ClientType = 'Wedding' | 'Corporate' | 'Family' | 'Individual';
export type OrderStatus = 'Inquiry' | 'Confirmed' | 'In Progress' | 'Delivered' | 'Closed';
export type EventType = 'Wedding' | 'Mehndi' | 'Dholki' | 'Corporate Lunch' | 'Private Event';
export type DishCategory = 'Main' | 'BBQ' | 'Rice' | 'Dessert' | 'Live Station' | 'Appetizer';
export type StockUnit = 'kg' | 'liter' | 'piece' | 'dozen' | 'pack';

export interface Order {
  id: string;
  clientName: string;
  clientType: ClientType;
  eventDate: string;
  eventType: EventType;
  menuItems: string[];
  guestCount: number;
  pricePerHead: number;
  totalValue: number;
  status: OrderStatus;
  advanceReceived: number;
  remainingBalance: number;
  notes?: string;
  createdAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: DishCategory;
  costPerServing: number;
  sellingPrice: number;
  marginPercent: number;
  ingredients: string[];
  isAvailable: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  unit: StockUnit;
  currentStock: number;
  minimumStock: number;
  supplierName: string;
  costPerUnit: number;
  expiryDate?: string;
  lastUpdated: string;
}

export interface GroceryPurchase {
  id: string;
  purchaseDate: string;
  supplier: string;
  ingredient: string;
  quantity: number;
  unit: StockUnit;
  cost: number;
  linkedOrderId?: string;
}

export interface DashboardStats {
  todaysOrders: number;
  upcomingEvents: number;
  stockValue: number;
  monthlyProfit: number;
  totalRevenue: number;
  pendingPayments: number;
}
