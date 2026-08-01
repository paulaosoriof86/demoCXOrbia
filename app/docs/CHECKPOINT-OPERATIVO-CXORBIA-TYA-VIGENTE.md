# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-01  
**Estado:** `C6_REAL_STAFF_SHOPPER_E2E_HOSTING_DEV_PASS__PENDING_HUMAN_VISUAL_ACCUMULATIVE__NO_PRODUCTION`

## 1. Estado protegido
- Repo `paulaosoriof86/demoCXOrbia`; rama viva `docs-tya-v6-v71-audit`; PR#7 draft/open/no merge.
- Corte3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 14 periodos/616 visitas PASS.
- Auth/claims/Rules, HR live/auto-month, perfil protegido y finanzas/pagos canónicos preservados.
- Producción `tya-plataforma` intacta.

## 2. P0 de usuarios reproducido y causa raíz
La revisión humana probó que el PASS anterior era incompleto:
1. la ruta base podía quedar `Conectado · Bloqueado`;
2. después apareció el selector genérico de perfiles;
3. al sustituirlo por `Tipo de acceso`, la interfaz seguía obligando al usuario a declarar su rol;
4. el smoke anterior solo comprobaba la carcasa del formulario, no autenticaba cuentas reales;
5. al autenticar un shopper real, Firestore devolvía su vista protegida de una visita y `backend-firebase.js` reemplazaba temporalmente la HR canónica de616 visitas.

El defecto transversal era: `Auth/Firestore scoped state` estaba actuando como fuente operacional en vez de overlay exacto sobre HR.

## 3. Root fix aplicado
Sin modificar `app/modules/*` ni `app/core/*`:
- `tya-dev-entry-auth-gate-v1.js` muestra únicamente Usuario + Contraseña;
- namespace, rol, tenant y proyecto se derivan de Auth/claims;
- una opción de perfil solo puede aparecer después de validar credenciales y únicamente para una identidad realmente dual;
- selector genérico, `Tipo de acceso`, login técnico paralelo y panel diagnóstico quedan fuera del flujo humano;
- `tya-protected-auth-hr-authority-bridge-v1.js` captura el estado Firestore autenticado, restaura la HR viva y recompone con el composer v2 por llaves técnicas exactas;
- HR conserva siempre las616 visitas; Firestore solo enriquece identidad, perfil, claims y alcance;
- duplicados, anexos sin match exacto y dedupe por nombre/teléfono/email permanecen bloqueados.

## 4. E2E real antes y después del deploy
Se seleccionaron de forma privada cuentas DEV existentes; no se crearon usuarios, no se cambiaron contraseñas y ningún valor sensible salió a logs o evidencias.

### Local predeploy
- staff real: rol `coordinador`, namespace `staff`,616 visitas,194 shoppers;
- shopper real: rol `shopper`, namespace `shopper`,616 visitas,208 shoppers,1 visita propia;
- HR authority preservada;
- identidad exacta resuelta;
- refresh y nueva pestaña preservan sesión.

### Remoto después del deploy
Los mismos casos repitieron PASS en `cxorbia-backend-dev`:
- staff real:616 visitas, refresh PASS, nueva pestaña PASS;
- shopper real:616 visitas, histórico propio visible, refresh PASS, nueva pestaña PASS;
- formulario de credenciales desaparece después de entrar;
- sin selector de acceso, sin selector genérico y sin panel técnico.

Decisión autoritativa:
`PASS_C6_REAL_STAFF_SHOPPER_E2E_EXISTING_HOSTING_DEV`.

Evidencia:
`app/docs/evidence/CORTE6-REAL-USERS-E2E-HOSTING-LATEST.json`.

## 5. Deploy y consumo
- Hosting DEV existente `cxorbia-backend-dev/cxorbia-dev`;
- deploy ejecutado: `1/1`;
- autorización consumida con PASS;
- una ejecución duplicada que llegó después fue bloqueada en autorización y no ejecutó otro deploy; no es una falla del producto y quedó clasificada como `SUPERSEDED_DUPLICATE_TRIGGER_AFTER_CONSUMED_PASS`.

## 6. Root fix canónico preservado
Siguen PASS:
- dominio canónico;
- Finanzas/Liquidaciones;
- portal Shopper;
- Reservas fail-closed;
- HR viva row-level.

Baseline:14 periodos/616 visitas/208 shoppers; JUL44=GT34+HN10; realizadas40; cuestionario38; submitidas33; liquidationCandidates33; fuera de rango accionable1; evidencia histórica7; duplicados técnicos0.

## 7. Pendiente exacto para congelar Corte6
Validación humana acumulativa del build publicado:
1. abrir la URL base; debe aparecer solo Usuario + Contraseña o restaurarse la sesión;
2. entrar con una cuenta habitual y confirmar que no aparece `Tipo de acceso`, selector de perfiles ni panel técnico;
3. Dashboard/fases44/40/38/33/1;
4. comparativo histórico;
5. tres refresh/focus sin crecimiento, cambio de periodo o salto de scroll;
6. identidad, perfil, certificación e histórico Shopper coherentes;
7. Finanzas/Movimientos/Liquidaciones/Beneficios en el mismo periodo, incluyendo40 realizadas y33 submitidas;
8. Reportes sin pérdida;
9. Reservas read-only/fuente pendiente, sin datos demo ni mutaciones.

Solo con resultado humano `APROBADO` se congela Corte6.

## 8. Después del freeze
Fuente exacta de agosto y/o Reservas real según prioridad operativa, con contratos y gates separados. No copiar julio ni activar writes sin autorización específica.

## 9. Seguridad
Hosting DEV deploy1; usuarios creados0; Auth writes0; cambios/resets de contraseña0; Firestore/Rules/Storage/HR/legacy/Make/Gemini/pagos/Reservas writes0; Cloud Run deploys0; nuevos Firebase/Hosting0; credenciales/tokens exportados0; merge=false; producción=false.
