import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-types',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="types-container">
      <div class="page-header">
        <h1>Types Management</h1>
        <p class="subtitle">Manage product types and fabric items</p>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button 
          class="tab-button" 
          [class.active]="activeTab === 'products'"
          (click)="activeTab = 'products'">
          📦 Product Types
        </button>
        <button 
          class="tab-button" 
          [class.active]="activeTab === 'fabrics'"
          (click)="activeTab = 'fabrics'">
          🧵 Fabric Items
        </button>
        <button 
          class="tab-button" 
          [class.active]="activeTab === 'expenses'"
          (click)="activeTab = 'expenses'">
          💰 Expense Types
        </button>
      </div>

      <!-- Product Types Tab -->
      <div class="content-card" *ngIf="activeTab === 'products'">
        <div class="card-header">
          <h2>Product Types</h2>
          <button class="btn-add" (click)="addProductType()">
            ➕ Add Product Type
          </button>
        </div>

        <div class="items-list" *ngIf="productTypes.length > 0">
          <div class="item-card" *ngFor="let type of productTypes; let i = index">
            <div class="item-info">
              <span class="item-icon">📦</span>
              <span class="item-name">{{ type }}</span>
            </div>
            <div class="item-actions">
              <button class="btn-edit" (click)="editProductType(i)" title="Edit">✏️</button>
              <button class="btn-delete" (click)="deleteProductType(i)" title="Delete">🗑️</button>
            </div>
          </div>
        </div>

        <div class="empty-state" *ngIf="productTypes.length === 0">
          <p>No product types yet. Add your first one!</p>
        </div>
      </div>

      <!-- Fabric Items Tab -->
      <div class="content-card" *ngIf="activeTab === 'fabrics'">
        <div class="card-header">
          <h2>Fabric Items</h2>
          <button class="btn-add" (click)="addFabricItem()">
            ➕ Add Fabric Item
          </button>
        </div>

        <div class="items-list" *ngIf="fabricItems.length > 0">
          <div class="item-card" *ngFor="let item of fabricItems; let i = index">
            <div class="item-info">
              <span class="item-icon">🧵</span>
              <span class="item-name">{{ item }}</span>
            </div>
            <div class="item-actions">
              <button class="btn-edit" (click)="editFabricItem(i)" title="Edit">✏️</button>
              <button class="btn-delete" (click)="deleteFabricItem(i)" title="Delete">🗑️</button>
            </div>
          </div>
        </div>

        <div class="empty-state" *ngIf="fabricItems.length === 0">
          <p>No fabric items yet. Add your first one!</p>
        </div>
      </div>

      <!-- Expense Types Tab -->
      <div class="content-card" *ngIf="activeTab === 'expenses'">
        <div class="card-header">
          <h2>Expense Types</h2>
          <button class="btn-add" (click)="addExpenseType()">
            ➕ Add Expense Type
          </button>
        </div>

        <div class="items-list" *ngIf="expenseTypes.length > 0">
          <div class="item-card" *ngFor="let type of expenseTypes; let i = index">
            <div class="item-info">
              <span class="item-icon">💰</span>
              <span class="item-name">{{ type }}</span>
            </div>
            <div class="item-actions">
              <button class="btn-edit" (click)="editExpenseType(i)" title="Edit">✏️</button>
              <button class="btn-delete" (click)="deleteExpenseType(i)" title="Delete">🗑️</button>
            </div>
          </div>
        </div>

        <div class="empty-state" *ngIf="expenseTypes.length === 0">
          <p>No expense types yet. Add your first one!</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .types-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .page-header h1 {
      margin: 0 0 0.5rem;
      font-size: 2rem;
      color: #1a202c;
    }

    .subtitle {
      margin: 0;
      color: #718096;
      font-size: 1rem;
    }

    .tabs {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .tab-button {
      flex: 1;
      padding: 1rem;
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1.125rem;
      font-weight: 600;
      color: #718096;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .tab-button:hover {
      border-color: #cbd5e0;
      background: #f7fafc;
    }

    .tab-button.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-color: #667eea;
      box-shadow: 0 4px 6px rgba(102, 126, 234, 0.2);
    }

    .content-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e2e8f0;
    }

    .card-header h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #2d3748;
    }

    .btn-add {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 6px rgba(102, 126, 234, 0.2);
    }

    .btn-add:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(102, 126, 234, 0.3);
    }

    .items-list {
      display: grid;
      gap: 1rem;
    }

    .item-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem;
      background: #f7fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .item-card:hover {
      background: #edf2f7;
      border-color: #cbd5e0;
      transform: translateX(5px);
    }

    .item-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .item-icon {
      font-size: 1.5rem;
    }

    .item-name {
      font-size: 1.125rem;
      font-weight: 600;
      color: #2d3748;
    }

    .item-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-edit,
    .btn-delete {
      background: white;
      border: 1px solid #e2e8f0;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 1.25rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-edit:hover {
      background: #edf2f7;
      border-color: #667eea;
      transform: scale(1.1);
    }

    .btn-delete:hover {
      background: #fed7d7;
      border-color: #fc8181;
      transform: scale(1.1);
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #a0aec0;
      font-size: 1.125rem;
    }

    @media (max-width: 768px) {
      .types-container {
        padding: 1rem;
      }

      .tabs {
        flex-direction: column;
      }

      .card-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .btn-add {
        width: 100%;
      }

      .item-card {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .item-actions {
        justify-content: flex-end;
      }
    }
  `]
})
export class ProductTypesComponent implements OnInit {
  activeTab: 'products' | 'fabrics' | 'expenses' = 'products';
  productTypes: string[] = [];
  fabricItems: string[] = [];
  expenseTypes: string[] = [];

  ngOnInit() {
    this.loadProductTypes();
    this.loadFabricItems();
    this.loadExpenseTypes();
  }

  // Product Types Methods
  loadProductTypes() {
    const stored = localStorage.getItem('productTypes');
    if (stored) {
      this.productTypes = JSON.parse(stored);
    } else {
      this.productTypes = ['Dress', 'Dupatta', 'Bridal Dress', 'Shawl', 'Suit'];
      this.saveProductTypes();
    }
  }

  saveProductTypes() {
    localStorage.setItem('productTypes', JSON.stringify(this.productTypes));
  }

  async addProductType() {
    const result = await Swal.fire({
      title: 'Add New Product Type',
      input: 'text',
      inputLabel: 'Enter product type name',
      inputPlaceholder: 'e.g., Bridal Lehenga, Kurta, Palazzo',
      showCancelButton: true,
      confirmButtonText: 'Add',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#667eea',
      inputValidator: (value) => {
        if (!value) {
          return 'Please enter a product type name';
        }
        if (this.productTypes.includes(value)) {
          return 'This product type already exists';
        }
        return null;
      }
    });

    if (result.isConfirmed && result.value) {
      this.productTypes.push(result.value);
      this.saveProductTypes();
      
      Swal.fire({
        icon: 'success',
        title: 'Product Type Added!',
        text: `"${result.value}" has been added successfully`,
        timer: 2000,
        showConfirmButton: false
      });
    }
  }

  async editProductType(index: number) {
    const oldValue = this.productTypes[index];
    
    const result = await Swal.fire({
      title: 'Edit Product Type',
      input: 'text',
      inputValue: oldValue,
      inputLabel: 'Enter new name',
      showCancelButton: true,
      confirmButtonText: 'Update',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#667eea',
      inputValidator: (value) => {
        if (!value) {
          return 'Please enter a product type name';
        }
        if (value !== oldValue && this.productTypes.includes(value)) {
          return 'This product type already exists';
        }
        return null;
      }
    });

    if (result.isConfirmed && result.value) {
      this.productTypes[index] = result.value;
      this.saveProductTypes();
      
      Swal.fire({
        icon: 'success',
        title: 'Product Type Updated!',
        text: `Updated from "${oldValue}" to "${result.value}"`,
        timer: 2000,
        showConfirmButton: false
      });
    }
  }

  async deleteProductType(index: number) {
    const typeName = this.productTypes[index];
    
    const result = await Swal.fire({
      title: 'Delete Product Type?',
      text: `Are you sure you want to delete "${typeName}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#f56565',
      cancelButtonColor: '#718096'
    });

    if (result.isConfirmed) {
      this.productTypes.splice(index, 1);
      this.saveProductTypes();
      
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: `"${typeName}" has been deleted`,
        timer: 2000,
        showConfirmButton: false
      });
    }
  }

  // Fabric Items Methods
  loadFabricItems() {
    const stored = localStorage.getItem('fabricItems');
    if (stored) {
      this.fabricItems = JSON.parse(stored);
    } else {
      this.fabricItems = ['Cotton', 'Silk', 'Chiffon', 'Lawn', 'Khaddar'];
      this.saveFabricItems();
    }
  }

  saveFabricItems() {
    localStorage.setItem('fabricItems', JSON.stringify(this.fabricItems));
  }

  async addFabricItem() {
    const result = await Swal.fire({
      title: 'Add New Fabric Item',
      input: 'text',
      inputLabel: 'Enter fabric name',
      inputPlaceholder: 'e.g., Velvet, Organza, Jamawar',
      showCancelButton: true,
      confirmButtonText: 'Add',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#667eea',
      inputValidator: (value) => {
        if (!value) {
          return 'Please enter a fabric name';
        }
        if (this.fabricItems.includes(value)) {
          return 'This fabric item already exists';
        }
        return null;
      }
    });

    if (result.isConfirmed && result.value) {
      this.fabricItems.push(result.value);
      this.saveFabricItems();
      
      Swal.fire({
        icon: 'success',
        title: 'Fabric Item Added!',
        text: `"${result.value}" has been added successfully`,
        timer: 2000,
        showConfirmButton: false
      });
    }
  }

  async editFabricItem(index: number) {
    const oldValue = this.fabricItems[index];
    
    const result = await Swal.fire({
      title: 'Edit Fabric Item',
      input: 'text',
      inputValue: oldValue,
      inputLabel: 'Enter new name',
      showCancelButton: true,
      confirmButtonText: 'Update',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#667eea',
      inputValidator: (value) => {
        if (!value) {
          return 'Please enter a fabric name';
        }
        if (value !== oldValue && this.fabricItems.includes(value)) {
          return 'This fabric item already exists';
        }
        return null;
      }
    });

    if (result.isConfirmed && result.value) {
      this.fabricItems[index] = result.value;
      this.saveFabricItems();
      
      Swal.fire({
        icon: 'success',
        title: 'Fabric Item Updated!',
        text: `Updated from "${oldValue}" to "${result.value}"`,
        timer: 2000,
        showConfirmButton: false
      });
    }
  }

  async deleteFabricItem(index: number) {
    const itemName = this.fabricItems[index];
    
    const result = await Swal.fire({
      title: 'Delete Fabric Item?',
      text: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#f56565',
      cancelButtonColor: '#718096'
    });

    if (result.isConfirmed) {
      this.fabricItems.splice(index, 1);
      this.saveFabricItems();
      
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: `"${itemName}" has been deleted`,
        timer: 2000,
        showConfirmButton: false
      });
    }
  }

  // Expense Types Methods
  loadExpenseTypes() {
    const stored = localStorage.getItem('expenseTypes');
    if (stored) {
      this.expenseTypes = JSON.parse(stored);
    } else {
      this.expenseTypes = ['Fabric Purchase', 'Labor Cost', 'Transportation', 'Utilities', 'Rent'];
      this.saveExpenseTypes();
    }
  }

  saveExpenseTypes() {
    localStorage.setItem('expenseTypes', JSON.stringify(this.expenseTypes));
  }

  async addExpenseType() {
    const result = await Swal.fire({
      title: 'Add New Expense Type',
      input: 'text',
      inputLabel: 'Enter expense type name',
      inputPlaceholder: 'e.g., Marketing, Packaging, Maintenance',
      showCancelButton: true,
      confirmButtonText: 'Add',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#667eea',
      inputValidator: (value) => {
        if (!value) {
          return 'Please enter an expense type name';
        }
        if (this.expenseTypes.includes(value)) {
          return 'This expense type already exists';
        }
        return null;
      }
    });

    if (result.isConfirmed && result.value) {
      this.expenseTypes.push(result.value);
      this.saveExpenseTypes();
      
      Swal.fire({
        icon: 'success',
        title: 'Expense Type Added!',
        text: `"${result.value}" has been added successfully`,
        timer: 2000,
        showConfirmButton: false
      });
    }
  }

  async editExpenseType(index: number) {
    const oldValue = this.expenseTypes[index];
    
    const result = await Swal.fire({
      title: 'Edit Expense Type',
      input: 'text',
      inputValue: oldValue,
      inputLabel: 'Enter new name',
      showCancelButton: true,
      confirmButtonText: 'Update',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#667eea',
      inputValidator: (value) => {
        if (!value) {
          return 'Please enter an expense type name';
        }
        if (value !== oldValue && this.expenseTypes.includes(value)) {
          return 'This expense type already exists';
        }
        return null;
      }
    });

    if (result.isConfirmed && result.value) {
      this.expenseTypes[index] = result.value;
      this.saveExpenseTypes();
      
      Swal.fire({
        icon: 'success',
        title: 'Expense Type Updated!',
        text: `Updated from "${oldValue}" to "${result.value}"`,
        timer: 2000,
        showConfirmButton: false
      });
    }
  }

  async deleteExpenseType(index: number) {
    const typeName = this.expenseTypes[index];
    
    const result = await Swal.fire({
      title: 'Delete Expense Type?',
      text: `Are you sure you want to delete "${typeName}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#f56565',
      cancelButtonColor: '#718096'
    });

    if (result.isConfirmed) {
      this.expenseTypes.splice(index, 1);
      this.saveExpenseTypes();
      
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: `"${typeName}" has been deleted`,
        timer: 2000,
        showConfirmButton: false
      });
    }
  }
}
