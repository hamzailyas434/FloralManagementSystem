import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'orders',
    loadComponent: () => import('./components/orders/orders.component').then(m => m.OrdersComponent)
  },
  {
    path: 'orders/:id',
    loadComponent: () => import('./components/orders/order-detail.component').then(m => m.OrderDetailComponent)
  },
  {
    path: 'orders/:id/invoice',
    loadComponent: () => import('./components/orders/invoice.component').then(m => m.InvoiceComponent)
  },
  {
    path: 'customers',
    loadComponent: () => import('./components/customers/customers.component').then(m => m.CustomersComponent)
  },
  {
    path: 'expenses',
    loadComponent: () => import('./components/expenses/expenses.component').then(m => m.ExpensesComponent)
  },
  {
    path: 'sales',
    loadComponent: () => import('./components/sales/sales.component').then(m => m.SalesComponent)
  }
];
