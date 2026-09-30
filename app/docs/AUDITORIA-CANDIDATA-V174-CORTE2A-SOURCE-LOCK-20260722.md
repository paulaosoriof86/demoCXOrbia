# Auditoría candidata V174 — Corte 2A · Source lock

Fecha: 2026-07-22  
Estado: `AUDITED_GO_APPLY_LANE_PENDING`  
Repo: `paulaosoriof86/demoCXOrbia`  
Rama destino: `docs-tya-v6-v71-audit`  
PR: `#7` draft/open/no merge

## 1. Identidad inmutable

- Archivo recibido: `Prototype development request (16).zip`.
- Paquete interno: `CANDIDATA_V174_ACUMULADA_20260722`.
- SHA-256 ZIP: `e48452a4385e5dd2647437c04fdae47c9887e97af7b5a8de97d4f8ce522e2b2f`.
- `HEAD_BEFORE` de auditoría: `91924ff34d377fff6601cebe6d59b269a2c00834`.
- Tipo: candidata completa acumulada V165→V174.
- Archivos en paquete: 263 totales; `app/` declara 258.
- Archivos modificados acumulados declarados: 20.
- Delta nuevo V174 declarado: 4 archivos.

Este documento evita reauditar la misma candidata por una limitación posterior del carril de aplicación. Solo se reabre la auditoría si cambia el SHA de la candidata o la rama se mueve de forma incompatible.

## 2. Carriles

```text
CANDIDATE_BYTES_AVAILABLE=true
CANDIDATE_EXTRACTABLE=true
LOCAL_AUDIT_RUNTIME_AVAILABLE=true
AUTHORITATIVE_BRANCH_READ_AVAILABLE=true
AUDIT_LANE_READY=true
APPLY_LANE_READY=false
```

La auditoría se ejecutó con bytes extraídos, Node/Python/hashes/gates locales y lectura autoritativa de PR, HEAD y archivos de la rama mediante GitHub.

La falta temporal de checkout local autenticado no invalida esta auditoría. La aplicación permanece pendiente hasta disponer de una mutación atómica directa con commit/push verificables.

## 3. Separación del delta

### Delta nuevo V174

- `app/modules/cliente-extra.js`;
- `app/modules/operacion-extra.js`;
- `app/modules/academia.js`;
- `app/modules/novedades.js`.

### Delta Corte 2A heredado de V173

- `app/modules/visitas.js`;
- `app/modules/postulaciones.js`.

### Acumulado declarado V165→V174

- `app/app.js`;
- `app/core/cliente-data.js`;
- `app/core/config.js`;
- `app/core/router.js`;
- `app/modules/cliente-extra.js`;
- `app/modules/cliente.js`;
- `app/modules/cliente-insights.js`;
- `app/modules/operacion-extra.js`;
- `app/modules/historico.js`;
- `app/modules/visitas.js`;
- `app/modules/dashboard.js`;
- `app/modules/crm.js`;
- `app/modules/finanzas.js`;
- `app/modules/novedades.js`;
- `app/modules/integraciones.js`;
- `app/modules/misvisitas.js`;
- `app/modules/reservas.js`;
- `app/modules/midia.js`;
- `app/modules/postulaciones.js`;
- `app/modules/academia.js`.

La candidata no incluye backend, adapters live, contratos, tools ni overlays de la rama. Por ello queda prohibido reemplazar `app/` completa a ciegas. La aplicación debe limitarse al delta auditado y preservar toda superposición viva.

## 4. Evidencia técnica ejecutada

### Integridad

- SHA/bytes de los 20 archivos declarados: PASS.
- UTF-8: PASS.
- BOM: cero.
- Secretos/API keys/private keys detectados: cero.
- Scripts locales referenciados desde `index.html`: 67; faltantes: cero.

### Sintaxis

- Archivos `.js/.mjs` revisados con `node --check`: 68.
- PASS: 68.
- FAIL: 0.

### Corte 2A

`app/modules/visitas.js`:

- usa `visitFacets`;
- elimina `ui.estadoBadge(v.estado)` como estado visible Admin;
- exporta estado canónico;
- incluye `sourceRevision`;
- presenta `Pendiente de fuente` ante ausencia financiera.

`app/modules/postulaciones.js`:

- implementa `poExport`;
- exporta el alcance filtrado/periodo activo;
- incluye `sourceRevision`;
- usa fallback `Contacto protegido`;
- elimina el claim `HR sincronizada`;
- ofrece `Conservar fecha`, `Cambiar fecha` y `Pendiente de agendamiento`;
- no introduce `location.reload()` ejecutable.

El gate estático de Corte 2A queda PASS al preservar el overlay protegido `app/core/tya-phase-a-source-safe-preview.js` de la rama, que la candidata no contiene ni debe borrar.

### V174

- Excel enriquecido: anchos, autofiltro, catálogo de columnas y revisión de fuente presentes.
- Efectividad: fórmula basada en realizadas/asignadas y tratamiento fail-closed presentes.
- Academia: curso `a_canon_ops` presente.
- Novedades: entrada v7.0 presente.

## 5. Regresión M1

No se demostró regresión P0 de:

- lectura HR viva;
- proyecto/periodo;
- refresco in-place;
- sourceRevision;
- facets canónicas;
- asignación/cuestionario;
- marketplace shopper;
- pagos inferidos;
- rutas esenciales;
- seguridad o secretos.

Los adapters live y overlays M1 no vienen en la candidata; deben preservarse durante el empalme.

## 6. Hallazgos P1/P2

### P1 — integridad de entrega

1. `app/core/build-lock.js` y `app/docs/verify-manifest.mjs` siguen referenciando V156.
2. La candidata no contiene un manifest/build-lock/verificador V174 realmente reconciliado.
3. Deben regenerarse después del empalme atómico sobre el HEAD real; no se usan los artefactos V156 como verdad.

### P1 — logo real en PowerPoint no demostrado

La candidata declara cerrado el branding, pero el análisis estático no demuestra inserción de una imagen de logo real mediante `logoUrl`/`addImage`. El PPT conserva texto de marca y gráfica, pero el logo gráfico continúa como pendiente verificable.

### P2

1. `MANIFEST.sha256` es una lista de hashes y no el SHA único de `MANIFEST.json`; el nombre es impreciso.
2. Persiste mojibake en un documento histórico ajeno al delta funcional.

Ningún hallazgo anterior cumple criterio P0.

## 7. Decisión

`AUDITED_GO_APPLY_LANE_PENDING`

- P0 demostrado: ninguno.
- P1/P2: documentados y no bloqueantes.
- No se solicita nueva candidata.
- No se repite esta auditoría por falta temporal del carril de aplicación.
- Próxima acción: `APPLY_DELTA_DIRECTLY` cuando exista aplicación atómica autenticada sobre la rama viva.

## 8. Gates posteriores obligatorios

Después del empalme:

1. manifest/build-lock/verificador nuevos;
2. `tya-corte1-m1-regression-lock.mjs`;
3. `tya-corte2a-shopper-operation-canonical-gate.mjs`;
4. gates R20/contexto/reportes/proyecto-periodo;
5. smoke remoto `fresh=1`;
6. build/Hosting DEV autorizado;
7. validación visual;
8. freeze Corte 2A.

## 9. Clasificación

- **Reusable CXOrbia:** separación Audit/Apply, facets canónicas, ausencia vs cero, exportación por revisión/alcance, reasignación explícita.
- **Exclusivo cliente:** ejemplos y variantes HR TyA/Cinépolis.
- **Claude/prototipo:** 20 archivos frontend acumulados declarados, con foco V173/V174.
- **Academia:** curso de operación canónica y conceptos del lock M1.
- **Sin impacto Claude:** checkout, aplicación atómica, backend, adapters, deploy y smoke.

## 10. Estado seguro

Sin empalme todavía, sin merge, sin producción, sin HR/Firestore/Auth/Storage writes, sin Make/Gemini y sin pagos.
