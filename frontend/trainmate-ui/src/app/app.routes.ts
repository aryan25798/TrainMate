import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },

  // Coach Routes
  {
    path: 'coach',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['COACH'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/coach/coach-dashboard.component').then(m => m.CoachDashboardComponent)
      },
      {
        path: 'upload',
        loadComponent: () => import('./pages/coach/coach-upload.component').then(m => m.CoachUploadComponent)
      },
      {
        path: 'cohorts',
        loadComponent: () => import('./pages/coach/coach-cohorts.component').then(m => m.CoachCohortsComponent)
      },
      {
        path: 'mail',
        loadComponent: () => import('./pages/notifications/notifications.component').then(m => m.NotificationsComponent)
      },
      { path: 'notifications', redirectTo: 'mail', pathMatch: 'full' }
    ]
  },

  // Trainer Routes
  {
    path: 'trainer',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['TRAINER'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/trainer/trainer-dashboard.component').then(m => m.TrainerDashboardComponent)
      },
      {
        path: 'cohorts',
        loadComponent: () => import('./pages/trainer/trainer-cohorts.component').then(m => m.TrainerCohortsComponent)
      },
      {
        path: 'mail',
        loadComponent: () => import('./pages/notifications/notifications.component').then(m => m.NotificationsComponent)
      },
      { path: 'notifications', redirectTo: 'mail', pathMatch: 'full' }
    ]
  },

  // Admin Routes
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'cohorts',
        loadComponent: () => import('./pages/admin/admin-cohorts.component').then(m => m.AdminCohortsComponent)
      },
      {
        path: 'trainers',
        loadComponent: () => import('./pages/admin/admin-trainers.component').then(m => m.AdminTrainersComponent)
      },
      {
        path: 'mail',
        loadComponent: () => import('./pages/notifications/notifications.component').then(m => m.NotificationsComponent)
      },
      { path: 'notifications', redirectTo: 'mail', pathMatch: 'full' }
    ]
  },

  // Wildcard fallback
  { path: '**', redirectTo: '/login' }
];
