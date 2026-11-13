/* ============================================================
   REGALO PARA MÓNICA
   Comportamiento de la página. Los textos y las fotos salen de
   config.js: aquí no hay que tocar nada para cambiar contenido.
   ============================================================ */

const config = window.GIFT_CONFIG || {};

const RUTA_COLLAGE = "assets/collage/";
const RUTA_THUMBS = "assets/collage/thumb/";
const CLAVE_ABIERTO = "regalo-monica-abierto";

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const raiz = document.documentElement;

const menosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Devuelve el valor de config, o lo que ya hubiera en el HTML.
function valor(campo, porDefecto = "") {
  const v = config[campo];
  return v === undefined || v === null || v === "" ? porDefecto : v;
}

/* ------------------------------------------------------------
   1. Textos desde config.js
   ------------------------------------------------------------ */
function rellenarTextos() {
  // El nombre de la artista va con espacios "duros", para que nunca
  // se parta en dos líneas ("Karol" arriba y "G" abajo).
  const artista = String(valor("artist", ""));
  const artistaPegado = artista.replace(/ /g, " ");

  $$("[data-field]").forEach((nodo) => {
    let texto = String(valor(nodo.dataset.field, nodo.textContent));
    if (artista) texto = texto.split(artista).join(artistaPegado);
    nodo.textContent = texto;
  });

  $$("[data-field-href]").forEach((nodo) => {
    nodo.setAttribute("href", valor(nodo.dataset.fieldHref, nodo.getAttribute("href")));
  });
}

/* ------------------------------------------------------------
   2. Número de serie y código de barras
   El número sale de config.js (serialNumber); si no hay, se usa
   la fecha del concierto (día, mes, año). Las
   barras llevan escrito "TE AMO" en binario, letra a letra.
   ------------------------------------------------------------ */
function numeroDeSerie(evento) {
  // Si config.js trae un número propio, manda ese
  if (config.serialNumber) return String(config.serialNumber);
  if (!evento) return "000000";
  const dos = (n) => String(n).padStart(2, "0");
  return dos(evento.getDate()) + dos(evento.getMonth() + 1) + dos(evento.getFullYear() % 100);
}

function pintarSerieYBarras(evento) {
  const serie = numeroDeSerie(evento);
  $$(".js-serie").forEach((nodo) => {
    nodo.textContent = serie;
  });

  const barras = $("#barras");
  if (!barras) return;

  const bits = Array.from("TE AMO " + serie)
    .map((letra) => letra.charCodeAt(0).toString(2).padStart(8, "0"))
    .join("");

  barras.innerHTML = "";
  Array.from(bits).forEach((bit, i) => {
    const barra = document.createElement("span");
    // 1 = barra gruesa, 0 = barra fina; los huecos alternan
    barra.style.width = bit === "1" ? "3px" : "1px";
    barra.style.marginRight = i % 3 === 0 ? "3px" : "1.5px";
    barras.append(barra);
  });
}

/* ------------------------------------------------------------
   3. ¿En qué momento estamos? antes / el día / después
   ------------------------------------------------------------ */
function calcularFase() {
  const evento = new Date(valor("eventDate", "2027-06-11T21:00:00"));
  if (Number.isNaN(evento.getTime())) return { fase: "antes", evento: null };

  const ahora = new Date();

  // El "día del concierto" va de las 00:00 de ese día
  // a las 06:00 de la mañana siguiente.
  const inicioDia = new Date(evento);
  inicioDia.setHours(0, 0, 0, 0);

  const finDia = new Date(inicioDia);
  finDia.setDate(finDia.getDate() + 1);
  finDia.setHours(6, 0, 0, 0);

  let fase = "antes";
  if (ahora >= finDia) fase = "despues";
  else if (ahora >= inicioDia) fase = "dia";

  return { fase, evento };
}

function aplicarFase(fase) {
  raiz.dataset.phase = fase;

  const textos = (config.fases || {})[fase];
  if (!textos) return;

  const etiqueta = $("#countdown-label-text");
  if (etiqueta && textos.etiqueta) etiqueta.textContent = textos.etiqueta;

  const titulo = $("#hero-title");
  if (titulo && textos.titulo) titulo.textContent = textos.titulo;

  const tituloAlbum = $("#album-title");
  if (tituloAlbum && textos.album) tituloAlbum.textContent = textos.album;

  // Opcional: otra entradilla para ese momento (si no, se queda "message")
  const entradilla = $(".entradilla");
  if (entradilla && textos.mensaje) entradilla.textContent = textos.mensaje;
}

/* ------------------------------------------------------------
   4. Cuenta atrás (y cuenta adelante cuando ya ha pasado)
   ------------------------------------------------------------ */
function iniciarCuentaAtras(evento) {
  if (!evento) return;

  const destino = evento.getTime();
  const nodos = {
    days: $("#days"),
    hours: $("#hours"),
    minutes: $("#minutes"),
    seconds: $("#seconds")
  };

  const tick = () => {
    const distancia = Math.abs(destino - Date.now());

    const dias = Math.floor(distancia / 86400000);
    const horas = Math.floor((distancia % 86400000) / 3600000);
    const minutos = Math.floor((distancia % 3600000) / 60000);
    const segundos = Math.floor((distancia % 60000) / 1000);

    if (nodos.days) nodos.days.textContent = String(dias);
    if (nodos.hours) nodos.hours.textContent = String(horas).padStart(2, "0");
    if (nodos.minutes) nodos.minutes.textContent = String(minutos).padStart(2, "0");
    if (nodos.seconds) nodos.seconds.textContent = String(segundos).padStart(2, "0");
  };

  tick();
  setInterval(tick, 1000);
}

/* ------------------------------------------------------------
   5. El rasca
   Una capa gris pintada en un <canvas> encima del premio. El dedo
   la va borrando; cuando falta más o menos la mitad, se destapa
   todo y se despliega el resto de la tira.
   ------------------------------------------------------------ */
function estaAbierto() {
  return raiz.dataset.abierto === "true";
}

function abrirRegalo({ animar = true } = {}) {
  if (estaAbierto()) return;

  raiz.dataset.abierto = "true";
  if (animar && !menosMovimiento) raiz.classList.add("recien-abierto");

  const resto = $("#tira-resto");
  if (resto) resto.hidden = false;

  const premio = $("#premio");
  if (premio) premio.removeAttribute("aria-hidden");

  const pregunta = $("#rasca-pregunta");
  if (pregunta) {
    pregunta.textContent =
      raiz.dataset.phase === "despues" ? "Esto fue lo que vimos:" : "Esto es lo que vamos a ver:";
  }

  // Ahora sí: el título de la pestaña puede decirlo
  document.title = `${valor("artist", "Concierto")} en ${valor("city", "")}, para ${valor(
    "partnerName",
    "ti"
  )}`;

  try {
    localStorage.setItem(CLAVE_ABIERTO, "1");
  } catch (e) {
    /* navegación privada: se tendrá que rascar cada vez */
  }
}

function pintarCapa(canvas) {
  const zona = canvas.parentElement;
  const escala = Math.min(window.devicePixelRatio || 1, 2);
  const ancho = zona.clientWidth;
  const alto = zona.clientHeight;

  canvas.width = Math.round(ancho * escala);
  canvas.height = Math.round(alto * escala);

  const ctx = canvas.getContext("2d");
  ctx.setTransform(escala, 0, 0, escala, 0, 0);
  ctx.globalCompositeOperation = "source-over";

  // Base plateada
  const plata = ctx.createLinearGradient(0, 0, ancho, alto);
  plata.addColorStop(0, "#c9cad6");
  plata.addColorStop(0.5, "#aeb0c0");
  plata.addColorStop(1, "#c3c4d1");
  ctx.fillStyle = plata;
  ctx.fillRect(0, 0, ancho, alto);

  // Motas, para que parezca tinta de rasca y no un rectángulo liso
  for (let i = 0; i < ancho * alto * 0.012; i += 1) {
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.35)" : "rgba(35,25,92,0.12)";
    ctx.fillRect(Math.random() * ancho, Math.random() * alto, 1.4, 1.4);
  }

  // "RASCA AQUÍ" repetido en diagonal
  ctx.save();
  ctx.translate(ancho / 2, alto / 2);
  ctx.rotate(-0.2);
  ctx.fillStyle = "rgba(35, 25, 92, 0.5)";
  ctx.font = '900 22px "Big Shoulders Display", "Arial Narrow", sans-serif';
  ctx.textAlign = "center";
  for (let y = -alto; y <= alto; y += 38) {
    const desfase = (y / 38) % 2 === 0 ? 0 : 70;
    for (let x = -ancho; x <= ancho; x += 140) {
      ctx.fillText("RASCA AQUÍ", x + desfase, y);
    }
  }
  ctx.restore();
}

function porcentajeRascado(canvas) {
  const ctx = canvas.getContext("2d");
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let vacios = 0;
  let total = 0;
  // Con mirar uno de cada 32 píxeles sobra
  for (let i = 3; i < data.length; i += 4 * 32) {
    total += 1;
    if (data[i] === 0) vacios += 1;
  }
  return total ? vacios / total : 0;
}

function conectarRasca() {
  const canvas = $("#rasca-capa");
  const atajo = $("#rasca-atajo");
  if (!canvas) return;

  // Si ya lo abrió otro día, o la noche ya llegó, no hay nada que rascar
  let yaAbierto = false;
  try {
    yaAbierto = localStorage.getItem(CLAVE_ABIERTO) === "1";
  } catch (e) {
    /* sin localStorage */
  }

  if (yaAbierto || raiz.dataset.phase !== "antes") {
    abrirRegalo({ animar: false });
    return;
  }

  pintarCapa(canvas);
  // La tipografía llega un pelín después: repintamos para que el texto salga bien
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (!estaAbierto() && !haRascado) pintarCapa(canvas);
    });
  }

  let haRascado = false;
  let rascando = false;
  let ultimo = null;
  let anchoPintado = canvas.parentElement.clientWidth;

  const punto = (e) => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const borrar = (desde, hasta) => {
    const ctx = canvas.getContext("2d");
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 38;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(desde.x, desde.y);
    ctx.lineTo(hasta.x, hasta.y);
    ctx.stroke();
  };

  canvas.addEventListener("pointerdown", (e) => {
    rascando = true;
    haRascado = true;
    ultimo = punto(e);
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch (err) {
      /* si el navegador no deja capturar el puntero, se rasca igual */
    }
    borrar(ultimo, { x: ultimo.x + 0.1, y: ultimo.y });
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!rascando) return;
    const actual = punto(e);
    borrar(ultimo, actual);
    ultimo = actual;
  });

  const soltar = () => {
    if (!rascando) return;
    rascando = false;
    if (porcentajeRascado(canvas) > 0.45) abrirRegalo();
  };

  canvas.addEventListener("pointerup", soltar);
  canvas.addEventListener("pointercancel", soltar);

  // Si gira el móvil antes de rascar, la capa se repinta a su nuevo tamaño
  window.addEventListener("resize", () => {
    const ancho = canvas.parentElement.clientWidth;
    if (estaAbierto() || haRascado || ancho === anchoPintado) return;
    anchoPintado = ancho;
    pintarCapa(canvas);
  });

  // Para quien no pueda o no quiera rascar (teclado, lector de pantalla)
  atajo?.addEventListener("click", () => abrirRegalo());
}

/* ------------------------------------------------------------
   6. Las fotos de los dos
   ------------------------------------------------------------ */
function montarCollage() {
  const contenedor = $("#hero-collage");
  if (!contenedor) return;

  const fotos = config.heroPhotos || [];
  contenedor.innerHTML = "";

  fotos.forEach((archivo, i) => {
    // Cada foto va dentro de su celda: así se puede acercar el encuadre
    // desde el CSS sin que la imagen se salga por encima de las vecinas.
    const celda = document.createElement("button");
    celda.type = "button";
    celda.className = "poster-cell";
    celda.setAttribute("aria-label", `Ver foto ${i + 1} de ${fotos.length}`);

    const img = document.createElement("img");
    img.src = RUTA_THUMBS + archivo;
    img.alt = "";
    img.decoding = "async";
    img.loading = "lazy";

    celda.append(img);
    celda.addEventListener("click", () =>
      abrirVisor(
        fotos.map((f) => RUTA_COLLAGE + f),
        i,
        "Nosotros"
      )
    );
    contenedor.append(celda);
  });
}

/* ------------------------------------------------------------
   7. El álbum de la noche
   ------------------------------------------------------------ */
function montarAlbum() {
  const galeria = $("#album-gallery");
  if (!galeria) return;

  const album = config.album || {};
  const fotos = (album.photos || []).map((f) => (album.folder || "") + f);
  const sub = $("#album-sub");
  const fecha = valor("dateLabel", "el día del concierto");

  galeria.innerHTML = "";

  // Todavía no hay fotos: un cupón en blanco, sin canjear
  if (!fotos.length) {
    galeria.classList.add("is-empty");

    const vacio = document.createElement("div");
    vacio.className = "album-empty";
    const linea = document.createElement("p");
    linea.textContent = "Cupón sin canjear";
    const nota = document.createElement("small");
    nota.textContent = `Se cambia por fotos el ${fecha}.`;
    vacio.append(linea, nota);
    galeria.append(vacio);

    if (sub) sub.textContent = "Cuando pase la noche, todas las fotos vivirán aquí.";
    return;
  }

  galeria.classList.remove("is-empty");

  fotos.forEach((ruta, i) => {
    const tarjeta = document.createElement("button");
    tarjeta.type = "button";
    tarjeta.className = "album-tile";
    tarjeta.setAttribute("aria-label", `Ver foto ${i + 1} de ${fotos.length}`);

    const img = document.createElement("img");
    img.src = ruta;
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";

    tarjeta.append(img);
    tarjeta.addEventListener("click", () => abrirVisor(fotos, i, "Nuestra noche"));
    galeria.append(tarjeta);
  });

  if (sub) {
    sub.textContent = `${fotos.length} ${
      fotos.length === 1 ? "recuerdo guardado" : "recuerdos guardados"
    }. Toca cualquiera para verlo en grande.`;
  }
}

/* ------------------------------------------------------------
   8. Visor de fotos
   ------------------------------------------------------------ */
const visor = {
  fotos: [],
  indice: 0,
  titulo: "",
  ultimoFoco: null
};

function abrirVisor(fotos, indice, titulo) {
  if (!fotos || !fotos.length) return;

  visor.fotos = fotos;
  visor.indice = indice;
  visor.titulo = titulo || "";
  visor.ultimoFoco = document.activeElement;

  $("#lightbox").hidden = false;
  document.body.style.overflow = "hidden";
  pintarVisor();
  $("#lightbox-close").focus();
}

function cerrarVisor() {
  const caja = $("#lightbox");
  if (!caja) return;
  caja.hidden = true;
  document.body.style.overflow = "";
  if (visor.ultimoFoco) visor.ultimoFoco.focus();
}

function moverVisor(paso) {
  const total = visor.fotos.length;
  visor.indice = (visor.indice + paso + total) % total;
  pintarVisor();
}

function pintarVisor() {
  const img = $("#lightbox-img");
  const total = visor.fotos.length;

  img.src = visor.fotos[visor.indice];
  img.alt = `${visor.titulo}, foto ${visor.indice + 1} de ${total}`;

  $("#lightbox-caption").textContent = visor.titulo;
  $("#lightbox-counter").textContent = `${visor.indice + 1} de ${total}`;

  const hayVarias = total > 1;
  $("#lightbox-prev").hidden = !hayVarias;
  $("#lightbox-next").hidden = !hayVarias;

  // Precarga la siguiente para que el paso sea instantáneo
  if (hayVarias) {
    new Image().src = visor.fotos[(visor.indice + 1) % total];
  }
}

function conectarVisor() {
  const caja = $("#lightbox");
  if (!caja) return;

  $("#lightbox-close").addEventListener("click", cerrarVisor);
  $("#lightbox-prev").addEventListener("click", () => moverVisor(-1));
  $("#lightbox-next").addEventListener("click", () => moverVisor(1));

  // Tocar el fondo cierra
  caja.addEventListener("click", (e) => {
    if (e.target === caja || e.target.classList.contains("lightbox-stage")) cerrarVisor();
  });

  document.addEventListener("keydown", (e) => {
    if (caja.hidden) return;
    if (e.key === "Escape") cerrarVisor();
    if (e.key === "ArrowLeft") moverVisor(-1);
    if (e.key === "ArrowRight") moverVisor(1);
  });

  // Deslizar con el dedo
  let inicioX = null;
  caja.addEventListener(
    "touchstart",
    (e) => {
      inicioX = e.changedTouches[0].clientX;
    },
    { passive: true }
  );

  caja.addEventListener(
    "touchend",
    (e) => {
      if (inicioX === null) return;
      const delta = e.changedTouches[0].clientX - inicioX;
      if (Math.abs(delta) > 50) moverVisor(delta < 0 ? 1 : -1);
      inicioX = null;
    },
    { passive: true }
  );
}

/* ------------------------------------------------------------
   9. Reproductor de Spotify
   ------------------------------------------------------------ */
function montarReproductor() {
  const hueco = $("#player");
  const id = valor("playlistId", "");
  if (!hueco || !id) return;

  const iframe = document.createElement("iframe");
  // Tiene que ser la URL /embed/: la de compartir no se puede incrustar
  iframe.src = `https://open.spotify.com/embed/playlist/${id}?utm_source=generator`;
  iframe.width = "100%";
  iframe.height = "352";
  iframe.title = "Lista de reproducción para ir ensayando";
  iframe.loading = "lazy";
  iframe.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";

  hueco.append(iframe);
}

/* ------------------------------------------------------------
   10. Arranque
   ------------------------------------------------------------ */
function iniciar() {
  const { fase, evento } = calcularFase();

  rellenarTextos();
  pintarSerieYBarras(evento);
  aplicarFase(fase);
  iniciarCuentaAtras(evento);
  montarCollage();
  montarAlbum();
  conectarVisor();
  conectarRasca();
  montarReproductor();
}

iniciar();
