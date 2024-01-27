import { Routes } from '@angular/router';
import {UserDetailsComponent} from "./pages/user-details/user-details.component";
import {AnalyticsComponent} from "./pages/analytics/analytics.component";
import {PageNotFoundComponent} from "./pages/page-not-found/page-not-found.component";

export const routes: Routes = [
  {
    path: 'user-details',
    loadComponent: () => UserDetailsComponent
  },
  {
    path: 'analytics',
    loadComponent: () => AnalyticsComponent
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'user-details'
  },
  {
    path: '**',
    loadComponent: () => PageNotFoundComponent
  }
];
