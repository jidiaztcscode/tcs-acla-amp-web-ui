import { Routes } from '@angular/router';
import { ProfilesManagement } from './feature/pages/parametrization-profiles/profiles-management/profiles-management';
import { ConsultUserProfile } from './feature/pages/parametrization-profiles/consult-user-profile/consult-user-profile';
import { MsalGuard } from '@azure/msal-angular';
import { AuthLoginComponent } from './feature/pages/auth-login/auth-login.component';
import { AuthTestComponent } from './feature/pages/auth-test/auth-test.component';

export const routes: Routes = [
  { path: '', component: ConsultUserProfile },
  { path: 'management', component: ProfilesManagement, canActivate: [MsalGuard] },
  { path: 'login', component: AuthLoginComponent },
  { path: 'auth-test', component: AuthTestComponent },
  {
      path: 'custom-reports',
      loadChildren: () =>
        import('./feature/pages/custom-reports/custom-reports-module').then(m => m.CustomReportsModule)
  }
];
