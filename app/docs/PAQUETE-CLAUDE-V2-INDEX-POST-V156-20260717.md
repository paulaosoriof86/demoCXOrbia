# PAQUETE CLAUDE V2 — ÍNDICE ÚNICO POST-V156

Fecha: 2026-07-17  
Estado: **ACTIVO, ÚNICO Y SUSTITUTIVO**

Este índice sustituye el paquete anterior `PAQUETE-EXCLUSIVO-CLAUDE-ACUMULADO-POST-V156-PRE-EMPALME-20260717.md`.

## Fuente única

- Archivo: `Prototype development request fix.zip`.
- SHA-256: `e7f7962fb37253d305018b653e1436893260a1c57f2d289c1e814c6cd914d9d2`.
- Identidad: V156 + corrección parcial 1.
- Delta contra V156: 1 archivo modificado, 0 agregados y 0 eliminados.
- Cambio válido que debe preservarse: `app/modules/configuracion.js` mapea `source_safe_preview` a `Vista previa`.

## Regla de ejecución

Claude debe completar una sola iteración acumulada. No puede detenerse después del primer hallazgo, devolver un único archivo ni preguntar si debe seguir módulo por módulo.

Secuencia:

`revisar toda la matriz → preservar lo correcto → corregir todas las brechas frontend comprobadas → actualizar Academia y handoff → entregar candidata completa`

## Documentos obligatorios del paquete V2

1. `PAQUETE-CLAUDE-V2-P0-RESPONSABILIDADES-20260717.md`
2. `PAQUETE-CLAUDE-V2-MATRIZ-FRONTEND-20260717.md`
3. `PAQUETE-CLAUDE-V2-ACADEMIA-ENTREGA-20260717.md`
4. `AUDITORIA-DEVOLUCION-CLAUDE-FIX-PARCIAL-POST-V156-20260717.md`

## Responsabilidades

Claude: frontend, UX, copy, estados, navegación, roles, Academia, manuales, documentación interna de candidata, ZIP completo y lista exacta de delta.

ChatGPT/Codex: hashes, manifest/build-lock definitivo, sintaxis global, gates estático/runtime, auditoría delta, backend/overlays, empalme directo, smoke, commit y push.

No corresponde a Claude: backend, tools, workflows, Firebase, HR real, Make/Gemini live, pagos reales, datos TyA o secretos.

## Regla de honestidad

Claude no debe fabricar pruebas. Cuando no pueda ejecutar hash, manifest o navegador automatizado, debe declarar `NO EJECUTADO EN ESTE ENTORNO`, pero continuar todos los cambios frontend que sí están dentro de su alcance.

## Criterio de cierre

La candidata solo queda lista para auditoría cuando toda la matriz está clasificada como `PRESERVADO_VERIFICADO`, `CORREGIDO_EN_ESTA_CANDIDATA`, `NO_APLICA_CON_EVIDENCIA` o `BLOQUEADO_FRONTEND_REAL`, sin filas vacías.

Estado seguro: sin empalme, merge, deploy, producción, imports, writes, proveedores live ni pagos.