# PENDIENTES-PROTOTIPO.md

> Lista viva de mejoras del prototipo CXOrbia, priorizada.
> Actualizacion ChatGPT 2026-07-02 sobre ZIP V65 recibido de Claude.
> Clasificacion: CERRADO / PARCIAL / PENDIENTE / BACKEND.

## Estado V65 auditado

### CERRADO O AVANCE VISUAL IMPORTANTE EN V65
- **PARCIAL — Submodulo Periodos:** V65 ya incluye `app/modules/periodos.js` con crear/cerrar/archivar/reabrir/duplicar/comparar periodos. Pendiente: persistencia Firestore y analitica historica profunda.
- **PARCIAL — Deteccion de periodo en importador HR:** V65 detecta rango de fechas, periodo nuevo/existente, paises y HR multi-periodo. Pendiente: separacion/persistencia real por periodo en backend.
- **PARCIAL — Centro de Actualizaciones/Novedades:** V65 incluye `app/modules/novedades.js` con publicacion admin, historial por rol y lectura local. Pendiente: persistencia multi-tenant, lectura backend y sincronizar badge topbar.
- **CERRADO — Seguridad de carga frontend:** `app/index.html` no carga `modules/rutas.js`, no carga `modules/aprendizaje.js` y no carga backend protegido.
- **PARCIAL — Estados honestos:** `integraciones.js` ya usa estados como pendiente backend/simulado. Pendiente extender a correo, automatizaciones, IA y acciones operativas.

### PENDIENTE PRIORITARIO PARA PROTOTIPO
- **P0 — Historico profundo:** vista historica consultable por programa/periodo/pais/sucursal, con scores, hallazgos, comparativos y sin mezclar operacion activa.
- **P0 — Sincronia global de filtros:** un solo estado visual para proyecto/programa, periodo, pais y quincena en todos los modulos.
- **P0 — Acciones operativas visibles pero bloqueadas:** botones/modales pueden existir, pero deben mostrar claramente `pendiente de activacion backend`; no deben llamar backend real.
- **P1 — Novedades + topbar:** alinear modulo Novedades con campanita/global notifications, sin backend real.
- **P1 — Correo/Automatizaciones/IA:** mostrar estados honestos: simulado, borrador, pendiente backend, error, conectado.
- **P1 — Fichas ampliadas:** Ficha de Periodo, Ficha de Visita ampliada y Ficha de Sucursal con historico/scores/hallazgos/comparativo.
- **P1 — Dashboard operativo:** confirmar KPIs, drill-downs, flujo por etapas por pais, ranking shoppers y certificaciones con detalle.
- **P1 — Liquidaciones/beneficios:** historico por pais/periodo, lotes y estados visuales completos.

### BACKEND — NO TOCAR DESDE CLAUDE
- Sprint 9 esta pendiente/fallido: se detuvo con `Sprint 9 no devolvio ok=true`.
- No documentar Sprint 9 como completado.
- No conectar botones reales.
- No tocar `app/index-backend-dev.html`, `app/core/backend*.js`, Firebase rules, seeds ni client-write-tools.
- ChatGPT/backend debe diagnosticar Sprint 9 aparte.

---

> Lista viva de mejoras del prototipo CXOrbia, priorizada. Actualizada 2026-07-01.
> Clasificación: P0 crítico · P1 importante · P2 posterior · [TyA] específico · [CX] generalizable
> El detalle de CÓMO se resolvió cada ítem está en CAMBIOS-PROTOTIPO.md (entradas 1–25+).

## ✅ RESUELTOS Y VERIFICADOS (sesiones 50–63)

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

## 🔴 PENDIENTE — Estados honestos (P1, V63/V64)
- Correo: "correo simulado / borrador / pendiente backend" (no "enviado") [CX]
- Automatizaciones: activa/pausada/pendiente backend/error/simulada, última/próxima ejecución [CX]
- Integraciones: conectado/pendiente/simulado honesto por cada una [CX]
- IA: "pendiente de backend/IA real" cuando no hay API key conectada [CX]

## 🔴 PENDIENTE — Fichas ampliadas (P1, V63/V64)
- Ficha de Periodo, Ficha de Visita ampliada, Ficha de Sucursal (histórico/scores/hallazgos/comparativo) [CX]

## 🔵 BACKEND (fuera de alcance del prototipo — lo hace ChatGPT)
- Persistencia real (hoy localStorage), Auth, Storage de evidencias
- Make/WhatsApp/correo/HR-online reales; Gemini server-side
- Importación que persista; migración de datos reales

## 🟡 PROFUNDIDAD DE CONTENIDO (ampliable, no bloqueante)
- Más cursos extensos en Academia por industria; más analítica en Finanzas/portal cliente