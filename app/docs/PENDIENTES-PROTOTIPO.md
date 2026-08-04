# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-04  
**Estado vivo:** `SOURCE_STATIC_PASS__FINAL_RUNTIME_RETRY_CONSUMED_FAIL__CLIENT_PORTAL_ROUTE_ASSERTION__ROLLBACK_EXACT__CLOUD_V5_HOLD__NO_PRODUCTION`

## 1. Bloqueante real vigente

La reejecución final Cliente autorizada fue consumida y terminó con rollback exacto.

Resultado:

`FAIL_C6_CLIENT_ACCESS_RUNTIME_ROLLED_BACK`.

Fallo:

`client_assertions → CLIENT_PORTAL_INVALID`.

No existe cambio incompleto en proveedor.

Estado restaurado:

- identidad Cliente canónica existente;
- claims sin alteración final;
- membership temporal eliminado;
- usuarios creados: 0;
- passwords cambiados o restablecidos: 0;
- producción intacta.

## 2. Causa raíz vigente

El gate Cliente usa una aserción compuesta:

```text
clientModule && panorama && !blocked
```

Las etapas previas del mismo run ya probaron:

- módulo `cli_dashboard` presente;
- login Cliente y app activa;
- HR y contexto con paridad;
- ausencia de bloqueo de fuente/proyectos.

El gate no navega explícitamente a `cli_dashboard`; asume que la vista posterior al login ya muestra el Panorama y exige copy visible específico.

La condición residual es la expectativa de ruta/copy, no la identidad, los claims, el membership, HR o el módulo.

## 3. Pendiente inmediato backend

Bloque permitido siguiente, sin provider writes:

1. corregir source-only el gate Cliente;
2. navegar explícitamente a `cli_dashboard`;
3. esperar el render del módulo;
4. usar marker/selector estable;
5. registrar separadamente `clientModule`, `route`, `panorama` y `blocked`;
6. ejecutar gate local/estático;
7. detenerse para autorización nueva.

La autorización consumida no puede reutilizarse. No corresponde otro reintento silencioso.

## 4. Autoridad HR viva

Última ejecución:

- 15 periodos;
- 660 visitas;
- 209 shoppers.

La validación posterior debe conservar paridad multirol sin fijar conteos ni meses.

## 5. Cloud V5

Decisión:

`HOLD_CLOUD_V5_FRONTEND__NO_APROBADO_PARA_INTEGRACION`.

Problemas:

- órbita demasiado grande en desktop;
- franja superior transversal pesada;
- formulario demasiado alto;
- jerarquía orbital poco refinada;
- archivos desktop y mobile con la misma dimensión `924×540`;
- capturas fuera del manifest;
- residuos V4 y HEAD histórico;
- entrega sin backlog frontend acumulado.

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
ROOT FIX SOURCE-ONLY GATE CLIENTE
→ PASS LOCAL/ESTÁTICO
→ NUEVA AUTORIZACIÓN EXPRESA
→ RUNTIME MULTIROL
→ AUDITORÍA FOCAL CLOUD V6
→ APPLY_DELTA_DIRECTLY SOLO CON GO
→ GATES
→ DEV ÚNICO SI CAMBIA app/
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

## 9. Estado seguro

- cambios funcionales `app/`: 0;
- estado proveedor restaurado: sí;
- Hosting/Cloud Run deploys: 0;
- Firestore de negocio/HR/Rules/Storage: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: intacta.
