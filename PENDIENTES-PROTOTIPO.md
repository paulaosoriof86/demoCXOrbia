# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_HUMAN_VISUAL_P0_PROVEN__CANONICAL_DOMAIN_FIX_CODE_PASS__LIVE_HR_ROW_AUDIT_PASS__PENDING_DEV_DEPLOY__NO_PRODUCTION`

## 1. Cerrado / no reabrir
- Corte1/2A/3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS.
- HR live/auto-month PASS.
- Perfil protegido Firestore120 docs/329 campos WRITE+READBACK PASS.
- Finanzas/pagos canónicos source-safe preservados.

## 2. P0 humano abierto
El Hosting DEV actual mantiene regresiones visibles:
- KPIs y fases no comparten estado;
- comparativo histórico vacío;
- actualización mueve contenido/sidebar;
- shoppers divididos y conteos 210/219;
- perfiles falsamente completos y sin credenciales/WA/histórico/certificación;
- portal Shopper e información financiera incompletos;
- periodo mostrado y contenido desincronizados.

El remote smoke previo se reclasifica como asset/idempotence PASS, no como cierre funcional.

## 3. Root fix preparado en GitHub
- composer canónico v2;
- semántica de evidencia histórica vs estado accionable;
- watcher por firma de contenido y scroll real;
- bridge DEV de consistencia transversal;
- gate de dominio y auditoría read-only sobre las616 visitas;
- index DEV conectado al runtime v2.

No está desplegado. No se modificó `/app/modules/*` ni `/app/core/*`.

## 4. HR viva verificada
PASS read-only:
-14 periodos/616 visitas/208 shoppers;
-JUL44 = GT34+HN10;
-realizadas40;
-cuestionario38;
-submitidas33;
-fuera de rango accionable1;
-evidencia histórica fuera de rango7;
-duplicate visit/shopper keys0.

## 5. Pendientes de cierre Corte6
1. Ejecutar gates estáticos finales sobre HEAD vigente.
2. Solicitar autorización fresca solo para1 Hosting DEV existente.
3. Publicar sin Cloud Run/data/provider writes.
4. Remote smoke semántico: igualdad de KPIs/fases/detalles/periodos/identidad/finanzas.
5. Human visual:3 ciclos refresh/focus sin saltos ni cambios transitorios.
6. Validar Admin: Dashboard, Visitas, Shoppers, certificación, histórico, Finanzas, Movimientos y Liquidaciones.
7. Validar Shopper: Mi Perfil, Mis Visitas activas/históricas y Beneficios.
8. Solo PASS completo congela Corte6.

## 6. Identidad y datos pendientes
- perfiles sin crosswalk exacto permanecen en review queue;
- no dedupe por nombre/teléfono/email;
- username/password pueden derivarse en lectura para identidad exacta mediante patrón configurable;
- WhatsApp exige fuente real;
- persistir/complementar shoppers, contacto, credenciales, certificaciones o Auth requiere un bloque posterior de write plan+dry-run+autorización específica.

## 7. Pendientes Claude/prototipo
- máquina de estados única transversal;
- comparativo histórico real;
- refresh sin desplazamiento;
- identity review queue separada del listado operacional;
- perfil completo por campos reales;
- certificación visible a Admin;
- histórico completo en portal Shopper;
- periodo canónico único en Finanzas;
- Movimientos/Liquidaciones/Beneficios desde la misma fuente;
- gate de release que compare tile, drill, listado y portal.

## 8. P1/P2 preservados
- PDF con gráficas;
- Excel con formato;
- exportaciones fuera del Dashboard;
- copy/readiness.

No se pierden, pero no desplazan el P0 actual.

## 9. Agosto
HOLD hasta `FREEZE C6`. Después se identifica/reconcilia la fuente plataforma-origin de agosto y se materializa únicamente el delta autorizado; nunca se repite el histórico1,406.

## 10. Estado seguro
Bloque correctivo actual: Hosting0; Cloud Run0; Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos writes0; merge=false; producción=false.
