# Academia impact - Protected Firestore rules DEV draft

Fecha: 2026-07-09

## Temas que Academia debe cubrir

- Qué es un dato source-safe.
- Qué es un perfil protegido.
- Por qué el preview público no muestra PII.
- Qué roles pueden ver datos protegidos.
- Qué son Firestore rules.
- Qué significa `rules draft` y por qué no equivale a producción.
- Por qué las escrituras están bloqueadas.
- Qué es reviewQueue.
- Qué es auditEvent.
- Qué campos están prohibidos.
- Cómo se relaciona esto con Auth/RBAC.

## Por rol

### Administrador SaaS

Debe entender que las reglas son parte del borde de seguridad por tenant/proyecto y que no se despliegan sin GO.

### Administrador de proyecto

Debe entender que puede ver datos protegidos solo con permisos y que cada lectura debe quedar auditada.

### Finanzas

Debe entender que liquidaciones y lotes se ven como estado auditado, pero no ejecutan pagos reales.

### Certificaciones

Debe entender la diferencia entre intentos, carryovers y revisión protegida.

### Shopper

Debe entender que solo ve su propio perfil, certificaciones, visitas y beneficios.

## Estado

Impacto documental/Academia. No activa backend real.
