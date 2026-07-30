# RESUMEN-PARA-CLAUDE.md

**Última actualización:** 2026-07-30  
**Estado vivo:** `CORTE6_AUTH_RBAC_READONLY_RECONCILED__BACKEND_FIX_PREPARED__NO_FRONTEND_CANDIDATE_REQUIRED__NO_PRODUCTION`

## 1. No reabrir
- Corte 3 está FROZEN/APROBADO sobre `CXORBIA-TYA-CORTE3-V182-20260729`.
- R17N FINAL DEV ya materializó 1,406/1,406 escrituras y verificó 1,406/1,406 readback; no repetir.
- P0 Corte 5 proyecto/periodo ya fue corregido en backend; re-smoke PASS con 14 periodos/616 visitas y `currentPeriodId=2026-07`.
- No crear nueva candidata, rama, PR, Firebase ni Hosting por rutina.

## 2. Estado backend actual
Destino canónico:
- Firebase DEV: `cxorbia-backend-dev`.
- Hosting DEV existente: `https://cxorbia-backend-dev.web.app`.
- Hosting público final futuro: `tya-plataforma`.

Corte 6 demostró que el bloqueo de visual real no es frontend sino Auth/RBAC:
- 17 usuarios Auth activos con password.
- 7 operadores ya cumplen reglas actuales.
- 2 clientes TyA: 0 tienen scope canónico `cinepolis`.
- 4 shoppers TyA: 0 tienen scope canónico; 3 tienen `shopperId` que coincide exactamente con perfil Firestore y son elegibles para corrección segura.
- scopes viejos observados: `tya` / `tya-piloto`.

No se ejecutaron Auth writes ni Rules/Hosting deploy durante el diagnóstico.

## 3. Backend preparado — Claude NO debe replicarlo en UI
Se preparó en backend/core:
- `app/core/backend-browser-auth.js`: login Firebase real, sesión temporal, claims como autoridad.
- `app/index-backend-dev.html`: carga el gate Auth solo en el entrypoint DEV.
- `app/core/backend-config-preview-dev.js`: elimina credencial DEV persistida/fallback.
- `app/core/backend-firebase.js`: queries acotadas por principal autenticado para operador/cliente/shopper.
- `firestore.rules`: compatibilidad `status` canónico / `estado` legacy para visita disponible shopper; aún no desplegada.

No se modificó `app/index.html` ni `app/modules/*`.

## 4. Regla frontend obligatoria
El selector visible de rol NO es autenticación y no debe presentarse como seguridad real.

Cuando el backend Auth quede desplegado y se haga smoke:
- si todo renderiza correctamente, Claude no tiene tarea;
- si aparece una diferencia reproducible, documentar archivo/módulo/flujo exacto y solo entonces generar correctiva frontend;
- no mover lógica de Auth/claims/Firestore a módulos UI.

## 5. Validaciones visuales post-Auth que interesan a Claude
Solo después del Hosting DEV ya autorizado:
1. Admin/Operativo entra y ve proyecto/periodo/histórico correctos.
2. Cliente entra solo a proyecto autorizado.
3. Shopper entra con su identidad real, ve su historial y visitas disponibles autorizadas.
4. El shopper sin perfil exacto NO recibe acceso ampliado por inferencia.
5. Selector proyecto/periodo no regresa a modelo pre-canónico.
6. Academia y manuales siguen accesibles según rol.
7. No aparece copy técnico de `source_safe`, claims, provider o IDs internos en UI normal.

## 6. Pendientes frontend P1/P2 preservados
No bloquean Auth ni la salida operativa inmediata:
- PDF: gráfica ausente en impresión/exportación.
- Excel: formato básico/no final.
- exportaciones/reportKit fuera de Dashboard necesitan consolidación.
- copy de fuentes/readiness debe seguir siendo humano y no técnico.

## 7. Academia/manuales
El siguiente contenido debe reflejarse cuando se actualicen cursos/manuales:
- elegir rol no equivale a autenticar identidad;
- el acceso real depende de Firebase Auth + claims;
- tenant/proyecto limitan qué puede ver cada persona;
- shopper requiere vínculo exacto con `shopperId`;
- visita disponible se muestra solo si la regla lo permite;
- conflicto de identidad/permisos pasa a revisión, nunca a asignación silenciosa.

## 8. Agosto
La fuente materializada llega hasta julio. `Agosto HN` está HOLD por inconsistencia país/tab. Esto es backend/fuente, no frontend. Después del smoke Auth se resolverá la fuente y se materializará solo el delta de agosto.

## 9. Estado seguro
PR #7 draft/open/no merge. Auth writes=0; Rules deploy=0; Hosting deploy=0 en Corte 6; Firestore data writes=0; producción=false. La autorización previa del mismo Hosting DEV sigue reservada 0/1 y no debe sustituirse por otro Hosting.
