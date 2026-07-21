# CHECKPOINT OPERATIVO CXORBIA TyA - VIGENTE

Fecha: 2026-07-21
Estado: `CORTE_1B_CANDIDATE_V170_HOLD_P0_PROVEN`

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

## Candidata V170 auditada

- Archivo: `Prototype development request (14).zip`.
- SHA-256: `c7819bbd28436d0ae22fabf0d7339e8b6ad4d653e950fed45cf1407641b8eaa3`.
- `EXECUTION_LANE_READY`: confirmado.
- 15 JS: sintaxis PASS.
- No hardcode Cinépolis: PASS.
- Decisión: `HOLD — P0_PROVEN`.
- Aplicación a rama viva: no ejecutada.

## Mejoras reales que se preservan para la corrección

- `CX.reportKit` reusable;
- reportes multiformato por varios roles y secciones;
- editor, branding, gráficas y multiproyecto;
- Panorama operación/evaluación;
- add-ons con selección de roles;
- check-in visible para Shopper;
- Novedades por rol.

## P0 demostrados

1. Router `super` sigue sin guard en `mount` y `nav`.
2. Reportes Shopper fallan abiertos con fallback `sh1`.
3. `openReport` puede generar XLSX/PPTX con filename `.pdf`.
4. Panorama redefine estados y cuenta submitido sin confirmación explícita.
5. Reportes Admin redefine estados y puede incluir archivadas/canceladas.
6. Add-ons usan clave global y no están aislados por tenant/proyecto.
7. Geo-checkin guarda solo nombre de foto, no persiste y permite afirmar evidencia sin GPS.

## P1 importantes

- `mireportes` no aparece en NAV Shopper.
- rol Admin de `geo_checkin` no tiene consumidor funcional.
- PDF/PPT/XLSX requieren equivalencia y legibilidad final.
- PPT puede anunciar éxito antes de terminar la escritura.

## Documentación vinculante

- `app/docs/AUDITORIA-CANDIDATA-V170-CORTE1B-20260721.md`;
- `app/docs/PAQUETE-CORRECCION-CLAUDE-V170-CORTE1B-20260721.md`;
- `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-V170-HOLD-20260721.md`;
- `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-V170-HOLD-20260721.md`;
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-AUDITORIA-V170-CORTE1B-20260721.md`.

## Regla de continuidad

Claude debe corregir sobre V170 y preservar las mejoras. No reiniciar desde V164 ni cambiar backend, `CX.data`, adapters live, contratos, Cloud Run, Hosting, IAM o producción.

## Siguiente bloque exacto

`CANDIDATA V170 CORREGIDA → AUDITORÍA FOCALIZADA → APPLY_DELTA_DIRECTLY EN RAMA VIVA → GATES → HOSTING DEV → VALIDACIÓN VISUAL → RETIRAR WORKFLOW TEMPORAL → FREEZE CORTE 1`

## Estado seguro

Sin merge, producción, importación real, escrituras Firestore/Auth/Storage/HR, Make/Gemini live ni pagos.