# 🚨 Referencia Rápida - Solución de Errores 401

## ⚡ Solución Rápida (5 minutos)

### 1. Verifica que el interceptor esté activo
```typescript
// src/app/app.config.ts debe tener:
import { credentialsInterceptor } from './shared/interceptors/credentials.interceptor';

provideHttpClient(
  withInterceptors([credentialsInterceptor])
)
```

### 2. Verifica CORS en el backend
```java
// Backend debe tener:
.allowedOrigins("http://localhost:4200")  // NO usar "*"
.allowCredentials(true)                    // CRÍTICO
```

### 3. Verifica las cookies
1. Abre DevTools (F12) → Application → Cookies
2. Debe existir: `JSESSIONID` para `localhost:8081`
3. Si no existe, autentica en: `http://localhost:4200/auth-test`

### 4. Reinicia todo
```bash
# Terminal 1: IdP SAML
saml-idp --acsUrl "http://localhost:8081/api/pensionados/auth/forward-to-callback" --audience "urn:dc1e0dfd-b388-47e2-a83a-8b120979b614" --issuer "dc1e0dfd-b388-47e2-a83a-8b120979b614" --privatekey idp-private-key.pem --certificate idp-public-cert.pem

# Terminal 2: Backend
mvn spring-boot:run

# Terminal 3: Frontend
npm start
```

## 🔍 Diagnóstico Rápido

### Síntoma: 401 en `/auth/user/current`

| Verificar | Cómo | Solución |
|-----------|------|----------|
| **Cookie existe** | DevTools → Application → Cookies | Autentica en `/auth-test` |
| **Cookie se envía** | DevTools → Network → Request Headers | Verifica interceptor en `app.config.ts` |
| **CORS permite credentials** | DevTools → Network → Response Headers | Backend: `allowCredentials(true)` |
| **Backend autentica** | Logs del backend | Verifica configuración SAML |

### Síntoma: CORS error

```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Causa**: Backend no permite credenciales o usa `allowedOrigins("*")`

**Solución**:
```java
// Backend - CorsConfig.java
.allowedOrigins("http://localhost:4200")  // Origen exacto
.allowCredentials(true)                    // Permitir cookies
```

### Síntoma: Cookie no se establece

**Causa**: Configuración incorrecta de cookies en el backend

**Solución**:
```java
// Backend - SessionConfig.java
serializer.setSameSite("Lax");        // Permite cross-site
serializer.setUseSecureCookie(false); // false para HTTP local
```

## 📋 Checklist de 2 Minutos

```
Frontend:
✓ Interceptor registrado en app.config.ts
✓ AuthService tiene método loginWithSAML()
✓ npm start ejecutándose en puerto 4200

Backend:
✓ CORS: allowCredentials(true)
✓ CORS: allowedOrigins("http://localhost:4200")
✓ Cookie: SameSite=Lax
✓ Endpoint /user/current implementado
✓ Backend corriendo en puerto 8081

IdP SAML:
✓ saml-idp corriendo en puerto 7000
✓ Certificados existen (idp-private-key.pem, idp-public-cert.pem)

Navegador:
✓ Cookies limpias (Ctrl+Shift+Del)
✓ DevTools abierto para debug
```

## 🎯 Flujo de Prueba Rápido

1. **Limpia cookies**: Ctrl+Shift+Del → Cookies
2. **Abre**: `http://localhost:4200/auth-test`
3. **Click**: "Iniciar sesión con SAML"
4. **Login**: usuario=`saml`, password=`saml`
5. **Verifica**: Debe mostrar "✅ Usuario autenticado"
6. **Prueba**: `http://localhost:4200/custom-reports`

## 🔧 Comandos Útiles

### Ver cookies en consola del navegador
```javascript
console.log(document.cookie);
```

### Probar endpoint manualmente
```bash
# Sin autenticación (debe dar 401)
curl http://localhost:8081/api/pensionados/auth/user/current

# Con cookie (debe dar 200)
curl -b "JSESSIONID=TU_SESSION_ID" http://localhost:8081/api/pensionados/auth/user/current
```

### Verificar CORS
```bash
curl -H "Origin: http://localhost:4200" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:8081/api/pensionados/auth/user/current
```

## 📞 Ayuda Adicional

- **Guía completa**: [`INSTRUCCIONES_SAML.md`](INSTRUCCIONES_SAML.md)
- **Ejemplos backend**: [`backend-config-example.java`](backend-config-example.java)
- **Guía detallada**: [`SAML_SETUP_GUIDE.md`](SAML_SETUP_GUIDE.md)

## 🎨 Código Mínimo Backend

```java
// CorsConfig.java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:4200")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}

// SessionConfig.java
@Configuration
public class SessionConfig {
    @Bean
    public CookieSerializer cookieSerializer() {
        DefaultCookieSerializer serializer = new DefaultCookieSerializer();
        serializer.setSameSite("Lax");
        serializer.setUseSecureCookie(false);
        return serializer;
    }
}

// AuthController.java
@RestController
@RequestMapping("/api/pensionados/auth")
public class AuthController {
    @GetMapping("/user/current")
    public ResponseEntity<Map<String, Object>> getCurrentUser(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Map<String, Object> user = new HashMap<>();
        user.put("username", auth.getName());
        user.put("role", "USER");
        user.put("permissions", List.of("VIEW_REPORTS"));
        return ResponseEntity.ok(user);
    }
}
```

---

**💡 Tip**: Si después de seguir estos pasos aún tienes problemas, revisa los logs del backend para ver errores específicos de SAML.
