# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-01  
**Estado vivo:** `C6_REAL_STAFF_SHOPPER_E2E_HOSTING_DEV_PASS__PENDING_HUMAN_VISUAL_ACCUMULATIVE__NO_PRODUCTION`

## 1. Cerrado técnicamente / no reabrir
- Corte1/2A/3 FROZEN; R17N 1,406/1,406 no repetir.
- Corte5: 14 periodos/616 visitas/current 2026-07 PASS.
- Auth/claims/Rules y HR live/auto-month PASS.
- Root fix canónico C6 publicado en Hosting DEV.
- Entrada visible única: Usuario + Contraseña.
- Namespace, rol, tenant y proyecto derivados de claims.
- Selector genérico, `Tipo de acceso`, login técnico paralelo y panel diagnóstico eliminados del flujo humano.
- HR conserva 616 visitas después de autenticar staff o shopper; Firestore funciona como overlay protegido, no como reemplazo.
- E2E con cuentas DEV existentes staff y shopper PASS local y remoto.
- Refresh y nueva pestaña preservan sesión, contexto, proyecto, HR e histórico.
- Hosting DEV deploy 1/1; autorización consumida con PASS y no reutilizable.
- Trigger duplicado posterior bloqueado sin segundo deploy; no fue falla de producto.

Decisión autoritativa:
`PASS_C6_REAL_STAFF_SHOPPER_E2E_EXISTING_HOSTING_DEV`.

## 2. Pendiente bloqueante inmediato — validación humana acumulativa
Abrir:
`https://cxorbia-backend-dev.web.app/index-backend-dev.html`

### Entrada y usuarios
- debe aparecer solo Usuario + Contraseña o restaurarse una sesión válida;
- no debe aparecer `Tipo de acceso`, selector genérico, segunda pantalla técnica, panel Backend DEV ni `Fuente de datos no disponible`;
- una elección de perfil solo puede aparecer después de autenticar y para una identidad realmente dual;
- tras entrar, HR debe conservar 616 visitas y no reducirse a la vista scoped del usuario.

### Dashboard, hoja de ruta y estados
- julio 44 total, GT 34/HN 10;
- 40 realizadas;
- 38 cuestionarios;
- 33 submitidas;
- 1 fuera de rango accionable;
- tiles, fases, drill-down y listados deben coincidir.

### Histórico y estabilidad
- comparativo MAY/JUN/JUL según fuente;
- tres refresh/focus sin crecimiento o reducción de visitas/shoppers;
- periodo, proyecto, vista, filtros, sidebar, modal y scroll estables;
- sesión restaurada sin volver a pedir credenciales.

### Shoppers y portal
- una identidad canónica por persona;
- perfil completo solo por campos reales;
- certificación e histórico visibles cuando existan;
- portal con las visitas de la identidad canónica;
- Beneficios coherentes con Liquidaciones/pagos.

### Finanzas
- Dashboard financiero, Movimientos, Liquidaciones y Beneficios en el mismo periodo;
- 40 realizadas presentes;
- 33 submitidas no omitidas;
- sin fuente exacta no hay lote ni pago;
- no afirmar pagos inexistentes.

### Reportes y Reservas
- Reportes conserva datos, gráficas y funciones disponibles;
- Reservas muestra fuente pendiente/read-only;
- cero fixtures/localStorage presentados como backend;
- mutaciones bloqueadas.

Si todo pasa, Paula responde `APROBADO` y se congela Corte6. Cualquier diferencia reproducible se corrige focalizadamente contra el contrato canónico, sin crear otra versión paralela ni volver a declarar PASS con pruebas de carcasa.

## 3. Agosto y postulaciones — siguiente bloque operacional urgente
Hoy es 1 de agosto. Después del freeze humano de Corte6, la prioridad inmediata es habilitar el ciclo de agosto para que los shoppers puedan ver visitas disponibles y postularse.

Secuencia obligatoria:
`FUENTE EXACTA AGOSTO O VISITAS PLATFORM-ORIGIN → RECONCILIACIÓN HR → READ MODEL CANÓNICO → GATE DISPONIBLES/POSTULACIONES → AUTORIZACIÓN ESPECÍFICA DE WRITE/CUTOVER → READBACK → REMOTE SMOKE → PRODUCCIÓN`.

No copiar julio, inferir ubicaciones/IDs/estado ni materializar visitas sin fuente real. La apertura de postulaciones y el paso a producción requieren una autorización distinta de la ya consumida para Hosting DEV.

## 4. Reservas real — pendiente funcional
El módulo está protegido/fail-closed, no conectado operativamente.

Secuencia:
`contrato tenant/proyecto → fuente backend → Rules/scope → write plan → autorización → readback/smoke`.

## 5. P1/P2 preservado
- PDF sin todas las gráficas finales.
- Excel sin formato final.
- reportKit/exportaciones transversales.
- copy de fuentes/readiness.

Estos pendientes no pueden provocar pérdida de datos ni regresión de Reportes, pero no bloquean por sí solos el freeze operacional si la plataforma acumulativa pasa la revisión humana.

## 6. HOLD de identidad
Credenciales/perfiles sin match canónico exacto y casos ambiguos permanecen en review queue. Nunca resolver por nombre, teléfono, correo o coincidencia visual.

## 7. Regla de continuidad
La única baseline válida es el build C6 publicado que pasó E2E real. Todo cambio posterior parte de esa baseline y vuelve a pasar el gate acumulativo. No se permite sustituir una sección por una versión anterior, crear adapters paralelos para la misma lógica ni aprobar una pantalla aisladamente.

## 8. Siguiente secuencia
`VALIDACIÓN HUMANA ACUMULATIVA → APROBADO/FREEZE C6 → FUENTE EXACTA AGOSTO → GATE DISPONIBLES/POSTULACIONES → AUTORIZACIÓN DE CUTOVER → PREPROD/PRODUCCIÓN`.

## 9. Estado seguro
Hosting DEV deploy 1; usuarios creados 0; Auth writes 0; cambios/resets de contraseña 0; Firestore/HR/Rules/Storage/legacy/payments/Make/Gemini/Reservas writes 0; Cloud Run deploys 0; nuevos Firebase/Hosting 0; credenciales/tokens exportados 0; merge=false; producción=false.
