function renderLogin() {

    const login = document.getElementById("login-screen");

    login.innerHTML = `

        <div class="login-card">

            <div class="login-logo">

                <h1>ITSM</h1>

                <p>Service Desk</p>

            </div>

            <div id="login-error" class="login-error">
                Usuario o contraseña incorrectos
            </div>

            <label>Usuario</label>

            <input
                type="text"
                id="txtUser"
                placeholder="Ingrese su usuario"
            >

            <label>Contraseña</label>

            <input
                type="password"
                id="txtPass"
                placeholder="Ingrese su contraseña"
            >

            <button onclick="login()">

                Iniciar Sesión

            </button>

            <div class="login-footer">

                ITSM Service Desk © 2026

            </div>

        </div>

    `;

}

function login() {

    const usuario = document.getElementById("txtUser").value.trim();

    const password = document.getElementById("txtPass").value.trim();

    if (usuario === "admin" && password === "123") {

        localStorage.setItem("logged", "true");

        startApp();

    } else {

        document
            .getElementById("login-error")
            .classList.add("show");

    }

}

function logout() {

    localStorage.removeItem("logged");

    location.reload();

}