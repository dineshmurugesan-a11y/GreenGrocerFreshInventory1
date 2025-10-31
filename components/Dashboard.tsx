import React, { useMemo } from 'react';
import type { User, Store } from '../types';
import { Role } from '../types';
import SideNav from './SideNav';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
  activeView: string;
  setActiveView: (view: string) => void;
  viewingStore: Store | null;
  setViewingStore: (store: Store | null) => void;
  stores: Store[];
}

const StoreSelector: React.FC<{
    user: User,
    viewingStore: Store | null,
    setViewingStore: (store: Store | null) => void;
    stores: Store[];
}> = ({ user, viewingStore, setViewingStore, stores }) => {
    const accessibleStores = useMemo(() => {
        return stores.filter(s => s.region === user.region);
    }, [user.region, stores]);

    const handleStoreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const storeId = parseInt(e.target.value, 10);
        const newStore = stores.find(s => s.id === storeId) || null;
        setViewingStore(newStore);
    };

    if (user.role !== Role.StoreManager || accessibleStores.length <= 1) {
        return null; // Don't show selector if not a manager or only has access to one store
    }
    
    return (
        <div>
            <label htmlFor="store-selector" className="sr-only">Viewing Store</label>
            <select
                id="store-selector"
                value={viewingStore?.id || ''}
                onChange={handleStoreChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-grocer focus:border-green-grocer sm:text-sm rounded-md shadow-sm"
            >
                {accessibleStores.map(store => (
                    <option key={store.id} value={store.id}>
                        {store.name}
                    </option>
                ))}
            </select>
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, children, activeView, setActiveView, viewingStore, setViewingStore, stores }) => {
  const hasSidebar = user.role === Role.StoreManager;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="bg-green-grocer-dark p-2 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              </div>
              <h1 className="text-xl font-bold text-green-grocer-900">GreenGrocer Inventory</h1>
            </div>
            <div className="flex items-center space-x-4">
               <StoreSelector user={user} viewingStore={viewingStore} setViewingStore={setViewingStore} stores={stores} />
              <div>
                <div className="font-medium text-gray-800">{user.name}</div>
                <div className="text-sm text-gray-500">{user.role}</div>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-grocer"
                aria-label="Logout"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </header>
      <div className="flex">
        {hasSidebar && (
          <SideNav 
            userRole={user.role} 
            activeView={activeView} 
            setActiveView={setActiveView} 
          />
        )}
        <main className="flex-1">
          <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
