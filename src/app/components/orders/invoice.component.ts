import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { OrderWithDetails } from '../../models/database.types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="invoice-container">
      <div class="no-print actions">
        <button class="btn-secondary" (click)="goBack()">← Back to Order</button>
        <div class="print-actions">
          <button class="btn-primary" (click)="downloadPdf()">⬇ Download PDF</button>
          <button class="btn-primary" (click)="printInvoice()">🖨 Print Invoice</button>
        </div>
      </div>

      <div class="invoice" *ngIf="order">
        <div class="invoice-header">
          <div class="header-left">
            <img src="/invoice-logo.jpg" alt="Company Logo" class="company-logo">
          </div>
          <div class="company-info">
            <h2>Floral Zone</h2>
            <p>Multan, Punjab, Pakistan</p>
            <p>Phone: +92 3184177789</p>
            <p>Email: floralzone18&#64;gmail.com</p>
          </div>
        </div>

        <div class="invoice-details">
          <div class="detail-row">
            <div>
              <strong>Invoice Number:</strong> {{ order.order_number }}
            </div>
            <div>
              <strong>Date:</strong> {{ formatDate(order.order_date) }}
            </div>
          </div>
          <div class="detail-row">
            <div *ngIf="order.tracking_id">
              <strong>Tracking ID:</strong> {{ order.tracking_id }}
            </div>
          </div>
        </div>

        <div class="customer-section">
          <h3>Bill To:</h3>
          <div *ngIf="order.customer">
            <p><strong>{{ order.customer.name }}</strong></p>
            <p *ngIf="order.customer.phone">Phone: {{ order.customer.phone }}</p>
            <p *ngIf="order.customer.email">Email: {{ order.customer.email }}</p>
            <p *ngIf="order.customer.address">{{ order.customer.address }}</p>
            <p *ngIf="order.customer.city || order.customer.country">
              {{ order.customer.city }}{{ order.customer.city && order.customer.country ? ', ' : '' }}{{ order.customer.country }}
            </p>
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Product Type</th>
              <th *ngIf="order.order_type === 'Customer Order'">Fabric Details</th>
              <th *ngIf="order.order_type === 'Customer Order'">Dye Color</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of order.order_items; let i = index">
              <td>{{ i + 1 }}</td>
              <td>{{ item.product_type }}</td>
              <td *ngIf="order.order_type === 'Customer Order'">{{ item.fabric_details || '-' }}</td>
              <td *ngIf="order.order_type === 'Customer Order'">
                <div *ngIf="item.dye_color && item.dye_color.length > 0" class="colors-list">
                  <div *ngFor="let color of item.dye_color; let colorIdx = index" class="color-item">
                    <strong>{{ item.product_type }} {{ colorIdx + 1 }}:</strong> {{ color || 'Not specified' }}
                  </div>
                </div>
                <span *ngIf="!item.dye_color || item.dye_color.length === 0">-</span>
              </td>
              <td>{{ item.quantity }}</td>
              <td>Rs. {{ item.price }}</td>
              <td>Rs. {{ getItemTotal(item) }}</td>
            </tr>
          </tbody>
        </table>

        <div class="totals-section">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>Rs. {{ order.total_amount }}</span>
          </div>
          <div class="total-row" *ngIf="order.delivery_cost?.delivery_cost">
            <span>Delivery ({{ order.delivery_cost?.delivery_type }}):</span>
            <span>Rs. {{ order.delivery_cost?.delivery_cost || 0 }}</span>
          </div>
          <div class="total-row grand-total">
            <span>Grand Total:</span>
            <span>Rs. {{ getGrandTotal() }}</span>
          </div>
        </div>

        <div class="payment-section">
          <h3>Payment Information</h3>
          <div class="payment-details">
            <div class="payment-row">
              <span>Amount Paid:</span>
              <span>Rs. {{ order.amount_paid }}</span>
            </div>
            <div class="payment-row balance-due" *ngIf="order.amount_remaining && order.amount_remaining > 0">
              <span>Balance Due:</span>
              <span>Rs. {{ order.amount_remaining }}</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>We are happy to receive your order!</p>
          <p class="terms">Don't forget to share your review after receiving the order 🌻!</p>
        </div>
      </div>

      <div *ngIf="!order && !loading" class="error">
        Order not found
      </div>
    </div>
  `,
  styles: [`
    .invoice-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
    }

    .no-print.actions {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 2rem;
      align-items: center;
    }

    .print-actions {
      display: flex;
      gap: 1rem;
    }

    .btn-primary, .btn-secondary {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font-weight: 500;
      font-size: 1rem;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #3182ce;
      color: white;
    }

    .btn-primary:hover {
      background: #2c5aa0;
    }

    .btn-secondary {
      background: #e2e8f0;
      color: #2d3748;
    }

    .btn-secondary:hover {
      background: #cbd5e0;
    }

    .invoice {
      background: white;
      padding: 3rem;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      position: relative;
      overflow: hidden;
    }

   

    .invoice > * {
      position: relative;
      z-index: 1;
    }

    .invoice-header {
      border-bottom: 3px solid #3182ce;
      padding-bottom: 0 px;
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: start;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .company-logo {
      width: 250px;
      height: 250px;
      object-fit: contain;
    }

    .invoice-header h1 {
      color: #2d3748;
      font-size: 2.5rem;
      margin: 0;
    }

    .company-info {
      text-align: right;
      margin-top: 3rem;
    }

    .company-info h2 {
      margin: 0 0 0.5rem;
      color: #2d3748;
      font-size: 1.25rem;
    }

    .company-info p {
      margin: 0.25rem 0;
      color: #4a5568;
      font-size: 0.9rem;
    }

    .invoice-details {
      background: #f7fafc;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      margin: 0.5rem 0;
    }

    .detail-row strong {
      color: #2d3748;
      margin-right: 0.5rem;
    }

    .customer-section {
      margin-bottom: 2rem;
      padding: 1rem 1.5rem;
      border-left: 4px solid #3182ce;
      background: #f7fafc;
    }

    .customer-section h3 {
      margin: 0 0 0.75rem;
      color: #2d3748;
      font-size: 1.1rem;
    }

    .customer-section p {
      margin: 0.25rem 0;
      color: #4a5568;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 2rem;
    }

    .items-table th {
      background: #2d3748;
      color: white;
      padding: 0.75rem;
      text-align: left;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .items-table td {
      padding: 0.75rem;
      border-bottom: 1px solid #e2e8f0;
      color: #4a5568;
    }

    .items-table tbody tr:hover {
      background: #f7fafc;
    }

    .color-display {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .color-box {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      border: 1px solid #cbd5e0;
      display: inline-block;
    }

    .totals-section {
      margin-left: auto;
      width: 350px;
      margin-bottom: 2rem;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 1rem;
      font-size: 1rem;
      color: #4a5568;
    }

    .total-row.grand-total {
      background: #2d3748;
      color: white;
      font-weight: 600;
      font-size: 1.25rem;
      margin-top: 0.5rem;
      border-radius: 8px;
    }

    .payment-section {
      background: #f7fafc;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
    }

    .payment-section h3 {
      margin: 0 0 1rem;
      color: #2d3748;
      font-size: 1.1rem;
    }

    .payment-details {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .payment-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      color: #4a5568;
    }

    .payment-row.balance-due {
      border-top: 2px solid #e2e8f0;
      padding-top: 0.75rem;
      margin-top: 0.5rem;
      font-weight: 600;
      color: #e53e3e;
      font-size: 1.1rem;
    }

    .footer {
      text-align: center;
      padding-top: 2rem;
      border-top: 2px solid #e2e8f0;
      color: #4a5568;
    }

    .footer p {
      margin: 0.5rem 0;
    }

    .footer .terms {
      font-size: 0.85rem;
      color: #718096;
      font-style: italic;
    }

    .error {
      text-align: center;
      padding: 3rem;
      color: #e53e3e;
      font-size: 1.1rem;
    }

    @media print {
      .no-print {
        display: none !important;
      }

      .invoice-container {
        padding: 0;
        max-width: 100%;
      }

      .invoice {
        border: none;
        box-shadow: none;
        padding: 1rem;
      }

      .items-table {
        page-break-inside: auto;
      }

      .items-table tr {
        page-break-inside: avoid;
        page-break-after: auto;
      }
    }

    @media (max-width: 768px) {
      .invoice-header {
        flex-direction: column;
        gap: 1rem;
      }

      .company-info {
        text-align: left;
      }

      .detail-row {
        flex-direction: column;
        gap: 0.5rem;
      }

      .totals-section {
        width: 100%;
      }

      .items-table {
        font-size: 0.85rem;
      }

      .items-table th,
      .items-table td {
        padding: 0.5rem;
      }
    }
  `]
})
export class InvoiceComponent implements OnInit {
  order: OrderWithDetails | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this.loadOrder(id);
    }
    this.loading = false;
  }

  async loadOrder(id: string) {
    try {
      const orderData = await this.orderService.getOrder(id);
      if (orderData) {
        this.order = orderData;
      }
    } catch (err) {
      console.error('Failed to load order:', err);
    }
  }

  getItemTotal(item: any): number {
    return (item.quantity || 0) * (item.price || 0);
  }

  getGrandTotal(): number {
    const subtotal = this.order?.total_amount || 0;
    const delivery = this.order?.delivery_cost?.delivery_cost || 0;
    return subtotal + delivery;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  printInvoice() {
    window.print();
  }

  async downloadPdf() {
    const element = document.querySelector('.invoice') as HTMLElement;
    if (!element) return;

    try {
      // Optimized settings for better quality and smaller file size
      const canvas = await html2canvas(element, {
        scale: 2.5,              // Higher scale for better quality
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff',
        imageTimeout: 0,
        removeContainer: true,
        allowTaint: false,
        foreignObjectRendering: false
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      let heightLeft = imgHeight;
      let position = 0;
      
      // Use JPEG with quality 0.95 for much smaller file size
      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      pdf.save(`invoice-${this.order?.order_number || 'download'}.pdf`);
      
      console.log('PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  }

  goBack() {
    if (this.order?.id) {
      this.router.navigate(['/orders', this.order.id]);
    } else {
      this.router.navigate(['/orders']);
    }
  }
}
