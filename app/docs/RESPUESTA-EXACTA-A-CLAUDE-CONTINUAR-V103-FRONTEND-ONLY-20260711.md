# Respuesta exacta a Claude — continuar V103 frontend-only

Correcto: detente respecto al paquete R5 y no importes esa baseline. R5 pertenece al mismo proyecto CXOrbia TyA, pero es el runtime operativo backend/source-safe de ChatGPT/Codex y no es tu baseline de edición.

Tu carril sigue siendo exclusivamente el prototipo genérico `app/` que ya tienes abierto sobre V103. No crees ni modifiques `tya-phase-a-*`, snapshot HR, adapters, contratos, tools, workflows, Firebase, imports, Make, Gemini ni datos TyA. No hardcodees 14 periodos, 616 visitas o 213 shoppers.

Continúa los Bloques 1–10 pendientes de V103 únicamente en lo que corresponda al frontend/prototipo genérico. Conserva lo que ya cerraste y no reinicies bloques resueltos.

Integra además estos cuatro requisitos frontend, de forma genérica y sin depender de R5:

1. Portal Cliente null-safe: debe abrir con resultados vacíos o parciales, usando empty states honestos y sin inventar score, NPS, brecha, ranking, recomendación o sucursales.
2. Fixtures solo en demo: usuarios, correos, notificaciones, reservas y otros seeds no pueden aparecer cuando la fuente no es demo.
3. Histórico: excluir por defecto cualquier periodo con estado `activo`; ofrecer incluirlo explícitamente. No hardcodear cantidad de periodos ni nombres TyA.
4. Shopper móvil: corregir la causa del overflow y validar 360, 390 y 412 px; no ocultarlo con `overflow-x:hidden` global.

Devuelve un ZIP frontend completo incremental sobre tu V103 actual, un reporte único, lista exacta de archivos, manifest verificable y smoke del prototipo. ChatGPT/Codex auditarán y empalmarán después tu candidata contra el runtime R5; tú no debes realizar ese empalme.
