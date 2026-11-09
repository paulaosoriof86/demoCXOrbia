# CXOrbia — bloque de diseño de tablas y listados (POSTPRODUCCIÓN)

**Decisión de Dirección:** Paula Andrea Osorio Franco, 09-nov-2026. Solicitud expresa de generar, al finalizar el trabajo de salida a producción, un bloque de mejora visual; la prioridad principal son las tablas. El **PASS visual focal de VRM-320** se mantiene y no se revoca por este backlog.

**Estado:** `FROZEN_BACKLOG_POSTPRODUCTION_NONBLOCKING`. No equivale a nueva rama, candidato, deploy ni aceptación I3/I4. No iniciar antes del gate de producción autorizado.

## Alcance transversal

- Sistema único de diseño para tablas y listados de Admin, Shopper, Mi Perfil, Mis Visitas, Mis Beneficios, Finanzas, liquidaciones, lotes, Shoppers y Certificaciones; inventario por módulo para no dejar estilos dispares.
- Encabezados y celdas: jerarquía, padding, tipografía, colores de la marca CXOrbia, contraste, división de filas, zebra/hover/focus, espacios y densidad, encabezados fijos cuando proceda.
- Estados: chips legibles y semántica única para `Pagado confirmado`, `Pendiente de confirmación`, `CxP`, `Validada`, `Submitida`, `Revisión`; no confundir estado de visita con estado de pago.
- Responsive real en móvil/tableta/escritorio sin recortar acciones ni valores monetarios; navegación por teclado, foco visible, lectura de pantalla y estados vacío/carga/error.
- Acciones (Ver detalle, edición, exportación, filtros, orden, paginación) preservadas; toda interacción debe conservar ACK/readback y no degradar tiempos de carga.
- Coherencia entre tarjetas, modales, tablas y registros; antes/después visual y funcional por módulo, usando Chrome conectado, no TinyFish según decisión operativa posterior de Paula.

## Invariantes de aceptación

1. El cambio es de presentación transversal; prohibido introducir correcciones por shopper, ciudad o país.
2. Datos, HR viva, identidad, pagos, certificaciones, reembolsos, permisos y fechas siguen siendo gobernados por sus fuentes; CSS no puede modificar semántica de negocio.
3. Una sola rama Recovery y una candidata acumulativa; cambios focales por owner con pruebas visuales y funcionales, comprobación de artefacto exacto servido y PASS de Paula por bloque.
4. No bloquear I3/Go-Live por mejoras cosméticas futuras; evitar redefinir o invalidar PASS ya otorgados.

## Criterio de cierre del bloque futuro

Inventario 100% de tablas/listados definidos, capturas Chrome antes/después por resoluciones representativas, pruebas de navegación, exportación y acciones con rol Admin/Shopper y países GT/HN; comprobación de no regresión, artifact y proveedor; recepción de PASS humano de Dirección. Si una tabla falla, cerrar solo su owner sin reiniciar los módulos aprobados.

**Estado actual:** solicitado y congelado en gobierno; **NO IMPLEMENTADO, NO PROBADO**. Recuperación I3 y corte financiero septiembre/octubre/noviembre siguen independientes.
