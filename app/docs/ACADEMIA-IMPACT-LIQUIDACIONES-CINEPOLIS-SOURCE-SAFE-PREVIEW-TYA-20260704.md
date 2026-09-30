# Academia impact - liquidaciones Cinepolis source-safe preview TyA

Fecha: 2026-07-04

## Bloque relacionado

- `app/docs/LIQUIDATIONS-CINEPOLIS-SOURCE-SAFE-PREVIEW-VALIDATOR-PHASE-A-TYA-20260704.md`
- `app/contracts/liquidation-cinepolis-source-safe-preview-phase-a.tya.contract.json`
- `tools/migration/tya-liquidation-cinepolis-source-safe-preview-validator.mjs`

## Objetivo Academia

Convertir el bloque tecnico de preview seguro de liquidaciones y Boleto/Combo en contenido profundo, editable e interactivo para roles operativos, admin, shopper y consultora/aliado.

Academia no debe limitarse a explicar que existen liquidaciones. Debe enseñar como interpretar estados, que significa cada monto, como evitar duplicidades y que datos sensibles nunca deben exponerse.

## Rutas por rol

### Shopper

Debe aprender:

- que es honorario;
- que es reembolso;
- que significan Boleto y Combo en Cinepolis;
- que significa pendiente, programado, pagado y en revision;
- por que visita realizada no significa pagada;
- por que cuestionario realizado no significa submitido ni pago;
- donde ver Mis beneficios;
- que informacion no vera por seguridad: banco, DPI, notas internas o auditoria interna.

### Admin

Debe aprender:

- como revisar corte junio sin tratarlo como visitas pendientes;
- como revisar elegibilidad segun visita, cuestionario, revision y submitido;
- como preparar un lote seleccionando items;
- como detectar filas que deben ir a revision manual;
- como evitar marcar pagado sin referencia historica o confirmacion manual estable;
- como manejar pagos historicos de mayo/julio antes de cerrar lotes nuevos.

### Ops / coordinador

Debe aprender:

- como revisar inconsistencias de HR/source preview;
- como diferenciar `candidate_pending_submitido`, `candidate_ready`, `scheduled`, `paid` y `manual_review_required`;
- como explicar al shopper el estado sin prometer pago si no existe confirmacion;
- como documentar conflicto y escalar a admin.

### Superadmin / consultora / aliado

Debe aprender:

- como las reglas de Boleto/Combo son configuracion especifica de proyecto;
- como mantener CXOrbia multi-proyecto y multi-tenant;
- como configurar pais/moneda y reglas financieras sin hard-codear Cinepolis globalmente;
- como usar source-safe preview antes de autorizar import o integraciones reales.

## Manuales a crear o actualizar

1. Manual Liquidaciones y pagos.
2. Manual Mis beneficios shopper.
3. Manual Corte junio TyA.
4. Manual Boleto/Combo Cinepolis.
5. Manual Lotes de pago y movimientos individuales.
6. Manual Revision manual y conflictos.
7. Manual Datos sensibles en pagos.

## Lecciones profundas requeridas

### Leccion 1 - Diferencia entre visita, cuestionario, submitido, liquidacion y pago

Debe explicar el flujo completo:

1. visita ejecutada;
2. cuestionario realizado;
3. revision admin;
4. submitido HR-driven o confirmado;
5. candidata a liquidacion;
6. seleccionada para lote;
7. pagada con referencia estable;
8. visible al shopper en Mis beneficios.

### Leccion 2 - Boleto y Combo

Debe explicar:

- Boleto = reembolso de boleto;
- Combo = reembolso de combo;
- ambos son reembolsos, no honorario;
- pueden ser cero/no aplicar;
- el total de reembolso suma Boleto + Combo;
- aplica a Cinepolis, no globalmente a todos los proyectos.

### Leccion 3 - Source-safe preview

Debe explicar:

- por que se usa antes de leer fuentes reales;
- que es un archivo sintetico/sanitizado;
- que significa `sourceSafe=true`;
- por que se bloquean DPI, banco, NDA y adjuntos crudos;
- que se puede validar sin poner en riesgo datos reales.

### Leccion 4 - Revision manual

Debe explicar casos practicos:

- falta `visitId` o `hrRowId`;
- un pago aparece pagado sin referencia estable;
- el monto no cuadra;
- hay mas de una posible coincidencia historica;
- el shopper no existe en plataforma;
- hay campos sensibles en el preview.

### Leccion 5 - Lotes y movimientos individuales

Debe explicar:

- que un lote agrupa pagos seleccionados;
- que no todos los elegibles entran automaticamente;
- que cada item mantiene movimiento individual;
- que el shopper debe ver su detalle sin banco ni notas internas;
- que los movimientos deben conservar `batchId`, `paymentItemId` y auditoria.

## Checklists interactivos

### Checklist antes de preparar lote

- La fila corresponde al proyecto correcto.
- La visita esta ejecutada.
- El cuestionario fue realizado.
- Submitido/revision cumple la politica del proyecto.
- Hay llave estable de visita/HR.
- Honorario y reembolso estan separados.
- Boleto y Combo son coherentes.
- No hay datos sensibles en vista shopper.

### Checklist antes de marcar pagado

- Existe referencia historica o confirmacion manual estable.
- El item pertenece a un lote aprobado o a historico conciliado.
- No hay duplicidad con mayo/julio.
- Hay movimiento individual.
- No se expuso banco/DPI/NDA.

### Checklist antes de mostrar en Mis beneficios

- Shopper solo ve sus propios items.
- Montos estan separados.
- Estado es honesto: pendiente, programado, pagado o revision.
- No hay notas internas.
- No hay datos bancarios.

## Glosario requerido

- `sourceSafe`
- `sourceVisitRef`
- `sourcePaymentRef`
- `candidate_pending_submitido`
- `candidate_ready`
- `approved_for_payment`
- `manual_review_required`
- `held_for_conflict`
- `paymentItemId`
- `movementId`
- `batchId`
- `Boleto`
- `Combo`
- `reimbursementTotal`

## Notificaciones Academia

Cuando este bloque se implemente visualmente, Academia debe notificar:

- curso nuevo o actualizado de liquidaciones/pagos;
- manual actualizado de Mis beneficios;
- cambio de reglas de Boleto/Combo;
- checklist nuevo para admin/ops;
- contenido pendiente de revision humana si Gemini ayuda a generar borradores.

## Estado seguro

Documento academico. No activa runtime, no escribe Firestore, no escribe HR, no ejecuta pagos, no lee fuentes reales y no cambia frontend.
