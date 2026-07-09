// ==========================================
// MÓDULO DE COMENTARIOS Y DETALLES DE INCIDENTES
// ==========================================

let currentIncidentDetailId = null;

function openIncidentDetail(incidentId) {
    currentIncidentDetailId = incidentId;
    const incident = Storage.getIncidentById(incidentId);
    
    if (!incident) {
        showToast("Incidente no encontrado", "error");
        return;
    }

    const canEdit = Storage.isTecnico() || Storage.isAdmin();
    const comments = Storage.getIncidentComments(incidentId) || [];

    const modalHTML = `
        <div class="modal-overlay active" id="incident-detail-modal" onclick="if(event.target === this) closeIncidentDetail()">
            <div class="modal-content incident-detail-modal">
                <div class="modal-header">
                    <h2>${incident.id} - ${incident.title}</h2>
                    <button class="modal-close" onclick="closeIncidentDetail()">✕</button>
                </div>

                <div class="modal-body">
                    <!-- INFORMACIÓN DEL INCIDENTE -->
                    <div class="incident-info-section">
                        <h3>Información del Incidente</h3>
                        
                        <div class="info-grid">
                            <div class="info-item">
                                <label>Estado</label>
                                <span class="status-badge status-${incident.status.toLowerCase().replace(' ', '-')}">${incident.status}</span>
                            </div>
                            <div class="info-item">
                                <label>Prioridad</label>
                                <span class="priority-badge priority-${incident.priority.toLowerCase()}">${incident.priority}</span>
                            </div>
                            <div class="info-item">
                                <label>Tipo</label>
                                <span>${incident.type}</span>
                            </div>
                            <div class="info-item">
                                <label>Asignado a</label>
                                <span>${incident.assigned || "Sin Asignar"}</span>
                            </div>
                            <div class="info-item">
                                <label>Reportado por</label>
                                <span>${incident.reportadoPor}</span>
                            </div>
                            <div class="info-item">
                                <label>Fecha de creación</label>
                                <span>${formatDateDisplay(incident.createdAt || incident.date)}</span>
                            </div>
                        </div>

                        <div class="description-section">
                            <label>Descripción</label>
                            <p>${incident.description}</p>
                        </div>

                        ${canEdit ? `
                            <div class="incident-actions">
                                <label>Cambiar Estado</label>
                                <div class="action-buttons">
                                    <button onclick="updateIncidentStatus('${incidentId}', 'Abierto')" class="status-btn">Abierto</button>
                                    <button onclick="updateIncidentStatus('${incidentId}', 'En Proceso')" class="status-btn">En Proceso</button>
                                    <button onclick="updateIncidentStatus('${incidentId}', 'Resuelto')" class="status-btn">Resuelto</button>
                                </div>
                            </div>
                        ` : ""}
                    </div>

                    <!-- SECCIÓN DE COMENTARIOS -->
                    <div class="comments-section">
                        <h3>Notas y Comentarios</h3>

                        <!-- FORMULARIO PARA AGREGAR COMENTARIO -->
                        <div class="comment-form">
                            <h4>Agregar Nota</h4>
                            <textarea 
                                id="comment-text" 
                                placeholder="Escriba su comentario aquí..." 
                                rows="4"
                                class="comment-input"
                            ></textarea>
                            <button onclick="addCommentToIncident('${incidentId}')" class="btn-add-comment">
                                Agregar Comentario
                            </button>
                        </div>

                        <!-- LISTADO DE COMENTARIOS -->
                        <div class="comments-list">
                            <h4>Historial de Comentarios (${comments.length})</h4>
                            ${comments.length === 0 
                                ? '<p class="no-comments">No hay comentarios aún. Sé el primero en comentar.</p>'
                                : comments.map(comment => `
                                    <div class="comment-item">
                                        <div class="comment-header">
                                            <strong class="comment-author">${comment.author}</strong>
                                            <span class="comment-date">${formatCommentDate(comment.timestamp)}</span>
                                        </div>
                                        <p class="comment-text">${escapeHtml(comment.text)}</p>
                                        ${(Storage.getCurrentUser() === comment.author || Storage.isAdmin()) 
                                            ? `<button onclick="deleteComment('${incidentId}', ${comment.id})" class="comment-delete">Eliminar</button>`
                                            : ""
                                        }
                                    </div>
                                `).join("")
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Agregar modal al contenedor
    const modalContainer = document.getElementById("modal-container");
    if (modalContainer) {
        const existingModal = document.getElementById("incident-detail-modal");
        if (existingModal) existingModal.remove();
        
        const modal = document.createElement("div");
        modal.innerHTML = modalHTML;
        modalContainer.appendChild(modal.firstElementChild);
    }
}

function closeIncidentDetail() {
    const modal = document.getElementById("incident-detail-modal");
    if (modal) {
        modal.classList.remove("active");
        setTimeout(() => modal.remove(), 300);
    }
    currentIncidentDetailId = null;
}

function addCommentToIncident(incidentId) {
    const commentText = document.getElementById("comment-text");
    if (!commentText) return;

    const text = commentText.value.trim();

    if (!text) {
        showToast("Por favor, escriba un comentario", "error");
        return;
    }

    if (text.length > 1000) {
        showToast("El comentario no puede exceder 1000 caracteres", "error");
        return;
    }

    const comment = {
        id: Date.now(),
        author: Storage.getCurrentUserName() || "Usuario",
        timestamp: new Date().toISOString(),
        text: text
    };

    Storage.addCommentToIncident(incidentId, comment);
    showToast("Comentario agregado exitosamente", "success");

    // Limpiar textarea y actualizar vista
    commentText.value = "";
    
    // Actualizar la lista de comentarios
    const incident = Storage.getIncidentById(incidentId);
    const comments = Storage.getIncidentComments(incidentId) || [];
    const commentsList = document.querySelector(".comments-list");
    
    if (commentsList) {
        commentsList.innerHTML = `
            <h4>Historial de Comentarios (${comments.length})</h4>
            ${comments.map(comment => `
                <div class="comment-item">
                    <div class="comment-header">
                        <strong class="comment-author">${comment.author}</strong>
                        <span class="comment-date">${formatCommentDate(comment.timestamp)}</span>
                    </div>
                    <p class="comment-text">${escapeHtml(comment.text)}</p>
                    ${(Storage.getCurrentUser() === comment.author || Storage.isAdmin()) 
                        ? `<button onclick="deleteComment('${incidentId}', ${comment.id})" class="comment-delete">Eliminar</button>`
                        : ""
                    }
                </div>
            `).join("")}
        `;
    }
}

function deleteComment(incidentId, commentId) {
    if (confirm("¿Está seguro de que desea eliminar este comentario?")) {
        Storage.deleteCommentFromIncident(incidentId, commentId);
        showToast("Comentario eliminado", "success");
        
        // Actualizar vista
        const comments = Storage.getIncidentComments(incidentId) || [];
        const commentsList = document.querySelector(".comments-list");
        
        if (commentsList) {
            commentsList.innerHTML = `
                <h4>Historial de Comentarios (${comments.length})</h4>
                ${comments.length === 0 
                    ? '<p class="no-comments">No hay comentarios aún.</p>'
                    : comments.map(comment => `
                        <div class="comment-item">
                            <div class="comment-header">
                                <strong class="comment-author">${comment.author}</strong>
                                <span class="comment-date">${formatCommentDate(comment.timestamp)}</span>
                            </div>
                            <p class="comment-text">${escapeHtml(comment.text)}</p>
                            ${(Storage.getCurrentUser() === comment.author || Storage.isAdmin()) 
                                ? `<button onclick="deleteComment('${incidentId}', ${comment.id})" class="comment-delete">Eliminar</button>`
                                : ""
                            }
                        </div>
                    `).join("")
                }
            `;
        }
    }
}

function updateIncidentStatus(incidentId, newStatus) {
    const incident = Storage.getIncidentById(incidentId);
    if (!incident) return;

    const oldStatus = incident.status;
    incident.status = newStatus;

    // Agregar al historial
    if (!incident.historial_estados) {
        incident.historial_estados = [];
    }
    incident.historial_estados.push({
        estado_anterior: oldStatus,
        estado_nuevo: newStatus,
        fecha: new Date().toISOString(),
        usuario: Storage.getCurrentUserName()
    });

    Storage.updateIncident(incident);
    Storage.addDashboardAction(`Se actualizó ${incidentId}: estado de ${oldStatus} a ${newStatus}`);

    showToast(`Estado actualizado a "${newStatus}"`, "success");

    // Actualizar modal
    setTimeout(() => {
        openIncidentDetail(incidentId);
    }, 500);
}

function formatCommentDate(timestamp) {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateStr = date.toLocaleDateString("es-ES");
    const timeStr = date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

    if (dateStr === today.toLocaleDateString("es-ES")) {
        return `Hoy a las ${timeStr}`;
    } else if (dateStr === yesterday.toLocaleDateString("es-ES")) {
        return `Ayer a las ${timeStr}`;
    } else {
        return `${dateStr} a las ${timeStr}`;
    }
}

function formatDateDisplay(dateStr) {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", { 
        year: "numeric", 
        month: "long", 
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
