// API 基础配置
const API_BASE = '/api';

// API 工具函数
const api = {
    // 分类相关
    async getCategories() {
        const response = await fetch(`${API_BASE}/categories`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        return response.json();
    },

    async createCategory(name) {
        const response = await fetch(`${API_BASE}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        if (!response.ok) throw new Error('Failed to create category');
        return response.json();
    },

    async updateCategory(id, name) {
        const response = await fetch(`${API_BASE}/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        if (!response.ok) throw new Error('Failed to update category');
        return response.json();
    },

    async deleteCategory(id) {
        const response = await fetch(`${API_BASE}/categories/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete category');
        return response.json();
    },

    // 卡片相关
    async getCards() {
        const response = await fetch(`${API_BASE}/cards`);
        if (!response.ok) throw new Error('Failed to fetch cards');
        return response.json();
    },

    async createCard(data) {
        const response = await fetch(`${API_BASE}/cards`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create card');
        return response.json();
    },

    async updateCard(id, data) {
        const response = await fetch(`${API_BASE}/cards/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update card');
        return response.json();
    },

    async deleteCard(id) {
        const response = await fetch(`${API_BASE}/cards/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete card');
        return response.json();
    }
};

// 颜色管理（本地存储）
const colorManager = {
    colors: ['gold', 'blue', 'crimson', 'purple', 'emerald', 'silver', 'turquoise', 'amber', 'ruby', 'peridot'],

    getColorMap() {
        const stored = localStorage.getItem('categoryColors');
        return stored ? JSON.parse(stored) : {};
    },

    setColor(categoryId, color) {
        const map = this.getColorMap();
        map[categoryId] = color;
        localStorage.setItem('categoryColors', JSON.stringify(map));
    },

    getColor(categoryId) {
        const map = this.getColorMap();
        return map[categoryId] || this.colors[categoryId % this.colors.length];
    },

    deleteColor(categoryId) {
        const map = this.getColorMap();
        delete map[categoryId];
        localStorage.setItem('categoryColors', JSON.stringify(map));
    }
};

// 格式化时间
function formatTime(dateString) {
    if (!dateString) return 'NOW';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } else if (days === 1) {
        return 'Yesterday';
    } else if (days < 7) {
        return `${days} days ago`;
    } else {
        return date.toLocaleDateString();
    }
}
