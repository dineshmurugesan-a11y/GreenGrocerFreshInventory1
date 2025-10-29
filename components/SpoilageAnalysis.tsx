import React, { useState, useEffect, useMemo } from 'react';
import type { SpoilageRecord, Store } from '../types';
import { generateSpoilageData } from '../services/geminiService';
import { PILOT_PRODUCTS } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const SpoilageAnalysis: React.FC<{ store: Store }> = ({ store }) => {
  const [spoilageData, setSpoilageData] = useState<SpoilageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!store) return;
      setIsLoading(true);
      const data = await generateSpoilageData(store.name);
      setSpoilageData(data);
      setIsLoading(false);
    };
    fetchData();
  }, [store]);

  const spoilageByReason = useMemo(() => {
    const reasonMap = new Map<string, number>();
    spoilageData.forEach(item => {
      reasonMap.set(item.reason, (reasonMap.get(item.reason) || 0) + item.quantity);
    });
    return Array.from(reasonMap.entries()).map(([name, value]) => ({ name, value }));
  }, [spoilageData]);

  const spoilageByProduct = useMemo(() => {
    const productMap = new Map<string, number>();
    spoilageData.forEach(item => {
      productMap.set(item.productName, (productMap.get(item.productName) || 0) + item.quantity);
    });
    return Array.from(productMap.entries()).map(([name, value]) => ({ name, value }));
  }, [spoilageData]);
  
  const handleLogWaste = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const sku = formData.get('sku') as string;
    const quantity = parseInt(formData.get('quantity') as string);
    const reason = formData.get('reason') as SpoilageRecord['reason'];
    const recordedDate = formData.get('recordedDate') as string;
    const productName = PILOT_PRODUCTS.find(p => p.sku === sku)?.name || 'Unknown Product';
    
    const newRecord: SpoilageRecord = {
        sku,
        productName,
        quantity,
        reason,
        recordedDate: recordedDate || new Date().toISOString().split('T')[0]
    };

    setSpoilageData(prev => [newRecord, ...prev].sort((a, b) => new Date(b.recordedDate).getTime() - new Date(a.recordedDate).getTime()));
    alert('Waste logged successfully!');
    e.currentTarget.reset();
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (isLoading) {
    return <div className="text-center py-10"><p>Loading spoilage data for {store.name}...</p></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Spoilage Analysis for {store.name}</h2>
        <p className="text-gray-500">Analyze wastage patterns to reduce loss.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Spoilage by Reason</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={spoilageByReason} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                {spoilageByReason.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Waste Logging</h3>
          <form className="space-y-4" onSubmit={handleLogWaste}>
            <div>
              <label htmlFor="sku" className="block text-sm font-medium text-gray-700">Product</label>
              <select id="sku" name="sku" required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-grocer focus:border-green-grocer sm:text-sm rounded-md">
                <option value="">Select a product...</option>
                {PILOT_PRODUCTS.map(p => <option key={p.sku} value={p.sku}>{p.name}</option>)}
              </select>
            </div>
             <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
              <input type="number" id="quantity" name="quantity" min="1" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-grocer focus:border-green-grocer sm:text-sm" />
            </div>
             <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason</label>
              <select id="reason" name="reason" required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-grocer focus:border-green-grocer sm:text-sm rounded-md">
                <option>Expired</option>
                <option>Damaged</option>
                <option>Overstock</option>
                <option>Theft</option>
              </select>
            </div>
            <div>
              <label htmlFor="recordedDate" className="block text-sm font-medium text-gray-700">Date of Spoilage</label>
              <input type="date" id="recordedDate" name="recordedDate" defaultValue={new Date().toISOString().split('T')[0]} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-grocer focus:border-green-grocer sm:text-sm" />
            </div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-grocer hover:bg-green-grocer-dark">Log Waste</button>
          </form>
        </div>
      </div>

       <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Spoilage by Product (Units)</h3>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={spoilageByProduct} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} interval={0} />
                    <Tooltip />
                    <Bar dataKey="value" name="Spoiled Quantity" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Spoilage Logs</h3>
             <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {spoilageData.slice(0, 10).map((record, index) => (
                    <tr key={`${record.sku}-${record.recordedDate}-${index}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.recordedDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.productName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </div>
    </div>
  );
};

export default SpoilageAnalysis;