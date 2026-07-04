window.onload = () => {
    if (typeof Storage !== "undefined" && Storage.isLogged && Storage.isLogged()) {
        startApp();
    } else {
        renderLogin();
    }
};

function startApp() {
    if (typeof Storage !== "undefined" && Storage.ensureSeedIncidents) {
        Storage.ensureSeedIncidents();
    }
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    renderSidebar();
    renderTopbar();
    const canManage = typeof Storage !== "undefined" && (Storage.isTecnico() || Storage.isAdmin());
    if (canManage) {
        renderDashboard();
    } else {
        renderIncidents();
    }
}

function renderSidebar() {
    const canManage = typeof Storage !== "undefined" && (Storage.isTecnico() || Storage.isAdmin());
    document.getElementById("sidebar").className = "sidebar";
    document.getElementById("sidebar").innerHTML = `
        <div class="logo">ITSM</div>
        <div class="menu">
            ${canManage ? `<button onclick="goDashboard()">Dashboard</button>` : ``}
            <button onclick="goIncidents()">Incidentes</button>
            <button onclick="goKanban()">Kanban</button>
            <button onclick="logout()">Cerrar sesión</button>
        </div>
    `;
}

function renderTopbar() {
    document.getElementById("topbar").className = "topbar";
    const rol = typeof Storage !== "undefined" && Storage.getCurrentUserRole ? Storage.getCurrentUserRole() : (localStorage.getItem("rol") || "Usuario");
    document.getElementById("topbar").innerHTML = `
        <h2>
            ITSM Service Desk
        </h2>
        <div class="user">
            ${rol}
        </div>
    `;
}

function goDashboard() {
    const canManage = typeof Storage !== "undefined" && (Storage.isTecnico() || Storage.isAdmin());
    if (canManage) {
        renderDashboard();
    } else {
        renderIncidents();
    }
}

function goIncidents() {
    renderIncidents();
}

function goKanban() {
    renderKanban();
}