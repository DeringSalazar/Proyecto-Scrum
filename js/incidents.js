function renderIncidents(){

    document.getElementById("incidents").innerHTML=`

        <h1>Incidentes</h1>

        <table class="incident-table">

            <tr>

                <th>ID</th>
                <th>Título</th>
                <th>Estado</th>

            </tr>

            <tr>

                <td>INC001</td>
                <td>Sin Internet</td>
                <td>Abierto</td>

            </tr>

        </table>

    `;

    document.getElementById("dashboard").style.display="none";
    document.getElementById("incidents").style.display="block";
    document.getElementById("kanban").style.display="none";

}