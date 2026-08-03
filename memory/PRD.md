# PRD - demoCXOrbia (TyA Consultores)

## Original Problem Statement
Reemplazar plataforma Firebase parchada de TyA Consultores (consultora de auditoría de campo) con stack React + FastAPI + MongoDB, y en fases posteriores extraer un prototipo multi-tenant comercializable.

## Users & Roles
- super_admin (paula.osorio.f86@gmail.com) - dueña de la plataforma
- admin - gestión de usuarios, clientes, campañas
- coordinador - planifica campañas y visitas
- supervisor - audita visitas ejecutadas
- auditor - ejecuta visitas en campo (mobile-first)

## Implemented (Feb 2026 - MVP)
- JWT auth + bcrypt + roles
- Dashboard con KPIs, gráficos y actividad reciente
- CRUD campañas, visitas (con scoring automático), formularios dinámicos
- Ejecución mobile de visitas con checklist + fotos
- Panel de evaluaciones (aprobar/rechazar)
- Reportes con Recharts (distribución + ranking)
- Gestión de clientes, puntos de venta, usuarios
- Módulo IA:
  - Chatbot flotante streaming (GPT 5.6 Terra)
  - Análisis de documentos (Gemini 3.1 Pro multimodal + Claude Sonnet 5 razonamiento)
  - Upload a Emergent Object Storage
- Email transaccional (Resend managed) - welcome email en creación de usuarios
- Seed idempotente con owner + 4 usuarios demo + campaña Andina + 3 puntos + 3 visitas

## P1 / Backlog (Fase 1.1 → Fase 2)
- Constructor visual de formularios (drag & drop)
- Calendario de visitas (react-day-picker ya instalado)
- Firma digital en ejecución de visita
- Exports PDF/Excel de reportes
- Migración real de Firestore → MongoDB (esperar documento ChatGPT)
- Notificaciones automáticas (asignación de visita, recordatorios)

## P2 (Fase 3 - Prototipo comercializable)
- Multi-tenancy real (DB por tenant + super admin panel)
- Onboarding self-service + branding auto-configurable
- Catálogo de módulos contratables
- Billing (Stripe/Razorpay - decidir en Fase 4)

## Deferred
- Firmas digitales biométricas
- Modo offline en app de auditor
- Integraciones CRM/contabilidad (pendiente listado con documento TyA)
