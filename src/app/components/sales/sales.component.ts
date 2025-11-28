import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SalesService } from '../../services/sales.service';
import { CustomerService } from '../../services/customer.service';
import { OrderService } from '../../services/order.service';
import { SaleWithDetails, Customer, SkuItem } from '../../models/database.types';
import DataTable from 'datatables.net-dt';
import 'datatables.net-buttons-dt';
import 'datatables.net-buttons/js/buttons.html5.mjs';
import 'datatables.net-buttons/js/buttons.print.mjs';
import 'datatables.net-responsive-dt';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="sales-container">
      <div class="header">
        <div>
          <h2>Sales Management</h2>
          <p>Manage SKU codes and quantities</p>
        </div>
        <div class="header-actions">
          <button class="btn-export" (click)="exportToExcel()">
            📥 Export to Excel
          </button>
          <button class="btn-primary" (click)="openNewSaleModal()">
            + New Sale
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="loading">Loading sales...</div>
      <div *ngIf="error" class="error">{{ error }}</div>

      <div *ngIf="!loading && !error">
        <div class="table-container">
          <h3>Sales Inventory</h3>
          <table id="salesTable" class="display nowrap" style="width:100%">
            <thead>
              <tr>
                <th>Sale #</th>
                <th>Sales Name</th>
                <th>Sale Date</th>
                <th>Total Items</th>
                <th>SKU Count</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let sale of sales">
                <td>{{ sale.sale_number }}</td>
                <td>{{ sale.sales_name || '-' }}</td>
                <td>{{ formatDate(sale.sale_date) }}</td>
                <td>{{ calculateTotalQuantity(sale.sku_items) }}</td>
                <td>{{ sale.sku_items.length }}</td>
                <td>
                  <button class="btn-view" (click)="editSale(sale)">Edit</button>
                  <button class="btn-delete" (click)="deleteSale(sale.id)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="table-container" style="margin-top: 2rem;">
          <h3>SKU Purchase Tracking</h3>
          <p class="subtitle">View which customers purchased which SKUs</p>
          <button class="btn-secondary" (click)="loadSkuTracking()" style="margin-bottom: 1rem;">
            {{ loadingTracking ? 'Loading...' : 'Refresh Tracking' }}
          </button>
          <table id="skuTrackingTable" class="display nowrap" style="width:100%">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>SKU Code</th>
                <th>Quantity Sold</th>
                <th>Sale Name</th>
                <th>Order Date</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let track of skuTracking">
                <td>
                  <a class="order-link" (click)="viewOrder(track.order_id)" style="cursor: pointer;">
                    {{ track.order_number }}
                  </a>
                </td>
                <td>{{ track.customer_name }}</td>
                <td><strong>{{ track.sku_code }}</strong></td>
                <td>{{ track.quantity }}</td>
                <td>{{ track.sale_name }}</td>
                <td>{{ formatDate(track.order_date) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- New Sale Modal -->
      <div class="modal" [class.active]="showModal" (click)="closeModal($event)">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editMode ? 'Edit Sale' : 'Create New Sale' }}</h3>
            <button class="btn-close" (click)="closeModal($event)">&times;</button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label>Sale Number</label>
              <input type="text" [(ngModel)]="currentSale.sale_number" [disabled]="true" class="form-control">
            </div>

            <div class="form-group">
              <label>Sales Name</label>
              <input type="text" [(ngModel)]="currentSale.sales_name" class="form-control" placeholder="Enter sales name" required>
            </div>

            <div class="form-group">
              <label>Sale Date</label>
              <input type="date" [(ngModel)]="currentSale.sale_date" class="form-control">
            </div>

            <div class="form-group">
              <label>Number of SKU Items</label>
              <input
                type="number"
                [(ngModel)]="skuCount"
                (ngModelChange)="generateSkuRows()"
                min="1"
                class="form-control"
                placeholder="Enter number of SKU items">
            </div>

            <div *ngIf="currentSale.sku_items && currentSale.sku_items.length > 0" class="sku-items-section">
              <h4>SKU Items</h4>
              <div class="sku-grid">
                <div *ngFor="let item of currentSale.sku_items; let i = index" class="sku-row">
                  <div class="form-group">
                    <label>SKU Code #{{ i + 1 }}</label>
                    <input
                      type="text"
                      [(ngModel)]="item.sku_code"
                      class="form-control"
                      placeholder="Enter SKU code">
                  </div>
                  <div class="form-group">
                    <label>Quantity</label>
                    <input
                      type="number"
                      [(ngModel)]="item.quantity"
                      min="1"
                      class="form-control"
                      placeholder="Enter quantity">
                  </div>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Notes (Optional)</label>
              <textarea
                [(ngModel)]="currentSale.notes"
                rows="3"
                class="form-control"
                placeholder="Add any additional notes"></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" (click)="closeModal($event)">
              {{ editMode ? 'Close' : 'Cancel' }}
            </button>
            <button *ngIf="!editMode" class="btn-primary" (click)="saveSale()">Create Sale</button>
            <button *ngIf="editMode" class="btn-primary" (click)="updateSale()">Update Sale</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sales-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
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

    .subtitle {
      margin: 0.5rem 0 1rem;
      color: #718096;
      font-size: 0.875rem;
    }

    .header-actions {
      display: flex;
      gap: 0.75rem;
    }

    .btn-export {
      background: #10b981;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-export:hover {
      background: #059669;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    }

    .btn-primary {
      background: #3182ce;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2c5282;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(49, 130, 206, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #718096;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-secondary:hover {
      background: #4a5568;
    }

    .loading, .error {
      text-align: center;
      padding: 3rem;
      font-size: 1.125rem;
    }

    .error {
      color: #e53e3e;
    }

    .table-container {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .btn-view, .btn-delete {
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
      margin-right: 0.5rem;
    }

    .btn-view {
      background: #3182ce;
      color: white;
    }

    .btn-view:hover {
      background: #2c5282;
    }

    .btn-delete {
      background: #e53e3e;
      color: white;
    }

    .btn-delete:hover {
      background: #c53030;
    }

    .modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      overflow-y: auto;
    }

    .modal.active {
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 2rem 0;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 900px;
      margin: auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
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
      font-size: 1.5rem;
      color: #1a202c;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 2rem;
      color: #718096;
      cursor: pointer;
      padding: 0;
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;
    }

    .btn-close:hover {
      color: #1a202c;
    }

    .modal-body {
      padding: 1.5rem;
      max-height: 70vh;
      overflow-y: auto;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1.5rem;
      border-top: 1px solid #e2e8f0;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #1a202c;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #cbd5e0;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: #3182ce;
      box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
    }

    .form-control:disabled {
      background: #f7fafc;
      cursor: not-allowed;
    }

    .sku-items-section {
      margin-top: 2rem;
      padding: 1.5rem;
      background: #f7fafc;
      border-radius: 8px;
    }

    .sku-items-section h4 {
      margin: 0 0 1rem;
      color: #1a202c;
    }

    .sku-grid {
      display: grid;
      gap: 1rem;
    }

    .sku-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }

    .order-link {
      color: #3182ce;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
    }

    .order-link:hover {
      color: #2c5282;
      text-decoration: underline;
    }

    @media (max-width: 768px) {
      .sales-container {
        padding: 1rem;
      }

      .header {
        flex-direction: column;
        gap: 1rem;
      }

      .header-actions {
        width: 100%;
        flex-direction: column;
      }

      .header-actions button {
        width: 100%;
      }

      .modal-content {
        width: 95%;
        margin: 1rem auto;
      }

      .sku-row {
        grid-template-columns: 1fr;
      }
    }

    @media (min-width: 769px) and (max-width: 1024px) {
      .sales-container {
        padding: 1.5rem;
      }

      .header-actions {
        gap: 0.5rem;
      }

      .modal-content {
        max-width: 700px;
      }
    }
  `]
})
export class SalesComponent implements OnInit, AfterViewInit, OnDestroy {
  sales: SaleWithDetails[] = [];
  customers: Customer[] = [];
  loading = true;
  error: string | null = null;
  dataTable: any;
  skuTrackingTable: any;

  showModal = false;
  editMode = false;
  skuCount = 0;
  loadingTracking = false;
  skuTracking: any[] = [];
  currentSale: Partial<SaleWithDetails> = {
    sale_number: '',
    sales_name: '',
    sale_date: new Date().toISOString().split('T')[0],
    sku_items: [],
    total_items: 0
  };

  constructor(
    private salesService: SalesService,
    private customerService: CustomerService,
    private orderService: OrderService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadData();
    await this.loadSkuTracking();
  }

  ngAfterViewInit(): void {
    if (!this.loading && !this.error) {
      this.initializeDataTable();
      this.initializeSkuTrackingTable();
    }
  }

  ngOnDestroy(): void {
    if (this.dataTable) {
      this.dataTable.destroy();
    }
    if (this.skuTrackingTable) {
      this.skuTrackingTable.destroy();
    }
  }

  initializeDataTable() {
    setTimeout(() => {
      this.dataTable = new DataTable('#salesTable', {
        scrollX: true,
        pageLength: 10,
        lengthMenu: [10, 25, 50, 100],
        order: [[2, 'desc']],
        dom: 'Bfrtip',
        buttons: ['copy', 'csv', 'excel', 'pdf', 'print']
      });
    }, 0);
  }

  initializeSkuTrackingTable() {
    setTimeout(() => {
      this.skuTrackingTable = new DataTable('#skuTrackingTable', {
        scrollX: true,
        pageLength: 10,
        lengthMenu: [10, 25, 50, 100],
        order: [[5, 'desc']],
        dom: 'Bfrtip',
        buttons: ['copy', 'csv', 'excel', 'pdf', 'print']
      });
    }, 0);
  }

  async loadData() {
    try {
      this.loading = true;
      this.error = null;
      const [sales, customers] = await Promise.all([
        this.salesService.getSales(),
        this.customerService.getCustomers()
      ]);
      this.sales = sales;
      this.customers = customers;
    } catch (err: any) {
      this.error = err.message || 'Failed to load sales';
    } finally {
      this.loading = false;
    }
  }

  async loadSkuTracking() {
    try {
      this.loadingTracking = true;
      const saleOrders = await this.orderService.getSaleOrders();

      this.skuTracking = [];
      for (const order of saleOrders) {
        for (const item of order.order_items || []) {
          if (item.sku_code) {
            const sale = this.sales.find(s => s.id === item.sale_id);
            this.skuTracking.push({
              order_id: order.id,
              order_number: order.order_number,
              customer_name: order.customer?.name || 'N/A',
              sku_code: item.sku_code,
              quantity: item.quantity,
              sale_name: sale?.sales_name || 'Unknown',
              order_date: order.order_date
            });
          }
        }
      }

      if (this.skuTrackingTable) {
        this.skuTrackingTable.destroy();
      }
      setTimeout(() => this.initializeSkuTrackingTable(), 100);
    } catch (err: any) {
      console.error('Failed to load SKU tracking:', err);
    } finally {
      this.loadingTracking = false;
    }
  }

  async openNewSaleModal() {
    this.editMode = false;
    this.skuCount = 0;
    const saleNumber = await this.salesService.generateSaleNumber();
    this.currentSale = {
      sale_number: saleNumber,
      sales_name: '',
      sale_date: new Date().toISOString().split('T')[0],
      sku_items: [],
      total_items: 0
    };
    this.showModal = true;
  }

  generateSkuRows() {
    if (this.skuCount > 0 && this.skuCount <= 100) {
      this.currentSale.sku_items = Array(this.skuCount).fill(null).map(() => ({
        sku_code: '',
        quantity: 1
      }));
    } else if (this.skuCount > 100) {
      Swal.fire('Error', 'Maximum 100 SKU items allowed', 'error');
      this.skuCount = 100;
    }
  }

  async saveSale() {
    if (!this.currentSale.sales_name || !this.currentSale.sales_name.trim()) {
      Swal.fire('Error', 'Please enter a sales name', 'error');
      return;
    }

    if (!this.currentSale.sku_items || this.currentSale.sku_items.length === 0) {
      Swal.fire('Error', 'Please add at least one SKU item', 'error');
      return;
    }

    const emptySkus = this.currentSale.sku_items.filter(item => !item.sku_code || !item.quantity);
    if (emptySkus.length > 0) {
      Swal.fire('Error', 'Please fill in all SKU codes and quantities', 'error');
      return;
    }

    const totalItems = this.currentSale.sku_items.reduce((sum, item) => sum + (item.quantity || 0), 0);

    try {
      await this.salesService.createSale({
        sale_number: this.currentSale.sale_number,
        sales_name: this.currentSale.sales_name,
        sale_date: this.currentSale.sale_date,
        customer_id: this.currentSale.customer_id || undefined,
        sku_items: this.currentSale.sku_items,
        total_items: totalItems,
        notes: this.currentSale.notes
      });

      Swal.fire('Success', 'Sale created successfully', 'success');
      this.closeModal(new Event('close'));
      await this.loadData();
      if (this.dataTable) {
        this.dataTable.destroy();
      }
      this.initializeDataTable();
    } catch (err: any) {
      Swal.fire('Error', err.message || 'Failed to create sale', 'error');
    }
  }

  editSale(sale: SaleWithDetails) {
    this.editMode = true;
    this.skuCount = sale.sku_items.length;
    this.currentSale = { ...sale };
    this.showModal = true;
  }

  async updateSale() {
    if (!this.currentSale.sales_name || !this.currentSale.sales_name.trim()) {
      Swal.fire('Error', 'Please enter a sales name', 'error');
      return;
    }

    if (!this.currentSale.sku_items || this.currentSale.sku_items.length === 0) {
      Swal.fire('Error', 'Please add at least one SKU item', 'error');
      return;
    }

    const emptySkus = this.currentSale.sku_items.filter(item => !item.sku_code || !item.quantity);
    if (emptySkus.length > 0) {
      Swal.fire('Error', 'Please fill in all SKU codes and quantities', 'error');
      return;
    }

    const totalItems = this.currentSale.sku_items.reduce((sum, item) => sum + (item.quantity || 0), 0);

    try {
      await this.salesService.updateSale(this.currentSale.id!, {
        sales_name: this.currentSale.sales_name,
        sale_date: this.currentSale.sale_date,
        sku_items: this.currentSale.sku_items,
        total_items: totalItems,
        notes: this.currentSale.notes
      });

      Swal.fire('Success', 'Sale updated successfully', 'success');
      this.closeModal(new Event('close'));
      await this.loadData();
      if (this.dataTable) {
        this.dataTable.destroy();
      }
      this.initializeDataTable();
    } catch (err: any) {
      Swal.fire('Error', err.message || 'Failed to update sale', 'error');
    }
  }

  async deleteSale(id: string) {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e53e3e',
      cancelButtonColor: '#718096',
      confirmButtonText: 'Yes, delete it'
    });

    if (result.isConfirmed) {
      try {
        await this.salesService.deleteSale(id);
        Swal.fire('Deleted', 'Sale has been deleted', 'success');
        await this.loadData();
        if (this.dataTable) {
          this.dataTable.destroy();
        }
        this.initializeDataTable();
      } catch (err: any) {
        Swal.fire('Error', err.message || 'Failed to delete sale', 'error');
      }
    }
  }

  closeModal(event: Event) {
    event.preventDefault();
    this.showModal = false;
    this.editMode = false;
    this.skuCount = 0;
    this.currentSale = {
      sale_number: '',
      sales_name: '',
      sale_date: new Date().toISOString().split('T')[0],
      sku_items: [],
      total_items: 0
    };
  }

  calculateTotalQuantity(skuItems: SkuItem[]): number {
    return skuItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  viewOrder(orderId: string) {
    this.router.navigate(['/orders', orderId]);
  }

  exportToExcel() {
    if (this.dataTable) {
      // Trigger the Excel button from DataTables
      const buttons = this.dataTable.buttons();
      // Find and click the excel button (index 2: copy, csv, excel, pdf, print)
      buttons.trigger('excel');
    }
  }
}
