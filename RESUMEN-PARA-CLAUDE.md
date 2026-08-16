# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-16 10:10 -06:00  
**Estado vigente:** `PHASE_A_ROOT_CAUSE_TRACKER_35__I3_LEGAL_V0_3_PRECOUNSEL_PRIMARY_SOURCE_PASS__COUNSEL_REVIEW_PENDING__NO_FRONTEND_REDESIGN`

## Estado real

I1 `15/15`, I2 `20/20`, I3 `0/25`, I4 `0/25`, I5 `0/15`: **35% completado / 65% pendiente**.

Shopper histórico I3 PASS congelado run `31906391682`; no repetir reset/recovery/reconcile ni acceder a credencial histórica; continuaciones `passwordResets=0`.

Request08 `31909354336` / `95071998299`: STOP antes de Alta por `I3_ADMIN_LEGAL_CONFIDENTIALITY_GATE_PENDING_BEFORE_CREATE`; sin Shopper nuevo/Auth/Firestore writes/consentimiento automatizado. No rerun.

## Backend legal preparado

Vigentes:
- `backend/contracts/cxorbia-tenant-legal-nocode-profile-v1.json` — perfil legal mutable provider-authoritative/no-code;
- `backend/contracts/cxorbia-legal-publication-snapshot-v1.json` — snapshot público inmutable;
- `backend/contracts/cxorbia-legal-acceptance-durable-v1.json` — receipt humano durable por versión/digest.

Regla reusable:
`perfil editable no-code → snapshot público inmutable → render canónico → SHA-256 post-render → aceptación humana ligada a legalVersion/contentDigest`.

No inyectar configuración mutable directamente en un documento histórico ya aceptado. Placeholders sin resolver no son publicables. Domicilio registrado restringido no se autopublica. Proveedores deshabilitados no aparecen como receptores actuales.

## Candidata jurídica y paquete de counsel

Documento consolidado:
`app/docs/CANDIDATA-LEGAL-TYA-V0.3-CONSOLIDADA-REVISION-JURIDICA-20260815.md`.

Paquete codificado GT/HN/X:
`app/docs/PAQUETE-REVISION-JURIDICA-TYA-GT-HN-V0.3-20260815.md`.

Matriz primaria nueva:
`app/docs/MATRIZ-PRE-REVISION-JURIDICA-TYA-V0.3-FUENTES-PRIMARIAS-20260816.md`.

Source lock vigente:
`app/docs/SOURCE-LOCK-ITERATION3-LEGAL-V0.3-PRECOUNSEL-PRIMARY-SOURCE-VERIFICATION-PASS-20260816.md`.

V0.3 **NO está aprobada ni publicada**. Ningún `LEGAL_REVIEW_REQUIRED` se elimina sin counsel GT/HN + aprobación humana final.

## Pre-counsel 2026-08-16

La investigación primaria se separó de las decisiones jurídicas. Nuevo hecho relevante para la revisión: Honduras tiene **Decreto 149-2014, Ley sobre Comercio Electrónico**, que debe considerarse en `HN-02` junto con Decreto 149-2013 y Reglamento 41-2014. Esto no autoriza asumir que cualquier click/UI satisface formalidades.

Google Drive y Gmail fueron consultados read-only antes de pedir trabajo manual; no se encontró dictamen profesional sobre esta V0.3. La frase humana `autorizado, continuemos` autoriza ejecución source-only y **no** se trata como aprobación legal final ni aceptación.

## Rebranding y no-code

No usar `CXOrbia` ni `Gravicentra` como nombre contractual rígido. El texto permanente usa “la Plataforma”; `platform.displayName` es dinámico. Marca visible, registro de marca y titular/licenciante del software son objetos distintos. Un cambio de branding no transfiere IP ni reescribe versiones históricas.

Todos los valores concretos TyA pertenecen solo a ese tenant y deben venir de configuración provider-authoritative, no de código.

## Ajustes frontend futuros por archivo/módulo — NO ejecutar desde backend

1. `app/modules/configuracion.js`
   - evolucionar la superficie NDA/demo a `Legal y cumplimiento`;
   - editar perfil legal del tenant, contactos, dirección pública, retención, controversias, licenciante/branding y metadata legal de proveedores;
   - mostrar versiones publicadas separadas del perfil mutable;
   - flujo `previsualizar → revisión → publicar nueva versión`, nunca sobrescribir versión publicada;
   - cero localStorage como autoridad.

2. `app/modules/administrabilidad.js`
   - retirar semántica demo/local solo después de provider legal real y validado;
   - auditoría de cambios/revisiones sin exponer datos restringidos.

3. módulo de `proyectos`
   - `Crear/Editar > Evidencias y privacidad`;
   - foto/video/audio/geolocalización/comprobante/otros;
   - retención heredada/override y gate especial para alto impacto;
   - ninguna regla cliente/proyecto hardcoded.

4. `integraciones`
   - Provider Registry: estado técnico activo derivado del runtime; metadata legal editable;
   - provider disabled no puede mostrarse como receptor actual.

5. `marca` / white-label
   - `displayName`, estado registral y referencia de marca;
   - licenciante/IP separado de branding.

6. gate legal visible
   - contenido completo de versión publicada y versión visible;
   - casillas afirmativas no premarcadas;
   - botón solo después de acción humana;
   - nunca `#bnOk` como aceptación.

Mantener interfaz pública `CX.data`, login canónico y arquitectura modular aprobada.

## TyA — decisiones cerradas, no preguntar otra vez

Empresa mercantil individual Guatemala; Honduras operada desde Guatemala; contacto legal editable; domicilio registrado recuperado/restringido; rebranding dinámico; evidencia cruda piso 60/default 90; banco completo bajo controles reforzados; documentos mínimos; evidencias por proyecto; Provider Registry dinámico; arbitraje preferido B2B y revisión diferenciada individual; revisión profesional GT/HN sí.

## Academia / manuales

Después de provider legal real, enseñar por rol:
- configuración editable vs versión legal publicada/inmutable;
- aceptación humana/versionada y reaceptación ante cambios materiales;
- evidencias configurables por proyecto;
- seguridad bancaria/documental;
- providers actuales según registro real;
- rebranding neutral;
- privacidad del domicilio restringido.

No enseñar hashes internos, rutas, IDs de QA ni implementación del runner.

## Evidencia técnica preservada

HEAD `768a1b43c10a054a254cfc2bd295aacdeae64c92`: run `31921002582`, job `95100754570`, SUCCESS, incluyendo snapshot legal inmutable. HEAD reconciliado `1bf82ad949be12ac6bc2327eed0b2f40c38985b3`: run `31921159197`, job `95101127823`, SUCCESS.

## Pendiente real

1. counsel GT resuelve `GT-01..GT-08`;
2. counsel/revisor HN resuelve `HN-01..HN-06`, considerando expresamente Decreto 149-2014 en HN-02;
3. revisión transversal `X-01..X-06`;
4. incorporar cambios exactos y cerrar marcadores;
5. generar versión publicable;
6. aprobación humana final de Paula;
7. solo después materialización provider + aceptación humana + E2E Admin/new Shopper.

Gate humano actual:
`HUMAN_COUNSEL_REVIEW_TYA_GT_HN_AND_PAULA_APPROVAL_BEFORE_PROVIDER_MATERIALIZATION`.

PR #7 permanece draft/open/no merge. Sin provider write, deploy ni producción.
