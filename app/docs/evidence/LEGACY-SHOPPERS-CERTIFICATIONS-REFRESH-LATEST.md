# Legacy TyA — refresh read-only shoppers + certificaciones

- Fecha: 2026-07-30T00:44:36.908Z
- Fuente: Firebase RTDB `tya-plataforma`, nodo `tya_shoppers_extra` únicamente.
- Alcance: shoppers + historial/marcadores de certificación embebidos. Visitas/finanzas/notificaciones no fueron leídos.
- Snapshot hash: `7f47f967bb7e3aa867d1a089966b916456d1c76ade20dfdace56319a211b1f70`
- Shoppers legacy útiles: 151
- Shoppers canónicos existentes: 215
- Intentos históricos: 19
- Marcadores aprobados sin intento histórico: 6
- Registros de certificación totales: 25
- Match estable: 0
- Create candidates: 151
- Review required: 130
- Demo excluidos: 0; eliminados excluidos: 0

## Seguridad
- Provider writes legacy/canónico: 0/0.
- Auth/Storage/Hosting/producción/merge: 0/0/0/false/false.
- No se exportaron nombres, emails, teléfonos, DPI, banco, NDA, contraseñas ni respuestas pregunta por pregunta.
- El hash de snapshot permite exigir que una ejecución futura de write use exactamente la misma fuente o se vuelva a planificar.
