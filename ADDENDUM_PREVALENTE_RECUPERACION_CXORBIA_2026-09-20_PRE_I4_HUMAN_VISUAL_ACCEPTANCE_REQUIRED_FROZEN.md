# ADDENDUM PREVALENTE — PRE-I4 HUMAN VISUAL ACCEPTANCE REQUIRED

Fecha operativa: 2026-09-20 (Guatemala)
ID: CXORBIA-RECOVERY-PRE-I4-HUMAN-VISUAL-ACCEPTANCE-20260920
Estado: FROZEN_PREVALENT_UNTIL_HUMAN_VISUAL_ACCEPTANCE_OR_NEWER_EXPLICIT_SUPERSESSION
I3: GO, no reabierto
I4 production deploy: HOLD hasta aceptación visual explícita de Paula

## 1. Cambio de alcance explícito

Paula estableció que CXOrbia NO puede reemplazar la plataforma productiva legacy aunque I3 esté técnicamente en GO si ella todavía no ha visualizado la candidata certificada.

Esta aclaración NO reabre I3 ni invalida Run 299. Introduce una condición humana obligatoria entre I3=GO y la autorización de deploy I4:

I3 technical GO
-> live previsual verification on certified candidate
-> Paula human visual review on DEV
-> explicit visual acceptance
-> only then explicit I4 production deploy authorization
-> immutable production replacement

No debe interpretarse una autorización antigua o genérica como autorización para saltar esta revisión visual.

## 2. Autoridad material conservada

Repository: paulaosoriof86/demoCXOrbia
Branch: recovery/cxorbia-phase-a-20260831
Product source: 77bf74f807d254637f0b2cde4b1d1668017a0c8a
Product tree: 6bdd13dbc1ae5d2e0e9d2f3dd592aa222ee36679
Certified source tar SHA256: 6cde0272c6b30029d0b97e090cf5fb916aed84dac8ddba746a34de396c2bad1a
Run: 299 / 35556165139
Production: DO_NOT_TOUCH

## 3. Cobertura canónica Phase A antes de revisión humana

Module Truth Matrix:
- phaseAComplete=true
- allModulesMatch=true
- 20 dominios canónicos MATCH

Canonical Route Inventory:
- Admin: 34 rutas
- Shopper: 12 rutas
- Cliente: 10 rutas
- Total role-route entries: 56

El exhaustive human acceptance de Run 299 navegó la totalidad del inventario canónico con HR authority aplicada y falló cerrado ante ruta faltante, módulo no visible, revisión HR distinta, marcador de identidad roto o excepción de navegación.

## 4. Prueba viva transversal adicional solicitada por Paula

Se repitió la suite reversible de live fixtures sobre el MISMO artifact certificado, sin cambiar product source.

Fresh live fixture artifact:
- artifact ID: 10621489673
- digest: sha256:418f44eb3fcecf64b77aea008b9a1df70ac42ca9b2003034e24952972c1b93ec
- generatedAt: 2026-09-21T04:30:30.725Z
- decision: PASS_I3_LIVE_FIXTURES_V2
- tests: 10/10
- cleanup=true
- buildCountThisRun=0
- deployCountThisRun=0
- rebuildAfterCertification=false
- productSourceChanged=false
- production=false
- hrWrites=0
- fuzzyMatching=false
- HR revision: 6cbb9e18fe3dea23cf331f4dfe8f4d7b180862004f68c1b309b97bcaa93eda69

Casos PASS:
1. SHOPPER_GT — alta/provider ACK/login visible/perfil/país.
2. SHOPPER_HN — alta/provider ACK/login visible/perfil/país/contacto.
3. NOMBRE_TILDE — regla canónica de credencial sin tildes y login real.
4. NOMBRE_COMPUESTO — primer nombre + primer apellido.
5. PERFIL_ADMIN — Admin autorizado ve identidad/país/teléfono/email/status; scope cruzado bloqueado.
6. HISTORICO_KPIS — misma revisión HR para perfil/histórico/múltiples periodos/KPIs.
7. DISPONIBILIDAD_ASIGNACION — visita elegible/disponible -> ACK de asignación -> deja disponibilidad -> aparece exactamente una vez al shopper.
8. POSTULACION — create ACK -> visible en Gestión de Postulaciones -> delete ACK -> ausente y no reaparece.
9. RESERVA — create/status/delete con provider ACK y durable readback.
10. CLIENTE — login/scope/módulos autorizados/no cross-role access.

Cleanup de shoppers sintéticos, crosswalks, Auth, postulación, receipts y audits: PASS.

## 5. Integridad posterior a la repetición

Fresh Gate21 revalidation:
- PASS_GATE21_SAME_ARTIFACT
- PASS_GATE21_ARTIFACT_FINGERPRINT
- source: 77bf74f807d254637f0b2cde4b1d1668017a0c8a
- artifactSha256: 6cde0272c6b30029d0b97e090cf5fb916aed84dac8ddba746a34de396c2bad1a
- rebuilds=0
- deploys=0
- production=false
- fresh Gate21 artifact ID: 10622461302
- fresh Gate21 artifact digest: sha256:61cad4a71a9bb6d5f20711128f4177047bc5727cc1bba7cba727251bb8625240

## 6. DEV visual-review entrypoint

Canonical visual review entrypoint:
https://cxorbia-backend-dev.web.app/

Verified redirect:
https://cxorbia-backend-dev.web.app/index-backend-dev.html?cxBackendPreview=YES_PAULA_20260628_PREVIEW_DEV&cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV

Title observed:
CXOrbia · Preview Backend DEV

This is Recovery DEV, not production.

## 7. Human visual review route required

Paula must review at minimum:

ADMIN:
Dashboard -> Visitas -> Postulaciones -> Reservas -> Shoppers -> Informes -> Proyectos -> Periodos -> Histórico -> HR Source -> Cuestionarios -> Documentos -> Financiero -> Movimientos -> Liquidaciones -> Costos -> Configuración/Administrabilidad/Usuarios.

SHOPPER:
Mi Perfil -> Visitas disponibles -> Reservas -> Mis Visitas -> Aprendizaje/Certificación -> Documentos/Novedades -> Beneficios -> Mis Reportes.

Priority transverse checks during visual review:
- correct tenant/project/period/country context;
- real HR data, no placeholder identity;
- period switch actually changes data;
- shopper profile/history/KPIs coherent;
- availability/assignment state coherent;
- postulations visible and removable;
- no duplicate shopper/visit;
- GT/HN and currency/context correct;
- navigation stable after refresh;
- no legacy/technical/debug markers exposed in normal UI;
- responsive behavior on representative desktop and mobile views.

## 8. Promotion rule

Until Paula explicitly states that the DEV visual review is accepted:
- I3 remains GO.
- Promotion status remains HOLD.
- Do not touch tya-plataforma.web.app.
- Do not initiate production deploy.
- Do not rebuild/recompose to prepare I4.
- Do not create another candidate.

After explicit DEV visual acceptance, request/accept a fresh explicit I4 production authorization and promote only the exact certified artifact.
