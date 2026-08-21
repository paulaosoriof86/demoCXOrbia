# RESUMEN-PARA-CLAUDE.md

**Fecha:** 2026-08-21  
**MASTER_PLAN_ID:** `CXORBIA-MASTER-GO-LIVE-POSTPROD-RC15-V1`  
**MASTER_PLAN_STATUS:** `FROZEN`  
**currentMasterPhase:** `F0_SYSTEMIC_AUDIT`  
**PHASE_A:** `98/100`

## Estado único

El único plan operativo vigente está congelado en `app/docs/PLAN-OPERATIVO-UNIFICADO-CXORBIA-TYA-VIGENTE.md`. Versión `1.0.0`; SHA-256 `2ddfa91f6ad78ebf08f3dfeefe8b62a695753e3583fc536ce4f015c252d02475`; Git blob `48494ebe5fc439aa6d00e6edcf2e78133357e7f3`.

I1–I4, R1–R4, G1 y G2-A siguen PASS/FROZEN. G2-B no se ejecuta mientras F0 RC15 esté activo.

## RC15 F0 — avance vigente

La matriz de control-plane contiene ahora **68 hallazgos clasificados**. F0 sigue `EXPANDED_NOT_EXHAUSTIVE` y mantiene **18 HOLD** para tratamiento sistémico F1/F2.

Se preservan los 9 HOLD anteriores (`CP-005`, `011`, `014`, `017`, `025`, `028`, `029`, `030`, `031`) y se agregan 9:
- `RC15-CP-045`: C6 hold-profile conserva request activo y el workflow puede leer provider y escribir evidence aunque el propio request declara `providerReadsAuthorizedMax=0`; falta gate canónico previo.
- `RC15-CP-055`: remaining-shopper reconciliation conserva autoridad histórica y su script conecta directamente `tya-plataforma` RTDB; además escribe evidence canónico. Esto contradice el contrato vigente: legacy solo por export/import, nunca conexión directa a la base vieja.
- `RC15-CP-056`: visit identity crosswalk conserva request `enabled=true` sin terminalización; provider-read + writer de evidence.
- `RC15-CP-058`: live-HR provider capability preflight puede dispararse por cambios de workflow/tool, leer provider y hacer commit de evidence **sin validar el request histórico ni el continuity lock**.
- `RC15-CP-059`: legacy shoppers/certifications refresh conecta directamente el RTDB legacy y publica evidence; request histórico sigue `enabled=true`.
- `RC15-CP-063`: profile-extra read-only mantiene `enabled=true/consumed=false`; un bundle cifrado puede activar provider-read + consumo de request + commit de evidence.
- `RC15-CP-066`: canonical backend anomaly probe mantiene request `enabled=true`; provider-read + writer de evidence.
- `RC15-CP-067`: canonical backend Phase A gap mantiene request `enabled=true`; writer repetible de estado/evidence aun sin provider.
- `RC15-CP-068`: canonical backend readonly inventory mantiene request `enabled=true`; provider-read + writer de evidence.

La causa sistémica queda más precisa: coexistieron autorizaciones históricas con terminalización heterogénea, workflows “read-only” que sí mutan estado del repo, al menos un flujo de provider-read que no hace cumplir su propio request, y rutas antiguas que todavía conectan en vivo la base legacy. F1 debe inertizar el residuo completo; F2 debe obligar a todo ejecutor a consultar master plan + continuity lock + consumed ledger **antes** de provider access, legacy access o mutación de estado.

## Claude/prototipo

No hay tarea frontend en este bloque. No modificar `/app/modules` ni `/app/core`. Los hallazgos son de control-plane/autoridad histórica, no defectos UI demostrados.

La regla para legacy queda reforzada para cualquier ajuste futuro: no usar conexión directa a `tya-plataforma`; únicamente artefactos controlados de export/import de datos reales, limpios y útiles.

## Academia

Sin cambio funcional en este bloque. El master plan mantiene Academia/manuales/cursos/rutas por rol/notificaciones como requisito transversal antes del cierre integral y postproducción.
