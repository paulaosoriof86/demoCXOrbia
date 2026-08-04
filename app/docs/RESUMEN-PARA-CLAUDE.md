# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-04  
**Estado frontend:** `CLOUD_PORTABLE_V5_HOLD__V6_ACCUMULATIVE_FRONTEND_REQUIRED__NOT_INTEGRATED`

## 1. Decisión vigente

El paquete `Prototype development request V5.zip` quedó:

`HOLD_CLOUD_V5_FRONTEND__NO_APROBADO_PARA_INTEGRACION`.

SHA-256:

`c55f83fedb9263a99705f9e2cc41ade8a186fe7d9c2e675689d901de43089ed1`.

No se aplicó ningún archivo de V5 a `app/`.

Fuente única para la siguiente entrega:

`PROMPT-CLOUD-FRONTEND-ACUMULADO-V6-20260804.md`.

## 2. Trabajo frontend de Cloud

Cloud debe entregar una V6 acumulativa que incluya:

1. Login y órbita refinados para desktop, tablet y móvil;
2. branding dinámico del tenant;
3. países dinámicos recibidos por props;
4. responsive P1 en tablas, fichas, tarjetas y modales;
5. PDF P1 con gráficas existentes válidas;
6. Excel P2 con presentación útil;
7. opción visual `Regional`;
8. copy correcto del modelo financiero delegado;
9. Ficha Shopper presentacional responsive;
10. capturas reales, comparación V5/V6 y manifest completo.

No reconstruir desde cero y no devolver una entrega parcial.

## 3. Problema visual principal de V5

En desktop:

- órbita demasiado grande;
- franja transversal pesada;
- formulario demasiado alto;
- jerarquía visual inferior a la referencia Emergent;
- evidencia responsive inválida y fuera del manifest.

Objetivo `1440×900`:

- órbita aproximada de 390–430 px;
- panel oscuro 48–50 %;
- formulario útil 420–460 px;
- contenido completo o casi completo sin scroll prolongado.

## 4. Evidencia requerida

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

Todas las capturas deben figurar en `MANIFEST.json` con path, bytes y SHA-256.

## 5. Países

Las banderas representan cobertura visual del tenant.

Cloud debe:

- mostrar todos los países recibidos;
- conservar bandera, nombre y orden;
- no hardcodear países;
- no usar `+N`;
- no implementar multiselect;
- no exigir selección de país;
- mantenerlos visibles y responsive.

## 6. Fuera del alcance de Cloud

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

## 7. Estado backend paralelo — sin impacto Cloud

Se corrigió exclusivamente el gate Cliente:

- navegación explícita a `cli_dashboard`;
- marker estable de ruta/render;
- evidencia separada de módulo, ruta, Panorama y bloqueo;
- etapa original preservada antes del rollback.

Resultado source/static:

- run `30936681878`;
- `PASS_CXORBIA_CONTROLLED_RUNNERS_CONTRACT`;
- gate interno `PASS_C6_CLIENT_ROUTE_SOURCE_STATIC`;
- provider reads 0;
- writes 0;
- runtime no reejecutado.

Este punto no es una tarea frontend y no modifica los entregables de Cloud V6.

## 8. Entrega esperada

Un único ZIP V6 con:

- `login-portable-v6/`;
- `frontend-pending-delta/`;
- reportes de cambios, responsive y tokens;
- comparación visual V5/V6;
- capturas reales;
- escenarios 1/2/8/12 países;
- manifest completo.

Cloud no debe afirmar integración, GO, deploy ni producción.
