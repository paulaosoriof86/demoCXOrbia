# PLAN-TRABAJO-BACKEND-V62.md

Fecha: 2026-07-01 13:30:03
Base visual: V62 aplicado preservando backend.

## Estado confirmado previo

- Firestore rules V58 DEV: OK.
- Seed piloto ficticio V58: OK.
- Smoke read-only Firestore DEV: OK.
- Adapter Firestore normaliza seed V58: OK previo.
- V62 se integra como ultima base visual sin tocar backend protegido.

## Siguiente ruta backend

1. Preview backend V62 con servidor Node.
2. Validar badge Firestore DEV.
3. Confirmar Auth OK o error claro.
4. Confirmar tenant TyA y projectId correcto.
5. Confirmar conteos Firestore y no localStorage/demo.
6. Ampliar modelo Firestore: HR, periodos, sucursales, visitas, aplicaciones, shoppers, shopperStats, notificaciones y responsibilityLog.
7. Conectar lectura Firestore a CX.data sin romper modulos.
8. Agregar acciones operativas controladas.
9. Storage evidencias.
10. Auth/roles.
11. Make/WhatsApp/correo.
12. Gemini/IA segura fuera del frontend.
13. Migracion limpia TyA exportada.
14. Smoke integral DEV.
15. Preparacion produccion sin publicar hasta autorizacion.