import React, { useState } from 'react';
import type { Store, ProductSKU } from '../types';
import OrderRecommendationsTab from './OrderRecommendationsTab';
import OrderHistoryTab from './OrderHistoryTab';

interface StoreManagerViewProps {
  store: Store;
  products: ProductSKU[];
  justificationReasons: string[];
}

const StoreManagerView: React.FC<StoreManagerViewProps> = ({ store, products, justificationReasons }) => {
  const [activeTab, setActiveTab] = useState<'recommendations' | 'history'>('recommendations');

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`${
              activeTab === 'recommendations'
                ? 'border-green-grocer text-green-grocer-dark'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            aria-current={activeTab === 'recommendations' ? 'page' : undefined}
          >
            Order Recommendations
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`${
              activeTab === 'history'
                ? 'border-green-grocer text-green-grocer-dark'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            aria-current={activeTab === 'history' ? 'page' : undefined}
          >
            Order History
          </button>
        </nav>
      </div>

      <div>
        {activeTab === 'recommendations' && <OrderRecommendationsTab store={store} products={products} justificationReasons={justificationReasons} />}
        {activeTab === 'history' && <OrderHistoryTab store={store} />}
      </div>
    </div>
  );
};

export default StoreManagerView;
