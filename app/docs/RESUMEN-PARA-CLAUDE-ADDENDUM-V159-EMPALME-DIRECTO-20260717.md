# RESUMEN PARA CLAUDE — V159 EMPALMADA Y PLAN CONFIRMADO

Fecha: 2026-07-17

## Estado

V159 fue aplicada físicamente sobre `docs-tya-v6-v71-audit`.

Estado: `EMPALMED_PENDING_POST_GATES`.

No solicitar V160, no reauditar V159 y no generar otro paquete por rutina.

## Plan confirmado

El trabajo inmediato es cerrar gates semánticos y validación visual del build V159 exacto. Solo después se congela `ACTIVE_BASELINE` y se retoma backend real.

La secuencia posterior es:

`BACKEND NUEVO Y LIMPIO → CX.data READ-ONLY → MATERIALIZACIÓN DEV → AUTH/RBAC → FINANZAS/CERTIFICACIONES → HR SYNC/EVIDENCIAS → GO PRODUCCIÓN`

Claude no debe reconstruir ninguna de esas piezas backend ni simular que ya están activas.

## Reglas que Claude debe conservar

- No hardcodear Cinépolis como default global.
- Mantener multi-tenant y multi-proyecto.
- Mantener proyecto y periodo independientes.
- Mantener copy honesto para Firestore, Auth, Storage, Make, Gemini, HR sync, import y pagos.
- Mantener Academia por rol, manuales, certificaciones y notificaciones.
- Mantener Importador usando `CX.dataSource.sourceContract()`.
- No mostrar la URL/build V131 como si fuera V159.

## Pendiente inmediato

- smoke Admin, Shopper, Cliente y Academia;
- gates de histórico, 14 periodos, 616 visitas, 44 activas, junio, GT/HN, shoppers, certificaciones y finanzas;
- preview DEV V159 solo con autorización separada;
- validación visual;
- freeze de baseline.

P1/P2 se documentan. Solo un `P0_PROVEN` detiene la baseline.
