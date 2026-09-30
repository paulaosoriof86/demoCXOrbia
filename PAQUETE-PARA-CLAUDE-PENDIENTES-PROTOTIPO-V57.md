# CXOrbia - Paquete para Claude: pendientes del prototipo y continuidad Backend V57

## Instrucción principal
- Trabajar sobre el prototipo más reciente entregado y aprobado.
- No usar versiones viejas ni PR #1 como base visual.
- No perder navegación, visual aprobado, módulos existentes ni lógica funcional del frontend.
- No revertir, eliminar ni sobrescribir avances backend V57.
- Mantener separación estricta: Claude corrige frontend/prototipo; backend se mantiene en reglas, Auth, Firestore, Storage, IA, automatizaciones, scripts y documentación.

## Backend V57 que no se debe perder
- Rama correcta: release/cxorbia-tya-rc-20260630.
- PR correcto: PR #3 docs(rc): continuidad backend sobre V57.
- app/index.html no carga backend global.
- app/index-backend-dev.html sí carga backend preview.
- No considerar backend conectado mientras el badge diga localStorage/demo.
- Meta mínima del badge: Fuente: firestore y Tenant: tya.

## Error reciente de reglas
- firestore.rules tenía bulletins, bulletinReads y automations.
- Faltaban: automationLogs, integrationSettings, aiSettings, aiLogs y resources.
- El bloque correcto debe quedar entre automations y auditLogs.
- El validador debe fallar con exit code real si falta una regla o si imprime ok:false.

## Pendientes principales del prototipo
- Eliminar avisos técnicos visibles en UI final: beta, núcleo, demo, Firebase, notas de backend o diagnósticos internos.
- Corregir codificación UTF-8 real si aparecen secuencias mojibake o símbolos rotos.
- No reemplazar caracteres uno por uno; corregir origen de codificación.
- Garantizar que TyA no muestre datos, etiquetas ni módulos de Orbit, banca u otros proyectos.
- Evitar títulos duplicados, secciones duplicadas, contadores demo, rutas viejas o módulos que abren pantallas equivocadas.
- Documentar cualquier bug de frontend en PENDIENTES-PROTOTIPO.md.

## Pendientes funcionales TyA/CXOrbia
- HR/Cinépolis: Disponible desde dinámico y reglas vigentes.
- KPIs: corregir cuestionarios pendientes, sin submitir, liquidadas y drill-down.
- Dashboard operativo: tablero rápido, flujo por etapas por país, histórico comparativo y detalle accionable.
- Postulaciones: mostrar todas de una vez, no solo pendientes.
- Certificaciones: KPI debe abrir detalle y cuadrar con datos reales.
- Ranking shoppers: top 5 completo, promedio días cuestionario y criterios visibles.
- Liquidaciones: validar cuestionario realizado y submitido; fecha estimada = viernes + 15 días de submitido.
- Mis beneficios: detalle de honorarios y reembolsos.
- WhatsApp: fuera de rango, reprogramación, cuestionario pendiente y tablero con contador/atendido.

## Gate antes de datos reales
No cargar base TyA completa hasta que:
1. preview abra desde app/index-backend-dev.html;
2. Auth no esté pendiente;
3. fuente sea Firestore;
4. tenant sea tya;
5. no aparezca banca;
6. no aparezcan conteos demo;
7. admin lea datos permitidos;
8. shopper lea solo propios;
9. reglas estén validadas;
10. documentación esté actualizada.

## Pruebas esperadas
- Validación estática V57.
- Cobertura rules V57 con ok:true.
- Auth local preview.
- Smoke test backend preview.
- Tenant isolation similar al test de Orbit: usuario autorizado lee/escribe solo su tenant y tenant no autorizado queda denegado.

## No repetir
- No tocar producción.
- No deploy.
- No merge.
- No cargar datos reales sin autorización explícita.
- No versionar backend-dev-auth.local.js, output/, .env ni reportes locales .txt.
- Mantener UTF-8 sin BOM.
