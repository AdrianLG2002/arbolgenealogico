const modal = document.querySelector(".cuestionario");
const btnAbrir = document.querySelector(".add-char");
const btnCancelar = document.querySelector(".btn-cancelar");

function abrirModal() {
  modal.style.display = "flex";
}

function cerrarModal() {
  modal.style.display = "none";
}

btnAbrir.addEventListener("click", abrirModal);
btnCancelar.addEventListener("click", cerrarModal);

const form = document.querySelector(".cuestionario form");
const inputNombre = document.querySelector('input[type="text"]');
const inputFecha = document.querySelector('input[type="date"]');
const inputFoto = document.querySelector('input[type="file"]');

let personas = [];
let contadorId = 1;

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const nombre = inputNombre.value;
  const fecha = inputFecha.value;
  const archivoFoto = inputFoto.files[0];

  const nuevaPersona = {
    id: contadorId,
    nombre: nombre,
    nacimiento: fecha,
    foto: null,
  };

  contadorId = contadorId + 1;
  personas.push(nuevaPersona);
  console.log(personas);

  form.reset();
  cerrarModal();
});
