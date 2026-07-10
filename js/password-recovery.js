const passwordRecoveryData = {
    usuarios: [
        { usuario: "admin", securityAnswer: "itsm2026" },
        { usuario: "carlos", securityAnswer: "redes2026" },
        { usuario: "diana", securityAnswer: "sistemas2026" },
        { usuario: "fabian", securityAnswer: "soporte2026" },
        { usuario: "cliente", securityAnswer: "cliente2026" }
    ]
};

// RECUPERAR CONTRASEÑA

function renderForgotPasswordScreen() {
    const login =
        document.getElementById("login-screen");
    login.innerHTML = `
    <div class="login-container">
        <div class="login-form-side">
            <div class="login-logo">
                <h1>
                    Recuperar
                </h1>
                <p>
                    Recuperación de contraseña
                </p>
            </div>
            <div id="forgot-error" class="login-error"></div>
            <div id="forgot-success" class="login-success white-message"></div>
            <div class="input-group">
                <label>
                    Usuario
                </label>
                <input
                    type="text"
                    id="forgotUser"
                    placeholder="Ingrese su usuario"
                >
            </div>
            <button onclick="sendPasswordRecovery()">
                Verificar Usuario
            </button>
            <div class="forgot-password-link">
                <a onclick="renderLogin()">
                    ← Volver a Login
                </a>
            </div>
            <div class="login-footer">
                ITSM Service Desk © 2026
            </div>
        </div>
        <div class="login-info-side">
            <h2>
                ITSM
            </h2>

            <h3>
                Service Desk
            </h3>
            <p>
                Recupera tu acceso al sistema
                mediante una validación segura
                de identidad.
            </p>
        </div>
    </div>
    `;
}

// PANTALLA VERIFICACIÓN DE SEGURIDAD
function renderSecurityQuestionScreen() {
    const login =
        document.getElementById("login-screen");
    login.innerHTML = `
    <div class="login-container">
        <div class="login-form-side">
            <div class="login-logo">
                <h1>
                    Verificación
                </h1>
                <p>
                    Seguridad de cuenta
                </p>
            </div>
            <div id="security-error" class="login-error"></div>
            <div id="security-success" class="login-success white-message"></div>
            <div class="input-group">
                <label>

                    Código de seguridad

                </label>
                <input
                    type="text"
                    id="securityAnswer"
                    placeholder="Ingrese su respuesta"
                >
            </div>
            <div class="security-hint white-message"">
                Pregunta:
                ¿Cuál es tu palabra clave de seguridad?
            </div>
            <button onclick="verifySecurity()">
                Verificar
            </button>
            <div class="forgot-password-link">
                <a onclick="renderForgotPasswordScreen()">
                    ← Volver
                </a>
            </div>
            <div class="login-footer">
                ITSM Service Desk © 2026
            </div>
        </div>
        <div class="login-info-side">
            <h2>
                ITSM
            </h2>
            <h3>
                Protección de cuenta
            </h3>
            <p>
                Validamos tu identidad antes
                de permitir el cambio de contraseña.
            </p>
        </div>
    </div>
    `;
}

// VALIDAR RESPUESTA DE SEGURIDAD

function verifySecurity() {
    const answer = document
        .getElementById("securityAnswer")
        .value
        .trim();
    const usuario =
        sessionStorage.getItem("recoveryUser");
    const errorDiv =
        document.getElementById("security-error");
    const successDiv =
        document.getElementById("security-success");

    errorDiv.textContent = "";
    successDiv.textContent = "";
    errorDiv.classList.remove("show");
    successDiv.classList.remove("show");

    if (!answer) {
        errorDiv.textContent =
            "Por favor, ingrese la respuesta de seguridad";
        errorDiv.classList.add("show");
        return;
    }

    const usuarioData =
        passwordRecoveryData.usuarios.find(
            u => u.usuario === usuario
        );
    if (
        usuarioData.securityAnswer.toLowerCase()
        !==
        answer.toLowerCase()
    ) {
        errorDiv.textContent =
            "Respuesta de seguridad incorrecta";
        errorDiv.classList.add("show");
        return;
    }
    successDiv.textContent =
        "✓ Verificación exitosa. Procediendo a restablecer contraseña...";
    successDiv.classList.add("show");
    sessionStorage.setItem(
        "recoveryStep",
        "reset"
    );
    setTimeout(() => {
        renderResetPasswordScreen();
    },2000);
}

// VALIDAR USUARIO
function sendPasswordRecovery() {
    const usuario = document
        .getElementById("forgotUser")
        .value
        .trim()
        .toLowerCase();
    const errorDiv =
        document.getElementById("forgot-error");
    const successDiv =
        document.getElementById("forgot-success");
    errorDiv.textContent = "";
    successDiv.textContent = "";
    errorDiv.classList.remove("show");
    successDiv.classList.remove("show");
    if (!usuario) {
        errorDiv.textContent =
            "Por favor, ingrese su usuario";
        errorDiv.classList.add("show");
        return;
    }
    const usuarioEncontrado =
        passwordRecoveryData.usuarios.find(
            u => u.usuario === usuario
        );
    if (!usuarioEncontrado) {
        errorDiv.textContent =
            "Usuario no encontrado";
        errorDiv.classList.add("show");
        return;
    }
    sessionStorage.setItem(
        "recoveryUser",
        usuario
    );
    sessionStorage.setItem(
        "recoveryStep",
        "verify"
    );
    successDiv.textContent =
        "✓ Usuario verificado. Responda la pregunta de seguridad.";
    successDiv.classList.add("show");

    setTimeout(() => {
        renderSecurityQuestionScreen();
    },1500);
}
// ==========================================
// PANTALLA RESTABLECER CONTRASEÑA
// ==========================================

function renderResetPasswordScreen() {

    const login = document.getElementById("login-screen");

    login.innerHTML = `
    <div class="login-container">

        <div class="login-form-side">

            <div class="login-logo">
                <h1>Nueva contraseña</h1>
                <p>Actualiza tus credenciales</p>
            </div>
            <div id="reset-error" class="login-error"></div>
            <div id="reset-success" class="login-success white-message"></div>
            <div class="input-group">
                <label>Nueva contraseña</label>
                <input
                    type="password"
                    id="newPassword"
                    placeholder="Ingrese su nueva contraseña"
                >
            </div>
            <div class="input-group">
                <label>Confirmar contraseña</label>
                <input
                    type="password"
                    id="confirmPassword"
                    placeholder="Confirme su contraseña"
                >
            </div>
            <div class="password-requirements white-message">
                <strong>Requisitos:</strong>
                <br>
                • Mínimo 6 caracteres
                <br>
                • Al menos una mayúscula
                <br>
                • Al menos un número

            </div>

            <button onclick="resetPassword()">
                Actualizar Contraseña
            </button>

            <div class="login-footer">
                ITSM Service Desk © 2026
            </div>

        </div>


        <div class="login-info-side">

            <h2>ITSM</h2>

            <h3>Seguridad</h3>

            <p>
                Mantén tu cuenta protegida
                utilizando una contraseña segura.
            </p>

        </div>

    </div>
    `;

}

// ACTUALIZAR CONTRASEÑA
function resetPassword() {

    const newPassword =
        document.getElementById("newPassword").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;

    const errorDiv =
        document.getElementById("reset-error");

    const successDiv =
        document.getElementById("reset-success");


    errorDiv.textContent = "";
    successDiv.textContent = "";
    errorDiv.classList.remove("show");
    successDiv.classList.remove("show");

    if (!newPassword || !confirmPassword) {
        errorDiv.textContent =
            "Por favor, complete todos los campos";
        errorDiv.classList.add("show");
        return;
    }

    if (newPassword.length < 6) {
        errorDiv.textContent =
            "La contraseña debe tener al menos 6 caracteres";
        errorDiv.classList.add("show");
        return;
    }

    if (!/[A-Z]/.test(newPassword)) {
        errorDiv.textContent =
            "La contraseña debe contener al menos una mayúscula";
        errorDiv.classList.add("show");
        return;
    }

    if (!/[0-9]/.test(newPassword)) {
        errorDiv.textContent =
            "La contraseña debe contener al menos un número";
        errorDiv.classList.add("show");
        return;
    }

    if (newPassword !== confirmPassword) {
        errorDiv.textContent =
            "Las contraseñas no coinciden";
        errorDiv.classList.add("show");
        return;
    }

    const usuario =
        sessionStorage.getItem("recoveryUser");
    if (!usuario) {
        errorDiv.textContent =
            "Error en la sesión de recuperación. Intente de nuevo.";
        errorDiv.classList.add("show");
        return;
    }

    const passwordKey =
        `user_${usuario}_password`;
    localStorage.setItem(
        passwordKey,
        newPassword
    );

    successDiv.textContent =
        "✓ Contraseña actualizada exitosamente. Redirigiendo al login...";
    successDiv.classList.add("show");
    sessionStorage.removeItem("recoveryUser");
    sessionStorage.removeItem("recoveryStep");
    setTimeout(() => {
        renderLogin();
    },2500);
}

// IR A RECUPERACIÓN
function goToPasswordRecovery(){
    renderForgotPasswordScreen();
}