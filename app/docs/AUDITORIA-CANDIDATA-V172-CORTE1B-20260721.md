# Auditoría candidata V172 — Corte 1B

Fecha: 2026-07-21
Decisión: `AUDITED_GO_READY_DIRECT_APPLY`

## Corrección metodológica

Se retira como bloqueo el supuesto `EXECUTION_LANE_NOT_READY` documentado previamente. La limitación temporal del entorno no debía detener ni sustituir la metodología vigente. V172 se auditó focalizadamente contra V171b y los P0 vivos.

## Identidad

- Candidata: `Prototype development request CXOrbia V172.zip`.
- SHA-256: `2c7c7dec3a04847cb5b9a04456ebefca49f16ea037a24956dc7661cf67e99fd5`.
- Base inmediata: V171b.
- Rama destino: `docs-tya-v6-v71-audit`.
- PR vigente: #7 draft/open/no merge.

## Delta exacto contra V171b

- agregados: 0;
- eliminados: 0;
- modificados: 8.

Archivos funcionales:

1. `app/app.js`;
2. `app/modules/midia.js`;
3. `app/modules/misvisitas.js`;
4. `app/modules/reservas.js`.

Archivos de control:

1. `INVENTARIO.md`;
2. `MANIFEST.json`;
3. `MANIFEST.sha256`;
4. `app/REPORTE-DE-CAMBIOS.md`.

No existe delta fuera del alcance solicitado.

## Gates ejecutados

### Integridad

- 67 JavaScript: sintaxis PASS.
- 73 referencias locales de `index.html`: 0 faltantes.
- 18 hashes/bytes declarados en `MANIFEST.json`: PASS.
- UTF-8 sin BOM en los cuatro archivos funcionales: PASS.
- Mojibake en los cuatro archivos funcionales: 0 hallazgos.

### Identidad Shopper

Gate reproducible `V172_IDENTITY_GATE_PASS`:

- Shopper A ve únicamente Alfa y no Beta.
- Shopper B ve únicamente Beta/Gamma y no Alfa.
- Una visita agendada de B no aparece en Mi Día de A.
- Sin `shopperId`, Mis Visitas muestra estado bloqueado, cero filas y cero acciones.
- Sin `shopperId`, Reservas muestra estado bloqueado y no ofrece crear/cancelar reservas.
- Sin `shopperId`, Mi Día y cronograma no muestran visitas privadas.
- Sin `visitsForShopper`, Mis Visitas usa `[]`; nunca abre `data.visitas()` global.
- `sh1` queda únicamente como seed protegido por modo demo explícito en `app.js`.
- En modo live/real sin identidad, `shopperId` permanece `null`.

## Regresión preservada

V172 conserva las correcciones y mejoras acumuladas de V171b:

- `CX.reportKit` reusable;
- PDF/XLSX/PPTX por rol;
- editor, branding, gráficas y multiproyecto;
- Panorama con facetas canónicas;
- add-ons aislados por tenant/proyecto;
- geo-checkin honesto pendiente de backend/Storage;
- `mireportes` en NAV Shopper;
- router `super` protegido;
- extensiones correctas por exportador;
- Novedades por rol.

## Criterio P0

No se encontró un P0 nuevo reproducible. La corrección del P0 de identidad Shopper es consistente, fail-closed y no introduce write, deploy, proveedor, secreto, pérdida crítica ni regresión que impida Phase A.

## Decisión

`AUDITED_GO_READY_DIRECT_APPLY`

La siguiente operación obligatoria es `APPLY_DELTA_DIRECTLY` sobre `docs-tya-v6-v71-audit`, preservando backend, adapters live, contratos, herramientas y documentación viva. No se solicita otra candidata ni se reabre metodología.

## Estado seguro

A la fecha de esta auditoría todavía no se declara empalme, deploy, merge, producción, importación real, escritura Firestore/Auth/Storage/HR, Make/Gemini live ni pagos.