# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-15 18:05 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_HISTORICAL_PASS_FROZEN__REQUEST08_LEGAL_STOP_SAFE__LEGAL_PROVIDER_WIRING_SOURCE_ONLY_PASS__TYA_LEGAL_V0_2_NOCODE_DRAFT__REGISTERED_DOMICILE_RECOVERED_RESTRICTED__GO_LIVE_35__NO_PRODUCTION`

## Carril vivo

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; Firebase DEV `cxorbia-backend-dev`.

## Cerrado y no reprocesar

I1 PASS 15/15. I2 PASS 20/20. Shopper histórico I3 PASS congelado en run `31906391682`; reset histórico único consumido. Prohibido repetir reset/recovery/reconcile o acceder a credencial histórica. Toda continuación `passwordResets=0`.

Request08 run `31909354336`, job `95071998299`: STOP seguro `I3_ADMIN_LEGAL_CONFIDENTIALITY_GATE_PENDING_BEFORE_CREATE`. Request consumido; no Shopper nuevo; Auth/Firestore writes `0/0`; aceptación automática `0`.

## Autoridad legal durable — source-only PASS

Source técnico final `0602d6ca0f64280222a4b1522b36f3be77c65c87`; gate push `31913700755` / `95082399402` SUCCESS; gate PR `31913704247` / `95082407608` SUCCESS.

Exact identity, human-only, versioned receipt, server timestamp, provider ACK, read model provider-authoritative/fail-closed y browser bridge no activado. Provider/Auth/Firestore/legal writes reales `0`.

## TyA legal V0.2 — no-code / rebrand-safe

Vigentes:
- `backend/contracts/cxorbia-tenant-legal-nocode-profile-v1.json`
- `app/docs/DRAFT-CONTENIDO-LEGAL-TYA-V0.2-NOCODE-REVISION-HUMANA-20260815.md`
- `app/docs/DECISION-LOCK-TYA-LEGAL-V0.2-NOCODE-20260815.md`
- base V0.1 preservada.

Decisiones humanas ya cerradas: empresa mercantil individual en Guatemala; Honduras desde Guatemala; contacto editable; rebranding dinámico; retención 60 mínimo/90 default crudo; Provider Registry dinámico; arbitraje diferenciado; IP separada de marca; cuenta bancaria completa protegida; documentos mínimos; evidencias por proyecto; revisión jurídica final.

## Domicilio — resuelto en fuente, protegido

Se recuperó read-only el RTU vigente y se confirmó el domicilio fiscal/comercial registrado de TyA. Como coincide con una residencia privada, el valor exacto se clasifica como restringido y **no se copia al repo ni se publica automáticamente**.

El contrato no-code ahora separa:
- `registeredLegalDomicileRestricted`: valor completo protegido;
- `publicLegalAddress`: valor público explícitamente aprobado;
- `publicLegalAddressMode`: dirección completa aprobada, localidad o canal cuando sea jurídicamente suficiente.

No volver a pedir a Paula el domicilio registrado. Solo queda validar con abogado qué nivel debe mostrarse públicamente.

## No-code obligatorio

Todos los valores TyA son exclusivos del tenant TyA. Otros tenants reutilizan el esquema, no los valores. Legal, branding, retención, proveedores y evidencias deben ser administrables en plataforma viva y provider-authoritative. Un cambio material genera revisión/versionado; no reescribe aceptaciones históricas.

No se modificó `/app/modules`, `/app/core` ni product entrypoint desde backend.

## Pendiente real antes de candidata legal final

1. validación jurídica de dirección pública;
2. revisión jurídica Guatemala/Honduras;
3. consolidar V0.1 + V0.2 en texto final único;
4. versión final + SHA-256 final;
5. aprobación humana final;
6. solo después materialización provider-authoritative + aceptación humana + Admin → único Shopper nuevo.

El nombre final del rebranding no es bloqueo técnico: el contrato utiliza “la Plataforma” + `platform.displayName` dinámico.

## Progreso

I1 `15/15`; I2 `20/20`; I3 `0/25`; I4 `0/25`; I5 `0/15`.

**35% completado / 65% pendiente.**

## Gate siguiente

`PAULA_REVIEW_REQUIRED_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_PROVIDER_WRITE_AND_ADMIN_NEW_SHOPPER_RESUME`

No request09, provider writes, deploy, merge ni producción antes de aprobación humana final del contenido legal y autorización específica.
