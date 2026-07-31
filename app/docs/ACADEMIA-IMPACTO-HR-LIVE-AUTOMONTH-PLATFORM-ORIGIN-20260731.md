# Academia — HR viva, periodos automáticos y origen plataforma

**Fecha:** 2026-07-31  
**Estado:** `REUSABLE_PATTERN_DOCUMENTED__C6_SHOPPER_IDENTITY_P0_ADDED__NO_PRODUCTION`

## 1. HR viva y periodos automáticos
Una operación de campo no debe exigir configuración técnica mensual cuando el calendario operativo ya existe en una fuente viva.

Para CXOrbia:
- una pestaña mensual nueva validada por metadata provider crea/detecta el periodo automáticamente;
- metadata de tabs y lectura de filas son responsabilidades separables;
- el navegador refresca periódicamente y al recuperar foco;
- fallback de filas no puede probar por sí solo que una pestaña existe: registry provider manda;
- plataforma puede originar disponibilidad antes de HR;
- al aparecer HR, conciliar por IDs estables + origen/estado de sincronización; nunca por nombre.

## 2. Implementación validada en TyA
Remote DEV PASS técnico:
- 14 periodos /616 visitas /último2026-07;
- `tabRegistryAutoDiscovery=true`;
- `live_provider_metadata_auto_refresh`;
- Cloud Run/Hosting existentes redeployados una vez;
- producción intacta.

Ese PASS no cierra Corte6 porque la validación humana posterior detectó un P0 de identidad Shopper.

## 3. Julio/agosto
Julio puede mantener visitas pendientes en ejecución mientras agosto tiene visitas platform-origin antes de que existan tabs HR agosto.

`PLATAFORMA ORIGINA → assignmentSource=platform → HR APARECE/REFLEJA → RECONCILIA → NO DUPLICA`.

`HR ASIGNA → PLATAFORMA DETECTA → RETIRA DE DISPONIBLES → RECONCILIA → NO DUPLICA`.

## 4. Lectura vs edición
`READ CAPABILITY != WRITE POLICY`.

- Public read puede ser una decisión operativa válida.
- Provider authenticated read puede coexistir y ser preferente.
- Public write es un riesgo separado.
- Un gate de hardening productivo no debe bloquear artificialmente DEV read-only.

## 5. Lección nueva: source-safe no sustituye identidad autenticada
La visual demostró que un preview `display_name_only` puede validar nombres y seguir siendo insuficiente para validar el ciclo Shopper.

Regla reusable:
`CREDENCIAL → AUTH → CLAIMS/SCOPE → SHOPPER ID ESTABLE → PERFIL/ASIGNACIONES PROPIAS`.

No declarar listo un portal si entra con `shopperId=null`, aunque el shell y los datos agregados carguen.

## 6. Privacidad por rol
- preview source-safe: puede enmascarar PII;
- Superadmin/Admin autenticado: recibe datos operativos completos necesarios para su función;
- Shopper: solo su propio perfil/scope;
- Cliente/marca: no recibe PII shopper.

Proteger una fuente pública no equivale a ocultar datos al Superadmin autorizado.

## 7. Credenciales
Separar:
- username operativo;
- contraseña inicial/temporal;
- contraseña vigente;
- recuperación/reset.

Firebase Auth no devuelve la contraseña vigente. No conservar passwords recuperables solo para mostrarlos. Un patrón inicial TyA puede preservarse, pero reset/rotación se audita y se gatea.

## 8. Perfil, histórico y KPI
Un perfil operativo consolidado puede combinar fuentes autorizadas mediante contratos y trazabilidad. El histórico se une por identificador estable, no por nombre.

KPI operacional requiere drill a la evidencia que lo compone y facetas canónicas de estado.

## 9. Legacy/current platform
Recuperar datos útiles mediante:
`EXPORT → PARSER → NORMALIZACIÓN → MATCH ESTABLE → REVIEW → DELTA → WRITE GATED`.

Nunca conectar la base vieja como dependencia de runtime.

## 10. One-shot de infraestructura
El gate de deploy mantiene contadores persistidos; una autorización consumida no puede reutilizarse. El P0 humano posterior requiere un nuevo gate si hace falta otro deploy.

## 11. Contenido para manuales/cursos
- fuente viva vs snapshot;
- detección automática de periodos;
- provider registry vs lectura de filas;
- public read/public write;
- source-safe vs consola autenticada;
- login Shopper y shopperId estable;
- credencial inicial vs vigente/reset;
- perfil consolidado;
- KPI drill e histórico;
- platform-origin antes de HR;
- conciliación bidireccional;
- fail-closed y revisión de conflictos.

Complemento: `ACADEMIA-IMPACTO-C6-SHOPPER-PROFILE-IDENTITY-VISUAL-FAIL-20260731.md`.

## 12. Seguridad
Documentación únicamente en este ajuste. Sin provider writes, deploy, merge ni producción.
