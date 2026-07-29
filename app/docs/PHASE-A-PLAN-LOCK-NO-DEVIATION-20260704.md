# CXOrbia TyA — Plan Phase A con validación visual continua

**Fecha original:** 2026-07-04  
**Última revisión:** 2026-07-29  
**Estado:** ACTIVO, OBLIGATORIO Y PREVALENTE  
**Estado vivo:** `CORTE3_FROZEN__ARCHITECTURE_CORRECTED__CANONICAL_BACKEND_READONLY_INVENTORY_ACTIVE`

## 1. Objetivo
Operar TyA/Cinépolis como primer tenant/proyecto configurable de CXOrbia con HR/histórico, shoppers, certificaciones, visitas, agenda, cuestionarios, liquidaciones/pagos, multi-tenant, multi-proyecto, roles, Academia y sincronización.

La “base vieja” que no se conecta/copia es la **plataforma legacy TyA Consultores actualmente operativa y destinada a retiro**. `cxorbia-backend-dev` es el backend DEV nuevo de CXOrbia ya trabajado desde junio y debe reutilizarse según inventario, no excluirse por estar poblado.

## 2. Secuencia por corte
`FUENTE → MAPPING/ADAPTER → GATES → BUILD → VALIDACIÓN VISUAL → CORRECCIÓN FOCALIZADA → FREEZE`

Un PASS técnico sin validación humana cuando aplica no congela un corte.

## 3. Carril de candidatas
`EXECUTION_LANE_READY → AUDITORÍA DELTA → P0_PROVEN o GO → si GO APPLY_DELTA_DIRECTLY → COMMIT/PUSH → POST-GATES → HOSTING DEV → VALIDACIÓN → FREEZE`

No se sustituye por nueva rama/PR, PowerShell, incoming, nueva candidata ni acción manual de Paula salvo imposibilidad técnica real.

## 4. Identidades de arquitectura — lock corregido

### Plataforma legacy TyA Consultores
- sistema actual a retirar;
- solo origen de datos útiles y limpios;
- no copiar código, parches, fixes, dashboard ni arquitectura;
- refresh pendiente limitado principalmente a shoppers y certificaciones.

### `cxorbia-backend-dev`
- backend DEV canónico de CXOrbia construido desde junio;
- TyA es el primer tenant real;
- contiene trabajo previo que debe reutilizarse;
- inventario read-only antes de cualquier nueva materialización.

### `cxorbia-tya-dev-260729-c4`
- sandbox aislado de pruebas creado por una interpretación incorrecta;
- no destino de materialización Phase A;
- preservar únicamente fixes/gates útiles descubiertos allí.

### Hosting público TyA
- conservar la URL pública que ya usan los shoppers;
- en Corte 8 se reemplaza la app legacy por CXOrbia después de smoke/rollback/autorización;
- verificar identidad técnica del Hosting antes del cutover, sin asumirla.

## 5. Cortes cerrados

### M1 / Corte 1 / Corte 2A
`FROZEN/APROBADO`.

### Corte 3 — Finanzas e histórico de pagos
`FROZEN_ACTIVE_BASELINE`.

- Baseline `CXORBIA-TYA-CORTE3-V182-20260729`.
- V182 empalmada.
- R26–R32: 135/135 PASS.
- HR remota, Hosting DEV y smoke de pagos: PASS.
- Mayo: 44 pagadas / 0 pendientes / 2 reviews / CxP Q0-L0.
- Junio: 2 pagadas / 42 pendientes / Q451-L0.
- Pagos/lotes ejecutados por CXOrbia: 0.
- P1/P2 PDF/Excel/reportKit/copy permanecen backlog transversal.

## 6. Corte 4 — conexión `CX.data` read-only / corrección de arquitectura

### 6.1 Objetivo correcto
Demostrar `CX.data` read-only y fail-closed **sobre el backend canónico de CXOrbia**, reutilizando `cxorbia-backend-dev`, sin duplicar materialización.

### 6.2 Sandbox Corte 4 — aprendizaje técnico preservado
En `cxorbia-tya-dev-260729-c4` quedaron probados:
- VIS-01: no fallback demo/localStorage;
- VIS-02: backend vacío first-class, null-safety y role-switch limpio;
- VIS-02B: eliminación de script huérfano + gate de integridad;
- remoto: 0 pageerrors y 0/0/0/0;
- visual humana: Admin vacío y Shopper vacío renderizan correctamente.

El sandbox **no se promueve a destino de datos**.

### 6.3 Gate activo — inventario canónico read-only
Herramienta: `tools/qa/cxorbia-canonical-backend-readonly-inventory.mjs`.

Debe comprobar, sin valores sensibles ni provider writes:
- projectId exacto `cxorbia-backend-dev`;
- Auth total/claims presentes;
- árbol de colecciones y conteos;
- ubicación real de tenant/proyectos/shoppers/certificaciones/visitas/finanzas;
- qué ya está materializado y qué falta.

Primer barrido: Auth users=17 y raíz `tenants`=1; se amplió a subcolecciones antes de cerrar conteos.

### 6.4 Cierre Corte 4
Corte 4 se cierra cuando:
1. inventario recursivo canónico PASS;
2. se confirma que no habrá re-migración innecesaria;
3. la configuración/backend apunta de nuevo al camino canónico sin reintroducir demo ni los P0 corregidos;
4. smoke read-only sobre `cxorbia-backend-dev` pasa;
5. documentación queda reconciliada.

No requiere volver a poblar un Firebase vacío.

## 7. Corte 5 — materialización DEV incremental, no reconstrucción
Solo después del inventario:
- reutilizar datos ya existentes;
- materializar únicamente faltantes reales;
- dry-run/idempotencia/trazabilidad;
- refresh legacy limitado a shoppers/certificaciones nuevas o actualizadas;
- HR sigue como fuente principal de visitas/operación;
- dedupe por llave estable y conflictos a revisión;
- datos sensibles protegidos.

## 8. Corte 6 — Auth/RBAC
Claims por persona, rol y scope; países, proyectos, rutas, acciones, Academia y notificaciones. No importar Auth legacy a ciegas.

## 9. Corte 7 — sincronización y evidencias
HR→plataforma, plataforma→HR, no duplicación, reviewQueue, cuestionario configurable, evidencias protegidas y gates Make/Gemini.

## 10. Corte 8 — preproducción y producción
- cortes previos congelados;
- refresh final delta legacy si aplica;
- rollback listo;
- smoke integral;
- verificar proyecto dueño del Hosting público actual;
- desplegar CXOrbia sobre la URL pública que ya usan los shoppers;
- autorización específica;
- no cambiar URL pública por rutina.

## 11. Claude/prototipo
No nueva candidata por la corrección de arquitectura. Preservar fixes core/entrypoint descubiertos en sandbox. No tocar `app/modules` por este bloque.

## 12. Academia
Documentar:
- diferencia entre legacy/origen, backend canónico y sandbox;
- migración incremental/delta;
- cutover con rollback y conservación de URL pública;
- patrones fail-closed, empty-backend, role-switch y asset-integrity.

## 13. Estado seguro
Sin producción, merge, nuevos Hosting, Firestore/Auth/Storage/HR writes, imports, pagos/lotes, Make ni Gemini live durante inventario/reconciliación.
