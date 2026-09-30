# Addendum maestro - Metodologia generica reforzada de auditoria, empalme y ultima version

Fecha: 2026-07-04

## Motivo

Paula aclaro que la metodologia acordada no es dejar la ultima candidata solo como auditada, sino trabajar siempre sobre la ultima version entregada y auditada, salvo bloqueo critico.

Este addendum no debe fijar numeros de version particulares. Las versiones especificas pertenecen a auditorias forenses, paquetes puntuales y tracker vivo, no a reglas maestras.

## Regla corregida: siempre se trabaja sobre la ultima version auditada

1. La version mas reciente entregada por Paula debe auditarse de forma forense.
2. Si la version mas reciente es ejecutable, no rompe estructura, no introduce bloqueo critico y no contradice reglas maestras, queda como baseline auditada de continuidad.
3. A partir de esa decision, backend seguro continua sobre esa ultima version auditada, aunque todavia no sea source lock final ni produccion.
4. La expresion correcta no es solo candidata auditada; debe documentarse como ultima version auditada para continuidad o baseline viva de empalme backend.
5. El source lock final se reserva para version ya aceptada como base formal de integracion/corte.
6. Si la ultima candidata tiene defectos, se documentan para Claude, pero backend seguro continua sobre el entendimiento de esa ultima candidata, no sobre una version anterior, salvo bloqueo critico.

## Categorias obligatorias

| Categoria | Significado | Backend seguro puede continuar |
|---|---|---|
| Source lock final | Version aceptada como base formal estable para integracion/corte | Si |
| Baseline auditada de continuidad | Ultima version auditada usable para contratos/docs/validators aunque tenga pendientes Claude | Si |
| Candidata parcial con bloqueo critico | Version con error estructural, scripts rotos, perdida de modulos, conflicto de fuente o riesgo de contaminacion | No |
| ZIP duplicado/sin cambios | Reempaque o reupload sin delta real | No cambia baseline |

## Auditoria profunda reforzada obligatoria

Cada auditoria debe revisar y documentar:

1. ZIP/hash recibido y nombre exacto.
2. Version declarada por Claude.
3. Version contra la que se compara.
4. Delta contra version inmediata anterior.
5. Acumulado contra baseline/source lock anterior.
6. Comparacion contra repo/rama/PR cuando aplique.
7. Archivos agregados, eliminados y modificados.
8. Diferencia entre cambios nuevos y heredados.
9. Revision semantica de cada modulo modificado.
10. Validacion de `index.html`: scripts agregados, faltantes, duplicados y orden de carga.
11. Validacion JS con `node --check` o equivalente.
12. Textos que prometen integraciones reales sin gate activo.
13. Versionado residual en docs, banners, SaaS console, addenda y textos visibles.
14. Regresiones visuales/funcionales detectables por estructura.
15. Academia con profundidad real.
16. Impacto en Phase A: HR, postulaciones, visitas, cuestionario, revision, submitido, liquidaciones, pagos, beneficios, comunicaciones, CRM, email, Make y Gemini.
17. Datos sensibles: banco, DPI/documentos, NDA, telefonos, correos, adjuntos, cuerpos crudos, evidencias y links privados.
18. Multi-tenant: no hard-codear Cinepolis como logica global.
19. Honestidad operativa: preview, pendiente backend, requiere revision, gate apagado, provider pending, fallback manual.
20. Respuesta punto por punto a lo que Claude/Codex afirma haber cambiado.

## Regla delta vs acumulado

Toda auditoria debe separar:

- Delta nuevo: lo que cambio respecto al ZIP inmediatamente anterior.
- Acumulado heredado: lo que existe en la candidata, pero ya venia de versiones anteriores.
- Pendiente vivo: lo que sigue sin resolverse aunque Claude/Codex lo mencione como atendido.
- Regresion: algo que empeoro o reintrodujo bug.
- Hallazgo nuevo: problema no registrado antes.

Si Codex o Claude reportan cambios que no coinciden con la auditoria, se debe crear auditoria complementaria que explique base de comparacion, delta real, acumulado, pendientes vivos y decision de empalme.

## Empalme agil con la ultima version

Despues de auditar una candidata nueva:

1. Si no hay bloqueo critico, se empalma metodologicamente como ultima version auditada.
2. Backend seguro continua sobre esa version.
3. No se modifica frontend desde backend.
4. Los pendientes frontend van a Claude con archivo, problema, impacto y validacion esperada.
5. El tracker actualiza version auditada, si es source lock final o baseline de continuidad, resoluciones, pendientes y siguiente bloque backend.
6. No se debe seguir mencionando una version anterior como base viva si Paula entrego una nueva version auditada y usable, salvo bloqueo critico documentado.

## Criterios de bloqueo critico

No empalmar si hay scripts rotos, faltantes criticos en `index.html`, perdida de modulos esenciales, conflicto no resuelto entre Fuentes/repo/ZIP/docs, contaminacion de otro proyecto, promesas de produccion o integraciones reales sin autorizacion, escrituras reales sin autorizacion, datos sensibles crudos, regresion estructural que impida Phase A o ZIP duplicado presentado como version nueva.

## Paquete Claude reforzado

Cada paquete para Claude debe incluir decision, tabla delta vs acumulado, que resolvio, que sigue pendiente, que empeoro, hallazgos nuevos, pendientes por prioridad y modulo, validacion tecnica esperada, prompt completo, lista de archivos que Claude no debe tocar e instruccion explicita de trabajar sobre la ultima version auditada.

## Checklist antes de cerrar auditoria

- Comparar contra version inmediata anterior.
- Comparar contra baseline/source lock acumulado.
- Separar delta vs acumulado.
- Responder punto por punto lo que Claude/Codex afirmo.
- Identificar que si se resolvio.
- Identificar que sigue pendiente aunque se reporte resuelto.
- Actualizar tracker.
- Actualizar pendientes para Claude.
- Actualizar CAMBIOS/addendum.
- Indicar si la ultima version es source lock final, baseline continuidad o bloqueada.
- Dejar claro sobre que version continua backend.
- Generar paquete Claude si Claude tiene capacidad.

Si falta alguno, la auditoria no esta cerrada.

## Lenguaje obligatorio

Evitar frases ambiguas como solo candidata auditada, no queda aceptada sin explicar empalme, se conserva como referencia sin indicar continuidad, o source lock cuando se habla de continuidad backend.

Usar frases explicitas sin fijar numeros de version en este addendum:

- La ultima candidata queda como baseline auditada de continuidad backend, no source lock final.
- Backend seguro continua sobre la ultima baseline auditada valida.
- Claude debe generar la siguiente correctiva sobre la ultima baseline auditada valida.
- No se toca frontend desde backend.
- No hay produccion, deploy, merge ni escrituras reales.
