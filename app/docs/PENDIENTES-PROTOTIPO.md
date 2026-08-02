# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-02  
**Estado vivo:** `RECONSTRUCTION_ACTIVE_SOURCE_ONLY__NO_DEPLOY__NO_PRODUCTION`

## 1. Bloqueante principal actual

No existe todavía una matriz autoritativa que pruebe para cada módulo:

`última aprobación humana → candidata/commit → archivos/dependencias → SHA aprobado → SHA actual → acción`.

Por tanto, la prioridad es reconstruir la candidata acumulativa única. El gate semántico C6 aislado queda suspendido hasta cerrar la composición.

Fuente viva:

- `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-MATRIZ-MAESTRA.md`.

## 2. Familia A abierta

Pendiente inventariar y trazar completamente:

- shell y entrada;
- tenant/marca;
- navegación y rutas por rol;
- Proyecto y Periodo;
- `store` y la interfaz exacta `CX.data`;
- HR y read model canónico;
- adapters de Auth, HR y runtime;
- overlays de Hosting;
- service worker/cache;
- dependencias que cambian comportamiento sin modificar `app.js`.

## 3. Hallazgos ya confirmados

### Build-lock obsoleto

`app/core/build-lock.js` todavía declara V174/R20. Debe reemplazarse al final con el manifest de la candidata acumulativa, no antes.

### V182 incremental

Coincidencia exacta con rama:

- `app/app.js`;
- `app/modules/beneficios.js`;
- `app/styles/layout.css`.

Reconciliación requerida por fixes posteriores:

- `app/core/finanzas-core.js`;
- `app/modules/finanzas.js`.

## 4. Familias pendientes después de A

### B — CRM Ops Leads

- Dashboard;
- hoja de ruta;
- CRM;
- Comercial;
- Clientes;
- Marketing;
- indicadores y drilldowns sin métricas fabricadas.

### C — Operación e histórico

- proyectos;
- periodos;
- HR;
- histórico;
- visitas;
- postulaciones;
- reservas;
- shoppers;
- novedades.

### D — Shopper

- Mi Día;
- disponibles;
- Mis Visitas;
- Reservas;
- Mi Perfil;
- cuestionario;
- Beneficios;
- Certificaciones;
- documentos y tablón.

### E — Finanzas

- Finanzas;
- Liquidaciones;
- Movimientos;
- Costos;
- Beneficios;
- pagos y lotes;
- alcance por país/moneda/proyecto.

### F — Portales y reportes

- Portal Cliente;
- Portal Shopper;
- reportes Admin/Cliente/Shopper;
- PDF/XLSX/PPTX;
- branding y gráficas;
- mismas filas, alcance, periodo y `sourceRevision`.

### G — Administración y Academia

- Configuración;
- Administrabilidad;
- Importador;
- Integraciones;
- Automatizaciones;
- Correo;
- Soporte;
- Marca;
- Diagnóstico;
- Academia.

## 5. Cerrado y protegido

No reabrir sin regresión nueva:

- Shopper nueva pestaña e identidad exacta;
- `ownVisits=1` para el caso técnico probado;
- Staff/Shopper/Cliente remoto estable;
- 14 periodos y 616 visitas;
- precedencia financiera canónica;
- `tya::cinepolis` delegado;
- facturación local false;
- regalía 0;
- 14 delegados, 0 directos, 0 sin configurar y 0 violaciones;
- producción intacta.

## 6. Pendientes funcionales que deben sobrevivir la reconstrucción

- CRM Ops Leads como prioridad de salida;
- Dashboard y hoja de ruta sin retrocesos;
- PDF con gráficas;
- Excel con formato real;
- exportaciones transversales;
- comisión/reparto configurable visible;
- Regional en wizard cuando corresponda;
- review queue y certificaciones;
- Agosto solo cuando exista en HR y después del freeze correspondiente.

## 7. Criterios de cierre

- cero módulos `UNKNOWN`;
- dependencias completas;
- SHA objetivo por archivo;
- un solo commit funcional;
- un manifest;
- un build-lock;
- un verificador;
- un solo Hosting DEV;
- validación humana del mismo build;
- freeze antes de cutover.

## 8. Prohibiciones

- no nuevo deploy durante inventario;
- no nueva candidata, rama, PR, Firebase o Hosting;
- no shell reducido;
- no parche UI para esconder diferencias;
- no restaurar V182 ciegamente sobre fixes financieros posteriores;
- no merge ni producción antes de composición y aprobación humana.
