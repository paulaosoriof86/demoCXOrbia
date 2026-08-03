# PRD - Gravicentra CX (Producto 1: TyA Consultores tenant)

## Contexto
Plataforma multi-tenant de auditoría de campo / mystery shopping desarrollada por Gravicentra. TyA Consultores es el primer tenant, con Cinépolis (GT + HN) como primer proyecto. La plataforma reemplaza la legacy Firebase (https://tya-plataforma.web.app) que quedará obsoleta.

## Stack
- Backend: FastAPI + MongoDB + Pydantic
- Frontend: React JS + Tailwind + i18n (es/en) + shadcn ui
- IA: Emergent Universal LLM Key (GPT 5.6 Terra + Claude Sonnet 5 + Gemini 3.1 Pro)
- Email: Resend managed
- Storage: Emergent Object Storage
- Auth: JWT + bcrypt

## Roles
super_admin, admin, coordinador, supervisor, auditor  
(→ Fase B: shopper, client_admin/viewer/director, finance_admin, certification_admin, country_admin)

## Implementado (Feb 2026)
### Iteración 1 - MVP Base
- Auth JWT, 5 roles, seed idempotente
- Dashboard KPIs + Recharts
- Campañas + Visitas (5 estados) + Formularios dinámicos
- Ejecución mobile con fotos + auto-scoring
- Evaluaciones (aprobar/rechazar), Reportes, Users, Clients
- Módulo IA: chatbot streaming + análisis multimodal
- Object Storage + Resend welcome email

### Iteración 2 - Multi-tenant + Gravicentra rebrand
- **Rebrand**: Gravicentra CX (empresa madre) + TyA logo (tenant)
- **i18n**: ES/EN con switcher, framework para más idiomas
- **Tenants + Projects + Periods**: modelo multi-tenant aditivo
- **Shoppers directory**: 5 seeds, búsqueda por país/ciudad/email
- **Postulaciones**: ficha completa (shopper, sucursal, fecha, franja, notas) + aprobar/rechazar con motivo
- **Configuración por Proyecto**: HR config (Google Sheets tabs GT/HN), questionnaire config (external URL Cinépolis), payment config (honorario + reembolsos boleto/combo)
- **HR Sync stub**: endpoint /api/hr/sync/{project_id} (simulado, listo para conectar credenciales Google API)
- **Tenant/Project/Period selector**: pills en top bar
- **Cinépolis Q1/Q2 GT+HN**: proyecto real seed con 3 periodos

## Backend endpoints agregados (Fase A)
- /tenants (CRUD)
- /projects (CRUD extendido con hr_config, questionnaire_config, payment_config)
- /periods (CRUD)
- /shoppers (list, search, detail enriquecido)
- /postulations (list con enriquecimiento, review con approve/reject/reason)
- /hr/sync/{project_id} + /hr/sync-events
- /liquidations (list, create)

## Backlog P1 (siguiente)
- Firma digital (canvas) en ejecución de visita
- Export PDF (jspdf) + Excel (xlsx) reportes
- Constructor drag-and-drop de formularios
- Estados canónicos 14-estados en visits (available → liquidation_paid)
- Assignments module (visit ↔ shopper con sync HR)
- Reviews separado de evaluations
- Liquidations UI completa + PaymentBatches

## Backlog P2 (Fase B)
- Portal Cliente (director / regional / branch)
- Portal Shopper mobile PWA
- Certification banks + attempts
- Academia (courses, progress)
- Notifications outbox (WhatsApp via Make.com)
- Integration outbox idempotente
- Auditoría append-only (auditEvents)
- Migración real de Firestore → MongoDB (24 shoppers, 616 visits canónicas, 209 refs protegidas)

## Documentos de referencia usados
- DOCUMENTO-TRASPASO-TECNICO-TYA-REACT-FASTAPI-MONGODB.md
- PAQUETE-ARRANQUE-SOBRE-CODIGO-ACTUAL-CXORBIA-TYA-20260803.zip
  - 10-MODELO-MONGODB-INICIAL.md
  - 09-OPENAPI-INICIAL.yaml
  - 05-PLAN-DE-EJECUCION-INICIAL.md
  - 06-CONTRATOS-Y-GATES-DE-NO-REGRESION.md
  - 04-MATRIZ-CODIGO-ACTUAL-A-STACK-NUEVO.md
- Prototype development request CXOrbia V182.zip
