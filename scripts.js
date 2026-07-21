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
const arbol = document.querySelector(".arbol");

function renderArbol() {
  let html = "";

  personas.forEach(function (persona) {
    const imagenHTML = persona.foto
      ? `<img src="${persona.foto}" alt="foto" style="width: 100%" />`
      : "";

    html += `
      <div class="card">
        ${imagenHTML}
        <div class="container">
          <h4><b>${persona.nombre}</b></h4>
          <p>${persona.nacimiento}</p>
        </div>
      </div>
    `;
  });

  arbol.innerHTML = html;
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

  //---padre2 empieza como false hasta que se seleccione padre1---
  //================================================================
  selectPadre2.disabled = true;
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
