# REPORTE DE CORRECCIÓN — V121 (residual real sobre V120)

Baseline: `Prototype development request CXOrbia V120.zip` (source lock
interno; el ZIP anterior se había etiquetado externamente V115 por error de
nombre de archivo al descargar — el contenido y el source lock siempre
fueron V120). Esta entrega corrige ese desajuste: nombre de archivo y
source lock ahora dicen **V121** de forma consistente.

## P0 — Texto falso en Academia: CORREGIDO (gap real, confirmado)

La auditoría tenía razón: `modules/academia.js` seguía conteniendo
literalmente `CX.data.currentProjectId</code>/<code>currentPeriodId</code>,
el mismo valor` — mi reporte anterior (V115) afirmó que ese texto no existía
sin haberlo verificado con una búsqueda exacta del string completo (el grep
usado entonces truncaba la línea larga y no encontró el texto). Corregido
ahora: el curso explica correctamente que `currentProjectId` identifica el
proyecto/programa, `currentPeriodId` identifica el periodo, están
relacionados pero NO son el mismo ID, cambiar de periodo nunca cambia el
proyecto, y cambiar de proyecto puede seleccionar un periodo distinto.
Verificado con búsqueda literal del string completo: 0 ocurrencias.

## P1 — Contratos con consumidores reales (antes: solo definición)

- `CX.data.ctx()`: consumido en `core/router.js` (tooltip del indicador de
  fuente en el rail, compone tenantId/countryScope desde el contrato único).
- `CX.dataSource.sourceContract()`: consumido en `modules/hr-source.js`
  (panel "Contrato de Fuente" — muestra sourceReadMode/runtimeSyncActive/
  sourceRef/blockers exactos de la plataforma).
- `CX.data.visitContract(v)`: consumido en `modules/misvisitas.js`
  (columna "Pago" del historial — deriva paymentState del contrato en vez
  de inferir "pagado" del estado operativo).

Migración transversal completa a los tres helpers en TODOS los módulos
listados por el paquete (Dashboard, Visitas, Histórico, Finanzas, Cliente,
Shoppers, Importador, Configuración, Integraciones, Diagnóstico) sigue
NO_ATENDIDO — se migraron 3 superficies reales y verificadas por sesión;
las restantes quedan para la siguiente ronda.

## P1 — Dry-run separado: pagos / certificaciones / documentos

Nuevo tab "Pagos · Certificaciones · Documentos" en el Importador — 3 áreas
completamente aisladas entre sí y del flujo de shoppers/visitas (nunca
comparten estado). Cada área muestra: campos esperados, campos protegidos
excluidos del preview, y al analizar: `accepted`/`duplicates`/`conflicts`/
`discarded` + blockers de dominio (pagos: "ningún movimiento se marca
pagado sin cruce financiero real"; certificaciones: "banco IA en
borrador/revisión humana"; documentos: "contenido binario no se
materializa"). Confirmar envía a `reviewQueue`, con
`materialización desactivada` explícito en el pipeline visual.

Probado en runtime: área "pagos" con 2 filas de ejemplo → resultado con
accepted/duplicates/conflicts/discarded, commit incrementa
`cx_review_queue` en localStorage correctamente.

## Pendiente sin atender (explícito, no oculto)

- Migración completa de las 3 helpers al resto de módulos priorizados.
- CRM/documentos/configuración tenant: matriz PASS/PARCIAL/FAIL completa.
- Academia: cobertura transversal comprobada (rutas por rol, notificaciones,
  checklist por módulo) más allá del fix puntual de este reporte.

## Gate técnico
- Sintaxis: PASS (5 archivos modificados). Smoke 48×3: sin error. Manifest
  V121 regenerado, 0 diffs.

## Limitación honesta (repetida, sin cambios de fondo)
Sin terminal Node invocable en este entorno; se usó el equivalente
funcional (new Function + SHA-256/aggregate manual) declarado explícitamente,
no una sustitución silenciosa de "node --check"/"node verify-manifest.mjs".
