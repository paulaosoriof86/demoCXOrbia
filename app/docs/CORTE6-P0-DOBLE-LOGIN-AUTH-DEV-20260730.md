# Corte 6 — P0 doble login Auth DEV: causa raíz corregida en rama

**Fecha:** 2026-07-30  
**Estado:** `P0_FIXED_IN_BRANCH_STATIC_PASS__PENDING_SINGLE_DEV_REDEPLOY_AUTH`

## Hecho observado y decisión
El Hosting DEV publicado mostró una pantalla separada **“Acceso seguro”** antes del login normal TyA/CXOrbia. La visual de Paula fue evidencia suficiente para declarar ese build **NO APROBADO**. No se requiere repetir esa prueba ni compartir contraseña.

## Causa raíz histórica
`app/core/backend-browser-auth.js` había convertido Firebase Auth en una UI paralela: creaba `#cxBackendAuthGate`, interceptaba `CX.app.showLogin()`, limpiaba `CX.session` y forzaba un flujo interactivo separado. `backend-config-preview-dev.js` usaba `interactive-session`. Firebase no requería esta segunda pantalla; fue un desvío de implementación.

## Corrección aplicada
La rama viva ya implementa la solución de raíz:
1. se eliminó el gate/overlay backend separado;
2. se conserva el login normal tenant-aware como único punto visible;
3. si hace falta autenticación real, `Usuario + Contraseña` se inserta dentro de la misma tarjeta del producto;
4. una sesión Firebase válida se restaura silenciosamente mediante `Auth.Persistence.SESSION` + estado Auth;
5. no se limpia la sesión por rutina en carga;
6. logout invalida Firebase y CX session;
7. se preservan namespaces `staff/shopper`, claims y fail-closed por tenant/rol/proyecto/shopper;
8. el identificador Firebase interno continúa oculto.

Archivos corregidos:
- `app/core/backend-browser-auth.js`;
- `app/core/backend-config-preview-dev.js`;
- `tools/release/cxorbia-corte6-credential-continuity-hosting-prepare.mjs`;
- `.github/workflows/cxorbia-corte6-credential-continuity-hosting.yml`.

Commits principales:
- `e95e8a9662373183ec17186831cf81b89094515a`;
- `32aee807d4c48760679267e1f8cd577d4681f4ea`;
- `f3aa90cc0f765beafdfa90e5b55d953239488746`;
- `e0b98140744135361f0d1d000ce31435b7ea59d2`.

## Gate estático reproducible
Se reutilizó el workflow existente sin abrir nueva ruta. El request de Hosting anterior permanece consumido y fue marcado únicamente para **revalidación estática sin provider writes**.

Commit `790d4d514b8e7b4630063ebf2aebba5997e3ec26` obtuvo:
`success · cxorbia/corte6-credential-continuity-hosting/PREPARED_C6_SINGLE_LOGIN_HOSTING_NO_EXECUTE`.

El gate valida sintaxis, marcadores del nuevo flujo, `product-login-session` y ausencia del gate antiguo. Como la autorización anterior estaba consumida, no cargó service account ni ejecutó deploy.

## Qué NO se reabre
- import Auth91/91 + readback PASS;
- hashes/passwords legacy;
- namespaces staff/shopper;
- claims/Rules;
- R17N1,406/1,406;
- Corte5 CX.data;
- Corte3 frozen;
- histórico hasta julio.

## Estado del Hosting
El código corregido **todavía no está publicado**. El Hosting DEV actual sigue sirviendo el build rechazado. No pedir a Paula que lo pruebe otra vez antes del redeploy.

## Siguiente bloque exacto
`AUTORIZACIÓN ÚNICA DE REDEPLOY DEL MISMO HOSTING DEV cxorbia-backend-dev/cxorbia-dev → PRECHECK SINGLE-LOGIN → DEPLOY1 → SMOKE REMOTO → VALIDACIÓN VISUAL PAULA → FREEZE CORTE6 → AGOSTO DELTA`.

## Clasificación
- **Reusable CXOrbia:** un único login visible, Auth detrás del producto, sesión restaurable, logout real.
- **Exclusivo cliente:** credenciales legacy TyA.
- **Claude/prototipo:** no nueva candidata; conservar patrón y no reintroducir gate paralelo.
- **Academia:** acceso único y troubleshooting.
- **Sin impacto Claude:** Auth91/91, Rules, histórico y CX.data permanecen cerrados.

## Estado seguro
Corrección hasta este punto: Auth writes0; Firestore writes0; Rules0; Hosting deploy0; Storage/HR/legacy/payments/functions/Make/Gemini0; merge=false; producción=false.
