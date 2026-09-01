# Resumen para Claude - arquitectura definitiva del carril

Fecha: 2026-07-17

## Regla para candidatas
Claude Design continua entregando un ZIP completo del prototipo. No debe conectarse con GitHub ni Codex y no debe modificar backend, contratos, adapters, tools, overlays de tenant ni documentacion protegida.

## Producto
La candidata debe permanecer generica, multi-tenant y multi-proyecto. No debe hardcodear tenant, proyecto, pais, moneda, HR, cuestionario, certificacion, pagos o integraciones como defaults globales.

## TyA y Cinepolis
TyA es el tenant actual y es multi-proyecto. Cinepolis es solo el primer proyecto operativo para adaptar y validar la plataforma. Sus reglas y cifras permanecen en configuracion/perfil de proyecto; nunca son defaults del tenant o del producto.

## Empalme
ChatGPT audita y genera el plan JSON. El integrador local aplica el delta desde el mismo workspace que contiene el ZIP y el checkout Git autenticado. Codex solo apoya instalacion o conflictos complejos.

## Academia
Cuando una candidata cambie modulos, Claude debe actualizar o documentar los manuales, cursos, rutas por rol, certificaciones y notificaciones relacionados, manteniendo profundidad operativa.

## Estado actual
V156 esta auditada GO, pero continua pendiente de empalme fisico y de gates posteriores.
