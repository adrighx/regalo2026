/* ============================================================
   CONFIGURACIÓN DEL REGALO
   ------------------------------------------------------------
   Este es el ÚNICO archivo que necesitas tocar para cambiar
   textos, fechas o añadir fotos nuevas. No hace falta saber
   programar: solo cambia lo que hay entre comillas.
   ============================================================ */

window.GIFT_CONFIG = {
  /* --- Lo básico ------------------------------------------ */
  partnerName: "Mónica",
  // Cómo la llama la página en los mensajes bonitos
  partnerLabel: "el amor de mi vida",
  artist: "Karol G",
  city: "Sevilla",
  country: "España",
  venue: "Estadio La Cartuja",
  tickets: 2,

  /* --- La fecha del concierto -----------------------------
     Formato: "AAAA-MM-DDTHH:MM:SS" (hora de España).
     De esto salen la cuenta atrás y el modo "después".      */
  eventDate: "2027-06-11T21:00:00",
  dateLabel: "11 de junio de 2027",
  timeLabel: "21:00 h",

  /* --- El número de serie de la entrada -------------------
     El día que empezamos a salir: 7 de marzo de 2022.       */
  serialNumber: "070322",

  /* --- La dirección pública de la página ------------------
     IMPORTANTE: esta es la dirección a la que apunta el QR
     del panfleto. Una vez lo imprimas, NO renombres el
     repositorio de GitHub o el QR dejará de funcionar.      */
  publicUrl: "https://adrighx.github.io/regalo2026/",

  /* --- Textos de la portada -------------------------------
     heroTitle es EL titular grande de la portada. Manda este.
     (Solo lo sustituyen los de "fases" el día del concierto
      y a partir del día siguiente, más abajo del todo.)      */
  heroTitle: "Prepárate para un día inolvidable.",
  message:
    "Te he preparado una sorpresa: el 11 de junio nos vamos a Sevilla a vivir una experiencia que te va a encantar.",
  revealLine: "¡Tenemos entradas para ver a Karol G en Sevilla!",

  /* --- La carta ------------------------------------------- */
  letterTitle: "Esto no es solo un concierto.",
  letterBody:
    "Es verte a ti viéndola a ella. Quiero estar a tu lado cuando salga al escenario y te vuelvas loca, oírte cantarlas todas a grito pelado y que acabemos los dos sin voz. Eso es lo que te regalo. Lo demás ya lo iremos viendo.",
  footerLine: "Ve calentando la voz. Te quiero.",

  /* ============================================================
     EL PANFLETO IMPRIMIBLE
     ------------------------------------------------------------
     OJO: esto es lo PRIMERO que ella va a ver, antes de escanear
     el QR. Aquí NO se nombra ni a Karol G, ni Sevilla, ni el
     concierto: la gracia es que lo descubra al abrir la página.
     Si tocas estos textos, no metas pistas.
     ============================================================ */
  flyer: {
    kicker: "Para el amor de mi vida",
    title: "Tu regalo no cabe en este papel.",
    lead:
      "Lo que te he preparado no se puede envolver ni meter en una caja. Está entero detrás de este código.",
    qrTitle: "Escanéame",
    qrText: "Aquí dentro está el regalo. Y un álbum que iremos llenando.",
    note:
      "No tires este papel. Ya sé que no lo ibas a tirar, pero lo pongo por escrito: el código va a seguir funcionando y ahí iremos subiendo fotos. Si lo pierdes te imprimo otro, pero me lo apunto.",
    sign: "Ábrelo. Te va a gustar."
  },

  /* --- Música --------------------------------------------- */
  playlistId: "37i9dQZF1DZ06evO4e5iLu", // solo el código, sin la URL entera
  playlistUrl: "https://open.spotify.com/playlist/37i9dQZF1DZ06evO4e5iLu",

  /* --- Fotos de la portada (el collage) -------------------
     Nombres de archivo dentro de assets/collage/.
     El orden es el que se ve: 3 columnas x 3 filas.
     Las 8 primeras son también las del panfleto.            */
  heroPhotos: [
    "photo-01.jpg", // 1
    "photo-06.jpg", // 2
    "photo-08.jpg", // 3
    "photo-13.jpg", // 4
    "photo-25.jpg", // 5
    "photo-09.jpg", // 6
    "photo-19.jpg", // 7
    "photo-05.jpg", // 8
    "photo-23.jpg" // 9
  ],

  /* ============================================================
     EL ÁLBUM DE LA NOCHE
     ------------------------------------------------------------
     Aquí van TODAS las fotos del 11 de junio de 2027.

     CÓMO AÑADIRLAS DESPUÉS DEL CONCIERTO:
       1. Copia las fotos en la carpeta  assets/album/
       2. Escribe sus nombres en la lista "photos" de abajo.
       3. Sube los cambios a GitHub. Ya está.

     Mientras "photos" esté vacío, la página muestra un mensaje
     bonito de "todavía por escribir" en vez de un hueco feo.
     ============================================================ */
  album: {
    folder: "assets/album/",
    photos: []
  },

  /* --- Textos que cambian según el momento ----------------
     Si aquí pones "titulo", ese texto SUSTITUYE a heroTitle
     en ese momento concreto. Por eso "antes" no lo lleva:
     así el titular de la portada se cambia en un solo sitio. */
  fases: {
    antes: {
      etiqueta: "Faltan para la gran noche",
      album: "Aquí guardaremos los recuerdos de esa noche."
    },
    dia: {
      etiqueta: "Es hoy",
      titulo: "Hoy es la noche.",
      album: "Hoy se llena este álbum."
    },
    despues: {
      etiqueta: "Ha pasado desde nuestra noche",
      titulo: "Aquella noche en Sevilla.",
      // "mensaje" sustituye a la entradilla de arriba cuando ya ha pasado
      mensaje: "El 11 de junio de 2027 nos fuimos a Sevilla. Aquí queda guardado.",
      album: "Nuestra noche, guardada para siempre."
    }
  }
};
