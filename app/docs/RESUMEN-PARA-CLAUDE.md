# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-01  
**Estado vivo:** `C6_REAL_STAFF_SHOPPER_E2E_HOSTING_DEV_PASS__PENDING_HUMAN_VISUAL_ACCUMULATIVE__NO_PRODUCTION`

## 1. No reabrir
- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR#7 draft/open/no merge.
- Corte3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5:14 periodos/616 visitas/current2026-07 PASS.
- Auth/claims/Rules, HR live/auto-month, perfil protegido y finanzas canónicas preservados.
- Producción `tya-plataforma` intacta.

## 2. P0 que Claude no debe reintroducir
Se probaron cuatro errores acumulados:
- URL base con fuente `connected` bloqueada;
- selector genérico antes del login;
- selector `Tipo de acceso` antes de autenticar;
- shopper autenticado con Firestore scoped de una visita reemplazando la HR de616 visitas.

Los PASS anteriores de carcasa quedaron invalidados porque no ejecutaban credenciales reales, claims, hidratación ni persistencia.

## 3. Root fix canónico preservado
Decisión:
`PASS_C6_CANONICAL_ROOT_FIX_EXISTING_HOSTING_DEV_REMOTE_SMOKE`.

Adapters v2 vigentes:
- composer/semántica/watcher;
- consistencia transversal;
- Finanzas/Liquidaciones;
- portal Shopper;
- Reservas fail-closed.

## 4. Entrada y usuarios — contrato vigente
Decisión autoritativa:
`PASS_C6_REAL_STAFF_SHOPPER_E2E_EXISTING_HOSTING_DEV`.

Implementación:
- `index-backend-dev.html` normaliza la URL base al carril protegido;
- `tya-dev-entry-auth-gate-v1.js` muestra solo Usuario + Contraseña;
- namespace, rol, tenant y proyecto se derivan de Firebase claims;
- solo una identidad realmente dual puede elegir perfil, después de validar credenciales;
- no hay selector genérico, `Tipo de acceso`, segunda pantalla técnica ni panel diagnóstico visible;
- `tya-protected-auth-hr-authority-bridge-v1.js` restaura la HR viva después del read Firestore y compone el overlay protegido con llaves técnicas exactas;
- HR mantiene616 visitas para staff y shopper; Firestore no reemplaza la operación;
- credenciales, tokens y UIDs no se guardan ni se publican.

## 5. Evidencia E2E real
Pruebas local predeploy y remota postdeploy con cuentas DEV existentes:

### Staff
- rol real `coordinador`;
- namespace `staff`;
-616 visitas;
-194 shoppers;
- refresh y nueva pestaña preservan sesión y contexto.

### Shopper
- rol `shopper`;
- namespace `shopper`;
-616 visitas canónicas preservadas;
-208 shoppers en el modelo compuesto;
-1 visita propia en la identidad probada;
- identidad exacta resuelta;
- refresh y nueva pestaña preservan sesión, claims, proyecto e histórico.

No se crearon usuarios ni se cambiaron contraseñas.

## 6. Contratos que Claude debe incorporar nativamente
- HR manda periodos, visitas y estado operativo antes y después de Auth.
- Auth/Firestore aportan principal, claims, alcance y overlay protegido; nunca sustituyen HR.
- Una sola faceta canónica alimenta Dashboard, fases, detalle, histórico, portal y Finanzas.
- Identidad Shopper solo por llaves técnicas exactas y crosswalk auditable.
- Conflictos sin match exacto pasan a review queue.
- Perfil completo por campos reales.
- Portal Shopper muestra todas las visitas de la identidad canónica.
- Toda realizada entra a Liquidaciones; sin cruce exacto no hay lote/pago.
- Refresh y nueva pestaña no recomp ponen desde estado ya enriquecido ni degradan HR.
- Reservas usa backend configurable o queda fail-closed.
- El login del producto es único y no pide al usuario declarar su rol.

## 7. Baseline técnica
HR:14 periodos/616 visitas/208 shoppers; JUL44=GT34+HN10; realizadas40; cuestionario38; submitidas33; liquidationCandidates33; fuera de rango accionable1; evidencia histórica7; duplicados técnicos0.

## 8. Regla frontend
`/app/modules/*` y `/app/core/*` no fueron modificados por este root fix. Claude debe consumir adapters/contratos y no duplicar semántica HR, identidad, finanzas o autenticación dentro de módulos.

## 9. Validación humana pendiente
Comprobar acumulativamente:
- URL base muestra solo Usuario + Contraseña o restaura sesión;
- no aparece selector genérico, `Tipo de acceso` ni panel técnico;
- Dashboard/fases44/40/38/33/1;
- comparativo histórico;
- tres refresh/focus sin crecimiento ni salto;
- identidad/perfil/certificación/histórico Shopper coherentes;
- Finanzas, Movimientos, Liquidaciones y Beneficios consistentes;
- Reportes sin pérdida;
- Reservas read-only/fuente pendiente.

Solo con `APROBADO` se congela Corte6.

## 10. Agosto y Reservas
Después del freeze, conectar fuente exacta de agosto y/o Reservas real. No copiar julio ni activar writes sin autorización y gate específicos.

## 11. Academia/manuales
Incorporar login único sin selector previo, derivación por claims, HR como autoridad después de Auth, overlay protegido, restauración de sesión, pruebas E2E con principal real y bloqueo de PASS de carcasa.

## 12. Estado seguro
Hosting DEV deploy1; usuarios creados0; Auth writes0; cambios/resets de contraseña0; Firestore/Rules/Storage/HR/legacy/Make/Gemini/pagos/Reservas writes0; Cloud Run deploys0; nuevos Firebase/Hosting0; credenciales/tokens exportados0; merge=false; producción=false.
