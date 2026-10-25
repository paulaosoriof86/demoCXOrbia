# CAMBIOS BACKEND — RECUPERACIÓN DE SHAS PHASE A · BLOQUES 1–3

**Fecha:** 2026-08-03  
**Estado:** `24_UNIQUE_PRESERVE_OR_RECONCILE_DECISIONS_CLOSED__0_RESTORE_REQUIRED_SO_FAR`

## 1. Objetivo

Ejecutar el primer tramo del bloque correcto después de anular la revisión A+B fragmentada:

`RECUPERAR SHAS APROBADOS/SOURCE LOCKS → COMPARAR CONTRA INVENTARIO VIVO → CLASIFICAR`.

## 2. Bloque 1 — M1/Corte 1 y Corte 2A

Documento:

`COMPARACION-SHAS-APROBADOS-PHASE-A-BLOQUE1-M1-CORTE2A-20260803.md`.

Commit:

`13a9d9e0d78f17843473a8fab88adb7c779aa7ae`.

Resultado:

`PASS_8_APPROVED_OR_FROZEN_BLOBS_PRESENT__NO_RESTORE_REQUIRED_FOR_PROVEN_SET`.

Archivos exactos:

- Dashboard;
- Configuración/navegación;
- Router;
- Visitas;
- Postulaciones;
- Novedades;
- Mi Perfil/Reportes Shopper;
- Reportes Cliente.

## 3. Bloque 2 — source lock C6 desplegado

Documento:

`COMPARACION-SHAS-PHASE-A-BLOQUE2-C6-DEPLOY-TECNICO-20260803.md`.

Commits:

- creación: `a4fbf0b5c353e770bd1d3b1f68bcc22e91566b69`;
- corrección de conteo: `ca41952a1fce5b9996664efcffe2240293659325`.

Resultado:

`PASS_13_LIVE_BLOBS_MATCH_C6_DEPLOYED_SOURCE_LOCK__VISUAL_COMPOSITION_STILL_PENDING`.

Archivos exactos:

- `app.js`;
- Mi Día;
- Histórico;
- Reservas;
- Shoppers;
- Mis Visitas;
- Certificación;
- Cuestionario Shopper;
- Beneficios;
- Finanzas UI;
- motor financiero;
- liquidación;
- Portal Cliente.

## 4. Bloque 3 — V182/Corte 3 y fixes C6

Documento:

`COMPARACION-SHAS-PHASE-A-BLOQUE3-V182-CORTE3-Y-C6-20260803.md`.

Commit:

`825954608faf0007d7de9378c80b1cdf47daa868`.

Fuente local entregada por Paula:

`Prototype development request CXOrbia V182.zip`.

SHA-256:

`9954d46191bf15631866e6a8a085cabae1373d18ca14571f89e33eef2dfb5abc`.

Resultado:

- `app.js`, Beneficios y `layout.css`: exactos V182;
- `finanzas-core.js` y `finanzas.js`: distintos por root fixes C6 posteriores;
- se preservan los archivos C6;
- queda prohibido restaurar V182 completo de manera ciega.

## 5. Decisión acumulada

Se han cerrado 24 decisiones únicas de preservación/reconciliación. Las coincidencias superpuestas entre C6 y V182 se cuentan una sola vez.

Hasta ahora:

- `PRESERVAR_APROBADO/FROZEN`: demostrado;
- `PRESERVAR_C6_DEPLOYED_SHA`: demostrado;
- `PRESERVAR_C6_ROOT_FIX__NO_RESTORE_V182`: demostrado;
- `RESTORE_APPROVED_SHA`: 0 archivos.

Esto cambia el diagnóstico: el problema restante no parece ser pérdida física generalizada de módulos aprobados. El riesgo principal está en composición, dependencias, overlays, navegación y reportes transversales.

## 6. Fuentes actualizadas

- `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md` — commit `0288d8dbb6a9b25b2b0f328abe363bb9bdd1e56c`;
- `00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md` — commit `a9435300a899b48a6f09e64504a07a153472d946`.

## 7. Pendiente exacto

- cerrar autoridad de ficha de visita, Revisión Admin, Documentos, Costos y `cliente-data.js`;
- inventariar report kit/exportadores;
- inventariar overlays y propietario final de cada fachada/método;
- probar navegación completa por rol;
- probar mismo periodo/sourceRevision/alcance en Dashboard, Finanzas, Portal y Reportes;
- construir manifest final Phase A.

## 8. Impacto por clasificación

- **Reusable CXOrbia:** comparación Git blob por autoridad y protección contra restores ciegos.
- **Exclusivo cliente:** TyA/Cinépolis, HR, GT/HN y finanzas delegadas.
- **Claude/prototipo:** preservar módulos exactos; corregir solo composición demostrada.
- **Academia:** sin cambio funcional hasta visual completo.
- **Sin impacto Claude:** evidencia de SHA y source locks.

## 9. Estado seguro

- archivos funcionales modificados: 0;
- deploy: 0;
- provider writes: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: intacta.
