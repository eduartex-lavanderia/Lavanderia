(function () {
  "use strict";

  const WHATSAPP_ASESOR = "573118690495";
  const NOMBRE_NEGOCIO = "Lavaseco EDUARTEX";

  const SERVICIOS_RESPALDO = [
    {
      nombre: "Lavado y secado",
      descripcion: "Lavamos y secamos tus prendas con cuidado y calidad.",
      icono: "🧺",
    },
    {
      nombre: "Planchado",
      descripcion: "Dejamos tus prendas listas, organizadas y presentables.",
      icono: "👕",
    },
    {
      nombre: "Prendas especiales",
      descripcion: "Cuidado especial para prendas delicadas y especiales.",
      icono: "✨",
    },
    {
      nombre: "Calzado",
      descripcion: "Limpieza y cuidado para tus zapatos y calzado.",
      icono: "👟",
    },
  ];

  let servicios = SERVICIOS_RESPALDO;

  const estado = {
    modo: "libre",
    servicio: "",
    direccion: "",
    nombre: "",
    temas: [],
    intentosFallidos: 0,
  };

  let cola = Promise.resolve();
  let abierto = false;
  let saludoMostrado = false;

  const ICONO_WA =
    '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16.04 3C9.4 3 4 8.4 4 15.03c0 2.12.56 4.19 1.61 6.02L4 28l7.1-1.86a12.03 12.03 0 0 0 4.94 1.06h.01C22.68 27.2 28 21.8 28 15.17 28 8.4 22.68 3 16.04 3Zm0 21.9h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-4.21 1.1 1.12-4.1-.24-.38a9.9 9.9 0 0 1-1.52-5.3c0-5.47 4.46-9.92 9.95-9.92 5.48 0 9.94 4.45 9.94 9.93 0 5.48-4.46 9.26-9.63 9.26Zm5.45-7.43c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z"/></svg>';

  const ICONO_ENVIAR =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"/></svg>';

  function normalizar(texto) {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function hora() {
    return new Date().toLocaleTimeString("es-CO", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function pausa(ms) {
    return new Promise(function (r) {
      setTimeout(r, ms);
    });
  }

  function marcarTema(tema) {
    if (estado.temas.indexOf(tema) === -1) estado.temas.push(tema);
  }

  function enlaceWhatsApp(mensaje) {
    return (
      "https://wa.me/" +
      WHATSAPP_ASESOR +
      "?text=" +
      encodeURIComponent(mensaje)
    );
  }

  const launcher = document.createElement("button");
  launcher.className = "eduar-launcher";
  launcher.setAttribute("aria-label", "Abrir chat de " + NOMBRE_NEGOCIO);
  launcher.innerHTML =
    ICONO_WA + '<span class="eduar-badge" id="eduar-badge">1</span>';

  const tip = document.createElement("div");
  tip.className = "eduar-tip";
  tip.hidden = true;
  tip.textContent = "👋 ¿Necesitas ayuda con tu ropa? Escríbenos aquí.";

  const chat = document.createElement("div");
  chat.className = "eduar-chat";
  chat.setAttribute("role", "dialog");
  chat.setAttribute("aria-label", "Chat de " + NOMBRE_NEGOCIO);
  chat.innerHTML =
    '<div class="eduar-head">' +
    '<div class="eduar-avatar">🧺</div>' +
    '<div class="eduar-info"><strong>' +
    NOMBRE_NEGOCIO +
    "</strong><span>Asistente virtual · en línea</span></div>" +
    '<button class="eduar-close" aria-label="Cerrar chat">×</button>' +
    "</div>" +
    '<div class="eduar-messages" id="eduar-messages" aria-live="polite"><div class="eduar-day">Hoy</div></div>' +
    '<div class="eduar-input">' +
    '<input type="text" id="eduar-text" placeholder="Escribe un mensaje" autocomplete="off" aria-label="Escribe un mensaje">' +
    '<button class="eduar-send" aria-label="Enviar">' +
    ICONO_ENVIAR +
    "</button>" +
    "</div>";

  document.body.appendChild(launcher);
  document.body.appendChild(tip);
  document.body.appendChild(chat);

  const contenedor = chat.querySelector("#eduar-messages");
  const campo = chat.querySelector("#eduar-text");
  const badge = launcher.querySelector("#eduar-badge");

  function bajar() {
    contenedor.scrollTop = contenedor.scrollHeight;
  }

  function quitarRapidas() {
    contenedor.querySelectorAll(".eduar-quick").forEach(function (q) {
      q.remove();
    });
  }

  function agregarMensaje(contenido, quien, esHtml) {
    const m = document.createElement("div");
    m.className = "eduar-msg " + quien;

    const cuerpo = document.createElement("div");
    if (esHtml) cuerpo.innerHTML = contenido;
    else cuerpo.textContent = contenido;
    m.appendChild(cuerpo);

    const t = document.createElement("div");
    t.className = "eduar-time";
    t.innerHTML =
      hora() + (quien === "user" ? ' <span class="check">✓✓</span>' : "");
    m.appendChild(t);

    contenedor.appendChild(m);
    bajar();
    return m;
  }

  function agregarRapidas(opciones) {
    if (!opciones || !opciones.length) return;
    const caja = document.createElement("div");
    caja.className = "eduar-quick";

    opciones.forEach(function (op) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = op.texto;
      b.addEventListener("click", function () {
        quitarRapidas();
        agregarMensaje(op.texto, "user");
        ejecutar(op.accion);
      });
      caja.appendChild(b);
    });

    contenedor.appendChild(caja);
    bajar();
  }

  function agregarBotonWhatsApp(mensaje, etiqueta) {
    const a = document.createElement("a");
    a.className = "eduar-wa-link";
    a.href = enlaceWhatsApp(mensaje);
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.innerHTML = ICONO_WA + "<span>" + etiqueta + "</span>";

    const ultimo = contenedor.querySelector(".eduar-msg.bot:last-of-type");
    (ultimo || contenedor).appendChild(a);
    bajar();
  }

  function botDice(textos, rapidas, whatsapp) {
    if (typeof textos === "string") textos = [textos];

    cola = cola.then(async function () {
      for (let i = 0; i < textos.length; i++) {
        const escribiendo = document.createElement("div");
        escribiendo.className = "eduar-typing";
        escribiendo.innerHTML = "<i></i><i></i><i></i>";
        contenedor.appendChild(escribiendo);
        bajar();

        await pausa(600 + Math.min(textos[i].length * 8, 900));
        escribiendo.remove();
        agregarMensaje(textos[i], "bot", true);
      }

      if (whatsapp) agregarBotonWhatsApp(whatsapp.mensaje, whatsapp.etiqueta);
      agregarRapidas(rapidas);
    });
  }

  const MENU = [
    { texto: "Servicios", accion: "servicios" },
    { texto: "Precios", accion: "precios" },
    { texto: "Pedir domicilio", accion: "domicilio" },
    { texto: "¿Cómo funciona?", accion: "como" },
    { texto: "Formas de pago", accion: "pagos" },
    { texto: "Hablar con un asesor", accion: "asesor" },
  ];

  const MAS_AYUDA = [
    { texto: "Pedir domicilio", accion: "domicilio" },
    { texto: "Hablar con un asesor", accion: "asesor" },
    { texto: "Ver menú", accion: "menu" },
  ];

  function resumenParaAsesor(titulo) {
    let msg = titulo;
    if (estado.nombre) msg += "\nNombre: " + estado.nombre;
    if (estado.servicio) msg += "\nServicio: " + estado.servicio;
    if (estado.direccion) msg += "\nDirección: " + estado.direccion;
    if (estado.temas.length)
      msg += "\nConsulté sobre: " + estado.temas.join(", ");
    return msg;
  }

  function ejecutar(accion) {
    switch (accion) {
      case "menu":
        estado.modo = "libre";
        botDice("¿En qué más te puedo ayudar? 👇", MENU);
        break;

      case "servicios": {
        marcarTema("servicios");
        const lista = servicios
          .map(function (s) {
            return (
              s.icono + " <strong>" + s.nombre + "</strong><br>" + s.descripcion
            );
          })
          .join("<br><br>");
        botDice(["Estos son nuestros servicios:", lista], MAS_AYUDA);
        break;
      }

      case "precios":
        marcarTema("precios");
        botDice(
          [
            "El valor depende del tipo de prenda, la cantidad y el servicio que necesites, por eso cotizamos de forma personalizada. 📝",
            "Un asesor te ayuda con la cotización por WhatsApp.",
          ],
          [{ texto: "Ver menú", accion: "menu" }],
          {
            mensaje: resumenParaAsesor(
              "Hola, quiero cotizar un servicio en " + NOMBRE_NEGOCIO + "."
            ),
            etiqueta: "Cotizar con un asesor",
          }
        );
        break;

      case "como":
        marcarTema("cómo funciona");
        botDice(
          [
            "Es muy sencillo:<br><br>" +
              "1️⃣ <strong>Agenda:</strong> eliges el día y la hora de recogida.<br>" +
              "2️⃣ <strong>Recogemos:</strong> nuestro domiciliario pasa por tu dirección.<br>" +
              "3️⃣ <strong>Lavamos:</strong> lavamos y secamos con productos de calidad.<br>" +
              "4️⃣ <strong>Entregamos:</strong> te devolvemos tu ropa limpia, doblada y lista para usar.",
          ],
          MAS_AYUDA
        );
        break;

      case "pagos":
        marcarTema("formas de pago");
        botDice(
          [
            "Los medios de pago disponibles se coordinan al solicitar tu servicio. 💳",
            "Si quieres confirmarlos ahora, un asesor te responde por WhatsApp.",
          ],
          [{ texto: "Ver menú", accion: "menu" }],
          {
            mensaje: resumenParaAsesor(
              "Hola, quiero conocer los medios de pago de " +
                NOMBRE_NEGOCIO +
                "."
            ),
            etiqueta: "Preguntar a un asesor",
          }
        );
        break;

      case "domicilio":
        marcarTema("pedir domicilio");
        estado.modo = "libre";
        botDice(
          "¡Perfecto! Vamos a armar tu pedido. ¿Qué servicio necesitas?",
          [
            { texto: "Lavado", accion: "svc:Lavado" },
            { texto: "Lavado + secado", accion: "svc:Lavado + secado" },
            { texto: "Planchado", accion: "svc:Planchado" },
            { texto: "Lavado especial", accion: "svc:Lavado especial" },
            { texto: "Calzado", accion: "svc:Calzado" },
          ]
        );
        break;

      case "asesor":
        marcarTema("atención con asesor");
        botDice(
          [
            "Con gusto te paso con un asesor. 👩‍💼",
            "Toca el botón y se abrirá WhatsApp con tu consulta lista para enviar.",
          ],
          [{ texto: "Ver menú", accion: "menu" }],
          {
            mensaje: resumenParaAsesor(
              "Hola, vengo del chat de la página de " +
                NOMBRE_NEGOCIO +
                " y necesito ayuda de un asesor."
            ),
            etiqueta: "Hablar con un asesor",
          }
        );
        break;

      case "gracias":
        botDice(
          "¡Con mucho gusto! 😊 Si necesitas algo más, aquí estoy.",
          MENU
        );
        break;

      default:
        if (accion.indexOf("svc:") === 0) {
          estado.servicio = accion.slice(4);
          estado.modo = "pedir_direccion";
          botDice(
            "Anotado: <strong>" +
              estado.servicio +
              "</strong>. 👍<br>Ahora escríbeme tu <strong>dirección</strong> de recogida (barrio y referencias)."
          );
        }
    }
  }

  function manejarFlujo(texto) {
    if (estado.modo === "pedir_direccion") {
      estado.direccion = texto;
      estado.modo = "pedir_nombre";
      botDice("Gracias. ¿A nombre de quién registramos el pedido?");
      return true;
    }

    if (estado.modo === "pedir_nombre") {
      estado.nombre = texto;
      estado.modo = "libre";

      const mensaje =
        "Hola, quiero pedir un domicilio en " +
        NOMBRE_NEGOCIO +
        ".\n" +
        "Nombre: " +
        estado.nombre +
        "\n" +
        "Servicio: " +
        estado.servicio +
        "\n" +
        "Dirección: " +
        estado.direccion;

      botDice(
        [
          "¡Listo, " +
            estado.nombre.replace(/</g, "&lt;") +
            "! Este es tu pedido:<br><br>" +
            "🧺 <strong>Servicio:</strong> " +
            estado.servicio +
            "<br>" +
            "📍 <strong>Dirección:</strong> " +
            estado.direccion.replace(/</g, "&lt;"),
          "Para confirmar la recogida y el horario, envía tu pedido a un asesor por WhatsApp:",
        ],
        [{ texto: "Ver menú", accion: "menu" }],
        {
          mensaje: mensaje,
          etiqueta: "Enviar pedido por WhatsApp",
        }
      );
      return true;
    }

    return false;
  }

  const INTENCIONES = [
    {
      accion: "asesor",
      claves: [
        "asesor",
        "humano",
        "persona",
        "agente",
        "hablar con",
        "llamar",
        "ayuda",
        "queja",
        "reclamo",
        "problema",
      ],
    },
    {
      accion: "domicilio",
      claves: [
        "domicilio",
        "recoger",
        "recogida",
        "recojan",
        "pedir",
        "pedido",
        "solicitar",
        "agendar",
        "agenda",
      ],
    },
    {
      accion: "precios",
      claves: [
        "precio",
        "cuesta",
        "costo",
        "valor",
        "cotiz",
        "tarifa",
        "cuanto",
        "cobran",
      ],
    },
    {
      accion: "pagos",
      claves: [
        "pago",
        "pagar",
        "nequi",
        "daviplata",
        "tarjeta",
        "efectivo",
        "transferencia",
      ],
    },
    {
      accion: "como",
      claves: [
        "como funciona",
        "funciona",
        "proceso",
        "demora",
        "demoran",
        "tiempo",
        "entrega",
        "cuando llega",
      ],
    },
    {
      accion: "servicios",
      claves: [
        "servicio",
        "lavado",
        "lavan",
        "plancha",
        "seco",
        "especial",
        "zapato",
        "tenis",
        "calzado",
        "edredon",
        "cobija",
        "cortina",
        "que hacen",
        "ofrecen",
      ],
    },
    {
      accion: "gracias",
      claves: ["gracias", "muchas gracias", "listo", "ok gracias", "perfecto"],
    },
    {
      accion: "menu",
      claves: [
        "hola",
        "buenas",
        "buenos dias",
        "buenas tardes",
        "buenas noches",
        "menu",
        "inicio",
        "opciones",
      ],
    },
  ];

  function detectar(texto) {
    const t = normalizar(texto);
    for (let i = 0; i < INTENCIONES.length; i++) {
      const claves = INTENCIONES[i].claves;
      for (let j = 0; j < claves.length; j++) {
        if (t.indexOf(claves[j]) !== -1) return INTENCIONES[i].accion;
      }
    }
    return null;
  }

  function procesarTexto(texto) {
    if (manejarFlujo(texto)) return;

    const accion = detectar(texto);

    if (accion) {
      estado.intentosFallidos = 0;
      if (accion === "menu") {
        botDice(
          "¡Hola! 👋 Soy el asistente virtual de " +
            NOMBRE_NEGOCIO +
            ". ¿En qué te puedo ayudar?",
          MENU
        );
      } else {
        ejecutar(accion);
      }
      return;
    }

    estado.intentosFallidos++;
    marcarTema("consulta: " + texto.slice(0, 80));

    if (estado.intentosFallidos >= 2) {
      botDice(
        [
          "Parece que necesitas una atención más personalizada. 🙌",
          "Un asesor puede resolver tu consulta por WhatsApp:",
        ],
        [{ texto: "Ver menú", accion: "menu" }],
        {
          mensaje: resumenParaAsesor(
            "Hola, vengo del chat de la página de " +
              NOMBRE_NEGOCIO +
              ' y tengo una consulta:\n"' +
              texto +
              '"'
          ),
          etiqueta: "Hablar con un asesor",
        }
      );
    } else {
      botDice(
        "No estoy seguro de haber entendido. 🤔 Puedes elegir una opción o, si prefieres, hablar con un asesor.",
        [
          { texto: "Ver menú", accion: "menu" },
          { texto: "Hablar con un asesor", accion: "asesor" },
        ]
      );
    }
  }

  function enviar() {
    const texto = campo.value.trim();
    if (!texto) return;

    campo.value = "";
    quitarRapidas();
    agregarMensaje(texto, "user");
    procesarTexto(texto);
  }

  function enviarPedidoSimulado(mensaje) {
    if (!mensaje) return;

    if (!abierto) abrir();

    cola = cola.then(async function () {
      quitarRapidas();

      const burbuja = agregarMensaje(mensaje, "user");
      burbuja.classList.add("eduar-pedido");

      const escribiendo = document.createElement("div");
      escribiendo.className = "eduar-typing";
      escribiendo.innerHTML = "<i></i><i></i><i></i>";
      contenedor.appendChild(escribiendo);
      bajar();

      await pausa(900);
      escribiendo.remove();

      agregarMensaje(
        "¡Gracias por tu pedido! 👋 Ya tengo tu lista de productos.",
        "bot"
      );
      agregarMensaje(
        "Para confirmar la disponibilidad y coordinar la recogida, envía tu pedido a un asesor por WhatsApp:",
        "bot"
      );
      agregarBotonWhatsApp(mensaje, "Enviar pedido por WhatsApp");
    });
  }

  function abrir() {
    abierto = true;
    chat.classList.add("open");
    launcher.style.display = "none";
    tip.hidden = true;
    badge.hidden = true;

    if (!saludoMostrado) {
      saludoMostrado = true;
      botDice(
        [
          "¡Hola! 👋 Soy el asistente virtual de <strong>" +
            NOMBRE_NEGOCIO +
            "</strong>.",
          "Recogemos, lavamos, secamos y entregamos tu ropa en la puerta de tu casa. ¿En qué te puedo ayudar?",
        ],
        MENU
      );
    }

    setTimeout(function () {
      campo.focus();
    }, 250);
  }

  function cerrar() {
    abierto = false;
    chat.classList.remove("open");
    launcher.style.display = "flex";
  }

  launcher.addEventListener("click", abrir);
  tip.addEventListener("click", abrir);
  chat.querySelector(".eduar-close").addEventListener("click", cerrar);
  chat.querySelector(".eduar-send").addEventListener("click", enviar);

  campo.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      enviar();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && abierto) cerrar();
  });

  setTimeout(function () {
    if (!abierto && !saludoMostrado) tip.hidden = false;
  }, 5000);

  fetch("data.json")
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      if (data && Array.isArray(data.servicios) && data.servicios.length) {
        servicios = data.servicios;
      }
    })
    .catch(function () {});

  window.abrirChatEduartex = abrir;
  window.enviarPedidoSimulado = enviarPedidoSimulado;
})();
