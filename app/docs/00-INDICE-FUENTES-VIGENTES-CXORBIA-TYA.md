# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-01  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `C6_REAL_STAFF_SHOPPER_E2E_HOSTING_DEV_PASS__PENDING_HUMAN_VISUAL_ACCUMULATIVE__NO_PRODUCTION`

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
9. `evidence/CORTE6-REAL-USERS-E2E-HOSTING-LATEST.json` como evidencia autoritativa vigente de staff y shopper reales;
10. `evidence/CORTE6-REAL-USERS-E2E-FAILURE-LATEST.json` solo como clasificación del trigger duplicado bloqueado después del PASS;
11. adapters canónicos, `tya-dev-entry-auth-gate-v1.js`, `tya-protected-auth-hr-authority-bridge-v1.js` y gates E2E;
12. `RESUMEN-PARA-CLAUDE.md`, `PENDIENTES-PROTOTIPO.md`, tracker, PR#7 y HEAD vivo.

Los PASS de carcasa anteriores al E2E real son evidencia histórica y no deben usarse como estado de release. El PASS E2E tampoco sustituye la aprobación visual humana acumulativa requerida para freeze.

## 3. Baseline protegida
Corte3 FROZEN; R17N1,406/1,406; Corte5 14/616 PASS; Auth/claims/Rules PASS; HR live/auto-month PASS; perfil protegido y finanzas/pagos canónicos preservados.

## 4. Root fix de dominio publicado
Decisión preservada:
`PASS_C6_CANONICAL_ROOT_FIX_EXISTING_HOSTING_DEV_REMOTE_SMOKE`.

HR:14 periodos/616 visitas/208 shoppers; julio44=GT34+HN10, realizadas40, cuestionario38, submitidas33, fuera de rango accionable1 y duplicados técnicos0.

## 5. Entrada/usuarios P0 — estado vigente
La validación humana demostró tres defectos sucesivos:
- URL base con `Conectado · Bloqueado`;
- selector genérico antes del login;
- selector `Tipo de acceso` que seguía obligando al usuario a declarar su rol.

La prueba E2E real añadió la causa estructural: un shopper autenticado recibía una vista Firestore de una visita y esa vista reemplazaba temporalmente la HR de616 visitas.

La corrección vigente:
- muestra solo Usuario + Contraseña;
- deriva namespace, rol, tenant y proyecto desde claims;
- solo una identidad realmente dual puede elegir perfil después de validar credenciales;
- elimina panel técnico y login paralelo del flujo humano;
- HR viva conserva616 visitas y Firestore autenticado funciona únicamente como overlay exacto de identidad/perfil;
- valida cuentas DEV existentes staff y shopper, refresh y nueva pestaña, local y remoto.

Decisión autoritativa:
`PASS_C6_REAL_STAFF_SHOPPER_E2E_EXISTING_HOSTING_DEV`.

## 6. Contratos vigentes
- HR es autoridad operacional incluso después de autenticar un shopper.
- Firestore/Auth aportan principal, claims, alcance, perfil y overlay; no reemplazan HR.
- Una faceta canónica alimenta todas las superficies.
- Identidad por llaves técnicas exactas; nunca por nombre/teléfono/email.
- Perfil completo por campos reales.
-40 realizadas y33 submitidas deben aparecer en Liquidaciones sin inferir pagos.
- Refresh y nueva pestaña preservan principal, proyecto, HR y navegación.
- Reservas permanece fail-closed hasta fuente real.
- El carril protegido usa un único login Usuario + Contraseña.
- `/app/modules/*` y `/app/core/*` no fueron modificados por este root fix.

## 7. Gate vivo
`HUMAN VISUAL ACUMULATIVA DEL BUILD PUBLICADO → APROBADO → FREEZE C6`.

Abrir la URL base; comprobar entrada/sesión, Dashboard/fases, comparativo, tres refresh, Shoppers, portal Shopper, Finanzas/Movimientos/Liquidaciones/Beneficios, Reportes y Reservas.

No solicitar otro deploy: la autorización fue consumida1/1 con PASS. Un trigger duplicado posterior fue bloqueado sin segundo deploy.

## 8. Después del freeze
Fuente exacta de agosto y/o Reservas real según prioridad, cada bloque con contrato, autorización y gate propios. No copiar julio ni inventar datos.

## 9. Seguridad
Hosting DEV deploy1; usuarios creados0; Auth writes0; cambios/resets de contraseña0; Firestore/Rules/Storage/HR/legacy/Make/Gemini/pagos/Reservas writes0; Cloud Run deploys0; nuevos Firebase/Hosting0; credenciales/tokens exportados0; merge=false; producción=false.
