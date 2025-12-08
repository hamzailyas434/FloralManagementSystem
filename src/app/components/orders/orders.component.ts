import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { OrderWithDetails } from '../../models/database.types';
import DataTable from 'datatables.net-dt';
import 'datatables.net-buttons-dt';
import 'datatables.net-buttons/js/buttons.html5.mjs';
import 'datatables.net-buttons/js/buttons.print.mjs';
import 'datatables.net-responsive-dt';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="orders-container">
      <div class="header">
        <div>
          <h2>Orders Management</h2>
          <p>Manage and track all customer orders</p>
        </div>
        <div class="header-actions">
          <button class="btn-labels" (click)="printLabels()" [disabled]="selectedOrders.length === 0">
            🏷️ Print Labels ({{ selectedOrders.length }})
          </button>
          <button class="btn-export" (click)="exportToExcel()">
            📥 Export to Excel
          </button>
          <button class="btn-primary" (click)="createNewOrder()">
            + New Order
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="loading">Loading orders...</div>
      <div *ngIf="error" class="error">{{ error }}</div>

      <div *ngIf="!loading && !error" class="table-container">
        <table id="ordersTable" class="display" style="width:100%">
          <thead>
            <tr>
              <th>
                <input type="checkbox" (change)="toggleSelectAll($event)" [checked]="allSelected">
              </th>
              <th>Order #</th>
              <th>Order Type</th>
              <th>Customer</th>
              <th>Order Date</th>
              <th>Status</th>
              <th>Total Amount</th>
              <th>Payment Status</th>
              <th>Amount Remaining</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let order of orders">
              <td>
                <input type="checkbox" 
                  [checked]="isSelected(order.id)" 
                  (change)="toggleSelection(order.id)">
              </td>
              <td>
                <a class="order-link" (click)="viewOrder(order.id)" style="cursor: pointer; color: #3182ce; font-weight: 600;">
                  {{ order.order_number }}
                </a>
              </td>
              <td>
                <span class="order-type-badge" [ngClass]="order.order_type === 'Sale' ? 'type-sale' : 'type-customer'">
                  {{ order.order_type }}
                </span>
              </td>
              <td>{{ order.customer?.name || 'N/A' }}</td>
              <td>{{ formatDate(order.order_date) }}</td>
              <td>
                <span class="status-badge" [ngClass]="'status-' + order.order_status.toLowerCase().replace(' ', '-')">
                  {{ order.order_status }}
                </span>
              </td>
              <td>Rs. {{ order.total_amount.toFixed(2) }}</td>
              <td>
                <span class="payment-badge" [ngClass]="'payment-' + order.payment_status.toLowerCase().replace(' ', '-')">
                  {{ order.payment_status }}
                </span>
              </td>
              <td>Rs. {{ order.amount_remaining.toFixed(2) }}</td>
              <td class="actions-cell">
                <button class="btn-view" (click)="viewOrder(order.id)">View</button>
                <button class="btn-edit" (click)="editOrder(order.id)">Edit</button>
                <button class="btn-clone" (click)="cloneOrder(order.id)" title="Clone Order">📋</button>
                <button class="btn-delete" (click)="deleteOrder(order.id, order.order_number)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .orders-container {
      max-width: 1400px;
      margin: 0 auto;
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

    .btn-labels {
      background: #f97316;
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

    .btn-labels:hover:not(:disabled) {
      background: #ea580c;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
    }

    .btn-labels:disabled {
      background: #cbd5e0;
      cursor: not-allowed;
      opacity: 0.6;
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

    .btn-primary:hover {
      background: #2c5282;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(49, 130, 206, 0.4);
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

    .status-badge, .payment-badge, .order-type-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      display: inline-block;
    }

    .type-sale {
      background: #fef5e7;
      color: #d68910;
    }

    .type-customer {
      background: #e8f4fd;
      color: #2874a6;
    }

    .status-received {
      background: #bee3f8;
      color: #2c5282;
    }

    .status-in-progress {
      background: #feebc8;
      color: #c05621;
    }

    .status-in-embellishment-process {
      background: #fed7e2;
      color: #97266d;
    }

    .status-in-stitching-process {
      background: #fef5e7;
      color: #d68910;
    }

    .status-ready {
      background: #c6f6d5;
      color: #22543d;
    }

    .status-delivered {
      background: #e9d8fd;
      color: #553c9a;
    }

    .payment-full-payment {
      background: #c6f6d5;
      color: #22543d;
    }

    .payment-half-payment {
      background: #feebc8;
      color: #c05621;
    }

    .payment-remaining {
      background: #fed7d7;
      color: #c53030;
    }

    .btn-view {
      background: #3182ce;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 0.875rem;
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
      cursor: pointer;
      transition: all 0.2s;
      margin-left: 0.5rem;
    }

    .btn-edit:hover {
      background: #2f855a;
    }

    .btn-clone {
      background: #8b5cf6;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 1.125rem;
      cursor: pointer;
      transition: all 0.2s;
      margin-left: 0.5rem;
    }

    .btn-clone:hover {
      background: #7c3aed;
      transform: scale(1.1);
    }

    .btn-delete {
      background: #e53e3e;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 0.875rem;
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

    /* DataTables Styling */
    .top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .dt-buttons {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .dt-button {
      background: #3182ce !important;
      color: white !important;
      border: none !important;
      padding: 0.5rem 1rem !important;
      border-radius: 6px !important;
      font-size: 0.875rem !important;
      cursor: pointer !important;
      transition: all 0.2s !important;
    }

    .dt-button:hover {
      background: #2c5282 !important;
      transform: translateY(-1px);
    }

    .dataTables_filter {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .dataTables_filter label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      color: #2d3748;
    }

    .dataTables_filter input {
      padding: 0.5rem 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.9375rem;
      min-width: 250px;
    }

    .dataTables_filter input:focus {
      outline: none;
      border-color: #3182ce;
      box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
    }

    .dataTables_length {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .dataTables_length label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      color: #2d3748;
    }

    .dataTables_length select {
      padding: 0.5rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.9375rem;
      cursor: pointer;
    }

    .bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .dataTables_info {
      color: #718096;
      font-size: 0.875rem;
    }

    .dataTables_paginate {
      display: flex;
      gap: 0.25rem;
    }

    .paginate_button {
      padding: 0.5rem 0.75rem;
      border: 1px solid #e2e8f0;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      color: #2d3748;
    }

    .paginate_button:hover:not(.disabled) {
      background: #3182ce;
      color: white;
      border-color: #3182ce;
    }

    .paginate_button.current {
      background: #3182ce;
      color: white;
      border-color: #3182ce;
    }

    .paginate_button.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
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

      .btn-export,
      .btn-primary {
        width: 100%;
      }
    }

    @media (min-width: 769px) and (max-width: 1024px) {
      .orders-container {
        padding: 1.5rem;
      }

      .header-actions {
        gap: 0.5rem;
      }

      .btn-export,
      .btn-primary {
        padding: 0.625rem 1.25rem;
        font-size: 0.9375rem;
      }
    }
  `]
})
export class OrdersComponent implements OnInit, AfterViewInit, OnDestroy {
  orders: OrderWithDetails[] = [];
  loading = true;
  error: string | null = null;
  dataTable: any;
  selectedOrders: string[] = [];
  allSelected = false;

  constructor(
    private orderService: OrderService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadOrders();
  }

  ngAfterViewInit() {
    // DataTables will be initialized after data loads in loadOrders()
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

      this.dataTable = new DataTable('#ordersTable', {
        scrollX: true,
        pageLength: 10,
        lengthMenu: [10, 25, 50, 100],
        order: [[3, 'desc']], // Sort by Order Date (column 3) descending
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
            title: 'Orders_Export'
          },
          {
            extend: 'pdf',
            text: 'PDF',
            className: 'dt-button',
            title: 'Orders_Export'
          },
          {
            extend: 'print',
            text: 'Print',
            className: 'dt-button'
          }
        ],
        language: {
          search: 'Search orders:',
          lengthMenu: 'Show _MENU_ orders per page',
          info: 'Showing _START_ to _END_ of _TOTAL_ orders',
          infoEmpty: 'No orders found',
          infoFiltered: '(filtered from _MAX_ total orders)',
          zeroRecords: 'No matching orders found'
        }
      });
    }, 100); // Small delay to ensure DOM is ready
  }

  async loadOrders() {
    try {
      this.loading = true;
      this.error = null;
      this.orders = await this.orderService.getOrders();
      
      // Initialize DataTables after data is loaded
      setTimeout(() => {
        this.initializeDataTable();
      }, 0);
    } catch (err: any) {
      this.error = err.message || 'Failed to load orders';
    } finally {
      this.loading = false;
    }
  }

  viewOrder(id: string) {
    this.router.navigate(['/orders', id]);
  }

  createNewOrder() {
    this.router.navigate(['/orders', 'new']);
  }

  async cloneOrder(id: string) {
    const result = await Swal.fire({
      title: 'Clone Order?',
      text: 'This will create a new order with the same details. Continue?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Clone it',
      confirmButtonColor: '#8b5cf6'
    });

    if (result.isConfirmed) {
      this.router.navigate(['/orders/new'], { queryParams: { cloneId: id } });
    }
  }

  editOrder(id: string) {
    this.router.navigate(['/orders', id]);
  }

  exportToExcel() {
    if (this.dataTable) {
      // Trigger the Excel button from DataTables
      const buttons = this.dataTable.buttons();
      // Find and click the excel button (index 2: copy, csv, excel, pdf, print)
      buttons.trigger('excel');
    }
  }

  async deleteOrder(id: string, orderNumber: string) {
    const result = await Swal.fire({
      title: 'Delete Order?',
      text: `Are you sure you want to delete Order #${orderNumber}? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e53e3e',
      cancelButtonColor: '#718096',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await this.orderService.deleteOrder(id);
        
        Swal.fire({
          title: 'Deleted!',
          text: `Order #${orderNumber} has been deleted successfully.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });

        // Reload orders and refresh DataTable
        await this.loadOrders();
        if (this.dataTable) {
          this.dataTable.destroy();
        }
        setTimeout(() => this.initializeDataTable(), 100);
      } catch (err: any) {
        Swal.fire({
          title: 'Error',
          text: err.message || 'Failed to delete order',
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

  // Label Printing Methods
  toggleSelection(orderId: string) {
    const index = this.selectedOrders.indexOf(orderId);
    if (index > -1) {
      this.selectedOrders.splice(index, 1);
    } else {
      this.selectedOrders.push(orderId);
    }
    this.updateAllSelected();
  }

  isSelected(orderId: string): boolean {
    return this.selectedOrders.includes(orderId);
  }

  toggleSelectAll(event: any) {
    if (event.target.checked) {
      this.selectedOrders = this.orders.map(order => order.id);
      this.allSelected = true;
    } else {
      this.selectedOrders = [];
      this.allSelected = false;
    }
  }

  updateAllSelected() {
    this.allSelected = this.orders.length > 0 && this.selectedOrders.length === this.orders.length;
  }

  printLabels() {
    if (this.selectedOrders.length === 0) {
      Swal.fire({
        title: 'No Orders Selected',
        text: 'Please select at least one order to print labels',
        icon: 'warning'
      });
      return;
    }

    const selectedOrdersData = this.orders.filter(order => 
      this.selectedOrders.includes(order.id)
    );

    this.generateLabelsPDF(selectedOrdersData);
  }

  generateLabelsPDF(orders: OrderWithDetails[]) {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const labelHeight = 90; // Reduced height to allow for gaps
    const gap = 5; // Space between labels
    const margin = 5;

    orders.forEach((order, index) => {
      // Add new page only after every 3rd label (but not for the first one)
      if (index > 0 && index % 3 === 0) {
        pdf.addPage();
      }

      // Calculate Y position: 0, 1, or 2 position on the page
      const positionOnPage = index % 3;
      const yStart = margin + (positionOnPage * (labelHeight + gap));

      // Draw outer border with rounded corners effect (simulated)
      pdf.setLineWidth(0.5);
      pdf.setDrawColor(0);
      pdf.rect(margin, yStart, pageWidth - (margin * 2), labelHeight);

      // --- RECEIVER SECTION ---
      let y = yStart + 15;
      
      // Header
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DELIVER TO:', margin + 10, y);

      // Receiver Name (Large & Bold)
      y += 10;
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text((order.customer?.name || 'N/A').toUpperCase(), margin + 10, y);

      // Address
      y += 8;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      const address = order.customer?.address || 'N/A';
      const addressLines = pdf.splitTextToSize(address, pageWidth - 40); // More padding
      pdf.text(addressLines, margin + 10, y);
      
      // Calculate dynamic Y based on address length
      y += (addressLines.length * 6) + 5;

      // Contact
    pdf.setFont('helvetica', 'bold');
    pdf.text('Tel:', margin + 10, y);
    pdf.setFont('helvetica', 'normal');
    const phone = order.customer?.whatsapp_number || order.customer?.phone || 'N/A';
    pdf.text(phone, margin + 25, y);

    // --- SEPARATOR LINE ---
      // Draw a dashed line or light line to separate
      const separatorY = yStart + labelHeight - 35;
      pdf.setLineWidth(0.2);
      pdf.setDrawColor(150); // Gray line
      pdf.line(margin + 5, separatorY, pageWidth - (margin * 2) - 5, separatorY);

      // --- SENDER SECTION (Bottom) ---
      let senderY = separatorY + 10;
      
      pdf.setDrawColor(0); // Reset to black
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('FROM (SENDER):', margin + 10, senderY);
      
      // Sender Details (Inline-ish but structured)
      senderY += 7;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Floral Zone', margin + 10, senderY);
      
      pdf.setFont('helvetica', 'normal');
      pdf.text('Multan, Pakistan', margin + 45, senderY);
      
      // Contact with extra spacing as requested
      pdf.setFont('helvetica', 'bold');
      pdf.text('Contact:', margin + 100, senderY);
      pdf.setFont('helvetica', 'normal');
      pdf.text('03184177789', margin + 120, senderY);

      // Fixed TCS ID
      senderY += 7;
      pdf.setFont('helvetica', 'bold');
      pdf.text('TCS ID:', margin + 10, senderY);
      pdf.setFont('helvetica', 'normal');
      pdf.text('GM0004857', margin + 30, senderY);
    });

    // Save PDF
    pdf.save(`shipping-labels-${new Date().getTime()}.pdf`);

    Swal.fire({
      title: 'Labels Generated!',
      text: `${orders.length} shipping label(s) generated successfully`,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });

    // Clear selection
    this.selectedOrders = [];
    this.allSelected = false;
  }
}
