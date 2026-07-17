# PAQUETE CLAUDE V2 — MATRIZ FRONTEND ACUMULADA

Fecha: 2026-07-17

Claude debe revisar cada bloque y clasificarlo como `PRESERVADO_VERIFICADO`, `CORREGIDO_EN_ESTA_CANDIDATA`, `NO_APLICA_CON_EVIDENCIA` o `BLOQUEADO_FRONTEND_REAL`.

## 1. Avances protegidos

No reabrir sin regresión demostrada:

- tenant/proyecto/periodo/país separados;
- contexto compartido y selector multiproyecto;
- histórico separado de activo;
- estados ortogonales y KPIs con paridad detalle/exportación;
- `porPais()` con `data.project()` y adapter `project()/period()/visitas()`;
- `liquidada ≠ pagada` y `pagada_preview` no confirmada;
- PWA con prompt nativo y un listener;
- `hasTechAccess()` comercial apagado y `?internal=1` sin autorización;
- proyectos demo Retail/Banca/Restaurantes y fixtures tenant-safe;
- lifecycle de Academia e IA bajo revisión humana.

## 2. Contexto, proyectos, periodos e histórico

- Estado único tenant/proyecto/periodo/país.
- Ningún módulo trata periodo como proyecto.
- Cambio de periodo actualiza Dashboard, Visitas, Postulaciones, Histórico, Finanzas, Liquidaciones, Hoja de Ruta y Portal Cliente.
- Crear, cerrar, archivar, duplicar y comparar periodos con permisos.
- País/moneda derivados de proyecto/visita; no `countries[0]` ni moneda global.

## 3. Fuente externa y CX.data

- Módulos consumen `CX.data`; no proveedores directos.
- Fuente configurable por proyecto: archivo, hoja, CRM, API o plataforma externa.
- Estado, última actualización, incidencias y acción permitida en lenguaje comercial.
- No exponer referencias opacas crudas.
- Vista previa no es importación; solicitud no es sincronización completada.

## 4. Readiness comercial

- Panel de preparación con áreas, estado, warnings, bloqueos y siguiente paso en lenguaje comercial.
- Detalle técnico solo para super técnico autorizado.
- No decir conectado/importado/enviado/pagado/producción lista sin evidencia.
- Fixture o prueba no equivale a operación real.

## 5. Importadores y revisión humana

Vistas separadas para HR/visitas, shoppers, pagos/movimientos, certificaciones presentadas, documentos/recursos y otras fuentes.

Cada vista muestra archivo/formato, fuente, proyecto/periodo, aceptados, duplicados exactos, conflictos, descartados, campos protegidos, bloqueos, revisión y acción.

No mostrar DPI, banco, NDA, correos completos, teléfonos privados, adjuntos o referencias sensibles. No resolver por nombre, monto o similitud visual.

## 6. Controles administrativos

Patrón de búsqueda, filtros, motivo, revisión e historial en:

- Certificaciones;
- Postulaciones;
- Asignaciones;
- Visitas;
- Beneficios/liquidaciones;
- Evidencias;
- Integraciones;
- Academia;
- Importaciones;
- Notificaciones;
- Soporte.

Dashboard es lectura/drilldown, no lugar de correcciones silenciosas.

## 7. Certificaciones

- Buscar por certificación, proyecto, shopper y estado.
- Filtros certificado/pendiente/vencido/revisión/excepción.
- Autorizar y revocar excepción individual.
- Solicitar certificación específica a shopper específico.
- Resolver presentada no reflejada.
- Motivo e historial.
- Carryover sin repetir.
- Habilitar solo con confirmado/publicado, carryover materializado o excepción válida.
- Sin excepciones globales.

## 8. Beneficios, liquidaciones, pagos y lotes

- Honorario separado de reembolsos.
- Componentes configurables; Boleto/Combo no globales.
- País/moneda por movimiento.
- Liquidación separada de pago y fecha programada separada de confirmación.
- Selección manual de personas/visitas del lote.
- No incluir todos los elegibles automáticamente.
- Movimiento individual por shopper/visita aunque exista lote.
- Casos en revisión no aparecen pagados.
- Mensaje honesto con cero procesados.
- Sin IDs o movimientos duplicados.
- Preservar hotfix financiero.

## 9. Postulaciones, asignaciones, reservas y visitas

- Bandeja por estado, sucursal, shopper, proyecto, periodo y país.
- Vista por sucursal y shopper sin ocultar registros.
- Ficha dinámica frontal/dorso configurable.
- Perfil completo del shopper e historial.
- Aprobar, rechazar, standby, reabrir y revisión con motivo.
- Asignar, desasignar, reasignar y cancelar con trazabilidad.
- Ajuste de fecha, autorización, conservación, reprogramación y cancelación.
- Distinguir origen plataforma/fuente, pendiente, preparado, conflicto y revisión.
- Visita sale de disponibles con asignación válida.
- No duplicar al reflejarse en la otra fuente.
- Capacidad/franja/ronda/ventana configurables, no hardcode TyA.

## 10. Comunicaciones y automatizaciones

- WhatsApp Web como borrador manual con confirmación.
- Correo: borrador, preparado, pendiente proveedor, enviado confirmado o error.
- Cuenta futura por usuario/provider-agnostic sin credenciales en navegador.
- Outbox comercial con correlación, motivo, reintento y revisión.
- Plantilla preparada no es enviada.
- Marketing programado no es publicado.
- Automatización activa no significa Make conectado.
- Historial de comunicaciones por shopper/cliente.

## 11. CRM, documentos, Portal Cliente y shopper history

- Cuentas, contactos, pipeline, actividades, reportes y ficha 360.
- Carpetas/documentos externos configurables sin links privados en demo.
- Historial por shopper, cliente, proyecto, periodo y visita.
- Trazabilidad de propuestas, documentos y comunicaciones.
- Portal Cliente no fabrica responsables, NPS, fechas, estados o narrativas.
- Recursos con visor, permisos, estado y revisión.

## 12. Evidencias y cuestionarios

- Requisitos de evidencia configurables.
- Estados requerida/pendiente/cargada/revisión/aprobada/rechazada/corrección.
- No simular Storage activo.
- Cuestionario CXOrbia, enlace general, por visita o plataforma externa.
- No hardcode TyAOnline.
- Acciones y errores en lenguaje comercial.

## 13. Login, white-label y responsive

- Login configurable por tenant sin prometer SSO.
- Marca, logo, países y opciones desde configuración.
- Tenant multiproyecto y sin proyecto global default.
- Wizard crea proyectos sin clonar Cinépolis.
- Admin, shopper y cliente utilizables en desktop y móvil.

## 14. Centro de novedades

- Releases/cambios por tenant y rol.
- Banner opcional, historial y lectura confirmada.
- Vínculo con cursos/manuales actualizados.
- Estados honestos.

## 15. Exclusivo TyA, no globalizar

No hardcodear `tenantId=tya`, Cinépolis default, 14/616/44, Q1/Q2, quincenas, columnas HR, junio universal, Boleto/Combo únicos, TyAOnline único, países, monedas, URLs, shoppers, certificaciones o pagos TyA.

## 16. Resultado exigido

Claude debe entregar por cada bloque: estado, archivos revisados, archivos modificados, evidencia breve y pendiente real. No puede devolver una candidata con filas sin clasificar.