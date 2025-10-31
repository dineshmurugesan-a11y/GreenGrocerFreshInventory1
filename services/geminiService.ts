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

// IMPORTANT: This service now fetches mock data from static JSON files.
const API_BASE_URL = '/data'; 

const sanitizeForFilename = (name: string) => name.replace(/\s+/g, '-');

const fetchData = async <T>(url: string, fallback: T): Promise<T> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status !== 404) { // Don't log 404s as errors, they are expected for missing store files
                 console.error(`Error fetching ${url}: ${response.statusText}`);
            }
            return fallback;
        }
        return await response.json();
    } catch (error) {
        console.error(`Network error fetching ${url}:`, error);
        return fallback;
    }
};

/**
 * Fetches AI-powered order recommendations for a specific store from a JSON file.
 */
export const generateOrderRecommendations = async (storeName: string): Promise<OrderRecommendation[]> => {
    const sanitizedStoreName = sanitizeForFilename(storeName);
    const rawRecommendations = await fetchData<Omit<OrderRecommendation, 'adjustedQty' | 'justification' | 'status'>[]>(
        `${API_BASE_URL}/order-recommendations-${sanitizedStoreName}.json`, 
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
 * Fetches historical spoilage data for a specific store from a JSON file.
 */
export const generateSpoilageData = async (storeName: string): Promise<SpoilageRecord[]> => {
    const sanitizedStoreName = sanitizeForFilename(storeName);
    return await fetchData<SpoilageRecord[]>(
        `${API_BASE_URL}/spoilage-data-${sanitizedStoreName}.json`, 
        []
    );
};

/**
 * Fetches historical order data for a specific store from a JSON file.
 */
export const generateOrderHistory = async (storeName: string): Promise<OrderHistory[]> => {
    const sanitizedStoreName = sanitizeForFilename(storeName);
    return await fetchData<OrderHistory[]>(
        `${API_BASE_URL}/order-history-${sanitizedStoreName}.json`, 
        []
    );
};

/**
 * Fetches notifications for a store manager from a JSON file.
 */
export const generateNotifications = async (storeName: string): Promise<Notification[]> => {
    const sanitizedStoreName = sanitizeForFilename(storeName);
    return await fetchData<Notification[]>(
        `${API_BASE_URL}/notifications-${sanitizedStoreName}.json`, 
        []
    );
};

/**
 * Fetches regional performance data for all stores in a region from a JSON file.
 */
export const generateRegionalPerformanceData = async (region: string): Promise<RegionalStorePerformance[]> => {
    const sanitizedRegion = sanitizeForFilename(region);
    return await fetchData<RegionalStorePerformance[]>(
        `${API_BASE_URL}/regional-performance-${sanitizedRegion}.json`, 
        []
    );
};

/**
 * Fetches corporate-level dashboard data from a JSON file.
 */
export const generateCorporateData = async (): Promise<{ kpis: Kpi[]; performance: CategoryPerformance[] }> => {
    return await fetchData<{ kpis: Kpi[]; performance: CategoryPerformance[] }>(
        `${API_BASE_URL}/corporate-dashboard.json`, 
        { kpis: [], performance: [] }
    );
};
