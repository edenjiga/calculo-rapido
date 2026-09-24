# Calculo Rapido

Juego de cálculo mental hecho con Expo (SDK 57). Resuelves sumas, restas, multiplicaciones y divisiones contra el reloj. La app no pide cuenta: la abres y juegas.

## Reglas

- Empiezas con 60 segundos.
- Cada 10 aciertos seguidos suman 10 segundos al reloj.
- Un error pone la racha en cero. Los aciertos que llevas se quedan.
- Al acabarse el tiempo ves tus aciertos, errores, mejor racha y el tiempo extra que ganaste.
- Todas las respuestas son números enteros: las restas nunca dan negativo y las divisiones siempre son exactas.

## Configurar

Desde Inicio, **Configurar** te deja elegir el nivel y las operaciones (suma, resta, multiplicación, división; al menos una queda activa).

| Nivel | Números | Ejemplos |
| --- | --- | --- |
| Fácil | 1 dígito con 1 dígito | 9 + 4, 7 × 8 |
| Medio | 2 dígitos con 1 dígito | 21 × 5, 84 ÷ 7 |
| Difícil | 2 dígitos con 2 dígitos | 23 × 45, 96 ÷ 12 |

En Fácil, las divisiones son las tablas al revés (56 ÷ 8): con un dividendo de 1 dígito solo existen cinco divisiones exactas.

La app guarda en el teléfono tu configuración y un récord por nivel. El tiempo y el bonus están en [`src/constants.ts`](src/constants.ts); los rangos de cada nivel, en [`src/utils/questions.ts`](src/utils/questions.ts).

## Correr la app

Necesitas Node 20.19.4 o más nuevo.

```bash
npx expo start
```

Desde ahí:

- **En tu teléfono:** instala Expo Go y escanea el código QR.
- **En el simulador de iOS:** presiona `i`. Requiere Xcode seleccionado (`sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`).
- **En el navegador:** presiona `w`. En web también puedes jugar con el teclado: números, `Backspace` y `Enter`.

## Verificar cambios

```bash
npm test            # lógica del juego (preguntas por nivel, configuración, racha, bonus, tiempo)
npx tsc --noEmit    # tipos
npm run lint
```

## Estructura

```
src/
├── app/               # rutas: inicio (index), partida (game) y configurar (settings)
├── screens/game/      # pantalla de juego: marcador, barras, respuesta, teclado, resultados
├── components/        # botón compartido
├── hooks/             # récord por nivel, configuración guardada, fuente de íconos
├── utils/             # preguntas, configuración, reducer del juego, almacenamiento, hápticos
├── constants.ts       # reglas ajustables
└── theme.ts           # colores del sistema, espaciado, tipografía, animación
```

La lógica del juego está en funciones puras (`utils/questions.ts`, `utils/game.ts`), con sus pruebas al lado. Las pantallas agregan el reloj, la animación y los hápticos encima.
