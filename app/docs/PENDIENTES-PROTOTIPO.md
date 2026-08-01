# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-01  
**Estado vivo:** `C6_CANONICAL_ROOT_FIX_HOSTING_DEV_REMOTE_PASS__PENDING_HUMAN_VISUAL_ACCUMULATIVE__NO_PRODUCTION`

## 1. Cerrado técnicamente / no reabrir
- Corte1/2A/3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5:14 periodos/616 visitas/current2026-07 PASS.
- Auth/claims/Rules PASS.
- HR live/auto-month PASS.
- Root fix canónico C6 desplegado una sola vez al Hosting DEV existente.
- Remote smoke exacto PASS para dominio, Finanzas/Liquidaciones, portal Shopper y Reservas fail-closed.
- Autorización del deploy consumida; no reutilizar ni solicitar otro deploy antes de revisar este build.

## 2. Pendiente bloqueante inmediato — validación visual acumulativa
Sobre `https://cxorbia-backend-dev.web.app/index-backend-dev.html` comprobar:

### Dashboard y estados
- julio44 total, GT34/HN10;
-40 realizadas;
-38 cuestionarios;
-33 submitidas;
-1 fuera de rango accionable;
- flujo por fases y drill-down iguales a los KPIs.

### Histórico y estabilidad
- comparativo MAY/JUN/JUL visible según fuente;
- tres refresh/focus consecutivos sin crecimiento de visitas/shoppers;
- periodo, proyecto, vista, filtros, sidebar y scroll estables;
- no mostrar estados distintos entre primer render y refresh.

### Shoppers y portal
- una identidad canónica por persona;
- no filas adicionales por perfil protegido sin crosswalk;
- perfil completo solo cuando contiene campos reales;
- datos faltantes mostrados honestamente;
- certificación e histórico visibles cuando existen;
- portal Shopper con todas las visitas de la identidad seleccionada, no una por estado;
- Beneficios coherentes con Liquidaciones/pagos canónicos.

### Finanzas
- Dashboard financiero, Movimientos, Liquidaciones y Beneficios en el mismo periodo;
-40 realizadas presentes en Liquidaciones;
-33 submitidas no omitidas;
- sin fuente exacta, visible/revisión pero sin lote o pago;
- no afirmar pagos confirmados inexistentes.

### Reportes y Reservas
- Reportes conserva datos y gráficas disponibles del modelo canónico;
- Reservas muestra fuente pendiente/read-only;
- cero datos demo, fixtures o localStorage presentados como backend;
- mutaciones bloqueadas hasta fuente real.

Si todo pasa, Paula responde `APROBADO` y se congela Corte6. Cualquier diferencia reproducible se corrige focalizadamente sin reabrir todo el bloque.

## 3. Agosto — pendiente operacional real
HR vigente todavía cierra en julio. Agosto requiere la fuente exacta real o registros platform-origin identificados y reconciliables.

No copiar julio, inferir ubicaciones/IDs/estado ni materializar visitas sin fuente y autorización específica.

## 4. Reservas real — pendiente funcional
El módulo está protegido/fail-closed, no conectado operativamente. Para habilitarlo:
`contrato tenant/proyecto → fuente backend → Rules/scope → write plan → autorización → readback/smoke`.

## 5. P1/P2 no bloqueante preservado
- PDF sin todas las gráficas finales.
- Excel sin formato final.
- reportKit/exportaciones transversales.
- copy de fuentes/readiness.

No deben confundirse con el freeze de consistencia C6, pero deben permanecer en backlog de producción.

## 6. HOLD de identidad
- credenciales/perfiles sin match canónico exacto;
- casos ambiguos y aliases no reconciliados.

Nunca resolver por nombre, teléfono, correo o coincidencia visual. Mantener review queue.

## 7. Siguiente secuencia
`VALIDACIÓN HUMANA ACUMULATIVA → APROBADO/FREEZE C6 → FUENTE EXACTA AGOSTO O RESERVAS SEGÚN PRIORIDAD → GATE ESPECÍFICO → PREPROD/CUTOVER`.

## 8. Estado seguro
Hosting DEV deploy1; Cloud Run deploys0; Firestore/HR/Auth/Rules/Storage/legacy/payments/Make/Gemini/reservas writes0; nuevos Firebase/Hosting0; merge=false; producción=false.
