# PHASE A — TRACKER C6 USUARIOS E2E REAL PASS

**Fecha:** 2026-08-01  
**Estado:** `C6_REAL_STAFF_SHOPPER_E2E_HOSTING_DEV_PASS__PENDING_HUMAN_VISUAL_ACCUMULATIVE`

## Bloque atendido
Corte6 · Entrada, Auth, identidad y preservación de HR después de autenticación.

## Avance Phase A
- Login visible reducido a Usuario + Contraseña.
- Rol, namespace, tenant y proyecto derivados de claims.
- Staff real DEV validado local y remoto.
- Shopper real DEV validado local y remoto.
- HR viva preservada en616 visitas para ambos roles.
- Histórico propio Shopper validado.
- Refresh y nueva pestaña preservan sesión/contexto.
- Hosting DEV existente actualizado una sola vez.

## Hallazgo intermedio que cambió la solución
El shopper autenticaba correctamente, pero el read Firestore scoped de1 visita reemplazaba el modelo HR. El bloque no se cerró con la autenticación: se corrigió el ownership de fuentes mediante HR authority + protected overlay.

## Preservado
- Corte3 FROZEN.
- Corte5 14/616.
- dominio, finanzas, portal Shopper y Reservas fail-closed.
- interfaces de `CX.data`.
- `/app/modules/*` y `/app/core/*` sin cambios en este root fix.
- producción intacta.

## Documentado para Claude
- no selector de rol previo;
- claims como autoridad de acceso;
- HR como autoridad operacional posterior a Auth;
- Firestore scoped como overlay;
- E2E real obligatorio.

## Documentado para Academia
- smoke vs E2E;
- autoridad de fuentes;
- identidad exacta;
- persistencia;
- seguridad de evidencias.

## Pendiente real
Validación humana acumulativa del build publicado y `APROBADO → FREEZE C6`.

## Siguiente bloque exacto
`HUMAN VISUAL ACUMULATIVA: entrada → Dashboard/fases → histórico/refresh → Shoppers/portal → Finanzas → Reportes → Reservas`.

## Estado seguro
Hosting DEV deploy1; usuarios/Auth/contraseñas/datos/Rules/Cloud Run writes0; merge=false; producción=false.
