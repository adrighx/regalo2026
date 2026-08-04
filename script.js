/* ============================================================
   REGALO PARA MÓNICA
   Todo el comportamiento de la página.
   Los textos y las fotos salen de config.js — aquí no hay que
   tocar nada para actualizar el contenido.
   ============================================================ */

const config = window.GIFT_CONFIG || {};

const RUTA_COLLAGE = "assets/collage/";
const RUTA_THUMBS = "assets/collage/thumb/";

/* ------------------------------------------------------------
   Utilidades
   ------------------------------------------------------------ */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// Devuelve el valor de config, o lo que ya hubiera en el HTML.
// Usa ?? en vez de || para que un 0 no se considere "vacío".
function valor(campo, porDefecto = "") {
  const v = config[campo];
  return v === undefined || v === null || v === "" ? porDefecto : v;
}

const menosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------
   1. Rellenar los textos desde config.js
   ------------------------------------------------------------ */
function rellenarTextos() {
  $$("[data-field]").forEach((nodo) => {
    nodo.textContent = String(valor(nodo.dataset.field, nodo.textContent));
  });

  $$("[data-field-href]").forEach((nodo) => {
    nodo.setAttribute("href", valor(nodo.dataset.fieldHref, nodo.getAttribute("href")));
  });
}

/* ------------------------------------------------------------
   2. ¿En qué momento estamos? antes / el día / después
   ------------------------------------------------------------ */
function calcularFase() {
  const evento = new Date(valor("eventDate", "2027-06-11T21:00:00"));
  if (Number.isNaN(evento.getTime())) return { fase: "antes", evento: null };

  const ahora = new Date();

  // El "día del concierto" dura desde las 00:00 de ese día
  // hasta las 06:00 de la mañana siguiente.
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
  document.documentElement.dataset.phase = fase;

  const textos = (config.fases || {})[fase];
  if (!textos) return;

  const etiqueta = $("#countdown-label-text");
  if (etiqueta && textos.etiqueta) etiqueta.textContent = textos.etiqueta;

  const titulo = $("#hero-title");
  if (titulo && textos.titulo) titulo.textContent = textos.titulo;

  const tituloAlbum = $("#album-title");
  if (tituloAlbum && textos.album) tituloAlbum.textContent = textos.album;
}

/* ------------------------------------------------------------
   3. Cuenta atrás (y cuenta adelante cuando ya ha pasado)
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
   4. Collage de la portada
   ------------------------------------------------------------ */
function montarCollage() {
  const contenedor = $("#hero-collage");
  if (!contenedor) return;

  const fotos = config.heroPhotos || [];
  contenedor.innerHTML = "";
  contenedor.removeAttribute("aria-hidden");

  fotos.forEach((archivo, i) => {
    // Cada foto va dentro de su celda: así se puede acercar el encuadre
    // desde el CSS sin que la imagen se salga por encima de las vecinas.
    const celda = document.createElement("div");
    celda.className = "poster-cell";

    const img = document.createElement("img");
    img.src = RUTA_THUMBS + archivo;
    img.alt = "";
    img.decoding = "async";
    // Las tres primeras entran en pantalla enseguida: sin lazy.
    img.loading = i < 3 ? "eager" : "lazy";

    celda.append(img);
    contenedor.append(celda);
  });

  // Al tocar una foto del collage se abre grande
  contenedor.addEventListener("click", (e) => {
    const celda = e.target.closest(".poster-cell");
    if (!celda) return;
    const i = Array.from(contenedor.children).indexOf(celda);
    abrirVisor(
      fotos.map((f) => RUTA_COLLAGE + f),
      i,
      "Nosotros"
    );
  });
}

/* ------------------------------------------------------------
   5. El álbum de la noche
   ------------------------------------------------------------ */
function montarAlbum() {
  const galeria = $("#album-gallery");
  if (!galeria) return;

  const album = config.album || {};
  const fotos = (album.photos || []).map((f) => (album.folder || "") + f);
  const sub = $("#album-sub");
  const fecha = valor("dateLabel", "el día del concierto");

  galeria.innerHTML = "";

  // Todavía no hay fotos: una sola tarjeta con un mensaje bonito
  if (!fotos.length) {
    galeria.classList.add("is-empty");
    galeria.innerHTML = `
      <div class="album-empty">
        <span class="album-empty-icon" aria-hidden="true">📷</span>
        <p>Este álbum todavía está en blanco.</p>
        <small>El ${fecha} empezamos a llenarlo.</small>
      </div>`;
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
    img.loading = i < 6 ? "eager" : "lazy";
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
   6. Visor de fotos (lightbox)
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

  const caja = $("#lightbox");
  caja.hidden = false;
  document.body.style.overflow = "hidden";
  pintarVisor();
  $("#lightbox-close").focus();
}

function cerrarVisor() {
  $("#lightbox").hidden = true;
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
  img.alt = `${visor.titulo} — foto ${visor.indice + 1} de ${total}`;

  $("#lightbox-caption").textContent = visor.titulo;
  $("#lightbox-counter").textContent = `${visor.indice + 1} / ${total}`;

  // Con una sola foto no tiene sentido enseñar las flechas
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

  // Clic en el fondo cierra
  caja.addEventListener("click", (e) => {
    if (e.target === caja || e.target.classList.contains("lightbox-stage")) cerrarVisor();
  });

  document.addEventListener("keydown", (e) => {
    if (caja.hidden) return;
    if (e.key === "Escape") cerrarVisor();
    if (e.key === "ArrowLeft") moverVisor(-1);
    if (e.key === "ArrowRight") moverVisor(1);
  });

  // Deslizar con el dedo en el móvil
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
   7. La sorpresa: destapar la entrada + confeti
   ------------------------------------------------------------ */
const CLAVE_ABIERTO = "regalo-monica-abierto";

function lanzarConfeti() {
  if (menosMovimiento) return;

  const colores = ["#ff2d87", "#ff7a5c", "#12d8c4", "#dcff6b", "#7b3dff", "#ffc960"];
  for (let i = 0; i < 110; i += 1) {
    const trozo = document.createElement("span");
    trozo.className = "confetti";
    trozo.style.left = `${Math.random() * 100}vw`;
    trozo.style.background = colores[i % colores.length];
    trozo.style.animationDelay = `${Math.random() * 0.4}s`;
    trozo.style.setProperty("--drift", `${Math.random() * 260 - 130}px`);
    document.body.append(trozo);
    trozo.addEventListener("animationend", () => trozo.remove());
  }
}

function destaparRegalo({ conConfeti = true } = {}) {
  const soporte = $("#ticket-holder");
  if (!soporte || soporte.dataset.locked === "false") return;

  soporte.dataset.locked = "false";
  try {
    localStorage.setItem(CLAVE_ABIERTO, "1");
  } catch (e) {
    /* navegación privada: da igual, se abrirá cada vez */
  }

  if (conConfeti) lanzarConfeti();
}

function conectarSorpresa() {
  const soporte = $("#ticket-holder");
  const botonPortada = $("#reveal-button");
  const botonTapa = $("#lock-button");
  if (!soporte) return;

  // Si ya lo abrió antes, o el concierto ya pasó, no volvemos a taparlo
  let yaAbierto = false;
  try {
    yaAbierto = localStorage.getItem(CLAVE_ABIERTO) === "1";
  } catch (e) {
    /* sin localStorage */
  }

  if (yaAbierto || document.documentElement.dataset.phase !== "antes") {
    soporte.dataset.locked = "false";
  }

  botonTapa?.addEventListener("click", () => destaparRegalo());

  botonPortada?.addEventListener("click", () => {
    $("#regalo")?.scrollIntoView({
      behavior: menosMovimiento ? "auto" : "smooth",
      block: "start"
    });
    // Pequeña espera para que el confeti caiga cuando ya se ve la entrada
    setTimeout(() => destaparRegalo(), menosMovimiento ? 0 : 650);
  });
}

/* ------------------------------------------------------------
   8. Reproductor de Spotify
   ------------------------------------------------------------ */
function montarReproductor() {
  const hueco = $("#player");
  const id = valor("playlistId", "");
  if (!hueco || !id) return;

  const iframe = document.createElement("iframe");
  // Ojo: tiene que ser la URL /embed/, la de compartir no se puede incrustar
  iframe.src = `https://open.spotify.com/embed/playlist/${id}?utm_source=generator&theme=0`;
  iframe.width = "100%";
  iframe.height = "352";
  iframe.title = "Nuestra lista de reproducción";
  iframe.loading = "lazy";
  iframe.allow =
    "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
  iframe.setAttribute("allowfullscreen", "");

  hueco.append(iframe);
}

/* ------------------------------------------------------------
   9. Animaciones de entrada al hacer scroll
   ------------------------------------------------------------ */
function conectarAnimaciones() {
  const elementos = $$(".reveal");
  if (!elementos.length) return;

  if (menosMovimiento || !("IntersectionObserver" in window)) {
    elementos.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add("is-visible");
        observador.unobserve(entrada.target);
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
  );

  elementos.forEach((el) => observador.observe(el));
}

/* ------------------------------------------------------------
   10. Arranque
   ------------------------------------------------------------ */
function iniciar() {
  const { fase, evento } = calcularFase();

  rellenarTextos();
  aplicarFase(fase);
  iniciarCuentaAtras(evento);
  montarCollage();
  montarAlbum();
  conectarVisor();
  conectarSorpresa();
  montarReproductor();
  conectarAnimaciones();
}

iniciar();
