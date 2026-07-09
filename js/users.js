let currentUserEditId = null;

function renderUsers() {
    // Asegurar que existan usuarios de prueba
    Storage.ensureSeedUsers();

    const users = Storage.getUsers();
    const canManage = Storage.isAdmin();

    document.getElementById("users").innerHTML = `
        <div class="users-header">
            <h1>Gestión de Usuarios</h1>
            <p>Administra los usuarios del sistema, roles y estados de acceso.</p>
        </div>

        <div class="users-layout">
            ${canManage ? `
                <div class="user-form-card">
                    <h2 id="form-title">Registrar Nuevo Usuario</h2>

                    <label>Nombre completo</label>
                    <input 
                        type="text" 
                        id="user-nombre" 
                        placeholder="Ej. Juan Pérez García"
                    >

                    <label>Correo electrónico</label>
                    <input 
                        type="email" 
                        id="user-correo" 
                        placeholder="Ej. juan@itsm.com"
                    >

                    <label>Usuario (login)</label>
                    <input 
                        type="text" 
                        id="user-usuario" 
                        placeholder="Ej. jpérez"
                    >

                    <label>Contraseña</label>
                    <input 
                        type="password" 
                        id="user-password" 
                        placeholder="Ingrese una contraseña"
                    >

                    <label>Rol</label>
                    <select id="user-rol">
                        <option value="Cliente">Cliente</option>
                        <option value="Técnico de TI">Técnico de TI</option>
                        <option value="Administrador">Administrador</option>
                    </select>

                    <div class="button-group">
                        <button class="btn-register" onclick="saveUser()">
                            Guardar Usuario
                        </button>
                        ${currentUserEditId ? `
                            <button class="btn-cancel" onclick="cancelEditUser()">
                                Cancelar
                            </button>
                        ` : ""}
                    </div>

                    ${currentUserEditId ? `
                        <div class="edit-notice">
                            Editando usuario ID: ${currentUserEditId}
                        </div>
                    ` : ""}
                </div>
            ` : ""}

            <div class="user-table-section">
                <div class="user-filters">
                    <input 
                        type="text" 
                        id="search-user" 
                        placeholder="Buscar por nombre, correo o rol..."
                        oninput="filterUsers()"
                    >

                    <select id="filter-role" onchange="filterUsers()">
                        <option value="">Todos los Roles</option>
                        <option value="Administrador">Administrador</option>
                        <option value="Técnico de TI">Técnico de TI</option>
                        <option value="Cliente">Cliente</option>
                    </select>

                    <select id="filter-status" onchange="filterUsers()">
                        <option value="">Todos los Estados</option>
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                    </select>

                    <button class="btn-refresh" onclick="refreshUsers()">
                        Recargar
                    </button>
                </div>

                <div class="user-table-card">
                    <table class="user-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Correo</th>
                                <th>Usuario</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                ${canManage ? `<th>Acciones</th>` : ""}
                            </tr>
                        </thead>
                        <tbody id="user-table-body">
                            ${buildUserRows(users, canManage)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    document.getElementById("dashboard").style.display = "none";
    document.getElementById("incidents").style.display = "none";
    document.getElementById("kanban").style.display = "none";
    document.getElementById("reports").style.display = "none";
    if (document.getElementById("users")) {
        document.getElementById("users").style.display = "block";
    }
}

function buildUserRows(users, canManage) {
    if (users.length === 0) {
        return `
            <tr>
                <td colspan="${canManage ? 7 : 6}" style="text-align: center; padding: 40px;">
                    No hay usuarios registrados
                </td>
            </tr>
        `;
    }

    return users.map(user => `
        <tr class="user-row ${user.estado === 'Inactivo' ? 'inactive' : ''}">
            <td>#${user.id}</td>
            <td>${user.nombre}</td>
            <td>${user.correo}</td>
            <td>${user.usuario}</td>
            <td>
                <span class="role-badge role-${user.rol.toLowerCase().replace(/\s+/g, '-')}">
                    ${user.rol}
                </span>
            </td>
            <td>
                <span class="status-badge status-${user.estado.toLowerCase()}">
                    ${user.estado}
                </span>
            </td>
            ${canManage ? `
                <td class="actions-cell">
                    <button class="btn-action btn-edit" onclick="editUser(${user.id})" title="Editar">
                        ✎
                    </button>
                    <button class="btn-action btn-toggle" onclick="toggleUserStatus(${user.id})" title="${user.estado === 'Activo' ? 'Desactivar' : 'Activar'}">
                        ${user.estado === 'Activo' ? '⊘' : '✓'}
                    </button>
                </td>
            ` : ""}
        </tr>
    `).join("");
}

function filterUsers() {
    const searchInput = document.getElementById("search-user").value;
    const roleFilter = document.getElementById("filter-role").value;
    const statusFilter = document.getElementById("filter-status").value;

    let users = Storage.getUsers();

    if (searchInput) {
        users = Storage.searchUsers(searchInput);
    }

    if (roleFilter) {
        users = users.filter(u => u.rol === roleFilter);
    }

    if (statusFilter) {
        users = users.filter(u => u.estado === statusFilter);
    }

    document.getElementById("user-table-body").innerHTML = buildUserRows(users, Storage.isAdmin());
}

function saveUser() {
    const nombre = document.getElementById("user-nombre").value.trim();
    const correo = document.getElementById("user-correo").value.trim();
    const usuario = document.getElementById("user-usuario").value.trim();
    const password = document.getElementById("user-password").value.trim();
    const rol = document.getElementById("user-rol").value;

    // Validaciones
    if (!nombre) {
        showToast("El nombre es obligatorio", "error");
        return;
    }

    if (!correo || !correo.includes("@")) {
        showToast("Ingrese un correo válido", "error");
        return;
    }

    if (!usuario) {
        showToast("El usuario (login) es obligatorio", "error");
        return;
    }

    if (!password || password.length < 3) {
        showToast("La contraseña debe tener al menos 3 caracteres", "error");
        return;
    }

    let result;

    if (currentUserEditId) {
        result = Storage.updateUser(currentUserEditId, {
            nombre,
            correo,
            rol,
            password
        });
    } else {
        result = Storage.addUser({
            nombre,
            correo,
            usuario,
            password,
            rol,
            estado: "Activo"
        });
    }

    if (result.success) {
        showToast(result.message, "success");
        clearUserForm();
        renderUsers();
    } else {
        showToast(result.message, "error");
    }
}

function editUser(id) {
    const user = Storage.getUserById(id);

    if (!user) {
        showToast("Usuario no encontrado", "error");
        return;
    }

    currentUserEditId = id;

    document.getElementById("form-title").textContent = `Editar Usuario: ${user.nombre}`;
    document.getElementById("user-nombre").value = user.nombre;
    document.getElementById("user-correo").value = user.correo;
    document.getElementById("user-usuario").value = user.usuario;
    document.getElementById("user-usuario").disabled = true;
    document.getElementById("user-password").value = user.password;
    document.getElementById("user-rol").value = user.rol;

    document.querySelector(".user-form-card").scrollIntoView({ behavior: "smooth", block: "start" });
}

function cancelEditUser() {
    currentUserEditId = null;
    clearUserForm();
    renderUsers();
}

function clearUserForm() {
    currentUserEditId = null;
    document.getElementById("user-nombre").value = "";
    document.getElementById("user-correo").value = "";
    document.getElementById("user-usuario").value = "";
    document.getElementById("user-usuario").disabled = false;
    document.getElementById("user-password").value = "";
    document.getElementById("user-rol").value = "Cliente";
    document.getElementById("form-title").textContent = "Registrar Nuevo Usuario";
}

function toggleUserStatus(id) {
    const user = Storage.getUserById(id);

    if (!user) {
        showToast("Usuario no encontrado", "error");
        return;
    }

    const action = user.estado === "Activo" ? "desactivar" : "activar";
    const confirmed = confirm(`¿Deseas ${action} a ${user.nombre}?`);

    if (!confirmed) {
        return;
    }

    const result = Storage.toggleUserStatus(id);

    if (result.success) {
        showToast(result.message, "success");
        renderUsers();
    } else {
        showToast(result.message, "error");
    }
}

function refreshUsers() {
    document.getElementById("search-user").value = "";
    document.getElementById("filter-role").value = "";
    document.getElementById("filter-status").value = "";
    cancelEditUser();
    renderUsers();
}
