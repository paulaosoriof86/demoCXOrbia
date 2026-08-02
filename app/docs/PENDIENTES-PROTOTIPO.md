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
- comparativo con todos los periodos detectados;
- perfiles mínimos, WA, credenciales y certificaciones por ID exacto;
- review queue para conflictos; cero fusión por nombre;
- Portal Cliente con Panorama/KPIs/detalles aprobados;
- Finanzas con fuente financiera canónica;
- Cinépolis clasificado como delegado;
- honorario Shopper GT Q60 / HN L200;
- regalías Cinépolis 0;
- comisión de coordinación compartida sin monto, participantes ni porcentajes inventados;
- alta de proyecto conserva selección directo/delegado;
- regalías participan únicamente en proyectos con facturación local;
- tres reloads sin cambio ni duplicación;
- carga dentro de umbral medido.

## 3. Estado del código

Aplicado:

- runtime humano autenticado único;
- eliminación del carril directo reducido en el índice;
- eliminación del bridge visual por token oculto;
- Auth + HR authority + adapters canónicos en la misma URL;
- adapter unificado de Cliente, configuración financiera e histórico completo;
- contrato `tya-project-financial-model-contract-v1.js`;
- configuración Cinépolis corregida a delegado y regalías 0;
- wrapper de `CX.data.addProject` que normaliza el modelo seleccionado;
- gate estático acumulativo ampliado para modelo financiero;
- documentación y evidencia corregidas.

Pendiente:

- ejecutar el gate Node en checkout del HEAD vivo;
- ejecutar runtime/browser read-only;
- comprobar selector directo/delegado y persistencia efectiva;
- comprobar comisión delegada sin datos inventados;
- documentar PASS/FAIL;
- solicitar autorización fresca solo si PASS.

## 4. No reabrir

- no nueva candidata;
- no nueva rama/PR;
- no restauración manual de pantallas;
- no números de cortes antiguos;
- no dedupe por nombre/teléfono;
- no regalías globales;
- no tratar Cinépolis como proyecto directo;
- no inventar comisión o reparto;
- no PowerShell para Paula;
- no deploy por ensayo.

## 5. P1/P2 después del P0

- PDF con gráficas;
- Excel con formato;
- exportaciones transversales;
- copy final de fuentes/estados;
- visualización de comisión/reparto cuando exista configuración real;
- optimización de carga por módulo;
- refinamiento visual de review queue y certificaciones.

## 6. Agosto

Paula agregará agosto solo después de aprobar el estado actual. El sistema debe detectarlo desde HR y nunca crear agosto por fecha de sistema.
