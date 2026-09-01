# Pendientes prototipo addendum - Real-data preview TyA

Fecha: 2026-07-09  
Bloque: pendientes prototipo derivados de real-data preview  
Estado: documentado.

## 1. Pendiente P0 - Copy honesto de estados

Problema: el prototipo puede inducir a pensar que hay import, sincronizacion, pago o proveedor real cuando solo hay preview/preflight.

Pendiente:

- Mostrar estados demo / Level 0 / Level 1 / Level 2 / staging / importado / produccion.
- Evitar `enviado`, `sincronizado`, `pagado`, `Gemini activo`, `HR sincronizada`, `importado` si el backend esta en preview.

Impacto:

- Reusable CXOrbia: si.
- Cliente TyA: si.
- Claude/prototipo: si.
- Academia: si.

## 2. Pendiente P0 - Fuente HR configurable por proyecto

Problema: Phase A requiere que HR sea fuente operacional, pero el prototipo debe representar la fuente como configuracion de proyecto, no como logica fija.

Pendiente:

- Agregar seccion Fuente de Hoja de Ruta en proyecto.
- Mostrar tipo de fuente y estado.
- No mostrar URL/fileId.
- Excluir dashboards de visitas.
- Indicar `review_required` cuando aplique.

Impacto:

- Reusable CXOrbia: si.
- Cliente TyA: parcial.
- Claude/prototipo: si.
- Academia: si.

## 3. Pendiente P0 - Cinépolis no hardcodeado

Problema: Cinépolis debe ser proyecto TyA configurable y multi-proyecto desde el inicio.

Pendiente:

- Revisar si hay textos/flujos que tratan Cinépolis como caso global.
- Pasar reglas a configuracion visual de proyecto cuando aplique.
- Mantener pais, moneda, HR, cuestionario, certificacion y pagos configurables.

Impacto:

- Reusable CXOrbia: si.
- Cliente TyA: si.
- Claude/prototipo: si.
- Academia: si.

## 4. Pendiente P1 - Shoppers opacos y revision

Problema: Level 2 puede tener shoppers sanitizados/opacos por seguridad y porque el canonical mismatch sigue en revision.

Pendiente:

- Mostrar shopper opaco/sanitizado sin PII.
- Mostrar `pending_review` o `review_required` claramente.
- No deduplicar por nombre visual.
- No mostrar DPI/banco/telefono/email/nombre crudo.

Impacto:

- Reusable CXOrbia: si.
- Cliente TyA: si.
- Claude/prototipo: si.
- Academia: si.

## 5. Pendiente P1 - Certificaciones preservadas

Problema: Phase A debe conservar certificaciones ya presentadas para no pedirlas de nuevo.

Pendiente:

- Mostrar preservada/aprobada/pending_mapping_review.
- No pedir retake si esta preservada salvo regla explicita.
- Aclarar que Gemini genera borradores y requiere revision humana.

Impacto:

- Reusable CXOrbia: si.
- Cliente TyA: si.
- Claude/prototipo: si.
- Academia: si.

## 6. Pendiente P1 - Liquidaciones/pagos como control

Problema: Junio pendiente corresponde a pagos/liquidaciones, no visitas pendientes.

Pendiente:

- Mostrar payment_control_preview/candidato.
- Separar honorario, reembolso y total.
- Mostrar requiresFinanceCrosscheck.
- No mostrar pagado sin evidencia/auditoria/fuente financiera.

Impacto:

- Reusable CXOrbia: si.
- Cliente TyA: si.
- Claude/prototipo: si.
- Academia: si.

## 7. Pendiente P1 - Academia

Problema: los nuevos niveles/gates necesitan explicacion operable.

Pendiente:

- Manual: configurar HR source.
- Manual: entender Level 0/1/2.
- Manual: revisar conflictos.
- Manual: preservar certificaciones.
- Manual: liquidaciones/pagos en control.
- Manual: privacidad y PII.

Impacto:

- Reusable CXOrbia: si.
- Cliente TyA: parcial.
- Claude/prototipo: si.
- Academia: si.

## 8. No hacer

No hacer desde prototipo:

- provider real;
- import real;
- Firestore write;
- HR write;
- Make/Gemini real;
- pagos;
- hardcode de Cinépolis;
- exponer PII.
