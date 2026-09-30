# Corte 6 — P0 continuidad de credenciales TyA → Firebase Auth

**Fecha:** 2026-07-30  
**Estado:** `P0_PROVEN_C6_CREDENTIAL_CONTINUITY_GAP__NO_PROVIDER_WRITE__NO_PRODUCTION`

## Hecho observado
La visual DEV protegida expone actualmente un formulario Firebase **Correo + Contraseña**. Ese formulario fue creado para demostrar identidad provider real, pero no corresponde al contrato operativo previo que debe conservarse para TyA.

La candidata/base funcional vigente conserva un contrato de acceso orientado a **Usuario + Contraseña** para shopper/evaluador y separación de accesos por perfil/rol. Firebase Auth debe quedar detrás de ese contrato, no sustituirlo por un correo visible obligatorio.

## Evidencia backend read-only
`app/docs/evidence/CORTE6-CREDENTIAL-CONTINUITY-READONLY-LATEST.json` demuestra en `cxorbia-backend-dev`:
- 340 documentos actualmente visibles en `tenants/tya/shoppers` para el inventario agregado;
- campos legacy `user/username/login`: 0;
- campos legacy `pass/password`: 0;
- colección canónica `tenants/tya/users`: 0 documentos;
- configuración tenant/login persistida: 0 claves detectadas;
- Firebase Auth: 17 usuarios, 17 password provider, 17 con identificador email.

Conclusión reproducible: el backend canónico **no contiene todavía la fuente de credenciales legacy** y las 17 cuentas Auth actuales son identidades DEV técnicas. Por tanto no existe base para exigir que Paula conozca esas credenciales ni para convertirlas en el login final.

## Clasificación P0
Es P0 para cutover porque:
1. bloquea la validación humana real con las credenciales operativas conocidas;
2. cambiaría el contrato de acceso de usuarios sin decisión funcional aprobada;
3. obligaría a reemitir credenciales o introducir correos nuevos sin necesidad;
4. si se deja pasar, genera reproceso exactamente al momento del cutover.

No afecta la materialización R17N, CX.data, Rules ni Hosting ya verificados.

## Decisión de raíz
- **No crear** una cuenta nueva con Gmail para resolver este gate.
- **No pedir** a Paula que use cuentas DEV ficticias como credenciales finales.
- **No revertir** Firebase Auth/claims/Rules: la identidad provider real sí es necesaria.
- Preservar el contrato visible `Usuario + Contraseña` y traducirlo internamente a Firebase Auth mediante un adapter de identidad.
- Recuperar credenciales legacy únicamente por **export/import controlado**; nunca conectar la base vieja al backend nuevo.
- Mantener credenciales/hashes fuera de repo, logs, artifacts y conversación.

## Fuente legacy documentada
La plataforma TyA previa manejaba acceso shopper mediante registros de `tya_shoppers_extra` con identificador de usuario y credencial. El flujo previo aceptaba usuario como identificador operativo y mantenía compatibilidad con datos de contacto. Esa fuente debe tratarse únicamente como origen de exportación, no como dependencia runtime.

## Estrategia de migración
1. Obtener export controlado de la fuente legacy de credenciales sin conectar proveedores.
2. Inventariar únicamente conteos/tipos: usuario presente, credencial presente, hash SHA-256 ya migrado vs credencial legacy aún no migrada, activo/inactivo, conflictos de username.
3. Construir un identificador interno Firebase que no obligue a mostrar correo al usuario.
4. Importar Auth preservando contraseña/hash cuando técnicamente sea compatible; conflictos pasan a revisión.
5. Mapear `authUid`/claims a `tenantId`, `projectIds`, rol y `shopperId` exacto.
6. El login visible sigue siendo `Usuario + Contraseña`; el adapter resuelve internamente el identificador Firebase.
7. Smoke por Admin/Ops/Cliente/Shopper y fail-closed de conflicto.
8. Solo después FREEZE Corte 6 → Agosto → cutover.

## Gate actual
`EXPORT/INVENTARIO CREDENCIALES LEGACY SOURCE-SAFE → PLAN AUTH IMPORT IDEMPOTENTE → AUTORIZACIÓN ÚNICA PROVIDER → IMPORT/READBACK → LOGIN USUARIO+CONTRASEÑA → SMOKE → FREEZE → AGOSTO`.

## Frontend / Claude
No pedir nueva candidata. Sí queda una corrección focalizada para el flujo de login antes de producción:
- conservar accesos configurables por rol/perfil;
- mostrar `Usuario` y `Contraseña`, no exigir correo como identificador visible;
- Firebase Auth/claims siguen siendo la autoridad real;
- nunca guardar password/token en localStorage;
- registro/autogeneración de credenciales debe usar una función real y validada; no depender de un helper indefinido.

## Clasificación
- **Reusable CXOrbia:** Auth adapter username→provider, import idempotente, claims/scopes, no email visible obligatorio.
- **Exclusivo cliente:** fuente legacy TyA y credenciales históricas existentes.
- **Claude/prototipo:** UX de login/registro focalizada, sin reescritura de módulos.
- **Academia:** acceso seguro, cambio de contraseña, recuperación y alcance por rol.
- **Sin impacto Claude:** inventarios source-safe, import/readback y evidencias.

## Estado seguro
En este diagnóstico adicional: provider writes=0; Auth writes=0; password changes=0; Firestore data writes=0; Rules deploy=0; Hosting deploy adicional=0; Storage/HR/legacy writes=0; merge=false; producción=false; PII/credenciales crudas exportadas=0.
