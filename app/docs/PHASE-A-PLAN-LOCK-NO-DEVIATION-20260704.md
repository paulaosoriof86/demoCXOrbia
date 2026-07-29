# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-28  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `V182_HOSTING_DEV_REMOTE_SMOKE_PASS_PENDING_PAULA_VISUAL`

## 1. Objetivo

Operar TyA/Cinépolis como proyecto configurable con HR/histórico, shoppers, certificaciones, visitas, agenda, cuestionarios, liquidaciones/pagos, multi-tenant, multi-proyecto, roles, Academia y sincronización, sobre base nueva sin conectar/copiar la base vieja.

## 2. Secuencia por corte

`FUENTE → MAPPING/ADAPTER → GATES → BUILD → VALIDACIÓN VISUAL → CORRECCIÓN FOCALIZADA → FREEZE`

Un PASS técnico sin validación real no congela un corte.

## 3. Carril de candidatas

`EXECUTION_LANE_READY → AUDITORÍA DELTA → P0_PROVEN o GO → si GO APPLY_DELTA_DIRECTLY → COMMIT/PUSH → POST-GATES → HOSTING DEV → VALIDACIÓN → FREEZE`

No se sustituye por nueva rama/PR, workflow transportador, PowerShell, incoming, composite, tree directo ni acción manual de Paula.

Una falla post-gate reproducible después del empalme se corrige focalizadamente sobre la rama viva y se vuelve a ejecutar el gate/Hosting correspondiente; no origina por sí sola nueva candidata o reauditoría.

## 4. Cortes cerrados

V174/M1/Corte 1/Corte 2A: **FROZEN/APROBADO**.

- source lock `d057d77c9117d9d451cfc9a6563083b78b926d57`;
- 14 periodos y 616 visitas preservados;
- HR, adapters y `CX.data` preservados.

## 5. Corte activo — Corte 3 Finanzas

Estado: `HOSTING_DEV_REMOTE_SMOKE_PASS_PENDING_PAULA_VISUAL`.

### Verdad canónica

- 247 filas financieras;
- 209 vínculos exactos;
- 207 montos canónicos;
- 38 sin vínculo exacto;
- 79 revisiones de vínculo;
- 2 revisiones de monto;
- 37 evidencias candidatas;
- 0 pagos;
- 0 lotes;
- mayo: 44 visitas, 42 exactas, 2 revisiones fail-closed, 32 GT y 10 HN.

### V182

- V175–V181: HOLD histórico; no aplicadas.
- V182: source-GO y empalmada.
- Commit funcional: `e3cfe464fd80e5bd4ce273556cfd0021e22c0810`.
- R26–R32 post-apply iniciales: 135/135 PASS.
- No V183. No R33.

### Correcciones focales post-empalme

Hosting DEV demostró y permitió corregir focalmente:

- `27599aa534dff1b832340c67ee00ad4087485cd7`: `canonicalPeriodId` disponible en Dashboard Financiero.
- `3e508c2d883f2f57b2e5fb7276ff14eec0e983de`: exactas impagas permanecen en métricas/CxP.
- `f5457ad6f9430ee3fd91a732977c7efbb95d7bfe`: pago pendiente separado de revisión de fuente.
- `91063ff8f6cd963b7361acbe371f27c4ce9e4870`: copy visible alineado.
- R24 exact post-fix lock: `eeaf6be558aa98fc1a500c629f2b6fafc14992ea`.

### Evidencia vigente

- Read-only finance UI post-fix run `30402106874`: PASS.
- Hosting DEV final run `30402212216`: SUCCESS.
- Live HR endpoint: PASS, 14 periodos / 616 visitas.
- Remote finance smoke R25: PASS.
- Mayo: 44 visitas / 42 exactas / 2 reviews / GT32 / HN10 / 0 pagadas.
- Export financiero: 2 filas / 10 columnas / 2 datos de gráfica / `.pdf`.
- Beneficios Shopper: datos canónicos, 0 pagadas.

### Pendiente para congelar Corte 3

1. Paula abre Hosting DEV.
2. Validar visualmente Admin/Finanzas mayo y la separación exacta/revisión/pago pendiente.
3. Abrir PDF y XLSX reales.
4. Validar Shopper/Beneficios y monedas.
5. Validar viewport móvil.
6. Corregir solo diferencias reproducibles, si existen.
7. Paula responde `APROBADO`.
8. Freeze Corte 3 / ACTIVE_BASELINE.

Corte 4 no comienza antes.

## 6. Cortes siguientes

- **Corte 4:** backend nuevo `CX.data` read-only en Firebase nuevo/vacío.
- **Corte 5:** materialización DEV con dry-run/idempotencia.
- **Corte 6:** Auth/RBAC.
- **Corte 7:** sincronización, evidencias y gates Make/Gemini.
- **Corte 8:** preproducción/producción con autorización.

## 7. Claude/prototipo

No preparar V183. Cualquier diferencia visual futura debe ser reproducible, localizada y corregida focalmente por archivo/módulo.

## 8. Academia

Después de aprobación visual documentar en manuales y cursos:

- fuente exacta vs revisión;
- pago pendiente vs pago confirmado;
- presupuesto vacío sin fuente;
- CxP sin duplicación;
- moneda fail-closed;
- liquidaciones/lotes/Beneficios;
- exportaciones.

## 9. Estado seguro

Sin producción, merge, Firestore/Auth/Storage/HR writes, imports, pagos reales, lotes reales, Make ni Gemini live.
# ADDENDUM CORTE 3 FOCAL FIX - 2026-07-28

Se ejecuta una correccion focal post-validacion visual Paula sobre la rama `docs-tya-v6-v71-audit`, PR #7 draft/open/no merge, partiendo de HEAD remoto `a776e769b4ace5f1b4ec04039f820ae55cdeb6f9`.

No es nueva candidata, no V183, no R33 y no cambia la metodologia. Solo modifica `app/modules/finanzas.js` y `app/core/tya-phase-a-source-safe-preview.js`.

Reglas preservadas:

- `paymentState` pendiente no equivale a revision de fuente.
- Liquidaciones exactas conciliadas con pago pendiente permanecen en metricas, CxP y export.
- Las revisiones financieras quedan visibles y fail-closed, pero fuera de CxP monetaria pagable.
- El adapter source-safe selecciona mes calendario actual si existe; si no, ultimo periodo no futuro; si no, primer periodo disponible.
- No se hardcodea agosto ni se toca discovery R20.
- PDF sin grafica visible y Excel con formato basico quedan P2 transversal, no bloqueante para esta correccion.

Estado local: `CORTE3_FOCAL_FIX_LOCAL_PASS_PENDING_HOSTING_DEV_REMOTE_SMOKE_NO_FREEZE_NO_PRODUCTION`.
