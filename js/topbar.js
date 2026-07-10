function renderTopbar() {
    const topbar = document.getElementById("topbar");
    topbar.className = "topbar";
    const rol = typeof Storage !== "undefined" &&
        Storage.getCurrentUserRole
        ? Storage.getCurrentUserRole()
        : (localStorage.getItem("rol") || "Usuario");
    topbar.innerHTML = `
        <h2>
            ITSM Service Desk
        </h2>
        <div class="user">
            ${rol}
        </div>
    `;
}