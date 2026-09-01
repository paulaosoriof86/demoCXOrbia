# Pendientes prototipo — baseline V106 / R8

## P0

1. `core/cliente-data.js`: eliminar síntesis fuera de demo; cache por tenant/proyecto/modo/revisión de fuente.
2. `core/data-source.js`: reemplazar purga indiscriminada por procedencia/namespace demo y migración segura.
3. Pago/lotes/beneficios/historial: pago confirmado exige estado, fecha, lote, fuente, actor y auditRef; preview nunca entra a lote real.
4. `modules/beneficios.js`: shopper autenticado obligatorio; jamás fallback global o `sh1`.
5. Permisos y call-sites: tenant/proyecto/país/entidad reales; sin tenant desde tema visual.
6. Certificación: lifecycle completo, segundo actor autenticado, práctica separada y publicación contextual.
7. Academia: completar contrato profundo R8; no marcar resuelta por contenido estático.
8. Manifest V106 reproducible, identidad única y evidencias realmente incluidas.

## P1

1. Eliminar CxC 15%, 85/15, presupuestos y series fabricadas fuera de demo.
2. Corregir copy residual Make, WhatsApp, correo, Gemini y notificaciones.
3. Smoke Cliente, Academia, Finanzas no demo, scopes, source-safe y móvil 360/390/412.
4. UI de reviewQueue, import dry-run y plan/executor Firestore con gates honestos.
5. Estados visuales de executor: plan/preflight/target/autorización/materialización/confirmación/fallo/rollback.

## Regla

No reabrir los puntos ya hechos. No hardcodear Cinépolis ni conteos TyA.
