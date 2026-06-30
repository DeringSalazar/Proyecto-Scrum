function saveIncident(event) {
  event.preventDefault();

  const inc = {
    id: "INC-" + (incidentes.length + 1),
    titulo: titulo.value,
    descripcion: descripcion.value,
    estado: "Abierto"
  };

  incidentes.push(inc);
  saveToStorage();
  showToast("Incidente creado");
}