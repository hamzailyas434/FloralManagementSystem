import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { User } from '@supabase/supabase-js';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="app-container" [class.auth-layout]="isAuthPage">
      <nav class="sidebar" *ngIf="!isAuthPage">
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

        <div class="user-section" *ngIf="currentUser">
          <div class="user-info">
            <div class="user-avatar">{{ getUserInitials() }}</div>
            <div class="user-details">
              <div class="user-name">{{ getUserName() }}</div>
              <div class="user-email">{{ currentUser.email }}</div>
            </div>
          </div>
          <button class="btn-logout" (click)="logout()">
            <span class="icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <main class="main-content" [class.full-width]="isAuthPage">
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

    .app-container.auth-layout {
      background: transparent;
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

    .main-content.full-width {
      padding: 0;
      width: 100%;
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

    .user-section {
      margin-top: auto;
      padding: 1.5rem 2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.875rem;
      color: white;
    }

    .user-details {
      flex: 1;
      min-width: 0;
    }

    .user-name {
      font-weight: 600;
      font-size: 0.875rem;
      color: white;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-email {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.7);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .btn-logout {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-logout:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.3);
    }

    @media (max-width: 768px) {
      .user-section {
        padding: 1rem;
      }

      .user-info {
        margin-bottom: 0.75rem;
      }

      .user-avatar {
        width: 32px;
        height: 32px;
        font-size: 0.75rem;
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
export class AppComponent implements OnInit {
  currentUser: User | null = null;
  isAuthPage = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Check initial route
    this.checkAuthPage(this.router.url);

    // Listen for route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.checkAuthPage(event.url);
      });
  }

  checkAuthPage(url: string) {
    this.isAuthPage = url.includes('/login') || url.includes('/signup') || url.includes('/forgot-password');
  }

  getUserName(): string {
    if (this.currentUser?.user_metadata?.['full_name']) {
      return this.currentUser.user_metadata['full_name'];
    }
    return this.currentUser?.email?.split('@')[0] || 'User';
  }

  getUserInitials(): string {
    const name = this.getUserName();
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  async logout() {
    await this.authService.signOut();
  }
}

