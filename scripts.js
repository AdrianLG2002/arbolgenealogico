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
