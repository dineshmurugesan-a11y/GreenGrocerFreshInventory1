// FIX: Implement the full geminiService to fetch data from the backend API.
import type { 
    OrderRecommendation, 
    SpoilageRecord, 
    OrderHistory, 
    Notification, 
    RegionalStorePerformance, 
    Kpi, 
    CategoryPerformance 
} from '../types';

// IMPORTANT: This service now fetches data from the Python backend, which uses Gemini.
// This allows for a more secure setup where API keys are not exposed on the frontend.

const API_BASE_URL = ''; // The backend will be served from the root

const fetchData = async <T>(url: string, fallback: T): Promise<T> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Error fetching ${url}: ${response.statusText}`);
            return fallback;
        }
        return await response.json();
    } catch (error) {
        console.error(`Network error fetching ${url}:`, error);
        return fallback;
    }
};

/**
 * Fetches AI-powered order recommendations for a specific store from the backend.
 */
export const generateOrderRecommendations = async (storeName: string): Promise<OrderRecommendation[]> => {
    const rawRecommendations = await fetchData<Omit<OrderRecommendation, 'adjustedQty' | 'justification' | 'status'>[]>(
        `${API_BASE_URL}/api/order-recommendations/${encodeURIComponent(storeName)}`, 
        []
    );

    // Frontend adds the initial state for UI interaction
    return rawRecommendations.map(rec => ({
        ...rec,
        adjustedQty: rec.recommendedQty,
        justification: '',
        status: 'Pending for Review',
    }));
};

/**
 * Fetches historical spoilage data for a specific store from the backend.
 */
export const generateSpoilageData = async (storeName: string): Promise<SpoilageRecord[]> => {
    return await fetchData<SpoilageRecord[]>(
        `${API_BASE_URL}/api/spoilage-data/${encodeURIComponent(storeName)}`, 
        []
    );
};

/**
 * Fetches historical order data for a specific store from the backend.
 */
export const generateOrderHistory = async (storeName: string): Promise<OrderHistory[]> => {
    return await fetchData<OrderHistory[]>(
        `${API_BASE_URL}/api/order-history/${encodeURIComponent(storeName)}`, 
        []
    );
};

/**
 * Fetches notifications for a store manager from the backend.
 */
export const generateNotifications = async (storeName: string): Promise<Notification[]> => {
    return await fetchData<Notification[]>(
        `${API_BASE_URL}/api/notifications/${encodeURIComponent(storeName)}`, 
        []
    );
};

/**
 * Fetches regional performance data for all stores in a region from the backend.
 */
export const generateRegionalPerformanceData = async (region: string): Promise<RegionalStorePerformance[]> => {
    return await fetchData<RegionalStorePerformance[]>(
        `${API_BASE_URL}/api/regional-performance/${encodeURIComponent(region)}`, 
        []
    );
};

/**
 * Fetches corporate-level dashboard data from the backend.
 */
export const generateCorporateData = async (): Promise<{ kpis: Kpi[]; performance: CategoryPerformance[] }> => {
    return await fetchData<{ kpis: Kpi[]; performance: CategoryPerformance[] }>(
        `${API_BASE_URL}/api/corporate-dashboard`, 
        { kpis: [], performance: [] }
    );
};
