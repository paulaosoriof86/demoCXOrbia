# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-04  
**Estado frontend:** `CLOUD_V6_RECEIVED__NOT_AUDITED__EXECUTION_LANE_NOT_READY__NOT_INTEGRATED`

## 1. Paquetes

V5:

`HOLD_CLOUD_V5_FRONTEND__NO_APROBADO_PARA_INTEGRACION`.

SHA-256 V5:

`c55f83fedb9263a99705f9e2cc41ade8a186fe7d9c2e675689d901de43089ed1`.

V6:

`Prototype development request V6.zip`.

SHA-256 V6:

`0a8c26e2b780a6feffeeb9d77d5efbcca94e79e2c3b17ee1a2c1446be5e1d407`.

Estado V6:

`NOT_AUDITED__EXECUTION_LANE_NOT_READY`.

No se aplicó ningún archivo de V5 o V6 a `app/`.

## 2. Regla acumulativa

V6 se audita como un único paquete frontend acumulativo. No se revisará ni empalmará únicamente el Login ni módulos aislados.

La comparación debe separar:

- delta nuevo V6;
- mejoras heredadas de V5;
- P1/P2 realmente atendidos;
- regresiones;
- archivos redundantes;
- piezas fuera del alcance frontend;
- impacto en Login, órbita, responsive, PDF, Excel, Regional, copy delegado y Ficha Shopper.

Con GO y sin P0, el único método permitido será `APPLY_DELTA_DIRECTLY` sobre la rama viva.

## 3. Motivo del estado pendiente

`EXECUTION_LANE_READY` exige en la misma sesión:

- ZIP extraído;
- checkout autenticado;
- rama viva exacta.

El ZIP está extraído, pero no se ha demostrado todavía el checkout autenticado requerido. Por ello no existe decisión GO/HOLD sobre V6.

## 4. Alcance frontend esperado

1. Login y órbita refinados en desktop, tablet y móvil;
2. branding dinámico del tenant;
3. países dinámicos recibidos por props;
4. responsive P1;
5. PDF P1 con gráficas existentes válidas;
6. Excel P2;
7. opción visual `Regional`;
8. copy delegado correcto;
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

## 6. Backend paralelo — sin tarea para Cloud

El control plane fue estabilizado source-only:

- máquina de estados única;
- autoridad browser única futura;
- ejecución fijada a SHA;
- acceso separado del runtime;
- diagnóstico por etapa;
- gates duplicados fuera del camino activo.

Esto no exige cambios de Cloud y no debe incorporarse al ZIP frontend.

## 7. Pruebas dentro de la plataforma

Se documentó un futuro Laboratorio DEV para validar Admin/Operaciones y Shopper con escenarios `AUDIT-*`, actividad visible, diagnóstico exacto y cleanup.

Cloud solo podría intervenir posteriormente en la presentación visual del panel de resultados mediante una especificación frontend concreta. No debe implementar el runner, las escrituras, la lógica de pruebas ni la integración.

## 8. Estrategia visible

El primer corte operativo prioriza:

`ADMIN/OPERACIONES + SHOPPER`.

El Portal Cliente continúa como corte paralelo. Esta decisión de release no cambia el alcance frontend acumulativo de V6, pero evita presentar Cliente como condición de salida inicial.

## 9. Evidencia V6 requerida

- `1920×1080`;
- `1440×900`;
- `768×1024`;
- `412×915`;
- `390×844`;
- escenarios de 1, 2, 8 y 12 países;
- todos los archivos y capturas en `MANIFEST.json` con path, bytes y SHA-256.

## 10. Estado seguro

- V6 auditada: no;
- V6 integrada: no;
- delta aplicado: 0;
- deploy: 0;
- producción intacta.
