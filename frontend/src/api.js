const API_BASE = '/api';

export const api = {
    async getCards() {
        const res = await fetch(`${API_BASE}/cards`, {
            headers: { 'Bypass-Tunnel-Reminder': 'true' }
        });
        return res.json();
    },

    async createCard(card) {
        const res = await fetch(`${API_BASE}/cards`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Bypass-Tunnel-Reminder': 'true'
            },
            body: JSON.stringify(card),
        });
        return res.json();
    },

    async updateCard(id, updates) {
        const res = await fetch(`${API_BASE}/cards/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Bypass-Tunnel-Reminder': 'true'
            },
            body: JSON.stringify(updates),
        });
        return res.json();
    },

    async deleteCard(id) {
        await fetch(`${API_BASE}/cards/${id}`, {
            method: 'DELETE',
            headers: { 'Bypass-Tunnel-Reminder': 'true' }
        });
    },

    async getCategories() {
        const res = await fetch(`${API_BASE}/categories`, {
            headers: { 'Bypass-Tunnel-Reminder': 'true' }
        });
        return res.json();
    },

    createCategory(category) {
        return fetch(`${API_BASE}/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Bypass-Tunnel-Reminder': 'true'
            },
            body: JSON.stringify(category),
        }).then(res => res.json());
    },

    updateCategory(id, updates) {
        return fetch(`${API_BASE}/categories/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Bypass-Tunnel-Reminder': 'true'
            },
            body: JSON.stringify(updates),
        }).then(res => res.json());
    },

    deleteCategory(id) {
        return fetch(`${API_BASE}/categories/${id}`, {
            method: 'DELETE',
            headers: { 'Bypass-Tunnel-Reminder': 'true' }
        });
    },
};
