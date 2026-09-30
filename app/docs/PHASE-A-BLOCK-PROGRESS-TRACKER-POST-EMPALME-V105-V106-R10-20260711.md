# Tracker Phase A — post-empalme V105/V106 + R10

Fecha: 2026-07-11

## Baseline viva

- Última fuente: `Prototype development request CXOrbia V105(1).zip`.
- Identidad interna activa: V106.
- Decisión: baseline auditada de continuidad empalmada.
- Source lock final: HOLD.
- Repo: `paulaosoriof86/demoCXOrbia`.
- Rama: `docs-tya-v6-v71-audit`.
- PR #7: draft/open/no merge.

## Avance acumulado del plan de trabajo

### A. Baseline y empalme — COMPLETADO PARA CONTINUIDAD

- auditoría forense V105/V106;
- scripts, sintaxis, estructura y orden de carga revisados;
- runtime empalmado sin volver a versión anterior;
- source-lock externo verificado;
- drift gate reanclado al runtime V106 validado;
- RC smoke, predeploy y visual smoke aprobados;
- backend previo preservado.

### B. Información real/source-safe TyA — COMPLETADO EN BASE OPERATIVA

- tenant TyA;
- Cinépolis como proyecto normal configurable;
- 14 periodos;
- 616 visitas;
- 213 shoppers históricos;
- 572 liquidaciones;
- países GT/HN;
- moneda por país;
- reglas HR y llaves estables;
- plan de 1,418 operaciones create-only;
- separación liquidación/pago/carryover.

### C. Backend y migración segura — COMPLETADO HASTA R9

- runtime bridge/adapters source-safe;
- importadores separados por fuente;
- reviewQueue y auditEvents;
- plan Firestore R6;
- executor R8 fail-closed;
- readiness R9 de cuatro carriles;
- 0 writes/import/producción.

### D. Verificación visual operacional TyA — R10 EN VALIDACIÓN

Se agregó un smoke visual que ya no se limita al modo demo:

- genera payload HR TyA sanitizado;
- exige 14/616/213;
- revisa GT/HN, monedas y protección de shopper;
- entra como Admin, Cliente y Shopper;
- prueba rutas de proyectos, visitas, postulaciones, certificaciones, finanzas, beneficios y Academia;
- genera capturas y reporte sanitizado;
- detecta errores de consola y copy que prometa acciones reales.

Este bloque cierra la brecha entre infraestructura y comprobación visual con información TyA.

## Estado por carril R9/R10

| Carril | Estado | Evidencia/pendiente |
|---|---|---|
| Baseline V105/V106 | READY | Empalme y gates acumulados PASS |
| Datos HR TyA source-safe | READY | 14 periodos / 616 visitas / 213 shoppers |
| Smoke visual demo | READY | Seis perfiles, sin hard fails |
| Smoke visual TyA source-safe | IN VALIDATION | Workflow R10 y capturas |
| Firebase DEV nueva/vacía | PENDING EVIDENCE | Requiere autorización read-only separada |
| Pagos reales/sanitizados | PENDING SOURCE | Falta export con llave estable |
| Certificaciones carryover | PENDING SOURCE | Falta export con shopper estable |
| Materialización | HOLD | R8 dev-clean sigue bloqueado |
| Producción | HOLD | Sin deploy/import/writes |

## Qué no se vuelve a abrir

- HR y columnas ya trabajadas;
- Q1/Q2, franjas y quincenas;
- shoppers históricos;
- regla de junio: visitas ejecutadas, pagos pendientes;
- proyecto configurable;
- separación liquidación/pago;
- source-safe counts;
- plan create-only;
- empalme V105/V106;
- mejoras ya aceptadas de la candidata.

## Pendientes backend inmediatos

1. Leer el resultado del smoke R10 y convertir únicamente hallazgos reales en blockers o tareas Claude.
2. Ejecutar verificación Firebase DEV read-only tras autorización explícita.
3. Recuperar export sanitizado de pagos/movimientos.
4. Recuperar export sanitizado de certificaciones presentadas.
5. Ejecutar importadores dry-run existentes.
6. Recalcular R9.
7. Solo con cuatro carriles READY, preparar revisión humana de autorización.

## Pendientes Claude acumulados

Paquete vigente:

`app/docs/PAQUETE-ACUMULADO-CLAUDE-POST-EMPALME-V105-V106-R10-20260711.md`

Prioridades netas:

1. manifest interno V106 y smoke reproducible;
2. Portal Cliente source-honest;
3. Finanzas/lotes/pagos/Beneficios con evidencia y scope real;
4. certificaciones carryover y lifecycle humano;
5. Academia profunda vinculada a cambios reales;
6. incorporar solo hallazgos concretos de R10.

## Impacto Academia

Debe cubrir:

- diferencia demo/source-safe/backend;
- lectura de readiness y blockers;
- liquidación vs pago;
- carryover de certificaciones;
- proyecto configurable;
- rutas por rol y validación visual;
- estados honestos y revisión humana.

## Bloque intermedio agregado

R10 se agregó porque el smoke vigente verificaba shells demo/localStorage, pero no demostraba que la candidata empalmada renderizara correctamente el payload TyA source-safe. No reemplaza el plan; cierra una brecha operativa del mismo plan.

## Estado seguro

- sin cambios en `/app/modules`;
- sin cambios en lógica UI;
- sin Firebase/Auth/Storage/HR writes;
- sin import real;
- sin pagos;
- sin Make/Gemini;
- sin deploy/producción;
- PR #7 sin merge.

## Siguiente bloque exacto

Cerrar el resultado R10 y, con sus capturas/reporte, decidir si existe algún P0 visual real. Si R10 pasa, continuar al gate read-only de Firebase DEV y a los dos exports sanitizados; si falla, documentar para Claude solo el delta comprobado, sin reabrir el empalme completo.
