// FIX: Create the CorporateAnalystView component.
import React, { useState, useEffect } from 'react';
import type { Kpi, CategoryPerformance } from '../types';
import { generateCorporateData } from '../services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const TrendIcon: React.FC<{ trend: 'up' | 'down' | 'neutral' }> = ({ trend }) => {
    switch (trend) {
        case 'up':
            return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" /></svg>;
        case 'down':
            return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1.293-9.293a1 1 0 00-1.414 0L9 10.586V7a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 000-1.414z" clipRule="evenodd" /></svg>;
        case 'neutral':
            return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>;
    }
};

const KpiCard: React.FC<{ kpi: Kpi }> = ({ kpi }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-sm font-medium text-gray-500">{kpi.name}</p>
        <p className="mt-1 text-3xl font-semibold text-gray-900">{kpi.value}</p>
        <div className="flex items-center mt-2">
            <TrendIcon trend={kpi.trend} />
            <p className="ml-2 text-sm text-gray-500">{kpi.change}</p>
        </div>
    </div>
);

const CorporateAnalystView: React.FC = () => {
    const [kpis, setKpis] = useState<Kpi[]>([]);
    const [performance, setPerformance] = useState<CategoryPerformance[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const data = await generateCorporateData();
            setKpis(data.kpis);
            setPerformance(data.performance);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

    if (isLoading) {
        return (
            <div className="text-center py-10">
                <svg className="animate-spin h-8 w-8 text-green-grocer mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <p className="mt-4 text-gray-600">Compiling national pilot program analytics...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Corporate Analytics Dashboard</h2>
                <p className="text-gray-500">National performance of the pilot product program.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {kpis.map(kpi => <KpiCard key={kpi.name} kpi={kpi} />)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Sales by Category</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={performance} dataKey="sales" nameKey="category" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label={p => `$${(p.sales / 1000).toFixed(0)}k`}>
                                {performance.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Spoilage by Category (USD)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={performance} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="category" type="category" />
                            <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                            <Bar dataKey="spoilage" name="Spoilage Value" fill="#FF8042" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default CorporateAnalystView;
