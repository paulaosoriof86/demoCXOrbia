# RESUMEN PARA CLAUDE — C6 AUTH PRINCIPAL-UNIQUENESS PHASE 1 DIGEST HOLD

No tocar frontend ni `CX.data` desde este bloque.

Backend C6 identificó y corrigió en source el defecto conceptual `CROSS_ROW_EXISTING_AUTH_PRINCIPAL_ALIAS_IN_OLD_PREWRITE`: el nuevo activation v2 usa candidatos target-specific y agrega invariants globales por UID/candidate fingerprint. También incorpora rollback exacto con `salt` vacío permitido únicamente bajo match legacy SHA256/1 exacto.

La FASE 1 no obtuvo PASS por un mismatch determinístico del texto audit-only incluido en el row re-clasificado, por lo que FASE 2 no inició y no hubo provider/Auth writes.

Preservar UI acumulativa, Login, HR, shoppers, visitas, certificaciones, liquidaciones, Finanzas, Portal Cliente, Portal Shopper, Reservas y multi-proyecto. No documentar Auth como ejecutado todavía.
