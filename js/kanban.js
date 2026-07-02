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
                    ${incident.assigned}
                </span>

                <div class="kanban-actions">
                    <button onclick="moveIncidentLeft('${incident.id}')">←</button>
                    <button onclick="moveIncidentRight('${incident.id}')">→</button>
                </div>

            </div>

        </div>
    `;
}

function dragIncident(event, id) {
    event.dataTransfer.setData("incidentId", id);
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

    const result = Storage.patchIncidentEstado(id, newStatus);

    if (!result.success) {
        showToast(result.message, "error");
        return false;
    }

    saveKanbanAction(id, newStatus);
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