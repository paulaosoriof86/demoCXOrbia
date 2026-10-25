# RESUMEN-PARA-CLAUDE-V57.md

Paula entregó V57 como nueva base visual más reciente. Claude debe considerar que backend seguirá sobre V57, pero sin perder Firebase DEV, reglas, Auth, HR histórico y documentación ya avanzada.

## Qué cambió en V57

V57 trae mejoras importantes: IA multi-proveedor, PWA, roles coordinador/aliado, login white-label, filtros shopper por `shopperId`, CxC/CxP clickeables, documentos/recursos con visor, academia/manuales más robustos, importador Excel, reportes CSV, Marketing IA y pago por shopper.

## Qué debe cuidar Claude

- No volver a introducir datos demo como si fueran TyA real.
- No romper `shopperId` porque backend depende de ese campo para seguridad.
- No prometer conexiones reales si dependen de backend.
- No dejar botones con solo toast si el usuario espera acción real.
- Mantener UTF-8; revisar `app/modules/aprendizaje.js` por posible carácter roto.

## Pendientes para la próxima actualización Claude

Ver `PENDIENTES-PROTOTIPO-V57.md`.

Top:

1. Acciones operativas persistibles.
2. Postulaciones y reservas/asignación.
3. Finanzas profunda.
4. Academia/certificación profunda.
5. CRM Clientes/Cuentas sincronizado.
6. Integraciones/automatizaciones con estados honestos.
7. Dashboard operativo con KPIs reales.

## Qué queda en manos del backend

- Portar backend DEV a V57 sin tocar módulos.
- Preview backend real con Auth OK + Firestore + TyA.
- Storage para logos, recursos y evidencias.
- IA multi-proveedor segura.
- Make webhooks por tenant.
- Migración base buena TyA después del gate Firestore visible.
