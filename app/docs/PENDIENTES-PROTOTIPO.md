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

- selector Cliente regresivo: corregido;
- membership faltante: diagnosticado y revertido;
- nombre histórico `CX.modules.cliente`: corregido a `cli_dashboard`;
- ruta Cliente no explícita: corregida y gateada.

El correctivo source-only ahora:

- navega explícitamente a `cli_dashboard`;
- espera ruta activa y marker `#view .ph`;
- separa `clientModule`, `route`, `panorama` y `blocked`;
- emite errores específicos;
- conserva la etapa original antes del rollback.

Gate focal:

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

- 15 periodos;
- 660 visitas;
- 209 shoppers.

No restaurar conteos o meses congelados.

## 4. Pendiente inmediato backend

El bloque source-only está cerrado. No hay autorización runtime vigente.

Próximo macrobloque, solo con autorización expresa:

1. snapshot Cliente;
2. membership idempotente y claims solo si fuera necesario;
3. readback;
4. runtime Staff, Cliente y Shopper;
5. tres recargas y nueva pestaña;
6. HR dinámica, Finanzas, portales y Reservas;
7. conservar membership solo con PASS;
8. rollback automático ante fallo.

No corresponde otra auditoría general.

## 5. Cloud V5/V6

V5 permanece:

`HOLD_CLOUD_V5_FRONTEND__NO_APROBADO_PARA_INTEGRACION`.

V6 debe incluir:

- Login y órbita refinados;
- responsive P1;
- PDF P1;
- Excel P2;
- opción Regional;
- copy delegado;
- Ficha Shopper;
- evidencia y manifest completos.

Cloud no toca backend, Auth, datos, cálculos, permisos, deploy ni producción.

## 6. Secuencia posterior

```text
RUNTIME MULTIROL AUTORIZADO
→ AUDITORÍA FOCAL CLOUD V6
→ APPLY_DELTA_DIRECTLY SOLO CON GO
→ GATES
→ DEV ÚNICO SI CAMBIA app/
→ CHECKPOINT VISUAL PHASE A COMPLETA
→ FREEZE
→ PERIODO NUEVO/DISPONIBLES/POSTULACIONES
→ CUTOVER AUTORIZADO
```

## 7. Warnings P1/P2 vivos

- overlay A+B superseded;
- PDF puede omitir gráficas;
- Excel mantiene formato básico;
- responsive parcial.

## 8. Estado seguro

- cambios funcionales `app/`: 0;
- provider reads: 0;
- Auth/Firestore/membership writes: 0;
- Hosting/Cloud Run: 0;
- HR/Rules/Storage: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: intacta.
