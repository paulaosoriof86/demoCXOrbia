# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-15 17:52 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_HISTORICAL_PASS_FROZEN__REQUEST08_LEGAL_STOP_SAFE__LEGAL_PROVIDER_WIRING_SOURCE_ONLY_PASS__TYA_LEGAL_V0_2_NOCODE_DRAFT__GO_LIVE_35__NO_PRODUCTION`

## Carril vivo

Repo `paulaosoriof86/demoCXOrbia`; rama `docs-tya-v6-v71-audit`; PR #7 draft/open/no merge; base `release/cxorbia-tya-rc-20260630`; Firebase DEV `cxorbia-backend-dev`.

## Cerrado y no reprocesar

I1 PASS 15/15. I2 PASS 20/20. Shopper histórico I3 PASS congelado en run `31906391682`; un único reset histórico ya consumido. Prohibido repetir reset/recovery/reconcile o acceder a esa credencial. Toda continuación: `passwordResets=0`.

Request08 run `31909354336`, job `95071998299`: STOP seguro `I3_ADMIN_LEGAL_CONFIDENTIALITY_GATE_PENDING_BEFORE_CREATE`. Request consumido. No hubo Shopper nuevo ni Auth/Firestore writes; aceptación automática `0`.

## Autoridad legal durable — source-only PASS

Source técnico final `0602d6ca0f64280222a4b1522b36f3be77c65c87`. Gate push `31913700755` / `95082399402` SUCCESS; gate PR `31913704247` / `95082407608` SUCCESS.

Preparado: exact identity, human-only, versioned receipt, server timestamp, provider ACK, read model provider-authoritative/fail-closed, browser bridge no activado, `#bnOk` informativo únicamente. Provider/Auth/Firestore/legal writes reales `0`.

## Draft legal TyA V0.2 — no-code / rebrand-safe

V0.1 permanece como base de cláusulas. V0.2 incorpora decisiones humanas resueltas y el requisito prevalente de no-code:

- `app/docs/DRAFT-CONTENIDO-LEGAL-TYA-V0.2-NOCODE-REVISION-HUMANA-20260815.md`
- `app/docs/DECISION-LOCK-TYA-LEGAL-V0.2-NOCODE-20260815.md`
- `backend/contracts/cxorbia-tenant-legal-nocode-profile-v1.json`

### Decisiones ya resueltas y no volver a preguntar

- TyA: empresa mercantil individual establecida en Guatemala; Honduras se opera desde Guatemala por el mismo Operador TyA.
- Los valores exactos de nombre legal/comercial, NIT y contacto inicial fueron confirmados humanamente; deben almacenarse luego en `tenantLegalProfile`, no en constantes de código.
- Contactos legal/privacidad/incidentes editables desde la Plataforma.
- Rebranding previsto: usar “la Plataforma” + nombre visible dinámico; no afirmar registro de marca inexistente.
- Titular/licenciante separado del nombre de marca; no simular cesión de IP mediante cambio de configuración.
- Evidencia cruda: piso humano 60 días; default recomendado 90 días por proyecto.
- Registros comerciales/financieros/auditoría/receipts: retenciones mayores; referencia conservadora 5 años cuando corresponda.
- Cuenta bancaria completa permitida únicamente bajo cifrado/protección, mínimo privilegio, UI enmascarada y retención limitada.
- Documentos: mínimo indispensable.
- Foto/video/audio/geolocalización/comprobantes se configuran por proyecto al crear/editar; no reglas globales.
- Proveedores: registry dinámico según estado técnico real. Make/Gemini no se declaran receptores mientras estén gated/deshabilitados.
- Controversias: arbitraje preferido para B2B; individual/Shopper sujeto a validez local y materias no arbitrables.
- Revisión jurídica final Guatemala/Honduras: sí.

## No-code obligatorio

Los datos de TyA son exclusivos del tenant TyA. Otros tenants reutilizan el esquema, no los valores. Configuración legal, branding, retención, proveedores y evidencia deben ser administrables desde la plataforma viva y provider-authoritative. Un cambio material genera revisión/versionado; nunca reescribe aceptaciones históricas.

No se modificó `/app/modules`, `/app/core` ni product entrypoint desde backend. Ajustes UI quedan documentados para Claude/prototipo.

## Pendiente real

1. domicilio comercial/legal público adecuado;
2. nombre visible temporal/final para el go-live si el rebranding aún no está decidido;
3. revisión jurídica GT/HN;
4. consolidar V0.1 + V0.2 en texto final único;
5. versión final y SHA-256 final;
6. aprobación humana final;
7. solo después materialización provider-authoritative + aceptación humana + reanudación Admin → único Shopper nuevo.

## Progreso

I1 `15/15`; I2 `20/20`; I3 `0/25`; I4 `0/25`; I5 `0/15`.

**35% completado / 65% pendiente.** I3 sigue sin puntaje hasta PASS integral.

## Gate siguiente

`PAULA_REVIEW_REQUIRED_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_PROVIDER_WRITE_AND_ADMIN_NEW_SHOPPER_RESUME`

No iniciar request09, provider writes, deploy, merge ni producción antes de aprobación humana final del contenido legal y autorización específica.
