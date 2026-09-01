# RESUMEN PARA CLAUDE — V159 DEV ACTUALIZADA Y VALIDADA

Fecha: 2026-07-18

## Estado

V159 está auditada, empalmada, desplegada en Hosting DEV y validada por smoke remoto después de las correcciones raíz.

- Estado: `hosting_dev_remote_smoke_pass_pending_visual`.
- P0 frontend demostrado: no.
- No solicitar V160.
- No reauditar V159.
- No repetir empalme, Hosting DEV o smoke remoto.
- Falta únicamente validación visual de Paula antes del freeze.

URL del build actualizado:

`https://cxorbia-backend-dev.web.app/index.html?cxTyaPhaseA=1&r18d=visible`

Evidencia vigente:

- run: `29649918631`;
- commit desplegado: `91aed5f9bdd54a396bd8758479888516dd1c3013`;
- artefacto: `8431164287`;
- digest: `sha256:693d05ecfc4621c02321e13a0caf6f40ac2683356ee0893c02a04f027aa3539a`;
- blockers: 0.

## Qué se preservó

- frontend V159 completo;
- proyecto y periodo separados;
- 14 periodos, 616 visitas y 44 por periodo;
- Dashboard, Proyectos, Periodos, Histórico, Visitas y Shoppers;
- `CX.data` y `CX.dataSource.sourceContract()`;
- adapters, contratos, importadores, reviewQueue y rollback;
- estados honestos de certificación, liquidación y pago;
- manuales, rutas por rol, notificaciones y Academia.

## Fixes backend reutilizables

No requieren cambios frontend de Claude:

1. R18A delega al binding canónico R15G para evitar que el periodo sustituya al proyecto.
2. R15G conserva estados operativos, submitido, liquidación, pago y `financialControl`.
3. R18D expone el control financiero source-safe por periodo sin inferir pagos.
4. El gate de histórico valida junio desde evidencia canónica.
5. El adapter respeta primero el `dataLevel` declarado por la fuente.
6. Una referencia protegida nunca cuenta como activa, inactiva, completa o incompleta por valores nulos o conteos históricos.
7. El carril Hosting DEV usa un ejecutor único, fail-closed y observable.
8. El smoke remoto espera propagación y valida build/commit exactos.
9. Los gates V110 quedaron fuera del carril automático actual.
10. Firestore drift solo se dispara por evidencia backend/Firestore real.

Estos patrones son reutilizables para CXOrbia multi-tenant; no son lógica global exclusiva de Cinépolis.

## Resultado técnico actual

- proyecto `cinepolis` separado del periodo;
- mayo, junio y julio tienen conjuntos de visitas distintos;
- junio ejecutado con liquidación/pago pendiente;
- pagos confirmados o inferidos: 0;
- shoppers actuales: 215 frente a referencia 216, bajo revisión R11D;
- referencias protegidas: 215;
- activos: 0;
- inactivos: 0;
- perfiles completos: 0;
- perfiles incompletos: 0;
- ratings, estados o identidades inventadas: 0.

## Qué no debe hacer Claude

- No convertir referencias protegidas en perfiles operativos.
- No completar ratings, estados, contactabilidad o actividad por inferencia.
- No cambiar `app/modules` para duplicar la corrección del adapter.
- No presentar snapshot HR como sincronización runtime live.
- No convertir submitido en liquidado o pagado.
- No pedir nueva candidata por warnings R11D o copy P1/P2.

## Cuándo interviene Claude

Claude interviene únicamente si Paula demuestra un P0 frontend reproducible. La tarea debe incluir rol, ruta, acción exacta, resultado esperado y observado, archivo responsable, impacto reusable, impacto en Academia/manuales/notificaciones y criterio de validación.

P1/P2 se documentan por archivo/módulo y no bloquean el freeze.

## Pendiente visual

Validar:

- login y tenant TyA;
- proyecto Cinépolis y periodo separados;
- cambio de periodo altera filas y KPIs;
- 44 visitas por periodo, GT 34 y HN 10;
- junio ejecutado, pendiente de liquidación/pago y no marcado como pagado;
- Shoppers muestra 215 referencias protegidas y cero perfiles operativos inventados;
- Admin, Shopper, Cliente y Academia;
- copy honesto de fuentes e integraciones.

No existe tarea frontend nueva confirmada en este momento.
