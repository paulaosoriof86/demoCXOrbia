# PENDIENTES-PROTOTIPO.md

> Lista viva de mejoras del prototipo CXOrbia, priorizada. Actualizada 2026-07-16.
> Clasificación: P0 crítico · P1 importante · P2 posterior · [TyA] específico · [CX] generalizable
> El detalle de CÓMO se resolvió cada ítem está en CAMBIOS-PROTOTIPO.md (entradas 1–25+).

## 🔴 P0 ACTUAL — V155 GATE COMERCIAL TRANSVERSAL

- [CX] La migración de proyectos ya quedó tenant-safe y repetible; no reabrirla.
- [CX] `hasTechAccess()` permanece false y el curso `a_backend` está oculto; no reabrir esos gates.
- [Claude] Eliminar jerga técnica visible para admin/ops/coordinador/aliado/shopper/cliente en DOM, tooltips, toasts, manuales, cursos y plantillas.
- [Claude] Ejecutar gate automatizado por rol/módulo con 0 coincidencias para `backend`, `runtime`, `source-safe`, `pending_backend`, `reviewQueue`, `auditEvents`, `sourceRef`, `connectionRef`, manifest/source lock/BUILD_ID, `app/docs`, `dry-run`, `gate backend` y `sync backend`.
- [Claude] No cambiar identificadores internos, contratos, comentarios ni contenido técnico realmente inaccesible.
- [Academia] Revisar cursos y manuales comerciales; técnico solo para audiencia interna protegida.
- [Backend] Excluir `app/docs`, `app/demo` y evidencia técnica del Hosting durante el empalme, sin eliminarla del repositorio.

## ✅ RESUELTOS Y VERIFICADOS

### Núcleo / white-label / IA
- IA multi-proveedor sin sesgo + comparativo costo/beneficio [CX]
- IA REAL: `CX.ai.ask` llama Gemini/OpenAI/Anthropic; `readAttachment` lee PDF/texto adjunto [CX]
- PWA auto-install + favicon = logo de la consultora [CX]
- Login white-label: logo cliente + banderitas (chips) + "Desarrollado por CXOrbia" [CX]
- Logo del cliente en topbar + propuestas [CX]
- Temas: 4 paletas nuevas (gris oscuro/claro, índigo, teal) + tipografías [CX]
- Roles franquicia (coordinador/aliado/representante) con scopeCountry + NDA por rol [CX]
- Permisos por rol que gobiernan navegación real (matriz `cx_perm` persistente) [CX]

### Operación
- Mis Visitas / Mis Beneficios filtran por shopper autenticado [CX]
- Acciones operativas persistibles + bitácora de auditoría (`automations.logAction`) [CX]
- Postulaciones: solicitar ajuste, gestión visitas aprobadas, reasignar con buscador, perfil real [CX]
- Reservas/Asignación: cruce reserva↔postulación, notificaciones bidireccionales [CX]
- Botón "Asignar responsable" → notifica + aparece en Mi Día [CX]
- Dashboard operativo: KPIs vivos, avance real vs ideal por país, sin hardcode de mes/2026 [CX]
- Estado operativo de visitas: detalle real por visita, editar/borrar inline [CX]
- Visitas disponibles multi-proyecto para shopper [CX]

### Finanzas
- CxC/CxP clickeables: detalle, editar saldo, cambiar estado, eliminar [CX]
- Pago de lote = movimiento por shopper (no "pago lote" genérico) [CX]
- Financiamiento con concepto; presupuesto mensual; análisis crítico [CX]
- Fecha de pago = viernes + N días configurable; liquidación reacciona a cuestionario+submit [CX]
- Importador Excel real (.xlsx) con SheetJS [CX]
- R18D P0: `serieMensual()` ya entrega `project()`, `period()` y `visitas()` al adapter local; Finanzas renderiza sin `data.period is not a function` [CX]

### Comercial
- CRM completo estilo Orbit: Dashboard/Insights, Pipeline, Leads, Cuentas, Contactos, Actividades, Reportes [CX]
- Ficha 360 hub a pantalla completa con pestañas + trazabilidad de correos + proyectos/propuestas vinculados [CX]
- Clientes ↔ Cuentas CRM sincronizados (misma entidad) [CX]
- Costos/Propuestas: cargar plantilla, redactar IA, investigar cliente web, exportar PDF, enviar; propuestas vinculadas al cliente con estado [CX]
- Marketing: generar mes IA con temáticas/embudo/objetivo/CTA/hashtags + elegir herramienta [CX]

### Capacitación / contenido
- Academia: 16 cursos (7 admin + 5 shopper + 4 cliente), lecciones profundas + quiz, 9 categorías [CX]
- Admin ve/edita/dirige cursos de TODAS las audiencias (selector de audiencia) [CX]
- Crear curso/lección/categoría con IA; embeber video/imagen/documento inline [CX]
- Manuales: 10 con visibilidad por rol, visor a pantalla completa; 3 profundos (Automatizaciones/Add-ons/Integraciones) [CX]
- Certificación: crear banco con IA desde instructivo, examen shopper, recertificación con notificación [CX]
- Documentos → "Recursos del proyecto": visor pantalla completa + generación IA + IA en edición [CX]
- Reportes: crear/editar, exportar CSV real, generar con IA [CX]
- Soporte: bandeja viva, cambiar estado notifica al solicitante, asignar responsable [CX]

### Config / gobierno
- Config: Centro de autoadministración + listas desplegables administrables (rubros/tipos/canales/conceptos/estados) [CX]
- Usuarios: crear/editar, correo cualquier dominio, roles personalizados [CX]
- Set-up inteligente: elegir QUÉ ítems generar (instructivo/cuestionario/cert/HR/evidencias) [CX]
- NDA/Legal: versionado + auditoría + textos por rol (incl. coordinador/aliado/representante/socio) [CX]
- Modo demo/piloto + proyecto inicial configurable [CX]
- Impresión/PDF limpia (sin topbar, @media print) [CX]
- Add-ons: catálogo in-app + evidencia geolocalizada + docs comerciales [CX]

## 🔴 PENDIENTE — Paquete V63/V64 (P0, próximas sesiones)
- ✅ Selector Proyecto = programa (no meses) + sub-selector Periodo — HECHO V64
- **Submódulo "Periodos"**: crear/cerrar/archivar/duplicar/comparar periodos de un programa [CX]
- **Vista de Histórico**: consultable sin mezclarse con operación activa (por proyecto/país/periodo/comparativos) [CX]
- **Detección de periodo en importador HR**: proyecto nuevo/existente, periodo nuevo/existente, duplicados, errores, con panel de confirmación [CX]
- **Centro de Actualizaciones/Novedades** SaaS multi-tenant: vista admin (releases, estado por tenant) + vista cliente (banner, historial, confirmación lectura) [CX]
- **Sincronía de filtros** proyecto/periodo/país entre TODOS los módulos (un solo estado, sin mezclar) [CX]

## 🔴 PENDIENTE — Estados honestos (P1)
- Correo: estado funcional `borrador` o `pendiente de envío`; no mostrar enviado sin proveedor real [CX]
- Automatizaciones: activa/pausada/pendiente de activación/error/vista previa, última/próxima ejecución [CX]
- Integraciones: conectado/pendiente/simulado honesto por cada una [CX]
- IA: `pendiente de conexión` cuando no hay proveedor real [CX]
- Shoppers source-safe: el KPI `Activos` no debe contar referencias protegidas sin estado como activas; debe separar referencias protegidas, perfiles operativos y perfiles autorizados [CX]
- Shoppers source-safe: revisar el KPI y la celda `Perfil` para no mostrar completo/incompleto cuando la fuente solo entrega referencia protegida [CX]
- Finanzas source-safe: no mostrar un modelo financiero específico, ingresos estimados ni narrativa de margen creciente cuando esos campos no vienen de una fuente confirmada [CX]

## 🔴 PENDIENTE — Fichas ampliadas (P1)
- Ficha de Periodo, Ficha de Visita ampliada, Ficha de Sucursal (histórico/scores/hallazgos/comparativo) [CX]

## 🔵 BACKEND (fuera de alcance del prototipo — lo hace ChatGPT)
- Persistencia real (hoy localStorage), Auth, Storage de evidencias
- Make/WhatsApp/correo/HR-online reales; Gemini server-side
- Importación que persista; migración de datos reales

## 🟡 PROFUNDIDAD DE CONTENIDO (ampliable, no bloqueante)
- Más cursos extensos en Academia por industria; más analítica en Finanzas/portal cliente

---

## Pendientes después de aplicar V66 — ChatGPT/backend 2026-07-02

- [CX] Mantener el prototipo comercializable y generalizable. TyA/Cinépolis es tenant DEV; no endurecer reglas como si fueran el único cliente.
- [Backend] Implementar segmentación real por tenant, projectId, programId, periodId, país, rol, permisos y feature flags.
- [Backend] Sprint 9 sigue pendiente: no marcar como cerrado hasta validar Firebase DEV real.
- [Claude] Mantener estados honestos mediante lenguaje funcional comercial, sin jerga interna.
- [Claude] Validar visualmente reglas operativas por periodo/país/quincena sin convertirlas en lógica exclusiva de TyA.

## 2026-07-14 - Post empalme V131

- Mantener smoke visual final por roles como verificación posterior.
- Producción, proveedores, import real y writes siguen HOLD.

## 2026-07-15 - R18D hotfix cerrado

- El P0 de Finanzas quedó empalmado de forma reconciliada y R18D pasó sin blockers ni warnings.
- Los ajustes source-safe de Shoppers/Finanzas se mantienen para validación visual DEV.
