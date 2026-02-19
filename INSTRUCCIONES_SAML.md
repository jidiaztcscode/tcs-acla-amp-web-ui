# 🔐 Instrucciones para Configurar Autenticación SAML

## 📋 Resumen del Problema

Los endpoints devolvían **401 Unauthorized** porque las peticiones HTTP no incluían las cookies de sesión establecidas por la autenticación SAML.

## ✅ Solución Implementada

### Cambios en el Frontend (Angular)

1. **Interceptor de Credenciales** - [`credentials.interceptor.ts`](src/app/shared/interceptors/credentials.interceptor.ts)
   - Agrega `withCredentials: true` a todas las peticiones HTTP
   - Permite que las cookies de sesión se envíen automáticamente

2. **Configuración Global** - [`app.config.ts`](src/app/app.config.ts)
   - Registra el interceptor globalmente en la aplicación

3. **Servicio de Autenticación Mejorado** - [`auth.service.ts`](src/app/shared/services/auth/auth.service.ts)
   - Métodos para iniciar login SAML
   - Método para cerrar sesión
   - Manejo de errores 401

4. **Guard de Autenticación** - [`auth.guard.ts`](src/app/shared/guards/auth.guard.ts)
   - Protege rutas que requieren autenticación
   - Redirige automáticamente al login SAML

5. **Página de Prueba** - [`auth-test.component.ts`](src/app/feature/pages/auth-test/auth-test.component.ts)
   - Interfaz para probar la autenticación
   - Muestra información del usuario
   - Permite iniciar/cerrar sesión

## 🚀 Pasos para Configurar

### Paso 1: Verificar el Frontend

Los cambios en el frontend ya están aplicados. Verifica que los archivos existan:

```bash
# Verificar que los archivos fueron creados
dir src\app\shared\interceptors\credentials.interceptor.ts
dir src\app\shared\guards\auth.guard.ts
dir src\app\feature\pages\auth-test\auth-test.component.ts
```

### Paso 2: Configurar el Backend

**CRÍTICO**: El backend debe estar configurado correctamente. Ver [`backend-config-example.java`](backend-config-example.java) para ejemplos completos.

#### 2.1 Configuración CORS

El backend DEBE permitir credenciales:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:4200")  // URL exacta
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)  // ⚠️ CRÍTICO
                .maxAge(3600);
    }
}
```

#### 2.2 Configuración de Cookies

```java
@Bean
public CookieSerializer cookieSerializer() {
    DefaultCookieSerializer serializer = new DefaultCookieSerializer();
    serializer.setCookieName("JSESSIONID");
    serializer.setSameSite("Lax");  // Permite cookies cross-site
    serializer.setUseHttpOnlyCookie(true);
    serializer.setUseSecureCookie(false);  // false para desarrollo
    return serializer;
}
```

#### 2.3 Endpoint de Usuario Actual

```java
@GetMapping("/api/pensionados/auth/user/current")
public ResponseEntity<Map<String, Object>> getCurrentUser(Authentication auth) {
    if (auth == null || !auth.isAuthenticated()) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
    
    Saml2AuthenticatedPrincipal principal = (Saml2AuthenticatedPrincipal) auth.getPrincipal();
    
    Map<String, Object> user = new HashMap<>();
    user.put("username", principal.getName());
    user.put("email", principal.getFirstAttribute("email"));
    user.put("role", "USER");
    user.put("permissions", List.of("VIEW_REPORTS"));
    
    return ResponseEntity.ok(user);
}
```

### Paso 3: Iniciar el IdP SAML

Ejecuta el comando para iniciar el simulador de directorio activo:

```bash
saml-idp --acsUrl "http://localhost:8081/api/pensionados/auth/forward-to-callback" --audience "urn:dc1e0dfd-b388-47e2-a83a-8b120979b614" --issuer "dc1e0dfd-b388-47e2-a83a-8b120979b614" --privatekey idp-private-key.pem --certificate idp-public-cert.pem
```

**Nota**: El IdP debe estar corriendo en el puerto 7000 (por defecto).

### Paso 4: Iniciar el Backend

```bash
# Navega al directorio del backend y ejecuta
mvn spring-boot:run
# o
./gradlew bootRun
```

Verifica que esté corriendo en `http://localhost:8081`

### Paso 5: Iniciar el Frontend

```bash
# En el directorio del proyecto Angular
npm start
# o
ng serve
```

Verifica que esté corriendo en `http://localhost:4200`

### Paso 6: Probar la Autenticación

#### Opción A: Página de Prueba (Recomendado)

1. Abre el navegador en: `http://localhost:4200/auth-test`
2. Verás el estado de autenticación actual
3. Haz clic en "Iniciar sesión con SAML"
4. Serás redirigido al IdP SAML
5. Ingresa credenciales (usuario: `saml`, contraseña: `saml`)
6. Deberías volver a la página de prueba con la sesión activa

#### Opción B: Ruta de Reportes

1. Abre el navegador en: `http://localhost:4200/custom-reports`
2. Si no estás autenticado, deberías ver errores 401
3. Navega a `http://localhost:4200/auth-test` para autenticarte
4. Vuelve a `http://localhost:4200/custom-reports`
5. Los datos deberían cargarse correctamente

## 🔍 Verificación

### 1. Verificar Cookies en el Navegador

1. Abre DevTools (F12)
2. Ve a la pestaña **Application** → **Cookies**
3. Deberías ver una cookie `JSESSIONID` para `localhost:8081`

### 2. Verificar Headers HTTP

1. Abre DevTools (F12)
2. Ve a la pestaña **Network**
3. Haz una petición a `/api/pensionados/auth/user/current`
4. En **Request Headers** deberías ver:
   ```
   Cookie: JSESSIONID=...
   ```
5. En **Response Headers** deberías ver:
   ```
   Access-Control-Allow-Origin: http://localhost:4200
   Access-Control-Allow-Credentials: true
   ```

### 3. Verificar Respuestas

Las peticiones a estos endpoints deben devolver **200 OK**:
- `http://localhost:8081/api/pensionados/auth/user/current`
- `http://localhost:8081/api/pensionados/api/reportes`

## 🐛 Solución de Problemas

### Error: 401 Unauthorized persiste

**Causa**: Las cookies no se están enviando o el backend no las está aceptando.

**Solución**:
1. Verifica que el interceptor esté registrado en [`app.config.ts`](src/app/app.config.ts)
2. Verifica que el backend tenga `allowCredentials(true)` en CORS
3. Limpia las cookies del navegador y vuelve a autenticarte
4. Verifica en DevTools que la cookie `JSESSIONID` exista

### Error: CORS policy

**Causa**: El backend no está configurado correctamente para CORS.

**Solución**:
1. Verifica que `allowedOrigins` sea exactamente `"http://localhost:4200"` (no `"*"`)
2. Verifica que `allowCredentials(true)` esté configurado
3. Reinicia el backend después de cambiar la configuración

### Error: Cookie no se establece

**Causa**: Configuración incorrecta de cookies en el backend.

**Solución**:
1. Verifica que `SameSite` sea `"Lax"` o `"None"`
2. Si usas `"None"`, debes usar HTTPS o configurar `Secure=false`
3. Verifica que el `Path` de la cookie sea `/`

### Error: Redirige infinitamente

**Causa**: El flujo de autenticación SAML no se completa correctamente.

**Solución**:
1. Verifica que el `acsUrl` en el comando saml-idp coincida con el backend
2. Verifica que el backend tenga configurado el endpoint `/forward-to-callback`
3. Verifica que el `defaultSuccessUrl` en Spring Security sea correcto

## 📚 Recursos Adicionales

- **Guía Completa**: [`SAML_SETUP_GUIDE.md`](SAML_SETUP_GUIDE.md)
- **Ejemplos de Backend**: [`backend-config-example.java`](backend-config-example.java)
- **Documentación SAML**: https://docs.spring.io/spring-security/reference/servlet/saml2/login/index.html

## 📝 Checklist de Configuración

- [ ] Frontend: Interceptor registrado en `app.config.ts`
- [ ] Backend: CORS configurado con `allowCredentials(true)`
- [ ] Backend: Cookies configuradas con `SameSite=Lax`
- [ ] Backend: Endpoint `/user/current` implementado
- [ ] Backend: Spring Security SAML configurado
- [ ] IdP SAML corriendo en puerto 7000
- [ ] Backend corriendo en puerto 8081
- [ ] Frontend corriendo en puerto 4200
- [ ] Cookies visibles en DevTools después de login
- [ ] Peticiones incluyen header `Cookie: JSESSIONID=...`
- [ ] Respuestas incluyen headers CORS correctos
- [ ] Endpoints devuelven 200 OK después de autenticación

## 🎯 Próximos Pasos

1. **Configura el backend** según [`backend-config-example.java`](backend-config-example.java)
2. **Reinicia todos los servicios** (IdP, Backend, Frontend)
3. **Limpia las cookies** del navegador
4. **Prueba en** `http://localhost:4200/auth-test`
5. **Verifica** que los endpoints devuelvan 200 OK

## 💡 Notas Importantes

- **Desarrollo vs Producción**: En producción, usa HTTPS y `Secure=true` en las cookies
- **Seguridad**: No deshabilites CSRF en producción sin una alternativa
- **Dominios**: En producción, configura los dominios correctos en CORS
- **Certificados**: En producción, usa certificados válidos para SAML

---

**¿Necesitas ayuda?** Revisa la sección de Solución de Problemas o consulta [`SAML_SETUP_GUIDE.md`](SAML_SETUP_GUIDE.md) para más detalles.
