import React from 'react';

export function Card({ card, onUpdate, onDelete, categories, onCardClick }) {
    // Get category color or default to gold
    const categoryColor = card.category ? (card.category.color || 'gold') : 'gold';

    const handleCardClick = (e) => {
        // Prevent click if selecting text
        if (window.getSelection().toString().length > 0) return;
        onCardClick(card);
    };

    const toggleFavorite = (e) => {
        e.stopPropagation();
        onUpdate(card.id, { is_favorite: !card.is_favorite });
    };

    // Helper to format time for card display (simplified)
    const getFormattedTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    return (
        <div
            className={`card accent-${categoryColor}`}
            onClick={handleCardClick}
        >
            <div className="card-top">
                <div className="card-title">{card.title}</div>
                <div
                    className={`card-icon ${card.is_favorite ? 'starred' : ''}`}
                    onClick={toggleFavorite}
                >
                    <i className={`fa-${card.is_favorite ? 'solid' : 'regular'} fa-star`}></i>
                </div>
            </div>

            <div className="card-body">
                {card.content}
            </div>

            <div className="card-meta">
                <div className={`tag-pill tag-${categoryColor}`}>
                    <i className="fas fa-tag" style={{ fontSize: '10px' }}></i>
                    {card.category ? card.category.name : 'default'}
                </div>
                <div className="time-text">
                    {getFormattedTime(card.updated_at)}
                </div>
            </div>
        </div>
    );
}
