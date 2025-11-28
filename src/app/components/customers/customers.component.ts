import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../services/customer.service';
import { OrderService } from '../../services/order.service';
import { Customer, OrderWithDetails } from '../../models/database.types';
import DataTable from 'datatables.net-dt';
import 'datatables.net-buttons-dt';
import 'datatables.net-buttons/js/buttons.html5.mjs';
import 'datatables.net-buttons/js/buttons.print.mjs';
import 'datatables.net-responsive-dt';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="customers-container">
      <div class="header">
        <div>
          <h2>Customer Management</h2>
          <p>View and manage all customer records</p>
        </div>
      </div>

      <div *ngIf="loading" class="loading">Loading customers...</div>
      <div *ngIf="error" class="error">{{ error }}</div>

      <div class="customers-table" *ngIf="!loading && !error">
        <table id="customersTable" class="display" style="width:100%">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>City</th>
              <th>Country</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let customer of customers">
              <td>{{ customer.name }}</td>
              <td>{{ customer.phone || '-' }}</td>
              <td>{{ customer.email || '-' }}</td>
              <td>{{ customer.city || '-' }}</td>
              <td>{{ customer.country || '-' }}</td>
              <td class="actions-cell">
                <button class="btn-view" (click)="viewCustomer(customer)">View</button>
                <button class="btn-edit" (click)="editCustomer(customer.id)">Edit</button>
                <button class="btn-delete" (click)="deleteCustomer(customer.id, customer.name)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="customers.length === 0" class="empty-state">
          <p>No customers found</p>
        </div>
      </div>

      <div class="modal" *ngIf="selectedCustomer" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Customer Details</h3>
            <button class="btn-close" (click)="closeModal()">×</button>
          </div>

          <div class="customer-info">
            <div class="info-group">
              <label>Name</label>
              <p>{{ selectedCustomer.name }}</p>
            </div>

            <div class="info-group">
              <label>Phone</label>
              <p>{{ selectedCustomer.phone || '-' }}</p>
            </div>

            <div class="info-group">
              <label>Email</label>
              <p>{{ selectedCustomer.email || '-' }}</p>
            </div>

            <div class="info-group">
              <label>City</label>
              <p>{{ selectedCustomer.city || '-' }}</p>
            </div>

            <div class="info-group">
              <label>Country</label>
              <p>{{ selectedCustomer.country || '-' }}</p>
            </div>

            <div class="info-group full-width">
              <label>Address</label>
              <p>{{ selectedCustomer.address || '-' }}</p>
            </div>
          </div>

          <div class="orders-section">
            <h4>Order History</h4>
            <div *ngIf="loadingOrders" class="loading-small">Loading orders...</div>
            <div *ngIf="customerOrders.length === 0 && !loadingOrders" class="empty-orders">
              No orders found for this customer
            </div>
            <div class="orders-list" *ngIf="customerOrders.length > 0">
              <div class="order-item" *ngFor="let order of customerOrders">
                <div class="order-info">
                  <span class="order-number">Order #{{ order.order_number }}</span>
                  <span class="order-date">{{ formatDate(order.order_date) }}</span>
                </div>
                <div class="order-details">
                  <span class="status" [ngClass]="'status-' + order.order_status.toLowerCase().replace(' ', '-')">
                    {{ order.order_status }}
                  </span>
                  <span class="amount">Rs. {{ order.total_amount.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .customers-container {
      max-width: 1400px;
      margin: 0 auto;
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

    .search-bar {
      margin-bottom: 1.5rem;
    }

    .search-bar input {
      width: 100%;
      max-width: 500px;
      padding: 0.875rem 1.25rem;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      font-size: 1rem;
      transition: all 0.2s;
    }

    .search-bar input:focus {
      outline: none;
      border-color: #3182ce;
      box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
    }

    .loading, .error {
      text-align: center;
      padding: 3rem;
      font-size: 1.125rem;
    }

    .error {
      color: #e53e3e;
    }

    .customers-table {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      padding: 20px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead {
      background: #f7fafc;
    }

    th {
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #4a5568;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    td {
      padding: 1rem;
      border-top: 1px solid #e2e8f0;
      color: #2d3748;
    }

    tbody tr {
      transition: background 0.2s;
    }

    tbody tr:hover {
      background: #f7fafc;
    }

    .btn-view {
      background: #3182ce;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-view:hover {
      background: #2c5282;
    }

    .btn-edit {
      background: #38a169;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      margin-left: 0.5rem;
    }

    .btn-edit:hover {
      background: #2f855a;
    }

    .btn-delete {
      background: #e53e3e;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      margin-left: 0.5rem;
    }

    .btn-delete:hover {
      background: #c53030;
    }

    .actions-cell {
      white-space: nowrap;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #718096;
    }

    .modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal-content {
      background: white;
      border-radius: 16px;
      max-width: 700px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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
      line-height: 1;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .btn-close:hover {
      background: #f7fafc;
      color: #2d3748;
    }

    .customer-info {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
      padding: 1.5rem;
    }

    .info-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .info-group.full-width {
      grid-column: 1 / -1;
    }

    .info-group label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-group p {
      margin: 0;
      font-size: 1rem;
      color: #2d3748;
    }

    .orders-section {
      padding: 1.5rem;
      border-top: 1px solid #e2e8f0;
      background: #f7fafc;
    }

    .orders-section h4 {
      margin: 0 0 1rem;
      font-size: 1.125rem;
      color: #2d3748;
    }

    .loading-small {
      text-align: center;
      padding: 1rem;
      color: #718096;
    }

    .empty-orders {
      text-align: center;
      padding: 2rem;
      color: #718096;
    }

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .order-item {
      background: white;
      border-radius: 8px;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .order-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .order-number {
      font-weight: 600;
      color: #2d3748;
    }

    .order-date {
      font-size: 0.875rem;
      color: #718096;
    }

    .order-details {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .status {
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
      color: #38a169;
    }

    @media (max-width: 768px) {
      .customers-table {
        overflow-x: auto;
      }

      table {
        min-width: 600px;
      }

      .customer-info {
        grid-template-columns: 1fr;
      }

      .order-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
      }

      .modal-content {
        max-width: 95%;
        margin: 1rem;
      }
    }

    @media (min-width: 769px) and (max-width: 1024px) {
      .modal-content {
        max-width: 600px;
      }

      .customer-info {
        gap: 1rem;
      }
    }
  `]
})
export class CustomersComponent implements OnInit, AfterViewInit, OnDestroy {
  customers: Customer[] = [];
  selectedCustomer: Customer | null = null;
  customerOrders: OrderWithDetails[] = [];
  loading = true;
  loadingOrders = false;
  error: string | null = null;
  searchTerm = '';
  dataTable: any;

  constructor(
    private customerService: CustomerService,
    private orderService: OrderService
  ) {}

  async ngOnInit() {
    await this.loadCustomers();
  }

  ngAfterViewInit() {
    // DataTables will be initialized after data loads in loadCustomers()
  }


  ngOnDestroy() {
    if (this.dataTable) {
      this.dataTable.destroy();
    }
  }

  initializeDataTable() {
    setTimeout(() => {
      // Destroy existing instance if any
      if (this.dataTable) {
        this.dataTable.destroy();
      }

      this.dataTable = new DataTable('#customersTable', {
        scrollX: true,
        pageLength: 10,
        lengthMenu: [10, 25, 50, 100],
        order: [[0, 'asc']], // Sort by Name ascending
        dom: '<"top"Blf>rt<"bottom"ip><"clear">',
        buttons: [
          {
            extend: 'copy',
            text: 'Copy',
            className: 'dt-button'
          },
          {
            extend: 'csv',
            text: 'CSV',
            className: 'dt-button'
          },
          {
            extend: 'excel',
            text: 'Excel',
            className: 'dt-button',
            title: 'Customers_Export'
          },
          {
            extend: 'pdf',
            text: 'PDF',
            className: 'dt-button',
            title: 'Customers_Export'
          },
          {
            extend: 'print',
            text: 'Print',
            className: 'dt-button'
          }
        ],
        language: {
          search: 'Search customers:',
          lengthMenu: 'Show _MENU_ customers per page',
          info: 'Showing _START_ to _END_ of _TOTAL_ customers',
          infoEmpty: 'No customers found',
          infoFiltered: '(filtered from _MAX_ total customers)',
          zeroRecords: 'No matching customers found'
        }
      });
    }, 100); // Small delay to ensure DOM is ready
  }

  async loadCustomers() {
    try {
      this.loading = true;
      this.error = null;
      this.customers = await this.customerService.getCustomers();
      
      // Initialize DataTables after data is loaded
      setTimeout(() => {
        this.initializeDataTable();
      }, 0);
    } catch (err: any) {
      this.error = err.message || 'Failed to load customers';
    } finally {
      this.loading = false;
    }
  }

  async onSearch() {
    if (this.searchTerm.trim()) {
      try {
        this.loading = true;
        this.customers = await this.customerService.searchCustomers(this.searchTerm);
      } catch (err: any) {
        this.error = err.message || 'Failed to search customers';
      } finally {
        this.loading = false;
      }
    } else {
      await this.loadCustomers();
    }
  }

  async viewCustomer(customer: Customer) {
    this.selectedCustomer = customer;
    await this.loadCustomerOrders(customer.id);
  }

  async loadCustomerOrders(customerId: string) {
    try {
      this.loadingOrders = true;
      const allOrders = await this.orderService.getOrders();
      this.customerOrders = allOrders.filter(order => order.customer_id === customerId);
    } catch (err: any) {
      console.error('Failed to load customer orders:', err);
    } finally {
      this.loadingOrders = false;
    }
  }

  closeModal() {
    this.selectedCustomer = null;
    this.customerOrders = [];
  }

  editCustomer(id: string) {
    // For now, just show the view modal
    // In a full implementation, this would open an edit form
    const customer = this.customers.find(c => c.id === id);
    if (customer) {
      this.viewCustomer(customer);
    }
  }

  async deleteCustomer(id: string, customerName: string) {
    const result = await Swal.fire({
      title: 'Delete Customer?',
      html: `Are you sure you want to delete <strong>${customerName}</strong>?<br><br>
             <span style="color: #e53e3e; font-weight: 600;">⚠️ Warning: This will also delete all orders associated with this customer!</span><br><br>
             This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e53e3e',
      cancelButtonColor: '#718096',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await this.customerService.deleteCustomer(id);
        
        Swal.fire({
          title: 'Deleted!',
          text: `${customerName} has been deleted successfully.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });

        // Reload customers and refresh DataTable
        await this.loadCustomers();
        if (this.dataTable) {
          this.dataTable.destroy();
        }
        setTimeout(() => this.initializeDataTable(), 100);
      } catch (err: any) {
        Swal.fire({
          title: 'Error',
          text: err.message || 'Failed to delete customer',
          icon: 'error'
        });
      }
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
