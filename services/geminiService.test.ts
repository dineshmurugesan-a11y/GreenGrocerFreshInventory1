import { describe, it, expect, beforeEach, jest } from '@jest/globals';

import {
  generateOrderRecommendations,
  generateSpoilageData,
  generateOrderHistory,
  generateNotifications,
  generateRegionalPerformanceData,
  generateCorporateData,
} from './geminiService';

// Mocking the global fetch function
globalThis.fetch = jest.fn();

const mockFetch = globalThis.fetch as jest.Mock;

describe('geminiService', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('generateOrderRecommendations', () => {
    it('should fetch and format order recommendations successfully', async () => {
      const mockRecs = [
        { sku: 'PROD-001', productName: 'Organic Bananas', currentInventory: 50, forecastedQty: 30, recommendedQty: 20, targetDeliveryDate: '2024-08-01' },
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRecs,
      });

      const result = await generateOrderRecommendations('GreenGrocer Downtown');
      
      expect(mockFetch).toHaveBeenCalledWith('/api/order-recommendations/GreenGrocer%20Downtown');
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(expect.objectContaining({
        sku: 'PROD-001',
        recommendedQty: 20,
        status: 'Pending for Review',
        justification: '',
        adjustedQty: 20,
      }));
    });

    it('should return an empty array on fetch error', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

      const result = await generateOrderRecommendations('Error Store');
      expect(result).toEqual([]);
    });
  });

  describe('generateSpoilageData', () => {
    it('should fetch spoilage data successfully', async () => {
        const mockSpoilage = [{ sku: 'PROD-002', productName: 'Avocados', quantity: 5, reason: 'Expired', recordedDate: '2024-07-30' }];
        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockSpoilage });

        const result = await generateSpoilageData('GreenGrocer Downtown');
        expect(mockFetch).toHaveBeenCalledWith('/api/spoilage-data/GreenGrocer%20Downtown');
        expect(result).toEqual(mockSpoilage);
    });

    it('should return an empty array on fetch error', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'));
        const result = await generateSpoilageData('Error Store');
        expect(result).toEqual([]);
    });
  });
  
  describe('generateOrderHistory', () => {
    it('should fetch order history successfully', async () => {
        const mockHistory = [{ sku: 'DAIRY-001', productName: 'Organic Milk', orderDate: '2024-07-25', quantityOrdered: 24, currentInventory: 10, shelfLifeDays: 7 }];
        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockHistory });
        
        const result = await generateOrderHistory('GreenGrocer Downtown');
        expect(mockFetch).toHaveBeenCalledWith('/api/order-history/GreenGrocer%20Downtown');
        expect(result).toEqual(mockHistory);
    });

    it('should return an empty array on fetch error', async () => {
        mockFetch.mockResolvedValueOnce({ ok: false });
        const result = await generateOrderHistory('Error Store');
        expect(result).toEqual([]);
    });
  });
  
  describe('generateNotifications', () => {
      it('should fetch notifications successfully', async () => {
        const mockNotifications = [{ id: '1', type: 'Alert', title: 'Low Stock', message: 'Bananas are low', date: new Date().toISOString(), read: false }];
        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockNotifications });

        const result = await generateNotifications('GreenGrocer Downtown');
        expect(mockFetch).toHaveBeenCalledWith('/api/notifications/GreenGrocer%20Downtown');
        expect(result).toEqual(mockNotifications);
      });
  });
  
  describe('generateRegionalPerformanceData', () => {
      it('should fetch regional performance data successfully', async () => {
          const mockPerf = [{ storeName: 'GreenGrocer Downtown', totalSpoilage: 150.75, orderAccuracy: 95.5, inventoryTurnover: 4.2 }];
          mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockPerf });
          
          const result = await generateRegionalPerformanceData('North');
          expect(mockFetch).toHaveBeenCalledWith('/api/regional-performance/North');
          expect(result).toEqual(mockPerf);
      });
  });
  
  describe('generateCorporateData', () => {
      it('should fetch corporate data successfully', async () => {
        const mockCorpData = {
            kpis: [{ name: 'Overall Spoilage', value: '$1.2M', trend: 'down', change: '-5% vs last month' }],
            performance: [{ category: 'Produce', sales: 500000, spoilage: 25000 }]
        };
        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mockCorpData });

        const result = await generateCorporateData();
        expect(mockFetch).toHaveBeenCalledWith('/api/corporate-dashboard');
        expect(result).toEqual(mockCorpData);
      });

      it('should return empty data on fetch error', async () => {
          mockFetch.mockRejectedValueOnce(new Error('API Down'));
          const result = await generateCorporateData();
          expect(result).toEqual({ kpis: [], performance: [] });
      });
  });

});
