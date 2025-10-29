// FIX: Implement the full geminiService to generate mock application data.
import { GoogleGenAI, Type } from '@google/genai';
import { PILOT_PRODUCTS, STORES } from '../constants';
import type { 
    OrderRecommendation, 
    SpoilageRecord, 
    OrderHistory, 
    Notification, 
    RegionalStorePerformance, 
    Kpi, 
    CategoryPerformance 
} from '../types';

// IMPORTANT: This is a mock service using Gemini to generate realistic-seeming data.
// In a real application, this would be replaced by calls to a backend API.
// This setup allows for dynamic and varied data for demonstration purposes.

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

/**
 * Generates AI-powered order recommendations for a specific store.
 */
export const generateOrderRecommendations = async (storeName: string): Promise<OrderRecommendation[]> => {
    const productsPrompt = PILOT_PRODUCTS.map(p => `${p.name} (SKU: ${p.sku}, Category: ${p.category})`).join(', ');

    const prompt = `Generate a list of 5 to 7 realistic order recommendations for a grocery store named "${storeName}". 
    The store sells the following pilot products: ${productsPrompt}.
    For each recommendation, provide the sku, productName, currentInventory (between 10 and 100), forecastedQty for the next 7 days, 
    recommendedQty to order (should be logical based on inventory and forecast), and a targetDeliveryDate within the next 3-5 days from today (${new Date().toISOString().split('T')[0]}).
    Ensure the data is varied and makes sense for a grocery store. For example, popular items like bananas and milk might need larger orders.`;
    
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            sku: { type: Type.STRING },
                            productName: { type: Type.STRING },
                            currentInventory: { type: Type.NUMBER },
                            forecastedQty: { type: Type.NUMBER },
                            recommendedQty: { type: Type.NUMBER },
                            targetDeliveryDate: { type: Type.STRING, description: 'Format: YYYY-MM-DD' },
                        },
                        required: ['sku', 'productName', 'currentInventory', 'forecastedQty', 'recommendedQty', 'targetDeliveryDate']
                    }
                }
            }
        });

        const recommendations: Omit<OrderRecommendation, 'adjustedQty' | 'justification' | 'status'>[] = JSON.parse(response.text);

        return recommendations.map(rec => ({
            ...rec,
            adjustedQty: rec.recommendedQty,
            justification: '',
            status: 'Pending for Review',
        }));
    } catch (error) {
        console.error("Error generating order recommendations:", error);
        return [];
    }
};


/**
 * Generates historical spoilage data for a specific store.
 */
export const generateSpoilageData = async (storeName: string): Promise<SpoilageRecord[]> => {
    const productsPrompt = PILOT_PRODUCTS.map(p => `${p.name} (SKU: ${p.sku})`).join(', ');

    const prompt = `Generate a list of about 15-20 realistic spoilage records for the past 90 days for a grocery store named "${storeName}". 
    The store sells these pilot products: ${productsPrompt}.
    For each record, provide the sku, productName, quantity (between 1 and 10), a reason ('Expired', 'Damaged', 'Overstock', 'Theft'), and a recordedDate (YYYY-MM-DD format) within the last 90 days.
    Make the data realistic; for example, produce like bananas and strawberries might expire more often.`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            sku: { type: Type.STRING },
                            productName: { type: Type.STRING },
                            quantity: { type: Type.NUMBER },
                            reason: { type: Type.STRING, enum: ['Expired', 'Damaged', 'Overstock', 'Theft'] },
                            recordedDate: { type: Type.STRING, description: 'Format: YYYY-MM-DD' },
                        },
                        required: ['sku', 'productName', 'quantity', 'reason', 'recordedDate']
                    }
                }
            }
        });
        const data: SpoilageRecord[] = JSON.parse(response.text);
        // Sort by date descending
        return data.sort((a, b) => new Date(b.recordedDate).getTime() - new Date(a.recordedDate).getTime());
    } catch (error) {
        console.error("Error generating spoilage data:", error);
        return [];
    }
};

/**
 * Generates historical order data for a specific store.
 */
export const generateOrderHistory = async (storeName: string): Promise<OrderHistory[]> => {
    const productsPrompt = PILOT_PRODUCTS.map(p => `${p.name} (SKU: ${p.sku})`).join(', ');

    const prompt = `Generate a list of about 20-25 realistic past order records for the past 90 days for a grocery store named "${storeName}".
    The products are: ${productsPrompt}.
    For each record, provide sku, productName, orderDate (YYYY-MM-DD format within the last 90 days), quantityOrdered (between 10 and 50), 
    currentInventory at the time of order (between 5 and 30), and shelfLifeDays (e.g., Produce: 3-7 days, Dairy: 10-20 days, Bakery: 2-4 days).`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            sku: { type: Type.STRING },
                            productName: { type: Type.STRING },
                            orderDate: { type: Type.STRING, description: 'Format: YYYY-MM-DD' },
                            quantityOrdered: { type: Type.NUMBER },
                            currentInventory: { type: Type.NUMBER },
                            shelfLifeDays: { type: Type.NUMBER },
                        },
                        required: ['sku', 'productName', 'orderDate', 'quantityOrdered', 'currentInventory', 'shelfLifeDays']
                    }
                }
            }
        });
        const data: OrderHistory[] = JSON.parse(response.text);
        return data.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    } catch (error) {
        console.error("Error generating order history:", error);
        return [];
    }
};

/**
 * Generates notifications for a store manager.
 */
export const generateNotifications = async (storeName: string): Promise<Notification[]> => {
    const prompt = `Generate a list of 5-7 realistic notifications for a grocery store manager of a store named "${storeName}".
    Notifications should be a mix of types: 'Alert', 'Info', and 'Reminder'.
    Each notification needs a unique id (string, e.g., 'notif-123'), type, title, a short message, a date (as an ISO string from the last 7 days), and a read status (which should be false).
    Example alerts: potential stockout on a popular item, upcoming delivery delay.
    Example info: regional sales trends, new corporate policy.
    Example reminders: submit weekly spoilage report, scheduled maintenance.`;
    
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            type: { type: Type.STRING, enum: ['Alert', 'Info', 'Reminder'] },
                            title: { type: Type.STRING },
                            message: { type: Type.STRING },
                            date: { type: Type.STRING, description: 'ISO 8601 format' },
                            read: { type: Type.BOOLEAN },
                        },
                        required: ['id', 'type', 'title', 'message', 'date', 'read']
                    }
                }
            }
        });
        const data: Notification[] = JSON.parse(response.text);
        return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
        console.error("Error generating notifications:", error);
        return [];
    }
};

/**
 * Generates regional performance data for all stores in a region.
 */
export const generateRegionalPerformanceData = async (region: string): Promise<RegionalStorePerformance[]> => {
    const storesInRegion = STORES.filter(s => s.region === region).map(s => s.name);
    if (storesInRegion.length === 0) return [];
    
    const storesPrompt = storesInRegion.join(', ');

    const prompt = `Generate a list of performance data for the following grocery stores in the "${region}" region: ${storesPrompt}.
    For each store, provide the storeName, totalSpoilage (in USD, between 100 and 800 for the last period), orderAccuracy (as a percentage between 85.0 and 99.9), 
    and inventoryTurnover (a number between 3.0 and 8.0). Ensure the storeName exactly matches one from the provided list.`;
    
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            storeName: { type: Type.STRING },
                            totalSpoilage: { type: Type.NUMBER },
                            orderAccuracy: { type: Type.NUMBER },
                            inventoryTurnover: { type: Type.NUMBER },
                        },
                        required: ['storeName', 'totalSpoilage', 'orderAccuracy', 'inventoryTurnover']
                    }
                }
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error generating regional performance data:", error);
        return [];
    }
};


/**
 * Generates corporate-level dashboard data.
 */
export const generateCorporateData = async (): Promise<{ kpis: Kpi[]; performance: CategoryPerformance[] }> => {
    const categoriesPrompt = [...new Set(PILOT_PRODUCTS.map(p => p.category))].join(', ');

    const prompt = `Generate corporate-level analytics data for a national pilot program of fresh grocery products.
    The data should be in two parts: 'kpis' and 'performance'.
    
    For 'kpis', generate 4 key performance indicators. Each KPI should have a name, a value (as a string, e.g., '$1.2M', '92.5%', '5.8'), a trend ('up', 'down', or 'neutral'), and a change description (e.g., '-5% vs last month'). 
    Example KPI names: 'Overall Spoilage Rate', 'Pilot Program Revenue', 'Order Accuracy', 'Inventory Turnover'.

    For 'performance', generate data for each of these categories: ${categoriesPrompt}. 
    For each category, provide the category name, total sales (a large number, e.g., between 200000 and 800000), and total spoilage (in USD, a smaller number, e.g., between 5000 and 30000).`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        kpis: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    value: { type: Type.STRING },
                                    trend: { type: Type.STRING, enum: ['up', 'down', 'neutral'] },
                                    change: { type: Type.STRING },
                                },
                                required: ['name', 'value', 'trend', 'change']
                            }
                        },
                        performance: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    category: { type: Type.STRING },
                                    sales: { type: Type.NUMBER },
                                    spoilage: { type: Type.NUMBER },
                                },
                                required: ['category', 'sales', 'spoilage']
                            }
                        }
                    },
                    required: ['kpis', 'performance']
                }
            }
        });
        const parsedResponse = JSON.parse(response.text);
        if (parsedResponse.kpis && parsedResponse.performance) {
            return parsedResponse;
        }
        console.error("Parsed response is missing required keys:", parsedResponse);
        return { kpis: [], performance: [] };
    } catch (error) {
        console.error("Error generating corporate data:", error);
        return { kpis: [], performance: [] };
    }
};
