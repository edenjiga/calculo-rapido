# Política de privacidad

Página estática con la política de privacidad de Calculo Rapido, hecha con [Astro](https://astro.build). Genera HTML y CSS sin JavaScript, así que la sirve cualquier servidor web, también Web Station en un Synology.

## Antes de publicarla

Pon tu correo en `CONTACT_EMAIL`, al principio de `src/pages/index.astro`. Sin él la página muestra un aviso rojo, y Google Play exige un contacto. Si algún día cambia lo que la app hace con los datos, actualiza el texto y la fecha `UPDATED`.

## Generar los archivos

Necesitas Node 20 o superior.

```bash
cd privacy-policy
npm install
npm run build
```

Los archivos quedan en `dist/`: `index.html`, `icon.png` y `favicon.png`. Con `npm run dev` tienes una vista previa que se recarga al editar.

Usa Astro 5 porque Astro 6 y posteriores necesitan Node 22.

## Subirla al Synology

1. Instala **Web Station** desde el Centro de paquetes. Crea la carpeta compartida `web`.
2. Copia el contenido de `dist/` a una carpeta dentro de `web`, por ejemplo `web/calculo-rapido/`.
3. En tu red la página queda en `http://IP-DEL-NAS/calculo-rapido/`.

Google Play necesita una URL pública con HTTPS que funcione siempre, no solo en tu red:

- **DDNS**: Panel de control → Acceso externo → DDNS, con un nombre `*.synology.me`.
- **Certificado**: Panel de control → Seguridad → Certificado → Añadir → Let's Encrypt.
- **Router**: redirige los puertos 80 y 443 al NAS. Let's Encrypt usa el 80 para validar. No abras los puertos de DSM (5000 y 5001).

Prueba la URL desde el móvil con datos, sin Wi-Fi, y pégala en Play Console → Contenido de la aplicación → Política de privacidad.
