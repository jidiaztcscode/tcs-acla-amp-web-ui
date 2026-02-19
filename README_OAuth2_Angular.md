# Guía completa para implementar OAuth2 en Angular con Microsoft Authentication Library

## 1. ¿Qué es OAuth2 y por qué usarlo?
OAuth2 es un protocolo estándar que permite a las aplicaciones obtener acceso seguro a recursos protegidos en nombre de un usuario. En el contexto de Angular, se utiliza para que los usuarios puedan iniciar sesión con cuentas empresariales, personales de Microsoft o proveedores sociales, y para obtener tokens que permiten acceder a APIs protegidas como Microsoft Graph o servicios propios.

## 2. Requisitos previos
- Tener Node.js versión 18 o superior instalado.
- Tener Angular CLI instalado (`npm install -g @angular/cli`).
- Registrar la aplicación en Azure Active Directory:
  - Accede al portal de Azure: https://portal.azure.com/
  - Registra una nueva aplicación en Azure Active Directory.
  - Obtén el identificador de cliente (Client ID) y la URL de autoridad (Authority, normalmente `https://login.microsoftonline.com/{tenant}`).
  - Configura los URI de redirección (por ejemplo, `http://localhost:4200/`).

## 3. Instalación de dependencias
Ejecuta en la raíz de tu proyecto:

```bash
npm install @azure/msal-browser @azure/msal-angular
```

## 4. Componentes principales de MSAL Angular

- **MsalService**: Servicio principal para iniciar sesión, cerrar sesión y adquirir tokens.
- **MsalGuard**: Protege rutas y fuerza autenticación antes de acceder a componentes.
- **MsalInterceptor**: Añade automáticamente el token de acceso a las peticiones HTTP a recursos protegidos.
- **MsalBroadcastService**: Permite suscribirse a eventos de autenticación (éxito, error, etc).
- **MsalRedirectComponent**: Maneja el flujo de redirección tras el login.

## 5. Configuración básica en Angular

### 5.1. Importa y configura el módulo MSAL en `app.module.ts`:

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './app.component';
import { MsalModule, MsalService, MsalGuard, MsalInterceptor, MsalBroadcastService, MsalRedirectComponent } from '@azure/msal-angular';
import { PublicClientApplication, InteractionType, BrowserCacheLocation } from '@azure/msal-browser';

@NgModule({
  imports: [
    MsalModule.forRoot(
      new PublicClientApplication({
        auth: {
          clientId: 'TU_CLIENT_ID',
          authority: 'TU_AUTHORITY',
          redirectUri: 'http://localhost:4200/',
        },
        cache: {
          cacheLocation: BrowserCacheLocation.LocalStorage,
        },
      }),
      {
        interactionType: InteractionType.Redirect, // Puede ser Popup o Redirect
        authRequest: {
          scopes: ['user.read'], // Permisos requeridos
        },
        loginFailedRoute: '/login-failed', // Ruta en caso de fallo
      },
      {
        interactionType: InteractionType.Redirect,
        protectedResourceMap: new Map([
          ['https://graph.microsoft.com/v1.0/me', ['user.read']],
        ]),
      }
    ),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true,
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService,
  ],
  bootstrap: [AppComponent, MsalRedirectComponent],
})
export class AppModule {}
```

### 5.2. Protege rutas con el guardia MSAL

En tu archivo de rutas (`app-routing.module.ts`):

```typescript
import { MsalGuard } from '@azure/msal-angular';

const routes: Routes = [
  { path: 'perfil', component: PerfilComponent, canActivate: [MsalGuard] },
  // ... otras rutas
];
```

### 5.3. Inicia sesión y cierra sesión desde componentes

```typescript
import { MsalService } from '@azure/msal-angular';

constructor(private msalService: MsalService) {}

login() {
  this.msalService.loginRedirect();
}

logout() {
  this.msalService.logout();
}
```

### 5.4. Obtener información del usuario y tokens

```typescript
import { MsalService } from '@azure/msal-angular';

const account = this.msalService.instance.getActiveAccount();
const accessToken = await this.msalService.instance.acquireTokenSilent({
  scopes: ['user.read'],
  account,
});
```

### 5.5. Configuración recomendada en ngOnInit para MSAL Angular

En el ciclo de vida del componente, agrega la siguiente configuración para asegurar el correcto funcionamiento de la autenticación y la gestión de cuentas:

```typescript
ngOnInit(): void {
  // Tu lógica de inicialización
  this.authService.handleRedirectObservable().subscribe();
  this.isIframe = window !== window.parent && !window.opener; // Solo si no usas Angular Universal
  this.authService.instance.enableAccountStorageEvents(); // Opcional: gestiona eventos de cuentas en otras pestañas
  this.msalBroadcastService.msalSubject$
    .pipe(
      filter(
        (msg: EventMessage) =>
          msg.eventType === EventType.ACCOUNT_ADDED ||
          msg.eventType === EventType.ACCOUNT_REMOVED
      )
    )
    .subscribe((result: EventMessage) => {
      if (this.authService.instance.getAllAccounts().length === 0) {
        window.location.pathname = '/';
      } else {
        this.setLoginDisplay();
      }
    });

  this.msalBroadcastService.inProgress$
    .pipe(
      filter((status: InteractionStatus) => status === InteractionStatus.None),
      takeUntil(this._destroying$)
    )
    .subscribe(() => {
      this.setLoginDisplay();
      this.checkAndSetActiveAccount();
    });
}
```

> **Nota:** Esta configuración permite manejar correctamente el flujo de redirección, la gestión de cuentas en múltiples pestañas y la actualización del estado de autenticación en la UI. Es altamente recomendable incluirla en los componentes que gestionan el login/logout y el estado de sesión.

---

## 6. Acceso a APIs protegidas

El interceptor MSAL agrega automáticamente el token de acceso a las peticiones HTTP a recursos protegidos definidos en `protectedResourceMap`.

```typescript
this.http.get('https://graph.microsoft.com/v1.0/me').subscribe(data => {
  // datos del usuario
});
```

## 7. Configuración avanzada y buenas prácticas

- Puedes usar Factory Providers y APP_INITIALIZER para cargar la configuración de MSAL dinámicamente.
- Elige entre `Popup` y `Redirect` en `interactionType` según la experiencia de usuario deseada.
- Para aplicaciones con componentes standalone, revisa los ejemplos en `samples/msal-angular-samples/angular-standalone-sample`.
- Los tokens se almacenan en HTML5 Storage (por defecto en sessionStorage o localStorage). Protege tu app contra XSS ([OWASP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)).
- No confíes únicamente en los guards del cliente, valida permisos en el backend.
- Maneja el error `interaction_in_progress` suscribiéndote a `inProgress$` y filtrando por `InteractionStatus.None`.
- Muestra mensajes claros al usuario y registra los errores para análisis.
- Usa rutas dedicadas para el redirect y no las protejas con el guard.
- Suscríbete a eventos con `MsalBroadcastService` para actualizar la UI o manejar errores.
- Instrumenta eventos críticos para monitoreo y análisis.
- Agrega tu API al `protectedResourceMap` y solicita los scopes necesarios.
- MSAL soporta aplicaciones multi-tenant y B2C, revisa los ejemplos en la carpeta de samples.
- Revisa las guías de migración en `docs/` si actualizas de una versión mayor de MSAL Angular.

## 8. Flujo de autenticación explicado
1. El usuario accede a la aplicación y navega a una ruta protegida.
2. El guardia MSAL verifica si el usuario está autenticado.
3. Si no lo está, redirige al usuario a la página de inicio de sesión de Microsoft.
4. Tras iniciar sesión, Microsoft redirige al usuario de vuelta a la aplicación con un código de autorización.
5. La biblioteca MSAL intercambia ese código por un token de acceso y lo almacena.
6. Las peticiones HTTP a recursos protegidos incluyen automáticamente el token de acceso.
7. El usuario puede cerrar sesión, lo que elimina la sesión local y redirige a la página de cierre de sesión de Microsoft.

## 9. Seguridad
- Usa siempre HTTPS en producción.
- Configura correctamente los URI de redirección en Azure.
- Limita los permisos (scopes) a los mínimos necesarios.
- Utiliza el almacenamiento local para el caché de tokens.
- Protege tu sitio contra XSS y otros ataques.
- Valida siempre los permisos en el backend.

## 10. Manejo de errores
- Consulta la documentación de errores en `lib/msal-angular/docs/errors.md`.
- Maneja el error `interaction_in_progress` correctamente.
- Muestra mensajes claros y registra los errores.

## 11. Recursos adicionales
- Documentación oficial: https://learn.microsoft.com/en-us/azure/active-directory/develop/msal-overview
- Ejemplo completo: `/samples/msal-angular-samples/`
- Documentos específicos en `lib/msal-angular/docs/` para configuración, seguridad, errores, eventos, rendimiento, etc.
- Preguntas frecuentes: https://aka.ms/msaljs-faq

---

Con esta guía puedes implementar OAuth2 en Angular de forma segura y siguiendo las mejores prácticas recomendadas por Microsoft. Si tienes dudas, revisa los ejemplos en la carpeta `samples/msal-angular-samples` y la documentación en `lib/msal-angular/docs/` del repositorio.
