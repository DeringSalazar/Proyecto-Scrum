function renderSidebar(){

    document.getElementById("sidebar").innerHTML=`

        <div class="logo">
            ITSM
        </div>

        <button onclick="navigate('dashboard')">
            Dashboard
        </button>

        <button onclick="navigate('incidents')">
            Incidentes
        </button>

        <button onclick="navigate('kanban')">
            Kanban
        </button>

        <button onclick="navigate('scrum')">
            Scrum
        </button>

        <button onclick="logout()">
            Cerrar sesión
        </button>

    `;

}