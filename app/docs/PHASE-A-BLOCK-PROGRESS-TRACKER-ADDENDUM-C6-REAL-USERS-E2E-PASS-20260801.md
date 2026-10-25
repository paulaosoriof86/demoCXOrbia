# PHASE A — TRACKER C6 ENTRADA DIRECTA + AUTH E2E AISLADA PASS

**Fecha:** 2026-08-01  
**Estado:** `C6_DIRECT_ROLE_ENTRY_HOSTING_DEV_PASS__PENDING_HUMAN_VISUAL_ACCUMULATIVE`

## Bloque atendido
Corte 6 · Entrada humana, Auth técnica, identidad y preservación de HR.

## Avance Phase A
- Entrada humana directa restaurada: Administración, Cliente y Shopper.
- Usuario + Contraseña eliminado del carril humano.
- `app.js` preservado como autoridad visual.
- Auth real aislada detrás de gate técnico privado.
- Staff real DEV validado local y remoto.
- Shopper real DEV validado local y remoto.
- HR viva preservada en 616 visitas para ambos principales técnicos.
- Histórico propio Shopper validado con 1 visita.
- Refresh y nueva pestaña preservan sesión/contexto técnico.
- Hosting DEV existente actualizado una sola vez.
- Autorización consumida con PASS.

## Hallazgos intermedios que cambiaron la solución
1. El formulario técnico había sustituido directamente los botones nativos.
2. Después de restaurar los botones, `backend-browser-auth.js` seguía interceptando `selectRole()` y abría credenciales integradas.
3. El carril humano debía deshabilitar backend Firebase/Auth integrada antes de `DOMContentLoaded`, sin modificar core.
4. El carril técnico debía reactivarlos explícitamente para conservar el E2E real.

## Decisión autoritativa
`PASS_C6_HUMAN_DIRECT_ROLE_ENTRY_AND_ISOLATED_AUTH_EXISTING_HOSTING_DEV`.

## Preservado
- Corte 3 FROZEN.
- Corte 5: 14 periodos/616 visitas.
- Dominio, Finanzas, portal Shopper, Reportes y Reservas fail-closed.
- Interfaces de `CX.data`.
- `/app/modules/*` y `/app/core/*` sin cambios en este root fix.
- Producción intacta.

## Documentado para Claude
- conservar selector directo de perfiles;
- no insertar Auth visible dentro del frontend;
- diferenciar experiencia humana, Auth y claims;
- HR como autoridad operacional;
- gates humano y técnico separados.

## Documentado para Academia
- selector de perfil vs autenticación vs autorización;
- smoke humano vs E2E técnico;
- autoridad de fuentes;
- identidad exacta;
- persistencia y seguridad de evidencias.

## Pendiente real
Validación humana acumulativa del build publicado y `APROBADO C6 → FREEZE`.

## Siguiente bloque exacto
`HUMAN VISUAL ACUMULATIVA: entrada → Dashboard/hoja de ruta → histórico/refresh → Shoppers/portales → Finanzas → Reportes → Reservas`.

Después:
`AGOSTO → DISPONIBLES → POSTULACIONES → GATE MULTIROL → CUTOVER → PRODUCCIÓN`.

## Estado seguro
Hosting DEV deploy 1; usuarios/Auth/contraseñas/datos/Rules/Cloud Run writes 0; merge=false; producción=false.