# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-01  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_DEV_ENTRY_SINGLE_PRODUCT_LOGIN_REMOTE_BROWSER_PASS__PENDING_HUMAN_VISUAL_ACCUMULATIVE__NO_PRODUCTION`

## 1. Repositorio y destinos
- Repo `paulaosoriof86/demoCXOrbia`; rama viva `docs-tya-v6-v71-audit`; PR#7 draft/open/no merge.
- Backend/Hosting DEV existente `cxorbia-backend-dev`, target `cxorbia-dev`.
- Producción `tya-plataforma`: no tocar sin gate explícito.

## 2. Fuentes obligatorias vigentes
1. maestros y addenda activos;
2. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
3. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
4. `ADDENDUM-MAESTRO-LOCK-ESTABILIDAD-ACUMULATIVA-CXORBIA-TYA-20260731.md`;
5. addenda C6 de dominio, Finanzas/Liquidaciones, Portal Shopper, Reservas y Entrada/Usuarios;
6. `evidence/CORTE6-HUMAN-CUMULATIVE-VISUAL-P0-LATEST.json` como evidencia histórica;
7. `evidence/CORTE6-LIVE-HR-DOMAIN-READONLY-AUDIT-LATEST.json`;
8. `evidence/CORTE6-CANONICAL-ROOT-FIX-HOSTING-LATEST.json`;
9. `evidence/CORTE6-DEV-ENTRY-P0-HOSTING-LATEST.json` como evidencia vigente de navegador real;
10. adapters v2, adapter de entrada y gates;
11. `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, tracker, PR#7 y HEAD vivo.

Los PASS técnicos previos al P0 son evidencia histórica. El PASS remoto con navegador tampoco sustituye la aprobación humana acumulativa requerida para freeze.

## 3. Baseline protegida
Corte3 FROZEN; R17N1,406/1,406; Corte5 14/616 PASS; Auth/claims/Rules PASS; HR live/auto-month PASS; perfil protegido120/329 PASS; finanzas/pagos canónicos preservados.

## 4. Root fix de dominio publicado
Decisión preservada:
`PASS_C6_CANONICAL_ROOT_FIX_EXISTING_HOSTING_DEV_REMOTE_SMOKE`.

HR:14 periodos/616 visitas/208 shoppers; julio44=GT34+HN10, realizadas40, cuestionario38, submitidas33, fuera de rango accionable1 y duplicados técnicos0.

## 5. Entrada/usuarios P0 cerrada técnicamente
La validación humana probó dos defectos:
- URL base con `Conectado · Bloqueado`;
- selector genérico de perfiles antes del login real.

La corrección definitiva:
- normaliza la URL base al carril protegido antes del arranque;
- elimina el selector genérico del DOM;
- muestra un solo login de producto: Tipo de acceso + Usuario + Contraseña;
- preserva Firebase Auth/claims/Rules y sesión existente;
- prueba Chromium limpio local y remoto con `connected` persistido.

Decisión:
`PASS_C6_DEV_ENTRY_SINGLE_PRODUCT_LOGIN_EXISTING_HOSTING_REMOTE_BROWSER`.

## 6. Contratos vigentes
- HR es autoridad operacional.
- Una faceta canónica alimenta todas las superficies.
- Identidad por llaves técnicas exactas; nunca por nombre/teléfono/email.
- Perfil completo por campos reales.
-40 realizadas y33 submitidas deben aparecer en Liquidaciones sin inferir pagos.
- Refresh idempotente y estable.
- Reservas permanece fail-closed hasta fuente real.
- El carril protegido usa un solo login visible; no selector genérico ni pantalla técnica adicional.
- `/app/modules/*` y `/app/core/*` no fueron modificados por estos fixes.

## 7. Gate vivo
`HUMAN VISUAL ACUMULATIVA DEL BUILD PUBLICADO → APROBADO → FREEZE C6`.

Abrir la URL base; comprobar entrada/sesión, Dashboard/fases, comparativo, tres refresh, Shoppers, portal Shopper, Finanzas/Movimientos/Liquidaciones/Beneficios, Reportes y Reservas.

No solicitar otro deploy: la autorización fue consumida1/1.

## 8. Después del freeze
Fuente exacta de agosto y/o Reservas real según prioridad, cada bloque con contrato, autorización y gate propios. No copiar julio ni inventar datos.

## 9. Seguridad
Hosting DEV deploy1 en este bloque; Cloud Run deploys0; Firestore/Auth/Rules/Storage/HR/legacy/Make/Gemini/pagos/reservas writes0; nuevos Firebase/Hosting0; merge=false; producción=false.
