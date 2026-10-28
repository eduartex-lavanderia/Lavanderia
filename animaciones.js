(function () {
  "use strict";

  const reducirMovimiento = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const conMouse = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;
  const raiz = document.documentElement;

  // LOGO DEL NAV: GIF una sola vez y luego imagen fija
  const logoNav = document.getElementById("logo-nav");

  if (logoNav) {
    const logoSrc = logoNav.getAttribute("data-logo-fijo");

    function mostrarLogoFijo() {
      if (logoSrc && logoNav.getAttribute("src") !== logoSrc) {
        logoNav.src = logoSrc;
      }
    }

    if (reducirMovimiento) {
      mostrarLogoFijo();
    } else {
      if (logoSrc) {
        const precarga = new Image();
        precarga.src = logoSrc;
      }

      let programado = false;

      function programarCambio() {
        if (programado) return;
        programado = true;
        setTimeout(mostrarLogoFijo, 1220);
      }

      if (logoNav.complete) {
        programarCambio();
      } else {
        logoNav.addEventListener("load", programarCambio, { once: true });
      }
    }
  }

  if (conMouse) {
    const punto = document.createElement("div");
    punto.className = "eduar-cursor-dot";
    const anillo = document.createElement("div");
    anillo.className = "eduar-cursor-ring";
    document.body.appendChild(anillo);
    document.body.appendChild(punto);

    raiz.classList.add("eduar-cursor");

    const INTERACTIVOS =
      'a, button, summary, label, [role="button"], input[type="radio"], input[type="checkbox"]';
    const TEXTO =
      'input[type="text"], input[type="email"], input[type="search"], input[type="tel"], input:not([type]), textarea';

    let mx = -100,
      my = -100;
    let rx = -100,
      ry = -100;
    let corriendo = false;

    function pintar() {
      punto.style.transform =
        "translate3d(" + mx + "px," + my + "px,0) translate(-50%,-50%)";
      anillo.style.transform =
        "translate3d(" + rx + "px," + ry + "px,0) translate(-50%,-50%)";
    }

    function seguir() {
      const factor = reducirMovimiento ? 1 : 0.18;
      rx += (mx - rx) * factor;
      ry += (my - ry) * factor;
      pintar();

      if (Math.abs(mx - rx) > 0.1 || Math.abs(my - ry) > 0.1) {
        requestAnimationFrame(seguir);
      } else {
        rx = mx;
        ry = my;
        pintar();
        corriendo = false;
      }
    }

    document.addEventListener("mousemove", function (e) {
      mx = e.clientX;
      my = e.clientY;

      if (!raiz.classList.contains("eduar-cursor-on")) {
        rx = mx;
        ry = my;
        raiz.classList.add("eduar-cursor-on");
      }

      const el = e.target instanceof Element ? e.target : null;
      raiz.classList.toggle("eduar-cursor-text", !!(el && el.closest(TEXTO)));
      raiz.classList.toggle(
        "eduar-cursor-hover",
        !!(el && el.closest(INTERACTIVOS))
      );

      if (!corriendo) {
        corriendo = true;
        requestAnimationFrame(seguir);
      }
    });

    document.addEventListener("mousedown", function () {
      raiz.classList.add("eduar-cursor-down");
    });
    document.addEventListener("mouseup", function () {
      raiz.classList.remove("eduar-cursor-down");
    });

    raiz.addEventListener("mouseleave", function () {
      raiz.classList.remove("eduar-cursor-on");
    });
    raiz.addEventListener("mouseenter", function () {
      raiz.classList.add("eduar-cursor-on");
    });
  }

  if (!reducirMovimiento) {
    raiz.classList.add("eduar-smooth");

    let objetivo = window.scrollY;
    let actual = objetivo;
    let animando = false;

    function limiteScroll() {
      return Math.max(0, raiz.scrollHeight - window.innerHeight);
    }

    function acotar(y) {
      return Math.min(Math.max(y, 0), limiteScroll());
    }

    function paso() {
      const dif = objetivo - actual;

      if (Math.abs(dif) < 0.5) {
        actual = objetivo;
        window.scrollTo(0, actual);
        animando = false;
        return;
      }

      actual += dif * 0.11;
      window.scrollTo(0, actual);
      requestAnimationFrame(paso);
    }

    function iniciar() {
      if (!animando) {
        animando = true;
        requestAnimationFrame(paso);
      }
    }

    function irA(y) {
      if (!animando) actual = window.scrollY;
      objetivo = acotar(y);
      iniciar();
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!animando) {
          actual = objetivo = window.scrollY;
        }
      },
      { passive: true }
    );

    function tieneScrollPropio(el) {
      while (el && el !== document.body && el !== raiz) {
        const estilo = getComputedStyle(el);
        if (
          /(auto|scroll)/.test(estilo.overflowY) &&
          el.scrollHeight > el.clientHeight + 1
        ) {
          return true;
        }
        el = el.parentElement;
      }
      return false;
    }

    window.addEventListener(
      "wheel",
      function (e) {
        if (e.ctrlKey || e.defaultPrevented) return;
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

        const el = e.target instanceof Element ? e.target : null;
        if (el && (el.closest(".eduar-chat") || tieneScrollPropio(el))) return;

        e.preventDefault();

        let delta = e.deltaY;
        if (e.deltaMode === 1) delta *= 32;
        else if (e.deltaMode === 2) delta *= window.innerHeight;

        if (!animando) actual = objetivo = window.scrollY;
        objetivo = acotar(objetivo + delta);
        iniciar();
      },
      { passive: false }
    );

    document.addEventListener("click", function (e) {
      const enlace =
        e.target instanceof Element ? e.target.closest('a[href^="#"]') : null;
      if (!enlace) return;

      const hash = enlace.getAttribute("href");

      if (hash === "#") {
        e.preventDefault();
        return;
      }

      const destino = document.querySelector(hash);
      if (!destino) return;

      e.preventDefault();

      const header = document.querySelector(".header");
      const alto = header ? header.offsetHeight : 0;
      const y = destino.getBoundingClientRect().top + window.scrollY - alto + 1;

      irA(y);
      history.pushState(null, "", hash);
    });
  } else {
    document.addEventListener("click", function (e) {
      const enlace =
        e.target instanceof Element ? e.target.closest('a[href="#"]') : null;
      if (enlace) e.preventDefault();
    });
  }

  const barra = document.createElement("div");
  barra.className = "eduar-progress";
  document.body.appendChild(barra);

  const header = document.querySelector(".header");
  let pendiente = false;

  function actualizarScroll() {
    pendiente = false;
    const max = raiz.scrollHeight - window.innerHeight;
    const progreso = max > 0 ? window.scrollY / max : 0;
    barra.style.transform =
      "scaleX(" + Math.min(Math.max(progreso, 0), 1) + ")";
    if (header) header.classList.toggle("eduar-scrolled", window.scrollY > 10);
  }

  function pedirActualizacion() {
    if (!pendiente) {
      pendiente = true;
      requestAnimationFrame(actualizarScroll);
    }
  }

  window.addEventListener("scroll", pedirActualizacion, { passive: true });
  window.addEventListener("resize", pedirActualizacion);
  actualizarScroll();

  const secciones = [
    ["#inicio", ".hero"],
    ["#funciona", "#funciona"],
    ["#servicios", "#servicios"],
    ["#precios", "#precios"],
    ["#preguntas", "#preguntas"],
    ["#ubicacion", "#ubicacion"],
  ];

  if ("IntersectionObserver" in window) {
    const enlacesMenu = document.querySelectorAll(".navbar a");

    const espia = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (entrada) {
          if (!entrada.isIntersecting) return;
          const id = entrada.target.getAttribute("data-eduar-spy");
          enlacesMenu.forEach(function (a) {
            a.classList.toggle("eduar-active", a.getAttribute("href") === id);
          });
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    secciones.forEach(function (par) {
      const el = document.querySelector(par[1]);
      if (el) {
        el.setAttribute("data-eduar-spy", par[0]);
        espia.observe(el);
      }
    });
  }

  if (!reducirMovimiento && "IntersectionObserver" in window) {
    const observador = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (entrada) {
          if (!entrada.isIntersecting) return;

          const el = entrada.target;
          observador.unobserve(el);
          el.classList.add("eduar-in");

          const espera =
            800 +
            (parseInt(el.style.getPropertyValue("--eduar-delay"), 10) || 0) +
            150;
          setTimeout(function () {
            el.classList.remove(
              "eduar-reveal",
              "eduar-reveal--zoom",
              "eduar-in"
            );
            el.style.removeProperty("--eduar-delay");
          }, espera);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
    );

    function preparar(el, tipo) {
      if (el.getAttribute("data-eduar-reveal")) return;
      el.setAttribute("data-eduar-reveal", "1");

      const indice = Array.prototype.indexOf.call(
        el.parentElement.children,
        el
      );
      el.style.setProperty("--eduar-delay", Math.min(indice * 90, 450) + "ms");

      el.classList.add("eduar-reveal");
      if (tipo) el.classList.add("eduar-reveal--" + tipo);

      observador.observe(el);
    }

    const GRUPOS = [
      [".section-title", ""],
      [".service-card", ""],
      [".service-photo-card", ""],
      [".price-simulator", ""],
      [".price-card", ""],
      [".trust-image", "zoom"],
      [".trust-content", ""],
      [".benefit", ""],
      [".cta-content", ""],
      [".cta-benefits > div", ""],
      [".faq-column", ""],
      [".location-column", "zoom"],
      [".faq details", ""],
    ];

    function registrarTodo(base) {
      GRUPOS.forEach(function (g) {
        base.querySelectorAll(g[0]).forEach(function (el) {
          preparar(el, g[1]);
        });
      });
    }

    registrarTodo(document);

    const contenedorServicios = document.getElementById("services-container");
    if (contenedorServicios) {
      new MutationObserver(function () {
        registrarTodo(contenedorServicios);
      }).observe(contenedorServicios, { childList: true });
    }
  }

  // =====================================================
  // PASOS "CÓMO FUNCIONA": APARICIÓN SECUENCIAL
  // =====================================================
  const contenedorPasos = document.querySelector(".steps");

  if (contenedorPasos && !reducirMovimiento) {
    const pasos = Array.prototype.slice.call(
      contenedorPasos.querySelectorAll(".step")
    );

    contenedorPasos.classList.add("steps-ready");

    let pasosActivados = false;

    function mostrarPasos() {
      pasos.forEach(function (paso, indice) {
        setTimeout(function () {
          paso.classList.add("step-visible");
        }, indice * 520);
      });
    }

    if ("IntersectionObserver" in window) {
      const observadorPasos = new IntersectionObserver(
        function (entradas) {
          entradas.forEach(function (entrada) {
            if (!entrada.isIntersecting || pasosActivados) return;

            pasosActivados = true;
            observadorPasos.disconnect();
            mostrarPasos();
          });
        },
        { threshold: 0.35 }
      );

      observadorPasos.observe(contenedorPasos);
    } else {
      mostrarPasos();
    }
  }

  if (!reducirMovimiento) {
    const BOTONES =
      ".header-button, .primary-button, .secondary-button, .order-button, .cta-button, .cotizar-button, .see-prices";

    document.addEventListener("click", function (e) {
      const boton =
        e.target instanceof Element ? e.target.closest(BOTONES) : null;
      if (!boton) return;

      const r = boton.getBoundingClientRect();
      const tam = Math.max(r.width, r.height) * 2;

      const onda = document.createElement("span");
      onda.className = "eduar-ripple";
      onda.style.width = tam + "px";
      onda.style.height = tam + "px";
      onda.style.left = e.clientX - r.left - tam / 2 + "px";
      onda.style.top = e.clientY - r.top - tam / 2 + "px";

      boton.appendChild(onda);
      setTimeout(function () {
        onda.remove();
      }, 650);
    });
  }

  document.querySelectorAll(".faq details").forEach(function (det) {
    const resumen = det.querySelector("summary");
    if (!resumen) return;

    let animacion = null;

    function alturaCerrada() {
      const e = getComputedStyle(det);
      return (
        resumen.offsetHeight +
        parseFloat(e.paddingTop) +
        parseFloat(e.paddingBottom) +
        parseFloat(e.borderTopWidth) +
        parseFloat(e.borderBottomWidth)
      );
    }

    function terminar(abierto) {
      det.open = abierto;
      det.classList.toggle("eduar-open", abierto);
      det.style.height = "";
      det.style.overflow = "";
      animacion = null;
    }

    function animar(desde, hasta, abrir) {
      det.style.overflow = "hidden";

      if (animacion) animacion.cancel();

      animacion = det.animate(
        { height: [desde + "px", hasta + "px"] },
        { duration: 380, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" }
      );

      animacion.onfinish = function () {
        terminar(abrir);
      };
      animacion.oncancel = function () {
        animacion = null;
      };
    }

    resumen.addEventListener("click", function (e) {
      e.preventDefault();

      if (reducirMovimiento) {
        det.open = !det.open;
        det.classList.toggle("eduar-open", det.open);
        return;
      }

      const desde = det.offsetHeight;

      if (!det.open || det.classList.contains("eduar-cerrando")) {
        det.classList.remove("eduar-cerrando");
        det.style.height = desde + "px";
        det.open = true;
        det.classList.add("eduar-open");
        const hasta = det.scrollHeight;
        animar(desde, hasta, true);
      } else {
        det.classList.remove("eduar-open");
        det.classList.add("eduar-cerrando");
        animar(desde, alturaCerrada(), false);
        if (animacion) {
          const previo = animacion.onfinish;
          animacion.onfinish = function () {
            det.classList.remove("eduar-cerrando");
            previo();
          };
        }
      }
    });
  });

  // =====================================================
  // ANIMACIÓN INTERACTIVA DE GIFS AL HACER SCROLL
  // =====================================================
  if (!reducirMovimiento) {
    let animandoGifs = false;

    function actualizarGifsScroll() {
      animandoGifs = false;
      const vh = window.innerHeight;
      const elementos = document.querySelectorAll(
        ".gif-scroll-item, .service-gif-card, .eduar-stage"
      );

      elementos.forEach(function (el) {
        const r = el.getBoundingClientRect();
        // Comprobar si el elemento está pasando por la pantalla
        if (r.top < vh + 60 && r.bottom > -60) {
          el.classList.add("gif-in-view");

          // Posición relativa al centro del viewport (-1 arriba, 0 centro, +1 abajo)
          const centroElem = r.top + r.height / 2;
          const distCentro = (centroElem - vh / 2) / (vh / 2);
          const progreso = Math.max(-1.2, Math.min(1.2, distCentro));

          // Parallax suave y ligera inclinación 3D
          const ty = progreso * -14;
          const rx = progreso * 2.5;
          const escala = 1 + (1 - Math.min(1, Math.abs(progreso))) * 0.025;

          el.style.setProperty("--gif-ty", ty.toFixed(1) + "px");
          el.style.setProperty("--gif-rx", rx.toFixed(2) + "deg");
          el.style.setProperty("--gif-scale", escala.toFixed(3));
        } else {
          el.classList.remove("gif-in-view");
        }
      });
    }

    function pedirGifsScroll() {
      if (!animandoGifs) {
        animandoGifs = true;
        requestAnimationFrame(actualizarGifsScroll);
      }
    }

    window.addEventListener("scroll", pedirGifsScroll, { passive: true });
    window.addEventListener("resize", pedirGifsScroll, { passive: true });

    // Ejecución inicial y diferida para atrapar elementos generados dinámicamente
    setTimeout(actualizarGifsScroll, 120);
    setTimeout(actualizarGifsScroll, 600);
  }

  // =====================================================
  // EFECTO MÁQUINA DE ESCRIBIR (TYPING) EN EL HERO
  // =====================================================
  const lineasTipeo = document.querySelectorAll("[data-typing]");

  if (lineasTipeo.length) {
    lineasTipeo.forEach(function (linea) {
      linea.textContent = "";
    });

    const ultimaLinea = lineasTipeo[lineasTipeo.length - 1];
    const elementosHero = document.querySelectorAll(".hero .typing-pending");

    function revelarHero() {
      elementosHero.forEach(function (el, i) {
        setTimeout(function () {
          el.classList.add("typing-shown");
        }, i * 140);
      });
    }

    if (reducirMovimiento) {
      lineasTipeo.forEach(function (linea) {
        linea.textContent = linea.getAttribute("data-typing");
      });

      elementosHero.forEach(function (el) {
        el.classList.add("typing-shown");
      });
    } else {
      let indiceLinea = 0;
      let indiceLetra = 0;
      let lineaActual = lineasTipeo[0];

      lineaActual.classList.add("is-typing");

      function escribir() {
        const texto = lineaActual.getAttribute("data-typing");

        if (indiceLetra <= texto.length) {
          lineaActual.textContent = texto.slice(0, indiceLetra);
          indiceLetra++;
          setTimeout(escribir, 38);
          return;
        }

        lineaActual.classList.remove("is-typing");

        indiceLinea++;

        if (indiceLinea < lineasTipeo.length) {
          lineaActual = lineasTipeo[indiceLinea];
          lineaActual.classList.add("is-typing");
          indiceLetra = 0;
          setTimeout(escribir, 180);
        } else {
          ultimaLinea.classList.add("is-done");
          revelarHero();
        }
      }

      setTimeout(escribir, 250);
    }
  }
})();
