import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor para incluir credenciales (cookies) en todas las peticiones HTTP
 * Necesario para autenticación SAML que usa cookies de sesión
 */
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  // Clonar la petición y agregar withCredentials: true
  // Esto permite que las cookies de sesión se envíen con cada petición
  const clonedRequest = req.clone({
    withCredentials: true
  });

  return next(clonedRequest);
};
