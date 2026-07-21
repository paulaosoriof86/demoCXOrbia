# CHECKPOINT OPERATIVO CXORBIA TyA - VIGENTE

Fecha: 2026-07-20
Estado: `CORTE_1B_FRONTEND_FIX_REQUIRED_AFTER_LIVE_HR_PASS`

## Estado comprobado

- Rama viva: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.
- Baseline activa: V161C/R21.
- V164 y Corte 1A están integrados.
- Cloud Run DEV read-only y Hosting DEV están desplegados.
- La HR viva quedó confirmada mediante cambios operativos reales realizados por Paula.
- Refresco al cargar, `pageshow` y sondeo de 15 segundos están desplegados.
- Corte 1 no está congelado.
- Corte 2 continúa bloqueado.

## Evidencia funcional real

Paula confirmó:

1. agregar fecha de cuestionario en HR cambia el KPI;
2. asignar shopper en HR retira la visita del tablero disponible del shopper;
3. los KPI de julio coinciden con la HR actual;
4. los cuatro reportes operativos del cliente vuelven a estar disponibles;
5. los cambios HR todavía requieren un ciclo de lectura/canonización y no son instantáneos.

Esto confirma que la plataforma ya no depende de un snapshot histórico como verdad operativa.

## Último deploy DEV

Run `29799752544`, job `88538293485`:

- gates de HR viva: PASS;
- build imagen: PASS;
- Cloud Run DEV: PASS;
- smoke directo: PASS;
- Hosting DEV: PASS;
- smoke same-origin: PASS;
- trigger de refresco rápido: PASS.

Artefacto `8483321397`.
Digest `sha256:b5386d5a9c4a7f2d4ad385026bd2d795de59c7e54b2b8cf73d972fd516fc6d86`.

## P0 frontend demostrados

### Reportes Admin

- `app/modules/operacion-extra.js` imprime la página completa mediante `window.print()`.
- La edición guarda datos auxiliares, pero no modifica el reporte ni las exportaciones.
- El botón Excel genera CSV.
- Existen métricas no respaldadas por una fuente confirmada.

### Panorama

- `app/core/cliente-data.js` usa cache sin `periodKey` ni `sourceRevision`.
- `app/modules/cliente.js` mezcla operación del periodo con score/NPS/secciones pendientes.
- Al cambiar MAY/JUN/JUL, el rótulo cambia, pero aparecen ceros o valores aparentes iguales cuando falta la fuente de score.

### Diseño de reportes

- Reportes Cliente funciona de nuevo, pero la plantilla sigue genérica.
- Faltan logo, paleta, tipografía, encabezado, pie, paginación y gráficas configurables por tenant.
- El estándar debe aplicarse a Admin, Cliente, Shopper y demás roles según permisos.

## Paquete vigente para Claude

`app/docs/PAQUETE-CLAUDE-CORTE1B-REPORTES-PANORAMA.md`

Alcance permitido:

- `app/modules/operacion-extra.js`;
- `app/modules/cliente-extra.js`;
- `app/core/cliente-data.js`;
- `app/modules/cliente.js`;
- `app/modules/cliente-insights.js`, si aplica.

Backend, contratos, adapters live, `CX.data`, Cloud Run, Hosting e IAM quedan protegidos.

## Documentación vigente

- `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
- `app/docs/RESUMEN-PARA-CLAUDE-ADDENDUM-CORTE1-LATENCIA-REPORTES-DISENO-20260720.md`;
- `app/docs/CAMBIOS-BACKEND-ADDENDUM-CORTE1-REFRESCO-RAPIDO-Y-REPORTES-20260720.md`;
- `app/docs/PAQUETE-CLAUDE-CORTE1B-REPORTES-PANORAMA.md`;
- `app/docs/PENDIENTES-PROTOTIPO.md`;
- PR #7.

## Siguiente bloque exacto

`DELTA CLAUDE CORTE 1B → AUDITORÍA FOCALIZADA → APPLY_DELTA_DIRECTLY EN RAMA VIVA → GATES → HOSTING DEV → VALIDACIÓN VISUAL → RETIRAR WORKFLOW TEMPORAL → FREEZE CORTE 1`

## Estado seguro

Sin merge, producción, importación real, escrituras Firestore/Auth/Storage/HR, Make/Gemini live ni pagos.