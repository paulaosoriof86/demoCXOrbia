# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-26  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `V174_ACTIVE_BASELINE_V182_AUDITED_GO_APPLY_LANE_PENDING`

## 1. Objetivo

Operar TyA/Cinépolis como proyecto configurable con HR/histórico, shoppers, certificaciones, visitas, agenda, cuestionarios, liquidaciones/pagos, multi-tenant, multi-proyecto, roles, Academia y sincronización, sobre base nueva sin conectar/copiar la base vieja.

## 2. Secuencia por corte

`FUENTE → MAPPING/ADAPTER → GATES → BUILD → VALIDACIÓN VISUAL → CORRECCIÓN FOCALIZADA → FREEZE`

Un PASS técnico sin validación real no congela un corte.

## 3. Carril de candidatas

`EXECUTION_LANE_READY → AUDITORÍA DELTA → P0_PROVEN o GO → si GO APPLY_DELTA_DIRECTLY → COMMIT/PUSH → POST-GATES → HOSTING DEV → VALIDACIÓN → FREEZE`

No se sustituye por nueva rama/PR, workflow transportador, PowerShell, incoming, composite, tree directo ni acción manual de Paula.

Si la candidata queda GO pero no puede completarse el carril atómico, el estado es `AUDITED_GO_APPLY_LANE_PENDING`; no se reaudita ni se pide otra candidata.

## 4. Cortes cerrados

V174/M1/Corte 1/Corte 2A: **FROZEN/APROBADO**.

- source lock `d057d77c9117d9d451cfc9a6563083b78b926d57`;
- 14 periodos y 616 visitas;
- HR, adapters y `CX.data` preservados.

## 5. Corte activo — Corte 3 Finanzas

Estado: `V182_AUDITED_GO_APPLY_LANE_PENDING`.

### Verdad canónica

- 247 filas;
- 209 vínculos;
- 207 montos;
- 0 pagos;
- 0 lotes;
- mayo: 44 visitas, 42 exactas, 2 revisiones, 32 GT y 10 HN.

### Historial correctivo

- V175–V181: HOLD documentado; ninguna aplicada.
- V182: source-GO.

### V182 — evidencia de fuente

- manifest/hashes/UTF-8/sintaxis/CSS/secretos: PASS;
- R26: 28/28;
- R27: 13/13;
- R28: 18/18;
- R29: 12/12;
- R30: 12/12;
- R31: 27/27;
- R32 vigente: 25/25;
- total: 135/135 PASS;
- Lotes runtime: PASS;
- CxP histórica runtime: PASS;
- P0 de fuente: 0.

### Cierre de gates

R32 es el barrido consolidado final. No se crea R33 ni V183 por falta de datos TyA, móvil, host o archivos abiertos; esas pruebas son post-apply.

### Empalme acumulado requerido

V175–V181 no fueron aplicadas. El commit funcional V182 debe reemplazar juntos:

- `app/app.js`;
- `app/core/finanzas-core.js`;
- `app/modules/beneficios.js`;
- `app/modules/finanzas.js`;
- `app/styles/layout.css`.

### Estado del carril

- método: checkout Git autenticado o `CXORBIA_ATOMIC_APPLY_RUNNER`;
- blobs exactos disponibles: core y Beneficios;
- blobs exactos pendientes: app.js, finanzas.js y layout.css;
- no aplicación parcial;
- no método alterno.

### Pendiente para congelar Corte 3

1. Completar los tres blobs exactos restantes.
2. Crear una solicitud única al runner atómico con HEAD esperado fresco.
3. Verificar el commit funcional y retiro de la solicitud.
4. Ejecutar R26–R32 sobre el HEAD aplicado.
5. Publicar Hosting DEV del mismo build, si el gate/autorización permanece vigente.
6. Validar mayo 44/42/2/32/10/209/207.
7. Validar mayo ↔ julio.
8. Validar revisión fuera de métricas.
9. Validar presupuesto vacío.
10. Validar CxP sin duplicación.
11. Validar liquidaciones/lotes/Beneficios fail-closed.
12. Validar viewport móvil.
13. Validar host autorizado/no autorizado.
14. Descargar y abrir PDF/XLSX.
15. Validar shopper HNL sin `Q 0`.
16. Paula: `APROBADO`.
17. Freeze Corte 3.

Corte 4 no comienza antes.

## 6. Cortes siguientes

- **Corte 4:** backend nuevo `CX.data` read-only en Firebase nuevo/vacío.
- **Corte 5:** materialización DEV con dry-run/idempotencia.
- **Corte 6:** Auth/RBAC.
- **Corte 7:** sincronización, evidencias y gates Make/Gemini.
- **Corte 8:** preproducción/producción con autorización.

## 7. Claude/prototipo

Paquete vigente: `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-V182-SOURCE-GO-20260726.md`.

No preparar V183.

## 8. Academia

Después del empalme y la aprobación visual documentar:

- exacta vs revisión;
- presupuesto vacío sin fuente;
- CxP sin duplicación;
- moneda fail-closed;
- liquidaciones/lotes/Beneficios;
- exportación y pruebas post-apply.
