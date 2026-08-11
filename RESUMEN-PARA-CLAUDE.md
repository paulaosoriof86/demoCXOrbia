# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-11  
**Estado vivo:** `STOP_RETRY_C6_STAFF_REPAIR_BOOTSTRAP_EXACT_WRITE__PRIVATE_VISIBLE_LOGIN_UNRESOLVED_B__AUTH_WRITES_0__FIRESTORE_WRITES_0__NO_DELETE__NO_DEPLOY__NO_PRODUCTION`

## Fuente vigente

Consultar índice, checkpoint, `SOURCE-LOCK-C6-STAFF-REPAIR-BOOTSTRAP-STOP-PRIVATE-IDENTITY-B-20260811.md` y evidencia `C6-STAFF-REPAIR-BOOTSTRAP-EXACT-WRITE-LATEST.json`.

## No reabrir

Frontend acumulativo, Auth 228, Activation/readback/rollback, SKIP13, MultiAuth, HashConfig, direct runner, M4, HR M6, static gate y provider snapshot focal PASS.

## Estado backend

El exact write autorizado se detuvo antes del primer provider write:

```text
blocker=PRIVATE_VISIBLE_LOGIN_UNRESOLVED_B
credentialPrivacyPass=true
identityResolutionPass=false
AuthWrites=0
FirestoreWrites=0
Deletes=0
```

No existe reparación parcial: A, R4 y los ocho históricos permanecen sin mutación.

## Tarea Claude/prototipo

**No crear pantalla nueva, no rediseñar y no aplicar fallback local.** `app/modules/configuracion.js#usuarios` permanece sin tocar desde backend.

El wiring localizado a backend vivo sigue pendiente hasta que el bootstrap staff termine con readback PASS. No hardcodear B, no inventar login, no derivarlo por rol/nombre y no usar `cinepolis` como scope hardcodeado en UI.

Contrato futuro preservado: alta con `TyA completo` o `Proyectos específicos`, scope editable desde inventario vivo, no exponer claims/fingerprints/provider IDs, alta/edición/disable/reactivate con readback y sin hard delete por defecto.

## HR

M6 COMPLETE. No remapear ni pedir enlace.

## Métrica

**84% certificado; 16% restante. M5=4/8.**

## Siguiente bloque backend

`C6 STAFF TARGET PRIVATE IDENTITY RECOVERY SOURCE-ONLY`.

Claude no debe adelantarse a ese cierre ni crear una identidad sustituta.
