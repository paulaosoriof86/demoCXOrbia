# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-15 20:05 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_HISTORICAL_FROZEN__REQUEST08_LEGAL_STOP__LEGAL_V0_3_COUNSEL_SNAPSHOT_SOURCE_PASS__SAME_CANDIDATE__GO_LIVE_35`

No nueva candidata/rama/PR. I1/I2 cerradas. I3 continúa por cierre legal humano + provider materialization autorizada + Admin/new Shopper.

Tracker: `app/docs/GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`.  
Lock técnico legal: `app/docs/SOURCE-LOCK-ITERATION3-LEGAL-ACCEPTANCE-PROVIDER-WIRING-SOURCE-ONLY-PASS-20260815.md`.  
Lock bloque V0.3: `app/docs/SOURCE-LOCK-ITERATION3-LEGAL-V0.3-COUNSEL-REVIEW-SNAPSHOT-SOURCE-ONLY-PASS-20260815.md`.  
Candidata jurídica: `app/docs/CANDIDATA-LEGAL-TYA-V0.3-CONSOLIDADA-REVISION-JURIDICA-20260815.md`.  
Paquete abogado: `app/docs/PAQUETE-REVISION-JURIDICA-TYA-GT-HN-V0.3-20260815.md`.

**35% completado / 65% pendiente. I3 0/25 hasta PASS integral.**

## No reprocesar

Auth owner/exact identity/Staff membership, I1/I2, Mis Visitas, protected HR authority, histórico request06 congelado y reset consumido. Request08 consumido. Toda continuación `passwordResets=0`; no acceso/reconcile/recovery histórico.

## Ya resuelto source-only

- Provider legal durable exact-identity/versioned/human-only/ACK/fail-closed.
- Perfil legal no-code provider-authoritative multi-tenant.
- Rebranding dinámico y separado de IP/titularidad.
- Domicilio registrado residencial recuperado y clasificado restringido; no volver a pedirlo ni autopublicarlo.
- Evidencias/retención configurables por proyecto.
- Provider Registry con estado técnico real.
- **Nueva capa de publicación legal inmutable:** perfil mutable → snapshot público congelado → render UTF-8/LF → SHA-256 post-render → receipt humano por versión/digest.
- V0.1 + V0.2 consolidadas en V0.3 para revisión jurídica.
- Paquete de abogado GT/HN concentrado.

Gate fuente: HEAD `768a1b43c10a054a254cfc2bd295aacdeae64c92`, run `31921002582`, job `95100754570`, SUCCESS. Decisión snapshot: `PASS_I3_LEGAL_PUBLICATION_SNAPSHOT_NOCODE_IMMUTABLE_SOURCE_ONLY`.

## Decisiones humanas cerradas — no preguntar otra vez

1. TyA empresa mercantil individual Guatemala.
2. Honduras administrada desde Guatemala por el mismo Operador TyA.
3. Identidad/NIT/contacto inicial confirmados; valores provider no-code, no constantes.
4. Domicilio registrado exacto recuperado/restringido; solo falta criterio jurídico de publicación.
5. Evidencia cruda: piso 60 días, default recomendado 90 por proyecto.
6. Rebranding previsto; no afirmar marca registrada sin referencia verificada.
7. Titular/licenciante separado de marca; no inventar cesión futura.
8. Banco completo solo protegido/cifrado, mínimo privilegio, UI enmascarada y retención limitada.
9. Documentos: mínimo indispensable.
10. Evidencias: foto/video/audio/geolocalización/comprobante por proyecto.
11. Proveedores: estado activo desde runtime; Make/Gemini no actuales mientras estén gated.
12. Arbitraje preferido B2B, no universal para individuales sin validación local.
13. Revisión profesional final GT/HN: sí.

## Pendiente legal real — ya concentrado

1. Abogado GT responde `GT-01..GT-08`.
2. Revisión HN responde `HN-01..HN-06`.
3. Revisión transversal responde `X-01..X-06`.
4. Incorporar cambios exactos y eliminar todos los `LEGAL_REVIEW_REQUIRED`.
5. Definir nivel de dirección pública, licenciante/IP, arbitraje, privacidad/retención/evidencias/proveedores.
6. Generar versión publicable única.
7. Paula aprueba humanamente el texto final.
8. Solo después: snapshot provider real, valores públicos resueltos y SHA-256 final.
9. Solo con gate explícito: materializar `tenantLegalProfile`/legalContents y registrar aceptación humana.

El nombre final del rebranding no bloquea: `platform.displayName` es dinámico y cada versión publicada conserva el nombre resuelto en su snapshot.

## Pendiente I3 Admin/new Shopper

Después de receipt legal válido:
- crear un único Shopper nuevo desde Admin;
- Auth + claims + membership + profile/shopper + crosswalk exactos;
- editar + provider ACK/version;
- provider readback;
- login Shopper nuevo + reload + new-tab + segundo contexto;
- cero fuzzy matching, otras identidades, resets históricos o providers prohibidos.

## Pendiente prototipo / Claude

No rediseñar UI desde backend. En futuro bloque frontend autorizado:
- `configuracion.js`: Legal y cumplimiento no-code; separar perfil editable vs versiones publicadas;
- `administrabilidad.js`: retirar semántica demo/local solo después de provider real;
- proyectos: Evidencias y privacidad;
- integraciones: Provider Registry;
- marca/white-label: displayName/estado registral/licenciante separados;
- gate humano: texto completo, versión visible, casillas no premarcadas y sin `#bnOk` como aceptación.

## Academia

Después de provider real: explicar versión publicada inmutable vs configuración editable; aceptación humana; reaceptación por cambio material; evidencia por proyecto; retención; banco/documentos; proveedores; rebranding y privacidad del domicilio.

## Gate siguiente

`HUMAN_COUNSEL_REVIEW_TYA_GT_HN_AND_PAULA_APPROVAL_BEFORE_PROVIDER_MATERIALIZATION`.

Después, y solo después, podrá abrirse:
`PAULA_REVIEW_REQUIRED_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_PROVIDER_WRITE_AND_ADMIN_NEW_SHOPPER_RESUME`.

No request09/provider write/deploy/merge/producción antes de esos gates.
