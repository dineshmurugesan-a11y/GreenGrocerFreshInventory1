import React from 'react';
import type { ProductSKU } from '../types';

interface ManualInventoryFormProps {
    products: ProductSKU[];
}

const ManualInventoryForm: React.FC<ManualInventoryFormProps> = ({ products }) => {

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const sku = formData.get('sku');
        const count = formData.get('count');
        const productName = products.find(p => p.sku === sku)?.name || 'Selected product';
        alert(`Inventory for ${productName} (${sku}) updated to ${count}. Recommendations will be refreshed shortly.`);
        e.currentTarget.reset();
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md col-span-1 md:col-span-3">
             <h3 className="text-xl font-semibold text-gray-800 mb-4">Manual Inventory Update</h3>
             <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-2">
                    <label htmlFor="manual-sku" className="block text-sm font-medium text-gray-700">Product</label>
                    <select id="manual-sku" name="sku" required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-grocer focus:border-green-grocer sm:text-sm rounded-md">
                        <option value="">Select a product...</option>
                        {products.map(p => <option key={p.sku} value={p.sku}>{p.name}</option>)}
                    </select>
                </div>
                <div>
                     <label htmlFor="manual-count" className="block text-sm font-medium text-gray-700">Current Count</label>
                     <input type="number" id="manual-count" name="count" min="0" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-grocer focus:border-green-grocer sm:text-sm" />
                </div>
                <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-grocer hover:bg-green-grocer-dark">Update Count</button>
             </form>
        </div>
    );
};

export default ManualInventoryForm;
