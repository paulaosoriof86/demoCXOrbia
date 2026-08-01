# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-01  
**Estado vivo:** `C6_DEV_ENTRY_SINGLE_PRODUCT_LOGIN_REMOTE_BROWSER_PASS__PENDING_HUMAN_VISUAL_ACCUMULATIVE__NO_PRODUCTION`

## 1. Cerrado técnicamente / no reabrir
- Corte1/2A/3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5:14 periodos/616 visitas/current2026-07 PASS.
- Auth/claims/Rules y HR live/auto-month PASS.
- Root fix canónico C6 publicado en Hosting DEV.
- Entrada base canónica y login único publicados.
- Selector genérico eliminado del carril protegido.
- Browser smoke limpio local y remoto PASS con `localStorage=connected`.
- Autorización de Hosting consumida1/1; no reutilizar.

## 2. Pendiente bloqueante inmediato — validación humana acumulativa
Abrir la URL base:
`https://cxorbia-backend-dev.web.app/index-backend-dev.html`

### Entrada y usuarios
- debe aparecer directamente Tipo de acceso + Usuario + Contraseña, o restaurarse una sesión Firebase válida;
- no debe aparecer `Selecciona un perfil`;
- no debe aparecer una segunda pantalla técnica;
- no debe aparecer `Fuente de datos no disponible`;
- staff y shopper deben usar sus namespaces correctos sin exponer identificadores técnicos.

### Dashboard y estados
- julio44 total, GT34/HN10;
-40 realizadas;
-38 cuestionarios;
-33 submitidas;
-1 fuera de rango accionable;
- fases y drill-down iguales a los KPIs.

### Histórico y estabilidad
- comparativo MAY/JUN/JUL según fuente;
- tres refresh/focus sin crecimiento de visitas/shoppers;
- periodo, proyecto, vista, filtros, sidebar y scroll estables.

### Shoppers y portal
- una identidad canónica por persona;
- perfil completo solo por campos reales;
- datos faltantes honestos;
- certificación e histórico visibles cuando existan;
- portal con todas las visitas de la identidad seleccionada;
- Beneficios coherentes con Liquidaciones/pagos.

### Finanzas
- Dashboard financiero, Movimientos, Liquidaciones y Beneficios en el mismo periodo;
-40 realizadas presentes;
-33 submitidas no omitidas;
- sin fuente exacta no hay lote/pago;
- no afirmar pagos inexistentes.

### Reportes y Reservas
- Reportes conserva datos y gráficas disponibles;
- Reservas muestra fuente pendiente/read-only;
- cero fixtures/localStorage presentados como backend;
- mutaciones bloqueadas.

Si todo pasa, Paula responde `APROBADO` y se congela Corte6. Cualquier diferencia reproducible se corrige focalizadamente.

## 3. Agosto — pendiente operacional real
HR vigente cierra en julio. Agosto requiere fuente exacta real o registros platform-origin identificados y reconciliables.

No copiar julio, inferir ubicaciones/IDs/estado ni materializar visitas sin fuente y autorización específica.

## 4. Reservas real — pendiente funcional
El módulo está protegido/fail-closed, no conectado operativamente.

Secuencia:
`contrato tenant/proyecto → fuente backend → Rules/scope → write plan → autorización → readback/smoke`.

## 5. P1/P2 preservado
- PDF sin todas las gráficas finales.
- Excel sin formato final.
- reportKit/exportaciones transversales.
- copy de fuentes/readiness.

## 6. HOLD de identidad
Credenciales/perfiles sin match canónico exacto y casos ambiguos permanecen en review queue. Nunca resolver por nombre, teléfono, correo o coincidencia visual.

## 7. Siguiente secuencia
`VALIDACIÓN HUMANA ACUMULATIVA → APROBADO/FREEZE C6 → FUENTE EXACTA AGOSTO O RESERVAS → GATE ESPECÍFICO → PREPROD/CUTOVER`.

## 8. Estado seguro
Hosting DEV deploy1 en este bloque; Cloud Run deploys0; Firestore/HR/Auth/Rules/Storage/legacy/payments/Make/Gemini/reservas writes0; nuevos Firebase/Hosting0; merge=false; producción=false.
