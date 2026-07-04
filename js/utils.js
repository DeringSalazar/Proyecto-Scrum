function generateId() {
    return Date.now();
}

function getCurrentDate() {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;

}

function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add("show");
    }, 100);

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

function capitalize(text) {

    if (!text) return "";

    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

}

function formatPriority(priority) {

    switch (priority) {

        case "Alta":
            return "🔴 Alta";

        case "Media":
            return "🟡 Media";

        case "Baja":
            return "🟢 Baja";

        default:
            return priority;

    }

}

function clearInputs(...ids) {

    ids.forEach(id => {

        const input = document.getElementById(id);

        if (input) {

            input.value = "";

        }

    });

}

function $(id) {

    return document.getElementById(id);

}