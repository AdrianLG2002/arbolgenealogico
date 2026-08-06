//---Creando el MODAL, abrir y cerrar formulario---
//==========================================
const modal = document.querySelector(".cuestionario");
const btnAbrir = document.querySelector(".add-char");
const btnCancelar = document.querySelector(".btn-cancelar");

function abrirModal() {
  poblarSelects();
  modal.style.display = "flex";
}

function cerrarModal() {
  modal.style.display = "none";
}

btnAbrir.addEventListener("click", abrirModal);
btnCancelar.addEventListener("click", cerrarModal);

//---Crea los campos del formulario---
//==========================================
const form = document.querySelector(".cuestionario form");
const inputNombre = document.querySelector('input[type="text"]');
const inputFecha = document.querySelector('input[type="date"]');
const inputFoto = document.querySelector('input[type="file"]');

//---cajita para los personajes creados---
//==========================================
let personas = [];
let contadorId = 1;

//---funcionalidad del formulario (revisar constantemente por si acaso)---
//=========================================================================
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const nombre = inputNombre.value;
  const fecha = inputFecha.value;
  const archivoFoto = inputFoto.files[0];
  const padre1 = selectPadre1.value ? Number(selectPadre1.value) : null;
  const padre2 = selectPadre2.value ? Number(selectPadre2.value) : null;

  if (archivoFoto) {
    const lector = new FileReader();

    lector.onload = function () {
      guardarPersona(nombre, fecha, lector.result, padre1, padre2);
    };
    lector.readAsDataURL(archivoFoto);
  } else {
    guardarPersona(nombre, fecha, null, padre1, padre2);
  }
});

//---Guardar a cada persona nueva---
//==========================================
function guardarPersona(nombre, fecha, foto, padre1, padre2) {
  const nuevaPersona = {
    id: contadorId,
    nombre: nombre,
    nacimiento: fecha,
    foto: foto,
    padre1: padre1,
    padre2: padre2,
  };

  contadorId = contadorId + 1;
  personas.push(nuevaPersona);
  console.log(personas);

  renderArbol();
  form.reset();
  cerrarModal();
}

//---Manda las cards en la pantalla---
//==========================================
const filas = document.getElementById("filas");
const svgLineas = document.getElementById("lineas");

function renderArbol() {
  let generacionMaxima = 0;
  personas.forEach(function (persona) {
    const gen = obtenerGeneracion(persona);
    if (gen > generacionMaxima) generacionMaxima = gen;
  });

  let html = "";

  for (let gen = 0; gen <= generacionMaxima; gen++) {
    const miembrosDeEstaFila = personas.filter(function (persona) {
      return obtenerGeneracion(persona) === gen;
    });

    let filaHtml = "";
    miembrosDeEstaFila.forEach(function (persona) {
      const imagenHTML = persona.foto
        ? `<img src="${persona.foto}" alt="foto" style="width: 100%" />`
        : "";

      filaHtml += `
        <div class="card" data-id="${persona.id}">
          ${imagenHTML}
          <div class="container">
            <h4><b>${persona.nombre}</b></h4>
            <p>${persona.nacimiento}</p>
          </div>
        </div>
      `;
    });

    html += `<div class="fila-generacion">${filaHtml}</div>`;
  }

  filas.innerHTML = html;

  // Dibujamos las lineas ya mismo (sirve para el caso sin fotos)
  dibujarLineas();

  // Si hay imagenes, nos aseguramos de redibujar cuando cada una tenga su tamaño real.
  // OJO: con imagenes en formato data: URL, a veces la imagen YA esta cargada
  // en el instante en que la insertamos (el evento "load" pudo dispararse
  // antes de que llegaramos a escuchar). Por eso revisamos "img.complete" primero.
  const imagenes = filas.querySelectorAll("img");
  imagenes.forEach(function (img) {
    if (img.complete) {
      dibujarLineas();
    } else {
      img.addEventListener("load", dibujarLineas);
    }
  });
}

//---Calcular la posicion de una card, en coordenadas LOCALES del svg---
//==========================================
function obtenerPosicion(elemento) {
  // Usamos el propio <svg> como referencia (no #filas), porque #filas
  // puede desplazarse por colapso de margenes con su primer hijo y
  // desincronizarse del origen real donde dibuja el svg.
  const rectElemento = elemento.getBoundingClientRect();
  const rectSvg = svgLineas.getBoundingClientRect();

  // Dividimos entre "zoom" para volver a coordenadas SIN escalar:
  // getBoundingClientRect() ya viene afectado por el zoom actual (CSS transform),
  // pero el <svg> dibuja en su propio espacio local, que luego el navegador
  // escala junto con el resto de .arbol. Si no dividimos aqui, al hacer zoom
  // el dibujo se desfasaria (escalaria dos veces).
  return {
    x: (rectElemento.left - rectSvg.left) / zoom,
    y: (rectElemento.top - rectSvg.top) / zoom,
    ancho: rectElemento.width / zoom,
    alto: rectElemento.height / zoom,
  };
}

//---Dibujar las lineas entre padres e hijos---
//==========================================
function dibujarLineas() {
  svgLineas.innerHTML = "";

  const todasLasCards = filas.querySelectorAll(".card");

  todasLasCards.forEach(function (cardHijo) {
    const idHijo = Number(cardHijo.dataset.id);
    const persona = personas.find(function (p) {
      return p.id === idHijo;
    });

    [persona.padre1, persona.padre2].forEach(function (idPadre) {
      if (!idPadre) return;

      const cardPadre = filas.querySelector(`.card[data-id="${idPadre}"]`);
      if (!cardPadre) return;

      const posPadre = obtenerPosicion(cardPadre);
      const posHijo = obtenerPosicion(cardHijo);

      // Punto de salida: centro-abajo de la card del padre
      const x1 = posPadre.x + posPadre.ancho / 2;
      const y1 = posPadre.y + posPadre.alto;

      // Punto de llegada: centro-arriba de la card del hijo
      const x2 = posHijo.x + posHijo.ancho / 2;
      const y2 = posHijo.y;

      const puntoMedioY = (y1 + y2) / 2;

      const linea = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      linea.setAttribute(
        "d",
        `M ${x1} ${y1} L ${x1} ${puntoMedioY} L ${x2} ${puntoMedioY} L ${x2} ${y2}`,
      );
      linea.setAttribute("stroke", "#4a4a4a");
      linea.setAttribute("stroke-width", "2");
      linea.setAttribute("fill", "none");

      svgLineas.appendChild(linea);
    });
  });

  // El tamaño del svg lo dejamos en coordenadas locales (sin escalar),
  // ya que el propio zoom (transform: scale) se encarga de agrandarlo despues.
  svgLineas.setAttribute("width", filas.scrollWidth);
  svgLineas.setAttribute("height", filas.scrollHeight);
}

//---Funcionalidad de relacion (Form)---
//==========================================
const selectPadre1 = document.getElementById("padre1");
const selectPadre2 = document.getElementById("padre2");

//---Lista de personajes en relacion---
//==========================================
function poblarSelects() {
  selectPadre1.innerHTML = '<option value="">--Seleccionar--</option>';
  selectPadre2.innerHTML = '<option value="">--Seleccionar--</option>';

  personas.forEach(function (persona) {
    const opcion1 = document.createElement("option");
    opcion1.value = persona.id;
    opcion1.textContent = persona.nombre;
    selectPadre1.appendChild(opcion1);
  });

  //---padre2 empieza deshabilitado hasta que se seleccione padre1---
  //================================================================
  selectPadre2.disabled = true;
}

//---Calcular en que generacion va cada persona---
//==========================================
function obtenerGeneracion(persona) {
  // Si no tiene padres, es la raiz del arbol (generacion 0)
  if (!persona.padre1 && !persona.padre2) {
    return 0;
  }

  // Buscamos los objetos completos de sus padres, usando su id
  const padreUno = personas.find(function (p) {
    return p.id === persona.padre1;
  });
  const padreDos = personas.find(function (p) {
    return p.id === persona.padre2;
  });

  // Le preguntamos a cada padre su propia generacion (aqui es donde se llama a si misma)
  const genUno = padreUno ? obtenerGeneracion(padreUno) + 1 : 0;
  const genDos = padreDos ? obtenerGeneracion(padreDos) + 1 : 0;

  // Nos quedamos con la generacion mas alta entre los dos padres
  return Math.max(genUno, genDos);
}

selectPadre1.addEventListener("change", function () {
  const idElegido = selectPadre1.value;

  selectPadre2.innerHTML = '<option value="">--Seleccionar--</option>';

  if (idElegido === "") {
    selectPadre2.disabled = true;
    return;
  }

  personas.forEach(function (persona) {
    if (String(persona.id) === idElegido) return;

    const opcion2 = document.createElement("option");
    opcion2.value = persona.id;
    opcion2.textContent = persona.nombre;
    selectPadre2.appendChild(opcion2);
  });

  selectPadre2.disabled = false;
});

//---Pizarra: mover (pan) y hacer zoom---
//==========================================
const main = document.querySelector("main");
const arbol = document.getElementById("arbol");

let zoom = 1;
let panX = 0;
let panY = 0;

function aplicarTransform() {
  arbol.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
}

// --- Arrastrar con el mouse ---
let arrastrando = false;
let inicioX = 0;
let inicioY = 0;

main.addEventListener("mousedown", function (e) {
  arrastrando = true;
  inicioX = e.clientX - panX;
  inicioY = e.clientY - panY;
  main.classList.add("arrastrando");
});

window.addEventListener("mousemove", function (e) {
  if (!arrastrando) return;
  panX = e.clientX - inicioX;
  panY = e.clientY - inicioY;
  aplicarTransform();
});

window.addEventListener("mouseup", function () {
  arrastrando = false;
  main.classList.remove("arrastrando");
});

// --- Botones de zoom ---
document.querySelector(".btn-zoomin").addEventListener("click", function () {
  zoom = Math.min(zoom + 0.1, 2); // no dejamos pasar de 2x
  aplicarTransform();
});

document.querySelector(".btn-zoomout").addEventListener("click", function () {
  zoom = Math.max(zoom - 0.1, 0.3); // no dejamos bajar de 0.3x
  aplicarTransform();
});

aplicarTransform(); // por si acaso, aplicamos el estado inicial
