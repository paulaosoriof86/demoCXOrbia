# DECISION-BACKEND-METODOLOGIA-AGIL-20260629

## Decisión

El backend seguirá construyéndose integralmente, pero con metodología más ágil y sin repetir estructuras innecesarias.

## Qué se mantiene obligatorio

- No tocar producción.
- No publicar reglas sin autorización.
- No activar adapter global sin autorización.
- No modificar `/app/modules`.
- No romper la interfaz `CX.data`.
- No conectar bases antiguas.
- Todo por tenant/project.
- Documentar cambios relevantes.
- Usar dry-run antes de cualquier escritura masiva.

## Qué se reduce

No se creará automáticamente plan + schema + rules + dry-run + validator + review pack para cada subtema.

A partir de ahora:

- Para módulos críticos: schema/contract + herramienta útil + validación.
- Para ajustes menores: solo addendum o nota para Claude.
- Para módulos ya modelados: avanzar hacia conexión/validación, no seguir rediseñando.

## Prioridad inmediata

1. Finanzas profundo (#168).
2. Acciones operativas persistibles (#185).
3. Adapter `CX.data` real hacia Firestore DEV.
4. Validación end-to-end con TyA DEV.
5. Paquetes para Claude por lotes.

## Frentes que ya quedan suficientemente modelados por ahora

- Configuración.
- Integraciones.
- Automatizaciones.
- Storage/evidencias/documentos.
- Legal/consentimientos.
- IA responsable.
- Set-up inteligente.
- Reportes Excel.

## Regla de avance

Cada nuevo bloque debe responder una pregunta práctica:

- ¿Esto permite escribir o leer backend real?
- ¿Esto valida datos reales o candidatos?
- ¿Esto evita romper producción?
- ¿Esto le da a Claude instrucciones accionables?

Si la respuesta es no, se posterga.
