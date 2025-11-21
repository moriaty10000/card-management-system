import React, { useEffect, useState } from 'react';
import { api } from './api';
import { Card } from './components/Card';
import { CardDetail } from './components/CardDetail';
import { CategoryFilter } from './components/CategoryFilter';
import { Login } from './components/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cards, setCards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newCard, setNewCard] = useState({ title: '', content: '' });
  const [selectedCard, setSelectedCard] = useState(null);
  const [editingCard, setEditingCard] = useState(null);

  const fetchData = async () => {
    const [cardsData, catsData] = await Promise.all([
      api.getCards(),
      api.getCategories()
    ]);
    setCards(cardsData);
    setCategories(catsData);
  };

  useEffect(() => {
    // Check if user is authenticated
    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      fetchData();
    }
  }, []);

  const handleCreateCard = async () => {
    if (!newCard.title.trim()) return;
    await api.createCard(newCard);
    setNewCard({ title: '', content: '' });
    setIsCreating(false);
    fetchData();
  };

  const handleUpdateCard = async (id, updates) => {
    // Optimistic update
    setCards(cards.map(c => c.id === id ? { ...c, ...updates } : c));
    await api.updateCard(id, updates);
    fetchData(); // Sync with server
  };

  const handleDeleteCard = async (id) => {
    if (!window.confirm('确定要删除这张卡片吗？')) return;
    setCards(cards.filter(c => c.id !== id));
    await api.deleteCard(id);
  };

  const handleAddCategory = async (category) => {
    await api.createCategory(category);
    fetchData();
  };

  const filteredCards = cards.filter(card => {
    if (selectedCategory === 'favorites') return card.is_favorite;
    if (selectedCategory === null) return true;
    return card.category_id === selectedCategory;
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
    fetchData();
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
    setCards([]);
    setCategories([]);
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  const handleCloseDetail = () => {
    setSelectedCard(null);
    setEditingCard(null);
  };

  const handleEditFromDetail = () => {
    setEditingCard(selectedCard);
    setSelectedCard(null);
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <header className="flex justify-between items-center mb-8">
        <h1>🗂️ 卡片笔记</h1>
        <div className="flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() => setIsCreating(true)}
            style={{ fontSize: '1.1rem', padding: '0.75rem 1.5rem' }}
          >
            + 新建卡片
          </button>
          <button
            className="btn"
            onClick={handleLogout}
            style={{ fontSize: '0.9rem', padding: '0.75rem 1rem', background: '#f8f9fa' }}
            title="退出登录"
          >
            🚪 退出
          </button>
        </div>
      </header>

      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onAddCategory={handleAddCategory}
      />

      {isCreating && (
        <div className="mb-8 p-6" style={{ background: 'white', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow)' }}>
          <h3 className="mb-4">新建卡片</h3>
          <div className="flex flex-col gap-4">
            <input
              value={newCard.title}
              onChange={(e) => setNewCard({ ...newCard, title: e.target.value })}
              placeholder="标题"
              autoFocus
            />
            <textarea
              value={newCard.content}
              onChange={(e) => setNewCard({ ...newCard, content: e.target.value })}
              placeholder="内容..."
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <button className="btn" onClick={() => setIsCreating(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleCreateCard}>创建</button>
            </div>
          </div>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '2rem'
      }}>
        {filteredCards.map(card => (
          <Card
            key={card.id}
            card={card}
            categories={categories}
            onUpdate={handleUpdateCard}
            onDelete={handleDeleteCard}
            onCardClick={handleCardClick}
          />
        ))}
      </div>

      {filteredCards.length === 0 && !isCreating && (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '4rem' }}>
          <p>没有找到卡片...</p>
        </div>
      )}

      {selectedCard && (
        <CardDetail
          card={selectedCard}
          onClose={handleCloseDetail}
          onUpdate={handleUpdateCard}
          onEdit={handleEditFromDetail}
        />
      )}

      {editingCard && (
        <div className="modal-overlay" onClick={() => setEditingCard(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            background: 'white',
            borderRadius: 'var(--border-radius)',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            boxShadow: 'var(--shadow)'
          }}>
            <h3 className="mb-4">编辑卡片</h3>
            <div className="flex flex-col gap-4">
              <input
                value={editingCard.title}
                onChange={(e) => setEditingCard({ ...editingCard, title: e.target.value })}
                placeholder="标题"
                autoFocus
              />
              <textarea
                value={editingCard.content}
                onChange={(e) => setEditingCard({ ...editingCard, content: e.target.value })}
                placeholder="内容..."
                rows={8}
                style={{ resize: 'vertical' }}
              />
              <select
                value={editingCard.category_id || ''}
                onChange={(e) => setEditingCard({ ...editingCard, category_id: e.target.value ? parseInt(e.target.value) : null })}
              >
                <option value="">无分类</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div className="flex justify-end gap-2">
                <button className="btn" onClick={() => setEditingCard(null)}>取消</button>
                <button className="btn btn-primary" onClick={() => {
                  handleUpdateCard(editingCard.id, editingCard);
                  setEditingCard(null);
                }}>保存</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
