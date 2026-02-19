# Arquitectura limpia por capas: Domain y Data

Este documento describe una propuesta de arquitectura limpia (Clean Architecture) para la HU de Consulta, adición y modificación de afiliaciones, aplicando separación por capas, especialmente enfocada en las capas **Domain** y **Data**.

---

## 1. Estructura de carpetas sugerida

```
src/
  app/
    domain/
      models/
        afiliacion.model.ts
        tipo-identificacion.model.ts
        pagador.model.ts
      repositories/
        afiliacion.repository.ts
      use-cases/
        consultar-afiliaciones.usecase.ts
        agregar-afiliacion.usecase.ts
        modificar-afiliacion.usecase.ts
    data/
      datasources/
        afiliacion.datasource.ts
      repositories/
        afiliacion.repository.impl.ts
    feature/
      pages/
      components/
      services/ (solo orquestadores o adaptadores)
    shared/
      ...
```

---

## 2. Descripción de capas

### Domain
- **models/**: Entidades y objetos de valor del dominio (ej: `Afiliacion`, `TipoIdentificacion`).
- **repositories/**: Interfaces que definen los contratos para acceder a los datos (ej: `AfiliacionRepository`).
- **use-cases/**: Lógica de negocio pura, orquestada en casos de uso (ej: `ConsultarAfiliacionesUseCase`).

### Data
- **datasources/**: Implementaciones concretas para acceder a fuentes de datos (API REST, BD, etc).
- **repositories/**: Implementaciones de los repositorios del dominio, que usan los datasources.

### Feature/UI
- **pages/** y **components/**: Presentación y lógica de interacción.
- **services/**: Orquestadores/adaptadores para conectar UI con los casos de uso.

---

## 3. Ejemplo de flujo para "Consultar afiliaciones"

1. **UI** llama a un servicio de aplicación.
2. El servicio invoca el **caso de uso** (`ConsultarAfiliacionesUseCase`).
3. El caso de uso usa el **repositorio** del dominio (`AfiliacionRepository`).
4. El repositorio está implementado en la capa **data** y accede al **datasource** (API, BD).
5. El resultado fluye de regreso a la UI.

---

## 4. Ventajas
- Separación clara de responsabilidades.
- Fácil de testear y mantener.
- Permite cambiar la fuente de datos sin afectar la lógica de negocio.

---

## 5. Referencias
- [Clean Architecture - Robert C. Martin](https://8thlight.com/blog/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Angular Clean Architecture Example](https://medium.com/@tomastrajan/clean-architecture-with-angular-4b9089d3c5b7)

---

Este documento puede ser extendido con ejemplos de código y convenciones específicas según avance el desarrollo.
