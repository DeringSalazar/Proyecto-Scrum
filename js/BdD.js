const Storage = {
    getCurrentUser() {
        return localStorage.getItem("usuario") || "cliente";
    },
    getCurrentUserName() {
        return localStorage.getItem("nombre") || "Cliente";
    },
    getCurrentUserRole() {
        return localStorage.getItem("rol") || "Cliente";
    },
    getCurrentUserSession() {
        return {
            usuario: this.getCurrentUser(),
            rol: this.getCurrentUserRole(),
            nombre: this.getCurrentUserName()
        };
    },

    isAdmin() {
        return this.getCurrentUserRole().toLowerCase().includes("admin");
    },
    isTecnico() {
        const rol = this.getCurrentUserRole().toLowerCase();
        return this.isAdmin() || rol.includes("técnico") || rol.includes("tecnico");
    },

    normalizeIncident(incident) {
        if (!incident) return incident;
        if (!incident.historial_estados) {
            incident.historial_estados = [];
        }
        if (!incident.notificaciones) {
            incident.notificaciones = [];
        }
        if (!incident.reportadoPor) {
            incident.reportadoPor = "Cliente";
        }
        if (!incident.reportadoPorUsuario) {
            incident.reportadoPorUsuario = "cliente";
        }
        if (!incident.assigned) {
            incident.assigned = "Sin Asignar";
        }
        if (!incident.createdAt) {
            incident.createdAt = incident.date || new Date().toISOString();
        }
        return incident;
    },

    getIncidents() {
        return (JSON.parse(localStorage.getItem("incidents")) || []).map(incident => this.normalizeIncident(incident));
    },

    saveIncidents(incidents) {
        localStorage.setItem("incidents", JSON.stringify((incidents || []).map(incident => this.normalizeIncident(incident))));
    },

    getDashboardActions() {
        return JSON.parse(localStorage.getItem("acciones_dashboard")) || [];
    },

    saveDashboardActions(actions) {
        localStorage.setItem("acciones_dashboard", JSON.stringify(actions || []));
    },

    addDashboardAction(text) {
        const actions = this.getDashboardActions();
        const now = new Date();
        const hour = String(now.getHours()).padStart(2, "0");
        const minute = String(now.getMinutes()).padStart(2, "0");

        actions.unshift({
            texto: text,
            hora: `${hour}:${minute}`
        });

        this.saveDashboardActions(actions.slice(0, 5));
    },

    ensureSeedIncidents() {

        const incidents = this.getIncidents();

        if (incidents.length > 0) {
            return incidents;
        }

        const seedIncidents = [
            {
                id: "INC-1",
                title: "Fallo de conexión VPN - Sucursal Central",
                description: "Los usuarios informan que no se pueden conectar mediante túneles IPsec. Sin acceso al ERP.",
                type: "Red",
                priority: "Crítica",
                assigned: "Carlos R. (Redes)",
                status: "Abierto",
                date: "2026-06-30T21:53",
                reportadoPor: "Cliente",
                reportadoPorUsuario: "cliente",
                historial_estados: [],
                notificaciones: []
            },
            {
                id: "INC-2",
                title: "Error crítico en base de datos - Licitaciones",
                description: "Tardanza en el procesamiento de transacciones. Sospecha de bloqueos cruzados en tabla central.",
                type: "Sistemas",
                priority: "Alta",
                assigned: "Diana M. (Sistemas)",
                status: "En Proceso",
                date: "2026-06-30T21:53",
                reportadoPor: "Cliente",
                reportadoPorUsuario: "cliente",
                historial_estados: [],
                notificaciones: []
            },
            {
                id: "INC-3",
                title: "Pantalla azul en PC de gerencia de finanzas",
                description: "Fallo repetitivo de memoria RAM en el computador corporativo de la gerencia.",
                type: "Hardware",
                priority: "Media",
                assigned: "Fabián T. (Soporte)",
                status: "Resuelto",
                date: "2026-06-30T21:53",
                reportadoPor: "Cliente",
                reportadoPorUsuario: "cliente",
                historial_estados: [],
                notificaciones: []
            }
        ];

        this.saveIncidents(seedIncidents);

        return this.getIncidents();

    },

    addIncident(incident) {

        const normalizedIncident = this.normalizeIncident({
            ...incident,
            historial_estados: incident.historial_estados || [],
            notificaciones: incident.notificaciones || []
        });

        const incidents = this.getIncidents();
        incidents.push(normalizedIncident);
        this.saveIncidents(incidents);

    },

    getIncidentById(id) {

        const incidents = this.getIncidents();

        return incidents.find(ticket => ticket.id === id);

    },

    updateIncident(id, data) {

        const incidents = this.getIncidents();

        const updated = incidents.map(ticket => {

            if (ticket.id === id) {

                return {
                    ...ticket,
                    ...data
                };

            }

            return ticket;

        });

        this.saveIncidents(updated);

    },

    getVisibleIncidentsForCurrentUser() {

        const incidents = this.getIncidents();
        const currentUser = this.getCurrentUser().toLowerCase();
        const currentName = this.getCurrentUserName().toLowerCase();

        if (this.isAdmin()) {
            return incidents;
        }

        if (this.isTecnico()) {
            return incidents.filter(incident => {
                const assigned = (incident.assigned || "").toLowerCase();
                const reporter = (incident.reportadoPorUsuario || "").toLowerCase();
                return reporter === currentUser || assigned === currentName || assigned === currentUser || assigned === "sin asignar";
            });
        }

        return incidents.filter(incident => (incident.reportadoPorUsuario || "").toLowerCase() === currentUser);

    },

    patchIncidentEstado(id, estadoNuevo, actor = null) {

        const actorInfo = actor || this.getCurrentUserSession();
        const currentRole = actorInfo.rol || this.getCurrentUserRole();
        const incidents = this.getIncidents();
        const incident = incidents.find(ticket => ticket.id === id);

        if (!incident) {
            return { success: false, message: "No se encontró el incidente." };
        }

        const isAdmin = currentRole.toLowerCase().includes("admin");
        const isTecnico = currentRole.toLowerCase().includes("técnico") || currentRole.toLowerCase().includes("tecnico") || isAdmin;
        const actorName = (actorInfo.nombre || actorInfo.usuario || this.getCurrentUserName()).toLowerCase();
        const assignedName = (incident.assigned || "").toLowerCase();
        const isAssignedTechnician = assignedName !== "" && assignedName !== "sin asignar" && (assignedName === actorName || assignedName.includes(actorName));

        if (!isAdmin && !isTecnico) {
            return { success: false, message: "Solo un técnico o administrador puede cambiar el estado." };
        }

        if (!isAdmin && !isAssignedTechnician) {
            return { success: false, message: "Solo el técnico asignado o un administrador pueden cambiar el estado." };
        }

        const allowedTransitions = {
            "Abierto": ["En Proceso"],
            "En Proceso": ["Resuelto"],
            "Resuelto": []
        };

        const estadoAnterior = incident.status;

        if (!allowedTransitions[estadoAnterior] || !allowedTransitions[estadoAnterior].includes(estadoNuevo)) {
            return { success: false, message: `Transición no permitida de ${estadoAnterior} a ${estadoNuevo}.` };
        }

        incident.status = estadoNuevo;
        incident.updatedAt = new Date().toISOString();

        this.saveIncidents(incidents);
        this.registrarCambioEstado(id, estadoAnterior, estadoNuevo, actorInfo.nombre || actorInfo.usuario || this.getCurrentUserName());
        this.agregarNotificacion(id, `El estado cambió de "${estadoAnterior}" a "${estadoNuevo}" por ${actorInfo.nombre || actorInfo.usuario || this.getCurrentUserName()}.`);

        return { success: true, message: `Estado actualizado a ${estadoNuevo}.`, incident };

    },

    patchIncidentAsignar(id, actor = null) {

        const actorInfo = actor || this.getCurrentUserSession();
        const currentRole = actorInfo.rol || this.getCurrentUserRole();
        const incidents = this.getIncidents();
        const incident = incidents.find(ticket => ticket.id === id);

        if (!incident) {
            return { success: false, message: "No se encontró el incidente." };
        }

        const isAdmin = currentRole.toLowerCase().includes("admin");
        const isTecnico = currentRole.toLowerCase().includes("técnico") || currentRole.toLowerCase().includes("tecnico") || isAdmin;

        if (!isAdmin && !isTecnico) {
            return { success: false, message: "Solo los técnicos o un administrador pueden autoasignarse incidentes." };
        }

        const assignedText = (incident.assigned || "").trim();

        if (assignedText && assignedText !== "Sin Asignar") {
            return { success: false, message: `El incidente ya está asignado a ${incident.assigned}.` };
        }

        incident.assigned = actorInfo.nombre || actorInfo.usuario || "Técnico";
        incident.updatedAt = new Date().toISOString();

        this.saveIncidents(incidents);
        this.agregarNotificacion(id, `El incidente fue autoasignado a ${incident.assigned}.`);

        return { success: true, message: `Incidente asignado a ${incident.assigned}.`, incident };

    },

    getIncidentes(filters = {}) {

        let incidents = this.getVisibleIncidentsForCurrentUser();

        if (filters.estado) {
            incidents = incidents.filter(incident => incident.status === filters.estado);
        }

        if (filters.fechaDesde) {
            const from = new Date(filters.fechaDesde);
            incidents = incidents.filter(incident => new Date(incident.date || incident.createdAt || 0) >= from);
        }

        if (filters.fechaHasta) {
            const to = new Date(filters.fechaHasta);
            incidents = incidents.filter(incident => new Date(incident.date || incident.createdAt || 0) <= to);
        }

        return incidents;

    },

    getIncidentesPendientes(filters = {}) {

        let incidents = this.getIncidents().filter(incident => {
            const assignedText = (incident.assigned || "").trim();
            return !assignedText || assignedText === "Sin Asignar";
        });

        if (filters.estado) {
            incidents = incidents.filter(incident => incident.status === filters.estado);
        }

        if (filters.fechaDesde) {
            const from = new Date(filters.fechaDesde);
            incidents = incidents.filter(incident => new Date(incident.date || incident.createdAt || 0) >= from);
        }

        if (filters.fechaHasta) {
            const to = new Date(filters.fechaHasta);
            incidents = incidents.filter(incident => new Date(incident.date || incident.createdAt || 0) <= to);
        }

        return incidents;

    },

    getIncidentesAutenticados() {
        return this.getVisibleIncidentsForCurrentUser();
    },

    registrarCambioEstado(id, estadoAnterior, estadoNuevo, usuario) {

        const incidents = this.getIncidents();

        const actualizados = incidents.map(ticket => {

            if (ticket.id !== id) return ticket;

            if (!ticket.historial_estados) {
                ticket.historial_estados = [];
            }

            ticket.historial_estados.push({

                fecha: new Date().toLocaleString(),

                usuario: usuario,

                anterior: estadoAnterior,

                nuevo: estadoNuevo

            });

            return ticket;

        });

        this.saveIncidents(actualizados);

    },

    agregarNotificacion(id, mensaje) {

        const incidents = this.getIncidents();

        const actualizados = incidents.map(ticket => {

            if (ticket.id !== id) return ticket;

            if (!ticket.notificaciones) {
                ticket.notificaciones = [];
            }

            ticket.notificaciones.push({

                fecha: new Date().toLocaleString(),

                mensaje: mensaje

            });

            return ticket;

        });

        this.saveIncidents(actualizados);

    },

    deleteIncident(id) {

        const incidents = this.getIncidents();

        const filtered = incidents.filter(ticket => ticket.id !== id);

        this.saveIncidents(filtered);

    },

    clearIncidents() {

        localStorage.removeItem("incidents");

    },

    isLogged() {

        return localStorage.getItem("logged") === "true";

    },

    login(userInfo) {

        if (!userInfo) {
            return;
        }

        localStorage.setItem("logged", "true");
        localStorage.setItem("usuario", userInfo.usuario || "cliente");
        localStorage.setItem("rol", userInfo.rol || "Cliente");
        localStorage.setItem("nombre", userInfo.nombre || "Cliente");

    },

    logout() {

        localStorage.removeItem("logged");
        localStorage.removeItem("usuario");
        localStorage.removeItem("rol");
        localStorage.removeItem("nombre");

    },

    // ==========================================
    // MÉTODOS PARA GESTIÓN DE COMENTARIOS
    // ==========================================

    getIncidentById(incidentId) {
        const incidents = this.getIncidents();
        return incidents.find(i => i.id === incidentId);
    },

    getIncidentComments(incidentId) {
        const comments = JSON.parse(localStorage.getItem(`comments_${incidentId}`)) || [];
        // Ordenar por timestamp descendente (más recientes primero)
        return comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },

    addCommentToIncident(incidentId, comment) {
        const comments = JSON.parse(localStorage.getItem(`comments_${incidentId}`)) || [];
        comments.push(comment);
        localStorage.setItem(`comments_${incidentId}`, JSON.stringify(comments));

        // Registrar acción en dashboard
        this.addDashboardAction(`Se agregó comentario a ${incidentId}`);
    },

    deleteCommentFromIncident(incidentId, commentId) {
        const comments = JSON.parse(localStorage.getItem(`comments_${incidentId}`)) || [];
        const filtered = comments.filter(c => c.id !== commentId);
        localStorage.setItem(`comments_${incidentId}`, JSON.stringify(filtered));
    },

    updateIncident(incident) {
        if (typeof incident === 'string') {
            // Si es un string, es el ID - llamada antigua
            return;
        }

        const incidents = this.getIncidents();
        const index = incidents.findIndex(i => i.id === incident.id);
        
        if (index !== -1) {
            incidents[index] = this.normalizeIncident({...incidents[index], ...incident});
            this.saveIncidents(incidents);
        }
    },

    // ==========================================
    // MÉTODOS PARA GESTIÓN DE USUARIOS
    // ==========================================

    ensureSeedUsers() {
        const users = this.getUsers();
        if (users.length > 0) {
            return users;
        }

        const seedUsers = [
            {
                id: 1,
                nombre: "Administrador",
                correo: "admin@itsm.com",
                usuario: "admin",
                password: "123",
                rol: "Administrador",
                estado: "Activo",
                fecha_creacion: "2026-01-15T10:30:00"
            },
            {
                id: 2,
                nombre: "Carlos R. (Redes)",
                correo: "carlos@itsm.com",
                usuario: "carlos",
                password: "123",
                rol: "Técnico de TI",
                estado: "Activo",
                fecha_creacion: "2026-01-15T10:30:00"
            },
            {
                id: 3,
                nombre: "Diana M. (Sistemas)",
                correo: "diana@itsm.com",
                usuario: "diana",
                password: "123",
                rol: "Técnico de TI",
                estado: "Activo",
                fecha_creacion: "2026-01-15T10:30:00"
            },
            {
                id: 4,
                nombre: "Fabián T. (Soporte)",
                correo: "fabian@itsm.com",
                usuario: "fabian",
                password: "123",
                rol: "Técnico de TI",
                estado: "Activo",
                fecha_creacion: "2026-01-15T10:30:00"
            },
            {
                id: 5,
                nombre: "Cliente",
                correo: "cliente@itsm.com",
                usuario: "cliente",
                password: "123",
                rol: "Cliente",
                estado: "Activo",
                fecha_creacion: "2026-01-15T10:30:00"
            }
        ];

        this.saveUsers(seedUsers);
        return this.getUsers();
    },

    getUsers() {
        return JSON.parse(localStorage.getItem("users")) || [];
    },

    saveUsers(users) {
        localStorage.setItem("users", JSON.stringify(users || []));
    },

    addUser(user) {
        if (!user.nombre || !user.correo || !user.usuario || !user.password || !user.rol) {
            return { success: false, message: "Faltan campos obligatorios" };
        }

        const users = this.getUsers();
        
        if (users.find(u => u.usuario === user.usuario.toLowerCase())) {
            return { success: false, message: "El usuario ya existe" };
        }

        if (users.find(u => u.correo === user.correo.toLowerCase())) {
            return { success: false, message: "El correo ya está registrado" };
        }

        const newUser = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            nombre: user.nombre,
            correo: user.correo.toLowerCase(),
            usuario: user.usuario.toLowerCase(),
            password: user.password,
            rol: user.rol,
            estado: user.estado || "Activo",
            fecha_creacion: new Date().toISOString()
        };

        users.push(newUser);
        this.saveUsers(users);
        return { success: true, message: "Usuario creado exitosamente", user: newUser };
    },

    getUserById(id) {
        const users = this.getUsers();
        return users.find(u => u.id === parseInt(id));
    },

    updateUser(id, data) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === parseInt(id));

        if (index === -1) {
            return { success: false, message: "Usuario no encontrado" };
        }

        const userToUpdate = users[index];

        if (data.correo && data.correo !== userToUpdate.correo) {
            if (users.find(u => u.id !== parseInt(id) && u.correo === data.correo.toLowerCase())) {
                return { success: false, message: "El correo ya está registrado" };
            }
        }

        users[index] = {
            ...userToUpdate,
            nombre: data.nombre || userToUpdate.nombre,
            correo: data.correo ? data.correo.toLowerCase() : userToUpdate.correo,
            rol: data.rol || userToUpdate.rol,
            estado: data.estado !== undefined ? data.estado : userToUpdate.estado,
            password: data.password || userToUpdate.password
        };

        this.saveUsers(users);
        return { success: true, message: "Usuario actualizado exitosamente", user: users[index] };
    },

    toggleUserStatus(id) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === parseInt(id));

        if (index === -1) {
            return { success: false, message: "Usuario no encontrado" };
        }

        const nuevoEstado = users[index].estado === "Activo" ? "Inactivo" : "Activo";
        users[index].estado = nuevoEstado;

        this.saveUsers(users);
        return { success: true, message: `Usuario ${nuevoEstado.toLowerCase()}`, user: users[index] };
    },

    searchUsers(query) {
        const users = this.getUsers();
        const lowerQuery = query.toLowerCase();

        return users.filter(u =>
            u.nombre.toLowerCase().includes(lowerQuery) ||
            u.correo.toLowerCase().includes(lowerQuery) ||
            u.usuario.toLowerCase().includes(lowerQuery) ||
            u.rol.toLowerCase().includes(lowerQuery)
        );
    }

};