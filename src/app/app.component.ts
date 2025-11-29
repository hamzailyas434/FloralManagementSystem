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
          <div class="brand-text">
            <h1>Cloth Brand</h1>
            <p>Management System</p>
          </div>
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
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 50%, #dee2e6 100%);
      position: relative;
    }

    .app-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 20% 50%, rgba(200, 200, 220, 0.2), transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(220, 220, 240, 0.2), transparent 50%),
        radial-gradient(circle at 40% 20%, rgba(210, 210, 230, 0.15), transparent 50%);
      pointer-events: none;
    }

    .app-container.auth-layout {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .sidebar {
      width: 280px;
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-right: 1px solid rgba(0, 0, 0, 0.08);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
      display: flex;
      flex-direction: column;
      position: relative;
      z-index: 10;
    }

    .sidebar::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(180deg, 
        rgba(255, 255, 255, 0.5) 0%, 
        rgba(255, 255, 255, 0.3) 100%);
      pointer-events: none;
    }

    .brand {
      padding: 2rem;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
      display: flex;
      align-items: center;
      gap: 1rem;
      position: relative;
      z-index: 1;
    }

    .brand-logo {
      width: 50px;
      height: 50px;
      border-radius: 12px;
      object-fit: cover;
      border: 2px solid rgba(0, 0, 0, 0.1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .brand-text {
      flex: 1;
    }

    .brand h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #1a202c;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .brand p {
      margin: 0.25rem 0 0;
      font-size: 0.875rem;
      color: #4a5568;
    }

    .nav-links {
      list-style: none;
      padding: 1.5rem 1rem;
      margin: 0;
      flex: 1;
      position: relative;
      z-index: 1;
    }

    .nav-links li {
      margin-bottom: 0.5rem;
    }

    .nav-links li a {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      color: #2d3748;
      text-decoration: none;
      border-radius: 12px;
      transition: all 0.3s ease;
      font-weight: 500;
      position: relative;
      overflow: hidden;
    }

    .nav-links li a::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.03);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .nav-links li a:hover::before {
      opacity: 1;
    }

    .nav-links li a:hover {
      background: rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(10px);
      transform: translateX(5px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
      color: #1a202c;
    }

    .nav-links li a.active {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      color: #667eea;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(102, 126, 234, 0.2);
    }

    .icon {
      font-size: 1.5rem;
      position: relative;
      z-index: 1;
    }

    .main-content {
      flex: 1;
      padding: 2rem;
      overflow-y: auto;
      position: relative;
      z-index: 1;
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
        height: auto;
        min-height: auto;
        padding: 0;
        position: relative;
      }

      .brand {
        padding: 1.5rem;
        flex-direction: row;
        justify-content: flex-start;
        border-bottom: 1px solid rgba(0, 0, 0, 0.08);
      }

      .brand-logo {
        width: 45px;
        height: 45px;
      }

      .brand h1 {
        font-size: 1.25rem;
      }

      .brand p {
        font-size: 0.8125rem;
      }

      .nav-links {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;
        padding: 1rem;
        overflow-x: visible;
      }

      .nav-links li {
        flex-shrink: 0;
      }

      .nav-links li a {
        padding: 1rem 0.5rem;
        flex-direction: column;
        gap: 0.5rem;
        font-size: 0.75rem;
        min-width: auto;
        text-align: center;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.5);
        color: #2d3748;
      }

      .nav-links li a.active {
        background: rgba(255, 255, 255, 0.9);
        color: #667eea;
      }

      .nav-links li a:hover {
        background: rgba(255, 255, 255, 0.7);
      }

      .icon {
        font-size: 1.75rem;
      }

      .user-section {
        padding: 1rem;
        border-top: 1px solid rgba(0, 0, 0, 0.08);
        margin-top: 0;
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.75rem;
        padding: 0.75rem;
        background: rgba(255, 255, 255, 0.5);
        border-radius: 12px;
      }

      .user-avatar {
        width: 45px;
        height: 45px;
        font-size: 1rem;
      }

      .user-name {
        font-size: 0.9375rem;
      }

      .user-email {
        font-size: 0.8125rem;
      }

      .btn-logout {
        padding: 0.875rem 1rem;
        font-size: 0.9375rem;
      }

      .main-content {
        padding: 1rem;
      }
    }

    .user-section {
      margin-top: auto;
      padding: 1.5rem;
      border-top: 1px solid rgba(0, 0, 0, 0.08);
      position: relative;
      z-index: 1;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .user-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1rem;
      color: white;
      border: 2px solid rgba(102, 126, 234, 0.2);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
    }

    .user-details {
      flex: 1;
      min-width: 0;
    }

    .user-name {
      font-weight: 600;
      font-size: 0.9375rem;
      color: #1a202c;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-email {
      font-size: 0.8125rem;
      color: #718096;
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
      padding: 0.875rem 1rem;
      background: rgba(239, 68, 68, 0.2);
      color: white;
      border: 1px solid rgba(239, 68, 68, 0.4);
      border-radius: 12px;
      font-size: 0.9375rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .btn-logout:hover {
      background: rgba(239, 68, 68, 0.4);
      border-color: rgba(239, 68, 68, 0.6);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
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
    const confirmed = confirm('Are you sure you want to logout?');
    if (!confirmed) return;

    const result = await this.authService.signOut();
    if (result.error) {
      alert('Logout failed: ' + result.error);
    }
  }
}

