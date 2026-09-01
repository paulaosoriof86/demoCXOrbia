# PENDIENTES PROTOTIPO — F10 PREDEPLOY PASS — 2026-08-29

## Pendiente vivo bloqueante de ejecución

`F10_REQUIRE_COMPATIBLE_EXISTING_HOSTING_DEV_EXECUTION_LANE_AUTHORIZATION_THEN_FOCAL_DEPLOY_THEN_NEW_FRESH_HR_SAME_REVISION_LIVE_VALIDATION`.

El producto/source no está bloqueado: patch F10 PASS, browser predeploy PASS, matriz de módulos PASS 0 mismatches. El bloqueo actual es exclusivamente de mecanismo: no hay un mutation lane Hosting DEV vigente compatible con F10; los existentes están consumidos/inertizados o atados a autorizaciones históricas.

## Después del carril

1. Deploy focal únicamente a Hosting DEV `cxorbia-backend-dev/cxorbia-dev`.
2. Verificar asset remoto exacto del adapter F10 y blobs aprobados de módulos.
3. Forzar una nueva lectura HR `fresh=1` y exigir nueva `revision` + `sourceReadAt` + `cacheOrigin=runtime_refresh`.
4. Validar KPIs live contra esa misma revisión; 0 self-parity como sustituto de frescura independiente.
5. Solo entonces solicitar visualización/aceptación de Paula.

## No pendientes / no reabrir

No reabrir causa raíz F10, versión de módulos, F5-F9, V182, Cloud Run, Auth/Firestore/HR writes, Make/Gemini ni pagos sin nueva evidencia y autorización correspondiente.

Mejora P1 futura separada: si se desea, mostrar una KPI propia de `candidatas a liquidación`; no cambiar el significado de `Liquidadas`.
