# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-15 17:52 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_HISTORICAL_FROZEN__REQUEST08_LEGAL_STOP__LEGAL_PROVIDER_SOURCE_ONLY_PASS__TYA_LEGAL_V0_2_NOCODE_DRAFT__SAME_CANDIDATE__GO_LIVE_35`

No nueva candidata/rama/PR. I1/I2 cerradas. I3 continúa únicamente por cierre legal humano + Admin/new Shopper.

Tracker: `app/docs/GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`.  
Lock I3 técnico: `app/docs/SOURCE-LOCK-ITERATION3-LEGAL-ACCEPTANCE-PROVIDER-WIRING-SOURCE-ONLY-PASS-20260815.md`.  
Draft legal vigente: `app/docs/DRAFT-CONTENIDO-LEGAL-TYA-V0.2-NOCODE-REVISION-HUMANA-20260815.md`.  
Decision lock: `app/docs/DECISION-LOCK-TYA-LEGAL-V0.2-NOCODE-20260815.md`.

**35% completado / 65% pendiente. I3 0/25 hasta PASS integral.**

## No reprocesar

Auth owner/exact identity/Staff membership, I1/I2, Mis Visitas, protected HR authority, histórico request06 congelado y su único credential reset. Request08 consumido. Toda continuación `passwordResets=0`; no acceso/reconcile/recovery histórico.

## Ya resuelto source-only

- Provider legal durable exact-identity/versioned/human-only/ACK/fail-closed preparado y gateado.
- Contrato no-code reusable creado: `backend/contracts/cxorbia-tenant-legal-nocode-profile-v1.json`.
- Rebranding tratado como configuración; no nombre de plataforma rígido.
- Tenant TyA separado de lógica global.
- Evidencias definidas como política por proyecto, no por core.

## Decisiones humanas cerradas — no volver a preguntar

1. TyA: empresa mercantil individual establecida en Guatemala.
2. Honduras: operada/administrada desde Guatemala por el mismo Operador TyA.
3. Identidad, NIT y contacto inicial: confirmados; deben vivir en tenant legal profile, no en código.
4. Contacto legal/privacidad/incidentes: editable no-code.
5. Evidencia cruda: mínimo humano 60 días; default recomendado 90 por proyecto.
6. Proveedores: estado activo deriva del runtime; Make/Gemini no actuales mientras sigan gated.
7. Controversias: arbitraje preferido, con default B2B institucional y validación individual por país.
8. Rebranding: previsto; no afirmar marca registrada mientras no exista referencia verificable.
9. Titular/licenciante: separado de la marca; no inventar cesión a entidad futura.
10. Banco: número completo permitido solo con cifrado/protección, mínimo privilegio, UI enmascarada y retención limitada.
11. Documentos: mínimo indispensable.
12. Foto/video/audio/geolocalización/comprobantes: configurables al crear/editar proyecto.
13. Revisión profesional final GT/HN: sí.

## Pendiente legal real — lista reducida

1. Recuperar/confirmar domicilio comercial/legal público adecuado; evitar domicilio residencial si no es necesario.
2. Definir nombre visible temporal/final para el primer go-live si el rebranding todavía no está cerrado.
3. Obtener revisión jurídica Guatemala/Honduras.
4. Incorporar correcciones del abogado/Paula.
5. Consolidar V0.1 + V0.2 en un texto final único.
6. Asignar versión final inmutable y SHA-256 final.
7. Aprobación humana expresa del texto final.
8. Solo con gate explícito: materializar `tenantLegalProfile`/legalContents provider-authoritative y registrar aceptación humana real.

## Pendiente I3 Admin/new Shopper

Después del receipt legal válido:
- crear un único Shopper nuevo desde Admin;
- Auth + claims + membership + profile/shopper + crosswalk exactos;
- editar + provider ACK/version;
- provider readback;
- login Shopper nuevo + reload + new-tab + segundo contexto;
- cero fuzzy matching, otras identidades, resets históricos o providers prohibidos.

## Pendiente prototipo / Claude

No rediseñar UI desde backend. Cuando llegue el bloque frontend autorizado:
- `configuracion.js`: Legal y cumplimiento provider-authoritative, sin localStorage authority;
- `administrabilidad.js`: retirar semántica demo/local después de provider real;
- proyectos: Evidencias y privacidad no-code;
- integraciones: Provider Registry;
- marca: rebranding/estado registral separado del licenciante/IP.

Los valores deben poder modificarse desde la plataforma viva sin tocar código. Un cambio material genera nueva versión legal; nunca reescribe acceptances históricos.

## Academia

Actualizar después de provider real: aceptación humana/versionada, confidencialidad, evidencia por proyecto, retención, seguridad bancaria/documental y rebranding neutral. QA/GitHub/Make/Gemini no aceptan por el usuario.

## Gate siguiente

`PAULA_REVIEW_REQUIRED_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_PROVIDER_WRITE_AND_ADMIN_NEW_SHOPPER_RESUME`

No request09, provider write, deploy, merge ni producción antes de aprobación legal final.
