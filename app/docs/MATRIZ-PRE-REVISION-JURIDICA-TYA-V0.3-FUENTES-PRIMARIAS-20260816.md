# MATRIZ PRE-REVISIÓN JURÍDICA TyA V0.3 — FUENTES PRIMARIAS · 2026-08-16

**Estado:** `PRIMARY_SOURCE_VERIFICATION_ONLY__COUNSEL_DECISIONS_STILL_REQUIRED__NO_PROVIDER_WRITE__NO_ACCEPTANCE__NO_PRODUCTION`  
**Candidata relacionada:** `CANDIDATA-LEGAL-TYA-V0.3-CONSOLIDADA-REVISION-JURIDICA-20260815.md`  
**Paquete relacionado:** `PAQUETE-REVISION-JURIDICA-TYA-GT-HN-V0.3-20260815.md`

## 1. Propósito y límite

Esta matriz reduce la carga de revisión jurídica mediante fuentes oficiales/primarias vigentes consultadas el 2026-08-16. **No sustituye abogado Guatemala/Honduras, no resuelve por inferencia materias que exigen juicio profesional y no elimina los marcadores `LEGAL_REVIEW_REQUIRED`.**

La autorización humana `autorizado, continuemos` recibida el 2026-08-16 autoriza continuar este bloque source-only. **No constituye aprobación jurídica final de V0.3, aceptación de términos, autorización de provider materialization, request09, Firebase/Auth/Firestore write, ni aceptación por ningún usuario.**

Clasificaciones usadas:

- `SOURCE_CONFIRMED_FACT`: la fuente primaria permite cerrar un hecho normativo/documental, no la decisión jurídica concreta.
- `SOURCE_SUPPORTS_DRAFT__COUNSEL_DECISION_REQUIRED`: la fuente respalda el enfoque prudente actual, pero el abogado debe validar la cláusula/alcance.
- `COUNSEL_DECISION_REQUIRED`: no existe base suficiente para cerrar responsablemente el punto sin análisis profesional del caso concreto.

## 2. Fuentes primarias verificadas

### Guatemala

- Congreso de la República — Decreto 47-2008, **Ley para el Reconocimiento de las Comunicaciones y Firmas Electrónicas**. La ficha oficial indica aplicación a comunicaciones electrónicas, transacciones/actos jurídicos y formación de contratos por medios electrónicos, con sus límites y excepciones.
- Organismo Judicial — **Código de Trabajo**, artículo 18: la naturaleza del contrato de trabajo depende de los elementos reales de servicios personales, dependencia/dirección y retribución, `sea cual fuere su denominación`.
- Organismo Judicial — **Código de Comercio**, artículo 382: documentos de la empresa deben conservarse ordenadamente por no menos de cinco años, salvo ley especial; artículo 383 preserva documentación mientras exista cuestión pendiente relacionada.
- Congreso de la República — Decreto 67-95, **Ley de Arbitraje**. El Congreso continúa identificándolo como normativa vigente; la reforma presentada en julio de 2026 es iniciativa/propuesta, no sustitución vigente demostrada.
- Congreso de la República — Iniciativa 6464, **Ley de Protección de Datos Personales y Garantía de Derechos Digitales**. Al 16 de julio de 2026 la Comisión seguía estudiándola y aún no había emitido el dictamen correspondiente; no se trata como ley general vigente.

### Honduras

- Tribunal Superior de Cuentas — Decreto 149-2013, **Ley sobre Firmas Electrónicas**.
- Tribunal Superior de Cuentas — Acuerdo Ejecutivo 41-2014, **Reglamento de la Ley sobre Firmas Electrónicas**.
- Tribunal Superior de Cuentas — Decreto 149-2014, **Ley sobre Comercio Electrónico**. Esta fuente debe incorporarse como referencia adicional de `HN-02` en la revisión profesional; no se usa aquí para declarar suficiente una mecánica concreta de aceptación.
- Tribunal Superior de Cuentas — Decreto 161-2000, **Ley de Conciliación y Arbitraje**.
- Tribunal Superior de Cuentas — **Ley sobre Justicia Constitucional**, artículo 3: incluye expresamente la acción de habeas data.
- Portal Único/IAIP — existen publicaciones oficiales que continúan identificando la regulación general de protección de datos como `Anteproyecto de Ley de Protección de Datos Personales`; por prudencia no se declara una ley general privada vigente sin confirmación local.

## 3. Matriz Guatemala

| Código | Clasificación | Qué queda confirmado | Qué debe decidir el abogado |
|---|---|---|---|
| GT-01 | `SOURCE_SUPPORTS_DRAFT__COUNSEL_DECISION_REQUIRED` | La candidata no debe convertir el nombre comercial/empresa mercantil en personalidad jurídica inexistente. | Fórmula contractual exacta del Operador TyA frente a cada tipo de usuario y documento. |
| GT-02 | `COUNSEL_DECISION_REQUIRED` | El domicilio residencial completo está clasificado internamente como restringido y no se autopublica. | Nivel mínimo de dirección pública jurídicamente suficiente y canal válido de notificaciones. |
| GT-03 | `SOURCE_SUPPORTS_DRAFT__COUNSEL_DECISION_REQUIRED` | Art. 18 del Código de Trabajo respalda no predeterminar una relación laboral por la etiqueta contractual. | Redacción final y evaluación del modelo operativo real de shoppers. |
| GT-04 | `SOURCE_SUPPORTS_DRAFT__COUNSEL_DECISION_REQUIRED` | Decreto 47-2008 reconoce comunicaciones/contratos por medios electrónicos. | Si el mecanismo exact-identity + acción afirmativa + versión/digest + timestamp satisface cada acto y cuándo se requiere formalidad/firma distinta. |
| GT-05 | `SOURCE_CONFIRMED_FACT` + `COUNSEL_DECISION_REQUIRED` | Iniciativa 6464 sigue siendo iniciativa en discusión; no puede citarse como ley general vigente. | Marco privado aplicable al go-live, derechos, canales, plazos y obligaciones concretas. |
| GT-06 | `COUNSEL_DECISION_REQUIRED` | La arquitectura permite habilitar evidencia por proyecto y bloquear alto impacto. | Requisitos concretos para foto, video, audio, personas identificables y geolocalización por contexto. |
| GT-07 | `SOURCE_SUPPORTS_DRAFT__COUNSEL_DECISION_REQUIRED` | Art. 382 confirma piso de 5 años para documentos de empresa cuando corresponda; art. 383 preserva mientras haya cuestión pendiente. | Matriz final por categoría; validar 60/90 días de evidencia cruda, banco/documentos y legal hold. |
| GT-08 | `SOURCE_SUPPORTS_DRAFT__COUNSEL_DECISION_REQUIRED` | Decreto 67-95 sigue identificado oficialmente como Ley de Arbitraje vigente; reforma 2026 sigue en etapa de iniciativa. | Institución, sede, ley, idioma, árbitros, costas, materias arbitrables y separación B2B/individual. |

## 4. Matriz Honduras

| Código | Clasificación | Qué queda confirmado | Qué debe decidir el abogado/revisor local |
|---|---|---|---|
| HN-01 | `COUNSEL_DECISION_REQUIRED` | Hecho operativo: TyA gestiona Honduras desde Guatemala; no se presume entidad hondureña. | Si el alcance real exige registro, establecimiento, permisos, tributación, presencia u otra formalidad en Honduras. |
| HN-02 | `SOURCE_SUPPORTS_DRAFT__COUNSEL_DECISION_REQUIRED` | Existen Decreto 149-2013, Reglamento 41-2014 y **Decreto 149-2014 Ley sobre Comercio Electrónico**. | Validez/suficiencia de la aceptación UI propuesta y actos que requieran formalidad adicional. |
| HN-03 | `SOURCE_SUPPORTS_DRAFT__COUNSEL_DECISION_REQUIRED` | Justicia Constitucional reconoce habeas data; fuentes IAIP siguen mostrando un anteproyecto general de protección de datos. | Marco privado exacto, obligaciones/derechos/plazos y cualquier norma sectorial aplicable. |
| HN-04 | `COUNSEL_DECISION_REQUIRED` | Evidencia es configurable por proyecto; no existe captura global obligatoria. | Requisitos de información/autorización para foto/video/audio/geolocalización según el proyecto. |
| HN-05 | `SOURCE_SUPPORTS_DRAFT__COUNSEL_DECISION_REQUIRED` | Existe Decreto 161-2000 de Conciliación y Arbitraje. | Validez/conveniencia de sede Guatemala, reconocimiento/ejecución, normas imperativas y materias no arbitrables. |
| HN-06 | `COUNSEL_DECISION_REQUIRED` | La candidata evita declarar que la plataforma determina por sí sola la naturaleza de la relación. | Calificación y redacción frente al modelo operativo real y derecho laboral hondureño. |

## 5. Matriz transversal

| Código | Clasificación | Qué queda confirmado | Qué debe decidir el abogado |
|---|---|---|---|
| X-01 | `SOURCE_SUPPORTS_DRAFT__COUNSEL_DECISION_REQUIRED` | Arquitectura separa nombre visible, estado registral y titular/licenciante; no afirma registro inexistente. | Copy legal definitivo y estrategia de transición al rebranding/marca futura. |
| X-02 | `COUNSEL_DECISION_REQUIRED` | La configuración no transfiere IP y no se atribuye software a una entidad futura sin soporte. | Cadena documental de titularidad/licencia actual y futuro instrumento de cesión/licencia. |
| X-03 | `COUNSEL_DECISION_REQUIRED` | Provider Registry solo muestra receptores técnicamente activos; Make/Gemini siguen fuera mientras estén gated. | DPA/contrato, ubicaciones, subencargados, transferencias y aviso para cada proveedor al momento de activarlo. |
| X-04 | `COUNSEL_DECISION_REQUIRED` | Diseño exige cifrado/protección, mínimo privilegio, UI enmascarada y retención limitada para cuenta bancaria completa. | Base/aviso/retención final y controles contractuales. |
| X-05 | `COUNSEL_DECISION_REQUIRED` | La candidata distingue finalidades propias de TyA de datos/finalidades aportados por Cliente. | Criterios de responsable/encargado o figura equivalente y cuándo exigir DPA/anexo por proyecto. |
| X-06 | `COUNSEL_DECISION_REQUIRED` | La candidata ya prohíbe excluir responsabilidades imperativas. | Límites, exclusiones, indemnidades y diferencias B2B/individual válidas. |

## 6. Búsqueda de revisión profesional ya existente

Se agotó búsqueda read-only antes de pedir acciones manuales:

- Google Drive: búsqueda específica de revisión legal/NDA/contrato TyA no devolvió una respuesta profesional V0.3 ni un dictamen GT/HN aplicable.
- Gmail: búsqueda por TyA/T&A + abogado/legal/contrato/NDA/confidencialidad/términos/revisión, excluyendo notificaciones GitHub, no encontró respuesta de abogado sobre esta candidata; los resultados fueron operativos o ajenos al paquete legal.

Por tanto, **no existe evidencia recuperada que permita declarar cerrado el gate de counsel**.

## 7. Qué cambia para el abogado

El paquete de revisión queda compuesto por:

1. `CANDIDATA-LEGAL-TYA-V0.3-CONSOLIDADA-REVISION-JURIDICA-20260815.md`;
2. `PAQUETE-REVISION-JURIDICA-TYA-GT-HN-V0.3-20260815.md`;
3. **esta matriz de fuentes primarias**.

En `HN-02`, el abogado debe considerar expresamente además el Decreto 149-2014, Ley sobre Comercio Electrónico de Honduras.

La matriz **no cambia la respuesta esperada** por cada código: `APROBADO SIN CAMBIO`, `CAMBIO REQUERIDO`, `NO APLICA` o `REQUIERE DOCUMENTO/HECHO ADICIONAL`.

## 8. Estado seguro

Provider credentials/reads/writes `0/0/0`; Auth/Firestore/legalContent/legalAcceptance writes `0`; passwordResets `0`; historical credential access/reconcile `0`; HR/Storage/Rules/Make/Gemini/pagos `0`; `/app/modules` cambios `0`; `/app/core` cambios `0`; deploy `0`; merge=false; producción=false.

**GO-LIVE continúa 35% completado / 65% pendiente; I3=0/25 hasta PASS integral.**

Gate humano vigente:
`HUMAN_COUNSEL_REVIEW_TYA_GT_HN_AND_PAULA_APPROVAL_BEFORE_PROVIDER_MATERIALIZATION`.