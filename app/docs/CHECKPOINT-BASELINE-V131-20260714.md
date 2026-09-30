# CHECKPOINT ACUMULADO — R19 / BASELINE INTEGRADA V131

Fecha de actualización: 2026-07-16

## Estado de baseline y candidata

- Baseline físicamente integrada/rollback actual: V131 + R18D.
- Fuente única de trabajo Claude/prototipo: V155.
- V155 no compite como segunda baseline: todavía es candidata y será promovida atómicamente cuando pase el único P0 restante.
- Después de la promoción: candidata aprobada = baseline activa única; V131 queda solo como rollback histórico.

## Candidata V155

- ZIP SHA-256: `5dfd63bb7568e5dba9d70d6817b03998b8cb01a3cc144ac17f63fbb8a729ab13`.
- Manifest: `docs/MANIFEST-V155.json`.
- File count: 204.
- Aggregate: `1c32731bcb249d5e8c2291d89932afbedf42f15687a849865b613aa85f231f51`.
- Manifest: 0 diferencias.
- JavaScript: 0 fallos de sintaxis.

### Cerrado en V155

- Migración legacy de proyectos limitada al tenant actual.
- Sanitización repetible de fixtures explícitos.
- Proyectos de otros tenants preservados.
- Retail/Banca/Restaurantes preservados.
- `hasTechAccess()` false en build comercial.
- Curso técnico `a_backend` oculto.
- Finanzas protegida.
- PWA con un único propietario.

### Único P0 abierto

Estado: **HOLD_ONE_COMMERCIAL_GATE_P0**.

Persisten términos técnicos visibles en superficies comerciales. El gate debe recorrer por rol/módulo DOM, tooltips, toasts, modales, manuales, cursos y plantillas y terminar con 0 coincidencias.

Paquete Claude:

`PAQUETE-EXCLUSIVO-CLAUDE-V155-UNICO-P0-GATE-COMERCIAL-20260716.zip`

SHA-256: `995e5964ada9f3cc3f730fe32de897c0b88394e2a6882a5c51debebf23ddc549`.

## Bloques técnicos Phase A ya cerrados

### Plan Firestore source-safe

- PASS.
- 14 periodos, 616 visitas, 216 shoppers, 572 liquidaciones candidatas.
- 1,421 operaciones planificadas en 4 lotes.
- 0 writes, pagos inferidos o certificaciones inventadas.

### R18C

- PASS.
- 196 enlaces financieros exactos.
- 92 revisiones financieras y 1 shopper.
- R11D/R14C no recalculados.

### R18D

- `PASS_R18D_VISIBLE_OVERLAYS`.
- Finanzas, Shoppers y Certificación renderizan sin error técnico.
- Hotfix de Finanzas protegido.

### R18E Hosting DEV

- `PASS_HOSTING_DEV_V131_R18D_REMOTE_VERIFIED`.
- URL histórica validada: `https://cxorbia-backend-dev.web.app/index.html?cxTyaPhaseA=1&r18d=visible`.
- Build histórico: `v131-r18d-source-safe-20260715-r18e`.
- Sin producción, Firestore/Auth/Storage/HR writes, imports, Make, Gemini ni pagos.

## Reglas operativas confirmadas

- Pend. realizar = toda visita no realizada del periodo activo, aunque esté sin shopper o sin agenda.
- Shopper activo = cuenta activa + visita realizada en los seis meses previos a la referencia del periodo.
- Visitas Disponibles = postulables: sin shopper, no realizadas y del periodo activo.
- País agregado habilita bandera, moneda, filtros, alcance, shoppers y HR.
- Cinépolis = frecuencia mensual y medición quincenal; la HR define la quincena de cada visita.

## Siguiente bloque exacto

```text
Claude entrega candidata incremental sobre V155
→ auditoría delta solo del gate comercial
→ gate automatizado por rol/módulo PASS
→ promoción atómica como baseline única
→ empalme TyA/backend
→ Hosting DEV
→ revisión visual Paula
→ R19 FROZEN
```

## No reprocesar

- V110/V131 como base de desarrollo.
- HR, 14 periodos, 616 visitas y 216 referencias.
- Importadores backend.
- R11D/R14C.
- 196 enlaces y 92 revisiones.
- Hotfix R18D.
- Migración de proyectos V155.
- Finanzas/PWA/KPI/periodos ya incorporados por Claude.

## Restricciones

Sin producción, imports reales, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos reales sin autorización específica.
