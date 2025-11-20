import React, { useState } from 'react';

export function CategoryFilter({ categories, selectedCategory, onSelectCategory, onAddCategory }) {
    const [newCategory, setNewCategory] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newCategory.trim()) {
            onAddCategory({ name: newCategory });
            setNewCategory('');
        }
    };

    return (
        <div style={{ marginBottom: '2rem' }}>
            <div className="flex gap-2 overflow-x-auto pb-2" style={{ flexWrap: 'wrap' }}>
                <button
                    className={`btn ${selectedCategory === null ? 'btn-primary' : ''}`}
                    style={{ backgroundColor: selectedCategory === null ? 'var(--accent)' : 'white' }}
                    onClick={() => onSelectCategory(null)}
                >
                    全部
                </button>
                <button
                    className={`btn ${selectedCategory === 'favorites' ? 'btn-primary' : ''}`}
                    style={{ backgroundColor: selectedCategory === 'favorites' ? '#f1c40f' : 'white', color: selectedCategory === 'favorites' ? 'white' : 'inherit' }}
                    onClick={() => onSelectCategory('favorites')}
                >
                    ★ 收藏
                </button>
                {categories.map(c => (
                    <button
                        key={c.id}
                        className={`btn ${selectedCategory === c.id ? 'btn-primary' : ''}`}
                        style={{ backgroundColor: selectedCategory === c.id ? 'var(--accent)' : 'white' }}
                        onClick={() => onSelectCategory(c.id)}
                    >
                        {c.name}
                    </button>
                ))}

                <form onSubmit={handleSubmit} className="flex gap-2" style={{ marginLeft: 'auto' }}>
                    <input
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="新分类..."
                        style={{ width: '120px', padding: '0.25rem 0.5rem' }}
                    />
                    <button type="submit" className="btn" style={{ background: 'white' }}>+</button>
                </form>
            </div>
        </div>
    );
}
