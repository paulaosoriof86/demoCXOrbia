# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-01  
**Estado vivo:** `C6_ROOT_FIX_AND_PROJECT_FINANCE_GUARD_APPLIED_PENDING_READONLY_RUNTIME_VALIDATION`

## 1. P0 bloqueante

Validar que la baseline acumulativa y el modelo financiero por proyecto funcionan en runtime. Hasta entonces no hay freeze, agosto, deploy ni producción.

## 2. P0 que debe cerrar el gate

- login real en la entrada humana;
- Cliente, staff y Shopper con principal/claims correctos;
- Shopper nunca “sin identidad”;
- HR viva completa desde 2025;
- julio como último periodo mientras no exista agosto;
- KPI/fases/drill con una sola máquina de estados;
- comparativo con todos los periodos detectados;
- perfiles, WA, credenciales y certificaciones por ID exacto;
- review queue para conflictos; cero fusión por nombre;
- Portal Cliente con Panorama/KPIs/detalles aprobados;
- Finanzas con fuente financiera canónica;
- Cinépolis configurado como delegado, no por hardcode de nombre;
- honorario Shopper GT Q60 / HN L200;
- regalías Cinépolis 0;
- ingreso delegado obtenido únicamente de comisión explícita;
- honorario Shopper nunca utilizado como ingreso delegado;
- comisión y distribución sin valores inventados;
- margen solo con ambas fuentes exactas;
- alta de proyecto conserva selección directo/delegado;
- soporte backend regional preservado;
- tres reloads sin cambio ni duplicación;
- carga dentro de umbral medido.

## 3. Estado del código

Aplicado:

- runtime humano autenticado único;
- Auth + HR authority + adapters canónicos en la misma URL;
- contrato `tya-project-financial-model-contract-v1.js` para Local/Delegado/Regional;
- clasificación por projectConfig, no por nombre;
- configuración Cinépolis delegada y regalías 0;
- guard `tya-delegated-coordination-finance-guard-v1.js`;
- eliminación del fallback honorario Shopper → ingreso;
- margen delegado fail-closed sin comisión/reparto exactos;
- gate estático acumulativo ampliado;
- documentación y evidencia corregidas.

Pendiente técnico:

- ejecutar el gate Node en checkout del HEAD vivo;
- ejecutar runtime/browser read-only;
- comprobar comisión y reparto desde configuración real;
- documentar PASS/FAIL;
- solicitar autorización fresca solo si PASS.

## 4. Pendientes Claude/prototipo por archivo

### `app/modules/proyecto-wizard.js`

- agregar opción `Regional` sin cambiar el contrato backend;
- conservar directo/delegado;
- ocultar regalías para delegado/regional;
- no duplicar cálculos.

### `app/modules/finanzas.js`

- sustituir el texto “honorario recibido menos lo pagado al shopper”;
- explicar comisión de coordinación y distribución configurable;
- mostrar estado de revisión cuando falte comisión o reparto exactos;
- no presentar margen 0 como margen confirmado.

## 5. No reabrir

- no nueva candidata;
- no nueva rama/PR;
- no restauración manual de pantallas;
- no números de cortes antiguos;
- no dedupe por nombre/teléfono;
- no regalías globales;
- no clasificación por nombre de proyecto;
- no tratar honorario Shopper como ingreso delegado;
- no inventar comisión o reparto;
- no PowerShell para Paula;
- no deploy por ensayo.

## 6. P1/P2 después del P0

- PDF con gráficas;
- Excel con formato;
- exportaciones transversales;
- copy final de fuentes/estados;
- visualización de comisión/reparto con fuente real;
- optimización de carga por módulo;
- refinamiento visual de review queue y certificaciones.

## 7. Agosto

Paula agregará agosto solo después de aprobar el estado actual. El sistema debe detectarlo desde HR y nunca crearlo por fecha del sistema.
