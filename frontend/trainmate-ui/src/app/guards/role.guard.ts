import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const expectedRoles = route.data['roles'] as UserRole[] | undefined;
    const currentRole = this.authService.getRole();

    if (!this.authService.isLoggedIn()) {
      return this.router.parseUrl('/login');
    }

    if (expectedRoles && currentRole && expectedRoles.includes(currentRole)) {
      return true;
    }

    // Role mismatch: redirect to the user's role-appropriate dashboard
    this.authService.redirectBasedOnRole();
    return false;
  }
}
