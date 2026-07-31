# Academia — impacto Corte 6 perfil Shopper + protected Hosting DEV PASS

**Fecha:** 2026-07-31

## Contenido reusable para Academia
- separar fuente de perfil actual de fuentes canónicas de histórico/certificación;
- transportar PII/credenciales cifradas y descifrarlas solo en memoria;
- validar identidad por llave estable antes de cualquier write;
- usar bridges secundarios solo si son reproducibles;
- tratar nombre/teléfono/email como señales de revisión, no identidad automática;
- provider compare read-only → write-plan → autorización one-shot → drift gate → write → readback;
- separar carril source-safe del carril autenticado/protegido;
- ejecutar deploy one-shot únicamente al destino DEV existente;
- hacer smoke remoto antes de validación humana;
- mantener identidades no resolubles en HOLD;
- distinguir password legacy visible de Firebase Auth como autoridad de autenticación;
- un PASS técnico no reemplaza validación visual humana.

## Caso Corte6
Perfil:151 registros;120 exactos;31 HOLD;329 valores. Write PASS:120 documentos,118 field-change +2 marker-only, readback120/329, mismatches0.

Protected Hosting DEV: un único redeploy autorizado y consumido sobre `cxorbia-backend-dev/cxorbia-dev`. Smoke remoto confirmó protected runtime, Auth bridge, Firestore adapter, shopper scope fail-closed, profile bridge e histórico/KPI con `submitida`; source-safe por defecto permanece separado.

Durante el redeploy no hubo Firestore/Auth/Rules/Cloud Run/Storage/HR/legacy/Make/Gemini/pagos writes/deploys; producción=false; merge=false.

## Impacto en manuales/cursos/rutas
- Admin/operación: perfil completo autenticado y diferencia entre password legacy visible y login Auth.
- Shopper: identidad por custom claims + shopperId.
- Backend: encrypted handoff → compare → write/readback → protected deploy → smoke remoto → validación humana.
- Seguridad: source-safe no expone perfil; protected runtime sí entrega información según RBAC.
- Migración:31 registros sin identidad exacta pasan a alta/conciliación explícita.

## Siguiente hito didáctico
Validación humana Admin + Shopper. Si PASS, resolver31 HOLD explícitamente y congelar Corte6 antes de Agosto.
