# 📊 Stock & Financial Management System - Implementation Guide

## 🎯 **Overview:**

This guide explains how to implement a complete **Stock Valuation** and **Financial Tracking** system for your Floral Management System.

---

## 📋 **Features to Implement:**

### **1. Stock Valuation (Sales Enhancement)**
- Add **Purchase Price** field to each sale
- Calculate **Total Stock Value** automatically
- Display stock value on Sales page
- Show total assets on Dashboard

### **2. Bank Balance Management**
- Track current **Bank Balance**
- Record **Deposits** and **Withdrawals**
- Auto-update balance when orders are paid
- Auto-deduct when expenses are added
- Transaction history

### **3. Dashboard Financial Overview**
- **Total Stock Value** (Assets)
- **Bank Balance** (Cash)
- **Total Revenue** (from Orders)
- **Total Expenses**
- **Net Profit/Loss**

---

## 🗄️ **Database Changes:**

### **Step 1: Run Migration**

File: `supabase/migrations/20251130_add_stock_financial_tracking.sql`

**What it does:**
1. Adds `purchase_price_per_item` to `sales` table
2. Adds `total_stock_value` to `sales` table
3. Creates `bank_balance` table
4. Creates `bank_transactions` table

**To Apply:**
```sql
-- In Supabase SQL Editor, run:
-- (The migration file content)
```

---

## 💡 **How It Works:**

### **Sales Page Enhancement:**

**Before:**
```
Sale #: SALE-001
Items: 201
SKUs: 21
```

**After:**
```
Sale #: SALE-001
Items: 201
SKUs: 21
Purchase Price: Rs. 6,000 per item
Total Stock Value: Rs. 1,206,000
```

**Calculation:**
```
Total Stock Value = Total Items × Purchase Price Per Item
                  = 201 × 6,000
                  = 1,206,000
```

---

### **Bank Balance System:**

**Scenarios:**

1. **Customer Pays for Order:**
   - Order Amount: Rs. 50,000
   - Bank Balance: +50,000
   - Transaction Type: `order_payment`

2. **Add Expense:**
   - Expense: Rs. 10,000
   - Bank Balance: -10,000
   - Transaction Type: `expense`

3. **Manual Deposit:**
   - Amount: Rs. 100,000
   - Bank Balance: +100,000
   - Transaction Type: `deposit`

4. **Manual Withdrawal:**
   - Amount: Rs. 20,000
   - Bank Balance: -20,000
   - Transaction Type: `withdrawal`

---

## 📊 **Dashboard Cards:**

### **Financial Overview Section:**

```
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│  💰 Bank Balance    │  │  📦 Stock Value     │  │  💵 Total Revenue   │
│                     │  │                     │  │                     │
│  Rs. 500,000        │  │  Rs. 1,206,000      │  │  Rs. 2,500,000      │
│  ↑ +50,000 today    │  │  201 items in stock │  │  50 orders          │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘

┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│  💸 Total Expenses  │  │  📈 Net Profit      │  │  🏦 Total Assets    │
│                     │  │                     │  │                     │
│  Rs. 800,000        │  │  Rs. 1,700,000      │  │  Rs. 1,706,000      │
│  120 expenses       │  │  ↑ Profitable       │  │  Bank + Stock       │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

**Calculations:**
- **Net Profit** = Total Revenue - Total Expenses
- **Total Assets** = Bank Balance + Stock Value

---

## 🔧 **Implementation Steps:**

### **Phase 1: Database Setup** ✅ (Done)
- [x] Migration file created
- [ ] Run migration in Supabase
- [x] TypeScript interfaces updated

### **Phase 2: Sales Page Enhancement**

**File:** `src/app/components/sales/sales.component.ts`

**Add to Sale Form:**
```html
<div class="form-group">
  <label>Purchase Price per Item *</label>
  <input type="number" [(ngModel)]="formData.purchase_price_per_item" required>
</div>

<div class="form-group">
  <label>Total Stock Value (Auto-calculated)</label>
  <input type="text" [value]="calculateStockValue()" readonly>
</div>
```

**Add Method:**
```typescript
calculateStockValue(): number {
  const totalItems = this.formData.sku_items.reduce((sum, sku) => sum + sku.quantity, 0);
  const pricePerItem = this.formData.purchase_price_per_item || 0;
  return totalItems * pricePerItem;
}
```

**Update Save Method:**
```typescript
async saveSale() {
  // ... existing code ...
  
  const saleData = {
    // ... existing fields ...
    purchase_price_per_item: this.formData.purchase_price_per_item,
    total_stock_value: this.calculateStockValue()
  };
  
  // ... save logic ...
}
```

### **Phase 3: Bank Balance Service**

**Create:** `src/app/services/bank.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { BankBalance, BankTransaction } from '../models/database.types';

@Injectable({
  providedIn: 'root'
})
export class BankService {
  constructor(private supabase: SupabaseService) {}

  async getCurrentBalance(): Promise<number> {
    const { data, error } = await this.supabase.client
      .from('bank_balance')
      .select('balance')
      .single();
    
    if (error) throw error;
    return data?.balance || 0;
  }

  async updateBalance(amount: number, type: string, description: string, referenceId?: string) {
    // Get current balance
    const currentBalance = await this.getCurrentBalance();
    
    // Calculate new balance
    const adjustment = type === 'deposit' || type === 'order_payment' ? amount : -amount;
    const newBalance = currentBalance + adjustment;
    
    // Update balance
    await this.supabase.client
      .from('bank_balance')
      .update({ balance: newBalance, last_updated: new Date().toISOString() })
      .eq('id', (await this.getBankBalanceId()));
    
    // Record transaction
    await this.supabase.client
      .from('bank_transactions')
      .insert({
        transaction_date: new Date().toISOString().split('T')[0],
        transaction_type: type,
        amount: Math.abs(amount),
        description,
        reference_id: referenceId
      });
    
    return newBalance;
  }

  async getTransactions(): Promise<BankTransaction[]> {
    const { data, error } = await this.supabase.client
      .from('bank_transactions')
      .select('*')
      .order('transaction_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  private async getBankBalanceId(): Promise<string> {
    const { data } = await this.supabase.client
      .from('bank_balance')
      .select('id')
      .single();
    return data?.id || '';
  }
}
```

### **Phase 4: Dashboard Enhancement**

**File:** `src/app/components/dashboard/dashboard.component.ts`

**Add to Component:**
```typescript
export class DashboardComponent implements OnInit {
  // ... existing properties ...
  
  bankBalance = 0;
  totalStockValue = 0;
  totalRevenue = 0;
  totalExpenses = 0;
  netProfit = 0;
  totalAssets = 0;

  constructor(
    // ... existing services ...
    private bankService: BankService,
    private salesService: SalesService
  ) {}

  async ngOnInit() {
    await Promise.all([
      this.loadFinancialData(),
      // ... existing loads ...
    ]);
  }

  async loadFinancialData() {
    // Bank Balance
    this.bankBalance = await this.bankService.getCurrentBalance();
    
    // Stock Value
    const sales = await this.salesService.getSales();
    this.totalStockValue = sales.reduce((sum, sale) => 
      sum + (sale.total_stock_value || 0), 0
    );
    
    // Revenue (from orders)
    this.totalRevenue = this.orders.reduce((sum, order) => 
      sum + order.total_amount, 0
    );
    
    // Expenses
    this.totalExpenses = this.expenses.reduce((sum, expense) => 
      sum + expense.cost, 0
    );
    
    // Calculations
    this.netProfit = this.totalRevenue - this.totalExpenses;
    this.totalAssets = this.bankBalance + this.totalStockValue;
  }
}
```

**Add to Template:**
```html
<div class="financial-overview">
  <div class="stat-card">
    <div class="stat-icon">💰</div>
    <div class="stat-details">
      <h3>Bank Balance</h3>
      <p class="stat-value">Rs. {{ bankBalance.toLocaleString() }}</p>
    </div>
  </div>

  <div class="stat-card">
    <div class="stat-icon">📦</div>
    <div class="stat-details">
      <h3>Stock Value</h3>
      <p class="stat-value">Rs. {{ totalStockValue.toLocaleString() }}</p>
    </div>
  </div>

  <div class="stat-card">
    <div class="stat-icon">💵</div>
    <div class="stat-details">
      <h3>Total Revenue</h3>
      <p class="stat-value">Rs. {{ totalRevenue.toLocaleString() }}</p>
    </div>
  </div>

  <div class="stat-card">
    <div class="stat-icon">💸</div>
    <div class="stat-details">
      <h3>Total Expenses</h3>
      <p class="stat-value">Rs. {{ totalExpenses.toLocaleString() }}</p>
    </div>
  </div>

  <div class="stat-card" [class.profit]="netProfit > 0" [class.loss]="netProfit < 0">
    <div class="stat-icon">📈</div>
    <div class="stat-details">
      <h3>Net Profit</h3>
      <p class="stat-value">Rs. {{ netProfit.toLocaleString() }}</p>
    </div>
  </div>

  <div class="stat-card">
    <div class="stat-icon">🏦</div>
    <div class="stat-details">
      <h3>Total Assets</h3>
      <p class="stat-value">Rs. {{ totalAssets.toLocaleString() }}</p>
    </div>
  </div>
</div>
```

---

## 🔄 **Auto-Update Bank Balance:**

### **When Order is Paid:**

**File:** `src/app/components/orders/order-detail.component.ts`

```typescript
async saveOrder() {
  // ... existing save logic ...
  
  // If payment is made, update bank balance
  if (this.order.amount_paid > 0) {
    await this.bankService.updateBalance(
      this.order.amount_paid,
      'order_payment',
      `Payment for Order #${this.order.order_number}`,
      orderId
    );
  }
}
```

### **When Expense is Added:**

**File:** `src/app/components/expenses/expenses.component.ts`

```typescript
async saveExpense() {
  // ... existing save logic ...
  
  // Deduct from bank balance
  await this.bankService.updateBalance(
    this.formData.cost,
    'expense',
    this.formData.description,
    expenseId
  );
}
```

---

## 📱 **Bank Balance Management Page (Optional):**

Create a dedicated page for manual transactions:

**Features:**
- View current balance
- Add deposit
- Add withdrawal
- View transaction history
- Filter by date/type

---

## ✅ **Summary:**

**What You Get:**
1. ✅ **Stock Valuation** - Know your inventory worth
2. ✅ **Bank Balance** - Track cash flow
3. ✅ **Financial Dashboard** - Complete overview
4. ✅ **Auto-Updates** - Balance updates with orders/expenses
5. ✅ **Transaction History** - Audit trail

**Next Steps:**
1. Run the database migration
2. Update Sales form to include purchase price
3. Create BankService
4. Update Dashboard with financial cards
5. Add auto-update logic to orders and expenses

**Kya aap chahte hain ke main in changes ko implement kar doon?** 🚀
