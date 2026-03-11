import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [selectedEntity, setSelectedEntity] = useState(() => {
    return localStorage.getItem('currentEntity') || null;
  });

  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem('app_users');
    if (savedUsers) return JSON.parse(savedUsers);
    
    // Default users
    return [
      { id: 1, username: 'admin', password: 'admin', role: 'admin' },
      { id: 2, username: 'editor', password: 'editor', role: 'editor' },
      { id: 3, username: 'viewer', password: 'viewer', role: 'viewer' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('app_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [user]);

  useEffect(() => {
    if (selectedEntity) {
      localStorage.setItem('currentEntity', selectedEntity);
    } else {
      localStorage.removeItem('currentEntity');
    }
  }, [selectedEntity]);

  const login = (username, password) => {
    const foundUser = users.find(u => u.username === username && u.password === password);
    if (foundUser) {
      setUser({ username: foundUser.username, role: foundUser.role, id: foundUser.id });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setSelectedEntity(null);
  };

  const addUser = (newUser) => {
    setUsers([...users, { ...newUser, id: Date.now() }]);
  };

  const updateUser = (updatedUser) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const deleteUser = (id) => {
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <AuthContext.Provider value={{ 
      user, login, logout, selectedEntity, setSelectedEntity,
      users, addUser, updateUser, deleteUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
