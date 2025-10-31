import React, { useState, useCallback, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import StoreManagerView from './components/StoreManagerView';
import RegionalManagerView from './components/RegionalManagerView';
import CorporateAnalystView from './components/CorporateAnalystView';
import SpoilageAnalysis from './components/SpoilageAnalysis';
import Mailbox from './components/Mailbox';
import type { User, Store, ProductSKU } from './types';
import { Role } from './types';
import * as staticDataService from './services/staticDataService';

interface AppData {
  users: User[];
  stores: Store[];
  products: ProductSKU[];
  justificationReasons: string[];
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState('Orders');
  const [viewingStore, setViewingStore] = useState<Store | null>(null);
  const [appData, setAppData] = useState<AppData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAppData = async () => {
      try {
        const [users, stores, products, justificationReasons] = await Promise.all([
          staticDataService.getUsers(),
          staticDataService.getStores(),
          staticDataService.getProducts(),
          staticDataService.getJustificationReasons(),
        ]);
        setAppData({ users, stores, products, justificationReasons });
      } catch (err) {
        setError('Failed to load application data. Please try refreshing the page.');
        console.error(err);
      }
    };
    loadAppData();
  }, []);

  const handleLogin = useCallback((user: User) => {
    if (!appData) return;
    setCurrentUser(user);
    setActiveView('Orders'); // Reset to default view on login
    if (user.role === Role.StoreManager && user.storeId) {
        const userStore = appData.stores.find(s => s.id === user.storeId);
        setViewingStore(userStore || null);
    }
  }, [appData]);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setViewingStore(null);
  }, []);

  const renderView = () => {
    if (!currentUser || !appData) return null;

    // Store Manager has a multi-view layout controlled by the sidebar
    if (currentUser.role === Role.StoreManager) {
      if (!viewingStore) {
        return <p className="text-center text-red-500">No store selected or assigned.</p>;
      }
      switch (activeView) {
        case 'Orders':
          return <StoreManagerView store={viewingStore} products={appData.products} justificationReasons={appData.justificationReasons}/>;
        case 'Spoilage Analysis':
          return <SpoilageAnalysis store={viewingStore} products={appData.products} />;
        case 'Regional View':
          // Store manager can view their own region's performance for context
          return <RegionalManagerView user={currentUser} stores={appData.stores} />;
        case 'Mailbox':
          return <Mailbox store={viewingStore} />;
        default:
          return <StoreManagerView store={viewingStore} products={appData.products} justificationReasons={appData.justificationReasons} />;
      }
    }
    
    // Other roles have a single primary view
    if (currentUser.role === Role.RegionalManager) {
      return <RegionalManagerView user={currentUser} stores={appData.stores} />;
    }
    
    if (currentUser.role === Role.CorporateAnalyst) {
      return <CorporateAnalystView />;
    }

    return <p>No view available for this role.</p>;
  };

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500 bg-gray-100 p-4 text-center">{error}</div>;
  }
  
  if (!appData) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
               <svg className="animate-spin h-10 w-10 text-green-grocer" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               <p className="ml-4 text-lg text-gray-600">Loading GreenGrocer App...</p>
          </div>
      );
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} users={appData.users} />;
  }

  return (
    <Dashboard 
      user={currentUser} 
      onLogout={handleLogout} 
      activeView={activeView}
      setActiveView={setActiveView}
      viewingStore={viewingStore}
      setViewingStore={setViewingStore}
      stores={appData.stores}
    >
      {renderView()}
    </Dashboard>
  );
};

export default App;
