# Kitchen Command Center 🍳

> **Professional Kitchen Management Platform for Catering Enterprises**

A comprehensive, production-ready kitchen management system designed for catering businesses, restaurants, and food service operations. Streamline your operations, maximize profits, and manage inventory with precision.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Dashboard Capabilities](#dashboard-capabilities)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Development](#development)
- [Deployment](#deployment)
- [Support](#support)

---

## 🎯 Overview

Kitchen Command Center is an enterprise-grade kitchen management platform built with modern web technologies. It provides real-time insights into your catering operations, from order management to inventory tracking and profit analysis.

Perfect for:
- **Catering Services** - Manage large-scale events and orders
- **Restaurant Groups** - Track inventory and menu profitability
- **Food Businesses** - Monitor stock levels and revenue
- **Event Caterers** - Handle multiple simultaneous events

---

## ✨ Key Features

### 📊 **Intelligent Dashboard**
- Real-time overview of business metrics
- Today's orders count and upcoming events tracking
- Stock value monitoring and monthly profit indicators
- Total revenue and net balance tracking
- Interactive charts showing revenue trends and best-selling items
- Low stock alerts and inventory warnings
- Upcoming events calendar view

### 📦 **Inventory Management**
- Real-time stock tracking for all ingredients
- Automatic low-stock alerts and notifications
- Category-based inventory organization
- Stock value calculations
- Supplier and cost tracking
- Batch management and expiration tracking
- Inventory adjustment history

### 🛒 **Order Management System**
- Complete order lifecycle management (Inquiry → Confirmed → In Progress → Delivered)
- Support for multiple client types (Wedding, Corporate, Family, Individual)
- Guest count and pricing per head
- Advance payment tracking and balance management
- Event-based order organization
- Order status tracking and timeline
- Custom menu selection per order
- Notes and special requirements

### 🍽️ **Menu Management**
- Comprehensive menu item database
- Category-based menu organization (Rice, BBQ, Main Courses, Desserts, etc.)
- Cost per serving vs selling price tracking
- Profit margin calculations
- Ingredient lists and recipe management
- Availability status management
- Menu profitability analysis

### 💰 **Financial Tracking**
- Detailed profit and loss analysis
- Revenue tracking by order and time period
- Margin analysis on menu items
- Cost of goods sold (COGS) calculations
- Payment received vs pending tracking
- Advanced and balance payment management
- Financial reports and trends

### 🛍️ **Purchase Management**
- Supplier order tracking
- Purchase order creation and management
- Delivery status tracking
- Cost monitoring
- Supplier performance metrics
- Purchase history and analytics

### ⚙️ **Settings & Configuration**
- User preferences and customization
- System configuration
- Business settings
- Data management options

### 📈 **Analytics & Reports**
- Revenue trend charts
- Best-selling items analysis
- Inventory value tracking
- Profit margin reports
- Event-based analytics
- Time-period comparisons

---

## 🎨 Dashboard Capabilities

### Real-Time Metrics
- **Today's Orders** - Quick view of current day's orders
- **Upcoming Events** - Count and trend of scheduled events
- **Stock Value** - Total inventory value in currency
- **Monthly Profit** - Net profit with trend indicators
- **Total Revenue** - Complete revenue overview
- **Net Balance** - Current financial position

### Interactive Visualizations
- **Revenue Chart** - Monthly revenue trends
- **Best Sellers Chart** - Top-performing menu items
- **Low Stock Alerts** - Critical inventory warnings
- **Upcoming Events** - Detailed event schedule

---

## 🛠 Technology Stack

This project is built with industry-standard, production-ready technologies:

| Technology | Purpose |
|------------|---------|
| **React** | Modern UI framework for interactive interfaces |
| **TypeScript** | Type-safe development for fewer runtime errors |
| **Vite** | Lightning-fast build tool and development server |
| **Tailwind CSS** | Utility-first CSS for responsive, beautiful designs |
| **shadcn-ui** | High-quality, customizable component library |
| **React Router** | Client-side routing for seamless navigation |
| **TanStack Query** | Powerful data fetching and caching |
| **Lucide Icons** | Beautiful, consistent icon system |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher) - [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **npm** or **yarn** package manager

### Installation Steps

```sh
# Step 1: Clone the repository
git clone <YOUR_REPOSITORY_URL>

# Step 2: Navigate to the project directory
cd restaurant-inventory-manager-dashboard

# Step 3: Install all dependencies
npm install

# Step 4: Start the development server
npm run dev
```

The application will be available at **http://localhost:8080** with hot-reload enabled.

---

## 💻 Development

### Available Scripts

```sh
# Start development server with auto-reload
npm run dev

# Build for production
npm run build

# Build with development mode
npm run build:dev

# Preview production build
npm preview

# Run ESLint to check code quality
npm run lint
```

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── dashboard/      # Dashboard-specific components
│   ├── layout/         # Layout components
│   └── ui/             # Shadcn-ui components
├── pages/              # Full page components
├── data/               # Mock data and fixtures
├── types/              # TypeScript type definitions
├── hooks/              # Custom React hooks
└── lib/                # Utility functions
```

### Development Workflow

1. **Create Feature Branch** - For new features, create a feature branch
2. **Make Changes** - Develop your feature with TypeScript
3. **Run Linter** - Check code quality with ESLint
4. **Test** - Test your changes locally
5. **Commit** - Push changes with clear commit messages

---

## 🌐 Deployment

### Recommended Deployment Platforms

#### **Vercel** (Recommended - Optimized for Vite)
```bash
# Connect your GitHub repository to Vercel
# Push your code and Vercel automatically deploys
# Fastest builds and best DX
```

#### **Netlify**
```bash
# Connect GitHub repository
# Configure build: npm run build
# Set publish directory to: dist
```

#### **AWS Amplify**
- Connect GitHub repository
- Configure build settings
- Auto-deploy on git push

#### **Docker / Self-Hosted**
```dockerfile
# Multi-stage build for optimal image size
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

### Production Checklist

- [ ] Environment variables configured
- [ ] Performance optimized
- [ ] SEO metadata updated
- [ ] Security headers configured
- [ ] Analytics implemented
- [ ] Error tracking enabled
- [ ] CDN configured for static assets
- [ ] Database/API endpoints secured

---

## 📱 Features by Page

| Page | Features |
|------|----------|
| **Dashboard** | Overview, stats, charts, alerts, upcoming events |
| **Orders** | Create, edit, track orders, payment status, event details |
| **Menu** | Manage items, pricing, margins, ingredients, availability |
| **Inventory** | Stock levels, categories, low-stock alerts, valuations |
| **Purchases** | Purchase orders, suppliers, delivery tracking, costs |
| **Profit** | Financial analysis, margins, revenue trends, reports |
| **Settings** | Configuration, preferences, business settings |

---

## 🔒 Security Features

- TypeScript for type safety
- Input validation on all forms
- Responsive error handling
- Clean component architecture
- No hardcoded secrets

---

## 🚀 Performance Optimizations

- **Code Splitting** - Automatic with Vite
- **Lazy Loading** - Route-based component loading
- **Caching** - TanStack Query for intelligent data caching
- **Minification** - Production builds optimized
- **Image Optimization** - Responsive image handling

---

## 📞 Support & Documentation

### Getting Help
- Check the [Technologies](#technology-stack) section for links to official docs
- Review the project structure for component examples
- Check existing components for implementation patterns

### Common Issues

**Port already in use?**
```sh
# Change the port in vite.config.ts
# Default is 8080
```

**Dependencies not installing?**
```sh
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 📄 License

This project is built for professional use in kitchen and catering management.

---

## 🎉 Ready to Scale Your Kitchen Operations?

Kitchen Command Center is production-ready and designed to grow with your business. Deploy it today and take control of your kitchen operations!

**Happy cooking! 👨‍🍳👩‍🍳**
