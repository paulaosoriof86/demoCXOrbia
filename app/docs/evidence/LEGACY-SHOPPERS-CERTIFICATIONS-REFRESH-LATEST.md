# Legacy TyA — refresh read-only shoppers + certificaciones

- Fecha: 2026-07-30T01:12:24.573Z
- Fuente: Firebase RTDB `tya-plataforma`, nodo `tya_shoppers_extra` únicamente.
- Alcance: shoppers + `histCerts` + marcadores `certs`; visitas/finanzas/notificaciones no fueron leídos.
- Snapshot hash: `a4988e2ad473f724248ac9999b6f8ba6edd94f8aba5c7145c09da88159a200c4`
- Representaciones legacy crudas: 281
- Shoppers legacy únicos por ID estable: 149
- Representaciones duplicadas colapsadas por el mismo ID estable: 128
- Conflictos reales entre representaciones del mismo ID: 1
- Shoppers canónicos existentes: 215
- Intentos/records de certificación útiles tras colapsar espejos de recuperación: 78
- Espejos de recuperación colapsados: 30
- Marcadores aprobados sin intento histórico: 2
- Match exacto ID/migratedFrom: 0
- Match por normalización determinística del mismo ID técnico: 22
- Colisiones de ID técnico normalizado: 0
- Match exacto código estable: 0
- Revisión por identidad secundaria: 0
- Revisión por coincidencia solo de nombre (NUNCA automerge): 6
- Candidatos sin match estable ni solapamiento identificable: 121
- Review de fuente/certificación: 1
- Bootstrap demo excluido: 4; isDemo excluidos: 0; eliminados explícitos: 0

## Seguridad
- Provider writes legacy/canónico: 0/0.
- Auth/Storage/Hosting/producción/merge: 0/0/0/false/false.
- No se exportaron nombres, emails, teléfonos, DPI, banco, NDA, contraseñas ni respuestas pregunta por pregunta.
- El nombre nunca se usa como llave de deduplicación.
