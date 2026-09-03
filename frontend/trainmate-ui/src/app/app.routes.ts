import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

// Coach Pages
import { CoachDashboardComponent } from './pages/coach/coach-dashboard.component';
import { CoachUploadComponent } from './pages/coach/coach-upload.component';
import { CoachCohortsComponent } from './pages/coach/coach-cohorts.component';

// Trainer Pages
import { TrainerDashboardComponent } from './pages/trainer/trainer-dashboard.component';
import { TrainerCohortsComponent } from './pages/trainer/trainer-cohorts.component';

// Admin Pages
import { AdminDashboardComponent } from './pages/admin/admin-dashboard.component';
import { AdminCohortsComponent } from './pages/admin/admin-cohorts.component';
import { AdminTrainersComponent } from './pages/admin/admin-trainers.component';

// Mail Page
import { NotificationsComponent } from './pages/notifications/notifications.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  // Coach Routes
  {
    path: 'coach',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['COACH'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: CoachDashboardComponent },
      { path: 'upload', component: CoachUploadComponent },
      { path: 'cohorts', component: CoachCohortsComponent },
      { path: 'mail', component: NotificationsComponent },
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
      { path: 'dashboard', component: TrainerDashboardComponent },
      { path: 'cohorts', component: TrainerCohortsComponent },
      { path: 'mail', component: NotificationsComponent },
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
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'cohorts', component: AdminCohortsComponent },
      { path: 'trainers', component: AdminTrainersComponent },
      { path: 'mail', component: NotificationsComponent },
      { path: 'notifications', redirectTo: 'mail', pathMatch: 'full' }
    ]
  },

  // Wildcard fallback
  { path: '**', redirectTo: '/login' }
];
