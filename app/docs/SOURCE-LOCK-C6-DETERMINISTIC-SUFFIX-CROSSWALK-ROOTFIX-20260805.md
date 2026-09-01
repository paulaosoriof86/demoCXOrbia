# SOURCE LOCK — C6 Deterministic Suffix Crosswalk Root Fix

**Fecha:** 2026-08-05  
**Repo:** `paulaosoriof86/demoCXOrbia`  
**Rama viva:** `docs-tya-v6-v71-audit`  
**PR:** `#7` draft/open/no merge  
**HEAD de entrada:** `3bd33619c2f16691fc19fab07ef57524cecac7ab`  
**Planner blob de entrada:** `cd3ccf393b93b02048b3cf9756175116e2f2133f`

## Alcance exacto

Bloque `SOURCE-ONLY CROSSWALK ROOT FIX`:

1. propagar las `TECH_KEYS` de cada fuente HR, visita, certificación o liquidación enlazada hacia `relationIndex`;
2. preservar `basis` y objeto fuente en `linkedByProfile`;
3. agregar fixture estático de propagación;
4. congelar la referencia estable `101 mapped / 8 unmapped`;
5. impedir `readyForAuthRepair` ante cualquier drift del crosswalk;
6. preservar el plan de exactamente 340 filas y la política determinística 4/6/8;
7. detenerse después de source/static PASS.

## Prohibiciones

- provider reads o writes;
- Auth, claims, email o contraseña writes;
- memberships, Firestore, Rules, Storage o HR writes;
- Hosting o Cloud Run deploy;
- Make, Gemini, pagos, merge o producción;
- reusar la autorización provider consumida;
- tratar los agregados provisionales 65/142 como baseline final.

## Estado de entrada

```text
stable credential crosswalk=101 mapped / 8 unmapped
planner observed=88 mapped / 21 unmapped
drift=13
provider execution consumed=1
provider second attempt=0
```

La ejecución del bloque debe ser completamente source/static y no puede consultar Firebase ni Identity Toolkit.
