let isDraggingKanban = false;

function renderKanban() {

    Storage.ensureSeedIncidents();

    const incidents = Storage.getVisibleIncidentsForCurrentUser();

    const abiertos = incidents.filter(incident => incident.status === "Abierto");
    const enProceso = incidents.filter(incident => incident.status === "En Proceso");
    const resueltos = incidents.filter(incident => incident.status === "Resuelto");

    document.getElementById("kanban").innerHTML = `

        <div class="kanban-page-header">
            <h1>Tablero Kanban de Operaciones</h1>
            <p>Arrastra y suelta los incidentes para cambiar de estado rápidamente y coordinar la resolución.</p>
        </div>

        <div class="kanban-board">

            ${buildKanbanColumn("Abierto", "ABIERTOS (OPEN)", abiertos)}
            ${buildKanbanColumn("En Proceso", "EN PROCESO", enProceso)}
            ${buildKanbanColumn("Resuelto", "RESUELTOS", resueltos)}

        </div>

        <div id="kanban-modal-container"></div>
    `;

    document.getElementById("dashboard").style.display = "none";
    document.getElementById("incidents").style.display = "none";
    document.getElementById("kanban").style.display = "block";
}

function buildKanbanColumn(status, title, incidents) {

    return `

        <div 
            class="kanban-column"
            ondragover="allowDrop(event)"
            ondrop="dropIncident(event, '${status}')"
        >

            <div class="kanban-column-header">
                <h3>${title}</h3>
                <span>${incidents.length}</span>
            </div>

            <div class="kanban-column-body">

                ${
                    incidents.length === 0
                    ? `<div class="kanban-empty">Sin incidentes</div>`
                    : incidents.map(incident => buildKanbanCard(incident)).join("")
                }

            </div>

        </div>
    `;
}

function buildKanbanCard(incident) {

    return `

        <div 
            class="kanban-card ${getKanbanBorderClass(incident.status)}"
            draggable="true"
            ondragstart="dragIncident(event, '${incident.id}')"
            ondragend="endDragIncident()"
            onclick="openKanbanIncidentModal('${incident.id}')"
        >

            <div class="kanban-card-top">
                <span class="kanban-id">${incident.id}</span>
                <span class="kanban-type">${incident.type}</span>
            </div>

            <h4>${incident.title}</h4>

            <p>${incident.description}</p>

            <div class="kanban-line"></div>

            <div class="kanban-card-footer">

                <span class="kanban-assigned">
                    ${incident.assigned || "Sin Asignar"}
                </span>

                <div class="kanban-actions">
                    <button onclick="event.stopPropagation(); moveIncidentLeft('${incident.id}')">←</button>
                    <button onclick="event.stopPropagation(); moveIncidentRight('${incident.id}')">→</button>
                </div>

            </div>

        </div>
    `;
}


function dragIncident(event, id) {
    isDraggingKanban = true;
    event.dataTransfer.setData("incidentId", id);
}

function endDragIncident() {
    setTimeout(() => {
        isDraggingKanban = false;
    }, 150);
}

function allowDrop(event) {
    event.preventDefault();
}

function dropIncident(event, newStatus) {

    event.preventDefault();

    const id = event.dataTransfer.getData("incidentId");

    const updated = updateIncidentStatusKanban(id, newStatus);

    if (updated) {
        renderKanban();
    }
}

function updateIncidentStatusKanban(id, newStatus) {

    const validStatuses = ["Abierto", "En Proceso", "Resuelto"];

    if (!validStatuses.includes(newStatus)) {
        showToast("Estado no válido.", "error");
        return false;
    }

    const incidents = Storage.getIncidents();

    const incidentExists = incidents.some(incident => incident.id === id);

    if (!incidentExists) {
        showToast("No se encontró el incidente.", "error");
        return false;
    }

    const updatedIncidents = incidents.map(incident => {

        if (incident.id === id) {

            const oldStatus = incident.status;

            return {
                ...incident,
                status: newStatus,
                historial_estados: [
                    ...(incident.historial_estados || []),
                    {
                        anterior: oldStatus,
                        nuevo: newStatus,
                        fecha: new Date().toISOString()
                    }
                ]
            };
        }

        return incident;
    });

    saveKanbanIncidents(updatedIncidents);

    saveKanbanAction(id, newStatus);

    showToast(`Se actualizó ${id} a ${newStatus}.`);

    return true;
}

function moveIncidentRight(id) {

    const incidents = Storage.getIncidents();
    const incident = incidents.find(item => item.id === id);

    if (!incident) return;

    if (incident.status === "Abierto") {
        updateIncidentStatusKanban(id, "En Proceso");
    } else if (incident.status === "En Proceso") {
        updateIncidentStatusKanban(id, "Resuelto");
    }

    renderKanban();
}

function moveIncidentLeft(id) {

    const incidents = Storage.getIncidents();
    const incident = incidents.find(item => item.id === id);

    if (!incident) return;

    if (incident.status === "Resuelto") {
        updateIncidentStatusKanban(id, "En Proceso");
    } else if (incident.status === "En Proceso") {
        updateIncidentStatusKanban(id, "Abierto");
    }

    renderKanban();
}


function openKanbanIncidentModal(id) {

    if (isDraggingKanban) {
        return;
    }

    const incidents = Storage.getIncidents();
    const incident = incidents.find(item => item.id === id);

    if (!incident) {
        showToast("No se encontró el incidente.", "error");
        return;
    }

    const canManage = Storage.isTecnico() || Storage.isAdmin();

    const modalContainer = document.getElementById("kanban-modal-container");

    modalContainer.innerHTML = `

        <div class="incident-modal-overlay" onclick="closeKanbanIncidentModal()">

            <div class="incident-modal" onclick="event.stopPropagation()">

                <div class="incident-modal-header">
                    <h2>Detalle del Incidente - ${incident.id}</h2>
                    <button onclick="closeKanbanIncidentModal()">×</button>
                </div>

                <div class="incident-modal-body">

                    <div class="modal-field modal-full">
                        <label>Título del incidente</label>
                        <h3>${incident.title}</h3>
                    </div>

                    <div class="modal-field modal-full">
                        <label>Descripción técnica</label>
                        <div class="modal-description">
                            ${incident.description || "Sin descripción registrada."}
                        </div>
                    </div>

                    <div class="modal-grid">

                        <div class="modal-field">
                            <label>Tipo</label>
                            <p>${incident.type || "Sin tipo"}</p>
                        </div>

                        <div class="modal-field">
                            <label>Prioridad</label>
                            <p>
                                <span class="priority-dot ${getPriorityClassForKanbanModal(incident.priority)}"></span>
                                ${incident.priority || "Sin prioridad"}
                            </p>
                        </div>

                        <div class="modal-field">
                            <label>Fecha de reporte</label>
                            <p>${formatKanbanDate(incident.date)}</p>
                        </div>

                        <div class="modal-field">
                            <label>Estado actual</label>

                            ${
                                canManage
                                ? `
                                    <select id="modal-incident-status">
                                        <option value="Abierto" ${incident.status === "Abierto" ? "selected" : ""}>Abierto</option>
                                        <option value="En Proceso" ${incident.status === "En Proceso" ? "selected" : ""}>En Proceso</option>
                                        <option value="Resuelto" ${incident.status === "Resuelto" ? "selected" : ""}>Resuelto</option>
                                    </select>
                                `
                                : `
                                    <span class="status-badge ${getStatusClassForKanbanModal(incident.status)}">
                                        ${incident.status}
                                    </span>
                                `
                            }

                        </div>

                    </div>

                    <div class="modal-field modal-full">
                        <label>Técnico asignado</label>

                        ${
                            canManage
                            ? `
                                <select id="modal-incident-assigned">
                                    <option value="Sin Asignar" ${incident.assigned === "Sin Asignar" ? "selected" : ""}>Sin Asignar</option>
                                    <option value="Carlos R. (Redes)" ${incident.assigned === "Carlos R. (Redes)" ? "selected" : ""}>Carlos R. (Redes)</option>
                                    <option value="Diana M. (Sistemas)" ${incident.assigned === "Diana M. (Sistemas)" ? "selected" : ""}>Diana M. (Sistemas)</option>
                                    <option value="Fabián T. (Soporte)" ${incident.assigned === "Fabián T. (Soporte)" ? "selected" : ""}>Fabián T. (Soporte)</option>
                                </select>
                            `
                            : `<p>${incident.assigned || "Sin Asignar"}</p>`
                        }

                    </div>

                </div>

                <div class="incident-modal-footer">

                    ${
                        canManage
                        ? `
                            <button class="btn-delete-ticket" onclick="deleteIncidentFromKanban('${incident.id}')">
                                Eliminar Ticket
                            </button>
                        `
                        : `<span></span>`
                    }

                    <div class="modal-footer-actions">

                        <button class="btn-close-modal" onclick="closeKanbanIncidentModal()">
                            Cerrar
                        </button>

                        ${
                            canManage
                            ? `
                                <button class="btn-save-modal" onclick="saveKanbanIncidentChanges('${incident.id}')">
                                    Guardar Cambios
                                </button>
                            `
                            : ""
                        }

                    </div>

                </div>

            </div>

        </div>
    `;
}

function closeKanbanIncidentModal() {

    const modalContainer = document.getElementById("kanban-modal-container");

    if (modalContainer) {
        modalContainer.innerHTML = "";
    }
}


function saveKanbanIncidentChanges(id) {

    const status = document.getElementById("modal-incident-status").value;
    const assigned = document.getElementById("modal-incident-assigned").value;

    const incidents = Storage.getIncidents();
    const incident = incidents.find(item => item.id === id);

    if (!incident) {
        showToast("No se encontró el incidente.", "error");
        return;
    }

    const statusChanged = incident.status !== status;
    const assignedChanged = incident.assigned !== assigned;

    if (!statusChanged && !assignedChanged) {
        showToast("No se realizaron cambios.");
        closeKanbanIncidentModal();
        return;
    }

    if (statusChanged) {
        const updatedStatus = updateIncidentStatusKanban(id, status);

        if (!updatedStatus) {
            return;
        }
    }

    if (assignedChanged) {
        updateKanbanIncidentAssigned(id, assigned);
    }

    showToast("Incidente actualizado correctamente.");

    closeKanbanIncidentModal();

    renderKanban();
}

function updateKanbanIncidentAssigned(id, assigned) {

    const incidents = Storage.getIncidents();

    const updatedIncidents = incidents.map(incident => {

        if (incident.id === id) {
            return {
                ...incident,
                assigned: assigned
            };
        }

        return incident;
    });

    saveKanbanIncidents(updatedIncidents);

    saveKanbanAction(id, `asignado a ${assigned}`);
}



function deleteIncidentFromKanban(id) {

    const confirmDelete = confirm(`¿Desea eliminar el ticket ${id}?`);

    if (!confirmDelete) {
        return;
    }

    const incidents = Storage.getIncidents();

    const filteredIncidents = incidents.filter(incident => incident.id !== id);

    saveKanbanIncidents(filteredIncidents);

    saveKanbanAction(id, "eliminado");

    showToast("Ticket eliminado correctamente.");

    closeKanbanIncidentModal();

    renderKanban();
}



function saveKanbanIncidents(incidents) {

    if (Storage.saveIncidents) {
        Storage.saveIncidents(incidents);
        return;
    }

    localStorage.setItem("incidents", JSON.stringify(incidents));
}



function getKanbanBorderClass(status) {

    if (status === "Abierto") {
        return "kanban-border-red";
    }

    if (status === "En Proceso") {
        return "kanban-border-orange";
    }

    if (status === "Resuelto") {
        return "kanban-border-green";
    }

    return "";
}

function saveKanbanAction(id, newStatus) {

    const actions = JSON.parse(localStorage.getItem("acciones_dashboard")) || [];

    const now = new Date();

    const hour = String(now.getHours()).padStart(2, "0");
    const minute = String(now.getMinutes()).padStart(2, "0");

    actions.unshift({
        texto: `Se actualizó ${id}: estado a ${newStatus}`,
        hora: `${hour}:${minute}`
    });

    localStorage.setItem("acciones_dashboard", JSON.stringify(actions.slice(0, 5)));
}

function formatKanbanDate(dateValue) {

    if (!dateValue) {
        return "Sin fecha";
    }

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleString("es-CR", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function getPriorityClassForKanbanModal(priority) {

    if (priority === "Crítica") {
        return "priority-critical";
    }

    if (priority === "Alta") {
        return "priority-high";
    }

    if (priority === "Media") {
        return "priority-medium";
    }

    if (priority === "Baja") {
        return "priority-low";
    }

    return "";
}

function getStatusClassForKanbanModal(status) {

    if (status === "Abierto") {
        return "status-open";
    }

    if (status === "En Proceso") {
        return "status-progress";
    }

    if (status === "Resuelto") {
        return "status-resolved";
    }

    return "";
}