const config = window.GIFT_CONFIG || {};

function text(field, fallback = "") {
  return config[field] || fallback;
}

function hydrateFields() {
  document.querySelectorAll("[data-field]").forEach((node) => {
    const value = text(node.dataset.field, node.textContent);
    node.textContent = value;
  });

  document.querySelectorAll("[data-field-href]").forEach((node) => {
    const value = text(node.dataset.fieldHref, node.getAttribute("href"));
    node.setAttribute("href", value);
  });
}

function updateCountdown() {
  const eventTime = new Date(text("eventDate")).getTime();
  const ids = ["days", "hours", "minutes", "seconds"];
  if (!Number.isFinite(eventTime)) return;

  // Capturamos el elemento de texto que acabamos de crear en el HTML
  const titleNode = document.getElementById("countdown-title");

  const tick = () => {
    const now = Date.now();
    
    // Evaluamos si el concierto está en el futuro (true) o en el pasado (false)
    const isFuture = eventTime > now;
    
    // Usamos Math.abs() para obtener la distancia siempre en positivo
    const distance = Math.abs(eventTime - now);

    // Manipulamos el DOM: cambiamos el texto según el estado de la variable booleana
    if (titleNode) {
      if (isFuture) {
        titleNode.textContent = "Faltan para el gran día:";
      } else {
        titleNode.textContent = "Tiempo desde este incríble día:";
      }
    }

    // El cálculo matemático se mantiene intacto
    const days = Math.floor(distance / 86400000);
    const hours = Math.floor((distance % 86400000) / 3600000);
    const minutes = Math.floor((distance % 3600000) / 60000);
    const seconds = Math.floor((distance % 60000) / 1000);
    
    [days, hours, minutes, seconds].forEach((value, index) => {
      const node = document.getElementById(ids[index]);
      if (node) node.textContent = String(value).padStart(2, "0");
    });
  };

  tick();
  setInterval(tick, 1000);
}

function burstConfetti() {
  const colors = ["#ff4fa3", "#ff745c", "#2dd6c6", "#d8ff67", "#6e4cff"];
  for (let index = 0; index < 90; index += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = colors[index % colors.length];
    piece.style.animationDelay = `${Math.random() * 0.32}s`;
    piece.style.setProperty("--drift", `${Math.random() * 220 - 110}px`);
    document.body.append(piece);
    piece.addEventListener("animationend", () => piece.remove());
  }
}

function setupReveal() {
  const button = document.getElementById("reveal-button");
  const ticket = document.getElementById("ticket");
  if (!button || !ticket) return;

  button.addEventListener("click", () => {
    ticket.scrollIntoView({ behavior: "smooth", block: "start" });
    burstConfetti();
  });
}

function setupQr() {
  const qr = document.getElementById("qr-code");
  const caption = document.getElementById("qr-url");
  if (!qr) return;

  const publicUrl = text("publicUrl", window.location.href);
  const qrUrl = new URL("https://api.qrserver.com/v1/create-qr-code/");
  qrUrl.searchParams.set("size", "900x900");
  qrUrl.searchParams.set("margin", "20");
  qrUrl.searchParams.set("data", publicUrl);

  qr.src = qrUrl.toString();
  if (caption) caption.textContent = publicUrl;
}

function setupInteractiveAlbum() {
  const modal = document.getElementById("album-modal");
  const modalImg = document.getElementById("modal-img");
  const modalCaption = document.getElementById("modal-caption");
  const btnClose = document.getElementById("modal-close");
  const btnPrev = document.getElementById("modal-prev");
  const btnNext = document.getElementById("modal-next");

  if (!modal || !modalImg) return;

  let currentAlbumImages = [];
  let currentIndex = 0;

  // Abrir el álbum al hacer clic en una Polaroid
  document.querySelectorAll(".polaroid").forEach((polaroid) => {
    polaroid.addEventListener("click", () => {
      const imagesString = polaroid.dataset.images;
      const albumTitle = polaroid.dataset.album;

      if (!imagesString) return;

      // Convertimos el string separado por comas en un Array de rutas
      currentAlbumImages = imagesString.split(",");
      currentIndex = 0;

      // Actualizamos el modal con la primera foto
      modalImg.src = currentAlbumImages[currentIndex];
      if (modalCaption) modalCaption.textContent = albumTitle;

      // Mostramos el modal
      modal.classList.add("active");
      document.body.style.overflow = "hidden"; // Bloquea el scroll de fondo
    });
  });

  // Funciones de navegación
  const showNextImage = () => {
    currentIndex = (currentIndex + 1) % currentAlbumImages.length;
    modalImg.src = currentAlbumImages[currentIndex];
  };

  const showPrevImage = () => {
    currentIndex = (currentIndex - 1 + currentAlbumImages.length) % currentAlbumImages.length;
    modalImg.src = currentAlbumImages[currentIndex];
  };

  const closeModal = () => {
    modal.classList.remove("active");
    document.body.style.overflow = ""; // Restaura el scroll
  };

  // Event Listeners de los botones del modal
  btnNext.addEventListener("click", (e) => { e.stopPropagation(); showNextImage(); });
  btnPrev.addEventListener("click", (e) => { e.stopPropagation(); showPrevImage(); });
  btnClose.addEventListener("click", closeModal);
  modal.addEventListener("click", closeModal); // Cierra también si hace clic fuera de la foto

  // Evita que al hacer clic en la foto misma se cierre el modal
  modalImg.addEventListener("click", (e) => e.stopPropagation());

  // Soporte para teclado (Flechas e Escape)
  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("active")) return;
    if (e.key === "ArrowRight") showNextImage();
    if (e.key === "ArrowLeft") showPrevImage();
    if (e.key === "Escape") closeModal();
  });
}

setupInteractiveAlbum();
hydrateFields();
updateCountdown();
setupReveal();
setupQr();
