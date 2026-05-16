import { Routes }     from '@angular/router'
import { authGuard }  from './core/guards/auth.guard'
import { adminGuard } from './core/guards/admin.guard'
import { guestGuard } from './core/guards/guest.guard'

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  {
    path: 'auth',
    canActivate: [guestGuard],
    loadComponent: () => import('./layout/auth-layout/auth-layout')
      .then(m => m.AuthLayout),
    children: [
      { path: 'login',           loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent) },
      { path: 'register',        loadComponent: () => import('./features/auth/register/register').then(m => m.RegisterComponent) },
      { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password/forgot-password').then(m => m.ForgotPasswordComponent) },
      { path: 'reset-password',  loadComponent: () => import('./features/auth/reset-password/reset-password').then(m => m.ResetPasswordComponent) },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },

  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout')
      .then(m => m.MainLayoutComponent),
    children: [
      { path: 'home',             loadComponent: () => import('./features/home/home').then(m => m.Home) },
      { path: 'route-finder',     loadComponent: () => import('./features/route-finder/route-finder').then(m => m.RouteFinderComponent) },
      { path: 'incidents/report', loadComponent: () => import('./features/incident/report/report').then(m => m.ReportComponent) },
      { path: 'incidents/nearby', loadComponent: () => import('./features/incident/nearby/nearby').then(m => m.NearbyComponent) },
      { path: 'profile',          loadComponent: () => import('./features/profile/profile').then(m => m.ProfileComponent) },
    ]
  },

  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./layout/admin-layout/admin-layout')
      .then(m => m.AdminLayout),
    children: [
      { path: 'dashboard',  loadComponent: () => import('./features/admin/dashboard/dashboard').then(m => m.DashboardComponent) },
      { path: 'heatmap',    loadComponent: () => import('./features/admin/heatmap/heatmap').then(m => m.HeatmapComponent) },
      { path: 'analytics',  loadComponent: () => import('./features/admin/analytics/analytics').then(m => m.AnalyticsComponent) },
      { path: 'moderation', loadComponent: () => import('./features/admin/moderation/moderation').then(m => m.ModerationComponent) },
      { path: 'users',      loadComponent: () => import('./features/admin/users/users').then(m => m.UsersComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: '/home' }
]