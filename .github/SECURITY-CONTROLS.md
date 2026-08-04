# Controles de seguridad operativos

Este documento registra los controles técnicos que protegen los cambios del sitio y su dominio público.

## Firmas de commits

- La rama `main` exige commits con firma verificable mediante la regla `required_signatures`.
- La clave autorizada para el mantenimiento de este sitio es una clave SSH de firma dedicada. Su huella es `SHA256:VYKyiPJYIutmBq8U8cFJsnlg7/tWto1IMK8rK9eNsRM`.
- La clave privada no se almacena en este repositorio ni se usa para autenticación SSH. GitHub conserva únicamente la clave pública como *Signing key*.
- `.github/allowed_signers` contiene solo la clave pública y permite verificar localmente los commits con `git verify-commit`.
- La configuración local del repositorio activa `gpg.format=ssh`, `commit.gpgsign=true` y usa el correo verificado `MinnerGarcia@users.noreply.github.com`.

Si se pierde o compromete la clave, se debe eliminar inmediatamente de GitHub, generar una nueva clave dedicada, actualizar `.github/allowed_signers`, probar una firma y sustituir esta huella antes de publicar cambios.

## DNSSEC y CAA

- Cloudflare firma la zona DNS y el registrador publica el registro DS correspondiente.
- La política CAA pública autoriza a `letsencrypt.org`. Cloudflare añade automáticamente las autorizaciones que necesita para emitir y renovar los certificados administrados de Universal SSL.
- `.github/scripts/check-external-security.mjs` comprueba el DS esperado, DNSKEY, el bit de autenticación DNSSEC, CAA, los servidores DNS, las rutas MX de Zoho y las cabeceras HTTPS.
- `.github/workflows/external-security.yml` ejecuta esas comprobaciones en cada solicitud de cambios, en cada actualización de `main`, de forma manual y todos los lunes.
- El estado obligatorio `External DNS security` impide integrar cambios cuando la postura DNS/HTTPS pública no pasa la validación.

Una rotación DNSSEC requiere actualizar primero el valor DS esperado en el monitor, confirmar la transición desde dos resolutores independientes y mantener al menos una cadena de confianza válida durante toda la rotación. No se debe desactivar DNSSEC como método de solución rápida.
