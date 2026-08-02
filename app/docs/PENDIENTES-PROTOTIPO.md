# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-01  
**Estado vivo:** `C6_ROOT_FIX_CODE_APPLIED_PENDING_READONLY_RUNTIME_VALIDATION`

## 1. P0 bloqueante

Validar que la recuperación de la baseline acumulativa funciona en runtime. Hasta entonces no hay freeze, agosto, deploy ni producción.

## 2. P0 que debe cerrar el gate

- login real en la entrada humana;
- Cliente, staff y Shopper con principal/claims correctos;
- Shopper nunca “sin identidad”;
- HR viva completa desde 2025;
- julio como último periodo mientras no exista agosto;
- KPI/fases/drill con una sola máquina de estados;
- comparativo con los 14 periodos;
- perfiles mínimos, WA, credenciales y certificaciones por ID exacto;
- review queue para conflictos; cero fusión por nombre;
- Portal Cliente con Panorama/KPIs/detalles aprobados;
- Finanzas con configuración Q60/L200 y fuente financiera canónica;
- tres reloads sin cambio ni duplicación;
- carga dentro de umbral medido.

## 3. Estado del código

Aplicado:

- runtime humano autenticado único;
- eliminación del carril directo reducido en el índice;
- eliminación del bridge visual por token oculto;
- Auth + HR authority + adapters canónicos en la misma URL;
- adapter unificado de Cliente, configuración financiera e histórico completo;
- gate estático acumulativo.

Pendiente:

- ejecutar runtime/browser read-only;
- documentar PASS/FAIL;
- solicitar autorización fresca solo si PASS.

## 4. No reabrir

- no nueva candidata;
- no nueva rama/PR;
- no restauración manual de pantallas;
- no números de cortes antiguos;
- no dedupe por nombre/teléfono;
- no PowerShell para Paula;
- no deploy por ensayo.

## 5. P1/P2 después del P0

- PDF con gráficas;
- Excel con formato;
- exportaciones transversales;
- copy final de fuentes/estados;
- optimización de carga por módulo;
- refinamiento visual de review queue y certificaciones.

## 6. Agosto

Paula agregará agosto solo después de aprobar el estado actual. El sistema debe detectarlo desde HR y nunca crear agosto por fecha de sistema.
