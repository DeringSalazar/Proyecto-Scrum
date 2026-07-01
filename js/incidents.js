function renderIncidents() {

    let incidents = JSON.parse(localStorage.getItem("incidents")) || [];

    if (incidents.length === 0) {

        incidents = [
            {
                id: "INC-1",
                title: "Fallo de conexión VPN - Sucursal Central",
                description: "Los usuarios informan que no se pueden conectar mediante túneles IPsec. Sin acceso al ERP.",
                type: "Red",
                priority: "Crítica",
                assigned: "Carlos R. (Redes)",
                status: "Abierto",
                date: "2026-06-30T21:53"
            },
            {
                id: "INC-2",
                title: "Error crítico en base de datos - Licitaciones",
                description: "Tardanza en el procesamiento de transacciones.",
                type: "Sistemas",
                priority: "Alta",
                assigned: "Diana M. (Sistemas)",
                status: "En Proceso",
                date: "2026-06-30T21:53"
            },
            {
                id: "INC-3",
                title: "Pantalla azul en PC de gerencia de finanzas",
                description: "Fallo repetitivo de memoria RAM.",
                type: "Hardware",
                priority: "Media",
                assigned: "Fabián T. (Soporte)",
                status: "Resuelto",
                date: "2026-06-30T21:53"
            }
        ];

        localStorage.setItem("incidents", JSON.stringify(incidents));
    }

    document.getElementById("incidents").innerHTML = `

        <div class="incidents-header">
            <h1>Registro e Inventario de Incidentes</h1>
            <p>Reportar nuevas fallas de infraestructura y consultar el histórico completo.</p>
        </div>

        <div class="incidents-layout">

            <div class="incident-form-card">

                <h2>Registrar Incidente</h2>

                <label>Título de la falla</label>
                <input 
                    type="text" 
                    id="incident-title" 
                    placeholder="Ej. Caída de conexión fibra óptica"
                >

                <label>Descripción detallada</label>
                <textarea 
                    id="incident-description" 
                    placeholder="Detallar síntomas detectados y equipos afectados..."
                ></textarea>

                <label>Tipo de incidente</label>
                <select id="incident-type">
                    <option>Red</option>
                    <option>Sistemas</option>
                    <option>Hardware</option>
                    <option>Software</option>
                    <option>Seguridad</option>
                </select>

                <label>Prioridad</label>
                <select id="incident-priority">
                    <option>Alta</option>
                    <option>Crítica</option>
                    <option>Media</option>
                    <option>Baja</option>
                </select>

                <label>Asignar técnico</label>
                <select id="incident-assigned">
                    <option>Sin Asignar</option>
                    <option>Carlos R. (Redes)</option>
                    <option>Diana M. (Sistemas)</option>
                    <option>Fabián T. (Soporte)</option>
                </select>

                <label>Fecha del reporte</label>
                <input 
                    type="datetime-local" 
                    id="incident-date" 
                    value="${getCurrentDateTimeForInput()}"
                >

                <button class="btn-register" onclick="addIncident()">
                    Registrar Ticket
                </button>

            </div>

            <div class="incident-table-section">

                <div class="incident-filters">

                    <input 
                        type="text" 
                        id="search-incident" 
                        placeholder="Buscar por ID, título o descripción..."
                        oninput="filterIncidents()"
                    >

                    <select id="filter-status" onchange="filterIncidents()">
                        <option value="">Todos los Estados</option>
                        <option value="Abierto">Abierto</option>
                        <option value="En Proceso">En Proceso</option>
                        <option value="Resuelto">Resuelto</option>
                    </select>

                    <select id="filter-priority" onchange="filterIncidents()">
                        <option value="">Todas las Prioridades</option>
                        <option value="Crítica">Crítica</option>
                        <option value="Alta">Alta</option>
                        <option value="Media">Media</option>
                        <option value="Baja">Baja</option>
                    </select>

                </div>

                <div class="incident-table-card">

                    <table class="incident-table">

                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Título</th>
                                <th>Tipo</th>
                                <th>Prioridad</th>
                                <th>Asignado</th>
                                <th>Estado</th>
                            </tr>
                        </thead>

                        <tbody id="incident-table-body">
                            ${buildIncidentRows(incidents)}
                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    `;

    document.getElementById("dashboard").style.display = "none";
    document.getElementById("incidents").style.display = "block";
    document.getElementById("kanban").style.display = "none";
}

function buildIncidentRows(incidents) {

    if (incidents.length === 0) {
        return `
            <tr>
                <td colspan="6" class="empty-table">
                    No hay incidentes registrados.
                </td>
            </tr>
        `;
    }

    return incidents.map(incident => `

        <tr>

            <td class="incident-id">
                ${incident.id}
            </td>

            <td>
                <div class="incident-title">
                    ${incident.title}
                </div>
            </td>

            <td>
                ${incident.type}
            </td>

            <td>
                <span class="priority-dot ${getPriorityClass(incident.priority)}"></span>
                ${incident.priority}
            </td>

            <td>
                ${incident.assigned}
            </td>

            <td>
                <span class="status-badge ${getStatusClass(incident.status)}">
                    ${incident.status}
                </span>
            </td>

        </tr>

    `).join("");
}

function addIncident() {

    const title = document.getElementById("incident-title").value.trim();
    const description = document.getElementById("incident-description").value.trim();
    const type = document.getElementById("incident-type").value;
    const priority = document.getElementById("incident-priority").value;
    const assigned = document.getElementById("incident-assigned").value;
    const date = document.getElementById("incident-date").value;

    if (title === "" || description === "") {
        alert("Debe ingresar el título y la descripción del incidente.");
        return;
    }

    if (date === "") {
        alert("Debe seleccionar la fecha y hora del reporte.");
        return;
    }

    const incidents = JSON.parse(localStorage.getItem("incidents")) || [];

    const newIncident = {
        id: getNextIncidentId(),
        title: title,
        description: description,
        type: type,
        priority: priority,
        assigned: assigned,
        status: "Abierto",
        date: date
    };

    incidents.push(newIncident);

    localStorage.setItem("incidents", JSON.stringify(incidents));

    renderIncidents();
}

function filterIncidents() {

    const search = document.getElementById("search-incident").value.toLowerCase();
    const status = document.getElementById("filter-status").value;
    const priority = document.getElementById("filter-priority").value;

    let incidents = JSON.parse(localStorage.getItem("incidents")) || [];

    incidents = incidents.filter(incident => {

        const matchesSearch =
            incident.id.toLowerCase().includes(search) ||
            incident.title.toLowerCase().includes(search) ||
            incident.description.toLowerCase().includes(search);

        const matchesStatus =
            status === "" || incident.status === status;

        const matchesPriority =
            priority === "" || incident.priority === priority;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    document.getElementById("incident-table-body").innerHTML = buildIncidentRows(incidents);
}

function getNextIncidentId() {

    const incidents = JSON.parse(localStorage.getItem("incidents")) || [];

    if (incidents.length === 0) {
        return "INC-1";
    }

    const numbers = incidents.map(incident => {
        return parseInt(incident.id.replace("INC-", ""));
    });

    const maxNumber = Math.max(...numbers);

    return `INC-${maxNumber + 1}`;
}

function getCurrentDateTimeForInput() {

    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hour}:${minute}`;
}

function getPriorityClass(priority) {

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

function getStatusClass(status) {

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