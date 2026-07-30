# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-30  
**Estado vivo:** `CORTE6_AUTH_RBAC_READONLY_RECONCILED__NO_FRONTEND_P0_PROVEN__NO_PRODUCTION`

Este archivo registra únicamente pendientes frontend reales y dependencias backend que condicionan cuándo Claude debe intervenir.

## 1. No reabrir
- M1 / Corte 1 / Corte 2A: FROZEN/APROBADO.
- Corte 3: FROZEN sobre `CXORBIA-TYA-CORTE3-V182-20260729`.
- R17N FINAL: 1,406/1,406 writes + readback exacto; no repetir.
- Corte 5: P0 proyecto/periodo ya corregido en backend; re-smoke PASS 14 periodos/616 visitas.
- No crear V183/R33, nueva base Firebase, nuevo Hosting, rama o PR.

## 2. Dependencia viva — Corte 6 Auth/RBAC, NO frontend
La visual real se encuentra bloqueada por acceso seguro a Firestore, no por módulos UI.

Read-only comprobado:
- 7 operadores Auth ya cumplen reglas vigentes.
- 2 clientes TyA no tienen `projectIds=['cinepolis']`.
- 4 shoppers TyA no tienen proyecto canónico; 3 sí tienen `shopperId` exacto y pueden normalizarse; el cuarto permanece sin automerge.
- scopes previos `tya` / `tya-piloto` no equivalen al proyecto canónico Phase A `cinepolis`.

Backend ya preparó gate Firebase Auth interactivo, queries acotadas por principal y delta mínimo de Rules/claims. No corresponde a Claude implementarlo desde UI.

## 3. Claude — intervención actual
**Ninguna por rutina. No solicitar nueva candidata.**

Solo abrir tarea Claude si, después de ejecutar Auth/RBAC, redeploy del Hosting DEV existente y smoke real, aparece un P0 reproducible localizado en archivo/módulo.

Validar entonces:
1. proyecto/periodo correcto por rol;
2. Cliente limitado a proyecto autorizado;
3. Shopper ve su historial y disponibles autorizadas;
4. shopper no vinculado no obtiene acceso por inferencia;
5. Academia/manuales según rol;
6. copy sin IDs internos/claims/source-safe;
7. no regresión en postulaciones, visita, certificación, finanzas o navegación.

## 4. Pendientes P1/P2 no bloqueantes preservados
- PDF: gráfica ausente al imprimir/exportar.
- Excel: formato básico/no final.
- `reportKit`: consolidación transversal y exportaciones fuera de Dashboard.
- copy de fuentes/readiness: mantener lenguaje humano, no técnico.

Estos pendientes se documentan, pero no deben impedir cerrar Auth, agosto ni el cutover si no constituyen P0 Phase A.

## 5. Agosto — dependencia backend/fuente
- Fuente materializada termina en julio 2026.
- `Agosto HN` sigue HOLD por inconsistencia país/tab.
- No construir agosto manualmente desde frontend.
- Después del smoke Auth: refresh HR, resolver HOLD por fuente, validar visitas disponibles y materializar solo delta agosto.

## 6. Academia/manuales
Agregar/actualizar contenido para:
- autenticación real vs selector visual de rol;
- claims tenant/proyecto como alcance;
- `shopperId` como vínculo de identidad;
- visita disponible con autorización segura;
- conflicto de permisos/identidad a revisión humana;
- nunca ampliar acceso por coincidencia de nombre o por rol seleccionado localmente.

## 7. Estado seguro
PR #7 draft/open/no merge. Auth writes=0; Rules deploy=0; Hosting deploy=0 durante preparación Corte 6; Firestore data writes=0; producción=false. La autorización de redeploy del Hosting DEV existente sigue reservada 0/1.
