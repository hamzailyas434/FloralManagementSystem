# 🌸 Floral Management System

> **Complete Business Management Solution for Cloth/Textile Manufacturing**

A comprehensive, production-ready application for managing custom cloth orders, customers, expenses, sales, and business analytics.

---

## 📚 Documentation Hub

### 🎯 **Start Here Based on Your Goal:**

| Goal | Document | Size | Description |
|------|----------|------|-------------|
| **Understand the System** | [`QUICK_REFERENCE.md`](./QUICK_REFERENCE.md) | 10 KB | Quick overview and navigation guide |
| **See Architecture** | [`SYSTEM_DESIGN.md`](./SYSTEM_DESIGN.md) | 37 KB | Complete system architecture & design |
| **Convert to MEAN/MERN** | [`MIGRATION_GUIDE.md`](./MIGRATION_GUIDE.md) | 35 KB | Step-by-step conversion guide |
| **Use AI to Convert** | [`AI_CONVERSION_PROMPT.txt`](./AI_CONVERSION_PROMPT.txt) | 16 KB | Copy-paste prompt for ChatGPT/Claude |
| **Setup Supabase** | [`SUPABASE_SETUP_GUIDE.md`](./SUPABASE_SETUP_GUIDE.md) | 15 KB | Database setup instructions |

---

## ⚡ Quick Start

### Current System (Angular + Supabase)

```bash
# Install dependencies
npm install

# Start development server
npm start

# Open browser
# http://localhost:4200
```

### Convert to Another Stack

**Option 1: Use AI (Fastest)**
1. Open [`AI_CONVERSION_PROMPT.txt`](./AI_CONVERSION_PROMPT.txt)
2. Copy entire content
3. Paste to ChatGPT or Claude
4. Choose your stack (MEAN/MERN/Next.js)
5. Get complete code structure

**Option 2: Manual Migration**
1. Read [`MIGRATION_GUIDE.md`](./MIGRATION_GUIDE.md)
2. Choose target stack section
3. Follow step-by-step instructions
4. Use provided code examples

---

## 🎯 What This System Does

### Core Features

✅ **Customer Management**
- Add, edit, delete customers
- Search customers
- View order history

✅ **Order Management**
- Create custom orders or inventory sales
- Auto-generate order numbers (6000+)
- Track payment status (Full/Half/Remaining)
- Manage order status workflow
- Add delivery tracking

✅ **Expense Tracking**
- Record business expenses
- Categorize by type
- Link to specific orders
- Calculate total expenses

✅ **Sales Management**
- Track SKU-based inventory sales
- Separate from custom orders
- Auto-generate sale numbers

✅ **Analytics Dashboard**
- Total Revenue, Expenses, Net Profit
- Pending Amount, Active Orders
- 5 interactive charts (Chart.js)
- Real-time metrics

✅ **Invoice & Export**
- Generate PDF invoices
- Export to Excel, PDF, CSV
- Advanced DataTables features

---

## 🏗️ Current Architecture

```
┌─────────────────────────────────────┐
│   Frontend: Angular 20              │
│   - Standalone Components           │
│   - TypeScript 5.8.2                │
│   - Chart.js, DataTables            │
│   - SweetAlert2, jsPDF              │
└─────────────────┬───────────────────┘
                  │ REST API
                  ▼
┌─────────────────────────────────────┐
│   Backend: Supabase                 │
│   - PostgreSQL Database             │
│   - Auto-generated REST API         │
│   - Row Level Security              │
└─────────────────────────────────────┘
```

---

## 🗄️ Database Schema

**7 Tables:**
1. **customers** - Customer information
2. **orders** - Order management (custom + sales)
3. **order_items** - Product specifications
4. **delivery_costs** - Delivery logistics
5. **expenses** - Business expenses
6. **sales** - Inventory sales
7. **sale_items** - SKU items

**See [`SYSTEM_DESIGN.md`](./SYSTEM_DESIGN.md) for complete ERD and schema details.**

---

## 🔄 Conversion Options

### MEAN Stack (Minimal Changes)
- **Frontend:** Angular 17+ (keep existing)
- **Backend:** Node.js + Express.js
- **Database:** MongoDB
- **Effort:** Low (only update service layer)

### MERN Stack (Modern & Popular)
- **Frontend:** React 18+ (rebuild UI)
- **Backend:** Node.js + Express.js
- **Database:** MongoDB
- **Effort:** Medium (recreate components)

### Next.js Full-Stack (All-in-One)
- **Framework:** Next.js 14+ (App Router)
- **Database:** PostgreSQL with Prisma
- **Effort:** Medium (single codebase)

### NestJS + Angular (Enterprise)
- **Frontend:** Angular 17+
- **Backend:** NestJS
- **Database:** PostgreSQL with TypeORM
- **Effort:** Medium (structured backend)

**See [`MIGRATION_GUIDE.md`](./MIGRATION_GUIDE.md) for detailed conversion instructions.**

---

## 📊 System Statistics

- **7** Database Tables
- **29** API Endpoints
- **8** Main Components
- **5** Service Classes
- **5** Chart Visualizations
- **4** Order Status States
- **3** Payment Status States
- **4** Expense Types
- **2** Order Types

---

## 🛠️ Technology Stack

### Current Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Frontend** | Angular | 20.0.0 |
| **Language** | TypeScript | 5.8.2 |
| **Backend** | Supabase | - |
| **Database** | PostgreSQL | - |
| **Charts** | Chart.js | 4.5.1 |
| **Tables** | DataTables.net | 2.3.5+ |
| **Alerts** | SweetAlert2 | 11.26.3 |
| **PDF** | jsPDF | 3.0.4 |

---

## 📁 Project Structure

```
floral-management-system/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   ├── orders/
│   │   │   ├── customers/
│   │   │   ├── expenses/
│   │   │   └── sales/
│   │   ├── services/
│   │   │   ├── supabase.service.ts
│   │   │   ├── customer.service.ts
│   │   │   ├── order.service.ts
│   │   │   ├── expense.service.ts
│   │   │   └── sales.service.ts
│   │   ├── models/
│   │   ├── app.component.ts
│   │   └── app.routes.ts
│   ├── environments.ts
│   └── index.html
├── supabase/
│   └── migrations/          # 7 SQL migration files
├── SYSTEM_DESIGN.md         # Complete architecture
├── MIGRATION_GUIDE.md       # Conversion guide
├── AI_CONVERSION_PROMPT.txt # AI prompt
├── QUICK_REFERENCE.md       # Quick overview
├── SUPABASE_SETUP_GUIDE.md  # Database setup
├── package.json
└── README.md                # This file
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account (for current system)

### Installation

```bash
# Clone or download the project
cd "Floral Management System"

# Install dependencies
npm install

# Configure environment
# Edit src/environments.ts with your Supabase credentials

# Start development server
npm start

# Open browser to http://localhost:4200
```

### Build for Production

```bash
npm run build
# Output in dist/ directory
```

---

## 📖 Documentation Guide

### For Developers

1. **First Time?** → Read [`QUICK_REFERENCE.md`](./QUICK_REFERENCE.md)
2. **Understanding Architecture?** → Read [`SYSTEM_DESIGN.md`](./SYSTEM_DESIGN.md)
3. **Want to Convert?** → Read [`MIGRATION_GUIDE.md`](./MIGRATION_GUIDE.md)
4. **Need Quick Conversion?** → Use [`AI_CONVERSION_PROMPT.txt`](./AI_CONVERSION_PROMPT.txt)

### For Business Users

- **Dashboard:** View all business metrics and charts
- **Orders:** Create and manage customer orders
- **Customers:** Manage customer database
- **Expenses:** Track business expenses
- **Sales:** Manage inventory sales
- **Invoices:** Generate PDF invoices

---

## 🎯 Key Features Explained

### Order Number Generation
- Starts at 6000
- Auto-increments sequentially
- Unique per order

### Payment Tracking
- **Full Payment:** Amount remaining = 0
- **Half Payment:** Paid ≥ 50%
- **Remaining:** Paid < 50%

### Order Types
- **Customer Order:** Custom manufacturing with specifications
- **Sale:** Inventory-based sales with SKU codes

### Delivery Costs
- Track actual cost (business expense)
- Track customer charge (revenue)
- National/International types

---

## 🔌 API Endpoints (29 total)

### Customers (6)
```
GET    /api/customers
POST   /api/customers
PUT    /api/customers/:id
DELETE /api/customers/:id
GET    /api/customers/:id
GET    /api/customers/search?q=
```

### Orders (7)
```
GET    /api/orders
POST   /api/orders
PUT    /api/orders/:id
DELETE /api/orders/:id
GET    /api/orders/:id
GET    /api/orders/next-number
GET    /api/orders/sales
```

### Expenses (5)
```
GET    /api/expenses
POST   /api/expenses
PUT    /api/expenses/:id
DELETE /api/expenses/:id
GET    /api/expenses/total
```

**See [`MIGRATION_GUIDE.md`](./MIGRATION_GUIDE.md) for complete API specification.**

---

## 🔒 Security

- Row Level Security (RLS) enabled
- Authentication required for most operations
- Input validation
- CORS configured
- Environment variables for secrets

---

## 📦 Dependencies

### Main Dependencies
```json
{
  "@angular/core": "^20.0.0",
  "@supabase/supabase-js": "^2.86.0",
  "chart.js": "^4.5.1",
  "datatables.net": "^2.3.5",
  "sweetalert2": "^11.26.3",
  "jspdf": "^3.0.4"
}
```

---

## 🎨 Screenshots

### Dashboard
- Real-time metrics cards
- 5 interactive charts
- Business insights

### Orders
- DataTables with search/sort/export
- Create/edit modal forms
- Invoice generation

### Customers
- Customer list with search
- Order history per customer
- CRUD operations

---

## 🤝 Contributing

This is a complete, production-ready system. You can:
- Use as-is
- Convert to different stack
- Customize for your needs
- Deploy to production

---

## 📝 License

This project is available for use and modification.

---

## 🆘 Support

### Need Help?

1. **Understanding the system?**
   - Read [`SYSTEM_DESIGN.md`](./SYSTEM_DESIGN.md)

2. **Want to convert?**
   - Use [`AI_CONVERSION_PROMPT.txt`](./AI_CONVERSION_PROMPT.txt) with ChatGPT
   - Or follow [`MIGRATION_GUIDE.md`](./MIGRATION_GUIDE.md)

3. **Quick questions?**
   - Check [`QUICK_REFERENCE.md`](./QUICK_REFERENCE.md)

---

## 🎓 Learning Resources

### Current Stack
- [Angular Documentation](https://angular.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Chart.js Documentation](https://www.chartjs.org/docs/)

### For Conversion
- [MEAN Stack Guide](https://www.mongodb.com/mean-stack)
- [MERN Stack Guide](https://www.mongodb.com/mern-stack)
- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com/)

---

## ✅ What You Get

### Documentation (5 files)
- ✅ Complete System Design (37 KB)
- ✅ Migration Guide for MEAN/MERN/Next.js (35 KB)
- ✅ AI Conversion Prompt (16 KB)
- ✅ Quick Reference (10 KB)
- ✅ Supabase Setup Guide (15 KB)

### Application
- ✅ Working Angular 20 application
- ✅ 7-table database schema
- ✅ 8 main components
- ✅ 5 service classes
- ✅ Complete business logic
- ✅ Charts and analytics
- ✅ PDF generation
- ✅ Data export

### Migration Support
- ✅ Ready-to-use AI prompt
- ✅ Code examples for all stacks
- ✅ Step-by-step guides
- ✅ API specifications
- ✅ Database migration strategies

---

## 🚀 Next Steps

### To Use Current System:
```bash
npm install
npm start
```

### To Convert to Another Stack:
1. Choose your stack (MEAN/MERN/Next.js/NestJS)
2. Open `AI_CONVERSION_PROMPT.txt`
3. Copy to ChatGPT or Claude
4. Get complete code structure
5. Follow deployment guide

### To Deploy:
- **Frontend:** Vercel, Netlify, Firebase Hosting
- **Backend:** Heroku, Railway, Render, DigitalOcean
- **Database:** MongoDB Atlas, AWS RDS, Supabase

---

## 📊 System Metrics

- **Lines of Code:** ~5,000+
- **Components:** 8
- **Services:** 5
- **Database Tables:** 7
- **API Endpoints:** 29
- **Features:** 6 major modules
- **Charts:** 5 types
- **Documentation:** 113 KB total

---

**Built with ❤️ for Cloth/Textile Manufacturing Businesses**

**Last Updated:** 2024-11-28  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

---

## 📞 Quick Links

- [System Design](./SYSTEM_DESIGN.md) - Complete architecture
- [Migration Guide](./MIGRATION_GUIDE.md) - Convert to MEAN/MERN
- [AI Prompt](./AI_CONVERSION_PROMPT.txt) - Use with ChatGPT
- [Quick Reference](./QUICK_REFERENCE.md) - Overview
- [Supabase Setup](./SUPABASE_SETUP_GUIDE.md) - Database setup

---

**Ready to convert? Start with [`AI_CONVERSION_PROMPT.txt`](./AI_CONVERSION_PROMPT.txt)! 🚀**
