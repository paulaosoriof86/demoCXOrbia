# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-04  
**Estado vivo:** `SOURCE_STATIC_PASS__CLIENT_PRESTATE_RESTORED__DOMAIN_GATE_ROOT_FIX_APPLIED__FINAL_RUNTIME_RETRY_PENDING__CLOUD_V5_HOLD__NO_PRODUCTION`

## 1. Bloqueante real vigente

El macrobloque Cliente autorizado fue ejecutado y se detuvo con rollback exacto.

Resultado:

`FAIL_C6_CLIENT_ACCESS_RUNTIME_ROLLED_BACK`.

No existe un cambio incompleto en proveedor.

Estado restaurado:

- identidad Cliente canónica existente;
- claims sin alteración final;
- membership temporal eliminado;
- usuarios creados: 0;
- passwords cambiados o restablecidos: 0;
- producción intacta.

## 2. Causas raíces confirmadas

### 2.1 Selector Cliente regresivo — corregido

El selector runtime buscaba únicamente registros legacy y omitía la identidad Cliente canónica materializada y validada el 2 de agosto.

No era necesario crear otro usuario.

Correctivo:

- UID y correo interno exactos;
- claims, membership y sign-in obligatorios;
- bloqueo ante ambigüedad o colisión;
- cero dependencia del bundle legacy para Cliente.

### 2.2 Membership faltante — diagnosticado y revertido

La identidad canónica tenía claims válidos, pero no tenía el documento:

`tenants/tya/users/cxorbia-c6-client-tya-cinepolis-v1`.

La ejecución creó temporalmente exactamente un membership autorizado. Al fallar un gate posterior, el rollback lo eliminó y restauró el preestado.

### 2.3 Nombre histórico de módulo en el gate — corregido

El gate esperaba:

`CX.modules.cliente`.

La ruta canónica real del Portal Cliente es:

`CX.modules.cli_dashboard`.

Por eso emitió `CANONICAL_MODULE_MISSING` aunque el módulo funcional existía y el source/static ya había validado navegación Cliente.

El gate ahora:

- comprueba `cli_dashboard`, `miperfil`, `financiero` y `reservas`;
- informa exactamente cuál módulo falta;
- deriva el último periodo de la autoridad HR viva;
- no congela julio de 2026.

## 3. Autoridad HR viva

La última ejecución observó:

- 15 periodos;
- 660 visitas;
- 209 shoppers.

Esto demuestra que el periodo vivo avanzó más allá del snapshot histórico 14/616. La validación final debe conservar paridad entre HR, Staff, Cliente y Shopper sin volver a fijar conteos o meses.

## 4. Pendiente inmediato backend

La autorización anterior permitía una sola repetición runtime y ya fue consumida.

Pendiente exacto:

1. autorizar una única reejecución final después del correctivo del gate;
2. snapshot de la identidad y membership;
3. máximo un membership write y, solo si fuera necesario, un claims write;
4. idempotencia y readback;
5. runtime Staff, Cliente y Shopper;
6. tres recargas y nueva pestaña;
7. HR dinámica, Finanzas, portales y Reservas;
8. conservar el membership solo con PASS completo;
9. rollback automático ante cualquier fallo.

No corresponde otra auditoría general.

## 5. Cloud V5

Decisión:

`HOLD_CLOUD_V5_FRONTEND__NO_APROBADO_PARA_INTEGRACION`.

Problemas principales:

- órbita demasiado grande en desktop;
- franja superior transversal pesada;
- formulario demasiado alto;
- jerarquía orbital poco refinada;
- archivos desktop y mobile con la misma dimensión `924×540`;
- capturas fuera del manifest;
- residuos V4 y HEAD histórico;
- entrega limitada al Login, sin pendientes frontend acumulados.

Fuente:

- `AUDITORIA-FOCAL-CLOUD-LOGIN-PORTABLE-V5-20260804.md`;
- `PROMPT-CLOUD-FRONTEND-ACUMULADO-V6-20260804.md`.

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
FINAL_RUNTIME_RETRY
→ AUDITORÍA FOCAL CLOUD V6
→ APPLY_DELTA_DIRECTLY SOLO CON GO
→ BRIDGE FIREBASE SEGURO
→ GATES ACUMULATIVOS
→ ÚNICO DEV SI CAMBIA app/
→ CHECKPOINT_VISUAL_PHASE_A_COMPLETA
→ FREEZE
→ CONFIRMAR PERIODO NUEVO/DISPONIBLES/POSTULACIONES
→ CUTOVER AUTORIZADO
```

## 8. Warnings P1/P2 vivos

- overlay A+B superseded aún cargado;
- PDF puede omitir gráficas;
- Excel mantiene formato básico;
- responsive parcial en superficies densas.

V6 recibe estos pendientes frontend; no bloquean por sí solos la operación hasta demostrar un P0.

## 9. Estado seguro

- cambios funcionales en `app/` durante este bloque: 0;
- estado proveedor restaurado: sí;
- Hosting/Cloud Run deploys: 0;
- Firestore de negocio/HR/Rules/Storage: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: intacta.
