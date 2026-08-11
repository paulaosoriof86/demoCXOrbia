# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-11  
**Estado:** `PASS_C6_STAFF_D_TECHNICAL_LOGIN_REBASE_SOURCE_ONLY__ZERO_SOURCE_COLLISION__PRIVATE_EXECUTION_HANDOFF_PENDING__NO_PROVIDER__NO_WRITES__NO_PRODUCTION`

Protegido: frontend/Auth228/Activation/SKIP13/MultiAuth/HashConfig/direct runner/M4/HR M6/live-user-admin static/provider snapshot/budgets/A-B-C identities/R4.

D rebase cerrado: historical visible-login no recuperable; nuevo identificador técnico determinístico source-safe; cero colisión; owner/rol/scope/projectIds/claims sin cambios; D ya no depende de referencia histórica.

Pendiente inmediato: `C6 STAFF PRIVATE EXECUTION HANDOFF SOURCE-ONLY`. A/B/C exact visible-login se recuperaron transient pero no se persistieron; debe validarse un canal privado de ejecución que los entregue al runtime sin repo/artifact/log. D se regenera determinísticamente.

Después de handoff PASS: nueva autorización focal exact-write v2 -> repair/readback/rollback -> wiring Usuarios & Permisos -> M7 -> M8 -> M9 -> M10.

No pedir owners/scopes/HR otra vez; no reabrir A/B/C; no repetir D rebase/provider snapshot/static/Auth340; no nueva candidata/rama/PR/workflow; no provider/Auth/Firestore writes hasta handoff PASS + autorización; no deletes/deploy/merge/producción.

**84% certificado; 16% restante; M5=4/8.**
