# Instrucciones para Debug: Botones no visibles en tabla

## Problema Identificado
Los botones (Editar y Activar/Desactivar) no aparecen, muy probablemente porque:
- ❌ El backend no está retornando datos
- ❌ Los datos no se están cargando correctamente
- ❌ El servicio tiene un problema

## Solución Rápida: Agregar Datos de Prueba

Para verificar que **la tabla funciona correctamente y solo falta cargar datos**, realiza esto:

### Paso 1: Abre `consult-user-profile.ts`

### Paso 2: Modifica el método `ngOnInit()` así:

```typescript
ngOnInit(): void {
  // DATOS DE PRUEBA - Descomenta para probar la tabla
  this.data = [
    { 
      nombre: 'GG-Rol AMP_Prod_Admin', 
      descripcion: 'Perfil de administración', 
      activo: true, 
      id: 1 
    },
    { 
      nombre: 'GG-Rol AMP_Prod_Analista', 
      descripcion: 'Perfil de analista', 
      activo: true, 
      id: 2 
    },
    { 
      nombre: 'GG-Rol AMP_Prod_Reintegrros', 
      descripcion: 'Perfil de reintegrros', 
      activo: true, 
      id: 3 
    },
    { 
      nombre: 'GG-Rol AMP_Prod_Autorización', 
      descripcion: 'Perfil de autorizaciones', 
      activo: true, 
      id: 4 
    },
    { 
      nombre: 'GG-Rol AMP_Prod_GestionPerfiles', 
      descripcion: 'Perfil de perfiles', 
      activo: true, 
      id: 5 
    }
  ];
  
  // Después de las pruebas, comenta la línea anterior
  // y descomenta la siguiente:
  // this.cargarPerfiles();
}
```

### Paso 3: Guarda y recarga la página en `http://localhost:4200/consultar-perfiles`

### ✅ Resultado Esperado
Deberías ver:
- ✅ Una tabla con 5 perfiles
- ✅ Columnas: Nombre | Descripción | Modificar | Activar/Desactivar
- ✅ **Botón rojo de editar (lápiz)** en cada fila
- ✅ **Toggle rojo/blanco** para activar/desactivar en cada fila

### Si VES los botones:
✅ **La tabla funciona correctamente**
- El problema está en la carga de datos desde el backend
- Revisa:
  1. ¿El backend está corriendo en `http://localhost:8081`?
  2. ¿El endpoint `/api/pensionados/profiles` existe?
  3. ¿Retorna datos en el formato correcto?

### Si NO ves los botones:
❌ **Hay un problema con la tabla o los componentes**
- Revisa la consola del navegador (F12 > Console)
- Busca errores de importación o compilación

---

## Verificar Backend Manualmente

Abre una terminal y ejecuta:

```bash
# Prueba de conexión al backend
curl -X GET "http://localhost:8081/api/pensionados/profiles?page=1&pageSize=10"
```

Deberías obtener una respuesta similar a:
```json
{
  "data": [
    {
      "id": 1,
      "name": "GG-Rol AMP_Prod_Admin",
      "description": "Perfil de administración",
      "active": true
    }
  ],
  "total": 5,
  "page": 1,
  "pageSize": 10
}
```

Si ves error `Connection refused`, el backend no está corriendo.

---

## Una vez resuelto:

Vuelve a `ngOnInit()` y cambia a:
```typescript
ngOnInit(): void {
  this.cargarPerfiles(); // Carga desde el backend
}
```

Elimina los datos de prueba.
