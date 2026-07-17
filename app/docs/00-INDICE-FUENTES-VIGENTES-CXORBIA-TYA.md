# 00 — ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-07-17  
**Estado:** ACTIVO Y OBLIGATORIO  
**Regla:** este archivo se lee primero y define la única jerarquía vigente de fuentes.

## 1. Fuentes activas y orden obligatorio

Leer en este orden:

1. `00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`
2. `00-REGLAS-MAESTRAS-CONTEXTO-CONTINUIDAD-CXORBIA-TYA-ACTUALIZADO-20260704.md`
3. `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`
4. `ADDENDUM-MAESTRO-ACADEMIA-PROFUNDA-INTERACTIVA-CXORBIA-TYA-20260704.md`
5. `ADDENDUM-MAESTRO-PATRONES-REUTILIZABLES-CXORBIA-20260707.md`
6. `ADDENDUM-MAESTRO-ANTIDESVIO-PRODUCCION-REAL-LEGACY-CLAUDE-CXORBIA-TYA-20260709.md`
7. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`

Después de estas fuentes, consultar en el repositorio:

8. checkpoint/source lock más reciente;
9. `CAMBIOS-BACKEND.md` o addendum vigente;
10. `RESUMEN-PARA-CLAUDE.md` o addendum vigente;
11. `PENDIENTES-PROTOTIPO.md` o addendum vigente;
12. PR #7 y HEAD de `docs-tya-v6-v71-audit`.

## 2. Prevalencia

En conflictos de metodología de candidatas y empalmes prevalece:

`ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`

En continuidad general prevalece el documento maestro actualizado indicado arriba.

En estado operativo puntual prevalece:

`CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`

Las decisiones específicas de datos, seguridad, Academia y Phase A se conservan según sus fuentes especializadas, salvo conflicto explícito con un lock posterior autorizado por Paula.

## 3. Fuentes que deben retirarse o marcarse SUPERADO / NO USAR

Después de cargar las tres nuevas fuentes, retirar de las Fuentes activas:

- `00-REGLAS-MAESTRAS-CONTEXTO-CONTINUIDAD-CXORBIA-TYA-COMPLETO.md`
- `ADDENDUM-MAESTRO-EJECUCION-DIRECTA-EMPALMES-CXORBIA-TYA-20260716(1).md`
- `ADDENDUM-MAESTRO-EJECUCION-DIRECTA-EMPALMES-CXORBIA-TYA-ACTUALIZADO-20260717.md`
- `ADDENDUM-MAESTRO-EJECUCION-DIRECTA-EMPALMES-CXORBIA-TYA-ACTUALIZADO-20260717(1).md`

Motivo:

- el documento maestro `ACTUALIZADO-20260704` es más completo que `COMPLETO`;
- los dos archivos `ACTUALIZADO-20260717` son duplicados exactos;
- el nuevo addendum canónico incorpora el carril file-aware y sustituye las variantes anteriores.

No borrar los históricos del repositorio. Solo evitar que compitan como Fuentes activas.

## 4. Fuentes que no deben cargarse permanentemente

No cargar como fuentes maestras permanentes:

- ZIPs de candidatas;
- paquetes puntuales para Claude;
- auditorías V156/V157/V158/V159;
- manifests de una candidata;
- documentos históricos superados;
- copias con `(1)`;
- múltiples checkpoints.

Las candidatas se adjuntan a la conversación operativa. Las auditorías históricas viven en el repositorio. En Fuentes solo permanece un checkpoint vigente reemplazable.

## 5. Política de nombres canónicos

Las fuentes maestras estables no llevan nueva fecha ni número de versión en cada actualización.

Se actualiza el contenido conservando el mismo nombre:

- `00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`
- `ADDENDUM-MAESTRO-EMPALME-DIRECTO-Y-CARRIL-FILE-AWARE-CXORBIA-TYA-VIGENTE.md`
- `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`

Prohibido crear:

- `copia`;
- `(1)`;
- `final`;
- `final-final`;
- `V2`;
- otra fecha paralela.

## 6. Instrucción corta para el proyecto

Agregar a las instrucciones del proyecto:

> Antes de responder o actuar, lee primero `00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md` y las fuentes que declara activas. Para toda candidata, confirma `EXECUTION_LANE_READY` antes de auditar; la misma sesión debe tener ZIP extraído, checkout autenticado y rama viva. Si el carril no está listo, detente antes de auditar. Si la candidata queda GO, aplica inmediatamente `APPLY_DELTA_DIRECTLY`; no uses conectores archivo por archivo, blobs, trees, workflows, PowerShell, nuevas ramas, nuevos PR ni acciones manuales de Paula.

## 7. Regla de mantenimiento

Después de cada bloque que cambie baseline, source lock, candidata activa o siguiente acción:

1. actualizar `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
2. reemplazar la versión anterior en Fuentes;
3. no crear otro checkpoint;
4. mantener auditorías y bitácoras detalladas en GitHub;
5. conservar PR #7 draft/open hasta autorización expresa.

## 8. Resultado esperado

Las Fuentes activas deben responder sin ambigüedad:

- qué documento manda;
- qué metodología está vigente;
- cuál es la candidata activa;
- cuál es la rama correcta;
- cuál es el siguiente bloque exacto;
- qué está prohibido;
- qué requiere autorización.
