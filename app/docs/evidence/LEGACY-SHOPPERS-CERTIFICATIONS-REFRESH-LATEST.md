# Legacy TyA — refresh read-only shoppers + certificaciones

- Fecha: 2026-07-30T00:51:07.926Z
- Fuente: Firebase RTDB `tya-plataforma`, nodo `tya_shoppers_extra` únicamente.
- Alcance: shoppers + `histCerts` + marcadores `certs`; visitas/finanzas/notificaciones no fueron leídos.
- Snapshot hash: `1a4b1678afe9d5eb990c715d71c56df5c105cbe7204b95cd842a584e920c3c4d`
- Representaciones legacy crudas: 281
- Shoppers legacy únicos por ID estable: 149
- Representaciones duplicadas colapsadas por el mismo ID estable: 128
- Conflictos reales entre representaciones del mismo ID: 1
- Shoppers canónicos existentes: 215
- Intentos históricos: 106
- Marcadores aprobados sin intento histórico: 2
- Registros de certificación totales: 108
- Match exacto ID/migratedFrom: 0
- Match exacto código estable: 0
- Revisión identidad secundaria: 0
- Candidatos sin match estable: 149
- Coincidencias solo por nombre (diagnóstico, NUNCA usadas para dedupe): 26
- Review de fuente/certificación: 16
- Bootstrap demo excluido: 4; isDemo excluidos: 0; eliminados explícitos: 0

## Seguridad
- Provider writes legacy/canónico: 0/0.
- Auth/Storage/Hosting/producción/merge: 0/0/0/false/false.
- No se exportaron nombres, emails, teléfonos, DPI, banco, NDA, contraseñas ni respuestas pregunta por pregunta.
- El nombre nunca se usa como llave de deduplicación.
