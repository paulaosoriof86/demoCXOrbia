# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_PROFILE_FULL_FIRESTORE_WRITE_READBACK_PASS__31_IDENTITY_HOLD_PROVEN__WAITING_SEPARATE_PROTECTED_DEV_REDEPLOY_AUTHORIZATION__NO_PRODUCTION`

## 1. Cerrado / no reabrir
- Corte1/2A/3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS; no reimportar/resetear por rutina.
- HR live/auto-month PASS.

## 2. Perfil completo — Firestore write/readback PASS
120 documentos exactos actualizados;118 con cambios reales +2 marker-only;329 valores escritos; readback120 docs/329 campos; mismatches0.

Campos: username113, pass118, depto2, dpi17, direccion1, fecha_nac2, accepted_terms72, aprobacionCuenta2, registroOrigen2.

La autorización Firestore quedó consumida y deshabilitada. Auth/password reset0; deploys0; producción=false.

## 3. P0 Shopper/perfil aún abierto visualmente
La visual anterior falló por Shopper sin shopperId y Admin en source-safe display-only. Ahora los datos exactos ya están materializados, pero falta redeploy protegido DEV y nueva validación visual Admin + Shopper.

## 4. Histórico/KPI
616/616 visitas con shopperId;194 perfiles referenciados194/194. Runtime fix preparado para ciclo canónico incluido `submitida`. No rediseñar módulo.

## 5. 31 perfiles sin canonical — HOLD probado
Legacy exacto, bridge técnico exacto/único y Auth determinístico + claim:0 resueltos. No emparejar por nombre/teléfono/email. Requieren alta/conciliación explícita y no se consideran migrados.

## 6. Fuente/precedencia
Export vigente manda para perfil actual. Las616 visitas y77 certificaciones canónicas siguen siendo autoridad. Password visible solo desde valor legacy real; Firebase Auth sigue siendo autoridad del login.

## 7. P1/P2 preservado
- PDF/gráficas;
- Excel/formato;
- reportKit/exportaciones;
- copy/readiness.

## 8. Agosto
No ejecutar delta agosto hasta cerrar Corte6.

## 9. Siguiente bloque
`AUTORIZACIÓN SEPARADA REDEPLOY DEV PROTEGIDO → VISUAL ADMIN+SHOPPER → ALTA/CONCILIACIÓN EXPLÍCITA31 HOLD → FREEZE C6 → AGOSTO`.

Producción/merge siguen bloqueados.
