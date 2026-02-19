// ============================================================================
// EJEMPLO DE CONFIGURACIÓN DEL BACKEND PARA SAML
// ============================================================================
// Este archivo contiene ejemplos de configuración necesarios en el backend
// para que la autenticación SAML funcione correctamente con el frontend Angular
// ============================================================================

// 1. CONFIGURACIÓN CORS (CRÍTICO)
// Archivo: src/main/java/com/example/config/CorsConfig.java
package com.example.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:4200")  // URL exacta del frontend
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)  // CRÍTICO: Permite envío de cookies
                .maxAge(3600);
    }
}

// ============================================================================

// 2. CONFIGURACIÓN DE SEGURIDAD SAML
// Archivo: src/main/java/com/example/config/SecurityConfig.java
package com.example.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Habilitar CORS con la configuración personalizada
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Deshabilitar CSRF para desarrollo (en producción, configurar apropiadamente)
            .csrf(csrf -> csrf.disable())
            
            // Configurar autorización de peticiones
            .authorizeHttpRequests(auth -> auth
                // Permitir acceso sin autenticación a endpoints de auth
                .requestMatchers("/api/pensionados/auth/**").permitAll()
                .requestMatchers("/saml2/**").permitAll()
                
                // Requerir autenticación para todo lo demás
                .anyRequest().authenticated()
            )
            
            // Configurar login SAML
            .saml2Login(saml -> saml
                .defaultSuccessUrl("http://localhost:4200/custom-reports", true)
                .failureUrl("http://localhost:4200/login?error=true")
            )
            
            // Configurar logout SAML
            .saml2Logout(logout -> logout
                .logoutSuccessUrl("http://localhost:4200")
            );
        
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Origen permitido (debe ser exacto cuando allowCredentials es true)
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200"));
        
        // Métodos HTTP permitidos
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // Headers permitidos
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // CRÍTICO: Permitir credenciales (cookies)
        configuration.setAllowCredentials(true);
        
        // Registrar configuración para todas las rutas /api/**
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        
        return source;
    }
}

// ============================================================================

// 3. CONFIGURACIÓN DE SESIÓN Y COOKIES
// Archivo: src/main/java/com/example/config/SessionConfig.java
package com.example.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.session.web.http.CookieSerializer;
import org.springframework.session.web.http.DefaultCookieSerializer;

@Configuration
public class SessionConfig {
    
    @Bean
    public CookieSerializer cookieSerializer() {
        DefaultCookieSerializer serializer = new DefaultCookieSerializer();
        
        // Nombre de la cookie de sesión
        serializer.setCookieName("JSESSIONID");
        
        // SameSite=Lax permite cookies en navegación cross-site
        serializer.setSameSite("Lax");
        
        // HttpOnly para seguridad (no accesible desde JavaScript)
        serializer.setUseHttpOnlyCookie(true);
        
        // Secure=false para desarrollo local (true en producción con HTTPS)
        serializer.setUseSecureCookie(false);
        
        // Path de la cookie
        serializer.setCookiePath("/");
        
        return serializer;
    }
}

// ============================================================================

// 4. CONTROLADOR DE AUTENTICACIÓN
// Archivo: src/main/java/com/example/controller/AuthController.java
package com.example.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.saml2.provider.service.authentication.Saml2AuthenticatedPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pensionados/auth")
public class AuthController {
    
    /**
     * Endpoint para obtener información del usuario actual
     * Este endpoint es llamado por el frontend al cargar la aplicación
     */
    @GetMapping("/user/current")
    public ResponseEntity<Map<String, Object>> getCurrentUser(Authentication authentication) {
        
        // Verificar si el usuario está autenticado
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        // Extraer información del principal SAML
        Saml2AuthenticatedPrincipal principal = (Saml2AuthenticatedPrincipal) authentication.getPrincipal();
        
        // Construir respuesta con información del usuario
        Map<String, Object> user = new HashMap<>();
        user.put("username", principal.getName());
        user.put("displayName", principal.getFirstAttribute("displayName"));
        String role = determineUserRole(principal);
        user.put("role", role);
        user.put("roleDisplayName", getRoleDisplayName(role));
        user.put("permissions", determineUserPermissions(principal));
        
        return ResponseEntity.ok(user);
    }
    
    /**
     * Endpoint para cambiar el rol del usuario (para pruebas)
     */
    @PostMapping("/user/role")
    public ResponseEntity<Map<String, Object>> setUserRole(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        // En un entorno real, esto modificaría la sesión o base de datos
        String newRole = request.get("role");
        
        // Devolver usuario actualizado
        Map<String, Object> user = new HashMap<>();
        user.put("username", authentication.getName());
        user.put("displayName", authentication.getName());
        user.put("role", newRole);
        user.put("roleDisplayName", getRoleDisplayName(newRole));
        user.put("permissions", getPermissionsForRole(newRole));
        
        return ResponseEntity.ok(user);
    }
    
    /**
     * Determina el rol del usuario basado en atributos SAML
     */
    private String determineUserRole(Saml2AuthenticatedPrincipal principal) {
        // Extraer grupos o roles del atributo SAML
        List<Object> groups = principal.getAttribute("groups");
        
        if (groups != null && groups.contains("Administrators")) {
            return "ADMIN";
        } else if (groups != null && groups.contains("Managers")) {
            return "MANAGER";
        } else {
            return "USER";
        }
    }
    
    /**
     * Determina los permisos del usuario basado en su rol
     */
    private List<String> determineUserPermissions(Saml2AuthenticatedPrincipal principal) {
        String role = determineUserRole(principal);
        return getPermissionsForRole(role);
    }
    
    /**
     * Obtiene los permisos para un rol específico
     */
    private List<String> getPermissionsForRole(String role) {
        return switch (role) {
            case "ADMIN" -> List.of(
                "VIEW_REPORTS", 
                "CREATE_REPORTS", 
                "EDIT_REPORTS", 
                "DELETE_REPORTS",
                "MANAGE_USERS"
            );
            case "MANAGER" -> List.of(
                "VIEW_REPORTS", 
                "CREATE_REPORTS", 
                "EDIT_REPORTS"
            );
            default -> List.of("VIEW_REPORTS");
        };
    }
    
    /**
     * Obtiene el nombre de visualización del rol
     */
    private String getRoleDisplayName(String role) {
        return switch (role) {
            case "GG-Rol_AMP_Prod_Admin" -> "Administrador";
            case "GG-Rol_AMP_Prod_Analista" -> "Analista";
            case "ADMIN" -> "Administrador";
            case "MANAGER" -> "Gerente";
            default -> "Usuario";
        };
    }
    
    /**
     * Endpoint para redirigir después del callback SAML
     */
    @GetMapping("/forward-to-callback")
    public String forwardToCallback() {
        // Este endpoint recibe la respuesta SAML del IdP
        // Spring Security procesa automáticamente la respuesta
        return "redirect:http://localhost:4200/custom-reports";
    }
}

// ============================================================================

// 5. CONFIGURACIÓN DE PROPIEDADES (application.yml)
/*
spring:
  security:
    saml2:
      relyingparty:
        registration:
          saml-idp:
            assertingparty:
              metadata-uri: http://localhost:7000/metadata
              # O configurar manualmente:
              entity-id: dc1e0dfd-b388-47e2-a83a-8b120979b614
              single-sign-on:
                url: http://localhost:7000/saml/sso
                binding: POST
              verification:
                credentials:
                  - certificate-location: classpath:idp-public-cert.pem
            signing:
              credentials:
                - private-key-location: classpath:sp-private-key.pem
                  certificate-location: classpath:sp-public-cert.pem
            entity-id: urn:dc1e0dfd-b388-47e2-a83a-8b120979b614
            acs:
              location: http://localhost:8081/api/pensionados/auth/forward-to-callback
              binding: POST

server:
  port: 8081
  servlet:
    session:
      cookie:
        same-site: lax
        http-only: true
        secure: false  # true en producción con HTTPS
        path: /
*/

// ============================================================================

// 6. DEPENDENCIAS NECESARIAS (pom.xml)
/*
<dependencies>
    <!-- Spring Boot Starter Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Spring Boot Starter Security -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    
    <!-- Spring Security SAML2 -->
    <dependency>
        <groupId>org.springframework.security</groupId>
        <artifactId>spring-security-saml2-service-provider</artifactId>
    </dependency>
    
    <!-- Spring Session (opcional, para gestión de sesiones) -->
    <dependency>
        <groupId>org.springframework.session</groupId>
        <artifactId>spring-session-core</artifactId>
    </dependency>
</dependencies>
*/

// ============================================================================
// NOTAS IMPORTANTES:
// ============================================================================
// 1. El orden de configuración importa: CORS debe estar antes de CSRF
// 2. allowCredentials(true) requiere allowedOrigins específicos (no "*")
// 3. Las cookies deben tener SameSite=Lax o None para cross-site
// 4. En producción, usar HTTPS y Secure=true en las cookies
// 5. El endpoint /forward-to-callback debe coincidir con el acsUrl del IdP
// ============================================================================
