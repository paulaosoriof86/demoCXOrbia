# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-01  
**Estado vivo:** `C6_DEV_ENTRY_SINGLE_PRODUCT_LOGIN_REMOTE_BROWSER_PASS__PENDING_HUMAN_VISUAL_ACCUMULATIVE__NO_PRODUCTION`

## 1. No reabrir
- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR#7 draft/open/no merge.
- Corte3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5:14 periodos/616 visitas/current2026-07 PASS.
- Auth/claims/Rules PASS; HR live/auto-month PASS; perfil protegido y finanzas canónicas preservados.
- Producción `tya-plataforma` intacta.

## 2. P0 que Claude no debe reintroducir
El build anterior mostró inconsistencias de dominio y dos regresiones de acceso:
- URL base con fuente `connected` bloqueada;
- selector genérico `Selecciona un perfil` antes del login real.

La corrección anterior de login único era parcial: eliminó una segunda pantalla técnica, pero dejó el selector genérico como paso previo. No repetir ese patrón.

## 3. Root fix canónico publicado
Decisión preservada:
`PASS_C6_CANONICAL_ROOT_FIX_EXISTING_HOSTING_DEV_REMOTE_SMOKE`.

Adapters v2 vigentes:
- composer/semántica/watcher;
- consistencia transversal;
- Finanzas/Liquidaciones;
- portal Shopper;
- Reservas fail-closed.

## 4. Entrada y usuarios publicada
Decisión vigente:
`PASS_C6_DEV_ENTRY_SINGLE_PRODUCT_LOGIN_EXISTING_HOSTING_REMOTE_BROWSER`.

Implementación:
- `index-backend-dev.html` normaliza la URL base al carril protegido antes de cargar configuraciones;
- `adapters/tya-dev-entry-auth-gate-v1.js` elimina el selector genérico del DOM;
- el único acceso visible solicita Tipo de acceso + Usuario + Contraseña;
- namespaces `staff` y `shopper` permanecen separados;
- Firebase Auth/claims/Rules siguen siendo autoridad;
- una sesión válida se restaura sin pedir otra vez credenciales;
- no se almacenan ni embeben contraseñas, tokens o UIDs.

Validación ejecutada con Chromium real local y remoto, presembrando `localStorage=connected`. Se comprobó ausencia de selector genérico, pantalla técnica adicional y tarjeta bloqueada.

## 5. Contratos que Claude debe incorporar nativamente
- HR manda periodos, visitas y estado operativo.
- Una sola faceta canónica alimenta Dashboard, fases, detalle, histórico, portal y Finanzas.
- Identidad Shopper solo por llaves técnicas exactas y crosswalk auditable.
- Conflictos sin match exacto pasan a review queue.
- Perfil completo por campos reales.
- Portal Shopper muestra todas las visitas de la identidad canónica.
- Toda realizada entra a Liquidaciones; sin cruce exacto no hay lote/pago.
- Refresh de la misma revisión no recompone ni rerenderiza.
- Reservas usa backend configurable o queda fail-closed.
- El login del producto es único; rol visible y namespace de Auth no son pantallas separadas.

## 6. Baseline técnica
HR:14 periodos/616 visitas/208 shoppers; JUL44=GT34+HN10; realizadas40; cuestionario38; submitidas33; liquidationCandidates33; fuera de rango accionable1; evidencia histórica7; duplicados técnicos0.

## 7. Regla frontend
`/app/modules/*` y `/app/core/*` no fueron modificados por estos fixes. Claude debe consumir adapters/contratos y no duplicar semántica HR, identidad, finanzas o autenticación dentro de módulos.

## 8. Validación humana pendiente
Comprobar acumulativamente:
- URL base entra directamente al login real o restaura sesión;
- no aparece selector genérico;
- Dashboard/fases44/40/38/33/1;
- comparativo histórico;
- tres refresh/focus sin crecimiento ni salto;
- identidad/perfil/certificación/histórico Shopper coherentes;
- Finanzas, Movimientos, Liquidaciones y Beneficios consistentes;
- Reportes sin pérdida;
- Reservas read-only/fuente pendiente.

Solo con `APROBADO` se congela Corte6.

## 9. Agosto y Reservas
Después del freeze, conectar fuente exacta de agosto y/o Reservas real. No copiar julio ni activar writes sin autorización y gate específicos.

## 10. Academia/manuales
Incorporar login único, diferencia rol/namespace, restauración de sesión, autoridad Firebase, navegación fail-closed, pruebas de navegador real y todos los contratos canónicos de dominio.

## 11. Estado seguro
Hosting DEV deploy1 en este bloque; Cloud Run deploys0; Firestore/Auth/Rules/Storage/HR/legacy/Make/Gemini/pagos/reservas writes0; nuevos Firebase/Hosting0; merge=false; producción=false.
