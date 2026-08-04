# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-04  
**Estado:** `SOURCE_STATIC_PASS__RUNTIME_MULTIROLE_HOLD_CLIENT_CLAIMS__LIVE_HR_660__CLAUDE_FRONTEND_IN_PROGRESS__NO_PRODUCTION`

## 1. Carril vigente

Continuar únicamente sobre:

- repo `paulaosoriof86/demoCXOrbia`;
- rama `docs-tya-v6-v71-audit`;
- PR #7 draft/open/no merge;
- manifest final Phase A;
- árbol funcional `app/` preservado.

Producción `tya-plataforma` permanece intacta.

## 2. Autoridades preservadas

- RC Phase A smoke técnico y visual PASS;
- M1/Corte 1 frozen/aprobado;
- Corte 2A/V174 frozen/aprobado;
- Corte 3/V182 frozen active baseline;
- C6 entrada, HR, Staff, Shopper, Cliente, Finanzas y Reservas preservado;
- 29 decisiones únicas cerradas;
- 0 restauraciones requeridas;
- 53/53 blobs críticos PASS en gate source/static.

## 3. Gate source/static

PASS confirmado:

- run `30910224561`;
- artifact `8892730161`;
- 53/53 blobs;
- 111 scripts;
- cero duplicados;
- navegación Admin/Cliente/Shopper;
- report kit PDF/XLSX/PPTX;
- repositorio sin delta;
- writes 0.

## 4. Runtime multirol — hallazgo 1 cerrado

La primera ejecución runtime se detuvo antes del navegador porque el selector histórico exigía exactamente `616` visitas.

La HR viva devolvió `660`.

Evidencia:

- run `30918138163`;
- artifact `8895927317`;
- error `LIVE_HR_VISITS_MISMATCH_660`;
- repositorio sin delta;
- writes 0.

Causa raíz:

`FROZEN_RUNTIME_SOURCE_INVARIANTS`.

Correctivo transversal aplicado:

- autoridad HR dinámica;
- conteos y último periodo tomados de la fuente viva;
- eliminación de la suposición fija `616 / 2026-07`;
- identidad estable, paridad y cero duplicados se mantienen como gates.

## 5. Runtime multirol — bloqueo real vigente

La segunda ejecución avanzó después del correctivo dinámico.

Evidencia:

- run `30918871765`;
- artifact `8896223753`;
- Staff/Shopper credential selection PASS;
- `liveVisits=660`;
- `protectedVisits=616`;
- `exactVisitMatches=616`;
- `newLiveVisitsBeyondProtectedSnapshot=44`;
- Cliente `HOLD_CLIENT_R4_A3_C0_H0_S0`;
- repositorio sin delta;
- writes 0.

Interpretación:

- cuatro registros Cliente candidatos revisados;
- tres identidades Auth existentes encontradas;
- cero identidades con claims completos `cliente/client + tenant TyA + proyecto Cinépolis`.

No se simulará Portal Cliente con identidad Staff. Phase A exige acceso Cliente real.

## 6. Claude frontend

Claude trabaja únicamente sobre el paquete frontend portable corregido:

- Login;
- órbita;
- responsive;
- branding dinámico;
- banderas de todos los países del tenant;
- tokens e i18n;
- evidencia visual real.

Claude no toca Auth, backend, HR, Finanzas, GitHub, deploy ni producción.

## 7. Auditoría forense

No se requiere otra auditoría forense general.

Los hallazgos siguen trazados y el árbol funcional no cambió. Los nuevos bloqueos fueron descubiertos secuencialmente porque cada gate anterior impedía alcanzar la capa siguiente:

1. instrumentación/source snapshot congelado;
2. contrato real de claims Cliente.

Esto no invalida la auditoría; completa su aplicación en runtime.

## 8. Siguiente macrobloque exacto

```text
DIAGNÓSTICO READ-ONLY DE CLAIMS CLIENTE
→ PLAN EXACTO IDEMPOTENTE CON SNAPSHOT Y ROLLBACK
→ UNA ÚNICA REPARACIÓN AUTH/MEMBERSHIP DEV CON AUTORIZACIÓN EXPRESA
→ UNA ÚNICA REPETICIÓN RUNTIME MULTIROL
→ AUDITORÍA DEL DELTA CLAUDE
→ APPLY_DELTA_DIRECTLY SOLO CON GO
→ BRIDGE FIREBASE SEGURO
→ GATES ACUMULATIVOS
→ ÚNICO DEV SI CAMBIA APP
→ CHECKPOINT_VISUAL_PHASE_A_COMPLETA
```

Después:

```text
FREEZE
→ CONFIRMAR AGOSTO/DISPONIBLES/POSTULACIONES
→ CUTOVER AUTORIZADO
```

## 9. Estado seguro

- cambios funcionales en `app/`: 0;
- Hosting deploy: 0;
- Auth/Firestore/Rules/Storage/HR writes: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: intacta.

## 10. Clasificación

- **Reusable CXOrbia:** autoridad HR dinámica, runtime multirol y eliminación de invariantes congeladas.
- **Exclusivo cliente:** claims Cliente para TyA/Cinépolis y 44 visitas vivas adicionales.
- **Claude/prototipo:** frontend portable en corrección.
- **Academia:** impacto funcional pendiente del PASS runtime.
- **Sin impacto Claude:** Auth, HR, runtime, DEV y producción.
