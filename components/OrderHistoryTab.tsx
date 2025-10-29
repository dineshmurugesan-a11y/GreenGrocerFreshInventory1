import React, { useState, useEffect } from 'react';
import type { OrderHistory, Store } from '../types';
import { generateOrderHistory } from '../services/geminiService';

const OrderHistoryTab: React.FC<{ store: Store }> = ({ store }) => {
    const [history, setHistory] = useState<OrderHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!store) {
                setIsLoading(false);
                return;
            };
            setIsLoading(true);
            setError(null);
            try {
                const data = await generateOrderHistory(store.name);
                setHistory(data);
            } catch (e) {
                setError("Failed to fetch order history.");
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [store]);
    
    if (isLoading) {
        return (
            <div className="text-center py-10">
                <svg className="animate-spin h-8 w-8 text-green-grocer mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <p className="mt-4 text-gray-600">Loading order history for {store?.name}...</p>
            </div>
        );
    }
    
    if (error) {
        return <div className="text-center py-10 text-red-500">{error}</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Order History</h2>
                <p className="text-gray-500">Past 90 Days for {store.name}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity Ordered</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inventory at Order</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shelf Life (Days)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {history.map((item, index) => (
                                <tr key={`${item.sku}-${item.orderDate}-${index}`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.orderDate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.productName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantityOrdered}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.currentInventory}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.shelfLifeDays}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {history.length === 0 && <p className="text-center py-4 text-gray-500">No order history found.</p>}
                </div>
            </div>
        </div>
    );
};

export default OrderHistoryTab;