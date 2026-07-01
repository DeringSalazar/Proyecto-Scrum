function renderKanban(){

    document.getElementById("kanban").innerHTML=`

        <h1>Kanban</h1>

        <div class="kanban">

            <div class="column">

                <h3>Pendiente</h3>

                <div class="task">
                    Actualizar servidor
                </div>

            </div>

            <div class="column">

                <h3>En proceso</h3>

                <div class="task">
                    Revisar VPN
                </div>

            </div>

            <div class="column">

                <h3>Finalizado</h3>

                <div class="task">
                    Crear usuario
                </div>

            </div>

        </div>

    `;

    document.getElementById("dashboard").style.display="none";
    document.getElementById("incidents").style.display="none";
    document.getElementById("kanban").style.display="block";

}