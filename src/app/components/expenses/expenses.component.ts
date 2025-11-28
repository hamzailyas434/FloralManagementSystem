import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '../../services/expense.service';
import { Expense } from '../../models/database.types';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="expenses-container">
      <div class="header">
        <div>
          <h2>Expense Management</h2>
          <p>Track and manage all business expenses</p>
        </div>
        <button class="btn-primary" (click)="showAddForm()">
          + New Expense
        </button>
      </div>

      <div class="filters">
        <div class="filter-group">
          <label>From Date</label>
          <input type="date" [(ngModel)]="filters.startDate" (change)="applyFilters()">
        </div>
        <div class="filter-group">
          <label>To Date</label>
          <input type="date" [(ngModel)]="filters.endDate" (change)="applyFilters()">
        </div>
        <div class="filter-group">
          <label>Type</label>
          <select [(ngModel)]="filters.type" (change)="applyFilters()">
            <option value="">All Types</option>
            <option value="Material">Material</option>
            <option value="Making">Making</option>
            <option value="Delivery">Delivery</option>
            <option value="General Overhead">General Overhead</option>
          </select>
        </div>
        <button class="btn-clear" (click)="clearFilters()">Clear Filters</button>
      </div>

      <div *ngIf="loading" class="loading">Loading expenses...</div>
      <div *ngIf="error" class="error">{{ error }}</div>

      <div class="summary-cards" *ngIf="!loading && !error">
        <div class="summary-card">
          <div class="card-label">Total Expenses</div>
          <div class="card-value">Rs. {{ totalExpenses.toFixed(2) }}</div>
        </div>
        <div class="summary-card">
          <div class="card-label">Material Costs</div>
          <div class="card-value">Rs. {{ getCostByType('Material').toFixed(2) }}</div>
        </div>
        <div class="summary-card">
          <div class="card-label">Making Costs</div>
          <div class="card-value">Rs. {{ getCostByType('Making').toFixed(2) }}</div>
        </div>
        <div class="summary-card">
          <div class="card-label">Other Costs</div>
          <div class="card-value">Rs. {{ getOtherCosts().toFixed(2) }}</div>
        </div>
      </div>

      <div class="expenses-table" *ngIf="!loading && !error">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Description</th>
              <th>Cost</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let expense of expenses">
              <td>{{ formatDate(expense.expense_date) }}</td>
              <td>
                <span class="type-badge" [ngClass]="'type-' + expense.expense_type.toLowerCase().replace(' ', '-')">
                  {{ expense.expense_type }}
                </span>
              </td>
              <td>{{ expense.description }}</td>
              <td class="amount">Rs. {{ expense.cost.toFixed(2) }}</td>
              <td>
                <button class="btn-edit" (click)="editExpense(expense)">Edit</button>
                <button class="btn-delete" (click)="deleteExpense(expense.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="expenses.length === 0" class="empty-state">
          <p>No expenses found</p>
          <button class="btn-secondary" (click)="showAddForm()">Add First Expense</button>
        </div>
      </div>

      <div class="modal" *ngIf="showForm" (click)="closeForm()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingExpense ? 'Edit Expense' : 'New Expense' }}</h3>
            <button class="btn-close" (click)="closeForm()">×</button>
          </div>

          <form class="expense-form" (submit)="saveExpense($event)">
            <div class="form-group">
              <label>Date *</label>
              <input type="date" [(ngModel)]="formData.expense_date" name="date" required>
            </div>

            <div class="form-group">
              <label>Type *</label>
              <select [(ngModel)]="formData.expense_type" name="type" required>
                <option value="">Select Type</option>
                <option value="Material">Material</option>
                <option value="Making">Making</option>
                <option value="Delivery">Delivery</option>
                <option value="General Overhead">General Overhead</option>
              </select>
            </div>

            <div class="form-group full-width">
              <label>Description *</label>
              <textarea [(ngModel)]="formData.description" name="description" rows="3" required></textarea>
            </div>

            <div class="form-group">
              <label>Cost *</label>
              <input type="number" [(ngModel)]="formData.cost" name="cost" required>
            </div>

            <div class="form-group">
              <label>Related Order ID (Optional)</label>
              <input type="text" [(ngModel)]="formData.related_order_id" name="orderId" placeholder="Optional">
            </div>

            <div class="form-actions">
              <button type="button" class="btn-cancel" (click)="closeForm()">Cancel</button>
              <button type="submit" class="btn-save" [disabled]="saving">
                {{ saving ? 'Saving...' : 'Save Expense' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .expenses-container {
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

    .btn-primary {
      background: #38a169;
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
      background: #2f855a;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(56, 161, 105, 0.4);
    }

    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      flex-wrap: wrap;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex: 1;
      min-width: 200px;
    }

    .filter-group label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #4a5568;
    }

    .filter-group input,
    .filter-group select {
      padding: 0.625rem 0.875rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.9375rem;
      transition: all 0.2s;
    }

    .filter-group input:focus,
    .filter-group select:focus {
      outline: none;
      border-color: #3182ce;
      box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
    }

    .btn-clear {
      align-self: flex-end;
      background: #e2e8f0;
      color: #4a5568;
      border: none;
      padding: 0.625rem 1.25rem;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-clear:hover {
      background: #cbd5e0;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2rem;
    }

    .summary-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .card-label {
      font-size: 0.875rem;
      color: #718096;
      margin-bottom: 0.5rem;
    }

    .card-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: #2d3748;
    }

    .loading, .error {
      text-align: center;
      padding: 3rem;
      font-size: 1.125rem;
    }

    .error {
      color: #e53e3e;
    }

    .expenses-table {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      overflow: hidden;
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

    .type-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .type-material {
      background: #bee3f8;
      color: #2c5282;
    }

    .type-making {
      background: #feebc8;
      color: #c05621;
    }

    .type-delivery {
      background: #c6f6d5;
      color: #22543d;
    }

    .type-general-overhead {
      background: #e9d8fd;
      color: #553c9a;
    }

    .amount {
      font-weight: 600;
      color: #e53e3e;
    }

    .btn-edit,
    .btn-delete {
      border: none;
      padding: 0.375rem 0.875rem;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      margin-right: 0.5rem;
    }

    .btn-edit {
      background: #ebf8ff;
      color: #3182ce;
    }

    .btn-edit:hover {
      background: #3182ce;
      color: white;
    }

    .btn-delete {
      background: #fed7d7;
      color: #c53030;
    }

    .btn-delete:hover {
      background: #c53030;
      color: white;
    }

    .btn-secondary {
      background: white;
      color: #38a169;
      border: 2px solid #38a169;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-secondary:hover {
      background: #f0fff4;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #718096;
    }

    .empty-state p {
      margin: 0 0 1.5rem;
      font-size: 1.125rem;
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
      max-width: 600px;
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

    .expense-form {
      padding: 1.5rem;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
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
      border-color: #38a169;
      box-shadow: 0 0 0 3px rgba(56, 161, 105, 0.1);
    }

    .form-actions {
      grid-column: 1 / -1;
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
    }

    .btn-cancel {
      background: #e2e8f0;
      color: #4a5568;
      border: none;
      padding: 0.625rem 1.5rem;
      border-radius: 6px;
      font-size: 0.9375rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-cancel:hover {
      background: #cbd5e0;
    }

    .btn-save {
      background: #38a169;
      color: white;
      border: none;
      padding: 0.625rem 1.5rem;
      border-radius: 6px;
      font-size: 0.9375rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-save:hover:not(:disabled) {
      background: #2f855a;
    }

    .btn-save:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: 1rem;
      }

      .header button {
        width: 100%;
      }

      .filters {
        flex-direction: column;
      }

      .filter-group {
        min-width: 100%;
      }

      .summary-cards {
        grid-template-columns: 1fr;
      }

      .expenses-table {
        overflow-x: auto;
      }

      table {
        min-width: 600px;
      }

      .expense-form {
        grid-template-columns: 1fr;
      }

      .modal-content {
        max-width: 95%;
        margin: 1rem;
      }
    }

    @media (min-width: 769px) and (max-width: 1024px) {
      .expenses-container {
        padding: 1.5rem;
      }

      .summary-cards {
        grid-template-columns: repeat(2, 1fr);
      }

      .modal-content {
        max-width: 550px;
      }
    }

    /* Remove spinners from number inputs */
    input[type=number]::-webkit-inner-spin-button, 
    input[type=number]::-webkit-outer-spin-button { 
      -webkit-appearance: none; 
      margin: 0; 
    }
    input[type=number] {
      -moz-appearance: textfield;
    }
  `]
})
export class ExpensesComponent implements OnInit {
  expenses: Expense[] = [];
  loading = true;
  error: string | null = null;
  showForm = false;
  saving = false;
  editingExpense: Expense | null = null;

  filters = {
    startDate: '',
    endDate: '',
    type: ''
  };

  formData: Partial<Expense> = {
    expense_date: new Date().toISOString().split('T')[0],
    expense_type: '',
    description: '',
    cost: 0
  };

  constructor(private expenseService: ExpenseService) {}

  async ngOnInit() {
    await this.loadExpenses();
  }

  async loadExpenses() {
    try {
      this.loading = true;
      this.error = null;
      this.expenses = await this.expenseService.getExpenses(this.filters);
    } catch (err: any) {
      this.error = err.message || 'Failed to load expenses';
    } finally {
      this.loading = false;
    }
  }

  async applyFilters() {
    await this.loadExpenses();
  }

  async clearFilters() {
    this.filters = {
      startDate: '',
      endDate: '',
      type: ''
    };
    await this.loadExpenses();
  }

  get totalExpenses(): number {
    return this.expenses.reduce((sum, exp) => sum + exp.cost, 0);
  }

  getCostByType(type: string): number {
    return this.expenses
      .filter(exp => exp.expense_type === type)
      .reduce((sum, exp) => sum + exp.cost, 0);
  }

  getOtherCosts(): number {
    return this.expenses
      .filter(exp => exp.expense_type !== 'Material' && exp.expense_type !== 'Making')
      .reduce((sum, exp) => sum + exp.cost, 0);
  }

  showAddForm() {
    this.showForm = true;
    this.editingExpense = null;
    this.formData = {
      expense_date: new Date().toISOString().split('T')[0],
      expense_type: '',
      description: '',
      cost: 0
    };
  }

  editExpense(expense: Expense) {
    this.showForm = true;
    this.editingExpense = expense;
    this.formData = { ...expense };
  }

  closeForm() {
    this.showForm = false;
    this.editingExpense = null;
  }

  async saveExpense(event: Event) {
    event.preventDefault();

    try {
      this.saving = true;
      this.error = null;

      if (this.editingExpense) {
        await this.expenseService.updateExpense(this.editingExpense.id, this.formData);
      } else {
        await this.expenseService.createExpense(this.formData);
      }

      this.closeForm();
      await this.loadExpenses();
    } catch (err: any) {
      this.error = err.message || 'Failed to save expense';
    } finally {
      this.saving = false;
    }
  }

  async deleteExpense(id: string) {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await this.expenseService.deleteExpense(id);
      await this.loadExpenses();
    } catch (err: any) {
      this.error = err.message || 'Failed to delete expense';
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
