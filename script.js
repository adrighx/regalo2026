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
  // Fecha fijada a fuego: 11 de Junio de 2027 a las 21:00h
  const eventTime = new Date("2027-06-11T21:00:00").getTime();
  const ids = ["days", "hours", "minutes", "seconds"];
  
  if (!Number.isFinite(eventTime)) return;

  const titleNode = document.getElementById("countdown-title");

  const tick = () => {
    const now = Date.now();
    const isFuture = eventTime > now;
    const distance = Math.abs(eventTime - now);

    if (titleNode) {
      if (isFuture) {
        titleNode.textContent = "Faltan para la gran noche:";
      } else {
        titleNode.textContent = "Tiempo desde nuestra noche mágica:";
      }
    }

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

// Inicialización de todas las funciones
hydrateFields();
updateCountdown();
setupReveal();
setupQr();