import React, { useEffect, useState, useRef } from 'react';
import { api } from './api';
import { Card } from './components/Card';
import { CardDetail } from './components/CardDetail'; // We might need to create/update this too, but let's focus on App structure first.
// Actually, let's keep CardDetail inline or import it if it exists. 
// The previous App.jsx had everything inline or imported. 
// Let's assume we need to implement the structure directly here or use the components if they match.
// Given the visual requirements, I will implement the structure directly in App.jsx where appropriate or ensure components match.

// Helper for time formatting
function formatTime(dateString) {
    if (!dateString) return 'NOW';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    if (days === 0) return timeStr;
    if (days === 1) return `Yesterday ${timeStr}`;
    if (days < 7) return `${days} days ago ${timeStr}`;
    return `${date.toLocaleDateString()} ${timeStr}`;
}

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [cards, setCards] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null); // null means 'Overview' (All)
    const [showCardModal, setShowCardModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [editingCard, setEditingCard] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [theme, setTheme] = useState('dark');
    const [loginPassword, setLoginPassword] = useState('');

    // Card form state
    const [cardForm, setCardForm] = useState({ title: '', content: '', category_id: '' });
    // Category form state
    const [categoryForm, setCategoryForm] = useState({ name: '', color: 'gold' });

    // Detail view editing state
    const [isDetailEditing, setIsDetailEditing] = useState(false);
    const [detailForm, setDetailForm] = useState({ title: '', content: '' });

    const fetchData = async () => {
        try {
            const [cardsData, catsData] = await Promise.all([api.getCards(), api.getCategories()]);
            setCards(cardsData);
            setCategories(catsData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        const authStatus = localStorage.getItem('isAuthenticated');
        const savedTheme = localStorage.getItem('theme') || 'dark';
        if (authStatus === 'true') {
            setIsAuthenticated(true);
            fetchData();
        }
        setTheme(savedTheme);
        if (savedTheme === 'light') document.body.classList.add('light-mode');
    }, []);

    useEffect(() => {
        if (!showDetail) {
            setIsDetailEditing(false);
        }
    }, [showDetail]);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        if (newTheme === 'light') document.body.classList.add('light-mode');
        else document.body.classList.remove('light-mode');
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (loginPassword === 'moriaty') {
            localStorage.setItem('isAuthenticated', 'true');
            setIsAuthenticated(true);
            fetchData();
        } else {
            alert('Incorrect password');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        setIsAuthenticated(false);
        setCards([]);
        setCategories([]);
    };

    const longPressTimer = useRef(null);
    const listContainerRef = useRef(null);

    // Filter logic
    const filteredCards = cards.filter(card => {
        const matchesCategory = selectedCategory === null ? true :
            selectedCategory === 'favorites' ? card.is_favorite :
                card.category_id === selectedCategory;
        const matchesSearch = card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            card.content.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    }).sort((a, b) => {
        // 1. Favorites first
        if (a.is_favorite && !b.is_favorite) return -1;
        if (!a.is_favorite && b.is_favorite) return 1;

        // 2. Newest updated first
        const dateA = new Date(a.updated_at || a.created_at);
        const dateB = new Date(b.updated_at || b.created_at);
        return dateB - dateA;
    });

    // CRUD Operations
    const handleCreateCard = async () => {
        try {
            const payload = {
                ...cardForm,
                category_id: cardForm.category_id === '' ? null : cardForm.category_id
            };
            const newCard = await api.createCard(payload);
            setCards([...cards, newCard]);
            setShowCardModal(false);
            setCardForm({ title: '', content: '', category_id: '' });
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateCard = async (id, updates) => {
        try {
            const updated = await api.updateCard(id, updates);
            setCards(cards.map(c => c.id === id ? updated : c));
            if (selectedCard && selectedCard.id === id) setSelectedCard(updated);

            // Scroll to top if favorited
            if (updates.is_favorite === true && listContainerRef.current) {
                setTimeout(() => {
                    listContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                }, 100);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteCard = async (id) => {
        if (!window.confirm('Delete this card?')) return;
        try {
            await api.deleteCard(id);
            setCards(cards.filter(c => c.id !== id));
            if (selectedCard && selectedCard.id === id) setShowDetail(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateCategory = async () => {
        try {
            if (editingCategory) {
                const updatedCat = await api.updateCategory(editingCategory.id, { name: categoryForm.name, color: categoryForm.color });
                setCategories(categories.map(c => c.id === editingCategory.id ? updatedCat : c));
                setShowCategoryModal(false);
                setCategoryForm({ name: '', color: 'gold' });
                setEditingCategory(null);
            } else {
                const newCat = await api.createCategory({ name: categoryForm.name, color: categoryForm.color });
                setCategories([...categories, newCat]);
                setShowCategoryModal(false);
                setCategoryForm({ name: '', color: 'gold' });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteCategory = async () => {
        if (!editingCategory || !window.confirm('Delete this category?')) return;
        try {
            await api.deleteCategory(editingCategory.id);
            setCategories(categories.filter(c => c.id !== editingCategory.id));
            setShowCategoryModal(false);
            setCategoryForm({ name: '', color: 'gold' });
            setEditingCategory(null);
            if (selectedCategory === editingCategory.id) setSelectedCategory(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCategoryDoubleClick = (cat) => {
        setEditingCategory(cat);
        setCategoryForm({ name: cat.name, color: cat.color });
        setShowCategoryModal(true);
    };

    const closeCategoryModal = () => {
        setShowCategoryModal(false);
        setCategoryForm({ name: '', color: 'gold' });
        setEditingCategory(null);
    };

    const startLongPress = (cat) => {
        console.log('Start long press', cat.name);
        longPressTimer.current = setTimeout(() => {
            console.log('Long press triggered', cat.name);
            handleCategoryDoubleClick(cat);
        }, 500);
    };

    const endLongPress = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <div className="login-subtitle">PRIVATE WORKSPACE</div>
                        <div className="login-title">M System</div>
                    </div>
                    <form onSubmit={handleLogin} className="login-form">
                        <div className="login-field">
                            <label className="login-label">ACCESS CODE</label>
                            <input
                                type="password"
                                className="login-input"
                                placeholder="............"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="login-btn">
                            <i className="fas fa-lock"></i> ENTER SYSTEM
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="ambient-top"></div>
            <div className="ambient-bottom"></div>
            <header>
                <div className="brand">
                    <div className="brand-subtitle">PRIVATE WORKSPACE</div>
                    <div className="brand-title">M System</div>
                </div>
                <div className="header-actions">
                    <div className="icon-btn" onClick={() => setShowSearch(true)}>
                        <i className="fas fa-search"></i>
                    </div>
                    <div className="icon-btn" onClick={toggleTheme}>
                        <i className={`fas fa-${theme === 'dark' ? 'moon' : 'sun'}`}></i>
                    </div>
                    {isAuthenticated && (
                        <div className="icon-btn" onClick={handleLogout}>
                            <i className="fas fa-sign-out-alt"></i>
                        </div>
                    )}
                </div>
            </header>

            <div className="filter-wrapper">
                <div className="filter-scroll">
                    <div
                        className={`filter-item ${selectedCategory === null ? 'active-gold' : ''}`}
                        onClick={() => setSelectedCategory(null)}
                    >
                        Overview
                    </div>

                    {categories.map(cat => (
                        <div
                            key={cat.id}
                            className={`filter-item ${selectedCategory === cat.id ? `active-${cat.color || 'gold'}` : ''}`}
                            onClick={() => {
                                if (selectedCategory !== cat.id) setSelectedCategory(cat.id);
                            }}
                            onMouseDown={() => startLongPress(cat)}
                            onMouseUp={endLongPress}
                            onMouseLeave={endLongPress}
                            onTouchStart={() => startLongPress(cat)}
                            onTouchEnd={endLongPress}
                        >
                            {cat.name}
                        </div>
                    ))}
                </div>
                <div className="filter-add-btn" onClick={() => setShowCategoryModal(true)}>
                    <i className="fas fa-plus"></i>
                </div>
            </div>

            <div className="list-container" ref={listContainerRef}>
                {filteredCards.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <p>No items found</p>
                    </div>
                ) : (
                    filteredCards.map(card => (
                        <Card
                            key={card.id}
                            card={card}
                            categories={categories}
                            onUpdate={handleUpdateCard}
                            onDelete={handleDeleteCard}
                            onCardClick={(c) => { setSelectedCard(c); setShowDetail(true); }}
                        />
                    ))
                )}
            </div>

            <div className="fab-btn" onClick={() => setShowCardModal(true)}>
                <i className="fas fa-plus"></i>
            </div>

            {/* Search Overlay */}
            <div className={`search-overlay ${showSearch ? 'show' : ''}`}>
                <div className="search-container">
                    <div className="search-header">
                        <div className="search-box">
                            <i className="fas fa-search search-icon"></i>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus={showSearch}
                            />
                            {searchQuery && (
                                <i className="fas fa-times clear-icon" onClick={() => setSearchQuery('')}></i>
                            )}
                        </div>
                        <div className="close-search" onClick={() => setShowSearch(false)}>Cancel</div>
                    </div>
                </div>
            </div>

            {/* Card Modal */}
            <div className={`modal-overlay ${showCardModal ? 'show' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setShowCardModal(false) }}>
                <div className="modal-content">
                    <div className="modal-header">
                        <h3 className="modal-title">New Card</h3>
                    </div>
                    <div className="input-group">
                        <input
                            className="modal-input"
                            placeholder="Title"
                            value={cardForm.title}
                            onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })}
                        />
                    </div>
                    <div className="input-group">
                        <textarea
                            className="modal-textarea"
                            placeholder="Content"
                            rows="5"
                            value={cardForm.content}
                            onChange={(e) => setCardForm({ ...cardForm, content: e.target.value })}
                        ></textarea>
                    </div>
                    <div className="input-group">
                        <select
                            className="category-select"
                            value={cardForm.category_id}
                            onChange={(e) => setCardForm({ ...cardForm, category_id: e.target.value ? parseInt(e.target.value) : '' })}
                        >
                            <option value="">No Category</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="modal-actions">
                        <div className="modal-right-btns" style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <button className="btn-cancel" onClick={() => setShowCardModal(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleCreateCard}>Create</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Modal */}
            <div className={`modal-overlay ${showCategoryModal ? 'show' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) closeCategoryModal() }}>
                <div className="modal-content">
                    <div className="modal-header">
                        <h3 className="modal-title">{editingCategory ? 'Edit Label' : 'New Category'}</h3>
                    </div>
                    <div className="input-group">
                        <input
                            className="modal-input"
                            placeholder="Category Name"
                            value={categoryForm.name}
                            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        />
                    </div>
                    <div className="color-grid">
                        {['gold', 'blue', 'emerald', 'crimson', 'purple', 'silver', 'turquoise', 'amber', 'ruby', 'peridot'].map(color => (
                            <div
                                key={color}
                                className={`color-option bg-${color} ${categoryForm.color === color ? 'selected' : ''}`}
                                onClick={() => setCategoryForm({ ...categoryForm, color })}
                            ></div>
                        ))}
                    </div>
                    <div className="modal-actions">
                        {editingCategory ? (
                            <div className="modal-right-btns" style={{ width: '100%', justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}>
                                <button
                                    className="btn-delete"
                                    onClick={handleDeleteCategory}
                                    style={{
                                        backgroundColor: 'rgba(255, 71, 87, 0.15)',
                                        color: '#ff4757',
                                        border: '1px solid rgba(255, 71, 87, 0.3)',
                                        padding: '8px 16px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        opacity: 1,
                                        pointerEvents: 'auto'
                                    }}
                                >
                                    <i className="fas fa-trash-alt"></i> Delete
                                </button>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button className="btn-cancel" onClick={closeCategoryModal}>Cancel</button>
                                    <button className="btn-primary" onClick={handleCreateCategory}>Update</button>
                                </div>
                            </div>
                        ) : (
                            <div className="modal-right-btns" style={{ width: '100%', justifyContent: 'flex-end' }}>
                                <button className="btn-cancel" onClick={closeCategoryModal}>Cancel</button>
                                <button className="btn-primary" onClick={handleCreateCategory}>Create</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Detail View Overlay */}
            <div className={`detail-overlay ${showDetail ? 'show' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setShowDetail(false) }}>
                <div className="detail-container">
                    {selectedCard && (
                        <>
                            <div className="detail-header">
                                <div className="detail-meta-stack">
                                    <span className={`detail-tag tag-${selectedCard.category ? (selectedCard.category.color || 'gold') : 'gold'}`}>
                                        {selectedCard.category ? selectedCard.category.name.toUpperCase() : 'DEFAULT'}
                                    </span>
                                    <span className="detail-date">{formatTime(selectedCard.updated_at)}</span>
                                </div>
                            </div>

                            <div className="detail-actions-pill">
                                <div
                                    className={`action-icon ${selectedCard.is_favorite ? 'active' : ''}`}
                                    onClick={() => handleUpdateCard(selectedCard.id, { is_favorite: !selectedCard.is_favorite })}
                                    title="Toggle favorite"
                                >
                                    <i className={`fa-${selectedCard.is_favorite ? 'solid' : 'regular'} fa-star`}></i>
                                </div>
                                <div
                                    className="action-icon"
                                    onClick={() => {
                                        if (window.confirm('确定要删除这张卡片吗？')) {
                                            handleDeleteCard(selectedCard.id);
                                            setShowDetail(false);
                                        }
                                    }}
                                    title="Delete card"
                                >
                                    <i className="fas fa-trash-alt"></i>
                                </div>
                                <div className="action-divider"></div>
                                <div
                                    className="action-icon"
                                    onClick={() => setShowDetail(false)}
                                    title="Close"
                                >
                                    <i className="fas fa-times"></i>
                                </div>
                            </div>

                            <div className="detail-content">
                                {isDetailEditing ? (
                                    <>
                                        <input
                                            className="detail-title-input"
                                            value={detailForm.title}
                                            onChange={(e) => setDetailForm({ ...detailForm, title: e.target.value })}
                                            placeholder="Title"
                                        />
                                        <textarea
                                            className="detail-body-input"
                                            value={detailForm.content}
                                            onChange={(e) => setDetailForm({ ...detailForm, content: e.target.value })}
                                            placeholder="Content"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <h1 className="detail-title">{selectedCard.title}</h1>
                                        <div className="detail-body">{selectedCard.content}</div>
                                    </>
                                )}
                            </div>

                            {isDetailEditing ? (
                                <div className="detail-edit-actions">
                                    <button
                                        className="btn-cancel"
                                        onClick={() => setIsDetailEditing(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn-primary"
                                        onClick={async () => {
                                            await handleUpdateCard(selectedCard.id, detailForm);
                                            setIsDetailEditing(false);
                                            // Update local selected card to reflect changes immediately
                                            setSelectedCard({ ...selectedCard, ...detailForm });
                                        }}
                                    >
                                        Save
                                    </button>
                                </div>
                            ) : (
                                <div className="fab-edit" onClick={() => {
                                    setDetailForm({
                                        title: selectedCard.title,
                                        content: selectedCard.content
                                    });
                                    setIsDetailEditing(true);
                                }}>
                                    <i className="fas fa-pen"></i>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

export default App;
