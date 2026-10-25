# Auditoria integral candidata actual V82 Claude

Fecha: 2026-07-04

## Correccion metodologica

La instruccion correcta no es pedir un microcambio por defecto. Esa recomendacion solo aplicaba cuando quedaban muy pocos ajustes despues de una entrega inmediata. En este punto, varias sesiones despues, corresponde auditar V82 completa, consolidar pendientes acumulados, incluir lo avanzado por backend y entregar paquete integral para Claude.

## Alcance

Se audito `Prototype development request CXOrbia V82.zip` como candidata actual/source lock vivo del frontend/prototipo.

Se reviso:

- estructura de archivos;
- scripts cargados en `app/index.html`;
- sintaxis JS;
- textos que prometen integraciones reales;
- modulos Phase A;
- Academia;
- Liquidaciones, Mis beneficios, lotes y movimientos;
- coherencia contra los contratos/documentos backend recientes.

## Validaciones tecnicas

- Archivos en `app/`: 96.
- Archivos JS: 61.
- Scripts cargados por `app/index.html`: 61.
- Scripts externos: 2.
- Scripts locales faltantes: 0.
- Scripts duplicados: 0.
- `node --check` sobre 61 JS: OK 61 / FAIL 0.

## Decision

V82 sigue siendo base util y source lock vivo, pero no esta lista como candidata final sin ajustes. El siguiente candidato de Claude debe ser controlado sobre V82, pero no limitado a microcambios: debe cubrir pendientes acumulados, Academia y los nuevos pendientes derivados del backend Phase A.

## Hallazgos principales

### 1. Texto `cuestionario enviado` sigue vivo

Impacta:

- `app/modules/cuestionario-shopper.js`;
- `app/modules/revision-admin.js`;
- `app/modules/academia.js`;
- `app/core/manuales-data.js`;
- `app/core/liquidacion.js`;
- docs internas.

Correccion esperada: usar `cuestionario realizado/completado` y separar cuestionario, revision, submitido, liquidacion y pago.

### 2. Textos de HR sincronizada siguen vivos

Impacta:

- `app/modules/misvisitas.js`;
- `app/modules/postulaciones.js`;
- `app/demo/index.html`;
- `app/core/automations.js`;
- docs internas.

Correccion esperada: usar textos honestos como `preparado`, `pendiente backend`, `se reflejara en HR cuando el sync este activo`, `requiere autorizacion` o `preview`.

### 3. Make/correo/WhatsApp parecen reales en algunas pantallas

Impacta:

- `app/modules/dashboard.js`;
- `app/modules/soporte.js`;
- `app/modules/correo.js`;
- `app/core/topbar.js`;
- `app/core/automations.js`;
- `app/modules/academia.js`.

Correccion esperada: si no hay proveedor real conectado, no decir `enviado`; usar borrador, fallback manual, registro local o pendiente backend.

### 4. Liquidaciones/pagos requieren ajuste semantico

Impacta:

- `app/core/data.js`;
- `app/core/liquidacion.js`;
- `app/modules/beneficios.js`;
- `app/modules/finanzas.js`;
- `app/modules/academia.js`.

Riesgo: UI puede parecer que marca pagos reales o cierra lotes sin referencia estable.

Correccion esperada: mostrar estados pendiente/programado/pagado con confirmacion/revision/conflicto, y no tratar cuestionario realizado como submitido ni pago.

### 5. Mis beneficios tiene base, pero no cubre completo el contrato reciente

V82 separa honorario/reembolso y calcula Boleto/Combo como reembolso, pero falta:

- Boleto y Combo visibles explicitamente para Cinepolis;
- `batchId` o referencia visible de lote;
- `paymentItemId` o referencia visible de item;
- estados de revision/conflicto;
- junio como corte de pagos pendientes;
- no pago real sin referencia estable.

### 6. Academia es amplia, pero incompleta contra addendum maestro

Fortalezas:

- cursos/lecciones extensos;
- evaluaciones;
- progreso;
- edicion basica de cursos/lecciones;
- contenido por audiencia.

Brechas:

- no aparece checklist interactivo real;
- no aparece glosario consolidado;
- no aparecen `sourceSafe`, `sourcePaymentRef`, `manual_review_required`, `batchId`, `paymentItemId`, `movementId`;
- no aparecen Boleto/Combo;
- hay textos de sincronizacion automatica/WhatsApp automatico/HR externa que deben ser honestos;
- falta backfill de liquidaciones/Cinepolis/corte junio;
- faltan notificaciones propias de Academia o pendiente explicito;
- falta acceso persistente/topbar o pendiente explicito.

## Pendientes P0 para Claude

1. Corregir `cuestionario enviado` en modulos visibles y Academia.
2. Corregir `HR sincronizada` / `sincroniza HR` / `sincroniza hoja de ruta`.
3. Ajustar `revision-admin.js` con `status=estado`, `projectId:p.id`, `hrRowId` y nota/referencia HR explicita en HR-driven.
4. Cambiar toasts de Make/correo/WhatsApp para no prometer envios reales.
5. Actualizar Mis beneficios, Liquidaciones y Movimientos con Boleto, Combo, lote/item, estados honestos y revision/conflicto.
6. Profundizar Academia con checklists, glosario, rutas por rol, notificaciones y contenido de liquidaciones/Cinepolis/source-safe preview.

## Pendientes P1

1. Mostrar junio como pagos/liquidaciones pendientes, no visitas pendientes.
2. Separar realizada, cuestionario, revision, submitido, liquidacion y pago.
3. Lotes seleccionables por admin.
4. Movimientos individuales aunque provengan de lote.
5. No hard-codear Cinepolis como regla global.
6. Mantener pais/moneda por proyecto.

## Estado seguro

- Auditoria documental.
- Sin cambios frontend aplicados.
- Sin deploy.
- Sin merge.
- Sin produccion.
- Sin Firestore/HR/pagos/Make/Gemini/correo real.
- Sin datos sensibles.

## Paquete entregado a Paula

Se genero paquete descargable local:

`PAQUETE_CLAUDE_CXORBIA_TYA_V82_AUDITORIA_INTEGRAL_20260704.zip`

Incluye:

1. decision metodologica;
2. auditoria integral V82;
3. matriz priorizada de pendientes;
4. prompt completo para Claude;
5. auditoria especifica de Academia;
6. validaciones tecnicas.
