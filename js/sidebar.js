function renderSidebar() {
    const canManage = typeof Storage !== "undefined" &&
        (Storage.isTecnico() || Storage.isAdmin());
    const sidebar = document.getElementById("sidebar");
    sidebar.className = "sidebar";
    sidebar.innerHTML = `
        <div class="logo">
            ITSM
        </div>
        <div class="menu">
            ${canManage ? `
                <button onclick="goDashboard()">
                    Dashboard
                </button>
            ` : ``}
            <button onclick="goIncidents()">
                Incidentes
            </button>
            <button onclick="goKanban()">
                Kanban
            </button>
            ${canManage ? `
                <button onclick="goUsers()">
                    Usuarios
                </button>
            ` : ``}
            <button onclick="goReports()">
                Reportes
            </button>
            <button onclick="logout()">
                Cerrar sesión
            </button>
        </div>
    `;
}