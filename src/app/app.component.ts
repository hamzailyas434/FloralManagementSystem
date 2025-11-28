import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="app-container">
      <nav class="sidebar">
        <div class="brand">
          <h1>Cloth Brand</h1>
          <p>Management System</p>
        </div>

        <ul class="nav-links">
          <li>
            <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <span class="icon">📊</span>
              <span>Dashboard</span>
            </a>
          </li>
          <li>
            <a routerLink="/orders" routerLinkActive="active">
              <span class="icon">📋</span>
              <span>Orders</span>
            </a>
          </li>
          <li>
            <a routerLink="/customers" routerLinkActive="active">
              <span class="icon">👥</span>
              <span>Customers</span>
            </a>
          </li>
          <li>
            <a routerLink="/expenses" routerLinkActive="active">
              <span class="icon">💰</span>
              <span>Expenses</span>
            </a>
          </li>
          <li>
            <a routerLink="/sales" routerLinkActive="active">
              <span class="icon">🏷️</span>
              <span>Sales</span>
            </a>
          </li>
        </ul>
      </nav>

      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      height: 100vh;
      background: #f5f7fa;
    }

    .sidebar {
      width: 260px;
      background: linear-gradient(180deg, #1a365d 0%, #2c5282 100%);
      color: white;
      padding: 2rem 0;
      box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
    }

    .brand {
      padding: 0 2rem 2rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      margin-bottom: 2rem;
    }

    .brand h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .brand p {
      margin: 0.25rem 0 0;
      font-size: 0.875rem;
      opacity: 0.8;
    }

    .nav-links {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .nav-links li a {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 2rem;
      color: rgba(255, 255, 255, 0.9);
      text-decoration: none;
      transition: all 0.2s;
      border-left: 3px solid transparent;
    }

    .nav-links li a:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .nav-links li a.active {
      background: rgba(255, 255, 255, 0.15);
      border-left-color: #63b3ed;
      color: white;
    }

    .icon {
      font-size: 1.25rem;
    }

    .main-content {
      flex: 1;
      overflow-y: auto;
      padding: 2rem;
    }

    @media (max-width: 768px) {
      .app-container {
        flex-direction: column;
        height: auto;
        min-height: 100vh;
      }

      .sidebar {
        width: 100%;
        padding: 1rem 0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .brand {
        padding: 0 1rem 1rem;
      }

      .brand h1 {
        font-size: 1.25rem;
      }

      .brand p {
        font-size: 0.8125rem;
      }

      .nav-links {
        display: flex;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
      }

      .nav-links::-webkit-scrollbar {
        display: none;
      }

      .nav-links li {
        flex-shrink: 0;
      }

      .nav-links li a {
        padding: 0.75rem 1.5rem;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.875rem;
        min-width: 80px;
        text-align: center;
      }

      .icon {
        font-size: 1.5rem;
      }

      .main-content {
        padding: 1rem;
      }
    }

    @media (min-width: 769px) and (max-width: 1024px) {
      .sidebar {
        width: 220px;
      }

      .brand h1 {
        font-size: 1.375rem;
      }

      .nav-links li a {
        padding: 0.875rem 1.5rem;
        font-size: 0.9375rem;
      }

      .main-content {
        padding: 1.5rem;
      }
    }

    @media (max-width: 768px) and (orientation: landscape) {
      .sidebar {
        padding: 0.5rem 0;
      }

      .brand {
        padding: 0 1rem 0.5rem;
      }

      .nav-links li a {
        padding: 0.5rem 1rem;
      }
    }
  `]
})
export class AppComponent {}
