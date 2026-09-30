# VALIDACIÓN VISUAL V161C — OBSERVACIONES DE PAULA

Fecha: 2026-07-19
Estado: `VISUAL_REVIEW_COMPLETED_WITH_NONBLOCKING_FINDINGS_PENDING_EXPLICIT_APPROVAL`

## Evidencia revisada

Paula revisó en Hosting DEV el login, Cliente/Academia, Operativo/Academia, Shopper/Postulación, Reservas, Mi Perfil, Dashboard Financiero, Liquidaciones y Lotes de Pago sobre:

- URL: `https://cxorbia-backend-dev.web.app/index.html?cxTyaPhaseA=1&r18d=visible`;
- runtime V161C/R21;
- build `v161c-r21-source-safe-20260719-dev`;
- run `29716601804` — SUCCESS.

Conclusión visual general de Paula: la revisión se ve bien y el avance es satisfactorio. No se reportó app caída, ruta esencial rota, pérdida crítica, secreto expuesto, write no autorizado ni regresión que impida Phase A.

## Hallazgos y clasificación

### 1. Manuales todavía presentados como cursos superficiales

- Severidad: P2, no bloquea Corte 0B.
- Clasificación: Claude/prototipo + Academia.
- Requisito: Manual debe ser documento profundo y consultable, distinto de Curso/Lección.
- Acción: conservar para el próximo paquete acumulado de Claude; no pedir candidata nueva ahora.

### 2. Reportes no funcionan

- Severidad: P1, no bloquea Corte 0B.
- Clasificación: Reusable CXOrbia + Claude/prototipo.
- Corte dueño: Corte 1 — Contexto, HR e histórico.
- Requisito: reportes y exportaciones deben responder a tenant, proyecto, periodo, país y fuente histórica real.

### 3. Honorarios faltantes

- Severidad: P1, no bloquea Corte 0B.
- Clasificación: Exclusivo TyA + Reusable CXOrbia.
- Corte dueño: Corte 3 — Finanzas.
- Regla: no inferir honorarios. Deben venir de configuración del proyecto/visita o fuente financiera validada.

### 4. Cuadros naranjas en la postulación

- Severidad: P2.
- Clasificación: Claude/prototipo.
- Diagnóstico: son mensajes operativos intencionales, no logs ni notas de backend. El segundo explica correctamente que el shopper propone una fecha y el equipo la autoriza.
- Ajuste pendiente: reemplazar `Q1/Q2` por lenguaje natural de negocio; mantener la explicación de franja, ventana y visita previa sin jerga interna.

### 5. Reservas muestra todas las sucursales

- Severidad: P1 funcional, no bloquea Corte 0B.
- Clasificación: Reusable CXOrbia + Exclusivo TyA.
- Corte dueño: Corte 2 — Ciclo Shopper.
- Regla correcta: Reservas debe listar únicamente sucursales no asignadas que todavía no son postulables en Visitas Disponibles por una causa válida, por ejemplo periodo futuro, visita previa, ventana todavía cerrada u otra regla configurable.
- Debe excluir sucursales ya asignadas, ya disponibles/postulables, duplicadas, cerradas o incompatibles con el shopper/proyecto.

### 6. Datos reales de shoppers y nota técnica en Mi Perfil

- Severidad: P1 UX/seguridad, no bloquea Corte 0B.
- Clasificación: Reusable CXOrbia + Claude/prototipo + backend protegido.
- Observado: `Shopper protegido`, código interno, sufijo `null` y mensajes técnicos visibles.
- Regla inmediata: el preview público source-safe no puede exponer PII, banco, DPI ni contacto real.
- Ajuste visual: ocultar `null`, ids internos y lenguaje técnico; mostrar una explicación humana del perfil todavía protegido.
- Corte 2: validar shopper por llave estable, histórico, postulaciones y certificaciones sin inventar identidad.
- Cortes 4/6: habilitar datos personales autorizados mediante backend protegido + Auth/RBAC; nunca mediante preview público.

### 7. Regalías aplicadas a todo proyecto directo

- Severidad: P1 financiero, no bloquea Corte 0B.
- Clasificación: Reusable CXOrbia + Exclusivo TyA.
- Corte dueño: Corte 3 — Finanzas/configuración de proyecto.
- Requisito configurable: tipo de operación del proyecto `local`, `delegado` o `regional`.
- Local: puede aplicar ISR/regalías según configuración.
- Delegado/regional: honorario integral recibido; se configura el porcentaje o monto destinado al shopper y no se aplican regalías locales por defecto.
- No fijar porcentajes globales ni lógica Cinépolis en el producto.

### 8. Liquidaciones, lote de pago y estado `Pend. pago - cruce financiero`

- Severidad: P1 de claridad/flujo, no bloquea Corte 0B.
- Clasificación: Reusable CXOrbia + Exclusivo TyA.
- Significado correcto: la visita está submitida/operativamente cerrada, pero el monto final y el pago todavía no fueron confirmados contra la fuente financiera del cierre.
- La opción `Mover a lote` solo aparece cuando la liquidación llega a estado `validada`.
- En las capturas, las filas están `pendiente_submitir` o pendientes de cruce financiero; por eso no aparece el botón.
- Corte 3 debe cerrar el flujo explícito: fuente financiera → cruce/validación → mover a lote → confirmar pago → crear egreso, manteniendo separado preview de pago confirmado.

### 9. Lotes de Pago vacío

- Resultado correcto para el estado actual.
- No hay lotes pagados confirmados ni inferidos; el módulo debe permanecer vacío hasta existir fuente y confirmación real.

## Decisión de bloqueo

- P0 demostrados: 0.
- P1 documentados: reportes, reservas, shoppers protegidos/UX, honorarios/modelo financiero y flujo de cruce/lotes.
- P2 documentados: profundidad de manuales y copy de postulación.
- Corte 0B puede cerrarse con observaciones no bloqueantes cuando Paula emita aprobación explícita.

## Siguiente secuencia

```text
APROBADO CON OBSERVACIONES NO BLOQUEANTES
-> freeze V161C como ACTIVE_BASELINE
-> CORTE 1: contexto, HR, histórico, reportes y exportación
-> CORTE 2: ciclo shopper, reservas, postulaciones, asignaciones, perfil por llave estable
-> CORTE 3: honorarios, modelo local/delegado/regional, liquidaciones, cruce y lotes
```

Estado seguro: sin merge, producción, importaciones reales, Firestore/Auth/Storage/HR writes, Make/Gemini live ni pagos.
