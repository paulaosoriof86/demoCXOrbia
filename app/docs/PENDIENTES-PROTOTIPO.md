# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-13 05:31 -06:00  
**Estado:** `M9_PRECUTOVER_PASS__PHASE_A_96__AWAIT_EXPLICIT_CUTOVER_GATE`

## Pendiente vivo de continuidad

```text
M9: explicit cutover one production promotion (3 puntos al PASS completo)
→ M10: smoke/freeze final (1 punto)
→ Phase A 100%
```

No reabrir C6/M7/M8 ni repetir la fase M9 provider read-only salvo drift reproducible.

## Cerrado y no reabrir

Exact Write V2/canonical readback; principal canónico `B=admin`; formulario único; membership/RBAC; handoff backend/HR/frontend; Auth340/SKIP13/MultiAuth; HR/M4; M7 Runtime 12; M8 Human Validation + Rollback Ready; **M9 provider pre-cutover readiness PASS**.

M9 pre-cutover PASS: run `31695760214`, job `94433057739`, artifact `9179228696`, digest `sha256:83233d83fa56e3ca1f1afb437fccdce16fd368efbb362e0ffb1db51afede95c1`.

Release/version capturadas:
- release `sites/cxorbia-backend-dev/releases/1786585552096000`;
- version rollback `sites/cxorbia-backend-dev/versions/a9670bb8a19862cd`, estado FINALIZED.

Bind M8: build `ecc725866acc3eb8`, aggregate SHA `ecc725866acc3eb8aab292000be3ec31d1c46b5c14a53c8889fa7d6716a997e2`, runtime drift=0.

## Pendiente inmediato

Solo falta autorización explícita para `M9_EXPLICIT_CUTOVER_ONE_PRODUCTION_PROMOTION` antes de tocar producción. La autorización puede incluir un único rollback condicional a `a9670bb8a19862cd` si el smoke inmediato falla, evitando otra espera de autorización durante una contingencia. Ningún deploy/rollback se ejecuta sin ese consentimiento expreso.

## Pendiente frontend heredado separado

`app/modules/cliente-extra.js`: PDF print, XLSX y PPTX. No bloqueó M7/M8 ni la preparación M9 y no forma parte automáticamente de M9/M10 sin fuente canónica que lo establezca.

## Progreso

`M1=35/35 | M2=20/20 | M3=15/15 | M4=5/5 | M5=8/8 | M6=5/5 | M7=5/5 | M8=3/3 | M9=0/3 | M10=0/1`

**96% certificado | 4% restante.**

## Claude / Academia

Sin cambio frontend por M9. Academia puede documentar rollback readiness de manera conceptual; no incluir instrumentación ni identificadores técnicos internos.
