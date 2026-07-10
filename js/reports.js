let reportFilters = {
    estado: "",
    categoria: "",
    prioridad: "",
    tecnico: "",
    fechaDesde: "",
    fechaHasta: ""
};

function renderReports() {
    Storage.ensureSeedIncidents();

    const incidents = Storage.getIncidents();
    const allIncidents = incidents.length;

    document.getElementById("reports").innerHTML = `
        <div class="reports-header">
            <h1>Reportes de Incidentes</h1>
            <p>Visualiza y filtra los incidentes registrados en el sistema.</p>
        </div>

        <div class="reports-container">
            <div class="reports-filters-section">
                <div class="filters-card">
                    <h2>Filtros</h2>

                    <label>Estado</label>
                    <select id="filter-report-status" onchange="applyReportFilters()">
                        <option value="">Todos los Estados</option>
                        <option value="Abierto">Abierto</option>
                        <option value="En Proceso">En Proceso</option>
                        <option value="Resuelto">Resuelto</option>
                    </select>

                    <label>Categoría/Tipo</label>
                    <select id="filter-report-type" onchange="applyReportFilters()">
                        <option value="">Todas las Categorías</option>
                        <option value="Red">Red</option>
                        <option value="Sistemas">Sistemas</option>
                        <option value="Hardware">Hardware</option>
                        <option value="Software">Software</option>
                        <option value="Seguridad">Seguridad</option>
                    </select>

                    <label>Prioridad</label>
                    <select id="filter-report-priority" onchange="applyReportFilters()">
                        <option value="">Todas las Prioridades</option>
                        <option value="Crítica">Crítica</option>
                        <option value="Alta">Alta</option>
                        <option value="Media">Media</option>
                        <option value="Baja">Baja</option>
                    </select>

                    <label>Técnico Asignado</label>
                    <select id="filter-report-tech" onchange="applyReportFilters()">
                        <option value="">Todos los Técnicos</option>
                        <option value="Sin Asignar">Sin Asignar</option>
                        <option value="Carlos R. (Redes)">Carlos R. (Redes)</option>
                        <option value="Diana M. (Sistemas)">Diana M. (Sistemas)</option>
                        <option value="Fabián T. (Soporte)">Fabián T. (Soporte)</option>
                    </select>

                    <label>Fecha Desde</label>
                    <input 
                        type="date" 
                        id="filter-report-from" 
                        onchange="applyReportFilters()"
                    >

                    <label>Fecha Hasta</label>
                    <input 
                        type="date" 
                        id="filter-report-to" 
                        onchange="applyReportFilters()"
                    >

                    <div class="filter-buttons">
                        <button class="btn-clear-filters" onclick="clearReportFilters()">
                            Limpiar Filtros
                        </button>
                    </div>
                </div>
            </div>

            <div class="reports-content">
                <div class="reports-summary">
                    <div class="summary-item">
                        <span class="summary-label">Total de Incidentes</span>
                        <span class="summary-value" id="total-incidents">${allIncidents}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Filtrados</span>
                        <span class="summary-value" id="filtered-incidents">0</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Resueltos</span>
                        <span class="summary-value" id="resolved-incidents">0</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Pendientes</span>
                        <span class="summary-value" id="pending-incidents">0</span>
                    </div>
                </div>

                <div class="reports-actions">
                    <button class="btn-action-report" onclick="exportToCSV()">
                        <span class="material-symbols-rounded">download</span>
                        Exportar CSV
                    </button>

                    <button class="btn-action-report" onclick="printReport()">
                        <span class="material-symbols-rounded">print</span>
                        Imprimir
                    </button>
                </div>

                <div class="reports-table-card">
                    <table class="reports-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Usuario</th>
                                <th>Categoría</th>
                                <th>Prioridad</th>
                                <th>Estado</th>
                                <th>Técnico</th>
                                <th>Creación</th>
                                <th>Cierre</th>
                            </tr>
                        </thead>
                        <tbody id="reports-table-body">
                            ${buildReportRows(incidents)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    document.getElementById("dashboard").style.display = "none";
    document.getElementById("incidents").style.display = "none";
    document.getElementById("kanban").style.display = "none";
    document.getElementById("users").style.display = "none";
    if (document.getElementById("reports")) {
        document.getElementById("reports").style.display = "block";
    }

    // Inicializar resumen
    updateReportSummary(incidents);
}

function buildReportRows(incidents) {
    if (incidents.length === 0) {
        return `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px;">
                    No hay incidentes que coincidan con los filtros seleccionados
                </td>
            </tr>
        `;
    }

    return incidents.map(incident => {
        const createdDate = incident.date || incident.createdAt || "";
        const createdFormatted = createdDate ? formatDateForTable(createdDate) : "N/A";
        const closedDate = incident.status === "Resuelto" ? incident.updatedAt || createdDate : "";
        const closedFormatted = closedDate ? formatDateForTable(closedDate) : "N/A";

        return `
            <tr class="report-row">
                <td><strong>${incident.id}</strong></td>
                <td>${incident.reportadoPor || "Cliente"}</td>
                <td>${incident.type || "N/A"}</td>
                <td>
                    <span class="priority-dot ${getPriorityClass(incident.priority)}"></span>
                    ${incident.priority || "N/A"}
                </td>
                <td>
                    <span class="status-badge ${getStatusClass(incident.status)}">
                        ${incident.status || "N/A"}
                    </span>
                </td>
                <td>${incident.assigned || "Sin Asignar"}</td>
                <td>${createdFormatted}</td>
                <td>${closedFormatted}</td>
            </tr>
        `;
    }).join("");
}

function formatDateForTable(dateString) {
    if (!dateString) return "N/A";
    try {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (e) {
        return "N/A";
    }
}

function applyReportFilters() {
    reportFilters.estado = document.getElementById("filter-report-status").value;
    reportFilters.categoria = document.getElementById("filter-report-type").value;
    reportFilters.prioridad = document.getElementById("filter-report-priority").value;
    reportFilters.tecnico = document.getElementById("filter-report-tech").value;
    reportFilters.fechaDesde = document.getElementById("filter-report-from").value;
    reportFilters.fechaHasta = document.getElementById("filter-report-to").value;

    let incidents = Storage.getIncidents();

    if (reportFilters.estado) {
        incidents = incidents.filter(i => i.status === reportFilters.estado);
    }

    if (reportFilters.categoria) {
        incidents = incidents.filter(i => i.type === reportFilters.categoria);
    }

    if (reportFilters.prioridad) {
        incidents = incidents.filter(i => i.priority === reportFilters.prioridad);
    }

    if (reportFilters.tecnico) {
        if (reportFilters.tecnico === "Sin Asignar") {
            incidents = incidents.filter(i => !i.assigned || i.assigned === "Sin Asignar");
        } else {
            incidents = incidents.filter(i => i.assigned === reportFilters.tecnico);
        }
    }

    if (reportFilters.fechaDesde) {
        const from = new Date(reportFilters.fechaDesde);
        incidents = incidents.filter(i => {
            const incDate = new Date(i.date || i.createdAt || 0);
            return incDate >= from;
        });
    }

    if (reportFilters.fechaHasta) {
        const to = new Date(reportFilters.fechaHasta);
        to.setHours(23, 59, 59, 999);
        incidents = incidents.filter(i => {
            const incDate = new Date(i.date || i.createdAt || 0);
            return incDate <= to;
        });
    }

    document.getElementById("reports-table-body").innerHTML = buildReportRows(incidents);
    updateReportSummary(incidents);
}

function updateReportSummary(incidents) {
    const total = Storage.getIncidents().length;
    const filtered = incidents.length;
    const resolved = incidents.filter(i => i.status === "Resuelto").length;
    const pending = incidents.filter(i => i.status !== "Resuelto").length;

    document.getElementById("total-incidents").textContent = total;
    document.getElementById("filtered-incidents").textContent = filtered;
    document.getElementById("resolved-incidents").textContent = resolved;
    document.getElementById("pending-incidents").textContent = pending;
}

function clearReportFilters() {
    reportFilters = {
        estado: "",
        categoria: "",
        prioridad: "",
        tecnico: "",
        fechaDesde: "",
        fechaHasta: ""
    };

    document.getElementById("filter-report-status").value = "";
    document.getElementById("filter-report-type").value = "";
    document.getElementById("filter-report-priority").value = "";
    document.getElementById("filter-report-tech").value = "";
    document.getElementById("filter-report-from").value = "";
    document.getElementById("filter-report-to").value = "";

    const incidents = Storage.getIncidents();
    document.getElementById("reports-table-body").innerHTML = buildReportRows(incidents);
    updateReportSummary(incidents);
    showToast("Filtros limpios", "success");
}

function exportToCSV() {
    let incidents = Storage.getIncidents();

    if (reportFilters.estado || reportFilters.categoria || reportFilters.prioridad || 
        reportFilters.tecnico || reportFilters.fechaDesde || reportFilters.fechaHasta) {
        applyReportFilters();
        incidents = Storage.getIncidents();
    }

    let csv = "ID,Usuario,Categoría,Prioridad,Estado,Técnico,Creación,Cierre\n";

    incidents.forEach(incident => {
        const createdDate = incident.date || incident.createdAt || "";
        const createdFormatted = createdDate ? formatDateForCSV(createdDate) : "N/A";
        const closedDate = incident.status === "Resuelto" ? incident.updatedAt || createdDate : "";
        const closedFormatted = closedDate ? formatDateForCSV(closedDate) : "N/A";

        csv += `"${incident.id}","${incident.reportadoPor || "Cliente"}","${incident.type || "N/A"}","${incident.priority || "N/A"}","${incident.status || "N/A"}","${incident.assigned || "Sin Asignar"}","${createdFormatted}","${closedFormatted}"\n`;
    });

    downloadFile(csv, "reportes_incidentes.csv", "text/csv");
    showToast("Reporte exportado a CSV", "success");
}

function formatDateForCSV(dateString) {
    if (!dateString) return "N/A";
    try {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    } catch (e) {
        return "N/A";
    }
}

function downloadFile(content, filename, type) {
    const element = document.createElement("a");
    element.setAttribute("href", "data:" + type + ";charset=utf-8," + encodeURIComponent(content));
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function printReport() {
    window.print();
    showToast("Abriendo vista previa de impresión", "success");
}

function getPriorityClass(priority) {
    switch (priority) {
        case "Crítica":
            return "critical";
        case "Alta":
            return "high";
        case "Media":
            return "medium";
        case "Baja":
            return "low";
        default:
            return "medium";
    }
}

function getStatusClass(status) {
    switch (status) {
        case "Abierto":
            return "status-open";
        case "En Proceso":
            return "status-progress";
        case "Resuelto":
            return "status-resolved";
        default:
            return "status-open";
    }
}
