import React, { useState, useRef } from 'react';
import { assetSchemas } from '../schemas/assetSchemas';
import { importFromExcel } from '../utils/excelImport';
import { useAuth } from '../context/AuthContext';
import { fetchAssets, fetchAllAssets, saveAssets } from '../utils/api';
import { exportAllToExcel } from '../utils/exportUtils';
import { useNavigate } from 'react-router-dom';
import { Upload, Plus, Download, Edit2, Trash2, Search, X, UserPlus, Trash, FileSpreadsheet } from 'lucide-react';

const AssetTable = ({ category }) => {
  const { user, selectedEntity } = useAuth();
  const navigate = useNavigate();
  const schema = assetSchemas[category] || [];
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [pasteData, setPasteData] = useState('');
  const [newAsset, setNewAsset] = useState({ Entity: selectedEntity });
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignAsset, setAssignAsset] = useState(null);
  const fileInputRef = useRef(null);

  const ENTITIES = [
    "AL MARAJ PERFUMES", "ASRAR PERFUMES", "ATELIER PERFUMES",
    "DAIMA ROASTERY AND CONFECTIONARY", "FIRST PERFUMES", "FLOWER DISTRICT", 
    "LASTING SILAGE", "MAYLAA CHOCOLATE FACTORY", "MAYLAA GOLD", "MAYLAA HEAD OFFICE", "MAYLAA WAREHOUSE",
    "SALEEL PERFUMES TRADING", "SPACE CONCEPT", "THE HOUSE OF KARJI",
    "TOUCH OF OUD"
  ];

  // Fetch initial data from Node API
  React.useEffect(() => {
    setLoading(true);
    fetchAssets(category).then(fetchedData => {
        setData(fetchedData);
        setLoading(false);
    });
  }, [category]);
  
  // Save data to Node API whenever data array length or contents fundamentally change
  // Note: For a robust Production app, we'd trigger saveAssets only on explicit Add/Edit/Delete actions
  // But for simple "auto-save on edit" as requested:
  const handleSaveData = async (newData) => {
      setData(newData); // Update React State immediately
      try {
          await saveAssets(category, newData); // Sync to Database
      } catch (err) {
          console.error("Failed to sync to Database: ", err);
          alert("Warning: Failed to sync changes to Database. Ensure the server is running.");
      }
  };

  const canEdit = user?.role === 'admin' || user?.role === 'editor';

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    importFromExcel(file, category, async (parsedData) => {
      const mergedData = [...data, ...parsedData];
      await handleSaveData(mergedData);
      
      const newFetchedData = await fetchAssets(category);
      setData(newFetchedData);
    });
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const mergedData = [...data, { id: Date.now(), ...newAsset }];
    handleSaveData(mergedData);
    setIsModalOpen(false);
    setNewAsset({ Entity: selectedEntity });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const mergedData = data.map(item => item.id === editingAsset.id ? editingAsset : item);
    handleSaveData(mergedData);
    setIsEditModalOpen(false);
    setEditingAsset(null);
  };

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    const mergedData = data.map(item => item.id === assignAsset.id ? assignAsset : item);
    handleSaveData(mergedData);
    setIsAssignModalOpen(false);
    setAssignAsset(null);
  };

  const handleDelete = (id) => {
    if(window.confirm('Are you sure you want to delete this asset?')) {
        const mergedData = data.map(item => item.id === id ? { ...item, isDeleted: true } : item);
        handleSaveData(mergedData);
    }
  };

  const handleDeleteAll = () => {
    if(window.confirm(`Are you absolutely sure you want to delete ALL ${category} assets for ${selectedEntity}? This action cannot be easily undone.`)) {
        const mergedData = data.map(item => {
            // Only delete if it belongs to the current entity!
            if (!item.Entity || item.Entity === selectedEntity) {
               return { ...item, isDeleted: true };
            }
            return item;
        });
        handleSaveData(mergedData);
    }
  };

  const handlePasteSubmit = async () => {
    if (!pasteData.trim()) return;
    
    // Split by newlines, then by tabs
    const rows = pasteData.split('\n').map(row => row.split('\t'));
    
    const parsedData = rows.map((rowArr, index) => {
      const rowObj = { id: Date.now() + index, Entity: selectedEntity }; // Default entity
      
      // Try to map pasting values left-to-right to the schema
      schema.forEach((col, colIndex) => {
        rowObj[col.key] = rowArr[colIndex] ? rowArr[colIndex].trim() : "";
      });
      return rowObj;
    }).filter(row => Object.keys(row).length > 2); // Exclude empty lines
    
    if (parsedData.length > 0) {
      const mergedData = [...data, ...parsedData];
      await handleSaveData(mergedData);
      
      const newFetchedData = await fetchAssets(category);
      setData(newFetchedData);
    }
    
    setIsPasteModalOpen(false);
    setPasteData('');
  };

  const filteredData = data.filter(row => {
    if (row.isDeleted) return false;
    // Only show assets that match the selected entity if Entity exists, otherwise show them anyway 
    // to prevent orphans. If users only want strictly filtered views, we enforce it here.
    const matchesEntity = !row.Entity || row.Entity === selectedEntity;
    const matchesSearch = Object.values(row).some(val => val && val.toString().toLowerCase().includes(search.toLowerCase()));
    return matchesEntity && matchesSearch;
  }).sort((a, b) => {
      // Sort alphabetically by the first column in the schema
      if (!schema || schema.length === 0) return 0;
      const key = schema[0].key;
      const valA = a[key] ? String(a[key]).toLowerCase() : '';
      const valB = b[key] ? String(b[key]).toLowerCase() : '';
      return valA.localeCompare(valB);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '24px' }}>
      <div className="header" style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '4px' }}>{category}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }}></div>
            <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{selectedEntity}</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>•</span>
            <span style={{ fontSize: '0.9rem' }}>{filteredData.length} Assets Found</span>
          </div>
        </div>
        
        {canEdit && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-ghost" onClick={handleDeleteAll} disabled={loading || filteredData.length === 0} style={{ color: '#ef4444' }}>
              <Trash size={18} />
              <span>Clear Category</span>
            </button>
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              style={{ display: 'none' }} 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button className="btn btn-ghost" onClick={() => fileInputRef.current?.click()} disabled={loading}>
              <Upload size={18} />
              <span>Import</span>
            </button>
            <button className="btn btn-ghost" onClick={() => setIsPasteModalOpen(true)} disabled={loading}>
              <FileSpreadsheet size={18} />
              <span>Paste</span>
            </button>

            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} disabled={loading}>
              <Plus size={18} />
              <span>New Asset</span>
            </button>
          </div>
        )}
      </div>

      <div className="glass" style={{ padding: '32px', display: 'flex', flex: '1', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ position: 'relative', width: '360px' }}>
            <Search size={20} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-dim)' }} />
            <input 
              type="text" 
              className="input-field"
              placeholder="Filter assets by any attribute..." 
              style={{ paddingLeft: '52px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-ghost">
            <Download size={18} />
            <span>Generate Report</span>
          </button>
        </div>

        <div className="table-wrapper" style={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
             <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
                <p style={{ color: 'var(--text-muted)' }}>Synchronizing encrypted data...</p>
             </div>
          ) : data.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <div style={{ marginBottom: '24px', opacity: 0.2 }}>
                <Upload size={64} style={{ margin: '0 auto' }} />
              </div>
              <h3 style={{ color: 'var(--text-main)', marginBottom: '8px' }}>Inventory is empty</h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: '300px', margin: '0 auto' }}>
                {canEdit ? "Your asset database for this category is currently empty. Start by importing or adding a record." : "No assets currently match this category."}
              </p>
            </div>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Identity</th>
                  {schema.map((col) => (
                    <th key={col.key}>{col.label}</th>
                  ))}
                  {canEdit && <th>Operations</th>}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, index) => (
                  <tr key={row.id} style={{ animation: `fadeIn 0.5s ease forwards ${index * 0.05}s`, opacity: 0 }}>
                    <td style={{ fontWeight: '700', color: 'white' }}>{row.Entity || '-'}</td>
                    {schema.map((col) => (
                      <td key={col.key}>{row[col.key] || '-'}</td>
                    ))}
                    {canEdit && (
                      <td>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button title="Assign Owner" className="action-btn" style={{ color: 'var(--secondary)' }} onClick={() => { setAssignAsset(row); setIsAssignModalOpen(true); }}><UserPlus size={18}/></button>
                          <button title="Edit Record" className="action-btn" style={{ color: 'var(--primary)' }} onClick={() => { setEditingAsset(row); setIsEditModalOpen(true); }}><Edit2 size={18}/></button>
                          <button title="Deep Delete" className="action-btn" style={{ color: '#ef4444' }} onClick={() => handleDelete(row.id)}><Trash2 size={18}/></button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div style={{ padding: '32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem' }}>Add New {category}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
              <form id="add-asset-form" onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ padding: '16px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '12px', border: '1px solid var(--border-glow)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>Active Entity</span>
                  <div style={{ fontWeight: '700', color: 'white', fontSize: '1rem', marginTop: '4px' }}>{selectedEntity}</div>
                </div>
                {schema.map(col => (
                  <div key={col.key}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>{col.label}</label>
                    <input 
                      className="input-field"
                      type={col.type === 'date' ? 'date' : col.type === 'number' ? 'number' : 'text'} 
                      value={newAsset[col.key] || ''}
                      onChange={(e) => setNewAsset({...newAsset, [col.key]: e.target.value})}
                    />
                  </div>
                ))}
              </form>
            </div>
            <div style={{ padding: '24px 32px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Dismiss</button>
              <button type="submit" form="add-asset-form" className="btn btn-primary">Create Asset</button>
            </div>
          </div>
        </div>
      )}

      {isPasteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '700px' }}>
            <div style={{ padding: '32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem' }}>Bulk Import</h3>
              <button onClick={() => setIsPasteModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            <div style={{ padding: '32px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  Copy your data from Excel and paste it below. The system will automatically map the columns to the <strong>{category}</strong> schema.
                </p>
              </div>
              <textarea 
                className="input-field"
                value={pasteData}
                onChange={(e) => setPasteData(e.target.value)}
                style={{ height: '240px', fontFamily: 'monospace', fontSize: '0.85rem' }}
                placeholder="Ctrl+V to paste your spreadsheet data..."
              />
            </div>
            <div style={{ padding: '24px 32px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-ghost" onClick={() => setIsPasteModalOpen(false)}>Cancel</button>
              <button onClick={handlePasteSubmit} className="btn btn-primary">Process Data</button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && editingAsset && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div style={{ padding: '32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem' }}>Modify Asset</h3>
              <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
              <form id="edit-asset-form" onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Corporate Entity</label>
                  <select 
                    className="input-field"
                    value={editingAsset.Entity || ''} 
                    onChange={(e) => setEditingAsset({...editingAsset, Entity: e.target.value})}
                  >
                    {ENTITIES.map(ent => (
                      <option key={ent} value={ent}>{ent}</option>
                    ))}
                  </select>
                </div>
                {schema.map(col => (
                  <div key={col.key}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>{col.label}</label>
                    <input 
                      className="input-field"
                      type={col.type === 'date' ? 'date' : col.type === 'number' ? 'number' : 'text'} 
                      value={editingAsset[col.key] || ''}
                      onChange={(e) => setEditingAsset({...editingAsset, [col.key]: e.target.value})}
                    />
                  </div>
                ))}
              </form>
            </div>
            <div style={{ padding: '24px 32px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-ghost" onClick={() => setIsEditModalOpen(false)}>Revert</button>
              <button type="submit" form="edit-asset-form" className="btn btn-primary">Sync Changes</button>
            </div>
          </div>
        </div>
      )}

      {isAssignModalOpen && assignAsset && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '440px' }}>
            <div style={{ padding: '32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem' }}>Account Assignment</h3>
              <button onClick={() => setIsAssignModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
              <form id="assign-asset-form" onSubmit={handleAssignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Personnel Name</label>
                  <input 
                    className="input-field"
                    type="text" 
                    value={assignAsset.User || ''}
                    onChange={(e) => setAssignAsset({...assignAsset, User: e.target.value})}
                    placeholder="Search personnel..."
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Org. Unit / Department</label>
                  <input 
                    className="input-field"
                    type="text" 
                    value={assignAsset.Department || ''}
                    onChange={(e) => setAssignAsset({...assignAsset, Department: e.target.value})}
                    placeholder="Enter department"
                  />
                </div>
                {schema.some(s => s.key === 'Location') && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Geographic Location</label>
                    <input 
                      className="input-field"
                      type="text" 
                      value={assignAsset.Location || ''}
                      onChange={(e) => setAssignAsset({...assignAsset, Location: e.target.value})}
                      placeholder="Enter location"
                    />
                  </div>
                )}
              </form>
            </div>
            <div style={{ padding: '24px 32px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-ghost" onClick={() => setIsAssignModalOpen(false)}>Cancel</button>
              <button type="submit" form="assign-asset-form" className="btn btn-primary">Confirm Transfer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetTable;
