import React, { useState, useEffect } from 'react';

export function CardDetail({ card, onClose, onUpdate, onEdit }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger slide-in animation
        setTimeout(() => setIsVisible(true), 10);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
    };

    const toggleFavorite = () => {
        onUpdate(card.id, { is_favorite: !card.is_favorite });
    };

    if (!card) return null;

    return (
        <div
            className={`card-detail-overlay ${isVisible ? 'visible' : ''}`}
            onClick={handleClose}
        >
            <div
                className={`card-detail-container ${isVisible ? 'visible' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="card-detail-header">
                    <button
                        className="btn-icon-detail"
                        onClick={handleClose}
                        title="关闭"
                    >
                        ✕
                    </button>
                    <button
                        className="btn-icon-detail"
                        onClick={toggleFavorite}
                        style={{ color: card.is_favorite ? '#FFD700' : '#95a5a6' }}
                        title={card.is_favorite ? '取消收藏' : '收藏'}
                    >
                        ★
                    </button>
                </div>

                {/* Content */}
                <div className="card-detail-content">
                    <h1 className="card-detail-title">{card.title}</h1>

                    {card.category && (
                        <div className="card-detail-category">
                            <span className="category-badge">
                                {card.category.name}
                            </span>
                        </div>
                    )}

                    <div className="card-detail-body">
                        {card.content}
                    </div>

                    {card.created_at && (
                        <div className="card-detail-meta">
                            创建于 {new Date(card.created_at).toLocaleString('zh-CN')}
                        </div>
                    )}
                </div>

                {/* Floating Action Button (FAB) */}
                <button
                    className="fab-edit"
                    onClick={onEdit}
                    title="编辑"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
