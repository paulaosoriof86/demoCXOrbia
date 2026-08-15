# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-15 17:03 -06:00  
**Estado vigente:** `PHASE_A_ROOT_CAUSE_TRACKER_35__I3_LEGAL_PROVIDER_SOURCE_ONLY_PASS__NO_FRONTEND_REDESIGN`

## Estado real

El porcentaje operativo vigente **no es 93%**. El tracker forense prevalente certifica I1 `15/15`, I2 `20/20`, I3 `0/25`, I4 `0/25`, I5 `0/15`: **35% completado / 65% pendiente**.

El Shopper histórico exacto de I3 está PASS y congelado en run `31906391682`. No repetir reset/recovery/reconcile ni acceder a su credencial; toda continuación `passwordResets=0`.

Request08 (`31909354336` / `95071998299`) llegó al Admin real y se detuvo antes de Alta por `I3_ADMIN_LEGAL_CONFIDENTIALITY_GATE_PENDING_BEFORE_CREATE`. No hubo Shopper nuevo ni Auth/Firestore writes; no se automatizó consentimiento legal.

## Backend conectado/preparado en este bloque

Source final `0602d6ca0f64280222a4b1522b36f3be77c65c87`; gate push `31913700755` / job `95082399402` SUCCESS.

Quedó preparado source-only:
- contrato durable de aceptación legal exact-identity/account-scoped/versioned;
- provider runtime para `legal.acceptance.record`;
- actor desde Firebase token verificado, no UID cliente;
- `acceptedAt` server-side;
- receipt create-only/idempotente con provider ACK;
- read model provider-authoritative y fail-closed;
- browser bridge memory-only, sin localStorage authority;
- automaticAcceptance=false.

No se activó este bridge en `app/index-backend-dev.html`, no hubo provider IO real y no se tocaron `/app/modules` ni `/app/core` en este bloque.

## Claude / prototipo

**No rediseñar Shoppers ni el gate legal.** El flujo humano del prototipo se conserva como superficie de aceptación. Cuando el backend sea autorizado/activado, esa superficie deberá consumir el read model provider y registrar el receipt por el command boundary; no debe inventarse otro modal, force-click ni aceptación automática.

`#bnOk` es un banner informativo, nunca consentimiento legal.

En `app/modules/configuracion.js`, el texto NDA actual y “Guardar NDA” siguen siendo superficie demo/local; no son todavía contenido legal provider-authoritative. No asumir que ese texto es el acuerdo TyA definitivo ni publicarlo como tal. La revisión legal exacta, versión y digest es un gate humano previo.

`app/modules/administrabilidad.js` conserva lenguaje de demo/local sobre aceptaciones. No corregirlo desde backend ahora; documentar su actualización futura solo cuando el provider legal real quede activado y validado.

Mantener intactas la interfaz pública de `CX.data`, el formulario canónico de login y la arquitectura modular aprobada.

## Academia / manuales

Documentar únicamente que la aceptación legal productiva será humana, versionada y persistente por cuenta/scope con auditoría provider. No enseñar ni simular que QA/GitHub/automatizaciones aceptan por el usuario. Academia/Certificación del histórico siguen diferidas, no PASS.

## Pendiente real

Antes de reanudar Admin/new Shopper debe revisarse humanamente el contenido legal TyA exacto, versión y digest y, si aún no existe en provider, autorizar su materialización. Luego se requiere aceptación humana real con ACK provider y solo después continuar create/update/readback/login/reload/new-tab/segundo contexto del Shopper nuevo.

## Siguiente gate

`PAULA_REVIEW_REQUIRED_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_PROVIDER_WRITE_AND_ADMIN_NEW_SHOPPER_RESUME`

PR #7 permanece draft/open/no merge. Sin deploy ni producción.
