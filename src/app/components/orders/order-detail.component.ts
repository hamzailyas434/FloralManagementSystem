import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { CustomerService } from '../../services/customer.service';
import { SalesService } from '../../services/sales.service';
import { WhatsAppService } from '../../services/whatsapp.service';
import { Order, OrderItem, Customer, DeliveryCost, OrderWithDetails, SaleWithDetails, SkuItem } from '../../models/database.types';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="order-detail-container">
      <div class="header">
        <button class="btn-back" (click)="goBack()">← Back</button>
        <h2>{{ isNew ? 'New Order' : 'Order #' + order.order_number }}</h2>
        <div class="actions">
          <button class="btn-invoice" (click)="viewInvoice()" *ngIf="!isNew">
            📄 Invoice
          </button>
          <button class="btn-export" (click)="exportToExcel()" *ngIf="!isNew">
            📥 Export Excel
          </button>
          <button class="btn-save" (click)="saveOrder()" [disabled]="saving">
            {{ saving ? 'Saving...' : 'Save Order' }}
          </button>
          <button class="btn-delete" (click)="deleteOrder()" *ngIf="!isNew">
            Delete
          </button>
        </div>
      </div>

      <div *ngIf="error" class="error">{{ error }}</div>

      <div class="form-container">
        <section class="form-section">
          <h3>Order Type</h3>
          <div class="form-grid">
            <div class="form-group full-width">
              <label>Select Order Type *</label>
              <select [(ngModel)]="order.order_type" (change)="onOrderTypeChange()">
                <option value="Customer Order">Customer Order</option>
                <option value="Sale">Sale</option>
              </select>
            </div>
          </div>
        </section>

        <section class="form-section">
          <h3>Customer Details</h3>
          <div class="form-grid">
            <div class="form-group full-width">
              <label>Select Existing Customer</label>
              <select [(ngModel)]="selectedCustomerId" (change)="onCustomerSelect()">
                <option value="">-- New Customer --</option>
                <option *ngFor="let c of customers" [value]="c.id">{{ c.name }} ({{ c.phone }})</option>
              </select>
            </div>

            <div class="form-group">
              <label>Customer Name *</label>
              <input type="text" [(ngModel)]="customerData.name" required>
            </div>

            <div class="form-group">
              <label>Phone</label>
              <input type="tel" [(ngModel)]="customerData.phone">
            </div>

            <div class="form-group">
              <label>Email</label>
              <input type="email" [(ngModel)]="customerData.email">
            </div>

            <div class="form-group">
              <label>City</label>
              <input type="text" [(ngModel)]="customerData.city">
            </div>

            <div class="form-group">
              <label>Country</label>
              <input type="text" [(ngModel)]="customerData.country">
            </div>

            <div class="form-group full-width">
              <label>Address</label>
              <textarea [(ngModel)]="customerData.address" rows="2"></textarea>
            </div>
          </div>
        </section>

        <section class="form-section">
          <div class="section-header">
            <h3>Order Items</h3>
            <button class="btn-add" (click)="addItem()">+ Add Item</button>
          </div>

          <div class="items-list">
            <div class="item-card" *ngFor="let item of orderItems; let i = index">
              <div class="item-header">
                <h4>Item {{ i + 1 }}</h4>
                <button class="btn-remove" (click)="removeItem(i)">×</button>
              </div>

              <div class="form-grid">
                <!-- Sale Selector - Only for Sale type orders -->
                <div class="form-group full-width" *ngIf="order.order_type === 'Sale'">
                  <label>Select Sale *</label>
                  <select [(ngModel)]="item.sale_id" (change)="onSaleSelect(item)" required>
                    <option value="">-- Select Sale First --</option>
                    <option *ngFor="let sale of sales" [value]="sale.id">
                      {{ sale.sales_name }} ({{ sale.sale_date | date:'dd MMM yyyy' }})
                    </option>
                  </select>
                </div>

                <!-- SKU Selector - Only shows SKUs from selected sale -->
                <div class="form-group full-width" *ngIf="order.order_type === 'Sale' && item.sale_id">
                  <label>Select SKU *</label>
                  <select [(ngModel)]="item.sku_code" (change)="onSkuSelect(item)" required>
                    <option value="">Select SKU</option>
                    <option *ngFor="let sku of getSkusForSale(item.sale_id)" [value]="sku.sku_code">
                      {{ sku.sku_code }} - Available: {{ sku.quantity }}
                    </option>
                  </select>
                </div>

                <div class="info-box" *ngIf="order.order_type === 'Sale' && item.sku_code && item.sale_id">
                  <strong>Sale Info:</strong> {{ getSaleName(item.sale_id) }}
                </div>

                <!-- Product Type - For ALL order types -->
                <div class="form-group">
                  <label>Product Type *</label>
                  <select [(ngModel)]="item.product_type" required>
                    <option value="">Select Type</option>
                    <option value="Dress">Dress</option>
                    <option value="Dupatta">Dupatta</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    [(ngModel)]="item.quantity"
                    [max]="getMaxQuantity(item)"
                    min="1"
                    (input)="onQuantityChange(item)"
                    required>
                  <small *ngIf="order.order_type === 'Sale' && item.sku_code">Max: {{ getMaxQuantity(item) }}</small>
                </div>

                <div class="form-group">
                  <label>Price per Unit *</label>
                  <input type="number" [(ngModel)]="item.price" min="0" (input)="calculateTotalAmount()" required>
                </div>

                <div class="form-group">
                  <label>Item Total</label>
                  <input type="number" [value]="getItemTotal(item)" readonly>
                </div>

                <div class="form-group full-width">
                  <label>Fabric Details</label>
                  <div class="fabric-container">
                    <select [(ngModel)]="item.fabric_details">
                      <option value="">Select Fabric</option>
                      <option value="Pure Tasal Silk">Pure Tasal Silk</option>
                      <option value="Pure Shisha Silk">Pure Shisha Silk</option>
                      <option value="80 Gram Raw Silk">80 Gram Raw Silk</option>
                    </select>
                  </div>
                </div>

                <div class="form-group full-width" *ngIf="order.order_type === 'Customer Order'">
                  <div class="dye-colors-header">
                    <label>Dye Colors</label>
                    <button type="button" class="btn-add-color" (click)="addDyeColor(item)">
                      + Add Color
                    </button>
                  </div>
                  <div class="dye-colors-list" *ngIf="getDyeColorArray(item).length > 0">
                    <div class="dye-color-item" *ngFor="let color of getDyeColorArray(item); let colorIndex = index; trackBy: trackByIndex">
                      <input
                        type="text"
                        [value]="getDyeColorArray(item)[colorIndex]"
                        (input)="updateDyeColorValue(item, colorIndex, $event)"
                        placeholder="Enter color (e.g., Red, Blue, #FF0000)"
                        class="color-input"
                      >
                      <button type="button" class="btn-remove-color" (click)="removeDyeColor(item, colorIndex)">
                        ×
                      </button>
                    </div>
                  </div>
                  <p class="no-colors" *ngIf="getDyeColorArray(item).length === 0">
                    No dye colors added. Click "+ Add Color" to add.
                  </p>
                </div>
              </div>
            </div>

            <div *ngIf="orderItems.length === 0" class="empty-items">
              <p>No items added yet</p>
              <button class="btn-secondary" (click)="addItem()">Add First Item</button>
            </div>
          </div>
        </section>

        <section class="form-section">
          <h3>Order Status & Payment</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Order Date *</label>
              <input type="date" [(ngModel)]="order.order_date" required>
            </div>

            <div class="form-group">
              <label>Order Status *</label>
              <select [(ngModel)]="order.order_status" (change)="onOrderStatusChange()" required>
                <option value="Received">Received</option>
                <option value="In Progress">In Progress</option>
                <option value="In Embellishment Process">In Embellishment Process</option>
                <option value="In Stitching Process">In Stitching Process</option>
                <option value="Ready">Ready</option>
                <option value="Completed">Completed</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>

            <div class="form-group">
              <label>Tracking ID</label>
              <input type="text" [(ngModel)]="order.tracking_id">
            </div>

            <div class="form-group">
              <label>Total Amount</label>
              <input type="number" [(ngModel)]="order.total_amount" readonly>
            </div>

            <div class="form-group">
              <label>Payment Status *</label>
              <select [(ngModel)]="order.payment_status" (change)="onPaymentStatusChange()" required>
                <option value="Full Payment">Full Payment</option>
                <option value="Half Payment">Half Payment</option>
                <option value="Remaining">Remaining</option>
              </select>
            </div>

            <div class="form-group">
              <label>Amount Paid</label>
              <input type="number" [(ngModel)]="order.amount_paid" (input)="calculateRemaining()">
            </div>

            <div class="form-group">
              <label>Amount Remaining</label>
              <input type="number" [(ngModel)]="order.amount_remaining" readonly>
            </div>
          </div>
        </section>

        <section class="form-section">
          <h3>Delivery Details</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Delivery Type</label>
              <select [(ngModel)]="deliveryCost.delivery_type">
                <option value="">Select Type</option>
                <option value="National">National</option>
                <option value="International">International</option>
              </select>
            </div>

            <div class="form-group">
              <label>Delivery Cost</label>
              <input type="number" [(ngModel)]="deliveryCost.delivery_cost" (input)="calculateTotalWithDelivery()">
            </div>

            <div class="form-group">
              <label>Total Amount with Delivery</label>
              <input type="number" [value]="getTotalWithDelivery()" readonly>
            </div>
          
          </div>
        </section>
        
        <!-- Save Order Button -->
        <section class="save-button-section">
          <button class="btn-save" (click)="saveOrder()" [disabled]="saving">
            {{ saving ? 'Saving...' : 'Save Order' }}
          </button>
        </section>

        <!-- Customer Order History -->
        <section class="form-section" *ngIf="!isNew && customerOrders.length > 0">
          <h3>Customer Order History</h3>
          <p class="subtitle">Previous orders from {{ customerData.name }}</p>
          
          <div class="customer-orders-list">
            <div class="customer-order-card" *ngFor="let custOrder of customerOrders" (click)="viewCustomerOrder(custOrder.id)">
              <div class="order-header-row">
                <span class="order-number-link">{{ custOrder.order_number }}</span>
                <span class="order-date">{{ formatDate(custOrder.order_date) }}</span>
              </div>
              <div class="order-details-row">
                <span class="order-type-badge" [ngClass]="custOrder.order_type === 'Sale' ? 'type-sale' : 'type-customer'">
                  {{ custOrder.order_type }}
                </span>
                <span class="order-status">{{ custOrder.order_status }}</span>
                <span class="order-amount">Rs. {{ custOrder.total_amount.toFixed(2) }}</span>
              </div>
              <div class="order-payment-row">
                <span class="payment-badge" [ngClass]="'payment-' + custOrder.payment_status.toLowerCase().replace(' ', '-')">
                  {{ custOrder.payment_status }}
                </span>
                <span class="remaining-amount" *ngIf="custOrder.amount_remaining > 0">
                  Remaining: Rs. {{ custOrder.amount_remaining.toFixed(2) }}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .order-detail-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      gap: 1rem;
    }

    .header h2 {
      flex: 1;
      margin: 0;
      font-size: 1.875rem;
      color: #1a202c;
    }

    .actions {
      display: flex;
      gap: 0.75rem;
    }

    .btn-back {
      background: white;
      color: #3182ce;
      border: 2px solid #e2e8f0;
      padding: 0.625rem 1.25rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-back:hover {
      background: #ebf8ff;
      border-color: #3182ce;
    }

    .btn-save {
      background: #38a169;
      color: white;
      border: none;
      padding: 0.625rem 1.5rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-save:hover:not(:disabled) {
      background: #2f855a;
      transform: translateY(-1px);
    }

    .btn-save:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-invoice {
      background: #667eea;
      color: white;
      border: none;
      padding: 0.625rem 1.25rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-invoice:hover {
      background: #5a67d8;
      transform: translateY(-1px);
    }

    .btn-export {
      background: #10b981;
      color: white;
      border: none;
      padding: 0.625rem 1.25rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-export:hover {
      background: #059669;
      transform: translateY(-1px);
    }

    .btn-delete {
      background: #e53e3e;
      color: white;
      border: none;
      padding: 0.625rem 1.25rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-delete:hover {
      background: #c53030;
    }

    .error {
      background: #fed7d7;
      color: #c53030;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
    }

    .save-button-section {
      display: flex;
      justify-content: flex-end;
    }

    .save-button-section .btn-save {
      min-width: 200px;
    }

    .form-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-section {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .form-section h3 {
      margin: 0 0 1.5rem;
      font-size: 1.25rem;
      color: #2d3748;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .section-header h3 {
      margin: 0;
    }

    .btn-add {
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

    .btn-add:hover {
      background: #2c5282;
    }

    .btn-secondary {
      background: white;
      color: #3182ce;
      border: 2px solid #3182ce;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-secondary:hover {
      background: #ebf8ff;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.25rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-group label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #4a5568;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      padding: 0.625rem 0.875rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.9375rem;
      transition: all 0.2s;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #3182ce;
      box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
    }

    .form-group input[readonly] {
      background: #f7fafc;
      color: #718096;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9375rem;
      cursor: pointer;
    }

    .dye-colors-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .dye-colors-header label {
      margin: 0;
    }

    .btn-add-color {
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

    .btn-add-color:hover {
      background: #2c5282;
      transform: translateY(-1px);
    }

    .dye-colors-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .dye-color-item {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .dye-color-item .color-input {
      flex: 1;
      padding: 0.625rem 0.875rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.9375rem;
      transition: all 0.2s;
    }

    .dye-color-item .color-input:focus {
      outline: none;
      border-color: #3182ce;
      box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
    }

    .btn-remove-color {
      background: #e53e3e;
      color: white;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      font-size: 1.25rem;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .btn-remove-color:hover {
      background: #c53030;
      transform: scale(1.1);
    }

    .no-colors {
      color: #718096;
      font-size: 0.875rem;
      font-style: italic;
      margin: 0.5rem 0 0;
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .item-card {
      background: #f7fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1.25rem;
    }

    .info-box {
      padding: 0.75rem;
      background: #e6f7ff;
      border: 1px solid #91d5ff;
      border-radius: 6px;
      color: #0050b3;
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .item-header h4 {
      margin: 0;
      font-size: 1rem;
      color: #2d3748;
    }

    .btn-remove {
      background: #fed7d7;
      color: #c53030;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      font-size: 1.5rem;
      line-height: 1;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-remove:hover {
      background: #fc8181;
      color: white;
    }

    .empty-items {
      text-align: center;
      padding: 3rem 1rem;
      color: #718096;
    }

    .empty-items p {
      margin: 0 0 1rem;
    }

    .subtitle {
      color: #718096;
      font-size: 0.875rem;
      margin: -0.5rem 0 1.5rem;
    }

    .customer-orders-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }

    .customer-order-card {
      background: #f7fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .customer-order-card:hover {
      background: white;
      border-color: #3182ce;
      box-shadow: 0 4px 12px rgba(49, 130, 206, 0.15);
      transform: translateY(-2px);
    }

    .order-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .order-number-link {
      font-weight: 700;
      color: #3182ce;
      font-size: 1rem;
    }

    .order-date {
      color: #718096;
      font-size: 0.875rem;
    }

    .order-details-row {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      margin-bottom: 0.5rem;
      flex-wrap: wrap;
    }

    .order-status {
      color: #4a5568;
      font-size: 0.875rem;
    }

    .order-amount {
      font-weight: 600;
      color: #2d3748;
      margin-left: auto;
    }

    .order-payment-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
    }

    .remaining-amount {
      color: #e53e3e;
      font-size: 0.875rem;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .header {
        flex-wrap: wrap;
      }

      .actions {
        width: 100%;
        flex-direction: column;
      }

      .actions button {
        width: 100%;
      }
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class OrderDetailComponent implements OnInit {
  isNew = false;
  order: Partial<Order> = {
    order_number: '',
    order_date: new Date().toISOString().split('T')[0],
    order_type: 'Customer Order',
    order_status: 'Received',
    payment_status: 'Remaining',
    total_amount: 0,
    amount_paid: 0,
    amount_remaining: 0
  };

  customerData: Partial<Customer> = {
    name: ''
  };

  orderItems: Partial<OrderItem>[] = [];
  deliveryCost: Partial<DeliveryCost> = {
    added_to_order: false,
    customer_charge: 0,
    delivery_cost: 0
  };

  customers: Customer[] = [];
  sales: SaleWithDetails[] = [];
  availableSkus: {sale: SaleWithDetails; sku: SkuItem}[] = [];
  customerOrders: OrderWithDetails[] = []; // Customer's previous orders
  selectedCustomerId = '';
  saving = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private customerService: CustomerService,
    private salesService: SalesService,
    private whatsappService: WhatsAppService
  ) {}

  async ngOnInit() {
    console.log('=== ngOnInit STARTED ===');
    await Promise.all([this.loadCustomers(), this.loadSales()]);

    const id = this.route.snapshot.paramMap.get('id');
    console.log('Route ID:', id);
    
    if (id === 'new') {
      console.log('Creating new order...');
      this.isNew = true;
      const nextOrderNumber = await this.orderService.getNextOrderNumber();
      this.order.order_number = nextOrderNumber;
      console.log('Generated order number:', nextOrderNumber);
    } else if (id) {
      console.log('Loading existing order:', id);
      await this.loadOrder(id);
    }
    
    console.log('=== ngOnInit COMPLETED ===');
  }

  async loadCustomers() {
    try {
      this.customers = await this.customerService.getCustomers();
    } catch (err: any) {
      console.error('Failed to load customers:', err);
    }
  }

  async loadSales() {
    try {
      this.sales = await this.salesService.getSales();
      this.updateAvailableSkus();
    } catch (err: any) {
      console.error('Failed to load sales:', err);
    }
  }

  updateAvailableSkus() {
    this.availableSkus = [];
    for (const sale of this.sales) {
      for (const sku of sale.sku_items) {
        if (sku.quantity > 0) {
          this.availableSkus.push({ sale, sku });
        }
      }
    }
  }

  onOrderTypeChange() {
    this.orderItems = [];
  }

  async deductSkuQuantity(saleId: string, skuCode: string, quantityToDeduct: number) {
    try {
      const sale = await this.salesService.getSaleById(saleId);
      if (!sale) {
        throw new Error('Sale not found');
      }

      const updatedSkuItems = sale.sku_items.map(sku => {
        if (sku.sku_code === skuCode) {
          return {
            ...sku,
            quantity: sku.quantity - quantityToDeduct
          };
        }
        return sku;
      });

      const totalItems = updatedSkuItems.reduce((sum, item) => sum + item.quantity, 0);

      await this.salesService.updateSale(saleId, {
        sku_items: updatedSkuItems,
        total_items: totalItems
      });
    } catch (err: any) {
      console.error('Failed to deduct SKU quantity:', err);
      throw new Error('Failed to update inventory: ' + err.message);
    }
  }

  async loadOrder(id: string) {
    try {
      const orderData = await this.orderService.getOrder(id);
      if (orderData) {
        this.order = orderData;
        this.orderItems = orderData.order_items || [];
        this.deliveryCost = orderData.delivery_cost || {
          added_to_order: false,
          customer_charge: 0,
          delivery_cost: 0
        };

        if (orderData.customer) {
          this.customerData = orderData.customer;
          this.selectedCustomerId = orderData.customer.id;
          
          // Load customer's other orders
          await this.loadCustomerOrders(orderData.customer.id, id);
        }
      }
    } catch (err: any) {
      this.error = err.message || 'Failed to load order';
    }
  }

  async loadCustomerOrders(customerId: string, currentOrderId: string) {
    try {
      // Get all orders for this customer except the current one
      const allOrders = await this.orderService.getOrders();
      this.customerOrders = allOrders
        .filter(order => order.customer_id === customerId && order.id !== currentOrderId)
        .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());
      
      console.log(`Loaded ${this.customerOrders.length} previous orders for customer`);
    } catch (err: any) {
      console.error('Failed to load customer orders:', err);
    }
  }

  viewCustomerOrder(orderId: string) {
    // Navigate to the order and force reload
    this.router.navigate(['/orders', orderId]).then(() => {
      // Reload the page data
      window.location.reload();
    });
  }

  onCustomerSelect() {
    if (this.selectedCustomerId) {
      const customer = this.customers.find(c => c.id === this.selectedCustomerId);
      if (customer) {
        this.customerData = { ...customer };
      }
    } else {
      this.customerData = { name: '' };
    }
  }

  async onOrderStatusChange() {
    // Only send WhatsApp for existing orders (not new ones)
    if (this.isNew || !this.order.id) {
      console.log('Skipping WhatsApp - order not saved yet');
      return;
    }

    // Only send if customer has phone number
    if (!this.customerData.phone) {
      console.log('Skipping WhatsApp - no customer phone number');
      return;
    }

    try {
      console.log('📱 Order status changed to:', this.order.order_status);
      
      // Send WhatsApp notification
      const success = await this.whatsappService.sendOrderStatusNotification(
        this.customerData.phone,
        this.customerData.name || 'Customer',
        this.order.order_number || '',
        this.order.order_status || ''
      );

      if (success) {
        // Show success toast (small notification)
        const toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });

        toast.fire({
          icon: 'success',
          title: '📱 WhatsApp sent to customer!'
        });
      }
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
    }
  }

  addItem() {
    this.orderItems.push({
      product_type: '',
      quantity: 1,
      price: 0,
      dye_color: ['']
    });
  }

  removeItem(index: number) {
    this.orderItems.splice(index, 1);
    this.calculateTotalAmount();
  }

  onSaleSelect(item: Partial<OrderItem>) {
    // Clear SKU when sale changes
    item.sku_code = '';
    item.product_type = '';
    item.quantity = 1;
    console.log('Sale selected:', item.sale_id);
  }

  getSkusForSale(saleId: string): SkuItem[] {
    const sale = this.sales.find(s => s.id === saleId);
    if (!sale || !sale.sku_items) {
      return [];
    }
    // Return only SKUs with quantity > 0
    return sale.sku_items.filter(sku => sku.quantity > 0);
  }

  onSkuSelect(item: Partial<OrderItem>) {
    if (item.sku_code && item.sale_id) {
      const sale = this.sales.find(s => s.id === item.sale_id);
      if (sale) {
        const selectedSku = sale.sku_items.find(sku => sku.sku_code === item.sku_code);
        if (selectedSku) {
          item.product_type = selectedSku.sku_code;
          item.quantity = Math.min(item.quantity || 1, selectedSku.quantity);
        }
      }
    }
    this.calculateTotalAmount();
  }

  getMaxQuantity(item: Partial<OrderItem>): number {
    if (this.order.order_type === 'Sale' && item.sku_code && item.sale_id) {
      const sale = this.sales.find(s => s.id === item.sale_id);
      if (sale) {
        const sku = sale.sku_items.find(s => s.sku_code === item.sku_code);
        return sku ? sku.quantity : 0;
      }
    }
    return 999999;
  }

  getSaleName(saleId: string): string {
    const sale = this.sales.find(s => s.id === saleId);
    return sale ? sale.sales_name || 'Unknown Sale' : 'Unknown Sale';
  }

  onQuantityChange(item: Partial<OrderItem>) {
    if (this.order.order_type === 'Sale' && item.sku_code) {
      const maxQty = this.getMaxQuantity(item);
      if (item.quantity && item.quantity > maxQty) {
        item.quantity = maxQty;
        Swal.fire('Warning', `Maximum available quantity is ${maxQty}`, 'warning');
      }
    }

    const quantity = item.quantity || 0;
    if (!item.dye_color) {
      item.dye_color = [];
    }

    if (item.dye_color.length < quantity) {
      while (item.dye_color.length < quantity) {
        item.dye_color.push('');
      }
    } else if (item.dye_color.length > quantity) {
      item.dye_color = item.dye_color.slice(0, quantity);
    }

    this.calculateTotalAmount();
  }

  trackByIndex(index: number): number {
    return index;
  }

  getDyeColorArray(item: Partial<OrderItem>): string[] {
    if (!item.dye_color) {
      item.dye_color = [];
    }
    return item.dye_color;
  }

  addDyeColor(item: Partial<OrderItem>): void {
    if (!item.dye_color) {
      item.dye_color = [];
    }
    item.dye_color.push('');
  }

  removeDyeColor(item: Partial<OrderItem>, index: number): void {
    if (item.dye_color && item.dye_color.length > index) {
      item.dye_color.splice(index, 1);
    }
  }

  updateDyeColorValue(item: Partial<OrderItem>, index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!item.dye_color) {
      item.dye_color = [];
    }
    if (item.dye_color.length > index) {
      item.dye_color[index] = input.value;
    }
  }

  getItemTotal(item: Partial<OrderItem>): number {
    const quantity = item.quantity || 0;
    const price = item.price || 0;
    return quantity * price;
  }

  calculateTotalAmount() {
    const itemsTotal = this.orderItems.reduce((sum, item) => {
      return sum + this.getItemTotal(item);
    }, 0);
    this.order.total_amount = itemsTotal;

    this.updateAmountPaidBasedOnStatus();
    this.calculateRemaining();
  }

  onPaymentStatusChange() {
    this.updateAmountPaidBasedOnStatus();
    this.calculateRemaining();
  }

  updateAmountPaidBasedOnStatus() {
    const total = this.order.total_amount || 0;

    if (this.order.payment_status === 'Full Payment') {
      this.order.amount_paid = total;
    } else if (this.order.payment_status === 'Half Payment') {
      this.order.amount_paid = total / 2;
    } else if (this.order.payment_status === 'Remaining') {
      this.order.amount_paid = 0;
    }
  }

  calculateRemaining() {
    const total = this.order.total_amount || 0;
    const paid = this.order.amount_paid || 0;
    this.order.amount_remaining = total - paid;
  }

  calculateTotalWithDelivery() {
    this.deliveryCost.customer_charge = this.deliveryCost.delivery_cost || 0;
  }

  getTotalWithDelivery(): number {
    const baseAmount = this.order.total_amount || 0;
    const deliveryCost = this.deliveryCost.delivery_cost || 0;
    return baseAmount + deliveryCost;
  }

  async saveOrder() {
    console.log('=== saveOrder STARTED ===');
    console.log('isNew:', this.isNew);
    console.log('Current order object:', this.order);
    console.log('Order ID:', this.order.id);
    
    // Capture if this is a new order BEFORE any modifications
    const wasNewOrder = this.isNew || !this.order.id;
    console.log('wasNewOrder:', wasNewOrder);
    
    try {
      this.saving = true;
      this.error = null;

      // Validate customer
      if (!this.customerData.name) {
        throw new Error('Customer name is required');
      }

      // Handle customer creation/update
      let customerId = this.selectedCustomerId;
      if (!customerId) {
        const newCustomer = await this.customerService.createCustomer(this.customerData);
        customerId = newCustomer.id;
      } else {
        await this.customerService.updateCustomer(customerId, this.customerData);
      }

      // Prepare order data without joined fields
      const orderData = {
        order_number: this.order.order_number,
        order_date: this.order.order_date,
        order_type: this.order.order_type,
        order_status: this.order.order_status,
        payment_status: this.order.payment_status,
        total_amount: this.order.total_amount,
        amount_paid: this.order.amount_paid,
        amount_remaining: this.order.amount_remaining,
        customer_id: customerId
      };

      console.log('Saving order with data:', orderData);

      let orderId: string;

      // Check if this is a new order (either isNew flag OR no order ID)
      if (wasNewOrder) {
        // Generate fresh order number to prevent duplicates
        console.log('Generating fresh order number...');
        const freshOrderNumber = await this.orderService.getNextOrderNumber();
        orderData.order_number = freshOrderNumber;
        console.log('Fresh order number:', freshOrderNumber);
        
        // Create new order
        console.log('Creating new order... (isNew:', this.isNew, ', order.id:', this.order.id, ')');
        const newOrder = await this.orderService.createOrder(orderData);
        orderId = newOrder.id;
        console.log('New order created with ID:', orderId);
        
        // Update the local order object with the new ID and order number
        this.order.id = orderId;
        this.order.order_number = freshOrderNumber;
        this.isNew = false; // Mark as no longer new
      } else {
        // Update existing order
        const existingOrderId = this.order.id;
        
        // Validate order ID exists
        if (!existingOrderId) {
          throw new Error('Order ID is missing. Cannot update order.');
        }
        
        orderId = existingOrderId; // Now TypeScript knows it's not undefined
        console.log('Updating existing order ID:', orderId);
        await this.orderService.updateOrder(orderId, orderData);
        console.log('Order updated successfully');
      }

      // Save order items
      console.log('Saving order items...');
      for (const item of this.orderItems) {
        console.log('Processing item:', item);
        if (item.id) {
          // Update existing item
          await this.orderService.updateOrderItem(item.id, item);
        } else {
          // Create new item
          await this.orderService.addOrderItem({
            ...item,
            order_id: orderId
          });
        }
      }

      // Deduct SKU quantities from sales if order type is Sale (only for new orders)
      if (this.order.order_type === 'Sale' && this.isNew) {
        console.log('Deducting SKU quantities...');
        for (const item of this.orderItems) {
          if (item.sale_id && item.sku_code && item.quantity) {
            await this.deductSkuQuantity(item.sale_id, item.sku_code, item.quantity);
          }
        }
      }

      // Save delivery cost if provided
      if (this.deliveryCost.delivery_cost) {
        console.log('Saving delivery cost...');
        this.deliveryCost.customer_charge = this.deliveryCost.delivery_cost;
        await this.orderService.saveDeliveryCost({
          ...this.deliveryCost,
          order_id: orderId
        });
      }

      // Show success message and navigate
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: wasNewOrder ? 'Order created successfully!' : 'Order updated successfully!',
        timer: 2000,
        showConfirmButton: false
      });
      
      console.log('Navigating to /orders...');
      await this.router.navigate(['/orders']);
      console.log('Navigation complete');
    } catch (err: any) {
      console.error('=== ERROR IN saveOrder ===', err);
      this.error = err.message || 'Failed to save order';
      console.log('Error details:', err);

      try {
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: this.error || 'An error occurred',
          confirmButtonText: 'OK'
        });
      } catch (swalError) {
        console.error('SweetAlert error:', swalError);
        alert('Error: ' + this.error);
      }
    } finally {
      this.saving = false;
      console.log('=== saveOrder COMPLETED ===');
    }
  }

  async deleteOrder() {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await this.orderService.deleteOrder(this.order.id!);
      await Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Order has been deleted successfully.',
        timer: 2000,
        showConfirmButton: false
      });
      this.router.navigate(['/orders']);
    } catch (err: any) {
      this.error = err.message || 'Failed to delete order';
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: this.error || 'An error occurred'
      });
    }
  }

  viewInvoice() {
    if (this.order.id) {
      this.router.navigate(['/orders', this.order.id, 'invoice']);
    }
  }

  exportToExcel() {
    // Create Excel data structure
    const orderData = [];
    
    // Order Header Information
    orderData.push(['ORDER DETAILS']);
    orderData.push(['']);
    orderData.push(['Order Number', this.order.order_number || '']);
    orderData.push(['Order Date', this.order.order_date || '']);
    orderData.push(['Order Type', this.order.order_type || '']);
    orderData.push(['Order Status', this.order.order_status || '']);
    orderData.push(['Payment Status', this.order.payment_status || '']);
    orderData.push(['Tracking ID', this.order.tracking_id || '']);
    orderData.push(['']);
    
    // Customer Information
    orderData.push(['CUSTOMER INFORMATION']);
    orderData.push(['']);
    orderData.push(['Name', this.customerData.name || '']);
    orderData.push(['Phone', this.customerData.phone || '']);
    orderData.push(['Email', this.customerData.email || '']);
    orderData.push(['City', this.customerData.city || '']);
    orderData.push(['Country', this.customerData.country || '']);
    orderData.push(['Address', this.customerData.address || '']);
    orderData.push(['']);
    
    // Order Items
    orderData.push(['ORDER ITEMS']);
    orderData.push(['']);
    orderData.push(['Product Type', 'Quantity', 'Price', 'Total', 'Fabric', 'Dye Colors', 'SKU Code']);
    
    this.orderItems.forEach((item, index) => {
      const dyeColors = Array.isArray(item.dye_color) ? item.dye_color.join(', ') : (item.dye_color || '');
      orderData.push([
        item.product_type || '',
        item.quantity || 0,
        item.price || 0,
        (item.quantity || 0) * (item.price || 0),
        item.fabric_details || '',
        dyeColors,
        item.sku_code || ''
      ]);
    });
    
    orderData.push(['']);
    
    // Financial Summary
    orderData.push(['FINANCIAL SUMMARY']);
    orderData.push(['']);
    orderData.push(['Total Amount', `Rs. ${(this.order.total_amount || 0).toFixed(2)}`]);
    orderData.push(['Amount Paid', `Rs. ${(this.order.amount_paid || 0).toFixed(2)}`]);
    orderData.push(['Amount Remaining', `Rs. ${(this.order.amount_remaining || 0).toFixed(2)}`]);
    
    // Delivery Information
    if (this.deliveryCost.delivery_type) {
      orderData.push(['']);
      orderData.push(['DELIVERY INFORMATION']);
      orderData.push(['']);
      orderData.push(['Delivery Type', this.deliveryCost.delivery_type || '']);
      orderData.push(['Delivery Cost', `Rs. ${(this.deliveryCost.delivery_cost || 0).toFixed(2)}`]);
      orderData.push(['Total with Delivery', `Rs. ${this.getTotalWithDelivery().toFixed(2)}`]);
    }
    
    // Convert to CSV format
    const csvContent = orderData.map(row => row.map(cell => {
      // Escape quotes and wrap in quotes if contains comma
      const cellStr = String(cell);
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(',')).join('\n');
    
    // Create blob and download
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `Order_${this.order.order_number}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success message
    Swal.fire({
      title: 'Exported!',
      text: `Order #${this.order.order_number} has been exported to Excel.`,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  }

  goBack() {
    this.router.navigate(['/orders']);
  }
}
