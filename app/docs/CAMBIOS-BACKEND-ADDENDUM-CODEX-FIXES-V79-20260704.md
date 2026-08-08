# Cambios backend addendum Codex fixes V79

Fecha: 2026-07-04

## Archivos modificados

- `app/modules/novedades.js`
- `app/modules/saas-console.js`
- `app/modules/misvisitas.js`

## Archivo documental agregado

- `app/docs/CODEX-FIXES-APPLIED-TO-V79-20260704.md`

## Motivo

Paula compartio reporte de Codex con hallazgos utiles sobre V79. Se aplican los ajustes para no perder esas correcciones luego del empalme del candidato.

## Cambios

- Restaurado checkbox `nvBanner` en Novedades.
- Version de SaaS Console y tenants nuevos alineada a `V76`.
- Texto duplicado `plantilla lista (plantilla lista)` corregido.

## Riesgos pendientes

- Enum de cuestionario inconsistente.
- Revision no funcional completa.
- Submitido no completamente configurable/HR-driven.
- Wizard de creacion incompleto para Phase A.

## Estado

- Sin deploy.
- Sin produccion.
- Sin Firestore writes reales.
- Sin runtime backend conectado.
