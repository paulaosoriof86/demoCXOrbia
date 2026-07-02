# RESUMEN-PARA-CHATGPT-BACKEND.md

## Actualizacion ChatGPT 2026-07-02 sobre V65

V65 es un prototipo visual reciente de Claude. No contiene archivos backend protegidos y puede aplicarse por overlay controlado.

### Avances frontend detectados que impactan backend futuro
- `periodos`: requiere modelo Firestore para programa/campaña vs periodo/ronda, sin confundir proyecto con mes.
- `importador HR`: ya detecta rango de fechas y periodo nuevo/existente; backend debe persistir importaciones por tenant/proyecto/periodo y prevenir duplicados.
- `novedades`: requiere persistencia multi-tenant de releases, lectura por usuario/rol/tenant y estado por plan/feature flag.
- `integraciones`: ya muestra pendiente backend/simulado; backend debe exponer estados reales por tenant cuando se conecten Make/WhatsApp/correo/IA.
- `acciones operativas`: UI real sigue bloqueada. Backend ya llego a Sprint 8. Sprint 9 no esta cerrado.

### Estado Sprint 9
- Paula autorizo Sprint 9.
- Ejecucion reportada: se detuvo con `Sprint 9 no devolvio ok=true`.
- No hubo cierre documental.
- No asumir que se crearon documentos control/log.
- Proximo paso backend: diagnostico Sprint 9 seguro, capturando error util y verificando si hubo escrituras parciales antes de repetir cualquier escritura.

---

> Qué necesita el backend para soportar el prototipo CXOrbia tras las mejoras.
> Generado para el equipo de backend (ChatGPT/Firebase). Actualizado por sesión.

## Interfaces que el backend debe implementar (manteniendo la firma actual de localStorage)

### CX.data (capa de datos principal)
El prototipo consume estos métodos. El backend debe implementarlos contra Firestore con la MISMA firma:
- `data.project()` → proyecto activo
- `data.projects` → lista de proyectos del tenant
- `data.visitas()` → visitas del proyecto activo
- `data.visitsForShopper(shopperId)` → visitas del shopper (P0: usado para filtrar Mis Visitas/Beneficios)
- `data.shoppersFor()` → shoppers del proyecto/país
- `data.getShopper(id)`, `data.shopperStats(id)`, `data.shopperKpis(id)`
- `data.assignVisit(visitaId, shopperId)` → asigna + audita
- `data.payVisits([visitaIds])` → genera lote + egresos
- `data.addClient({...})`, `data.clients`

### Campos nuevos requeridos en Firestore
- **visits**: `shopperId` (NO solo nombre), `extId` (llave HR natural), `sourceSheet`, `sourceRowRef`, `importBatchId`, `gestionadoPor`, `country`, `periodId`
- **shoppers**: `shopperId` canónico, `nameKey` (normalizado), `aliases[]`, `datosBancarios` (encriptado)
- **financialMovements**: separados de `shopperBenefits` y `paymentLots` (ver resumen ChatGPT sección 7)
- **cxp/cxc**: `estado`, `nota`, `shopper`/`acreedor`, `visitaId` vinculado
- **brand/tenant**: `logo`, `countries[]`, `theme`, `plan`, `aiProvider`+`aiModel`+`aiKey`

### Eventos que el prototipo emite (CX.bus + CX.automations.fire)
- `CX.bus.emit('visit-flow')` — cualquier cambio de estado de visita
- `CX.bus.emit('fin')` — cambio financiero
- `CX.bus.emit('crm')` — cambio en CRM
- `CX.automations.fire(evento, ctx)` — eventos de negocio (postulacion, agenda, realizada, cuestionario, reprog, pago, atraso, aprobacion, hr_writeback, shopper_edit) → POST al webhook Make del tenant

### IA (CX.ai)
- `CX.ai.cfg()` → {provider, model, apiKey}
- `CX.ai.ready()` → boolean
- `CX.ai.ask(prompt, opts)` → **PENDIENTE backend**: hoy sin key cae en heurística simulada. El backend debe enrutar a Gemini/OpenAI/Anthropic según `provider` y pasar el documento adjunto.

## Pendiente de backend (no resuelto en frontend)
- Persistencia real (hoy localStorage).
- Auth con los 6 roles (super, admin, ops, coordinador, aliado, shopper) + scopeCountry.
- Storage de evidencias (foto/video/audio) y logos.
- IA real conectada (CX.ai.ask → proveedor elegido).
- HR externa (Excel Online/Google Sheets) lectura + write-back sin duplicar.
- Encriptación de datos bancarios y NDA.

## Lo que el frontend YA dejó listo para conectar
- `visitsForShopper(shopperId)` usado en Mis Visitas y Mis Beneficios (filtro por shopper).
- CxC/CxP con estado editable (`editCx`, `delCx` en finanzas-core).
- Roles de franquicia (coordinador/aliado) en CX.ROLES con `scopeCountry`.
- IA multi-proveedor configurable (CX.ai.PROVIDERS).
- Logo del cliente en login/topbar/propuestas (CX.BRAND.logo).