function renderDashboard() {

    let incidents = [];

    if (typeof Storage !== "undefined" && Storage.getVisibleIncidentsForCurrentUser) {
        incidents = Storage.getVisibleIncidentsForCurrentUser();
    } else if (typeof Storage !== "undefined" && Storage.getIncidents) {
        incidents = Storage.getIncidents();
    }

    const total = incidents.length;
    const abiertos = incidents.filter(i => i.status === "Abierto").length;
    const enProceso = incidents.filter(i => i.status === "En Proceso").length;
    const resueltos = incidents.filter(i => i.status === "Resuelto").length;
    const pendientes = typeof Storage !== "undefined" && Storage.getIncidentesPendientes
        ? Storage.getIncidentesPendientes()
        : [];

    const sla = total > 0 ? Math.round((resueltos / total) * 100) : 0;

    let acciones = typeof Storage !== "undefined" && Storage.getDashboardActions ? Storage.getDashboardActions() : [];

    if (acciones.length === 0) {
        acciones = [
            { texto: "Se arrastró INC-5 de Resuelto a Abierto", hora: "18:56" },
            { texto: "Se arrastró INC-1 de En Proceso a Abierto", hora: "18:56" },
            { texto: "Se actualizó INC-4: estado de Abierto a En Proceso", hora: "20:37" },
            { texto: "Se devolvió INC-2 a Abierto / En Proceso", hora: "20:36" },
            { texto: "Se devolvió INC-1 a Abierto / En Proceso", hora: "20:36" }
        ];
    }

    document.getElementById("dashboard").innerHTML = `
        <div class="dashboard-header">
            <h1>Dashboard Operativo de TI</h1>
            <p>Métricas claves de los incidentes activos en la infraestructura de la empresa.</p>
        </div>

        <div class="dashboard-cards">

            <div class="dashboard-card card-blue">
                <h3>INCIDENTES TOTALES</h3>
                <h2>${total}</h2>
            </div>

            <div class="dashboard-card card-red">
                <h3>ABIERTOS (OPEN)</h3>
                <h2>${abiertos}</h2>
            </div>

            <div class="dashboard-card card-yellow">
                <h3>EN PROCESO</h3>
                <h2>${enProceso}</h2>
            </div>

            <div class="dashboard-card card-green">
                <h3>RESUELTOS</h3>
                <h2>${resueltos}</h2>
            </div>

        </div>

        <div class="dashboard-grid">

            <div class="dashboard-panel">
                <div class="panel-title">Porcentaje de Resolución (SLA)</div>

                <div class="sla-wrapper">
                    <div class="sla-chart"
                        style="background: conic-gradient(#1769aa 0deg ${sla * 3.6}deg, #e7f0fb ${sla * 3.6}deg 360deg);">
                        <div class="sla-inner">${sla}%</div>
                    </div>

                    <p>Incidentes cerrados satisfactoriamente</p>
                </div>
            </div>

            <div class="dashboard-panel">
                <div class="panel-title">Incidentes Pendientes</div>

                <div class="actions-list">
                    ${pendientes.length === 0 ? '<div class="action-item"><div class="action-content"><div class="action-text">No hay incidentes sin técnico asignado.</div></div></div>' : pendientes.map(item => `
                        <div class="action-item">
                            <div class="action-dot"></div>
                            <div class="action-content">
                                <div class="action-text">${item.id} - ${item.title}</div>
                                <div class="action-time">Estado: ${item.status}</div>
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>

            <div class="dashboard-panel">
                <div class="panel-title">Últimas Acciones</div>

                <div class="actions-list">
                    ${acciones.map(item => `
                        <div class="action-item">
                            <div class="action-dot"></div>
                            <div class="action-content">
                                <div class="action-text">${item.texto}</div>
                                <div class="action-time">${item.hora}</div>
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>

        </div>
    `;

    document.getElementById("dashboard").style.display = "block";
    document.getElementById("incidents").style.display = "none";
    document.getElementById("kanban").style.display = "none";
    document.getElementById("users").style.display = "none";
    document.getElementById("reports").style.display = "none";
}