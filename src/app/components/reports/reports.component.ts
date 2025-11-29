import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { CustomerService } from '../../services/customer.service';
import { SalesService } from '../../services/sales.service';
import { OrderWithDetails, Customer, SaleWithDetails } from '../../models/database.types';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface ReportData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalOrders: number;
  pendingPayments: number;
  completedOrders: number;
}

interface ProductStats {
  productType: string;
  quantity: number;
  revenue: number;
  percentage: number;
}

interface CustomerStats {
  customer: Customer;
  totalOrders: number;
  totalSpent: number;
  pendingAmount: number;
  lastOrderDate: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reports-container">
      <div class="header">
        <h1>📊 Reports & Analytics</h1>
        <p class="subtitle">Comprehensive business insights and performance metrics</p>
      </div>

      <!-- Date Range Filter -->
      <div class="filter-section">
        <div class="filter-card">
          <h3>📅 Select Date Range</h3>
          <div class="date-filters">
            <div class="quick-filters">
              <button class="filter-btn" [class.active]="selectedRange === 'today'" (click)="setDateRange('today')">Today</button>
              <button class="filter-btn" [class.active]="selectedRange === 'week'" (click)="setDateRange('week')">This Week</button>
              <button class="filter-btn" [class.active]="selectedRange === 'month'" (click)="setDateRange('month')">This Month</button>
              <button class="filter-btn" [class.active]="selectedRange === 'year'" (click)="setDateRange('year')">This Year</button>
              <button class="filter-btn" [class.active]="selectedRange === 'custom'" (click)="selectedRange = 'custom'">Custom</button>
            </div>
            <div class="custom-dates" *ngIf="selectedRange === 'custom'">
              <div class="date-input">
                <label>From:</label>
                <input type="date" [(ngModel)]="startDate" (change)="loadReports()">
              </div>
              <div class="date-input">
                <label>To:</label>
                <input type="date" [(ngModel)]="endDate" (change)="loadReports()">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="stat-card revenue">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <h3>Total Revenue</h3>
            <p class="stat-value">Rs. {{ reportData.totalRevenue.toLocaleString() }}</p>
          </div>
        </div>

        <div class="stat-card expenses">
          <div class="stat-icon">💸</div>
          <div class="stat-content">
            <h3>Total Expenses</h3>
            <p class="stat-value">Rs. {{ reportData.totalExpenses.toLocaleString() }}</p>
          </div>
        </div>

        <div class="stat-card profit">
          <div class="stat-icon">📈</div>
          <div class="stat-content">
            <h3>Net Profit</h3>
            <p class="stat-value" [class.negative]="reportData.netProfit < 0">
              Rs. {{ reportData.netProfit.toLocaleString() }}
            </p>
          </div>
        </div>

        <div class="stat-card orders">
          <div class="stat-icon">📦</div>
          <div class="stat-content">
            <h3>Total Orders</h3>
            <p class="stat-value">{{ reportData.totalOrders }}</p>
          </div>
        </div>

        <div class="stat-card pending">
          <div class="stat-icon">⏳</div>
          <div class="stat-content">
            <h3>Pending Payments</h3>
            <p class="stat-value">Rs. {{ reportData.pendingPayments.toLocaleString() }}</p>
          </div>
        </div>

        <div class="stat-card completed">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <h3>Completed Orders</h3>
            <p class="stat-value">{{ reportData.completedOrders }}</p>
          </div>
        </div>
      </div>

      <!-- Product Performance -->
      <div class="report-section">
        <div class="section-header">
          <h2>🎯 Product Performance (Dress vs Dupatta)</h2>
          <button class="btn-export" (click)="exportProductReport()">📥 Export</button>
        </div>
        <div class="product-stats">
          <div class="product-card" *ngFor="let product of productStats">
            <h3>{{ product.productType }}</h3>
            <div class="product-metrics">
              <div class="metric">
                <span class="label">Quantity Sold:</span>
                <span class="value">{{ product.quantity }}</span>
              </div>
              <div class="metric">
                <span class="label">Revenue:</span>
                <span class="value">Rs. {{ product.revenue.toLocaleString() }}</span>
              </div>
              <div class="metric">
                <span class="label">Market Share:</span>
                <span class="value">{{ product.percentage.toFixed(1) }}%</span>
              </div>
            </div>
            <div class="progress-bar">
              <div class="progress" [style.width.%]="product.percentage"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Customers -->
      <div class="report-section">
        <div class="section-header">
          <h2>👥 Top Customers by Lifetime Value</h2>
          <button class="btn-export" (click)="exportCustomerReport()">📥 Export</button>
        </div>
        <div class="table-container">
          <table class="report-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Customer Name</th>
                <th>Total Orders</th>
                <th>Total Spent</th>
                <th>Pending Amount</th>
                <th>Last Order</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let customer of topCustomers; let i = index">
                <td>{{ i + 1 }}</td>
                <td>{{ customer.customer.name }}</td>
                <td>{{ customer.totalOrders }}</td>
                <td>Rs. {{ customer.totalSpent.toLocaleString() }}</td>
                <td [class.pending]="customer.pendingAmount > 0">
                  Rs. {{ customer.pendingAmount.toLocaleString() }}
                </td>
                <td>{{ formatDate(customer.lastOrderDate) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Outstanding Payments -->
      <div class="report-section">
        <div class="section-header">
          <h2>💳 Outstanding Payments</h2>
          <button class="btn-export" (click)="exportOutstandingReport()">📥 Export</button>
        </div>
        <div class="table-container">
          <table class="report-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Order Date</th>
                <th>Total Amount</th>
                <th>Paid</th>
                <th>Remaining</th>
                <th>Days Overdue</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let order of outstandingOrders">
                <td>{{ order.order_number }}</td>
                <td>{{ order.customer?.name }}</td>
                <td>{{ formatDate(order.order_date) }}</td>
                <td>Rs. {{ order.total_amount.toLocaleString() }}</td>
                <td>Rs. {{ order.amount_paid.toLocaleString() }}</td>
                <td class="outstanding">Rs. {{ order.amount_remaining.toLocaleString() }}</td>
                <td [class.overdue]="getDaysOverdue(order.order_date) > 7">
                  {{ getDaysOverdue(order.order_date) }} days
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Export All Reports -->
      <div class="export-section">
        <h3>📊 Export Complete Report</h3>
        <div class="export-buttons">
          <button class="btn-primary" (click)="exportAllToExcel()">
            📥 Export to Excel
          </button>
          <button class="btn-primary" (click)="exportAllToPDF()">
            📄 Export to PDF
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      margin-bottom: 2rem;
    }

    .header h1 {
      margin: 0;
      color: #2d3748;
      font-size: 2rem;
    }

    .subtitle {
      color: #718096;
      margin: 0.5rem 0 0;
    }

    .filter-section {
      margin-bottom: 2rem;
    }

    .filter-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .filter-card h3 {
      margin: 0 0 1rem;
      color: #2d3748;
    }

    .quick-filters {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
    }

    .filter-btn {
      padding: 0.625rem 1.25rem;
      border: 2px solid #e2e8f0;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      font-weight: 500;
    }

    .filter-btn:hover {
      border-color: #3182ce;
      background: #ebf8ff;
    }

    .filter-btn.active {
      background: #3182ce;
      color: white;
      border-color: #3182ce;
    }

    .custom-dates {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }

    .date-input {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .date-input label {
      font-weight: 600;
      color: #4a5568;
      font-size: 0.875rem;
    }

    .date-input input {
      padding: 0.625rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.9375rem;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      gap: 1rem;
      align-items: center;
      transition: transform 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .stat-icon {
      font-size: 2.5rem;
      line-height: 1;
    }

    .stat-content h3 {
      margin: 0;
      font-size: 0.875rem;
      color: #718096;
      font-weight: 500;
    }

    .stat-value {
      margin: 0.5rem 0 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #2d3748;
    }

    .stat-value.negative {
      color: #e53e3e;
    }

    .stat-card.revenue { border-left: 4px solid #48bb78; }
    .stat-card.expenses { border-left: 4px solid #f56565; }
    .stat-card.profit { border-left: 4px solid #4299e1; }
    .stat-card.orders { border-left: 4px solid #9f7aea; }
    .stat-card.pending { border-left: 4px solid #ed8936; }
    .stat-card.completed { border-left: 4px solid #38b2ac; }

    .report-section {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .section-header h2 {
      margin: 0;
      color: #2d3748;
      font-size: 1.25rem;
    }

    .btn-export {
      padding: 0.625rem 1.25rem;
      background: #10b981;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }

    .btn-export:hover {
      background: #059669;
      transform: translateY(-1px);
    }

    .product-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .product-card {
      background: #f7fafc;
      padding: 1.5rem;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }

    .product-card h3 {
      margin: 0 0 1rem;
      color: #2d3748;
      font-size: 1.125rem;
    }

    .product-metrics {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .metric {
      display: flex;
      justify-content: space-between;
    }

    .metric .label {
      color: #718096;
      font-size: 0.875rem;
    }

    .metric .value {
      font-weight: 600;
      color: #2d3748;
    }

    .progress-bar {
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress {
      height: 100%;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      transition: width 0.3s;
    }

    .table-container {
      overflow-x: auto;
    }

    .report-table {
      width: 100%;
      border-collapse: collapse;
    }

    .report-table th {
      background: #2d3748;
      color: white;
      padding: 0.75rem;
      text-align: left;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .report-table td {
      padding: 0.75rem;
      border-bottom: 1px solid #e2e8f0;
      color: #4a5568;
    }

    .report-table tbody tr:hover {
      background: #f7fafc;
    }

    .pending {
      color: #ed8936;
      font-weight: 600;
    }

    .outstanding {
      color: #e53e3e;
      font-weight: 600;
    }

    .overdue {
      color: #e53e3e;
      font-weight: 700;
    }

    .export-section {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      text-align: center;
    }

    .export-section h3 {
      margin: 0 0 1.5rem;
      color: #2d3748;
    }

    .export-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .btn-primary {
      padding: 0.875rem 2rem;
      background: #3182ce;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.2s;
    }

    .btn-primary:hover {
      background: #2c5aa0;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(49, 130, 206, 0.3);
    }

    @media (max-width: 768px) {
      .summary-cards {
        grid-template-columns: 1fr;
      }

      .product-stats {
        grid-template-columns: 1fr;
      }

      .export-buttons {
        flex-direction: column;
      }

      .section-header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
      }
    }
  `]
})
export class ReportsComponent implements OnInit {
  selectedRange = 'month';
  startDate = '';
  endDate = '';

  reportData: ReportData = {
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    totalOrders: 0,
    pendingPayments: 0,
    completedOrders: 0
  };

  productStats: ProductStats[] = [];
  topCustomers: CustomerStats[] = [];
  outstandingOrders: OrderWithDetails[] = [];

  allOrders: OrderWithDetails[] = [];
  allCustomers: Customer[] = [];

  constructor(
    private orderService: OrderService,
    private customerService: CustomerService,
    private salesService: SalesService
  ) {}

  async ngOnInit() {
    this.setDateRange('month');
  }

  setDateRange(range: string) {
    this.selectedRange = range;
    const today = new Date();
    const endDate = new Date();

    switch (range) {
      case 'today':
        this.startDate = today.toISOString().split('T')[0];
        this.endDate = endDate.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);
        this.startDate = weekStart.toISOString().split('T')[0];
        this.endDate = endDate.toISOString().split('T')[0];
        break;
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        this.startDate = monthStart.toISOString().split('T')[0];
        this.endDate = endDate.toISOString().split('T')[0];
        break;
      case 'year':
        const yearStart = new Date(today.getFullYear(), 0, 1);
        this.startDate = yearStart.toISOString().split('T')[0];
        this.endDate = endDate.toISOString().split('T')[0];
        break;
    }

    this.loadReports();
  }

  async loadReports() {
    try {
      await Promise.all([
        this.loadOrders(),
        this.loadCustomers(),
        this.calculateReportData(),
        this.calculateProductStats(),
        this.calculateCustomerStats(),
        this.loadOutstandingPayments()
      ]);
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  }

  async loadOrders() {
    this.allOrders = await this.orderService.getOrders();
  }

  async loadCustomers() {
    this.allCustomers = await this.customerService.getCustomers();
  }

  async calculateReportData() {
    const filteredOrders = this.filterOrdersByDate(this.allOrders);

    this.reportData.totalOrders = filteredOrders.length;
    this.reportData.totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    this.reportData.pendingPayments = filteredOrders.reduce((sum, order) => sum + (order.amount_remaining || 0), 0);
    this.reportData.completedOrders = filteredOrders.filter(o => o.order_status === 'Completed' || o.order_status === 'Delivered').length;

    // TODO: Get expenses from database
    this.reportData.totalExpenses = 0; // Will be calculated from expenses table
    this.reportData.netProfit = this.reportData.totalRevenue - this.reportData.totalExpenses;
  }

  async calculateProductStats() {
    const filteredOrders = this.filterOrdersByDate(this.allOrders);
    const productMap = new Map<string, { quantity: number; revenue: number }>();

    filteredOrders.forEach(order => {
      order.order_items?.forEach(item => {
        const type = item.product_type || 'Unknown';
        const existing = productMap.get(type) || { quantity: 0, revenue: 0 };
        productMap.set(type, {
          quantity: existing.quantity + (item.quantity || 0),
          revenue: existing.revenue + ((item.quantity || 0) * (item.price || 0))
        });
      });
    });

    const totalRevenue = Array.from(productMap.values()).reduce((sum, p) => sum + p.revenue, 0);

    this.productStats = Array.from(productMap.entries()).map(([type, data]) => ({
      productType: type,
      quantity: data.quantity,
      revenue: data.revenue,
      percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0
    })).sort((a, b) => b.revenue - a.revenue);
  }

  async calculateCustomerStats() {
    const customerMap = new Map<string, CustomerStats>();

    this.allOrders.forEach(order => {
      if (!order.customer) return;

      const existing = customerMap.get(order.customer.id) || {
        customer: order.customer,
        totalOrders: 0,
        totalSpent: 0,
        pendingAmount: 0,
        lastOrderDate: order.order_date
      };

      customerMap.set(order.customer.id, {
        customer: order.customer,
        totalOrders: existing.totalOrders + 1,
        totalSpent: existing.totalSpent + (order.total_amount || 0),
        pendingAmount: existing.pendingAmount + (order.amount_remaining || 0),
        lastOrderDate: new Date(order.order_date) > new Date(existing.lastOrderDate) ? order.order_date : existing.lastOrderDate
      });
    });

    this.topCustomers = Array.from(customerMap.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);
  }

  async loadOutstandingPayments() {
    this.outstandingOrders = this.allOrders
      .filter(order => (order.amount_remaining || 0) > 0)
      .sort((a, b) => (b.amount_remaining || 0) - (a.amount_remaining || 0));
  }

  filterOrdersByDate(orders: OrderWithDetails[]): OrderWithDetails[] {
    if (!this.startDate || !this.endDate) return orders;

    return orders.filter(order => {
      const orderDate = new Date(order.order_date);
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      return orderDate >= start && orderDate <= end;
    });
  }

  getDaysOverdue(orderDate: string): number {
    const today = new Date();
    const order = new Date(orderDate);
    const diffTime = Math.abs(today.getTime() - order.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  exportProductReport() {
    const ws = XLSX.utils.json_to_sheet(this.productStats.map(p => ({
      'Product Type': p.productType,
      'Quantity Sold': p.quantity,
      'Revenue': p.revenue,
      'Market Share %': p.percentage.toFixed(2)
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Product Performance');
    XLSX.writeFile(wb, `product-report-${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  exportCustomerReport() {
    const ws = XLSX.utils.json_to_sheet(this.topCustomers.map(c => ({
      'Customer Name': c.customer.name,
      'Total Orders': c.totalOrders,
      'Total Spent': c.totalSpent,
      'Pending Amount': c.pendingAmount,
      'Last Order Date': this.formatDate(c.lastOrderDate)
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Top Customers');
    XLSX.writeFile(wb, `customer-report-${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  exportOutstandingReport() {
    const ws = XLSX.utils.json_to_sheet(this.outstandingOrders.map(o => ({
      'Order Number': o.order_number,
      'Customer': o.customer?.name,
      'Order Date': this.formatDate(o.order_date),
      'Total Amount': o.total_amount,
      'Amount Paid': o.amount_paid,
      'Amount Remaining': o.amount_remaining,
      'Days Overdue': this.getDaysOverdue(o.order_date)
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Outstanding Payments');
    XLSX.writeFile(wb, `outstanding-payments-${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  exportAllToExcel() {
    const wb = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = [
      ['Metric', 'Value'],
      ['Total Revenue', this.reportData.totalRevenue],
      ['Total Expenses', this.reportData.totalExpenses],
      ['Net Profit', this.reportData.netProfit],
      ['Total Orders', this.reportData.totalOrders],
      ['Pending Payments', this.reportData.pendingPayments],
      ['Completed Orders', this.reportData.completedOrders]
    ];
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

    // Product Performance
    const productWs = XLSX.utils.json_to_sheet(this.productStats.map(p => ({
      'Product Type': p.productType,
      'Quantity': p.quantity,
      'Revenue': p.revenue,
      'Market Share %': p.percentage.toFixed(2)
    })));
    XLSX.utils.book_append_sheet(wb, productWs, 'Products');

    // Top Customers
    const customerWs = XLSX.utils.json_to_sheet(this.topCustomers.map(c => ({
      'Customer': c.customer.name,
      'Orders': c.totalOrders,
      'Total Spent': c.totalSpent,
      'Pending': c.pendingAmount
    })));
    XLSX.utils.book_append_sheet(wb, customerWs, 'Customers');

    // Outstanding Payments
    const outstandingWs = XLSX.utils.json_to_sheet(this.outstandingOrders.map(o => ({
      'Order #': o.order_number,
      'Customer': o.customer?.name,
      'Date': this.formatDate(o.order_date),
      'Total': o.total_amount,
      'Paid': o.amount_paid,
      'Remaining': o.amount_remaining
    })));
    XLSX.utils.book_append_sheet(wb, outstandingWs, 'Outstanding');

    XLSX.writeFile(wb, `complete-report-${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  exportAllToPDF() {
    const doc = new jsPDF() as any; // Cast to any to access autoTable extension

    // Title
    doc.setFontSize(20);
    doc.text('Business Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Period: ${this.startDate} to ${this.endDate}`, 14, 28);

    // Summary
    doc.setFontSize(14);
    doc.text('Summary', 14, 40);
    doc.autoTable({
      startY: 45,
      head: [['Metric', 'Value']],
      body: [
        ['Total Revenue', `Rs. ${this.reportData.totalRevenue.toLocaleString()}`],
        ['Total Expenses', `Rs. ${this.reportData.totalExpenses.toLocaleString()}`],
        ['Net Profit', `Rs. ${this.reportData.netProfit.toLocaleString()}`],
        ['Total Orders', this.reportData.totalOrders.toString()],
        ['Pending Payments', `Rs. ${this.reportData.pendingPayments.toLocaleString()}`]
      ]
    });

    // Product Performance
    doc.addPage();
    doc.setFontSize(14);
    doc.text('Product Performance', 14, 20);
    doc.autoTable({
      startY: 25,
      head: [['Product', 'Quantity', 'Revenue', 'Share %']],
      body: this.productStats.map(p => [
        p.productType,
        p.quantity.toString(),
        `Rs. ${p.revenue.toLocaleString()}`,
        `${p.percentage.toFixed(1)}%`
      ])
    });

    doc.save(`business-report-${new Date().toISOString().split('T')[0]}.pdf`);
  }
}
