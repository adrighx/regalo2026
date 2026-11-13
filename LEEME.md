# Regalo para Mónica · Karol G en Sevilla

Página web del regalo, pensada para seguir funcionando **después** del concierto
del 11 de junio de 2027.

Publicada en: <https://adrighx.github.io/regalo2026/>

---

## Qué hay en cada archivo

| Archivo | Para qué sirve |
| --- | --- |
| `config.js` | **El único que necesitas tocar.** Textos, fechas y fotos del álbum. |
| `index.html` | La página principal. |
| `flyer.html` | El panfleto imprimible en A4 con el QR. |
| `styles.css` | Todos los estilos. |
| `script.js` | El comportamiento (cuenta atrás, visor de fotos, sorpresa). |
| `assets/qr-regalo.svg` | El QR del panfleto, guardado como archivo del proyecto. |
| `assets/collage/` | Las fotos, ya optimizadas. `thumb/` son las versiones pequeñas. |
| `assets/album/` | Aquí van todas las fotos del día del concierto. |

---

## Cómo funciona la sorpresa (el rasca)

La página es una tira de entradas. En el primer cupón hay una franja gris:
al rascarla con el dedo aparece qué es el regalo y se despliega el resto de
la tira (cuenta atrás, carta, música y álbum). Hasta entonces no se nombra el
concierto, ni siquiera en el título de la pestaña.

- El móvil recuerda que ya se rascó, así que solo pasa la primera vez.
- Para volver a probarlo tú, abre la página en una ventana privada.
- Debajo de la franja hay un botón "Destapar sin rascar", por si acaso.
- El número de serie (070322) es el día que empezasteis a salir, y el código de
  barras del final lleva escrito "TE AMO" en binario.

---

## Cómo imprimir el panfleto

1. Abre <https://adrighx.github.io/regalo2026/flyer.html>
2. Pulsa **Imprimir en A4**.
3. En el diálogo de impresión, márgenes en **Ninguno** y activa
   **Gráficos de fondo** (si no, saldrá sin los colores).

---

## Cómo añadir las fotos del concierto (después del 11/06/2027)

1. Copia **todas** las fotos en `assets/album/`.

2. Abre `config.js` y escribe los nombres de archivo en la lista `photos`:

   ```js
   album: {
     folder: "assets/album/",
     photos: ["sevilla-01.jpg", "sevilla-02.jpg", "sevilla-03.jpg"]
   },
   ```

3. Sube los cambios a GitHub. La página se actualiza sola en un par de minutos.

La rejilla de fotos crece sola: da igual que subas 6 o 60.
Mientras la lista esté vacía, la web muestra un mensaje de "todavía en blanco"
en vez de un hueco raro.

> Consejo: antes de subirlas, reduce el tamaño de las fotos (1200 px de lado
> largo es más que suficiente). Si no, la página tardará en cargar en el móvil.

---

## La página cambia sola con el tiempo

| Momento | Qué pasa |
| --- | --- |
| Antes del 11/06/2027 | Cuenta atrás y "Prepárate para una noche bonita." |
| El día del concierto | "Hoy es la noche." |
| A partir del día siguiente | Cuenta el tiempo **transcurrido** y el título pasa a "Aquella noche en Sevilla." |

Los textos de cada momento están en `config.js`, en el apartado `fases`.

---

## ⚠️ Importante para que el QR no muera

El QR impreso apunta a `https://adrighx.github.io/regalo2026/`.
Una vez impreso el panfleto, esa dirección tiene que seguir existiendo **para
siempre**. Por lo tanto:

- **No renombres** el repositorio `regalo2026`.
- **No cambies** tu nombre de usuario de GitHub.
- No borres el repositorio ni desactives GitHub Pages.

Si algún día tienes que cambiar la dirección, hay que regenerar
`assets/qr-regalo.svg` **y volver a imprimir el panfleto**.

---

## Copia de seguridad

Las fotos originales sin comprimir están en
`C:\Users\adrighx\Documents\regalo-monica-ORIGINALES`.
Esa carpeta **no** se sube a GitHub, es solo tu respaldo local.
