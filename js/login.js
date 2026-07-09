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

            <div class="forgot-password-link">
                <a onclick="goToPasswordRecovery()">¿Olvidó su contraseña?</a>
            </div>

            <div class="login-footer">
                ITSM Service Desk © 2026
            </div>

        </div>

    `;

}

function login() {

    const usuario = document.getElementById("txtUser").value.trim().toLowerCase();
    const password = document.getElementById("txtPass").value.trim();

    const defaultUsuarios = [
        {
            usuario: "admin",
            password: "123",
            rol: "Administrador",
            nombre: "Administrador"
        },
        {
            usuario: "carlos",
            password: "123",
            rol: "Técnico de TI",
            nombre: "Carlos R. (Redes)"
        },
        {
            usuario: "diana",
            password: "123",
            rol: "Técnico de TI",
            nombre: "Diana M. (Sistemas)"
        },
        {
            usuario: "fabian",
            password: "123",
            rol: "Técnico de TI",
            nombre: "Fabián T. (Soporte)"
        },
        {
            usuario: "cliente",
            password: "123",
            rol: "Cliente",
            nombre: "Cliente"
        }
    ];

    let usuarioEncontrado = null;
    
    // Buscar en usuarios por defecto
    const defaultUser = defaultUsuarios.find(item => item.usuario === usuario);

    if (defaultUser) {
        const recoveredPassword = localStorage.getItem(`user_${usuario}_password`);
        const correctPassword = recoveredPassword || defaultUser.password;

        if (correctPassword === password) {
            usuarioEncontrado = {
                usuario: defaultUser.usuario,
                rol: defaultUser.rol,
                nombre: defaultUser.nombre
            };
        }
    }

    // Si no encontró en usuarios por defecto, buscar en usuarios guardados
    if (!usuarioEncontrado && typeof Storage !== "undefined" && Storage.getUsers) {
        const allUsers = Storage.getUsers();
        const savedUser = allUsers.find(u => u.usuario === usuario && u.password === password && u.estado === "Activo");
        
        if (savedUser) {
            usuarioEncontrado = {
                usuario: savedUser.usuario,
                rol: savedUser.rol,
                nombre: savedUser.nombre
            };
        }
    }

    if (usuarioEncontrado) {
        if (typeof Storage !== "undefined" && Storage.login) {
            Storage.login(usuarioEncontrado);
        } else {
            localStorage.setItem("logged", "true");
            localStorage.setItem("usuario", usuarioEncontrado.usuario);
            localStorage.setItem("rol", usuarioEncontrado.rol);
            localStorage.setItem("nombre", usuarioEncontrado.nombre);
        }

        startApp();
    } else {
        document
            .getElementById("login-error")
            .classList.add("show");
    }

}

function logout() {

    if (typeof Storage !== "undefined" && Storage.logout) {
        Storage.logout();
    } else {
        localStorage.removeItem("logged");
        localStorage.removeItem("usuario");
        localStorage.removeItem("rol");
        localStorage.removeItem("nombre");
    }

    location.reload();

}