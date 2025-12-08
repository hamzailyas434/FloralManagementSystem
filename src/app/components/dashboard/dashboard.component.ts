import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { ExpenseService } from '../../services/expense.service';
import { CustomerService } from '../../services/customer.service';
import { BankService } from '../../services/bank.service';
import { SalesService } from '../../services/sales.service';
import { OrderWithDetails } from '../../models/database.types';
import { NgApexchartsModule, ChartComponent, ApexChart, ApexNonAxisChartSeries, ApexResponsive, ApexAxisChartSeries, ApexXAxis, ApexYAxis, ApexDataLabels, ApexLegend, ApexFill, ApexStroke, ApexPlotOptions, ApexTooltip, ApexGrid } from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  labels?: string[];
  colors?: string[];
  legend?: ApexLegend;
  responsive?: ApexResponsive[];
  xaxis?: ApexXAxis;
  yaxis?: ApexYAxis;
  dataLabels?: ApexDataLabels;
  fill?: ApexFill;
  stroke?: ApexStroke;
  plotOptions?: ApexPlotOptions;
  tooltip?: ApexTooltip;
  grid?: ApexGrid;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NgApexchartsModule, FormsModule],
  template: `
    <div class="dashboard-container">
      <div class="header">
        <h2>Dashboard</h2>
        <p>Overview of your business metrics</p>
      </div>

      <div *ngIf="loading" class="loading">Loading dashboard...</div>
      <div *ngIf="error" class="error">{{ error }}</div>

      <div *ngIf="!loading && !error">
        <!-- Summary Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon revenue">💰</div>
            <div class="stat-details">
              <h3>Total Revenue</h3>
              <p class="stat-value">Rs. {{ totalRevenue.toFixed(2) }}</p>
              <span class="stat-label">From {{ orders.length }} orders</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon pending">⏳</div>
            <div class="stat-details">
              <h3>Pending Amount</h3>
              <p class="stat-value">Rs. {{ pendingAmount.toFixed(2) }}</p>
              <span class="stat-label">Outstanding payments</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon expenses">💸</div>
            <div class="stat-details">
              <h3>Total Expenses</h3>
              <p class="stat-value">Rs. {{ totalExpenses.toFixed(2) }}</p>
              <span class="stat-label">Business costs</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon profit">📈</div>
            <div class="stat-details">
              <h3>Net Profit</h3>
              <p class="stat-value" [class.negative]="netProfit < 0">
                Rs. {{ netProfit.toFixed(2) }}
              </p>
              <span class="stat-label">Revenue - Expenses</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon customers">👥</div>
            <div class="stat-details">
              <h3>Total Customers</h3>
              <p class="stat-value">{{ totalCustomers }}</p>
              <span class="stat-label">Active customers</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon orders">📦</div>
            <div class="stat-details">
              <h3>Active Orders</h3>
              <p class="stat-value">{{ activeOrders }}</p>
              <span class="stat-label">In progress orders</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon customer-orders">🛒</div>
            <div class="stat-details">
              <h3>Customer Orders</h3>
              <p class="stat-value">{{ customerOrdersCount }}</p>
              <span class="stat-label">Regular orders</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon sale-orders">🏷️</div>
            <div class="stat-details">
              <h3>Sale Orders</h3>
              <p class="stat-value">{{ saleOrdersCount }}</p>
              <span class="stat-label">SKU sales</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon bank">🏦</div>
            <div class="stat-details">
              <div class="card-header-flex">
                <h3>Bank Balance</h3>
                <button class="btn-icon-small" (click)="openTransactionModal()" title="Manage Balance">⚙️</button>
              </div>
              <p class="stat-value">Rs. {{ bankBalance.toLocaleString() }}</p>
              <span class="stat-label">Current cash</span>
            </div>
          </div>

          <!-- Transaction Modal -->
          <div class="modal modal-overlay" [class.active]="showTransactionModal" (click)="closeTransactionModal($event)">
            <div class="modal-content" (click)="$event.stopPropagation()">
              <div class="modal-header">
                <h3>Manage Bank Balance</h3>
                <button class="btn-close" (click)="closeTransactionModal()" type="button">&times;</button>
              </div>
              <div class="modal-body">
                <div class="current-balance-display">
                  <label>Current Balance</label>
                  <div class="balance-large">Rs. {{ bankBalance.toLocaleString() }}</div>
                </div>

                <div class="transaction-tabs">
                  <button [class.active]="transactionType === 'deposit'" (click)="transactionType = 'deposit'">Deposit</button>
                  <button [class.active]="transactionType === 'withdrawal'" (click)="transactionType = 'withdrawal'">Withdraw</button>
                </div>

                <div class="form-group">
                  <label>Amount (Rs.)</label>
                  <input type="number" [(ngModel)]="transactionAmount" class="form-control" placeholder="Enter amount" min="0">
                </div>

                <div class="form-group">
                  <label>Description</label>
                  <input type="text" [(ngModel)]="transactionDescription" class="form-control" placeholder="e.g. Initial Deposit, Petty Cash">
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn-secondary" (click)="closeTransactionModal()">Cancel</button>
                <button class="btn-primary" (click)="processTransaction()" [disabled]="!transactionAmount || transactionAmount <= 0">
                  {{ transactionType === 'deposit' ? 'Add Funds' : 'Withdraw Funds' }}
                </button>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon stock">📊</div>
            <div class="stat-details">
              <h3>Stock Value</h3>
              <p class="stat-value">Rs. {{ totalStockValue.toLocaleString() }}</p>
              <span class="stat-label">Inventory worth</span>
            </div>
          </div>
        </div>

        <!-- Charts -->
        <div class="charts-grid">
          <div class="chart-card">
            <h3>Order Type Distribution</h3>
            <apx-chart
              *ngIf="orderTypeChartOptions"
              [series]="orderTypeChartOptions.series!"
              [chart]="orderTypeChartOptions.chart!"
              [labels]="orderTypeChartOptions.labels!"
              [colors]="orderTypeChartOptions.colors!"
              [legend]="orderTypeChartOptions.legend!"
              [responsive]="orderTypeChartOptions.responsive!"
            ></apx-chart>
          </div>

          <div class="chart-card">
            <h3>Order Status Distribution</h3>
            <apx-chart
              *ngIf="orderStatusChartOptions"
              [series]="orderStatusChartOptions.series!"
              [chart]="orderStatusChartOptions.chart!"
              [labels]="orderStatusChartOptions.labels!"
              [colors]="orderStatusChartOptions.colors!"
              [legend]="orderStatusChartOptions.legend!"
              [responsive]="orderStatusChartOptions.responsive!"
            ></apx-chart>
          </div>

          <div class="chart-card">
            <h3>Payment Status</h3>
            <apx-chart
              *ngIf="paymentStatusChartOptions"
              [series]="paymentStatusChartOptions.series!"
              [chart]="paymentStatusChartOptions.chart!"
              [labels]="paymentStatusChartOptions.labels!"
              [colors]="paymentStatusChartOptions.colors!"
              [legend]="paymentStatusChartOptions.legend!"
              [responsive]="paymentStatusChartOptions.responsive!"
            ></apx-chart>
          </div>

          <div class="chart-card full-width">
            <h3>Revenue vs Expenses</h3>
            <apx-chart
              *ngIf="revenueExpensesChartOptions"
              [series]="revenueExpensesChartOptions.series!"
              [chart]="revenueExpensesChartOptions.chart!"
              [xaxis]="revenueExpensesChartOptions.xaxis!"
              [yaxis]="revenueExpensesChartOptions.yaxis!"
              [colors]="revenueExpensesChartOptions.colors!"
              [dataLabels]="revenueExpensesChartOptions.dataLabels!"
              [plotOptions]="revenueExpensesChartOptions.plotOptions!"
              [tooltip]="revenueExpensesChartOptions.tooltip!"
              [grid]="revenueExpensesChartOptions.grid!"
            ></apx-chart>
          </div>

          <div class="chart-card full-width">
            <h3>Monthly Orders Trend</h3>
            <apx-chart
              *ngIf="monthlyOrdersChartOptions"
              [series]="monthlyOrdersChartOptions.series!"
              [chart]="monthlyOrdersChartOptions.chart!"
              [xaxis]="monthlyOrdersChartOptions.xaxis!"
              [yaxis]="monthlyOrdersChartOptions.yaxis!"
              [colors]="monthlyOrdersChartOptions.colors!"
              [dataLabels]="monthlyOrdersChartOptions.dataLabels!"
              [stroke]="monthlyOrdersChartOptions.stroke!"
              [fill]="monthlyOrdersChartOptions.fill!"
              [tooltip]="monthlyOrdersChartOptions.tooltip!"
              [grid]="monthlyOrdersChartOptions.grid!"
            ></apx-chart>
          </div>
        </div>

        <!-- Recent Orders -->
        <div class="recent-orders">
          <div class="section-header">
            <h3>Recent Orders</h3>
            <button class="btn-link" (click)="goToOrders()">View All →</button>
          </div>
          <div class="orders-list">
            <div *ngFor="let order of recentOrders" class="order-item">
              <div class="order-info">
                <strong>Order #{{ order.order_number }}</strong>
                <span>{{ order.customer?.name || 'N/A' }}</span>
              </div>
              <div class="order-meta">
                <span class="status-badge" [ngClass]="'status-' + order.order_status.toLowerCase().replace(' ', '-')">
                  {{ order.order_status }}
                </span>
                <span class="amount">Rs. {{ order.total_amount.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .header {
      margin-bottom: 2rem;
    }

    .header h2 {
      margin: 0 0 0.5rem;
      font-size: 2rem;
      color: #1a202c;
    }

    .header p {
      margin: 0;
      color: #718096;
    }

    .loading, .error {
      text-align: center;
      padding: 3rem;
      font-size: 1.125rem;
    }

    .error {
      color: #e53e3e;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      display: flex;
      gap: 1rem;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
    }

    .stat-icon.revenue {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }

    .stat-icon.pending {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }

    .stat-icon.expenses {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    }

    .stat-icon.profit {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    }

    .stat-icon.customers {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    }

    .stat-icon.orders {
      background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
    }

    .stat-icon.customer-orders {
      background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
    }

    .stat-icon.sale-orders {
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    }

    .stat-icon.bank {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }

    .stat-icon.stock {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    }

    .stat-details {
      flex: 1;
    }

    .stat-details h3 {
      margin: 0 0 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-value {
      margin: 0 0 0.25rem;
      font-size: 1.75rem;
      font-weight: 700;
      color: #1a202c;
    }

    .stat-value.negative {
      color: #e53e3e;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #a0aec0;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .chart-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .chart-card.full-width {
      grid-column: 1 / -1;
    }

    .chart-card h3 {
      margin: 0 0 1rem;
      font-size: 1.125rem;
      font-weight: 600;
      color: #1a202c;
    }

    .recent-orders {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .section-header h3 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #1a202c;
    }

    .btn-link {
      background: none;
      border: none;
      color: #3182ce;
      font-weight: 600;
      cursor: pointer;
      transition: color 0.2s;
    }

    .btn-link:hover {
      color: #2c5282;
    }

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .order-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #f7fafc;
      border-radius: 8px;
      transition: background 0.2s;
    }

    .order-item:hover {
      background: #edf2f7;
    }

    .order-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .order-info strong {
      color: #1a202c;
    }

    .order-info span {
      font-size: 0.875rem;
      color: #718096;
    }

    .order-meta {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-received {
      background: #bee3f8;
      color: #2c5282;
    }

    .status-in-progress {
      background: #feebc8;
      color: #c05621;
    }

    .status-ready {
      background: #c6f6d5;
      color: #22543d;
    }

    .status-delivered {
      background: #e9d8fd;
      color: #553c9a;
    }

    .amount {
      font-weight: 600;
      color: #22543d;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .charts-grid {
        grid-template-columns: 1fr;
      }

      .order-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }
      }

      .card-header-flex {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.5rem;
      }

      .btn-icon-small {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.2rem;
        padding: 0;
        opacity: 0.7;
        transition: opacity 0.2s;
      }

      .btn-icon-small:hover {
        opacity: 1;
      }

      /* Modal Styles */
      .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        align-items: center;
        justify-content: center;
      }

      .modal.active {
        display: flex;
      }

      .modal-content {
        background: white;
        border-radius: 12px;
        width: 90%;
        max-width: 500px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        overflow: hidden;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid #e2e8f0;
      }

      .modal-header h3 {
        margin: 0;
        font-size: 1.25rem;
        color: #1a202c;
      }

      .btn-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #718096;
      }

      .modal-body {
        padding: 1.5rem;
      }

      .modal-footer {
        padding: 1.5rem;
        border-top: 1px solid #e2e8f0;
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
      }

      .current-balance-display {
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        border-radius: 8px;
        padding: 1rem;
        text-align: center;
        margin-bottom: 1.5rem;
      }

      .current-balance-display label {
        display: block;
        font-size: 0.875rem;
        color: #166534;
        margin-bottom: 0.5rem;
      }

      .balance-large {
        font-size: 1.5rem;
        font-weight: 700;
        color: #15803d;
      }

      .transaction-tabs {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
        background: #f1f5f9;
        padding: 0.25rem;
        border-radius: 8px;
      }

      .transaction-tabs button {
        flex: 1;
        padding: 0.75rem;
        border: none;
        background: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        color: #64748b;
        transition: all 0.2s;
      }

      .transaction-tabs button.active {
        background: white;
        color: #0f172a;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }

      .form-group {
        margin-bottom: 1rem;
      }

      .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #475569;
      }

      .form-control {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #cbd5e0;
        border-radius: 8px;
        font-size: 1rem;
      }

      .btn-primary {
        background: #3b82f6;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
      }

      .btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .btn-secondary {
        background: white;
        border: 1px solid #cbd5e0;
        color: #475569;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
      }


    @media (min-width: 769px) and (max-width: 1024px) {
      .dashboard-container {
        padding: 1.5rem;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1.25rem;
      }

      .charts-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .chart-card.full-width {
        grid-column: 1 / -1;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  orders: OrderWithDetails[] = [];
  totalExpenses = 0;
  totalCustomers = 0;
  loading = true;
  error: string | null = null;

  totalRevenue = 0;
  pendingAmount = 0;
  netProfit = 0;
  activeOrders = 0;
  customerOrdersCount = 0;
  saleOrdersCount = 0;
  bankBalance = 0;
  totalStockValue = 0;
  recentOrders: OrderWithDetails[] = [];

  // Transaction Modal
  showTransactionModal = false;
  transactionType: 'deposit' | 'withdrawal' = 'deposit';
  transactionAmount: number = 0;
  transactionDescription: string = '';

  // Chart options
  public orderTypeChartOptions!: Partial<ChartOptions>;
  public orderStatusChartOptions!: Partial<ChartOptions>;
  public paymentStatusChartOptions!: Partial<ChartOptions>;
  public revenueExpensesChartOptions!: Partial<ChartOptions>;
  public monthlyOrdersChartOptions!: Partial<ChartOptions>;

  constructor(
    private orderService: OrderService,
    private expenseService: ExpenseService,
    private customerService: CustomerService,
    private bankService: BankService,
    private salesService: SalesService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadDashboardData();
    if (!this.loading && !this.error) {
      this.initializeCharts();
    }
  }

  async loadDashboardData() {
    try {
      this.loading = true;
      this.error = null;

      const [orders, expenses, customers, sales] = await Promise.all([
        this.orderService.getOrders(),
        this.expenseService.getExpenses(),
        this.customerService.getCustomers(),
        this.salesService.getSales()
      ]);

      this.orders = orders;
      this.totalCustomers = customers.length;
      this.totalExpenses = expenses.reduce((sum, exp) => sum + (exp.cost || 0), 0);

      this.totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      this.pendingAmount = orders.reduce((sum, order) => sum + (order.amount_remaining || 0), 0);
      this.netProfit = this.totalRevenue - this.totalExpenses;
      this.activeOrders = orders.filter(o => o.order_status !== 'Delivered').length;
      this.customerOrdersCount = orders.filter(o => o.order_type === 'Customer Order').length;
      this.saleOrdersCount = orders.filter(o => o.order_type === 'Sale').length;
      this.recentOrders = orders.slice(0, 5);

      // Load financial data
      this.bankBalance = await this.bankService.getCurrentBalance();
      this.totalStockValue = sales.reduce((sum, sale) => sum + (sale.total_stock_value || 0), 0);

    } catch (err: any) {
      this.error = err.message || 'Failed to load dashboard data';
    } finally {
      this.loading = false;
    }
  }

  initializeCharts() {
    this.initOrderTypeChart();
    this.initOrderStatusChart();
    this.initPaymentStatusChart();
    this.initRevenueExpensesChart();
    this.initMonthlyOrdersChart();
  }

  initOrderTypeChart() {
    this.orderTypeChartOptions = {
      series: [this.customerOrdersCount, this.saleOrdersCount],
      chart: {
        type: 'donut',
        height: 300,
        fontFamily: 'Inter, sans-serif'
      },
      labels: ['Customer Orders', 'Sale Orders'],
      colors: ['#3B82F6', '#F59E0B'],
      legend: {
        position: 'bottom',
        fontSize: '14px'
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: { height: 250 },
          legend: { position: 'bottom', fontSize: '12px' }
        }
      }, {
        breakpoint: 1024,
        options: {
          chart: { height: 280 },
          legend: { fontSize: '13px' }
        }
      }]
    };
  }

  initOrderStatusChart() {
    const statusCounts = this.orders.reduce((acc, order) => {
      acc[order.order_status] = (acc[order.order_status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    this.orderStatusChartOptions = {
      series: Object.values(statusCounts),
      chart: {
        type: 'donut',
        height: 300,
        fontFamily: 'Inter, sans-serif'
      },
      labels: Object.keys(statusCounts),
      colors: ['#3B82F6', '#F59E0B', '#10B981', '#8B5CF6'],
      legend: {
        position: 'bottom',
        fontSize: '14px'
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: { height: 250 }
        }
      }, {
        breakpoint: 1024,
        options: {
          chart: { height: 280 }
        }
      }]
    };
  }

  initPaymentStatusChart() {
    const paymentCounts = this.orders.reduce((acc, order) => {
      acc[order.payment_status] = (acc[order.payment_status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    this.paymentStatusChartOptions = {
      series: Object.values(paymentCounts),
      chart: {
        type: 'pie',
        height: 300,
        fontFamily: 'Inter, sans-serif'
      },
      labels: Object.keys(paymentCounts),
      colors: ['#10B981', '#F59E0B', '#EF4444'],
      legend: {
        position: 'bottom',
        fontSize: '14px'
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: { height: 250 }
        }
      }, {
        breakpoint: 1024,
        options: {
          chart: { height: 280 }
        }
      }]
    };
  }

  initRevenueExpensesChart() {
    this.revenueExpensesChartOptions = {
      series: [{
        name: 'Amount (Rs.)',
        data: [this.totalRevenue, this.totalExpenses, this.netProfit]
      }],
      chart: {
        type: 'bar',
        height: 350,
        fontFamily: 'Inter, sans-serif',
        toolbar: {
          show: true
        }
      },
      plotOptions: {
        bar: {
          borderRadius: 8,
          columnWidth: '50%',
          distributed: true
        }
      },
      colors: ['#10B981', '#EF4444', '#3B82F6'],
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: ['Revenue', 'Expenses', 'Profit'],
        labels: {
          style: {
            fontSize: '12px'
          }
        }
      },
      yaxis: {
        labels: {
          formatter: (value) => `Rs. ${value.toFixed(0)}`
        }
      },
      tooltip: {
        y: {
          formatter: (value) => `Rs. ${value.toFixed(2)}`
        }
      },
      grid: {
        borderColor: '#f1f1f1'
      }
    };
  }

  initMonthlyOrdersChart() {
    const monthlyData = this.orders.reduce((acc, order) => {
      const month = new Date(order.order_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedMonths = Object.entries(monthlyData).sort((a, b) =>
      new Date(a[0]).getTime() - new Date(b[0]).getTime()
    );

    this.monthlyOrdersChartOptions = {
      series: [{
        name: 'Orders',
        data: sortedMonths.map(m => m[1])
      }],
      chart: {
        type: 'area',
        height: 350,
        fontFamily: 'Inter, sans-serif',
        toolbar: {
          show: true
        }
      },
      colors: ['#3B82F6'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        width: 3
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.3,
          stops: [0, 90, 100]
        }
      },
      xaxis: {
        categories: sortedMonths.map(m => m[0]),
        labels: {
          style: {
            fontSize: '12px'
          }
        }
      },
      yaxis: {
        labels: {
          formatter: (value) => value.toFixed(0)
        }
      },
      tooltip: {
        y: {
          formatter: (value) => `${value} orders`
        }
      },
      grid: {
        borderColor: '#f1f1f1'
      }
    };
  }

  openTransactionModal() {
    this.showTransactionModal = true;
    this.transactionType = 'deposit';
    this.transactionAmount = 0;
    this.transactionDescription = '';
  }

  closeTransactionModal(event?: Event) {
    if (event && event.target) {
      const target = event.target as HTMLElement;
      if (!target.classList.contains('modal-overlay')) {
        return;
      }
    }
    this.showTransactionModal = false;
  }

  async processTransaction() {
    if (!this.transactionAmount || this.transactionAmount <= 0) {
      return;
    }

    try {
      this.loading = true;
      await this.bankService.updateBalance(
        this.transactionAmount,
        this.transactionType,
        this.transactionDescription || (this.transactionType === 'deposit' ? 'Manual Deposit' : 'Manual Withdrawal')
      );
      
      // Refresh balance
      this.bankBalance = await this.bankService.getCurrentBalance();
      
      // Close modal
      this.closeTransactionModal();
      
      // Show success (optional, or just refresh)
      // Swal.fire('Success', 'Transaction processed', 'success');
      
    } catch (err: any) {
      console.error('Transaction failed:', err);
      // Swal.fire('Error', 'Transaction failed', 'error');
    } finally {
      this.loading = false;
    }
  }

  goToOrders() {
    this.router.navigate(['/orders']);
  }
}
