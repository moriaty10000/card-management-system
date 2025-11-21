import React, { useState } from 'react';

export function Card({ card, onUpdate, onDelete, categories, onCardClick }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedCard, setEditedCard] = useState({ ...card });

    const handleSave = () => {
        onUpdate(card.id, editedCard);
        setIsEditing(false);
    };

    const toggleFavorite = (e) => {
        e.stopPropagation();
        onUpdate(card.id, { is_favorite: !card.is_favorite });
    };

    const handleCardClick = () => {
        if (!isEditing) {
            onCardClick(card);
        }
    };

    return (
        <div
            className="card"
            style={{
                backgroundColor: 'var(--card-bg)',
                borderRadius: 'var(--border-radius)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                height: '100%',
                cursor: isEditing ? 'default' : 'pointer'
            }}
            onClick={handleCardClick}
        >
            {isEditing ? (
                <>
                    <input
                        value={editedCard.title}
                        onChange={(e) => setEditedCard({ ...editedCard, title: e.target.value })}
                        placeholder="标题"
                        autoFocus
                    />
                    <textarea
                        value={editedCard.content}
                        onChange={(e) => setEditedCard({ ...editedCard, content: e.target.value })}
                        placeholder="内容"
                        rows={4}
                        style={{ resize: 'vertical' }}
                    />
                    <select
                        value={editedCard.category_id || ''}
                        onChange={(e) => setEditedCard({ ...editedCard, category_id: e.target.value ? parseInt(e.target.value) : null })}
                    >
                        <option value="">无分类</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <div className="flex gap-2 justify-end">
                        <button className="btn" onClick={(e) => { e.stopPropagation(); setIsEditing(false); }}>取消</button>
                        <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); handleSave(); }}>保存</button>
                    </div>
                </>
            ) : (
                <>
                    <div className="flex justify-between items-start">
                        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{card.title}</h3>
                        <button
                            onClick={toggleFavorite}
                            className="btn-icon"
                            style={{ color: card.is_favorite ? '#f1c40f' : '#bdc3c7' }}
                        >
                            ★
                        </button>
                    </div>
                    <p style={{
                        margin: 0,
                        color: 'var(--text-secondary)',
                        whiteSpace: 'pre-wrap',
                        flex: 1,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: '1.6'
                    }}>
                        {card.content}
                    </p>
                    <div className="flex justify-between items-center mt-auto pt-4 border-t" style={{ borderColor: '#f0f0f0' }}>
                        <span style={{ fontSize: '0.875rem', color: '#95a5a6', background: '#f8f9fa', padding: '2px 8px', borderRadius: '4px' }}>
                            {card.category ? card.category.name : '未分类'}
                        </span>
                        <div className="flex gap-2">
                            <button className="btn-icon" onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} title="编辑">✎</button>
                            <button className="btn-icon" onClick={(e) => { e.stopPropagation(); onDelete(card.id); }} title="删除" style={{ color: 'var(--danger)' }}>🗑</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
