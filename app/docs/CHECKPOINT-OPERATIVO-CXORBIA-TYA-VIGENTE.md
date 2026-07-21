# CHECKPOINT OPERATIVO CXORBIA TyA - VIGENTE

Fecha: 2026-07-21
Estado: `CORTE_1B_CANDIDATE_V171B_HOLD_P0_SHOPPER_IDENTITY`

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

## Candidata V171b auditada focalizadamente

- Archivo: `Prototype development request CXOrbiaV171b.zip`.
- SHA-256: `e655ea88950c8485a497b52b3870c9b18ebef98181e1662993ef496efc17d4e2`.
- Paquete acumulado: 261 entradas y 258 archivos dentro de `app/`.
- Manifiesto e inventario: presentes; hashes de los 15 archivos modificados: PASS.
- 67 JavaScript: sintaxis PASS.
- `index.html`: referencias locales completas y sin scripts duplicados.
- No hardcode Cinépolis en archivos modificados: PASS.
- `EXECUTION_LANE_READY`: no; falta checkout Git autenticado en el mismo workspace.
- Decisión: `HOLD — P0_PROVEN_SHOPPER_IDENTITY_FAIL_OPEN`.
- Aplicación a rama viva: no ejecutada.

## Mejoras V171b que deben preservarse

- `CX.reportKit` reusable;
- reportes PDF/XLSX/PPTX en múltiples roles;
- editor, branding, gráficas y multiproyecto;
- Panorama operación/evaluación con facetas canónicas;
- add-ons aislados por tenant/proyecto;
- geo-checkin honesto pendiente de backend/Storage;
- `mireportes` visible en NAV Shopper;
- router `super` protegido;
- extensiones resueltas por exportador;
- Novedades por rol.

## P0 demostrado en V171b

1. `app/modules/misvisitas.js` usa `shopperId || 'sh1'`.
2. Si falta `visitsForShopper`, `misvisitas` puede caer a todas las visitas mediante `data.visitas()`.
3. `app/modules/reservas.js` usa el mismo fallback `sh1`.
4. `app/modules/midia.js` amplía visitas privadas por estado y puede mostrar visitas activas de otro shopper.
5. `app/app.js` conserva `sh1` sin guard explícito que lo limite a modo demo.

Una prueba reproducible con el archivo real de la candidata confirmó que una sesión Shopper sin `shopperId` renderiza una visita ajena de `sh1`.

## P1/P2

- El campo `bytes` del inventario/manifiesto parece contar caracteres, no bytes UTF-8; los hashes son correctos.
- PDF/PPT/XLSX requieren validación visual final de legibilidad y equivalencia después de resolver el P0.

## Documentación vinculante

- `app/docs/AUDITORIA-CANDIDATA-V171B-CORTE1B-20260721.md`;
- `app/docs/PAQUETE-CORRECCION-CLAUDE-V171B-CORTE1B-20260721.md`;
- `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-V171B-HOLD-20260721.md`;
- `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-V171B-HOLD-20260721.md`;
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-AUDITORIA-V171B-CORTE1B-20260721.md`.

## Regla de continuidad

Claude debe corregir exactamente sobre V171b y preservar todas sus mejoras. No reiniciar desde V164 ni cambiar backend, `CX.data`, adapters live, contratos, Cloud Run, Hosting, IAM o producción.

## Siguiente bloque exacto

`CANDIDATA V171B CORREGIDA → EXECUTION_LANE_READY → AUDITORÍA FOCALIZADA → GO: APPLY_DELTA_DIRECTLY EN RAMA VIVA → GATES → HOSTING DEV → VALIDACIÓN VISUAL → RETIRAR WORKFLOW TEMPORAL → FREEZE CORTE 1`

## Estado seguro

Sin empalme de V171b, merge, producción, importación real, escrituras Firestore/Auth/Storage/HR, Make/Gemini live ni pagos.