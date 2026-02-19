# Guía de Configuración SAML para Simulación de Directorio Activo

## Problema Resuelto
Los endpoints devolvían 401 Unauthorized porque las peticiones HTTP no incluían las cookies de sesión establecidas por SAML.

## Cambios Realizados en el Frontend

### 1. Interceptor de Credenciales
Se creó [`credentials.interceptor.ts`](src/app/shared/interceptors/credentials.interceptor.ts) que agrega `withCredentials: true` a todas las peticiones HTTP. Esto permite que las cookies de sesión se envíen automáticamente.

### 2. Configuración de la Aplicación
Se actualizó [`app.config.ts`](src/app/app.config.ts) para registrar el interceptor globalmente.

## Configuración Requerida en el Backend

Para que la autenticación SAML funcione correctamente, el backend debe estar configurado así:

### 1. Configuración CORS (CRÍTICO)
El backend debe permitir credenciales en las respuestas CORS:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:4200")  // URL del frontend
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)  // CRÍTICO: Permite cookies
                .maxAge(3600);
    }
}
```

**IMPORTANTE**: Cuando `allowCredentials(true)` está habilitado, NO puedes usar `allowedOrigins("*")`. Debes especificar el origen exacto.

### 2. Configuración de Sesión
Asegúrate de que las cookies de sesión estén configuradas correctamente:

```java
@Configuration
public class SessionConfig {
    
    @Bean
    public CookieSerializer cookieSerializer() {
        DefaultCookieSerializer serializer = new DefaultCookieSerializer();
        serializer.setCookieName("JSESSIONID");
        serializer.setSameSite("Lax");  // Permite cookies cross-site
        serializer.setUseHttpOnlyCookie(true);  // Seguridad
        serializer.setUseSecureCookie(false);  // false para desarrollo local
        return serializer;
    }
}
```

### 3. Configuración de Seguridad SAML
Tu configuración de Spring Security debe incluir:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())  // O configurar CSRF apropiadamente
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/pensionados/auth/**").permitAll()
                .anyRequest().authenticated()
            )
            .saml2Login(saml -> saml
                .defaultSuccessUrl("http://localhost:4200/custom-reports", true)
            )
            .saml2Logout(logout -> logout
                .logoutSuccessUrl("http://localhost:4200")
            );
        
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
```

### 4. Endpoint de Usuario Actual
El endpoint `/api/pensionados/auth/user/current` debe devolver información del usuario autenticado:

```java
@RestController
@RequestMapping("/api/pensionados/auth")
public class AuthController {
    
    @GetMapping("/user/current")
    public ResponseEntity<UserDTO> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        // Extraer información del usuario desde SAML
        Saml2AuthenticatedPrincipal principal = (Saml2AuthenticatedPrincipal) authentication.getPrincipal();
        
        UserDTO user = new UserDTO();
        user.setUsername(principal.getName());
        user.setEmail(principal.getFirstAttribute("email"));
        user.setRole(determineUserRole(principal));
        user.setPermissions(determineUserPermissions(principal));
        
        return ResponseEntity.ok(user);
    }
}
```

## Flujo de Autenticación SAML

1. **Usuario accede a la aplicación**: `http://localhost:4200/custom-reports`
2. **Frontend detecta que no hay usuario**: El [`AuthService`](src/app/shared/services/auth/auth.service.ts) intenta cargar el usuario actual
3. **Si no está autenticado (401)**: El usuario debe ser redirigido al login SAML
4. **Login SAML**: 
   - Usuario es redirigido al IdP SAML (tu comando saml-idp)
   - Usuario ingresa credenciales en el IdP
   - IdP envía respuesta SAML al backend: `http://localhost:8081/api/pensionados/auth/forward-to-callback`
5. **Backend procesa SAML**: 
   - Valida la respuesta SAML
   - Crea sesión de usuario
   - Establece cookie de sesión (JSESSIONID)
   - Redirige al frontend
6. **Frontend hace peticiones**: 
   - Todas las peticiones incluyen la cookie de sesión (gracias al interceptor)
   - Backend valida la sesión y permite el acceso

## Comando SAML IdP

Tu comando actual:
```bash
saml-idp --acsUrl "http://localhost:8081/api/pensionados/auth/forward-to-callback" --audience "urn:dc1e0dfd-b388-47e2-a83a-8b120979b614" --issuer "dc1e0dfd-b388-47e2-a83a-8b120979b614" --privatekey idp-private-key.pem --certificate idp-public-cert.pem
```

Asegúrate de que:
- El IdP esté corriendo antes de intentar autenticarte
- Los certificados existan y sean válidos
- El `acsUrl` coincida con la configuración del backend

## Verificación

### 1. Verificar que el interceptor funciona
Abre las DevTools del navegador → Network → Selecciona una petición → Headers:
- Debe aparecer `Cookie: JSESSIONID=...`
- En la petición debe aparecer `credentials: include`

### 2. Verificar CORS en el backend
En las respuestas del backend debe aparecer:
```
Access-Control-Allow-Origin: http://localhost:4200
Access-Control-Allow-Credentials: true
```

### 3. Probar el flujo completo
1. Limpia las cookies del navegador
2. Accede a `http://localhost:4200/custom-reports`
3. Deberías ser redirigido al IdP SAML
4. Después de autenticarte, deberías volver al frontend con sesión activa
5. Las peticiones a `/api/pensionados/auth/user/current` y `/api/pensionados/api/reportes` deben devolver 200 OK

## Solución de Problemas

### Error: "The 'Access-Control-Allow-Origin' header contains multiple values"
- Verifica que solo tengas UNA configuración CORS (no en múltiples lugares)

### Error: "Credentials flag is 'true', but the 'Access-Control-Allow-Credentials' header is ''"
- El backend no está configurado con `allowCredentials(true)`

### Error: 401 después de autenticación exitosa
- Verifica que la cookie se esté estableciendo correctamente
- Verifica que el dominio de la cookie sea correcto
- Verifica que `SameSite` esté configurado como "Lax" o "None"

### Error: Cookie no se envía
- Verifica que el interceptor esté registrado correctamente
- Verifica en DevTools que `withCredentials` sea `true`

## Próximos Pasos

1. **Configura el backend** según las instrucciones anteriores
2. **Reinicia ambos servidores** (frontend y backend)
3. **Limpia las cookies** del navegador
4. **Prueba el flujo completo** de autenticación

## Archivos Modificados

- ✅ [`src/app/shared/interceptors/credentials.interceptor.ts`](src/app/shared/interceptors/credentials.interceptor.ts) - Nuevo interceptor
- ✅ [`src/app/app.config.ts`](src/app/app.config.ts) - Registra el interceptor
- 📝 Backend - Requiere configuración CORS y sesión (ver arriba)
