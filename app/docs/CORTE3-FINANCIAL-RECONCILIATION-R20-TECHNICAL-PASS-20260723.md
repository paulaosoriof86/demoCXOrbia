# CORTE 3 — CONCILIACIÓN FINANCIERA R20 Y VISIT ID ESTABLE — TECHNICAL PASS

**Fecha:** 2026-07-23  
**Estado:** `TECHNICAL_PASS_READ_ONLY`  
**Producción:** no  
**Pagos ejecutados:** 0

## 1. Problema estructural corregido

La identidad anterior de una visita incluía campos operativos mutables como cinema, shopping, quincena y franja. Una corrección legítima en la HR podía cambiar `visitId` y, por extensión, `paymentItemId`, aunque la fila canónica `hrRowId` continuara siendo la misma.

La identidad estable R20 usa únicamente:

`tenantId + projectId + periodKey + country + sourceRow`

Versión: `tya-stable-visit-id-r20-row-identity-v1`.

Campos expresamente excluidos de la identidad: cinemaId, shopping, quincena, franja, shopper, fechas y montos.

## 2. Integración en la ruta operativa

La identidad estable quedó incorporada en:

- helper canónico;
- filtro runtime del inventario HR;
- postprocesador idempotente;
- gate del contrato de identidad;
- gate del payload source-safe;
- perfil V174/M1/Corte 2A;
- perfil de conciliación financiera Corte 3.

La ruta de runtime genera primero la HR R20, limita al inventario aprobado, estabiliza los IDs y solo entonces expone el snapshot source-safe a consumidores y reconciliadores.

## 3. Conciliación financiera fresca

Resultado técnico revisado contra la HR R20 vigente:

- visitas HR: 616;
- filas financieras: 247;
- enlaces exactos aceptados: 209;
- filas todavía en revisión: 38;
- review queue: 79;
- filas itemizadas de ledger: 37;
- ledger enlazado a visita: 1;
- nuevos enlaces exactos revisados: 15;
- enlaces exactos previos retirados y mantenidos en revisión: 2;
- cambio de estado mantenido en revisión: 1;
- cambios de `hrRowId` canónico: 0;
- registros financieros nuevos o perdidos: 0.

Los dos enlaces retirados continúan sin vínculo porque presentan diferencia de monto o detalle HR. El cambio de estado continúa sin vínculo porque presenta diferencia de referencia de shopper. Ninguno se resolvió por nombre o inferencia.

## 4. Evidencia reproducible

### Corte 3

- Run: `30038739598`.
- Request commit: `9a3be4cdbca3c4e234bbcb3cb160b65607b96ceb`.
- Resultado: `PASS_READONLY_POST_GATES`.
- Todos los gates de builder, inventario runtime, identidad estable, payload, conciliación y reviewed-delta: PASS.

Evidencia adicional del reviewed delta:

- Run: `30038407143`.
- Job: `89312040827`.
- Artifact: `8576206104`.
- Digest: `sha256:485463c0304f39e8c866514d373a5e365de54640cd0c826869c3b6f386cff91e`.

### Regresión V174/M1/Corte 2A

- Run: `30039152686`.
- Job: `89314519400`.
- Request commit: `b2c49ba2c237451a93fa1444fdf2894333238ca1`.
- Artifact: `8576510415`.
- Digest: `sha256:d9b3ac061fd8d667939fb5caec66810acfaf1a007d78c17cd685a56ae6b84eeb`.
- Resultado: todos los gates funcionales, browser, M1, Corte 2A, propuesta de source lock y verificación del composite propuesto: PASS.

## 5. Qué no significa este PASS

- No confirma que una visita esté pagada.
- No importa movimientos ni lotes.
- No escribe en HR, Firestore, Auth o Storage.
- No despliega Hosting DEV ni producción.
- No autoriza merge.
- No cierra visualmente Corte 3.

`paid` sigue exigiendo fuente, fecha, lote, confirmación y referencia de auditoría.

## 6. Siguiente bloque exacto

`SNAPSHOT FINANCIERO CANÓNICO SOURCE-SAFE → ADAPTER ÚNICO → FINANZAS Y BENEFICIOS CONSUMEN LA MISMA VERDAD → GATES UI/EXPORTACIONES → HOSTING DEV Y VALIDACIÓN VISUAL`.

## 7. Estado seguro

Cero pagos, importaciones, producción, merge, deploy y escrituras reales. V174 y la lectura HR viva quedan preservadas.
