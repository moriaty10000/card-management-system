import React, { useState } from 'react';

export function Login({ onLogin }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // 简单密码验证 - 您可以修改这个密码
        const correctPassword = 'moriaty10000';

        if (password === correctPassword) {
            localStorage.setItem('isAuthenticated', 'true');
            onLogin();
        } else {
            setError('密码错误，请重试');
            setPassword('');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
            <div style={{
                background: 'white',
                padding: '3rem',
                borderRadius: 'var(--border-radius)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                width: '100%',
                maxWidth: '400px'
            }}>
                <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-primary)' }}>
                    🔐 卡片管理系统
                </h1>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                            访问密码
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="请输入密码"
                            autoFocus
                            style={{ fontSize: '1rem' }}
                        />
                    </div>
                    {error && (
                        <div style={{
                            padding: '0.75rem',
                            background: '#fee',
                            color: '#c33',
                            borderRadius: '8px',
                            marginBottom: '1rem',
                            fontSize: '0.9rem'
                        }}>
                            {error}
                        </div>
                    )}
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '0.875rem', fontSize: '1rem' }}
                    >
                        登录
                    </button>
                </form>
            </div>
        </div>
    );
}
