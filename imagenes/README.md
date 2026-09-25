# Imágenes de Calculo Rapido

El icono de la app y los recursos gráficos de la ficha de Google Play.

## Ficha de Google Play

| Recurso | Archivo | Tamaño |
|---|---|---|
| Icono de la aplicación | `play-store-icon-512.png` | 512×512 |
| Gráfico de funciones | `grafico-de-funciones.png` | 1024×500 |
| Capturas de teléfono | `capturas/telefono/` (5) | 1080×1920 |
| Capturas de tablet de 7" | `capturas/tablet-7/` (4) | 1080×1920 |
| Capturas de tablet de 10" | `capturas/tablet-10/` (4) | 1440×2560 |

Las capturas son de la app real: build de release en un emulador con Android 16, jugando partidas de verdad. Están en 9:16 y en PNG sin transparencia, como pide Play. Súbelas en el orden de su número, porque las primeras son las que más se ven en la ficha.

El gráfico de funciones usa la fuente Roboto (licencia SIL Open Font).

## Icono de la app

Los signos + − × ÷ en blanco sobre un degradado del azul de la app. `vista-previa.png` muestra cómo queda en los launchers de Android (círculo y forma redondeada), en la tienda, como icono temático, en el splash y en tamaños pequeños.

| Archivo | Tamaño | Dónde va |
|---|---|---|
| `icon.png` | 1024×1024 | `assets/images/` |
| `android-icon-foreground.png` | 1024×1024, transparente | `assets/images/` |
| `android-icon-background.png` | 1024×1024 | `assets/images/` |
| `android-icon-monochrome.png` | 1024×1024, transparente | `assets/images/` |
| `splash-icon.png` | 1024×1024, transparente | `assets/images/` |
| `favicon.png` | 48×48 | `assets/images/` |
| `play-store-icon-512.png` | 512×512 | Play Console → Ficha de Play Store → Icono de la aplicación |
| `icono.svg` | vectorial | El original, para editarlo en Figma, Inkscape o Illustrator |

Los nombres coinciden con los de `assets/images/`: basta con copiarlos encima, sin tocar `app.json`. El icono va dentro del build nativo, así que después hay que generar un build nuevo con EAS.

El dibujo del icono adaptable ocupa el 38 % central del lienzo, dentro de la zona segura de Android, porque cada launcher recorta los bordes con una forma distinta. El splash se muestra sobre el color `#208AEF` que ya está en `app.json`. El icono de iOS (`assets/expo.icon`) no cambia; se hace con Icon Composer de Apple.
