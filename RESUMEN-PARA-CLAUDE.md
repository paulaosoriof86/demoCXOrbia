# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-15 20:05 -06:00  
**Estado vigente:** `PHASE_A_ROOT_CAUSE_TRACKER_35__I3_LEGAL_V0_3_COUNSEL_SNAPSHOT_SOURCE_PASS__NO_FRONTEND_REDESIGN`

## Estado real

I1 `15/15`, I2 `20/20`, I3 `0/25`, I4 `0/25`, I5 `0/15`: **35% completado / 65% pendiente**.

Shopper histórico I3 PASS congelado run `31906391682`; no repetir reset/recovery/reconcile ni acceder a credencial histórica; continuaciones `passwordResets=0`.

Request08 `31909354336` / `95071998299`: STOP antes de Alta por `I3_ADMIN_LEGAL_CONFIDENTIALITY_GATE_PENDING_BEFORE_CREATE`; sin Shopper nuevo/Auth/Firestore writes/consentimiento automatizado. No rerun.

## Backend legal preparado

Provider legal durable source-only permanece PASS. Además quedan vigentes:
- `backend/contracts/cxorbia-tenant-legal-nocode-profile-v1.json` — perfil legal mutable provider-authoritative/no-code;
- `backend/contracts/cxorbia-legal-publication-snapshot-v1.json` — snapshot público inmutable de publicación;
- `backend/contracts/cxorbia-legal-acceptance-durable-v1.json` — receipt humano durable por versión/digest.

Regla reusable:

`perfil editable no-code`
→ `snapshot público inmutable`
→ `render canónico`
→ `SHA-256 post-render`
→ `aceptación humana ligada a legalVersion/contentDigest`.

No inyectar configuración mutable directamente en un documento histórico ya aceptado. Placeholders sin resolver no son publicables. Domicilio registrado restringido no se autopublica. Proveedores deshabilitados no aparecen como receptores actuales.

## Candidata jurídica vigente

Documento consolidado para revisión profesional:
`app/docs/CANDIDATA-LEGAL-TYA-V0.3-CONSOLIDADA-REVISION-JURIDICA-20260815.md`.

Paquete concentrado para abogado:
`app/docs/PAQUETE-REVISION-JURIDICA-TYA-GT-HN-V0.3-20260815.md`.

Source lock:
`app/docs/SOURCE-LOCK-ITERATION3-LEGAL-V0.3-COUNSEL-REVIEW-SNAPSHOT-SOURCE-ONLY-PASS-20260815.md`.

V0.3 **NO está aprobada ni publicada**. Los marcadores `LEGAL_REVIEW_REQUIRED` deben cerrarse con abogado GT/HN y aprobación humana antes de cualquier texto productivo/provider materialization.

## Rebranding y no-code

No usar `CXOrbia` ni `Gravicentra` como nombre contractual rígido. El texto permanente usa “la Plataforma”; `platform.displayName` es dinámico. Marca visible, registro de marca y titular/licenciante del software son objetos distintos. Un cambio de branding no transfiere IP ni reescribe versiones históricas.

Todos los valores concretos TyA pertenecen solo a ese tenant y deben venir de configuración provider-authoritative, no de código.

## Ajustes frontend futuros por archivo/módulo — NO ejecutar desde backend

1. `app/modules/configuracion.js`
   - evolucionar la superficie NDA/demo a `Legal y cumplimiento`;
   - editar perfil legal del tenant, contactos, dirección pública, retención, controversias, licenciante/branding y metadata legal de proveedores;
   - mostrar versiones publicadas separadas del perfil mutable;
   - flujo explícito `previsualizar → revisión → publicar nueva versión`, nunca sobrescribir versión publicada;
   - cero localStorage como autoridad.

2. `app/modules/administrabilidad.js`
   - retirar semántica demo/local solo después de provider legal real y validado;
   - auditoría de cambios/revisiones sin exponer datos restringidos.

3. módulo de `proyectos`
   - `Crear/Editar > Evidencias y privacidad`;
   - foto/video/audio/geolocalización/comprobante/otros;
   - retención heredada/override y gate especial para tratamientos de alto impacto;
   - ninguna regla cliente/proyecto hardcoded.

4. `integraciones`
   - Provider Registry: estado técnico activo derivado del runtime; metadata legal editable;
   - proveedor disabled no puede ser mostrado como receptor actual.

5. `marca` / white-label
   - `displayName`, estado registral y referencia de marca;
   - licenciante/IP separado de branding.

6. gate legal visible
   - mostrar contenido completo de la versión publicada y su versión;
   - casillas afirmativas no premarcadas;
   - botón solo después de acción humana;
   - nunca `#bnOk` como aceptación.

Mantener interfaz pública `CX.data`, login canónico y arquitectura modular aprobada.

## TyA — decisiones ya cerradas, no preguntar otra vez

Empresa mercantil individual Guatemala; Honduras operada desde Guatemala; contacto legal editable; domicilio registrado recuperado/restringido; rebranding dinámico; evidencia cruda piso 60/default 90; banco completo bajo controles reforzados; documentos mínimos; evidencias por proyecto; Provider Registry dinámico; arbitraje preferido B2B y revisión diferenciada individual; revisión profesional GT/HN sí.

## Academia / manuales

Después de provider legal real, enseñar por rol:
- diferencia entre configuración editable y versión legal publicada/inmutable;
- aceptación humana/versionada y nueva aceptación ante cambios materiales;
- evidencias configurables por proyecto;
- seguridad bancaria/documental;
- proveedores actuales según registro real;
- rebranding neutral;
- privacidad del domicilio restringido.

No enseñar hashes internos, rutas, IDs de QA ni implementación del runner.

## Evidencia técnica

HEAD fuente `768a1b43c10a054a254cfc2bd295aacdeae64c92`: `CXOrbia Phase A Live Execution Checkpoint` run `31921002582`, job `95100754570`, SUCCESS, incluyendo `Verify I3 immutable no-code legal publication snapshot source contract`.

## Pendiente real

1. revisión jurídica GT/HN mediante el paquete V0.3;
2. incorporar correcciones exactas;
3. cerrar domicilio público/licenciante/arbitraje/privacidad/evidencias/proveedores;
4. generar versión publicable sin marcadores;
5. aprobación humana de Paula;
6. solo después materialización provider + aceptación humana + E2E Admin/new Shopper.

Gate humano actual:
`HUMAN_COUNSEL_REVIEW_TYA_GT_HN_AND_PAULA_APPROVAL_BEFORE_PROVIDER_MATERIALIZATION`.

PR #7 permanece draft/open/no merge. Sin provider write, deploy ni producción.
