function renderDashboard(){

    document.getElementById("dashboard").innerHTML=`

        <h1>Dashboard</h1>

        <div class="cards">

            <div class="card">
                <h2>Tickets abiertos</h2>
                <h1>25</h1>
            </div>

            <div class="card">
                <h2>En proceso</h2>
                <h1>12</h1>
            </div>

            <div class="card">
                <h2>Resueltos</h2>
                <h1>83</h1>
            </div>

        </div>

    `;

    document.getElementById("dashboard").style.display="block";
    document.getElementById("incidents").style.display="none";
    document.getElementById("kanban").style.display="none";

}