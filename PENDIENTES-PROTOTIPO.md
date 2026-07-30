# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-29  
**Estado vivo:** `CORTE3_FROZEN__VISIT_IDENTITY_CROSSWALK_201_OF_210__REAL_IDENTITY_POLICY_LOCKED__NO_PRODUCTION`

Este archivo contiene pendientes reales de frontend/prototipo para Claude y dependencias backend que condicionan cuándo Claude debe intervenir. Backend, Firebase, adapters, tools, workflows y provider reads/writes no son tareas de Claude.

## 1. No reabrir
- M1: `FROZEN/APROBADO`.
- Corte 1: `FROZEN/APROBADO`.
- Corte 2A: `FROZEN/APROBADO`.
- Corte 3: `FROZEN_ACTIVE_BASELINE`.
- Baseline: `CXORBIA-TYA-CORTE3-V182-20260729`.
- V182 empalmada; no crear V183/R33.
- Finanzas canónicas y pagos históricos mayo/junio congelados.

Solo un P0 reproducible puede reabrir un corte congelado.

## 2. Arquitectura vigente
- `cxorbia-backend-dev` = backend DEV canónico y reutilizable.
- `tya-plataforma` = legacy actual a retirar y Hosting/URL a conservar para cutover final.
- `cxorbia-tya-dev-260729-c4` = sandbox técnico, no destino de materialización.
- No corresponde crear nueva base ni fallback local/mock.

## 3. Identidad real del shopper — regla de producto
`source-safe` no significa anonimización del producto.

Cuando el perfil real esté materializado y autorizado:
- Admin/Operativo debe ver identidad real necesaria para operar;
- Shopper debe ver su propio perfil/historial permitido;
- Cliente solo el alcance autorizado;
- `Shopper protegido`/hash es placeholder técnico, no identidad permanente;
- DPI/banco/NDA/adjuntos solo si aplican y con controles adecuados;
- dedupe por nombre solamente sigue prohibido para evitar merges erróneos.

## 4. Dependencia backend bloqueante restante
Visit-identity crosswalk read-only ejecutado:
- 210 refs shopper HR;
- 201 resueltas por visita exacta;
- 9 pendientes;
- 0 conflictos;
- 571/616 visitas con identidad exacta recuperada;
- 45 visitas sin evidencia canónica exacta suficiente.

El primer 0/210 fue falso negativo del gate por espacios en `sourceSheet/hrRowId`; causa raíz corregida y rerun v2 PASS.

Siguiente bloque backend: reconciliar las 9 refs restantes con identidad real autorizada, mantener PII fuera del repo, reconstruir R17N final e idempotencia antes de cualquier write.

## 5. Shoppers/certificaciones recuperados
- 149 shoppers legacy únicos;
- 120 profile create candidates;
- 22 stable-linked existing profiles;
- 7 HOLD;
- 78 certificaciones útiles;
- 77 candidatas + 1 HOLD;
- 30 recovery mirrors colapsados.

No pedir al shopper repetir una certificación ya válida por un problema de crosswalk.

## 6. Próxima intervención de Claude
Ninguna por rutina ahora.

Solo abrir frontend si:
1. un smoke posterior al write/read-path canónico demuestra P0 reproducible; o
2. se atiende backlog P1/P2 transversal después del cierre operativo.

Cuando el backend entregue perfiles reales, validar que las pantallas autorizadas rendericen nombre/identidad real y no placeholders técnicos.

## 7. Backlog frontend no bloqueante
### Reportes
- PDF: gráfica ausente/impresión del reporte.
- Excel: formato básico.
- `reportKit`: consolidación transversal.
- Mismo alcance/filas entre exportaciones.

### Copy
- Especificar fuente faltante cuando sea posible.
- No mostrar pago/import/sync/proveedor como ejecutado sin evidencia.

### Academia/manuales
- Privacidad por rol ≠ anonimización.
- Perfil real ≠ referencia HR ≠ identidad Auth.
- PII backend protegido ≠ artefacto source-safe.
- Stable key/evidencia antes de dedupe.
- Conflictos pasan a review.
- Carryover de certificación evita recertificación innecesaria.

## 8. Pendientes transversales preservados
- Multi-tenant/multi-proyecto; Cinépolis configurable, no global.
- Beneficios/liquidaciones/pagos separados por honorario, reembolso, total, moneda y estado.
- Postulaciones/asignaciones con `assignmentSource`, sync status y review.
- Readiness/source-safe con estados honestos.
- No proveedores reales desde UI.
- `AGOSTO 26 HN` sigue HOLD por país/tab incorrecto.

## 9. Estado seguro
PR #7 draft/open/no merge. Legacy/Firestore/Auth/Storage/HR writes=0; deploy=0; producción=false; imports/pagos/lotes/Make/Gemini=0.
