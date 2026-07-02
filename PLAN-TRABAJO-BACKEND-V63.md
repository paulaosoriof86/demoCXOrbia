# PLAN-TRABAJO-BACKEND-V63.md

Fecha: 2026-07-01
Rama: release/cxorbia-tya-rc-20260630
Base vigente de trabajo: V63 auditada como aplicable, con backend protegido preservado.
Restricciones: no deploy, no Hosting, no producción, no datos reales, no Orbit, no Orbia, no secretos, no cambios destructivos.

## Decisión metodológica

Se cambia a una metodología ágil por entregables pequeños, verificables y con avance medible. El objetivo es dejar de trabajar por bloques largos que consumen horas sin un resultado visible.

Cada sprint debe entregar al menos uno de estos resultados:

1. Un archivo backend nuevo o actualizado.
2. Una validación automatizada.
3. Un smoke test reproducible.
4. Un documento de estado actualizado.
5. Un commit identificable en GitHub.

Si un sprint no puede entregar evidencia, se detiene y se documenta el bloqueo antes de continuar.

## Regla de ejecución ágil

- Máximo trabajo manual para Paula: solo cuando se requiera entorno local, credencial local ignorada, Firebase CLI o preview visual.
- Prioridad: ejecutar directamente desde ChatGPT/GitHub todo lo que sea seguro.
- No pedir comandos sueltos.
- Si se necesita PowerShell, será un único bloque completo con reporte, portapapeles y Notepad.
- No mezclar prototipo/frontend con backend.
- No tocar `app/modules` ni UI salvo aplicación explícita de un ZIP autorizado de Claude.
- No tocar `app/index.html` salvo punto único de conexión previamente justificado.
- Backend debe avanzar en archivos controlados de `app/core/backend*.js`, documentación, reglas, seeds y herramientas de validación.

## Definition of Done por sprint

Un sprint se considera terminado solo si cumple:

- Archivos modificados documentados.
- Validación técnica ejecutada o bloqueo documentado.
- Sin secretos impresos ni versionados.
- Sin datos reales.
- Sin deploy/Hosting/producción.
- Sin tocar Orbit ni Orbia.
- UTF-8 sin BOM.
- Riesgos y pendientes clasificados entre Claude/prototipo y ChatGPT/backend.
- Resultado resumido para Paula en lenguaje claro.

## Tablero ágil V63

### Sprint 0 - Base y control de avance

Objetivo: confirmar que V63 es la base vigente y que el backend protegido no se pierde.

Entregables:

- Confirmar estado GitHub de la rama `release/cxorbia-tya-rc-20260630`.
- Registrar plan ágil V63.
- Mantener documentación viva.
- Confirmar si V63 ya fue aplicada en GitHub o si sigue pendiente de aplicación directa.

Criterio de salida:

- Plan V63 versionado.
- Siguiente sprint definido sin depender de decisiones largas.

Estado: en curso.

### Sprint 1 - Gate de preview backend V63

Objetivo: validar que el preview backend funciona sobre la última base visual sin considerar localStorage como backend real.

Entregables:

- Validar `app/index-backend-dev.html`.
- Validar carga de `app/core/backend*.js`.
- Confirmar badge de backend DEV.
- Confirmar Auth DEV con usuarios ficticios sin pedir claves.
- Confirmar tenant `tya` y `projectId` correcto.
- Confirmar conteos Firestore del seed piloto V58.

Criterio de salida:

- Resultado claro: Firestore DEV OK, Auth OK, tenant OK y conteos OK; o bloqueo exacto documentado.

Trabajo manual esperado:

- Solo abrir preview local si el navegador es indispensable. Si se requiere, se dará bloque único PowerShell con Node, no Python.

### Sprint 2 - CX.data read adapter mínimo real

Objetivo: que la lectura principal de datos operativos venga de Firestore DEV en preview backend, manteniendo la misma interfaz `CX.data`.

Entregables:

- Mapeo final de colecciones Firestore actuales vs interfaz `CX.data`.
- Normalizador de seed V58 ampliado.
- Lectura real para proyectos, visitas, shoppers, postulaciones, periodos y beneficios.
- Fallback honesto: si Firestore falla, mostrar error claro, no vender localStorage como backend real.

Criterio de salida:

- Smoke read-only reproduce conteos desde Firestore.
- Preview no rompe módulos existentes.
- No se activa backend global en `app/index.html`.

### Sprint 3 - Acciones operativas controladas

Objetivo: habilitar escrituras mínimas controladas sin romper UI.

Entregables:

- Crear/update controlado para acciones operativas autorizadas.
- Registrar `responsibilityLog`.
- Validar reglas para admin/ops/shopper.
- Smoke de escritura DEV con datos ficticios.

Criterio de salida:

- Una acción controlada escribe en Firestore DEV, queda auditada y puede revertirse en DEV.

### Sprint 4 - Modelo SaaS multi-tenant de releases

Objetivo: preparar backend para Centro de actualizaciones / Release Management SaaS multi-tenant.

Entregables:

- Diseño Firestore definitivo para:
  - `releases`
  - `releaseItems`
  - `tenantReleases`
  - `featureFlags`
  - `tenantFeatureFlags`
  - `migrations`
  - `migrationRuns`
  - `releaseNotifications`
  - `releaseReadReceipts`
  - `tenantChangelog`
  - `rolloutPlans`
  - `responsibilityLog`
- Reglas iniciales por rol.
- Seed ficticio de releases.
- Smoke read-only de releases.

Criterio de salida:

- El backend puede registrar una release, asociarla a un tenant, marcar estado, activar feature flag ficticia y registrar lectura ficticia en DEV.

### Sprint 5 - Storage evidencias DEV

Objetivo: dejar listo el camino de evidencias sin producción.

Entregables:

- Modelo de metadata de evidencias.
- Reglas Storage DEV o plan documentado si Blaze/Storage limita.
- Smoke seguro con archivo ficticio o validación estática si no se puede escribir.

Criterio de salida:

- Evidencias quedan modeladas y listas para integrarse sin exponer datos reales.

### Sprint 6 - Make/WhatsApp/correo como capa segura

Objetivo: preparar automatizaciones reales sin exponer webhooks ni claves.

Entregables:

- Modelo de `automationLogs` y plantillas.
- Adapter seguro para disparo posterior.
- Estados honestos: queued, sent, failed, read.
- No imprimir ni versionar webhooks.

Criterio de salida:

- Smoke local/DEV con endpoint simulado o dry-run.

### Sprint 7 - Gemini/IA segura

Objetivo: sacar IA real del frontend y dejar backend seguro preparado.

Entregables:

- Modelo de `aiSettings` y `aiLogs`.
- Contrato de funciones IA para importador, análisis, cuestionarios y documentos.
- Sin API keys en frontend.

Criterio de salida:

- Dry-run documentado y trazable.

### Sprint 8 - Migración limpia TyA

Objetivo: preparar carga de base buena real solo cuando los gates anteriores estén cerrados.

Entregables:

- Plantilla de export limpio.
- Validador de duplicados por llave natural.
- Reporte de descartados.
- Importación por lotes con dry-run.

Criterio de salida:

- No se cargan datos reales hasta autorización explícita y base limpia validada.

## Backlog priorizado

### P0 inmediato

1. Confirmar/aplicar V63 en GitHub preservando backend protegido.
2. Gate preview backend V63.
3. Confirmar Firestore DEV real vs localStorage/demo.
4. Corregir cualquier bloqueo del adapter sin tocar módulos.
5. Documentar resultado real del gate.

### P1 siguiente

1. Lectura Firestore completa para datos operativos mínimos.
2. Acciones operativas con `responsibilityLog`.
3. Reglas Firestore para nuevas colecciones operativas.
4. Release Management backend multi-tenant.

### P2 posterior

1. Storage evidencias.
2. Make/WhatsApp/correo.
3. Gemini/IA segura.
4. Migración TyA real limpia.
5. Preparación producción sin publicar.

## Métricas de avance

Se usará esta tabla en cada cierre de sprint:

| Métrica | Objetivo |
|---|---|
| Commits útiles por sesión | 1 o más, salvo bloqueo documentado |
| Archivos backend tocados | Claros y justificados |
| Validaciones automatizadas | Al menos 1 por sprint técnico |
| Trabajo manual de Paula | Mínimo indispensable |
| Secretos expuestos | 0 |
| Deploy/producción | 0 hasta autorización |
| Mezcla Orbit/Orbia | 0 |
| Pendientes sin documentar | 0 |

## Riesgos actuales

1. V63 fue auditada como aplicable, pero debe confirmarse su estado real en GitHub antes de avanzar backend sobre esa base.
2. El preview backend no puede considerarse conectado hasta que muestre fuente Firestore DEV, tenant `tya` y conteos reales del seed piloto.
3. LocalStorage/mock es aceptable para prototipo, pero no debe presentarse como backend real en preview.
4. Release Management SaaS multi-tenant aún no existe visualmente ni en backend completo; queda como épica P1/P2 según cierre del gate preview.
5. Cualquier cambio de reglas Firestore requiere validación y, si se publica en DEV, autorización explícita.

## Próxima acción recomendada

Ejecutar Sprint 0/Sprint 1 en este orden:

1. Confirmar desde GitHub si V63 está aplicada o sigue pendiente.
2. Si falta V63, aplicarla preservando backend protegido.
3. Ejecutar gate preview backend V63.
4. Registrar resultado y decidir si se corrige adapter o se avanza a lectura Firestore completa.

## Nota de eficiencia

A partir de V63, no se trabajará por conversaciones largas sin corte. Cada bloque debe cerrar con estado: Hecho, Bloqueado o Pendiente, más la siguiente acción única.
