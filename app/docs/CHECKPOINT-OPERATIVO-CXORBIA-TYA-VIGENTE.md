# CHECKPOINT OPERATIVO CXORBIA TyA - VIGENTE

Fecha: 2026-07-21
Estado: `CORTE_1B_CANDIDATE_V172_EXECUTION_LANE_NOT_READY`

## Estado comprobado

- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Baseline activa: V161C/R21.
- V164 y Corte 1A están integrados.
- Cloud Run DEV read-only y Hosting DEV están desplegados.
- La HR viva quedó confirmada con cambios reales.
- Refresco al cargar, `pageshow` y sondeo de 15 segundos están desplegados.
- Corte 1 no está congelado.
- Corte 2 continúa bloqueado.

## Evidencia funcional preservada

Paula confirmó que:

1. agregar fecha de cuestionario en HR cambia el KPI;
2. asignar shopper en HR retira la visita disponible;
3. los KPI de julio coinciden con la HR actual;
4. los cuatro reportes operativos del cliente están disponibles;
5. los cambios HR se reflejan después del ciclo live de lectura/canonización.

Último deploy DEV preservado: run `29799752544`, job `88538293485`, artefacto `8483321397`, digest `sha256:b5386d5a9c4a7f2d4ad385026bd2d795de59c7e54b2b8cf73d972fd516fc6d86`.

## Continuidad V171b

V171b permanece sin aplicar por el P0 demostrado de identidad Shopper fail-open. Sus mejoras acumuladas deben preservarse: reportKit, reportes multiformato, branding, gráficas, multiproyecto, Panorama canónico, add-ons aislados, geo-checkin honesto, `mireportes`, router `super` y Novedades por rol.

## Candidata corregida V172 — preflight

- Archivo: `Prototype development request CXOrbia V172.zip`.
- SHA-256: `2c7c7dec3a04847cb5b9a04456ebefca49f16ea037a24956dc7661cf67e99fd5`.
- Raíz: `CANDIDATA_V172_ACUMULADA_20260721/`.
- Entradas: 261.
- Manifiesto, inventario y reporte de cambios: presentes.
- Comparación byte a byte contra V171b:
  - agregados: 0;
  - eliminados: 0;
  - modificados: 8.
- Archivos funcionales modificados: `app/app.js`, `app/modules/midia.js`, `app/modules/misvisitas.js`, `app/modules/reservas.js`.
- Archivos de control modificados: `INVENTARIO.md`, `MANIFEST.json`, `MANIFEST.sha256`, `app/REPORTE-DE-CAMBIOS.md`.
- El delta coincide con el alcance de corrección solicitado.

## Gate de ejecución

```text
CANDIDATE_BYTES_AVAILABLE=true
CANDIDATE_EXTRACTABLE=true
CANDIDATE_MANIFEST_PRESENT=true
AUTHENTICATED_GITHUB_CONNECTOR=true
TARGET_BRANCH=docs-tya-v6-v71-audit
LOCAL_LIVE_BRANCH_CHECKOUT=false
NETWORK_GIT_CLONE_AVAILABLE=false
EXECUTION_LANE_READY=false
```

El entorno actual no contiene un checkout autenticado de la rama viva en el mismo workspace que los bytes extraídos. Por el lock vigente, se detuvo antes de declarar auditoría completa, GO o HOLD.

## Operaciones no realizadas

- no se aplicó V172;
- no se usaron Contents API archivo por archivo, blobs/trees ni workflow transportador;
- no se creó rama o PR;
- no hubo deploy, merge, producción ni acciones manuales para Paula.

## Documentación vigente

- `app/docs/PREFLIGHT-CANDIDATA-V172-EXECUTION-LANE-NOT-READY-20260721.md`;
- auditoría y paquete de corrección V171b;
- `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
- PR #7.

## Siguiente bloque exacto

`RESTABLECER WORKSPACE FILE-AWARE CON CHECKOUT AUTENTICADO DE docs-tya-v6-v71-audit → DECLARAR EXECUTION_LANE_READY → AUDITORÍA FOCALIZADA V172 → GO: APPLY_DELTA_DIRECTLY EN RAMA VIVA → GATES → HOSTING DEV → VALIDACIÓN VISUAL → RETIRAR WORKFLOW TEMPORAL → FREEZE CORTE 1`

## Estado seguro

Sin empalme V172, merge, producción, importación real, escrituras Firestore/Auth/Storage/HR, Make/Gemini live ni pagos.