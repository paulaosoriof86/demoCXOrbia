# 00 - ÍNDICE DE FUENTES VIGENTES CXORBIA TyA

**Fecha:** 2026-08-03  
**Estado:** ACTIVO Y OBLIGATORIO  
**Estado vivo:** `PHASE_A_COMPLETE_RECONSTRUCTION__24_EXACT_OR_JUSTIFIED_BLOB_DECISIONS__REMAINING_COMPOSITION_RECOVERY_ACTIVE`

## 0. Lock prevalente

La revisión fragmentada A+B queda anulada. La única candidata válida para nueva revisión humana será la composición completa de Phase A.

Repo/rama/PR:

- `paulaosoriof86/demoCXOrbia`;
- `docs-tya-v6-v71-audit`;
- PR #7 draft/open/no merge.

No crear candidata, shell, rama, PR, Firebase, Hosting o metodología paralela.

## 1. Leer primero y en este orden

1. `ADDENDUM-MAESTRO-CORRECCION-RECONSTRUCCION-PHASE-A-COMPLETA-20260803.md`;
2. `CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `MATRIZ-CANDIDATA-ACUMULATIVA-PHASE-A-COMPLETA-20260803.md`;
4. `MANIFEST-PHASE-A-COMPLETA-INVENTARIO-VIVO-20260803.json`;
5. `COMPARACION-SHAS-APROBADOS-PHASE-A-BLOQUE1-M1-CORTE2A-20260803.md`;
6. `COMPARACION-SHAS-PHASE-A-BLOQUE2-C6-DEPLOY-TECNICO-20260803.md`;
7. `COMPARACION-SHAS-PHASE-A-BLOQUE3-V182-CORTE3-Y-C6-20260803.md`;
8. `CAMBIOS-BACKEND-ADDENDUM-CORRECCION-RECONSTRUCCION-PHASE-A-COMPLETA-20260803.md`;
9. `PROTOCOLO-VALIDACION-VISUAL-ACUMULATIVA-POR-CHECKPOINTS-20260802.md` corregido;
10. `PHASE-A-PLAN-LOCK-NO-DEVIATION-20260704.md`;
11. `RECONSTRUCCION-CANDIDATA-ACUMULATIVA-MATRIZ-MAESTRA.md`, solo como trazabilidad del error A+B;
12. `MANIFEST-A-B-CUMULATIVE-CANDIDATE-20260802.json`, manifest parcial superseded;
13. `RESUMEN-PARA-CLAUDE.md`;
14. `PENDIENTES-PROTOTIPO.md`;
15. `ACADEMIA-IMPACTO-RECONSTRUCCION-CANDIDATA-ACUMULATIVA-20260802.md`;
16. reglas maestras/addenda activos;
17. PR #7 y HEAD vivo.

## 2. Autoridades históricas que no se reabren

- RC Phase A smoke técnico y visual/consola PASS;
- M1/Corte 1: FROZEN/APROBADO con P1/P2 documentados;
- Corte 2A/V174: FROZEN/APROBADO;
- Corte 3/V182: `FROZEN_ACTIVE_BASELINE`;
- C6: entrada por perfiles, HR, Staff, Shopper, Cliente, Finanzas, Portal Shopper y Reservas técnicamente preservados.

Estas aprobaciones se someten a comparación de SHA y smoke antirretroceso, no a reauditoría desde cero.

## 3. Recuperación de SHAs alcanzada

### M1/Corte 2A

Ocho blobs vivos coinciden exactamente con su autoridad aprobada/frozen:

- Dashboard;
- Configuración;
- Router;
- Visitas;
- Postulaciones;
- Novedades;
- Mi Perfil/Reportes Shopper;
- Reportes Cliente.

### C6 desplegado

Trece blobs vivos coinciden con el source lock técnico desplegado, incluyendo:

- app/shell;
- Mi Día e Histórico;
- Reservas;
- Shoppers/Mis Visitas/Certificación/Cuestionario/Beneficios;
- Finanzas UI/core/liquidación;
- Portal Cliente.

### V182/Corte 3

- `app.js`, Beneficios y `layout.css`: exactos V182;
- `finanzas-core.js` y `finanzas.js`: diferencias posteriores justificadas por root fixes C6; no restaurar V182.

Resultado:

`24_UNIQUE_PRESERVE_OR_RECONCILE_DECISIONS_CLOSED__0_RESTORE_REQUIRED_SO_FAR`.

## 4. Inventario Phase A activo

El manifest de inventario vivo contiene 30 archivos de base, operación, perfiles, Finanzas, portales y Reportes.

Estado:

`INVENTORY_ONLY_APPROVED_SHA_RECOVERY_PENDING`.

No es todavía el manifest final. Un blob vivo no se convierte en aprobado sin recuperar su linaje y probar su composición.

## 5. Alcance Phase A obligatorio

- entrada/shell/contexto/navegación;
- Dashboard Operativo/hoja de ruta/Histórico/refresh;
- Visitas, ficha, Revisión, Postulaciones y Reservas;
- Shoppers y experiencia transversal por perfiles;
- Mi Día, Disponibles, Mis Visitas, Mi Perfil, cuestionario, certificaciones, documentos y beneficios;
- Finanzas completa;
- Portal Cliente y Portal Shopper;
- Reportes Admin/Cliente/Shopper y exportaciones;
- smoke multirol y nueva pestaña.

CRM Ops Leads, Clientes comerciales, Comercial y Marketing se preservan, pero no bloquean el freeze Phase A.

## 6. DEV actual

`https://cxorbia-backend-dev.web.app/index-backend-dev.html`

Clasificación:

`TECHNICAL_COMPARISON_BUILD__NOT_FINAL_PHASE_A_CANDIDATE`.

No se solicita revisión humana fragmentada. Se reutilizará solo si el manifest final demuestra que no requiere delta; si cambia `app/`, se publicará un único reemplazo autorizado.

## 7. Siguiente bloque exacto

`CERRAR AUTORIDAD DE FICHA/REVISIÓN/DOCUMENTOS/COSTOS/CLIENTE-DATA + INVENTARIAR REPORT KIT/EXPORTADORES/OVERLAYS/NAVEGACIÓN MULTIROL → MANIFEST FINAL PHASE A → GATES ACUMULATIVOS`.

## 8. Estado seguro

- archivos funcionales modificados: 0;
- deploy nuevo: 0;
- provider writes: 0;
- Make/Gemini/pagos: 0;
- merge: false;
- producción: intacta.
