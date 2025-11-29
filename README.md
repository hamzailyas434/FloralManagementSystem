# 🌸 Floral Management System

A comprehensive management system for floral/clothing businesses with order management, customer tracking, sales, expenses, and WhatsApp notifications.

## ✨ Features

- **Order Management** - Create and track customer orders and sales
- **Customer Management** - Maintain customer database with purchase history
- **Sales Management** - Track sales with SKU inventory
- **Expense Tracking** - Monitor business expenses
- **Reports & Analytics** - Comprehensive business insights and reporting
- **WhatsApp Integration** - Automatic order status notifications
- **Invoice Generation** - Professional PDF invoices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

```bash
# Clone the repository
git clone https://github.com/hamzailyas434/FloralManagementSystem.git
cd FloralManagementSystem

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env and add your Twilio credentials

# Start the application
npm start

# In another terminal, start WhatsApp server
node server/whatsapp-server.js
```

## 📱 WhatsApp Integration Setup

1. Create a Twilio account at https://www.twilio.com
2. Get your Account SID and Auth Token
3. Add credentials to `.env` file:
   ```
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   ```
4. Start the WhatsApp server: `node server/whatsapp-server.js`

For detailed setup instructions, see `WHATSAPP_SETUP_COMPLETE.md`

## 📊 Reports & Analytics

Access comprehensive business reports at `/reports`:
- Revenue, expenses, and profit tracking
- Product performance analysis
- Customer lifetime value
- Outstanding payments
- Excel and PDF exports

For more details, see `REPORTS_FEATURE_GUIDE.md`

## 🔐 Security

- Never commit `.env` file (already in `.gitignore`)
- Use environment variables for all sensitive data
- Keep Twilio credentials secure

## 📚 Documentation

- `WHATSAPP_INTEGRATION_GUIDE.md` - Complete WhatsApp setup guide
- `WHATSAPP_SETUP_COMPLETE.md` - Quick start for WhatsApp
- `REPORTS_FEATURE_GUIDE.md` - Reports and analytics documentation
- `FUTURE_FEATURES_ROADMAP.md` - Planned features and enhancements

## 🛠️ Tech Stack

- **Frontend:** Angular 20
- **Backend:** Supabase (PostgreSQL)
- **WhatsApp API:** Twilio
- **Styling:** Custom CSS
- **Reports:** XLSX, jsPDF

## 📝 License

Private - All rights reserved

## 👨‍💻 Author

Hamza Ilyas
