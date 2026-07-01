const Storage = {

    getIncidents() {

        return JSON.parse(localStorage.getItem("incidents")) || [];

    },

    saveIncidents(incidents) {

        localStorage.setItem(
            "incidents",
            JSON.stringify(incidents)
        );

    },

    addIncident(incident) {

        const incidents = this.getIncidents();

        incidents.push(incident);

        this.saveIncidents(incidents);

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

    login() {

        localStorage.setItem("logged", "true");

    },

    logout() {

        localStorage.removeItem("logged");

    }

};