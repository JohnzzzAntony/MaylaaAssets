import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { user, login } = useAuth();

  if (user) {
    return <Navigate to="/select-entity" />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = login(username, password);
    if (!success) {
      setError('Invalid username or password. Please try again.');
    }
  };

  return (
    <div className="login-screen">
      <div className="app-bg"></div>
      <div className="login-glow"></div>
      
      <div className="glass" style={{ width: '100%', maxWidth: '440px', padding: '50px', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
          <img 
            src="/maylaa-logo.png" 
            alt="Maylaa Logo" 
            style={{ width: '140px', marginBottom: '24px' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <h2 className="gradient-text" style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Asset Intelligence</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Secure Infrastructure Management</p>
        </div>
        
        {error && <div style={{ color: '#ef4444', marginBottom: '24px', fontSize: '0.85rem', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <input 
              type="text" 
              className="input-field"
              placeholder="Username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <input 
              type="password" 
              className="input-field"
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            <span>Authenticate</span>
          </button>
        </form>
        
        <div style={{ marginTop: '40px', fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: '1.6' }}>
          <p>Restricted Access - Internal Use Only</p>
          <p>Contact your systems administrator for credentials.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
