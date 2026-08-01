# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-31  
**Estado vivo:** `C6_HUMAN_VISUAL_P0_PROVEN__CANONICAL_DOMAIN_AND_FINANCE_FIX_CODE_PASS__LIVE_HR_ROW_AUDIT_PASS__PENDING_DEV_DEPLOY__NO_PRODUCTION`

## 1. Cerrado / no reabrir
- Corte1/2A/3 FROZEN; R17N1,406/1,406 no repetir.
- Corte5 cinepolis/14 periodos/616 visitas/current2026-07 PASS.
- Auth91/91, claims5/5, Rules PASS.
- HR live/auto-month PASS.
- Perfil protegido Firestore120 docs/329 campos WRITE+READBACK PASS.
- Finanzas/pagos canónicos source-safe preservados.

## 2. P0 humano abierto en el Hosting actual
- KPIs y fases no comparten estado;
- comparativo histórico vacío;
- actualización mueve contenido/sidebar;
- shoppers divididos y conteos210/219;
- perfiles falsamente completos y sin credenciales/WA/histórico/certificación;
- portal Shopper e información financiera incompletos;
- periodo mostrado y contenido desincronizados;
-33 submitidas omitidas de Liquidaciones.

El remote smoke previo es asset/idempotence PASS, no cierre funcional.

## 3. Root fix preparado en GitHub
- composer canónico v2;
- semántica evidencia histórica vs estado accionable;
- watcher por firma de contenido y scroll real;
- bridge DEV transversal;
- finance/liquidation read model v2;
- gates de dominio, finanzas y auditoría read-only sobre616 visitas;
- index DEV conectado al runtime v2.

No está desplegado. `/app/modules/*` y `/app/core/*` intactos.

## 4. Gates PASS
La evidencia v4 confirma:
- `PASS_C6_CANONICAL_DOMAIN_CONSISTENCY`;
- `PASS_C6_CANONICAL_FINANCE_LIQUIDATION_COMPLETENESS`;
- `PASS_C6_LIVE_HR_ROW_LEVEL_CANONICAL_STATE`.

HR viva:
-14 periodos/616 visitas/208 shoppers;
-JUL44=GT34+HN10;
-realizadas40;
-cuestionario38;
-submitidas33;
-liquidationCandidates33;
-fuera de rango accionable1;
-evidencia histórica7;
-duplicate keys0.

Finanzas representativas:
-40 realizadas presentes en Liquidaciones;
-33 submitidas no omitidas;
-5 pendientes de submit;
-2 pendientes de cuestionario;
-pago/fuente exacta preservados;
-pagos deshabilitados.

## 5. Pendientes de cierre Corte6
1. Autorización fresca para exactamente1 Hosting DEV existente.
2. Publicar sin Cloud Run/data/provider writes.
3. Remote smoke semántico: igualdad de KPIs/fases/detalles/periodos/identidad/finanzas.
4. Human visual:3 ciclos refresh/focus sin saltos ni cambios transitorios.
5. Validar Admin: Dashboard, Visitas, Shoppers, certificación, histórico, Finanzas, Movimientos y Liquidaciones.
6. Validar Shopper: Mi Perfil, Mis Visitas activas/históricas y Beneficios.
7. Solo PASS completo congela Corte6.

## 6. Identidad y datos pendientes
- perfiles sin crosswalk exacto permanecen en review queue;
- no dedupe por nombre/teléfono/email;
- username/password pueden derivarse en lectura para identidad exacta;
- WhatsApp exige fuente real;
- persistir/complementar shoppers, contacto, credenciales, certificaciones o Auth requiere write plan+dry-run+autorización específica.

## 7. Pendientes Claude/prototipo
- máquina de estados única transversal;
- comparativo histórico real;
- refresh sin desplazamiento;
- identity review queue separada;
- perfil completo por campos reales;
- certificación visible a Admin;
- histórico completo en portal Shopper;
- periodo canónico único en Finanzas;
- Liquidaciones completas, incluyendo estados posteriores;
- Movimientos/Liquidaciones/Beneficios desde la misma fuente;
- gate que compare tile, drill, listado, portal y finanzas.

## 8. P1/P2 preservados
- PDF con gráficas;
- Excel con formato;
- exportaciones fuera del Dashboard;
- copy/readiness.

## 9. Agosto
HOLD hasta `FREEZE C6`. Después se identifica/reconcilia agosto plataforma-origin y se materializa únicamente el delta autorizado; nunca se repite histórico1,406.

## 10. Estado seguro
Bloque correctivo: Hosting0; Cloud Run0; Firestore/Auth/Rules/Storage/HR/Make/Gemini/pagos writes0; merge=false; producción=false.
