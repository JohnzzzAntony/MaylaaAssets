import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';

const ENTITIES = [
  "AL MARAJ PERFUMES", "ASRAR PERFUMES", "ATELIER PERFUMES",
  "DAIMA ROASTERY AND CONFECTIONARY", "FIRST PERFUMES", "FLOWER DISTRICT", 
  "LASTING SILAGE", "MAYLAA CHOCOLATE FACTORY", "MAYLAA GOLD", "MAYLAA HEAD OFFICE", "MAYLAA WAREHOUSE",
  "SALEEL PERFUMES TRADING", "SPACE CONCEPT", "THE HOUSE OF KARJI",
  "TOUCH OF OUD"
];

const EntitySelection = () => {
  const { user, selectedEntity, setSelectedEntity } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login" />;
  }

  const handleSelect = (entity) => {
    setSelectedEntity(entity);
    navigate('/dashboard/desktop');
  };

  return (
    <div className="login-screen">
      <div className="app-bg"></div>
      <div className="login-glow"></div>
      
      <div className="glass" style={{ width: '100%', maxWidth: '900px', padding: '60px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <div style={{ 
            background: 'rgba(99, 102, 241, 0.1)', 
            padding: '24px', 
            borderRadius: '24px',
            boxShadow: '0 0 40px rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.2)'
          }}>
            <Building2 size={48} color="var(--primary)" />
          </div>
        </div>
        <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '12px' }}>Welcome Back</h1>
        <p style={{ marginBottom: '48px', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          Select an entity to begin managing your infrastructure.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
          {ENTITIES.map(ent => (
            <button
              key={ent}
              onClick={() => handleSelect(ent)}
              className="glass-card"
              style={{
                height: 'auto',
                padding: '32px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                borderColor: selectedEntity === ent ? 'var(--primary)' : 'var(--border)',
                background: selectedEntity === ent ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-card)',
                boxShadow: selectedEntity === ent ? '0 0 30px rgba(99, 102, 241, 0.2)' : 'none',
              }}
            >
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                background: 'rgba(255, 255, 255, 0.05)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: '8px'
              }}>
                <Building2 size={24} color={selectedEntity === ent ? 'var(--primary)' : 'var(--text-dim)'} />
              </div>
              <span style={{ 
                fontWeight: '700', 
                color: selectedEntity === ent ? 'white' : 'var(--text-muted)',
                fontSize: '0.9rem',
                letterSpacing: '0.02em',
                lineHeight: '1.4'
              }}>
                {ent}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EntitySelection;
