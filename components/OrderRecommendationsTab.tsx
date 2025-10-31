import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { OrderRecommendation, Store, ProductSKU } from '../types';
import { generateOrderRecommendations } from '../services/geminiService';
import ManualInventoryForm from './ManualInventoryForm';

interface OrderRecommendationsTabProps {
    store: Store;
    products: ProductSKU[];
    justificationReasons: string[];
}

const OrderRecommendationsTab: React.FC<OrderRecommendationsTabProps> = ({ store, products, justificationReasons }) => {
    const [recommendations, setRecommendations] = useState<OrderRecommendation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSkus, setSelectedSkus] = useState<Set<string>>(new Set());
    const [statusFilter, setStatusFilter] = useState('All');
    const [categoryFilter, setCategoryFilter] = useState('All');

    const categories = useMemo(() => ['All', ...new Set(products.map(p => p.category))], [products]);

    const fetchData = useCallback(async () => {
        if (!store) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await generateOrderRecommendations(store.name);
            setRecommendations(data);
        } catch (e) {
            setError("Failed to fetch order recommendations.");
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [store]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleQuantityChange = (sku: string, newQty: number) => {
        setRecommendations(prev =>
            prev.map(rec => {
                if (rec.sku === sku) {
                    const isAdjusted = newQty !== rec.recommendedQty;
                    let newStatus = rec.status;
                    if (isAdjusted && rec.status === 'Pending for Review') newStatus = 'Adjusted';
                    if (isAdjusted && rec.status === 'Approved') newStatus = 'Adjusted and Approved';
                    return { ...rec, adjustedQty: newQty, status: newStatus };
                }
                return rec;
            })
        );
    };

    const handleJustificationChange = (sku: string, justification: string) => {
        setRecommendations(prev => prev.map(rec => rec.sku === sku ? { ...rec, justification } : rec));
    };

    const handleApprove = (sku: string) => {
        setRecommendations(prev =>
            prev.map(rec => {
                if (rec.sku === sku) {
                    let newStatus = rec.status;
                    if (rec.status === 'Pending for Review') newStatus = 'Approved';
                    if (rec.status === 'Adjusted') newStatus = 'Adjusted and Approved';
                    return { ...rec, status: newStatus };
                }
                return rec;
            })
        );
    };

    const handleSelectSku = (sku: string) => {
        setSelectedSkus(prev => {
            const newSet = new Set(prev);
            if (newSet.has(sku)) {
                newSet.delete(sku);
            } else {
                newSet.add(sku);
            }
            return newSet;
        });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedSkus(new Set(filteredRecommendations.map(r => r.sku)));
        } else {
            setSelectedSkus(new Set());
        }
    };
    
    const handleApproveSelected = () => {
        setRecommendations(prev =>
            prev.map(rec => {
                if (selectedSkus.has(rec.sku)) {
                    let newStatus = rec.status;
                    if (rec.status === 'Pending for Review') newStatus = 'Approved';
                    if (rec.status === 'Adjusted') newStatus = 'Adjusted and Approved';
                    return { ...rec, status: newStatus };
                }
                return rec;
            })
        );
        setSelectedSkus(new Set());
    };
    
    const filteredRecommendations = useMemo(() => {
        return recommendations.filter(rec => {
            const product = products.find(p => p.sku === rec.sku);
            const statusMatch = statusFilter === 'All' || rec.status === statusFilter;
            const categoryMatch = categoryFilter === 'All' || (product && product.category === categoryFilter);
            return statusMatch && categoryMatch;
        });
    }, [recommendations, statusFilter, categoryFilter, products]);
    
    const isAllSelected = selectedSkus.size > 0 && filteredRecommendations.length > 0 && selectedSkus.size === filteredRecommendations.length;

    if (isLoading) {
        return (
            <div className="text-center py-10">
                <svg className="animate-spin h-8 w-8 text-green-grocer mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <p className="mt-4 text-gray-600">Generating order recommendations for {store?.name}...</p>
            </div>
        );
    }
    
    if (error) {
        return <div className="text-center py-10 text-red-500">{error}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Order Recommendations for {store.name}</h2>
                    <p className="text-gray-500">Review and adjust AI-powered order suggestions.</p>
                </div>
                <div className="flex items-center space-x-4 mt-4 md:mt-0">
                    <button onClick={fetchData} className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.991-2.691v-4.992a4.125 4.125 0 0 1 4.125-4.125h.008a4.125 4.125 0 0 1 4.125 4.125v4.992m-12.492 0v4.992a4.125 4.125 0 0 0 4.125 4.125h.008a4.125 4.125 0 0 0 4.125-4.125v-4.992" /></svg>
                        Refresh
                    </button>
                    {selectedSkus.size > 0 && (
                        <button 
                            onClick={handleApproveSelected}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-grocer hover:bg-green-grocer-dark"
                        >
                             Approve Selected ({selectedSkus.size})
                        </button>
                    )}
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <ManualInventoryForm products={products} />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Pending Orders</h3>
                    <div className="flex space-x-4">
                        <div>
                             <label htmlFor="status-filter" className="sr-only">Filter by Status</label>
                             <select id="status-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-grocer focus:border-green-grocer sm:text-sm rounded-md">
                                 <option>All</option>
                                 <option>Pending for Review</option>
                                 <option>Adjusted</option>
                                 <option>Approved</option>
                                 <option>Adjusted and Approved</option>
                             </select>
                        </div>
                        <div>
                             <label htmlFor="category-filter" className="sr-only">Filter by Category</label>
                             <select id="category-filter" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-grocer focus:border-green-grocer sm:text-sm rounded-md">
                                {categories.map(c => <option key={c}>{c}</option>)}
                             </select>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="p-4"><input type="checkbox" className="h-4 w-4 text-green-grocer border-gray-300 rounded" onChange={handleSelectAll} checked={isAllSelected} /></th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Inv.</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Forecasted Qty</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recommended Qty</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adjusted Qty</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Justification</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredRecommendations.map(rec => (
                                <tr key={rec.sku}>
                                    <td className="p-4"><input type="checkbox" className="h-4 w-4 text-green-grocer border-gray-300 rounded" checked={selectedSkus.has(rec.sku)} onChange={() => handleSelectSku(rec.sku)} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rec.productName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rec.currentInventory}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rec.forecastedQty}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rec.recommendedQty}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <input 
                                            type="number" 
                                            value={rec.adjustedQty}
                                            onChange={(e) => handleQuantityChange(rec.sku, parseInt(e.target.value) || 0)}
                                            className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                                            aria-label={`Adjusted quantity for ${rec.productName}`}
                                            role="spinbutton"
                                        />
                                    </td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <select
                                            value={rec.justification}
                                            onChange={(e) => handleJustificationChange(rec.sku, e.target.value)}
                                            className="w-40 block pl-3 pr-10 py-1 text-base border-gray-300 focus:outline-none focus:ring-green-grocer focus:border-green-grocer sm:text-sm rounded-md"
                                        >
                                            <option value="">Select a reason...</option>
                                            {justificationReasons.map(reason => <option key={reason}>{reason}</option>)}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            rec.status === 'Approved' || rec.status === 'Adjusted and Approved' ? 'bg-green-100 text-green-800' :
                                            rec.status === 'Adjusted' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>{rec.status}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button onClick={() => handleApprove(rec.sku)} className="text-green-grocer hover:text-green-grocer-dark disabled:text-gray-400 disabled:cursor-not-allowed" disabled={rec.status === 'Approved' || rec.status === 'Adjusted and Approved'}>Approve</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {filteredRecommendations.length === 0 && <p className="text-center py-4 text-gray-500">No orders match the current filters.</p>}
            </div>
        </div>
    );
};

export default OrderRecommendationsTab;
