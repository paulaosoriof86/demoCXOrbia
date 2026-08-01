# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-01  
**Estado:** `C6_DEV_ENTRY_SINGLE_PRODUCT_LOGIN_REMOTE_BROWSER_PASS__PENDING_HUMAN_VISUAL_ACCUMULATIVE__NO_PRODUCTION`

## 1. Estado protegido
- Repo `paulaosoriof86/demoCXOrbia`; rama viva `docs-tya-v6-v71-audit`; PR#7 draft/open/no merge.
- Corte3 FROZEN y R17N1,406/1,406 no se repiten.
- Corte5 14 periodos/616 visitas PASS.
- Auth/claims/Rules PASS; HR live/auto-month PASS; perfil protegido120/329 PASS; finanzas/pagos canónicos preservados.
- Producción `tya-plataforma` intacta.

## 2. P0 humanos históricos — conservar
La validación humana probó dos defectos de entrada además del P0 de dominio:
1. la ruta base podía abrir `Conectado · Bloqueado / Fuente de datos no disponible`;
2. la ruta protegida mostraba primero el selector genérico `Selecciona un perfil`, aunque el login real de Usuario + Contraseña ya había sido implementado detrás.

La corrección anterior de “login único” era incompleta: eliminó la segunda pantalla técnica, pero no eliminó el selector genérico ni aseguró la entrada desde la URL base. El defecto estaba trasladado, no cerrado.

## 3. Causa raíz y corrección
- `index-backend-dev.html` no normalizaba la entrada base al carril protegido.
- El estado `connected` persistido se bloqueaba correctamente cuando el carril no quedaba activo.
- El selector genérico permanecía en el DOM y podía seguir visible.
- Los smokes anteriores comprobaban assets/API, no un navegador limpio con el estado real del usuario.

Corrección aplicada sin tocar `app/modules/*` ni `app/core/*`:
- bootstrap canónico temprano para preview + protected runtime + proyecto `cinepolis`;
- adapter `tya-dev-entry-auth-gate-v1.js`;
- selector genérico eliminado del DOM en el carril protegido;
- un solo login de producto: Tipo de acceso + Usuario + Contraseña;
- Firebase Auth/claims/Rules y restauración de sesión preservados;
- gate estático y Chromium real, local y remoto, con `localStorage=connected` presembrado.

## 4. Deploy y evidencia
Autorización exacta de Paula consumida una vez.

- Hosting DEV existente `cxorbia-backend-dev/cxorbia-dev`;
- deploy ejecutado: `1/1`;
- decisión: `PASS_C6_DEV_ENTRY_SINGLE_PRODUCT_LOGIN_EXISTING_HOSTING_REMOTE_BROWSER`;
- evidencia: `app/docs/evidence/CORTE6-DEV-ENTRY-P0-HOSTING-LATEST.json`.

El navegador remoto confirmó:
- URL base normalizada automáticamente;
- login directo visible;
- selector genérico ausente;
- segunda pantalla técnica ausente;
- tarjeta de fuente bloqueada ausente;
- continuidad Firebase preservada;
- cero credenciales embebidas.

## 5. Root fix canónico preservado
Siguen PASS:
- dominio canónico;
- Finanzas/Liquidaciones;
- portal Shopper;
- Reservas fail-closed;
- HR viva row-level.

Baseline:14 periodos/616 visitas/208 shoppers; JUL44=GT34+HN10; realizadas40; cuestionario38; submitidas33; liquidationCandidates33; fuera de rango accionable1; evidencia histórica7; duplicados técnicos0.

## 6. Pendiente exacto para congelar Corte6
Validación humana acumulativa del build publicado:
1. abrir la URL base y comprobar entrada directa o restauración silenciosa de sesión, sin selector genérico;
2. Dashboard/fases44/40/38/33/1;
3. comparativo histórico;
4. tres refresh/focus sin crecimiento, cambio de periodo o salto de scroll;
5. identidad, perfil, certificación e histórico Shopper coherentes;
6. Finanzas/Movimientos/Liquidaciones/Beneficios en el mismo periodo, incluyendo40 realizadas y33 submitidas;
7. Reportes sin pérdida;
8. Reservas read-only/fuente pendiente, sin datos demo ni mutaciones.

Solo con resultado humano `APROBADO` se congela Corte6.

## 7. Después del freeze
Fuente exacta de agosto y/o Reservas real según prioridad operativa, con contratos y gates separados. No copiar julio ni activar writes sin autorización específica.

## 8. Seguridad
En este bloque: Hosting deploy1; Cloud Run deploys0; Firestore/Auth/Rules/Storage/HR/legacy/Make/Gemini/pagos/reservas writes0; nuevos Firebase/Hosting0; merge=false; producción=false.
