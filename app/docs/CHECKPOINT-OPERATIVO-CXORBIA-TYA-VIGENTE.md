# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-01  
**Estado:** `C6_UNIFIED_CUMULATIVE_RUNTIME_ROOT_FIX_CODE_APPLIED_PENDING_READONLY_RUNTIME_GATES__NO_DEPLOY_NO_PRODUCTION`

## 1. Estado protegido

- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR #7 draft/open/no merge.
- Corte 3 FROZEN; R17N 1,406/1,406 no repetir.
- HR viva actual: 14 periodos, junio 2025–julio 2026, 616 visitas y 208 shoppers.
- Agosto 2026 todavía no existe en la HR.
- Producción intacta.

Los conteos actuales son una fotografía de la revisión previa a agosto. No se usan como invariantes permanentes ni como límite para revisiones futuras.

## 2. Correcciones de criterio prevalentes

Queda prohibido usar números de cortes anteriores como verdad operacional. Los periodos históricos permanecen, pero sus indicadores se leen de la HR viva y de su revisión vigente.

El modelo financiero también es por proyecto:

- directo/local: existe facturación local y las regalías solo aplican si se configuran;
- delegado: no existe facturación local del proyecto, regalías 0 y compensación por comisión de coordinación compartida.

Cinépolis es delegado. El monto de la comisión, sus participantes y porcentajes no se inventan.

## 3. P0 demostrado

La visual humana publicada no consumía la baseline acumulativa:

- rol directo sin Auth real;
- Shopper sin identidad;
- julio mezclado con agosto por reloj;
- fases distintas a KPIs;
- comparativo sin todos los periodos;
- perfiles/certificaciones sin overlay;
- duplicación de identidades;
- Cliente y Finanzas degradados.

Causa: separación artificial entre carril humano source-safe y carril protegido, más adapters funcionales condicionados por token oculto.

Se añadió una contradicción financiera posterior al documentar Cinépolis como directo con regalías. Esa contradicción fue corregida en código, evidencia y fuentes vigentes.

## 4. Root fix aplicado al código

- Entrada humana única `authenticated-human-canonical`.
- Login real integrado del producto.
- HR live authority + Firestore exact overlay.
- Override directo de rol eliminado del índice.
- Bridge visual oculto eliminado del índice.
- Dominio/Shopper/Finanzas canónicos activos en la URL normal.
- `tya-protected-auth-hr-authority-bridge-v2.js` conserva dinámicamente todos los periodos y visitas.
- `tya-project-financial-model-contract-v1.js`:
  - normaliza proyectos existentes;
  - preserva la selección directo/delegado en nuevas altas;
  - bloquea regalías en delegados;
  - fuerza Cinépolis como delegado;
  - deja comisión y reparto como configuración real pendiente, sin inventar datos.
- `tya-phase-a-source-safe-preview.js` ahora configura Cinépolis como:
  - delegado;
  - Q60 GT / L200 HN al shopper;
  - regalías 0;
  - comisión de coordinación compartida.
- Adapter unificado conserva login Cliente, comparativo completo y metadata financiera corregida.

El wizard ya contenía la selección directo/delegado y no fue rediseñado.

## 5. Validación alcanzada sin proveedor

Comprobado por revisión directa del HEAD en GitHub:

- adapter financiero creado y cargado antes del motor de Finanzas;
- configuración Cinépolis corregida;
- metadata runtime corregida;
- gate estático actualizado;
- cálculo existente de Finanzas aplica ISR/regalías solo cuando `modelo==='directo'`;
- cero deploys y provider writes en este bloque.

No se afirma todavía ejecución del gate Node, runtime/browser PASS ni validación remota. El entorno disponible no tiene checkout local autenticado ni workflow ejecutado para el HEAD actual.

## 6. Gate inmediato

1. ejecutar gate estático acumulativo en checkout del HEAD vivo;
2. runtime local/read-only;
3. login real staff, cliente y shopper;
4. lectura viva de todos los periodos detectados;
5. igualdad KPI/fases/drill;
6. comparativo histórico completo;
7. identidad, WA, credenciales, certificación e histórico;
8. Portal Cliente completo;
9. Finanzas con fuente canónica y modelo de proyecto correcto;
10. comprobar Cinépolis delegado, regalías 0 y comisión sin valores inventados;
11. comprobar creación directo/delegado;
12. tres recargas y nueva pestaña;
13. evidencia PASS/FAIL.

## 7. Restricciones

No deploy, Auth/Firestore/Rules/HR writes, merge, agosto ni producción hasta PASS y autorización fresca específica.
