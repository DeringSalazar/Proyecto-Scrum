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

    const usuario = document.getElementById("txtUser").value.trim().toLowerCase();

    const password = document.getElementById("txtPass").value.trim();

    const usuarios = [

        {
            usuario: "admin",
            password: "123",
            rol: "Administrador"
        },

        {
            usuario: "tecnico",
            password: "123",
            rol: "Técnico de TI"
        },

        {
            usuario: "cliente",
            password: "123",
            rol: "Cliente"
        }

    ];

    const usuarioEncontrado = usuarios.find(function (item) {

        return item.usuario === usuario && item.password === password;

    });

    if (usuarioEncontrado) {

        localStorage.setItem("logged", "true");

        localStorage.setItem("usuario", usuarioEncontrado.usuario);

        localStorage.setItem("rol", usuarioEncontrado.rol);

        startApp();

    } else {

        document
            .getElementById("login-error")
            .classList.add("show");

    }

}

function logout() {

    localStorage.removeItem("logged");

    localStorage.removeItem("usuario");

    localStorage.removeItem("rol");

    location.reload();

}