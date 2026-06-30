# Seguridad de Axon

> Axon es local-first: tus datos viven en tu maquina, cifrados, sin servidor que
> los vea. Este documento describe el modelo de seguridad y la auditoria realizada.

## Modelo de seguridad

| Activo | Proteccion |
|--------|-----------|
| Datos personales (perfil, contactos, credenciales) | AES-256-GCM + PBKDF2 (100K iteraciones, SHA-512). Contrasena maestra nunca se guarda. |
| Tokens de conectores (Calendar, Gmail) | Cifrados con la misma contrasena maestra, en `tokens.enc` local (gitignored). |
| Clave privada de licencias | Ed25519, `monetize/keys/private.pem`, gitignored. Solo se usa para emitir. |
| Licencias | Firmadas Ed25519, validadas offline con la clave publica. Imposibles de falsificar. |
| Webhook de Stripe | Firma HMAC-SHA256 verificada antes de procesar; anti-replay (ventana 5 min). |
| Panel de admin (ventas/MRR) | Endpoint `/api/admin/sales` restringido a localhost (403 desde fuera). |

## Auditoria — 2026-06-30

Realizada antes de considerar abrir el producto a publico.

### Resultados

| # | Check | Resultado |
|---|-------|-----------|
| 1 | Secretos en el historial de git (private.pem, tokens, client_secret) | ✅ Nunca commiteados |
| 2 | Archivos sensibles trackeados actualmente | ⚠️→✅ Ver hallazgo 1 (resuelto) |
| 3 | Secretos hardcodeados (OAuth IDs, sk_live, claves) | ✅ Ninguno |
| 4 | Endpoint admin protegido | ✅ Solo localhost (403 externo) |
| 5 | Webhook verifica firma antes de procesar | ✅ Firma + anti-replay |
| 6 | Clave privada de uso restringido | ✅ Solo keygen/issue la leen |
| 7 | Secretos cubiertos por .gitignore | ✅ Los 5 patrones verificados |

### Hallazgos y correcciones

**1. (Medio) `profile.json.enc` y `contacts.json.enc` estaban versionados.**
Datos personales cifrados de Jorge estaban trackeados en git (commiteados antes de
la regla `brain/identity/*.enc`). Aunque cifrados con AES-256-GCM (riesgo real bajo),
no deben versionarse.
- **Corregido:** `git rm --cached` de ambos. Hacia adelante el `.gitignore` los cubre.
- **Residual:** siguen en el historial git, cifrados. Si la contrasena maestra es
  fuerte, el riesgo es despreciable. Si se quisiera eliminar del historial por completo,
  usar `git filter-repo` (no se hizo para no reescribir el historial compartido).

### Verificacion de licencias (anti-falsificacion)

Probado en `test/license.test.mjs`: una licencia con un solo byte alterado es
rechazada con "firma invalida". Sin la clave privada de Jorge, nadie puede generar
una licencia valida.

### Webhook (anti-replay y anti-falsificacion)

Probado en `test/webhook.test.mjs` (4/4): firma valida emite; firma falsa → 400;
timestamp viejo (replay) → 400; sesion repetida no duplica.

## Reglas de oro

1. **Nunca subir `monetize/keys/private.pem`.** Es la imprenta de licencias. Si se
   filtra, cualquiera genera licencias gratis → rotar (ver `MONETIZATION.md` §7).
2. **Nunca subir `tokens.enc`, `.enc`, `license.key`, `sales-log.json`.** Cubiertos
   por `.gitignore`, verificado.
3. **El webhook corre con la clave privada** — solo en un servidor de confianza, nunca
   exponer su filesystem.
4. **Datos descifrados nunca se escriben a disco** (solo en memoria al usarlos).

## Reportar una vulnerabilidad

Escribe a jlmanga22@gmail.com con el detalle. No abras un issue publico para
vulnerabilidades.

## Pendiente antes de produccion publica

- [ ] Rotacion documentada de la clave privada de licencias
- [ ] Rate limiting en el webhook (hoy depende de la verificacion de firma)
- [ ] Revision de dependencias (hoy: cero dependencias externas — superficie minima)
- [ ] Considerar `git filter-repo` si se decide purgar los .enc del historial
