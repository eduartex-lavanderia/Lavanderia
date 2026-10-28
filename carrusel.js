(function () {
  "use strict";

  const IMAGENES = [
    {
      src: "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=900&q=80",
      paso: "PASO 01",
      titulo: "Lavado y cuidado de prendas",
      desc: "Tratamiento ecológico con productos biodegradables para cuidar cada tejido.",
      icono: "🫧",
    },
    {
      src: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=900&q=80",
      paso: "PASO 02",
      titulo: "Secado y tendido especializado",
      desc: "Cuidado delicado para que tu ropa conserve su frescura, color y suavidad.",
      icono: "💨",
    },
    {
      src: "https://images.unsplash.com/photo-1489274495757-95c7c837b101?auto=format&fit=crop&w=900&q=80",
      paso: "PASO 03",
      titulo: "Planchado profesional detallado",
      desc: "Eliminación meticulosa de arrugas para camisas, pantalones y prendas finas.",
      icono: "👔",
    },
    {
      src: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
      paso: "PASO 04",
      titulo: "Acabado artesanal a vapor",
      desc: "Prendas suaves, desinfectadas y con presentación impecable listas para usar.",
      icono: "✨",
    },
    {
      src: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=900&q=80",
      paso: "PASO 05",
      titulo: "Empaque y envío a domicilio",
      desc: "Prendas organizadas y protegidas, entregadas puntualmente en la puerta de tu casa.",
      icono: "🚚",
    },
  ];

  const INTERVALO_MS = 4800;

  const contenedor = document.querySelector(".trust-image");
  if (!contenedor || !IMAGENES.length) return;

  // Limpiar cualquier residuo anterior para que no choque con el carrusel
  contenedor.innerHTML = "";

  const total = IMAGENES.length;
  let actual = 0;

  const raiz = document.createElement("div");
  raiz.className = "eduar-carousel";
  raiz.setAttribute("role", "region");
  raiz.setAttribute("aria-roledescription", "carrusel");
  raiz.setAttribute("aria-label", "Proceso de cuidado y lavado de prendas");
  raiz.tabIndex = 0;
  raiz.style.setProperty("--intervalo", INTERVALO_MS + "ms");

  // Encabezado decorativo del carrusel
  const encabezado = document.createElement("div");
  encabezado.className = "eduar-carousel-header";
  encabezado.innerHTML = `
    <span class="eduar-carousel-tag">
      <span class="eduar-pulse-dot"></span>
      Cuidado Experto en ${total} Pasos
    </span>
  `;
  raiz.appendChild(encabezado);

  const escenario = document.createElement("div");
  escenario.className = "eduar-stage gif-scroll-item";

  const slides = IMAGENES.map(function (item, i) {
    const fig = document.createElement("figure");
    fig.className = "eduar-slide" + (i === 0 ? " is-active" : "");
    fig.setAttribute("aria-hidden", i === 0 ? "false" : "true");

    // Badge superior que indica el número de paso
    const badgeTop = document.createElement("div");
    badgeTop.className = "eduar-slide-pill";
    badgeTop.innerHTML = `<span>${item.icono}</span> <span>${item.paso}</span>`;
    fig.appendChild(badgeTop);

    const img = new Image();
    img.alt = item.titulo || "Proceso de lavandería";
    img.className = "eduar-slide-img";
    img.decoding = "async";
    if (i > 0) img.loading = "lazy";

    img.addEventListener("error", function () {
      img.remove();
      const respaldo = document.createElement("div");
      respaldo.className = "eduar-slide-fallback";
      respaldo.textContent = item.icono || "🫧";
      fig.insertBefore(respaldo, fig.firstChild);
    });

    img.src = item.src;
    fig.appendChild(img);

    const cap = document.createElement("figcaption");
    cap.className = "eduar-slide-caption";
    cap.innerHTML = `
      <div class="eduar-caption-badge">${item.paso}</div>
      <h3 class="eduar-caption-title">${item.titulo}</h3>
      <p class="eduar-caption-desc">${item.desc}</p>
    `;
    fig.appendChild(cap);

    escenario.appendChild(fig);
    return fig;
  });

  raiz.appendChild(escenario);

  let puntos = [];

  if (total > 1) {
    const flecha = function (clase, etiqueta, trazo) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "eduar-arrow " + clase;
      b.setAttribute("aria-label", etiqueta);
      b.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' +
        trazo +
        '"/></svg>';
      return b;
    };

    const anterior = flecha("prev", "Paso anterior", "M15 18l-6-6 6-6");
    const siguiente = flecha("next", "Paso siguiente", "M9 6l6 6-6 6");

    anterior.addEventListener("click", function (e) {
      e.stopPropagation();
      mostrar(actual - 1);
    });
    siguiente.addEventListener("click", function (e) {
      e.stopPropagation();
      mostrar(actual + 1);
    });

    escenario.appendChild(anterior);
    escenario.appendChild(siguiente);

    // Barra de controles inferior
    const controles = document.createElement("div");
    controles.className = "eduar-controls-bar";

    const contador = document.createElement("div");
    contador.className = "eduar-counter";
    contador.innerHTML = `<span class="eduar-curr">01</span><span class="eduar-sep">/</span><span class="eduar-total">0${total}</span>`;
    controles.appendChild(contador);

    const cajaPuntos = document.createElement("div");
    cajaPuntos.className = "eduar-dots";

    puntos = IMAGENES.map(function (item, i) {
      const p = document.createElement("button");
      p.type = "button";
      p.className = "eduar-dot" + (i === 0 ? " is-active" : "");
      p.setAttribute(
        "aria-label",
        "Ir al " + item.paso + ": " + (item.titulo || "")
      );
      if (i === 0) p.setAttribute("aria-current", "true");
      p.addEventListener("click", function () {
        mostrar(i);
      });
      cajaPuntos.appendChild(p);
      return p;
    });

    cajaPuntos.addEventListener("animationend", function (e) {
      if (e.animationName === "eduar-dotfill") mostrar(actual + 1);
    });

    controles.appendChild(cajaPuntos);
    raiz.appendChild(controles);
  }

  contenedor.appendChild(raiz);

  function mostrar(n) {
    actual = (n + total) % total;

    slides.forEach(function (s, i) {
      const activa = i === actual;
      s.classList.toggle("is-active", activa);
      s.setAttribute("aria-hidden", activa ? "false" : "true");
    });

    puntos.forEach(function (p, i) {
      const activo = i === actual;
      p.classList.toggle("is-active", activo);
      if (activo) p.setAttribute("aria-current", "true");
      else p.removeAttribute("aria-current");
    });

    const contador = raiz.querySelector(".eduar-curr");
    if (contador) {
      contador.textContent = "0" + (actual + 1);
    }
  }

  // Pausa en hover y foco
  raiz.addEventListener("pointerenter", function (e) {
    if (e.pointerType === "mouse") raiz.classList.add("is-paused");
  });

  raiz.addEventListener("pointerleave", function () {
    if (
      !raiz.querySelector(":focus-visible") &&
      !raiz.matches(":focus-visible")
    ) {
      raiz.classList.remove("is-paused");
    }
  });

  raiz.addEventListener("focusin", function (e) {
    if (e.target.matches(":focus-visible")) raiz.classList.add("is-paused");
  });

  raiz.addEventListener("focusout", function () {
    raiz.classList.remove("is-paused");
  });

  raiz.addEventListener("keydown", function (e) {
    if (total < 2) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      mostrar(actual + 1);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      mostrar(actual - 1);
    }
  });

  // Gestos táctiles
  let inicioX = null;
  let inicioY = null;

  escenario.addEventListener(
    "pointerdown",
    function (e) {
      inicioX = e.clientX;
      inicioY = e.clientY;
    },
    { passive: true }
  );

  escenario.addEventListener(
    "pointerup",
    function (e) {
      if (inicioX === null || total < 2) return;
      const dx = e.clientX - inicioX;
      const dy = e.clientY - (inicioY || e.clientY);
      inicioX = null;
      inicioY = null;
      // Solo responder a swipes horizontales
      if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy)) {
        mostrar(actual + (dx < 0 ? 1 : -1));
      }
    },
    { passive: true }
  );

  escenario.addEventListener("pointercancel", function () {
    inicioX = null;
    inicioY = null;
  });
})();
