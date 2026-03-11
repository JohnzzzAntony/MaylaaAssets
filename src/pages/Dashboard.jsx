import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, selectedEntity } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!selectedEntity) {
    return <Navigate to="/select-entity" />;
  }

  return (
    <>
      <div className="app-bg"></div>
      <div className="app-layout">
        <Sidebar />
        <div className="main-container">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
