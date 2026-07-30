# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-07-30  
**Estado vivo:** `CORTE3_FROZEN__CURRENT_HR_208_REFS__IDENTITY_208_OF_208_READY__R17N_FINAL_1406_NO_EXECUTE__NO_PRODUCTION`

Este archivo registra únicamente pendientes frontend reales y dependencias backend que condicionan cuándo Claude debe intervenir.

## 1. No reabrir
- M1 / Corte 1 / Corte 2A: FROZEN/APROBADO.
- Corte 3: FROZEN sobre `CXORBIA-TYA-CORTE3-V182-20260729`.
- No crear V183/R33.
- Finanzas mayo/junio congeladas salvo fuente nueva demostrable.

## 2. Arquitectura vigente
- `cxorbia-backend-dev` = backend DEV canónico.
- `tya-plataforma` = legacy a retirar + Hosting/URL pública final.
- sandbox C4 = no materializar.
- no nueva base Firebase.

## 3. Identidad shopper
La plataforma final debe mostrar identidad real a roles autorizados. Hash/`Shopper protegido` solo en evidencia técnica. Nombre no es llave única de automerge.

## 4. Dependencia backend actual
La brecha de identidad quedó resuelta a nivel plan:
- HR actual hasta julio: 208 refs;
- 201 → existing canonical;
- 2 → legacy profile create;
- 5 → HR-current profile create;
- 0 HOLD de identidad actual;
- 616/616 visitas listas;
- 572/572 controles de liquidación listos.

R17N FINAL no-execute: 1,406 writes potenciales exactos, todavía 0 autorizados/ejecutados.

HOLD backend fuera del próximo write: tenant1, 22 existing updates, 7 legacy holds, 1 certification hold, Agosto HN, deletes/pagos/Auth/Storage/HR writes/deploy/producción.

## 5. Próxima intervención Claude
Ninguna por rutina.

Después de materialización y smoke, validar:
1. Admin/Operativo ve identidad real autorizada.
2. Shopper ve su perfil/historial permitido.
3. No quedan placeholders/hash cuando existe perfil real.
4. No hay duplicados entre referencia HR y perfil.
5. Carryover de certificación queda en la persona correcta.
6. Proyecto padre `cinepolis` y periodos se mantienen.

Solo abrir frontend antes si aparece P0 reproducible.

## 6. Backlog P1/P2 no bloqueante
- PDF: gráfica ausente al imprimir/exportar.
- Excel: formato básico.
- `reportKit`: consolidación transversal.
- copy de fuentes/readiness específico.

## 7. Academia/manuales
- fuente viva vs snapshot;
- identidad real vs sanitización técnica;
- referencia HR vs perfil vs Auth;
- stable-key/crosswalk antes de merge;
- conflicto a review;
- carryover evita recertificación innecesaria.

## 8. Estado seguro
PR #7 draft/open/no merge. Data writes=0; deploy=0; producción=false; imports/pagos/lotes/Make/Gemini=0.
