// Configuración de MSAL para Angular Standalone
import { PublicClientApplication, BrowserCacheLocation, InteractionType, LogLevel } from '@azure/msal-browser';
import { MSAL_INSTANCE, MSAL_INTERCEPTOR_CONFIG, MSAL_GUARD_CONFIG, MsalInterceptorConfiguration, MsalGuardConfiguration, MsalService, MsalBroadcastService, MsalGuard, MsalInterceptor } from '@azure/msal-angular';
import { Provider } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

export function loggerCallback(logLevel: LogLevel, message: string) {
    console.log(message);
}

export const msalInstance = new PublicClientApplication({
    auth: {
        clientId: '37053f6d-68a3-4576-b778-565fa9cab6b4', // Reemplaza por tu Client ID
        authority: 'https://login.microsoftonline.com/d36775fa-f481-4695-86f4-41432c8f57af', // Reemplaza por tu Authority
        redirectUri: 'http://localhost:4200',
    },
    cache: {
        cacheLocation: BrowserCacheLocation.LocalStorage,
    },
    system: {
        allowPlatformBroker: false, // Disables WAM Broker
        loggerOptions: {
            loggerCallback,
            logLevel: LogLevel.Info,
            piiLoggingEnabled: false,
        },
    },
});

export function MSALInstanceFactory() {
    return msalInstance;
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
    // En desarrollo local, no protejamos la API del backend
    // En otros ambientes, proteger con MSAL
    const isLocalDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    const protectedResourceMap = new Map<string, Array<string>>([
        ['https://graph.microsoft.com/v1.0/me', ['user.read']],
    ]);
    
    // Solo agregar protección para backend en ambientes no locales
    if (!isLocalDevelopment) {
        protectedResourceMap.set('http://localhost:8081/api/pensionados/**', ['api://37053f6d-68a3-4576-b778-565fa9cab6b4/access-as-user']);
    }
    
    return {
        interactionType: InteractionType.Redirect,
        protectedResourceMap,
    };
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
    return {
        interactionType: InteractionType.Redirect,
        authRequest: {
            scopes: ['user.read'],
        },
        loginFailedRoute: '/login-failed',
    };
}

export const msalProviders: Provider[] = [
    {
        provide: MSAL_INSTANCE,
        useFactory: MSALInstanceFactory,
    },
    {
        provide: MSAL_INTERCEPTOR_CONFIG,
        useFactory: MSALInterceptorConfigFactory,
    },
    {
        provide: MSAL_GUARD_CONFIG,
        useFactory: MSALGuardConfigFactory,
    },
    {
        provide: HTTP_INTERCEPTORS,
        useClass: MsalInterceptor,
        multi: true,
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService,
];
