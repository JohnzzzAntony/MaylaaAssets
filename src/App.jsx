import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import EntitySelection from './pages/EntitySelection';
import Dashboard from './pages/Dashboard';
import AssetTable from './components/AssetTable';
import Analytics from './pages/Analytics';
import UserManagement from './pages/UserManagement';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/select-entity" element={<EntitySelection />} />
          
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<Navigate to="desktop" />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="desktop" element={<AssetTable category="Desktop" />} />
            <Route path="laptops" element={<AssetTable category="Laptops" />} />
            <Route path="mobile" element={<AssetTable category="Mobile" />} />
            <Route path="printer" element={<AssetTable category="Printer" />} />
            <Route path="pos" element={<AssetTable category="POS" />} />
            <Route path="bill-printer" element={<AssetTable category="Bill Printer" />} />
            <Route path="weighing-scale" element={<AssetTable category="Weighing Scale" />} />
            <Route path="biometric" element={<AssetTable category="Biometric" />} />
            <Route path="switch" element={<AssetTable category="Switch" />} />
            <Route path="router" element={<AssetTable category="Router" />} />
          </Route>
          
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
