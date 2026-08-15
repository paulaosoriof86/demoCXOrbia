# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-15 17:31 -06:00  
**Estado:** `I1_PASS__I2_PASS__I3_HISTORICAL_FROZEN__REQUEST08_LEGAL_STOP__LEGAL_PROVIDER_SOURCE_ONLY_PASS__LEGAL_DRAFT_V0_1_PREPARED__SAME_CANDIDATE__GO_LIVE_35`

No nueva candidata/rama/PR. I1/I2 cerradas. I3 continúa únicamente por cierre legal humano + Admin/new Shopper.

Tracker: `app/docs/GO-LIVE-PROGRESS-TRACKER-ROOT-CAUSE-20260814.md`.  
Lock I3 técnico vigente: `app/docs/SOURCE-LOCK-ITERATION3-LEGAL-ACCEPTANCE-PROVIDER-WIRING-SOURCE-ONLY-PASS-20260815.md`.  
Draft legal: `app/docs/DRAFT-CONTENIDO-LEGAL-TYA-V0.1-REVISION-HUMANA-20260815.md`.

**35% completado / 65% pendiente. I3 0/25 hasta PASS integral.**

## No reprocesar

Auth owner/exact identity/Staff membership, I1/I2, Mis Visitas, protected HR authority, histórico request06 congelado y su único credential reset. Request08 está consumido. Toda continuación lleva `passwordResets=0` y no accede a credencial histórica.

## Ya resuelto source-only

El bloqueo request08 fue legal/confidencialidad pendiente antes de Alta, no `#shNew` ni un overlay a forzar. Quedó preparado un patrón durable reusable: provider-authoritative receipt, exact identity, human-only, versionado, server timestamp, provider ACK, idempotencia y fail-closed.

Source final `0602d6ca0f64280222a4b1522b36f3be77c65c87`; gate `31913700755` / `95082399402` SUCCESS. Provider credentials/reads/writes reales `0/0/0`; Auth/Firestore/legal writes `0/0/0`; no entrypoint activation, deploy, merge ni producción.

## Draft legal preparado

Existe V0.1 para revisión humana, no para publicación ni materialización. Contiene acuerdo general, privacidad, confidencialidad, PI, anexos por rol y país, aviso resumido, copy de aceptación y checklist.

No sustituir el texto local del prototipo todavía y no tratar el draft como autoridad legal.

## Pendiente legal real

1. Confirmar identidad contractual exacta del Operador TyA Guatemala.
2. Confirmar entidad/estructura con la que TyA opera/contrata en Honduras.
3. Definir correos legal, privacidad e incidentes.
4. Aprobar tabla de retención por categoría.
5. Confirmar proveedores que estarán realmente activos al go-live.
6. Definir foro/resolución de controversias por país y relación.
7. Confirmar titular/licenciante contractual de CXOrbia.
8. Confirmar si datos bancarios/documentos se almacenan o se tokenizan/referencian.
9. Confirmar uso real de grabaciones/geolocalización por proyectos.
10. Revisar profesionalmente Guatemala/Honduras antes de publicación.
11. Incorporar correcciones de Paula/asesor.
12. Congelar versión final y calcular digest SHA-256 final.
13. Solo con gate explícito, materializar contenido provider-authoritative y registrar aceptación humana real.

## Pendiente I3 Admin/new Shopper

Después del receipt legal válido:
- crear un único Shopper nuevo desde Admin;
- Auth + claims + membership + profile/shopper + crosswalk exactos;
- editar y confirmar provider ACK/version;
- provider readback;
- login Shopper nuevo + reload + new-tab + segundo contexto;
- cero fuzzy matching, otras identidades, resets históricos o providers prohibidos.

## Pendiente prototipo / Claude

No abrir rediseño UI. Preservar el modal humano vigente; cuando el backend legal esté activado, empalmarlo con el read model/command boundary sin modificar la lógica modular más allá del punto explícitamente autorizado. `configuracion.js` y `administrabilidad.js` deben actualizar su semántica demo/local únicamente después de que la autoridad provider esté realmente operativa.

El futuro UI legal debe mostrar versión aplicable, texto completo/accesible, controles afirmativos no premarcados y consentimientos opcionales separados. No implementar todavía.

## Academia / manuales / cursos

La aceptación legal debe enseñarse como acción humana obligatoria, versionada y auditable. Añadir posteriormente contenidos por rol sobre confidencialidad, uso de evidencias, credenciales, privacidad, incidentes y reaceptación por cambio material. QA/GitHub/Make/Gemini no aceptan por el usuario. Academia/Certificación histórica siguen diferidas y no se declaran PASS.

## Siguiente gate

Primero completar y aprobar el draft legal. Después permanece el gate de write:
`PAULA_REVIEW_REQUIRED_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_PROVIDER_WRITE_AND_ADMIN_NEW_SHOPPER_RESUME`.

No iniciar request09, provider write, deploy, merge ni producción antes de ese gate.
