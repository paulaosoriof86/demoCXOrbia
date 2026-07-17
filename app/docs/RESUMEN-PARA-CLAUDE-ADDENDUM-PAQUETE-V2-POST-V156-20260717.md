# RESUMEN PARA CLAUDE — PAQUETE V2 POST-V156

Fecha: 2026-07-17

## Fuente única

`Prototype development request fix.zip`, SHA-256 `e7f7962fb37253d305018b653e1436893260a1c57f2d289c1e814c6cd914d9d2`.

Preservar el cambio válido de `app/modules/configuracion.js`. No volver a V156 original ni a versiones anteriores.

## Decisión

La devolución actual queda HOLD porque solo modificó un archivo y no cerró el paquete acumulado.

## Trabajo obligatorio Claude

- completar P0 comercial y bloqueo de contenido técnico;
- revisar toda la matriz frontend acumulada;
- actualizar Academia por rol/módulo;
- actualizar handoff que aún presenta V82;
- entregar ZIP completo, identidad nueva, delta exacto y matriz de cierre.

No detenerse tras el primer hallazgo ni preguntar si debe continuar.

## Separación de responsabilidades

Claude no fabrica manifest, hashes o smoke que no pueda ejecutar. Declara `NO EJECUTADO EN ESTE ENTORNO` y continúa los cambios frontend. ChatGPT/Codex ejecuta esas pruebas y el empalme después.

## No tocar

Backend, tools, workflows, Firebase, HR real, TyA data, R11D/R14C, Make/Gemini live, pagos, secretos o datos sensibles.

## Academia

Acceso, administración completa, profundidad, backfill por módulo y notificaciones. Contenido técnico aislado de roles comerciales.

## Estado seguro

Sin empalme, merge, deploy, producción, imports, writes, proveedores live ni pagos.