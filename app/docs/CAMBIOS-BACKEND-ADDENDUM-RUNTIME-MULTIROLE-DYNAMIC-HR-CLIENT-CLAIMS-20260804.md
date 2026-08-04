# CAMBIOS Backend · Runtime multirol, HR dinámica y claims Cliente

**Fecha:** 2026-08-04  
**Estado:** `RUNTIME_MULTIROLE_HOLD_CLIENT_CLAIMS__LIVE_HR_660__NO_PRODUCTION`

## Resultado del macrobloque

Se creó un único perfil acumulativo read-only para validar sobre el DEV existente:

- paridad Hosting/HEAD;
- HR viva;
- Staff/Admin;
- Shopper;
- Cliente;
- tres recargas y nueva pestaña;
- Finanzas;
- Portal Cliente;
- Portal Shopper;
- Reservas fail-closed.

No se ejecutó deploy ni escritura de Auth, Firestore, Storage, HR, Rules, Make, Gemini, pagos o producción.

## Causas raíces demostradas

### 1. Invariantes históricas congeladas

El selector E2E exigía exactamente `616` visitas y los gates de dominio exigían `2026-07` como último periodo.

La HR viva devolvió `660` visitas. El selector dinámico comprobó:

- `660` visitas vivas;
- `616` visitas protegidas;
- `616` relaciones exactas;
- `44` visitas vivas adicionales;
- `208` relaciones shopper vivas;
- `194` shoppers protegidos con histórico;
- cero writes.

El FAIL de `616 != 660` era un gate obsoleto, no una regresión de la plataforma.

Correctivo transversal:

- nuevo gate de autoridad HR dinámica;
- conteos y último periodo derivados de la fuente viva;
- no congelar volumen o mes;
- conservar identidad estable, ausencia de duplicados y paridad entre autoridad y UI;
- wrapper dinámico para credenciales existentes;
- wrapper dinámico para dominio/Finanzas/portales;
- runner acumulativo actualizado.

### 2. Acceso Cliente incompleto en DEV

Después de eliminar el bloqueo congelado, la selección Staff/Shopper obtuvo PASS, pero el selector Cliente reportó:

`HOLD_CLIENT_R4_A3_C0_H0_S0`.

Interpretación sanitizada:

- cuatro registros candidatos revisados;
- tres identidades Auth existentes encontradas;
- cero identidades con contrato completo de claims `cliente/client + tenant TyA + proyecto Cinépolis`;
- cero passwords modificados;
- cero usuarios creados;
- cero claims escritos.

Este es un bloqueo real independiente: Portal Cliente forma parte de Phase A y no debe validarse usando una identidad Staff simulada.

## Archivos creados

- `tools/release/cxorbia-phase-a-runtime-multirole-runner.mjs`;
- `tools/qa/tya-live-hr-dynamic-authority-gate.mjs`;
- `tools/qa/cxorbia-phase-a-existing-users-e2e-credentials-dynamic.mjs`;
- `tools/qa/tya-phase-a-remote-domain-dynamic-wrapper.mjs`.

## Archivos actualizados

- `.github/workflows/cxorbia-readonly-post-gates-runner.yml`;
- `.github/cxorbia-gate-requests/request.json`;
- `tools/qa/cxorbia-c6-existing-users-e2e-credentials.mjs`;
- `tools/release/cxorbia-phase-a-runtime-multirole-runner.mjs`.

## Evidencia

### Ejecución 1

- run `30918138163`;
- artifact `8895927317`;
- bloqueo `LIVE_HR_VISITS_MISMATCH_660`;
- repositorio sin delta;
- writes 0.

### Ejecución 2 posterior al correctivo dinámico

- run `30918871765`;
- artifact `8896223753`;
- Staff/Shopper selector PASS;
- `liveVisits=660`;
- `protectedVisits=616`;
- `exactVisitMatches=616`;
- Cliente HOLD por claims;
- repositorio sin delta;
- writes 0.

## Por qué no es prueba y error

Los dos bloqueos pertenecen a capas diferentes:

1. el primero impedía llegar a Auth Cliente porque detenía el preflight en el conteo histórico;
2. al corregir la autoridad dinámica, el gate avanzó y demostró el siguiente bloqueo real: claims Cliente incompletos.

No se aplicaron parches de UI ni se relajaron verificaciones desconocidas. Cada correctivo eliminó una suposición congelada y mantuvo gates de identidad, seguridad, paridad y cero duplicados.

## Siguiente acción exacta

1. diagnóstico read-only agregado de claims Cliente;
2. plan exacto e idempotente de reparación DEV con snapshot y rollback;
3. una única escritura Auth/membership DEV, solo con autorización expresa;
4. una única repetición del runtime acumulativo;
5. con PASS, integrar el delta frontend Claude corregido y ejecutar gates;
6. un único DEV y `CHECKPOINT_VISUAL_PHASE_A_COMPLETA`.

## Clasificación

- **Reusable CXOrbia:** autoridad dinámica, eliminación de invariantes congeladas y gate multirol.
- **Exclusivo cliente:** tenant TyA, proyecto Cinépolis y claims Cliente DEV.
- **Claude/prototipo:** sin impacto; Claude continúa solo frontend portable.
- **Academia:** documentar después del PASS runtime.
- **Sin impacto Claude:** Auth, HR, runtime y reparación DEV.

## Estado seguro

- cambios funcionales en `app/`: 0;
- Hosting deploy: 0;
- Auth writes: 0;
- Firestore/Rules/Storage/HR writes: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: intacta.
