// FIX: Create the RegionalManagerView component.
import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { User, RegionalStorePerformance, Store } from '../types';
import { generateRegionalPerformanceData } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const downloadCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    alert("No data available to download.");
    return;
  }
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

interface RegionalManagerViewProps {
    user: User;
    stores: Store[];
}

const RegionalManagerView: React.FC<RegionalManagerViewProps> = ({ user, stores }) => {
  const [performanceData, setPerformanceData] = useState<RegionalStorePerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const allRegions = useMemo(() => [...new Set(stores.map(s => s.region))], [stores]);
  const [selectedRegion, setSelectedRegion] = useState(user.region || allRegions[0]);
  
  const storesInRegion = useMemo(() => stores.filter(s => s.region === selectedRegion), [selectedRegion, stores]);
  const [selectedStore, setSelectedStore] = useState('All');


  useEffect(() => {
    const fetchData = async () => {
      if (!selectedRegion) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const data = await generateRegionalPerformanceData(selectedRegion);
      setPerformanceData(data);
      setIsLoading(false);
    };

    fetchData();
  }, [selectedRegion]);

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRegion(e.target.value);
    setSelectedStore('All'); // Reset store selection when region changes
  };

  const displayedData = useMemo(() => {
    if (selectedStore === 'All') {
      return performanceData;
    }
    return performanceData.filter(p => p.storeName === selectedStore);
  }, [selectedStore, performanceData]);
  
  const formattedRadarData = displayedData.map(store => ({
      subject: store.storeName,
      'Order Accuracy': store.orderAccuracy,
      'Inv. Turnover': store.inventoryTurnover * 6, // Scale for better visualization
      fullMark: 100,
  }));

  const handleDownload = () => {
      const date = new Date().toISOString().split('T')[0];
      const filename = `regional-performance_${selectedRegion}_${selectedStore}_${date}.csv`;
      downloadCSV(displayedData, filename);
  };

  const viewTitle = selectedStore === 'All' 
    ? `Regional Performance: ${selectedRegion}` 
    : `Store Performance: ${selectedStore}`;

  if (isLoading) {
    return (
        <div className="text-center py-10">
            <svg className="animate-spin h-8 w-8 text-green-grocer mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <p className="mt-4 text-gray-600">Aggregating performance data for {selectedRegion}...</p>
        </div>
    );
  }

  if (!user.region) {
    return <div className="text-center py-10"><p className="text-red-500">Error: No region assigned to the current user.</p></div>;
  }
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">{viewTitle}</h2>
            <p className="text-gray-500">Overview of store performance for the pilot program.</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
             <div>
                <label htmlFor="region-select" className="sr-only">Select Region</label>
                <select 
                    id="region-select"
                    value={selectedRegion} 
                    onChange={handleRegionChange}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-grocer focus:border-green-grocer sm:text-sm rounded-md"
                >
                    {allRegions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
             </div>
             <div>
                <label htmlFor="store-select" className="sr-only">Select Store</label>
                 <select 
                    id="store-select"
                    value={selectedStore}
                    onChange={(e) => setSelectedStore(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-grocer focus:border-green-grocer sm:text-sm rounded-md"
                 >
                    <option value="All">All Stores</option>
                    {storesInRegion.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                 </select>
             </div>
             <button
                onClick={handleDownload}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-grocer"
                >
                <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                Download
             </button>
        </div>
      </div>
      
       {displayedData.length === 0 && !isLoading ? (
         <div className="text-center py-10 bg-white rounded-lg shadow-md"><p className="text-gray-500">No performance data available for the current selection.</p></div>
       ) : (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Total Spoilage (USD)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={displayedData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="storeName" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                        <Legend />
                        <Bar dataKey="totalSpoilage" fill="#FF8042" name="Spoilage Value" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Store KPI Snapshot</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={formattedRadarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]}/>
                        <Radar name="Order Accuracy" dataKey="Order Accuracy" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        <Radar name="Inv. Turnover" dataKey="Inv. Turnover" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                        <Tooltip />
                        <Legend />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Performance Metrics Table</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spoilage</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Accuracy</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inventory Turnover</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayedData.map((store) => (
                    <tr key={store.storeName}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{store.storeName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${store.totalSpoilage.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{store.orderAccuracy.toFixed(1)}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{store.inventoryTurnover.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RegionalManagerView;
