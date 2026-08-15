# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-15 17:52 -06:00  
**Estado vigente:** `PHASE_A_ROOT_CAUSE_TRACKER_35__I3_LEGAL_PROVIDER_SOURCE_ONLY_PASS__TYA_LEGAL_V0_2_NOCODE_DRAFT__NO_BACKEND_UI_PATCH`

## Estado real

Tracker prevalente: I1 `15/15`, I2 `20/20`, I3 `0/25`, I4 `0/25`, I5 `0/15`: **35% completado / 65% pendiente**.

Shopper histórico exacto I3 PASS y congelado en run `31906391682`; no repetir reset/recovery/reconcile ni acceder a credencial histórica; toda continuación `passwordResets=0`.

Request08 `31909354336` / `95071998299`: STOP antes de Alta por `I3_ADMIN_LEGAL_CONFIDENTIALITY_GATE_PENDING_BEFORE_CREATE`; sin Shopper nuevo, sin Auth/Firestore writes, sin consentimiento automatizado. No rerun.

## Backend preparado

Source técnico legal durable final `0602d6ca0f64280222a4b1522b36f3be77c65c87`; gate `31913700755` / `95082399402` SUCCESS. Receipt legal exact-identity/versionado/human-only/provider-ACK y read model fail-closed preparados; bridge no activado.

Nuevo contrato reusable:
`backend/contracts/cxorbia-tenant-legal-nocode-profile-v1.json`.

**Regla:** ningún dato TyA, país, proyecto, rebrand, correo, NIT, proveedor o evidencia debe quedar como constante global de runtime. Todo valor variable debe venir de configuración provider-authoritative multi-tenant administrable desde la Plataforma.

## Draft legal vigente para revisión

Base V0.1:
`app/docs/DRAFT-CONTENIDO-LEGAL-TYA-V0.1-REVISION-HUMANA-20260815.md`.

Decisiones V0.2:
`app/docs/DRAFT-CONTENIDO-LEGAL-TYA-V0.2-NOCODE-REVISION-HUMANA-20260815.md`.

Lock humano:
`app/docs/DECISION-LOCK-TYA-LEGAL-V0.2-NOCODE-20260815.md`.

No están aprobados ni materializados. No copiarlos a UI como texto productivo antes de consolidación/revisión legal/aprobación humana.

## Rebranding

El producto tendrá rebranding. No usar `CXOrbia` ni `Gravicentra` como nombre contractual rígido. En términos visibles usar principalmente “la Plataforma” y resolver el nombre comercial desde `platform.displayName`.

Marca visible, estado de registro y titular/licenciante del software son campos separados. No afirmar “marca registrada” si no existe referencia verificada. Cambiar el nombre visible no transfiere derechos de software.

## TyA — configuración tenant, no lógica global

Decisiones humanas ya resueltas:
- empresa mercantil individual establecida en Guatemala;
- Honduras administrada desde Guatemala por el mismo operador;
- datos de identificación/contacto deben vivir en tenant legal profile y poder modificarse no-code;
- evidencia cruda: default recomendado 90 días, con piso humano 60 y override por proyecto;
- cuentas bancarias completas solo bajo cifrado/protección, mínimo privilegio, UI enmascarada y retención limitada;
- documentos: mínimo indispensable;
- arbitraje preferido para B2B, sin imponer universalmente a usuarios individuales sin validación local;
- Make/Gemini no se describen como receptores mientras estén gated/deshabilitados;
- foto/video/audio/geolocalización/comprobantes varían por proyecto.

## Ajustes frontend futuros por archivo/módulo

**No ejecutar desde backend. No rediseñar módulos.** Empalmar las superficies existentes con el contrato provider cuando llegue el bloque frontend autorizado.

1. `app/modules/configuracion.js`
   - evolucionar “NDA / Guardar NDA” local a `Legal y cumplimiento`;
   - perfil legal tenant: operador, países, domicilio, contactos;
   - retención;
   - controversias;
   - publicación/versionado;
   - cero autoridad en localStorage.

2. `app/modules/administrabilidad.js`
   - retirar semántica “demo local” únicamente después de que provider legal real esté activado/validado.

3. módulo de `proyectos`
   - `Crear/Editar proyecto > Evidencias y privacidad`;
   - foto/video/audio/geolocalización/comprobante/otros;
   - retención heredada o override;
   - ninguna regla Cinépolis hardcoded.

4. `integraciones`
   - Provider Registry;
   - estado técnico activo debe provenir del runtime y no poder falsificarse manualmente;
   - metadata legal sí administrable.

5. `marca` / white-label
   - nombre visible/rebranding;
   - estado de registro de marca;
   - titular/licenciante separado del branding.

Mantener intactas la interfaz pública de `CX.data`, login canónico y arquitectura modular aprobada.

## Academia / manuales

Cuando provider real esté activo, enseñar por rol: aceptación humana/versionada, confidencialidad, evidencia por proyecto, retención, seguridad de banco/documentos, rebranding neutral y nueva aceptación cuando un cambio legal sea material. QA/GitHub/Make/Gemini nunca aceptan por el usuario.

## Pendiente real

Solo quedan antes de candidata legal final: domicilio comercial/legal público adecuado; nombre visible temporal/final si rebranding sigue abierto; revisión jurídica GT/HN; consolidación V0.1+V0.2; versión final + SHA-256 final; aprobación humana.

Después podrá solicitarse `PAULA_REVIEW_REQUIRED_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_PROVIDER_WRITE_AND_ADMIN_NEW_SHOPPER_RESUME` para materialización provider, aceptación humana real y E2E Admin/new Shopper.

PR #7 permanece draft/open/no merge. Sin deploy ni producción.
