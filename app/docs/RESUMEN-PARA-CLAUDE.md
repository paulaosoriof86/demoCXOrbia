# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-04  
**Estado frontend:** `CLOUD_V6_RECEIVED__NOT_AUDITED__EXECUTION_LANE_NOT_READY__NOT_INTEGRATED`

## 1. Paquetes recibidos

V5:

`HOLD_CLOUD_V5_FRONTEND__NO_APROBADO_PARA_INTEGRACION`.

SHA-256 V5:

`c55f83fedb9263a99705f9e2cc41ade8a186fe7d9c2e675689d901de43089ed1`.

V6 recibida:

`Prototype development request V6.zip`.

SHA-256 V6:

`0a8c26e2b780a6feffeeb9d77d5efbcca94e79e2c3b17ee1a2c1446be5e1d407`.

Estado V6:

`NOT_AUDITED__EXECUTION_LANE_NOT_READY`.

No se aplicó ningún archivo de V5 o V6 a `app/`.

## 2. Regla de composición acumulativa

V6 no se evaluará como un Login aislado ni como una colección de módulos sueltos.

La auditoría deberá comparar el ZIP completo contra el HEAD vivo y separar:

- delta nuevo V6;
- mejoras heredadas y preservadas de V5;
- pendientes P1/P2 atendidos;
- regresiones;
- archivos redundantes;
- piezas que no correspondan al frontend;
- impacto en Login, responsive, PDF, Excel, wizard Regional, copy delegado y Ficha Shopper.

Con GO y sin P0, el único método permitido será `APPLY_DELTA_DIRECTLY` sobre la rama viva, preservando la candidata acumulativa única.

## 3. Motivo por el que V6 aún no fue auditada

El ZIP fue extraído y tiene hash registrado, pero `EXECUTION_LANE_READY` exige en la misma sesión:

- ZIP extraído;
- checkout autenticado;
- rama viva exacta.

El entorno local no resuelve `github.com`. El conector GitHub permite operaciones puntuales, pero no sustituye el checkout autenticado exigido ni autoriza un empalme fragmentado archivo por archivo.

Por ello no existe todavía decisión GO/HOLD sobre V6.

## 4. Alcance frontend esperado

La entrega acumulativa debe conservar o resolver:

1. Login y órbita refinados para desktop, tablet y móvil;
2. branding dinámico del tenant;
3. países dinámicos recibidos por props;
4. responsive P1 en tablas, fichas, tarjetas y modales;
5. PDF P1 con gráficas existentes válidas;
6. Excel P2 con presentación útil;
7. opción visual `Regional`;
8. copy correcto del modelo financiero delegado;
9. Ficha Shopper presentacional responsive;
10. capturas reales y manifest completo.

## 5. Fuera del alcance de Cloud

No tocar:

- Firebase Auth;
- claims o memberships;
- `CX.data`;
- HR;
- APIs o bases de datos;
- cálculos financieros;
- permisos o scopes;
- adapters canónicos;
- backend, tools o workflows;
- GitHub o PR #7;
- deploy, freeze o producción;
- Make, Gemini o pagos.

## 6. Estado backend paralelo — sin impacto Cloud

La reejecución runtime posterior al route fix terminó:

`FAIL_C6_CLIENT_ACCESS_RUNTIME_ROLLED_BACK`.

Etapa interna:

`client_route_wait`.

La causa source-level es un contrato de ciclo de vida incorrecto: el helper considera listo el login con `#app.on`, aunque `CX.app.enter()` activa ese estado antes de `CX.router.mount()`. El gate exige luego nav, ruta y render simultáneamente.

Este punto no es tarea frontend de Cloud y no debe mezclarse con la candidata V6.

## 7. Evidencia requerida para V6

Capturas reales:

- `1920×1080`;
- `1440×900`;
- `768×1024`;
- `412×915`;
- `390×844`.

Escenarios de países:

- 1;
- 2;
- 8;
- 12.

Todos los archivos, incluidas las capturas, deben figurar en `MANIFEST.json` con path, bytes y SHA-256.

## 8. Estado seguro

- V6 auditada: no;
- V6 integrada: no;
- delta aplicado: 0;
- deploy: 0;
- producción: intacta.
