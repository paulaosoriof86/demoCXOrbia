# ACADEMIA — IMPACTO I3 LEGAL PROVIDER / V0.4 · 2026-08-16

## Estado

Provider legal durable y provider de materialización V0.4 continúan **source-only PASS**. No existe todavía provider write, publicación real ni aceptación real. Counsel GT/HN queda diferido post-go-live y no debe presentarse como completado.

Vigentes:
- `backend/contracts/cxorbia-legal-publication-snapshot-v1.json`;
- `backend/contracts/cxorbia-legal-v04-interim-materialization-v1.json`;
- `backend/runtime/cxorbia-legal-publication-provider-v1.mjs`;
- `CANDIDATA-LEGAL-TYA-V0.4-INTERIM-GOLIVE-COUNSEL-DEFERRED-20260816.md`;
- `SOURCE-LOCK-ITERATION3-LEGAL-V0.4-MATERIALIZATION-PROVIDER-SOURCE-ONLY-PASS-20260816.md`;
- `PENDIENTE-LEGAL-POST-GOLIVE-TYA-GT-HN-V0.4-20260816.md`.

CI source técnico: `4cfd087fb49bb41d00caa9dd798bf7d02fa4f0d9`, run `31959900456`, job `95196342385`, SUCCESS.

## Conceptos que Academia deberá separar

1. **Configuración legal editable no-code:** operador, contactos, dirección pública, nombre visible, retención, providers, políticas y proyecto.
2. **Materialización/publicación:** snapshot provider-authoritative inmutable de una versión concreta.
3. **Aceptación humana:** receipt ligado a usuario autenticado exacto + versión + digest + timestamp.
4. **Revisión profesional:** estado independiente (`pendiente/completada`) que nunca se infiere de CI ni de publicación técnica.

Un bootstrap técnico de cuatro documentos **no equivale a aceptación**. La futura materialización V0.4 tiene legalAcceptance/Auth/password reset = `0` por contrato.

## Aceptación

QA, GitHub Actions, Make, Gemini, IA, scripts o administradores técnicos no aceptan por el usuario. `#bnOk`, navegación y localStorage no son autoridad de consentimiento.

`legal.acceptance.record` es un comando self-scoped y human-confirmed. El provider deriva la identidad desde el ID token verificado; la habilitación de ese comando no abre permisos operativos adicionales al Shopper o Cliente.

## No-code y rebranding

Perfil mutable y versión publicada son distintos. Rebranding, correo o configuración posterior no reescriben una versión histórica. Marca visible, registro marcario y titular/licenciante son objetos separados.

Los valores iniciales TyA podrán entrar en el bootstrap autorizado, pero después del provider ACK deben gestionarse desde la plataforma/provider authority, no desde el request ni código runtime.

## Por rol

**Shopper:** entender qué versión acepta; confidencialidad; autenticidad de visita; evidencia según proyecto; seguridad de datos; incidentes.

**Admin/Operaciones:** mínimo privilegio; distinguir perfil editable, versión materializada/publicada y aceptación; no sobrescribir historia; no fuzzy matching; no exponer domicilio/banco/documentos restringidos.

**Cliente:** confidencialidad recíproca; protección de identidad Shopper; uso limitado de resultados; obligaciones de datos/evidencias; no represalias/contacto fuera del flujo.

**Superadmin/tenant admin:** gestionar perfil no-code, Provider Registry, retención/evidencias y rebranding sin volver global una regla de tenant/proyecto.

## Evidencias y retención

Foto/video/audio/geolocalización/comprobantes pertenecen al proyecto. Audio/biometría/reconocimiento facial u otros tratamientos de alto impacto requieren controles adicionales cuando corresponda.

Para TyA: piso 60/default 90 días para evidencia cruda como regla operativa. Documentación empresarial, pagos, auditoría y receipts pueden requerir plazos mayores o legal hold.

## Qué NO debe enseñar o simular

- que V0.4 fue revisada por abogado;
- que counsel post-go-live está cerrado;
- que source-only PASS significa Firestore materializado;
- que materialización técnica significa aceptación;
- aceptación automatizada;
- `#bnOk`/localStorage como consentimiento;
- provider deshabilitado como receptor actual;
- domicilio restringido público automáticamente;
- marca no registrada como registrada;
- Cinépolis u otro proyecto como regla global;
- cualquier click como firma avanzada;
- arbitraje universal para todo usuario.

## Impacto editorial futuro

Cuando provider legal real quede activado/validado, actualizar:
- ruta por rol de aceptación legal;
- manual `Legal y cumplimiento`;
- `Crear/Editar proyecto > Evidencias y privacidad`;
- checklist `editar perfil → previsualizar → publicar versión → aceptar`;
- Provider Registry;
- errores frecuentes: versión pendiente, cambio material, provider inactivo, dato restringido, aceptación faltante;
- notificación de nueva versión/reaceptación;
- estado visible `revisión profesional pendiente/completada`.

No incluir hashes internos, IDs de runs, credenciales, rutas privadas ni detalles del runner en Academia visible.

Academia/Certificación del Shopper histórico permanecen diferidas y no se declaran PASS por este bloque.
