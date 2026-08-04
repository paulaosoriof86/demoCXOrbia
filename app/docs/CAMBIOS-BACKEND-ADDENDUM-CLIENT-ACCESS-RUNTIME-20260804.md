# CAMBIOS BACKEND — Acceso Cliente y runtime Phase A

**Fecha:** 2026-08-04  
**Estado:** `ROLLBACK_EXACT_PASS__ROOT_CAUSE_GATE_MODULE_NAME_CORRECTED__FINAL_RUNTIME_RETRY_PENDING`  
**Repo/rama/PR:** `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR #7 draft-open-no merge.

## 1. Autorización ejecutada

Se autorizó un macrobloque DEV para:

- diagnóstico read-only de claims y membership Cliente;
- identidad existente, única y exacta;
- snapshot sanitizado;
- máximo una corrección de claims y una de membership;
- cero creación de usuarios y cero cambios o resets de contraseña;
- idempotencia, readback y rollback automático;
- una ejecución acumulativa de Phase A;
- cero deploy, producción, Firestore de negocio, HR, Rules, Storage, Make, Gemini, pagos o merge.

## 2. Causa raíz previa corregida

El HOLD `HOLD_CLIENT_R4_A3_C0_H0_S0` no demostraba que faltara una identidad Cliente canónica.

La rama ya conservaba evidencia de una identidad Cliente materializada y validada el 2 de agosto. El selector posterior buscaba exclusivamente registros del bundle legacy y omitía la identidad canónica administrada:

- UID canónico: `cxorbia-c6-client-tya-cinepolis-v1`;
- tenant: `tya`;
- proyecto: `cinepolis`;
- rol: `cliente`;
- namespace: `staff`.

Se corrigió el selector para resolver esa identidad por UID y correo interno exactos, comprobar claims, membership y sign-in y bloquear ante cualquier colisión o ambigüedad.

## 3. Archivos técnicos modificados

### `tools/qa/cxorbia-c6-client-auth-materialization.mjs`

- prohíbe crear usuarios;
- exige identidad Cliente canónica existente y habilitada;
- diagnostica claims y `tenants/tya/users/cxorbia-c6-client-tya-cinepolis-v1`;
- máximo una escritura de claims y una escritura de membership;
- snapshot privado, idempotencia, readback y rollback exacto.

### `tools/qa/cxorbia-c6-existing-client-e2e-credential.mjs`

- deja de depender del selector legacy;
- resuelve la identidad canónica exacta;
- valida claims y membership;
- prepara credencial E2E solo en almacenamiento efímero privado;
- cero writes.

### `tools/qa/cxorbia-c6-client-access-runtime-orchestrator.mjs`

Secuencia única:

`snapshot → reparación → idempotencia → readback → credenciales Staff/Shopper/Cliente → HR dinámica → paridad remota → runtime Staff/Shopper → runtime Cliente → dominio/Finanzas/portales/Reservas → rollback proof`.

Ante cualquier fallo posterior a una escritura ejecuta rollback real.

### `.github/workflows/cxorbia-c6-client-auth-materialization.yml`

Se reutilizó el workflow existente. No se creó una nueva ruta de ejecución. El workflow consume una solicitud one-shot, persiste evidencia sanitizada y elimina material privado.

## 4. Resultado de la ejecución

Decisión:

`FAIL_C6_CLIENT_ACCESS_RUNTIME_ROLLED_BACK`.

La ejecución llegó hasta el gate remoto de dominio después de:

- encontrar la identidad Cliente canónica;
- comprobar sign-in;
- detectar que faltaba el documento membership;
- crear temporalmente exactamente un membership autorizado;
- validar Staff, Cliente y Shopper en las etapas anteriores;
- leer la autoridad HR viva con 15 periodos, 660 visitas y 209 shoppers.

El gate de dominio se detuvo con:

`CANONICAL_MODULE_MISSING`.

## 5. Rollback comprobado

El rollback automático restauró el preestado:

- decisión `PASS_C6_CLIENT_AUTH_MEMBERSHIP_ROLLBACK_EXACT`;
- claims restaurados/sin cambio: Auth writes 0;
- membership temporal eliminado: 1 write de rollback;
- `restoredPreState=true`;
- usuarios creados: 0;
- cambios/resets de contraseña: 0;
- credenciales/tokens expuestos: 0;
- deploy/merge/producción: 0.

El estado proveedor final vuelve a tener la identidad Cliente canónica existente y el membership ausente, igual que antes de la ejecución.

## 6. Causa raíz del nuevo HOLD

No era un módulo funcional ausente.

El gate esperaba un módulo inexistente denominado:

`CX.modules.cliente`.

La autoridad real del Portal Cliente es:

`CX.modules.cli_dashboard`.

La propia navegación y el gate source/static ya reconocían las rutas `cli_*`. El test semántico usaba un nombre histórico incorrecto tanto en Staff como en Cliente.

También mantenía en su fuente histórica una aserción congelada a julio de 2026, aunque un wrapper la reemplazaba temporalmente.

## 7. Correctivo de causa raíz aplicado

### `tools/qa/tya-c6-remote-domain-finance-portals-reservations-gate.mjs`

- valida directamente `cli_dashboard`;
- conserva `miperfil`, `financiero` y `reservas`;
- identifica exactamente qué módulo falta en cualquier fallo futuro;
- deriva el último periodo desde la autoridad HR viva;
- elimina la expectativa fija `2026-07`;
- emite directamente el contrato dinámico Phase A.

### `tools/qa/tya-phase-a-remote-domain-dynamic-wrapper.mjs`

- deja de reescribir código temporalmente;
- verifica que no reaparezcan nombres históricos o periodos congelados;
- ejecuta el gate dinámico canónico directamente.

No se modificó ningún archivo funcional de `app/` para resolver un error del gate.

## 8. Estado seguro

- usuarios Auth creados: 0;
- cambios/resets de contraseña: 0;
- estado proveedor restaurado: sí;
- cambios funcionales en `app/`: 0;
- Hosting/Cloud Run deploys: 0;
- Firestore de negocio/HR/Rules/Storage: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: intacta.

## 9. Pendiente exacto

El correctivo fuente está aplicado. Falta una única reejecución controlada para volver a materializar temporalmente el membership, ejecutar el runtime completo con el gate corregido y conservarlo solo con PASS total.

La autorización anterior exigía una sola repetición y ya fue consumida. No se ejecutó silenciosamente una segunda escritura.

## 10. Clasificación

- **Reusable CXOrbia:** selector canónico, snapshot, membership idempotente, rollback y gates dinámicos.
- **Exclusivo cliente:** identidad `tya/cinepolis` y membership correspondiente.
- **Cloud/prototipo:** sin impacto; Cloud permanece frontend-only.
- **Academia:** documentar diferencia entre identidad Auth, claims, membership y ruta visual.
- **Sin impacto frontend:** la corrección del gate no toca UI.
