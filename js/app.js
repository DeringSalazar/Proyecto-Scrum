window.onload = () => {

    if (localStorage.getItem("logged")) {

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

    renderDashboard();

}

function renderSidebar() {

    document.getElementById("sidebar").className = "sidebar";

    document.getElementById("sidebar").innerHTML = `

        <div class="logo">

            ITSM

        </div>

        <div class="menu">

            <button onclick="goDashboard()">

                Dashboard

            </button>

            <button onclick="goIncidents()">

                Incidentes

            </button>

            <button onclick="goKanban()">

                Kanban

            </button>

            <button onclick="logout()">

                Cerrar sesión

            </button>

        </div>

    `;

}

function renderTopbar() {

    document.getElementById("topbar").className = "topbar";

    const rol = localStorage.getItem("rol") || "Usuario";

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

    renderDashboard();

}

function goIncidents() {

    renderIncidents();

}

function goKanban() {

    renderKanban();

}