# DECISION LOCK — TyA LEGAL V0.2 · NO-CODE / REBRAND-SAFE · 2026-08-15

**Estado:** `HUMAN_DECISIONS_CAPTURED__DRAFT_NOT_APPROVED__NO_PROVIDER_MATERIALIZATION__GO_LIVE_35`

## Propósito

Congelar decisiones humanas ya entregadas para no volver a preguntarlas ni convertirlas en constantes de código. Este lock complementa —no sustituye— el source lock técnico `SOURCE-LOCK-ITERATION3-LEGAL-ACCEPTANCE-PROVIDER-WIRING-SOURCE-ONLY-PASS-20260815.md`.

## Decisiones congeladas

1. **Rebranding:** el producto tendrá rebranding. El contrato legal usa “la Plataforma” y un `platform.displayName` dinámico; no hardcodear `CXOrbia` ni `Gravicentra` como nombre perpetuo.
2. **No-code:** identidad legal, contactos, retención, proveedores, controversias, branding/licenciante y reglas de evidencias deben quedar en configuración provider-authoritative administrable desde la Plataforma, nunca como constantes TyA en runtime.
3. **Tenant:** todos los datos de operación/identidad aquí descritos son exclusivos del tenant TyA. El esquema técnico es reusable para otros tenants.
4. **Operador TyA:** empresa mercantil individual en Guatemala, operada/contratada por su propietaria comerciante individual. Nombre comercial/legal y NIT exactos fueron confirmados humanamente y por documentación mercantil; no se copian como constantes al repo.
5. **Honduras:** la operación hondureña se administra desde Guatemala por el mismo Operador TyA; no presumir entidad hondureña distinta.
6. **Contacto:** existe un correo oficial inicial confirmado para legal/privacidad/incidentes; debe ser editable no-code. No se hardcodea en fuente.
7. **Retención:** mínimo humano deseado para evidencia cruda 60 días; default recomendado 90 días por proyecto. Registros comerciales/financieros/auditoría y receipts legales pueden requerir cinco años o más según ley/contrato/legal hold.
8. **Proveedores:** Paula no mantiene manualmente la verdad técnica. Provider Registry deriva estado activo real del runtime; metadata legal es no-code. Make/Gemini no se describen como receptores actuales mientras sigan deshabilitados/gated.
9. **Controversias:** preferencia por arbitraje. Recomendación: arbitraje institucional para B2B; no imponer universalmente a Shoppers/usuarios individuales sin validación legal por país.
10. **IP/licenciante:** mientras no exista cesión formal a entidad futura, identificar a la persona que pueda acreditar derechos; marca visible y titularidad de software son conceptos separados. Configurar Gravicentra como marca futura no constituye registro ni cesión.
11. **Datos bancarios:** se permite almacenar número de cuenta completo solo con controles reforzados, UI enmascarada, roles mínimos, cifrado/protección y retención limitada. Nunca repo/logs/prompts IA.
12. **Documentos:** guardar únicamente lo indispensable.
13. **Evidencias:** foto/video/audio/geolocalización/comprobantes varían por proyecto y se seleccionan al crear/editar proyecto. No existe regla global Cinépolis ni cliente-específica en core.
14. **Revisión profesional:** se realizará revisión jurídica final antes de publicación.

## Contratos/drafts asociados

- `backend/contracts/cxorbia-tenant-legal-nocode-profile-v1.json`
- `app/docs/DRAFT-CONTENIDO-LEGAL-TYA-V0.2-NOCODE-REVISION-HUMANA-20260815.md`
- base previa: `app/docs/DRAFT-CONTENIDO-LEGAL-TYA-V0.1-REVISION-HUMANA-20260815.md`

## Pendientes que sí siguen vivos

- domicilio comercial/legal público adecuado;
- elección definitiva del nombre visible al go-live, si el rebranding aún no está resuelto;
- revisión jurídica Guatemala/Honduras;
- consolidación V0.1 + V0.2 en texto único;
- SHA-256 productivo final;
- aprobación humana final;
- gate provider para materializar perfil/contenido/receipt y reanudar I3 Admin → único Shopper nuevo.

## Seguridad y efectos

Este lock no contiene datos bancarios, documento de identidad, credenciales ni secretos crudos. Tenant/provider/legal/Auth/Firestore/HR/Storage/Rules/Make/Gemini/pagos writes `0`; aceptación `0`; deploy `0`; merge=false; producción=false.

**GO-LIVE 35% completado / 65% pendiente; I3 0/25 hasta cierre integral.**
