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

    if (typeof Storage !== "undefined" && Storage.ensureSeedUsers) {
        Storage.ensureSeedUsers();
    }

    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");

    renderSidebar();
    renderTopbar();

    const canManage = typeof Storage !== "undefined" &&
        (Storage.isTecnico() || Storage.isAdmin());

    if (canManage) {
        renderDashboard();
    } else {
        renderIncidents();
    }
}

// NAVEGACIÓN DEL SIDEBAR
function goDashboard() {
    const canManage = typeof Storage !== "undefined" &&
        (Storage.isTecnico() || Storage.isAdmin());
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

function goUsers() {
    renderUsers();
}

function goReports() {
    renderReports();
}