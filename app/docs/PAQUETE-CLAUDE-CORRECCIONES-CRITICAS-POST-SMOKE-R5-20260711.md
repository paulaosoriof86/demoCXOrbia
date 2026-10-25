# Paquete Claude — correcciones críticas post-smoke R5

Fecha: 2026-07-11
Proyecto: CXOrbia TyA
Prioridad: P0/P1 acotada

## Corrección metodológica vigente

Claude **no debe trabajar sobre el runtime R5 empalmado ni importar sus archivos backend-only**. R5 pertenece al mismo proyecto, pero es la baseline operativa de ChatGPT/Codex/backend. La baseline de edición de Claude sigue siendo la candidata frontend genérica V103 que ya tiene abierta.

No crear ni modificar:

- `core/tya-phase-a-*`;
- `data/tya-*`;
- `index-tya-phase-a-source-safe.html`;
- `backend/`;
- `tools/`;
- `.github/workflows/`;
- snapshot HR, adapters, importadores, Firebase, Make, Gemini o datos TyA.

No hardcodear 14 periodos, 616 visitas, 213 shoppers ni nombres TyA. ChatGPT/Codex harán el empalme posterior contra R5.

## Baseline obligatoria para Claude

Trabajar únicamente sobre la última candidata frontend genérica V103 abierta en su entorno. Continuar los Bloques 1–10 pendientes solamente cuando correspondan al prototipo `app/`, preservando todo bloque ya cerrado.

## Corrección 1 — P0 Portal Cliente sin resultados

Archivo principal: `app/modules/cliente.js`
Módulo: `cli_dashboard`

Hallazgo genérico: cuando la fuente no contiene sucursales puntuadas o secciones evaluadas, `R.mejorSeccion` y `R.peorSeccion` pueden ser nulos. Las referencias directas a `.sec.name` y `.val` rompen la vista.

Resultado requerido:

- Portal Cliente abre con arreglo vacío, resultados parciales o completos;
- empty state honesto: resultados pendientes / sin secciones evaluadas;
- no generar score, NPS, brecha, recomendación IA, ranking o sucursales ficticias;
- conservar el comportamiento cuando sí existan resultados;
- revisar `app/modules/cliente-extra.js` por el mismo patrón.

## Corrección 2 — P0 fixtures fuera de demo

Revisar `app/modules/configuracion.js`, topbar, notificaciones, reservas y otros seeds visibles.

Resultado requerido:

- usuarios, correos, notificaciones, reservas y demás fixtures solo existen cuando la fuente está en modo demo;
- fuera de demo, mostrar vacío honesto o estado de fuente pendiente;
- no inventar reemplazos.

## Corrección 3 — P1 Histórico

Archivo principal: `app/modules/historico.js`.

Resultado requerido:

- excluir por defecto cualquier periodo cuyo estado sea `activo`;
- permitir incluirlo de forma explícita;
- no hardcodear cantidad de periodos, fechas, país o proyecto;
- consumir el estado que entregue `CX.data`/data source.

## Corrección 4 — P1 Portal Shopper móvil

Resultado requerido:

- corregir la causa del overflow horizontal;
- validar 360, 390 y 412 px;
- no usar `overflow-x:hidden` global para ocultarlo;
- conservar desktop.

## Entrega

- ZIP frontend completo incremental sobre V103;
- reporte único;
- archivos modificados/agregados/eliminados;
- manifest verificable;
- smoke del prototipo genérico;
- pendientes honestos.

ChatGPT/Codex harán auditoría forense, empalme de tres vías contra R5 y nuevo smoke. Claude no realiza ese empalme.
