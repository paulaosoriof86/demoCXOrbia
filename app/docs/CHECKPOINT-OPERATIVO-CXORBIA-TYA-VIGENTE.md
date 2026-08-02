# CHECKPOINT OPERATIVO CXORBIA TyA — VIGENTE

**Fecha:** 2026-08-01  
**Estado:** `C6_UNIFIED_CUMULATIVE_RUNTIME_ROOT_FIX_AND_PROJECT_FINANCE_GUARD_APPLIED_PENDING_READONLY_RUNTIME_GATES__NO_DEPLOY_NO_PRODUCTION`

## 1. Estado protegido

- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR #7 draft/open/no merge.
- Corte 3 FROZEN; R17N 1,406/1,406 no repetir.
- HR viva actual: 14 periodos, junio 2025–julio 2026, 616 visitas y 208 shoppers.
- Agosto 2026 todavía no existe en la HR.
- Producción intacta.

Los conteos actuales son una fotografía de la revisión previa a agosto. No se usan como invariantes permanentes ni como límite para revisiones futuras.

## 2. Correcciones de criterio prevalentes

Queda prohibido usar números de cortes anteriores como verdad operacional. Los periodos históricos permanecen, pero sus indicadores se leen de la HR viva y de su revisión vigente.

El modelo financiero también pertenece a la configuración de cada proyecto:

- directo/local: existe facturación local y las regalías solo aplican si se configuran;
- delegado: no existe facturación local del proyecto, regalías 0 y compensación por comisión de coordinación compartida;
- regional: distribución regional configurable, sin regalías locales por defecto.

Cinépolis es delegado porque su configuración vigente así lo declara. No existe una regla global por nombre. El monto de la comisión, sus participantes y porcentajes no se inventan.

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

Se detectaron y corrigieron dos regresiones financieras adicionales:

1. Cinépolis documentado/configurado temporalmente como directo con regalías;
2. fallback de `honRecibe` que podía convertir el honorario del shopper en ingreso delegado.

## 4. Root fix aplicado al código

- Entrada humana única `authenticated-human-canonical`.
- Login real integrado del producto.
- HR live authority + Firestore exact overlay.
- Dominio/Shopper/Finanzas canónicos activos en la URL normal.
- `tya-protected-auth-hr-authority-bridge-v2.js` conserva dinámicamente todos los periodos y visitas.
- `tya-project-financial-model-contract-v1.js`:
  - normaliza proyectos existentes;
  - soporta directo, delegado y regional;
  - preserva el modelo seleccionado en nuevas altas;
  - bloquea regalías en modelos no locales;
  - clasifica por projectConfig, no por nombre;
  - deja comisión y reparto como configuración real, sin inventar datos.
- `tya-delegated-coordination-finance-guard-v1.js`:
  - elimina el fallback honorario Shopper → ingreso;
  - usa únicamente comisión configurada;
  - mantiene obligaciones al shopper separadas;
  - calcula margen solo con comisión y distribución exactas;
  - marca revisión cuando falta fuente.
- `tya-phase-a-source-safe-preview.js` declara Cinépolis delegado, Q60/L200 al shopper y regalías 0.
- Adapter unificado conserva login Cliente, comparativo completo y metadata financiera corregida.

El wizard se preservó. Ya contiene directo/delegado; la opción Regional y el copy correcto de Finanzas quedaron documentados para Claude por archivo.

## 5. Validación alcanzada sin proveedor

Comprobado por revisión directa del HEAD en GitHub:

- contratos financieros creados;
- orden de carga correcto;
- configuración Cinépolis corregida;
- cero hardcode por nombre en el contrato reusable;
- guard contra ingreso delegado falso cargado antes de módulos;
- gate estático actualizado;
- cálculo base de ISR/regalías condicionado a `modelo==='directo'`;
- cero deploys y provider writes.

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
11. comprobar que honorario Shopper nunca se use como ingreso delegado;
12. comprobar margen solo con comisión/reparto exactos;
13. comprobar creación directo/delegado y soporte backend regional;
14. tres recargas y nueva pestaña;
15. evidencia PASS/FAIL.

## 7. Restricciones

No deploy, Auth/Firestore/Rules/HR writes, merge, agosto ni producción hasta PASS y autorización fresca específica.
