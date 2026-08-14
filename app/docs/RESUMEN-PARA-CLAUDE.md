# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-08-13 19:07 -06:00
**Estado:** `SHOPPER_P0_POSTDEPLOY_ACCEPTANCE_REJECTED__BACKEND_IDENTITY_CONTRACT_SPLIT__NO_UI_REDESIGN`

La aceptación humana post-deploy volvió a fallar. **No es un defecto que Claude deba resolver parcheando UI.** La auditoría forense backend demostró una ruptura entre el contrato de identidad usado para activar Firebase Auth y el contrato de aliases exactos usado después por el compositor HR del navegador.

El patrón reproducido es: Firestore autenticado encuentra el perfil y país del Shopper; cuando llega HR viva (15 periodos / 660 visitas), el perfil deja de tener crosswalk operacional y `Mi Perfil` muestra que la identidad no está vinculada. El compositor excluye perfiles protegidos sin relación exacta como `no_exact_hr_crosswalk`.

Además, el entrypoint humano canónico todavía carga antes de Auth `data/tya-hr-source-safe-periods.js` (payload empaquetado 13-jul) y `core/tya-phase-a-source-safe-preview.js`, que escribe ese snapshot en `CX.data`. Esto explica las cifras viejas 616 / julio 2026 visibles en login.

### De dónde viene la regresión

El source lock de la candidata frontend preserva el prototipo y sus módulos, pero la capa Firebase Auth/claims/crosswalk fue construida posteriormente en backend. La activación Auth de agosto resolvió identidades con un universo técnico más amplio que el compositor browser actual. Por tanto no corresponde atribuir este P0 a una reescritura del módulo Shopper de la candidata; es una incompatibilidad introducida en la integración backend posterior.

### Para Claude

- **No rediseñar módulos ni crear candidata.**
- No hardcodear TyA/Cinépolis como solución general.
- No unir identidades por nombre, correo, teléfono ni similitud.
- Preservar el prototipo y sus rutas por rol.
- El backend debe entregar una identidad canónica ya resuelta mediante un contrato técnico reusable tenant/project.
- El snapshot source-safe empaquetado debe quedar solo en laboratorio/preview explícito; no debe sembrar `CX.data` en el entrypoint humano autenticado.
- Academia/Certificación no se considera aceptada hasta que el Shopper real recupere identidad, histórico y alcance correctos.

Evidencia: `app/docs/evidence/p0-shopper-postdeploy-forensic-rootcause-20260813.json`.

Pendiente backend: reparación source-only del contrato único de identidad y gate E2E con Shopper Firebase real. Cero deploy/proveedor/writes por ahora. Producción y merge bloqueados.
