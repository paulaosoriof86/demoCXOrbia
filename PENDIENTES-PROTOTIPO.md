# PENDIENTES-PROTOTIPO.md

**Última actualización:** 2026-08-10  
**Estado vivo:** `C6_AUTH_DUPLICATE_KEEPER_ONE_READ_STOP_4_ANCHOR_AMBIGUITIES__FD891_POLICY_CLOSED__AUTH_DEV_228_PRESERVED__NO_SECOND_READ__ZERO_WRITES__NO_PRODUCTION`

## 1. Fuente de verdad

1. `app/docs/00-INDICE-FUENTES-VIGENTES-CXORBIA-TYA.md`;
2. `app/docs/CHECKPOINT-OPERATIVO-CXORBIA-TYA-VIGENTE.md`;
3. `app/docs/SOURCE-LOCK-C6-AUTH-DUPLICATE-KEEPER-ONE-READ-FOCAL-STOP-RETRY-20260810.md`;
4. `app/docs/PENDIENTES-PROTOTIPO-ADDENDUM-C6-AUTH-DUPLICATE-KEEPER-ONE-READ-STOP-20260810.md`;
5. PR #7 y HEAD vivo.

## 2. Cerrado y protegido

- frontend acumulativo y módulos Phase A;
- freeze Auth v4 340/HOLD=0;
- Auth DEV 228, Activation/readback/rollback dry-run PASS;
- SKIP13, multi-Auth, `ac93...`, HashConfig y lifecycle de credencial cerrados;
- falso positivo temporal del duplicate-keeper source gate corregido y PASS;
- una lectura provider focal consumida, sin segunda lectura;
- `fd891...` cerrado como `POLICY_CLOSED_NO_TYA_EFFECTIVE_ACCESS`;
- 20/20 superficies Phase A source-side;
- estrategia `PROMOTE_EXISTING_CLEAN_PROJECT`.

## 3. P0 vivo

`C6 AUTH DUPLICATE OWNERSHIP ANCHOR SOURCE-SAFE EVIDENCE RECONCILIATION — NO PROVIDER`.

Cuatro grupos continúan sin keeper único:

```text
1acdcb3782b7cf351056 = AMBIGUOUS_STAFF_KEEPER_NO_UNIQUE_ALLOWED_ANCHOR
2c4d19f2b066835473d3 = AMBIGUOUS_STAFF_KEEPER_NO_UNIQUE_ALLOWED_ANCHOR
54225792eeb65f6739c0 = AMBIGUOUS_STAFF_KEEPER_NO_UNIQUE_ALLOWED_ANCHOR
ae2f920fe6d9ce1fdd82 = AMBIGUOUS_CLIENT_KEEPER_LINEAGE
```

La lectura focal ya demostró que repetir los mismos discriminadores no resolverá el empate: los tres pares staff son equivalentes y Cliente tiene lineage histórica 2/2, canónica 0/2.

## 4. No hacer

- no ejecutar segundo provider read con la autorización consumida;
- no reconstruir 340 identidades;
- no repetir PREWRITE ni Activation;
- no repair Auth sin keeper reproducible;
- no nuevo smoke;
- no compensar duplicados desde frontend;
- no relajar roles/tenant/project/shopper scope;
- no elegir keeper por antigüedad, orden, nombre, email, UID o visual;
- no nuevo proyecto, rama o PR;
- no deploy, merge ni producción sin autorización específica.

## 5. Ruta corta

Buscar solo en evidencia/source-safe existente una ancla no temporal y no PII de ownership/lineage para A–D. Si no aparece una ancla única, cerrar el diagnóstico con `HUMAN_OWNERSHIP_DECISION_REQUIRED` y pedir únicamente la decisión humana mínima necesaria, sin otra lectura provider.

Solo después de keeper inequívoco podría solicitarse un repair Auth mínimo separado con snapshot/readback/rollback; posteriormente smoke acumulativo read-only y gate de cutover.

## 6. Seguridad

El bloque terminó con exactamente un provider read, cero writes, cero deploy, cero merge y producción intacta. Request consumido/deshabilitado y workflows temporales retirados.
