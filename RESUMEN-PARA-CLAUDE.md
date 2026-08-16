# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-16 10:38 -06:00  
**Estado vigente:** `PHASE_A_ROOT_CAUSE_TRACKER_35__I3_LEGAL_V0_4_INTERIM_GOLIVE__COUNSEL_DEFERRED_NONBLOCKING__PROVIDER_HUMAN_ACCEPTANCE_GATE_NEXT__NO_FRONTEND_REDESIGN`

## Estado real

I1 `15/15`, I2 `20/20`, I3 `0/25`, I4 `0/25`, I5 `0/15`: **35% completado / 65% pendiente**.

Shopper histórico I3 PASS congelado run `31906391682`; no repetir reset/recovery/reconcile ni acceder a credencial histórica; continuaciones `passwordResets=0`.

Request08 `31909354336` / `95071998299`: STOP antes de Alta por `I3_ADMIN_LEGAL_CONFIDENTIALITY_GATE_PENDING_BEFORE_CREATE`; sin Shopper nuevo/Auth/Firestore writes/consentimiento automatizado. No rerun.

## Backend legal preparado

Vigentes:
- `backend/contracts/cxorbia-tenant-legal-nocode-profile-v1.json` — perfil legal mutable provider-authoritative/no-code;
- `backend/contracts/cxorbia-legal-publication-snapshot-v1.json` — snapshot público inmutable;
- `backend/contracts/cxorbia-legal-acceptance-durable-v1.json` — receipt humano durable por versión/digest;
- `app/adapters/cxorbia-legal-acceptance-durable-contract-v1.js` — contrato browser source-only;
- `app/adapters/cxorbia-legal-acceptance-provider-bridge-v1.js` — bridge source-only todavía no product-wired.

Regla reusable:
`perfil editable no-code → snapshot público inmutable → render canónico → SHA-256 post-render → aceptación humana ligada a legalVersion/contentDigest`.

## Decisión legal operativa vigente

Paula decidió continuar hacia go-live sin detener Phase A por indisponibilidad temporal del abogado. Counsel GT/HN queda **diferido post-go-live**, no cancelado ni marcado como aprobado.

Autoridad:
`app/docs/DECISION-LOCK-TYA-LEGAL-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md`.

Candidata interina:
`app/docs/CANDIDATA-LEGAL-TYA-V0.4-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md`.

Registro post-go-live:
`app/docs/PENDIENTE-LEGAL-POST-GOLIVE-TYA-GT-HN-V0.4-20260816.md`.

El paquete V0.3 y matriz primaria se conservan para revisión profesional posterior. No presentar V0.4 como revisada por abogado.

## V0.4 — reglas de producto

V0.4 usa lenguaje conservador y no muestra marcadores internos de counsel. No afirmar:
- que cualquier clic equivale a firma electrónica avanzada;
- que no existen obligaciones locales en Honduras;
- arbitraje universal para usuarios individuales;
- marca registrada sin referencia;
- proveedor deshabilitado como receptor actual.

Las evidencias siguen siendo configurables por proyecto. Tratamientos de alto impacto no se habilitan globalmente.

## Rebranding y no-code

No usar `CXOrbia` ni `Gravicentra` como nombre contractual rígido. El texto permanente usa “la Plataforma”; `platform.displayName` es dinámico. Marca visible, registro marcario y titular/licenciante son objetos separados.

Todos los valores concretos TyA pertenecen solo a ese tenant y deben venir de configuración provider-authoritative, no de código: operador, identificación tributaria, contacto, dirección pública, países, retención, controversias, proveedores, branding/licenciante y evidencia por proyecto.

## Ajustes frontend futuros por archivo/módulo — NO parchear desde backend

1. `app/modules/configuracion.js`
   - evolucionar NDA/demo a `Legal y cumplimiento`;
   - editar perfil legal provider-authoritative;
   - mostrar versiones publicadas separadas del perfil mutable;
   - flujo `previsualizar → revisión → publicar nueva versión`;
   - cero localStorage como autoridad legal.

2. `app/modules/administrabilidad.js`
   - auditoría legal sin exponer datos restringidos;
   - retirar semántica demo/local solo después de provider real.

3. proyecto/wizard
   - `Evidencias y privacidad`: foto/video/audio/geolocalización/comprobante/otros;
   - retención heredada/override;
   - gate para alto impacto.

4. `integraciones`
   - Provider Registry con estado técnico real + metadata legal editable.

5. `marca`
   - `displayName`, estado registral y licenciante/IP separados.

6. gate legal visible
   - contenido completo de la versión publicada;
   - versión visible;
   - casillas no premarcadas;
   - botón solo tras acción humana;
   - nunca `#bnOk` como aceptación.

Mantener interfaz pública `CX.data`, login canónico y arquitectura modular aprobada.

## TyA — decisiones cerradas, no preguntar otra vez

Empresa mercantil individual Guatemala; Honduras operada desde Guatemala; contacto legal editable; domicilio registrado recuperado/restringido; rebranding dinámico; evidencia cruda piso 60/default 90; banco completo bajo controles reforzados; documentos mínimos; evidencias por proyecto; Provider Registry dinámico; arbitraje preferido B2B/no universal individual; counsel diferido post-go-live por decisión de Paula.

## Academia / manuales

Después de provider legal real, enseñar:
- configuración editable vs versión publicada inmutable;
- aceptación humana/versionada;
- reaceptación por cambio material;
- evidencias por proyecto;
- seguridad banco/documentos;
- providers según registro real;
- rebranding neutral;
- privacidad del domicilio;
- diferencia entre `counsel pendiente` y `legalmente aprobado`.

## Pendiente real

1. resolver snapshot público V0.4 desde provider/no-code;
2. materializar V0.4 en `cxorbia-backend-dev` bajo gate exacto;
3. habilitar read model durable en runtime sin localStorage como autoridad;
4. persona autenticada acepta humanamente;
5. crear nueva continuación I3 Admin/new Shopper sin reutilizar request08;
6. provider readback + login/reload/new-tab/segundo contexto;
7. counsel GT/HN posterior usando el registro diferido.

Gate actual:
`PAULA_PROVIDER_WRITE_AND_HUMAN_ACCEPTANCE_RUNTIME_GATE_FOR_I3`.

PR #7 permanece draft/open/no merge. Sin provider write/deploy/producción todavía.
