# CAMBIOS BACKEND — C6 P0 postdeploy read-only revalidation

**Fecha:** 2026-08-01  
**Estado inicial:** `PREPARED_DISABLED_PENDING_CONTROLLED_TRIGGER`  
**Rama:** `docs-tya-v6-v71-audit`  
**PR:** #7 draft/open/no merge

## 1. Hallazgo que origina el bloque

El root fix v11 y los gates locales acumulativos permitieron ejecutar el único redeploy autorizado del Hosting DEV existente. La ejecución llegó hasta el E2E remoto de usuarios reales y falló durante `shopper page.reload` por timeout de navegación esperando `domcontentloaded`.

La evidencia demuestra que:

- el deploy autorizado fue ejecutado exactamente una vez;
- la autorización one-shot quedó consumida;
- no hubo writes de Auth, Firestore, Rules, Cloud Run, Storage, HR ni producción;
- la falla ocurrió después del deploy, en el harness técnico remoto;
- no existe autorización para un segundo deploy.

## 2. Corrección focalizada

Se agregó un gate de revalidación estrictamente read-only que no cambia el runtime publicado y no realiza deploy.

### Archivos creados

- `backend/config/corte6-postdeploy-readonly-revalidation-request.json`
- `tools/qa/tya-c6-postdeploy-real-users-revalidation.mjs`
- `.github/workflows/cxorbia-corte6-postdeploy-readonly-revalidation.yml`
- este documento.

### Comportamiento del gate

1. Verifica destino, rama, PR, proyecto Firebase, Hosting y lineage del root fix desplegado.
2. Confirma que no hubo cambios posteriores en archivos runtime de `app/`.
3. Compara los assets publicados contra la rama viva.
4. Repite entrada humana acumulativa con 14 periodos, 616 visitas, 208 shoppers y tres recargas.
5. Selecciona credenciales existentes de forma privada y source-safe.
6. Revalida staff y shopper reales, incluyendo reload y nueva pestaña.
7. Comprueba que el reload realmente creó un documento nuevo mediante un probe efímero de contexto JavaScript.
8. Mantiene como condición funcional obligatoria Auth restaurado, HR 616, shoppers 208, autoridad HR, historial propio del shopper y scopes correctos.
9. Persiste únicamente evidencia sanitizada.

## 3. Motivo técnico del ajuste al harness

El fallo anterior se produjo esperando `domcontentloaded`, aunque el log registró que la navegación ya había llegado al URL técnico. El nuevo gate espera primero el compromiso real del documento (`commit`) y después valida la restauración funcional completa. Esto no relaja el gate: el PASS sigue exigiendo Auth, dataset canónico, autoridad HR, historial propio, reload real y nueva pestaña.

## 4. Límites

- Hosting deploys: 0.
- Auth user creates/writes/password changes: 0.
- Firestore/Rules/Cloud Run/Storage/HR/Make/Gemini/pagos/Reservas writes: 0.
- Nuevos Firebase/Hosting: 0.
- Merge: false.
- Producción: false.
- Sin modificaciones de `app/modules/*`, `app/core/*` ni runtime publicado.

## 5. Clasificación

- **Reusable CXOrbia:** gate postdeploy read-only, prueba de reload por cambio real de documento y separación entre timeout del harness y estado funcional.
- **Exclusivo TyA:** invariantes 14/616/208, proyecto Cinépolis y usuario shopper real de prueba.
- **Claude/prototipo:** sin cambio frontend; debe conservar la baseline acumulativa única.
- **Academia:** registrar que un PASS técnico requiere continuidad de sesión y datos después de reload/nueva pestaña.
- **Sin impacto Claude:** workflow, request controlado y evidencia sanitizada.

## 6. Siguiente decisión

- Si el gate pasa: actualizar índice, checkpoint, PR #7 y documentación acumulativa; después solicitar únicamente validación humana del mismo build ya publicado.
- Si falla: documentar el estado funcional exacto y corregir solo el punto reproducible, sin segundo deploy ni nueva candidata.
