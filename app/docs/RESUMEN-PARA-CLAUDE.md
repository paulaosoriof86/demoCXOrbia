# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-01  
**Estado vivo:** `P0_DATOS_DIRECT_ROLE_ROOT_FIX_APPLIED_PENDING_CUMULATIVE_GATES_AND_SINGLE_DEV_REDEPLOY__NO_PRODUCTION`

## 1. No reabrir
- Repo/rama/PR: `paulaosoriof86/demoCXOrbia` / `docs-tya-v6-v71-audit` / PR #7 draft/open/no merge.
- Corte 3 FROZEN; R17N 1,406/1,406.
- Baseline histórica: 14 periodos/616 visitas/208 shoppers.
- Producción intacta.

## 2. Regresión P0 confirmada
El build anterior restauró los botones de rol, pero vació el modelo después de entrar. El PASS anterior fue parcial porque no verificó datos posteriores al clic. No debe reutilizarse como evidencia de Corte 6.

## 3. Contrato corregido que Claude debe preservar
### Carril humano
- Administración / Coordinación, Portal Cliente y Shopper visibles.
- Sin Usuario/Contraseña técnica.
- `source-safe-human-visual`.
- HR sigue siendo autoridad de periodos, visitas, shoppers y estados.
- Baseline mínima 14/616/208; nunca shell vacío mientras esa baseline exista.

### Carril técnico
- `protected-technical-e2e` solo con gate privado explícito.
- Firebase Auth/claims/Rules validan identidad y alcance.
- Nunca redefine la UX humana ni reemplaza HR.

## 4. Prevención reusable
- Las URLs humanas no pueden contener `cxProtectedRuntime`.
- El watcher solo se desactiva en E2E técnico explícito.
- Si el overlay protegido no está disponible, se conserva HR source-safe y se muestra warning; no se bloquea ni se vacía.
- Ningún smoke puede aprobar por mostrar la carcasa. Debe verificar datos canónicos después de entrar y tras tres recargas.

## 5. Regla frontend
Claude no debe:
- reintroducir Auth técnica visible;
- mezclar los dos carriles;
- vaciar `CX.data` mientras exista baseline HR válida;
- reconstruir estados/KPIs/identidad/finanzas en módulos;
- tocar adapters/gates backend protegidos.

No se modificaron `app/modules/*`.

## 6. Gate pendiente
PASS requerido local y remoto:
- entrada directa;
- 14 periodos;
- 616 visitas;
- 208 shoppers;
- proyecto y periodo activos;
- datasource listo;
- cero “Sin proyectos disponibles”;
- tres recargas sin variación;
- Auth técnico staff/shopper aislado;
- cero writes.

## 7. Academia/manuales
Actualizar la formación para distinguir selección de perfil, Auth real, autorización por claims, fuente operacional y gate de contenido posterior al login. Nunca enseñar que “entró al shell” equivale a PASS.

## 8. Siguiente bloque
Solo después de PASS remoto y validación humana: freeze C6. Luego fuente exacta agosto → disponibles → postulaciones → gate multirol → cutover autorizado.
