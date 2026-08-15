# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-15 17:31 -06:00  
**Estado vigente:** `PHASE_A_ROOT_CAUSE_TRACKER_35__I3_LEGAL_PROVIDER_SOURCE_ONLY_PASS__TYA_LEGAL_DRAFT_V0_1_PREPARED__NO_FRONTEND_REDESIGN`

## Estado real

El porcentaje operativo vigente **no es 93%**. El tracker forense prevalente certifica I1 `15/15`, I2 `20/20`, I3 `0/25`, I4 `0/25`, I5 `0/15`: **35% completado / 65% pendiente**.

El Shopper histórico exacto de I3 está PASS y congelado en run `31906391682`. No repetir reset/recovery/reconcile ni acceder a su credencial; toda continuación `passwordResets=0`.

Request08 (`31909354336` / `95071998299`) llegó al Admin real y se detuvo antes de Alta por `I3_ADMIN_LEGAL_CONFIDENTIALITY_GATE_PENDING_BEFORE_CREATE`. No hubo Shopper nuevo ni Auth/Firestore writes; no se automatizó consentimiento legal.

## Backend conectado/preparado

Source final técnico `0602d6ca0f64280222a4b1522b36f3be77c65c87`; gate push `31913700755` / job `95082399402` SUCCESS.

Quedó preparado source-only:
- contrato durable de aceptación legal exact-identity/account-scoped/versioned;
- provider runtime para `legal.acceptance.record`;
- actor desde Firebase token verificado, no UID cliente;
- `acceptedAt` server-side;
- receipt create-only/idempotente con provider ACK;
- read model provider-authoritative y fail-closed;
- browser bridge memory-only, sin localStorage authority;
- automaticAcceptance=false.

No se activó este bridge en `app/index-backend-dev.html`, no hubo provider IO real y no se tocaron `/app/modules` ni `/app/core`.

## Draft legal TyA V0.1

Paula autorizó preparar contenido legal para revisión humana sin Firebase ni aceptación. Se creó:
`app/docs/DRAFT-CONTENIDO-LEGAL-TYA-V0.1-REVISION-HUMANA-20260815.md`.

Incluye términos de uso, confidencialidad, privacidad, datos sensibles, evidencias, seguridad, propiedad intelectual, anexos por rol, anexos Guatemala/Honduras, aviso resumido y copy de aceptación humana. Está expresamente marcado `NOT_APPROVED`; no es contenido provider-authoritative.

## Claude / prototipo

**No rediseñar Shoppers ni el gate legal.** El flujo humano del prototipo se conserva como superficie de aceptación. Cuando el backend sea autorizado/activado, esa superficie deberá consumir el read model provider y registrar el receipt por el command boundary; no debe inventarse otro modal, force-click ni aceptación automática.

`#bnOk` es un banner informativo, nunca consentimiento legal.

En `app/modules/configuracion.js`, el texto NDA actual y “Guardar NDA” siguen siendo superficie demo/local; no son contenido legal provider-authoritative. No sustituirlos todavía por el draft V0.1 ni publicarlo como acuerdo definitivo.

Cuando exista versión final aprobada, el copy previsto exige acción humana afirmativa y controles no premarcados. Consentimientos opcionales deberán ir separados de los términos operativos obligatorios.

`app/modules/administrabilidad.js` conserva lenguaje de demo/local sobre aceptaciones. No corregirlo desde backend ahora; documentar su actualización futura solo cuando el provider legal real quede activado y validado.

Mantener intactas la interfaz pública de `CX.data`, el formulario canónico de login y la arquitectura modular aprobada.

## Academia / manuales

Preparar posteriormente contenidos por rol sobre confidencialidad, evidencias, credenciales, privacidad y nueva aceptación ante cambios legales materiales. No enseñar ni simular que QA/GitHub/automatizaciones aceptan por el usuario. Academia/Certificación del histórico siguen diferidas, no PASS.

## Pendiente real

Antes de reanudar Admin/new Shopper debe cerrarse humanamente el contenido legal TyA: identidad contractual por país, contactos, retención, proveedores activos, foro, titular/licenciante CXOrbia, política de datos bancarios/documentos y reglas de grabación/geolocalización. Después: versión final + digest final + aprobación humana. Solo entonces puede autorizarse materialización provider, aceptación humana real con ACK y el E2E Admin/new Shopper.

## Siguiente gate

`PAULA_REVIEW_REQUIRED_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_PROVIDER_WRITE_AND_ADMIN_NEW_SHOPPER_RESUME`

PR #7 permanece draft/open/no merge. Sin deploy ni producción.
