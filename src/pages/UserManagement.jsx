import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Plus, Edit2, Trash2, X } from 'lucide-react';

const UserManagement = () => {
  const { users, addUser, updateUser, deleteUser, user: currentUser } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'viewer' });

  if (currentUser?.role !== 'admin') {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      updateUser({ ...formData, id: editingUser.id });
    } else {
      addUser(formData);
    }
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({ username: '', password: '', role: 'viewer' });
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({ username: user.username, password: user.password, role: user.role });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ username: '', password: '', role: 'viewer' });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUser(id);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '24px' }}>
      <div className="header" style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '4px' }}>Permissions</h1>
          <p style={{ color: 'var(--text-muted)' }}>Governance and access control for system operators.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} />
          <span>Provision User</span>
        </button>
      </div>

      <div className="glass" style={{ padding: '32px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div className="table-wrapper" style={{ flex: 1, overflow: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Identity</th>
                <th>Access Secret</th>
                <th>Authorization Level</th>
                <th>Operations</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, index) => (
                <tr key={u.id} style={{ animation: `fadeIn 0.5s ease forwards ${index * 0.05}s`, opacity: 0 }}>
                  <td style={{ fontWeight: '700', color: 'white' }}>
                    {u.username}
                  </td>
                  <td>
                    <code style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem' }}>
                      {u.password}
                    </code>
                  </td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'badge-danger' : u.role === 'editor' ? 'badge-warning' : 'badge-success'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button 
                        title="Modify Credentials" 
                        className="action-btn" 
                        style={{ color: 'var(--primary)' }} 
                        onClick={() => openEditModal(u)}
                      >
                        <Edit2 size={18}/>
                      </button>
                      {u.username !== 'admin' && (
                        <button 
                          title="Revoke Access" 
                          className="action-btn" 
                          style={{ color: '#ef4444' }} 
                          onClick={() => handleDelete(u.id)}
                        >
                          <Trash2 size={18}/>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '440px' }}>
            <div style={{ padding: '32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{editingUser ? 'Update Account' : 'Provision User'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            <div style={{ padding: '32px' }}>
              <form id="user-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Unique Username</label>
                  <input 
                    className="input-field"
                    type="text" 
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    required
                    disabled={editingUser && formData.username === 'admin'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Access Password</label>
                  <input 
                    className="input-field"
                    type="text" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Security Role</label>
                  <select 
                    className="input-field"
                    value={formData.role} 
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    disabled={editingUser && formData.username === 'admin'}
                  >
                    <option value="viewer">Viewer (Read Only)</option>
                    <option value="editor">Editor (Write Access)</option>
                    <option value="admin">Administrator (Full Control)</option>
                  </select>
                </div>
              </form>
            </div>
            <div style={{ padding: '24px 32px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button type="submit" form="user-form" className="btn btn-primary">
                {editingUser ? 'Save Updates' : 'Confirm User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
