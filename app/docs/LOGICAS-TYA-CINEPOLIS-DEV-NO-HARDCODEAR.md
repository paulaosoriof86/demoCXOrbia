# LÓGICAS TYA / CINÉPOLIS DEV — NO HARDCODEAR

Fecha: 2026-07-02

## Principio

TyA/Cinépolis es tenant/proyecto DEV para validar reglas reales del backend. El prototipo CXOrbia debe seguir siendo SaaS comercializable. Las reglas útiles deben quedar como configuración por tenant, proyecto, periodo, país, rol, módulo, plan o feature flag.

## Reglas TyA/Cinépolis a preservar como configuración

1. Q1 usa submitido Q2 anterior.
2. Q2 usa submitido Q1.
3. Q2 restringe 16-fin de mes.
4. Si no hay submitido, usar completado +2 o realizada +3 y luego estimación.
5. `P x Agendar` solo con shopper asignado.
6. `P x visita previa` en Q1 si no existe Q2 previa.
7. `Sin submitir` = cuestionario realizado presente y sin fecha submitido.
8. Fechas futuras no deben permitirse para realizada/cuestionario.
9. Combo JUMBO y reglas de evidencia deben conservarse cuando el proyecto/tenant lo configure.
10. Paula/TyA GT-HN es admin, no shopper.
11. GT/HN deben separarse por país, moneda, honorarios, reembolsos y reportes.
12. Autorización fuera de rango debe registrar quién autorizó, motivo, fecha y efecto en shopper score.
13. La penalización del shopper depende de responsabilidad: shopper, TyA, cliente, local, fuerza mayor u otra causa.
14. Postulaciones, reservas, asignaciones y HR deben sincronizarse sin duplicar.
15. Certificación del shopper debe ser prerrequisito configurable por proyecto.
16. Si el shopper ya está certificado y vigente para el proyecto, no debe repetirse la certificación.
17. Migración histórica debe vincular `shopperId`, `visitId`, `tenantId`, `projectId`, `periodId`, país, estado y fechas.
18. No deduplicar shoppers por nombre; usar documento, email, id y alias histórico.

## Cómo evitar contaminar el producto

- No escribir Cinépolis/TyA como lógica global.
- Usar demo genérico para comercialización.
- Usar fixtures/config para TyA DEV.
- Mantener selector claro entre demo comercial y tenant DEV.
- Documentar reglas específicas para backend/configuración.

## Pendiente backend asociado

El adapter Firestore debe filtrar antes de renderizar por tenant/proyecto/periodo/país/rol. No debe aplicar scope después del render porque eso puede generar flicker, datos mezclados y riesgo multi-tenant.