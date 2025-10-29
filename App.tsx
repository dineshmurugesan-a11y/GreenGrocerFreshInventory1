import React, { useState, useCallback, useMemo } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import StoreManagerView from './components/StoreManagerView';
import RegionalManagerView from './components/RegionalManagerView';
import CorporateAnalystView from './components/CorporateAnalystView';
import SpoilageAnalysis from './components/SpoilageAnalysis';
import Mailbox from './components/Mailbox';
import type { User, Store } from './types';
import { Role } from './types';
import { STORES } from './constants';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState('Orders');
  const [viewingStore, setViewingStore] = useState<Store | null>(null);

  const handleLogin = useCallback((user: User) => {
    setCurrentUser(user);
    setActiveView('Orders'); // Reset to default view on login
    if (user.role === Role.StoreManager && user.storeId) {
        const userStore = STORES.find(s => s.id === user.storeId);
        setViewingStore(userStore || null);
    }
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setViewingStore(null);
  }, []);

  const renderView = () => {
    if (!currentUser) return null;

    // Store Manager has a multi-view layout controlled by the sidebar
    if (currentUser.role === Role.StoreManager) {
      if (!viewingStore) {
        return <p className="text-center text-red-500">No store selected or assigned.</p>;
      }
      switch (activeView) {
        case 'Orders':
          return <StoreManagerView store={viewingStore} />;
        case 'Spoilage Analysis':
          return <SpoilageAnalysis store={viewingStore} />;
        case 'Regional View':
          // Store manager can view their own region's performance for context
          return <RegionalManagerView user={currentUser} />;
        case 'Mailbox':
          return <Mailbox store={viewingStore} />;
        default:
          return <StoreManagerView store={viewingStore} />;
      }
    }
    
    // Other roles have a single primary view
    if (currentUser.role === Role.RegionalManager) {
      return <RegionalManagerView user={currentUser} />;
    }
    
    if (currentUser.role === Role.CorporateAnalyst) {
      return <CorporateAnalystView />;
    }

    return <p>No view available for this role.</p>;
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Dashboard 
      user={currentUser} 
      onLogout={handleLogout} 
      activeView={activeView}
      setActiveView={setActiveView}
      viewingStore={viewingStore}
      setViewingStore={setViewingStore}
    >
      {renderView()}
    </Dashboard>
  );
};

export default App;