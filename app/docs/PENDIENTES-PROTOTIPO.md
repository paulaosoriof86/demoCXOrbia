# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-04  
**Estado vivo:** `SOURCE_STATIC_PASS__CLIENT_ROUTE_SOURCE_STATIC_PASS__RUNTIME_RETRY_NOT_AUTHORIZED__CLOUD_V5_HOLD__NO_PRODUCTION`

## 1. Estado del acceso Cliente

La última reejecución Cliente terminó en rollback exacto:

`FAIL_C6_CLIENT_ACCESS_RUNTIME_ROLLED_BACK`.

No quedó ningún cambio incompleto en proveedor.

Estado restaurado:

- identidad Cliente canónica existente;
- claims sin alteración final;
- membership temporal eliminado;
- usuarios creados: 0;
- passwords cambiados o restablecidos: 0;
- producción intacta.

## 2. Causas raíces confirmadas y estado

### 2.1 Selector Cliente regresivo — corregido

El selector runtime examinaba registros legacy y omitía la identidad Cliente canónica ya existente.

Correctivo:

- UID y correo interno exactos;
- claims, membership y sign-in obligatorios;
- bloqueo ante ambigüedad;
- cero usuario nuevo.

### 2.2 Membership faltante — diagnosticado y revertido

La identidad tenía claims válidos, pero faltaba el membership canónico. El runtime lo materializó temporalmente y el rollback lo eliminó al fallar una etapa posterior.

### 2.3 Nombre histórico de módulo — corregido

El gate esperaba `CX.modules.cliente`; la autoridad real es `CX.modules.cli_dashboard`.

### 2.4 Ruta Cliente no explícita — corregida y gateada

El gate iniciaba sesión como Cliente, pero no navegaba a `cli_dashboard`. Después dependía de la vista inicial y de una aserción compuesta:

`clientModule && panorama && !blocked`.

Correctivo source-only:

- navegación explícita a `cli_dashboard`;
- espera de ruta activa y marker estable `#view .ph`;
- `clientModule`, `route`, `panorama` y `blocked` separados;
- errores específicos por capa;
- etapa original del fallo preservada antes del rollback.

Gate focal:

- commit `5caca10137250d2a70308dd995262e368f981322`;
- run `30936681878`;
- job `92084479259`;
- `PASS_CXORBIA_CONTROLLED_RUNNERS_CONTRACT`;
- gate interno `PASS_C6_CLIENT_ROUTE_SOURCE_STATIC`;
- blockers 0;
- warnings 0;
- provider reads 0;
- runtime 0;
- writes 0.

## 3. Autoridad HR viva

Última observación runtime:

- 15 periodos;
- 660 visitas;
- 209 shoppers.

No restaurar conteos o meses congelados.

## 4. Pendiente inmediato backend

El bloque source-only quedó cerrado. No hay autorización runtime vigente.

Próximo macrobloque, solo con nueva autorización expresa:

1. snapshot Cliente;
2. máximo un membership write y claims solo si fuera necesario;
3. idempotencia y readback;
4. runtime Staff, Cliente y Shopper;
5. tres recargas y nueva pestaña;
6. HR dinámica, Finanzas, portales y Reservas;
7. conservar membership solo con PASS completo;
8. rollback automático ante cualquier fallo.

No corresponde otra auditoría general.

## 5. Cloud V5

Decisión:

`HOLD_CLOUD_V5_FRONTEND__NO_APROBADO_PARA_INTEGRACION`.

Problemas principales:

- órbita demasiado grande en desktop;
- franja superior pesada;
- formulario demasiado alto;
- evidencia responsive inválida;
- capturas fuera del manifest;
- residuos V4/HEAD histórico;
- falta de pendientes frontend acumulados.

No aplicar V5 a `app/`.

## 6. Pendientes frontend acumulados para V6

- Login y órbita refinados;
- responsive P1 de tablas, fichas, tarjetas y modales;
- PDF P1 con gráficas válidas existentes;
- Excel P2 con presentación útil;
- opción visual Regional;
- copy delegado correcto;
- Ficha Shopper presentacional;
- capturas reales y manifest completo.

Cloud no toca Auth, datos, backend, permisos, cálculos, deploy ni producción.

## 7. Secuencia posterior

```text
RUNTIME MULTIROL AUTORIZADO
→ AUDITORÍA FOCAL CLOUD V6
→ APPLY_DELTA_DIRECTLY SOLO CON GO
→ BRIDGE FIREBASE SEGURO
→ GATES ACUMULATIVOS
→ ÚNICO DEV SI CAMBIA app/
→ CHECKPOINT VISUAL PHASE A COMPLETA
→ FREEZE
→ PERIODO NUEVO/DISPONIBLES/POSTULACIONES
→ CUTOVER AUTORIZADO
```

## 8. Warnings P1/P2 vivos

- overlay A+B superseded aún cargado;
- PDF puede omitir gráficas;
- Excel mantiene formato básico;
- responsive parcial en superficies densas.

V6 recibe estas deudas frontend; no bloquean por sí solas la operación sin P0 demostrado.

## 9. Estado seguro

- cambios funcionales `app/` durante el bloque: 0;
- provider reads: 0;
- Auth/Firestore/membership writes: 0;
- Hosting/Cloud Run deploys: 0;
- HR/Rules/Storage: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: intacta.
