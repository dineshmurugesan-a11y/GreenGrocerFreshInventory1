import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StoreManagerView from './StoreManagerView';
import { USERS } from '../constants';
import * as geminiService from '../services/geminiService';
import { Role } from '../types';

// Mock the geminiService
jest.mock('../services/geminiService');
const mockedGeminiService = geminiService as jest.Mocked<typeof geminiService>;

const mockRecommendations = [
  { sku: 'PROD-001', productName: 'Organic Bananas', currentInventory: 50, forecastedQty: 30, recommendedQty: 20, adjustedQty: 20, justification: '', status: 'Pending for Review', targetDeliveryDate: '2024-08-01' },
  { sku: 'DAIRY-001', productName: 'Organic Milk (Gallon)', currentInventory: 20, forecastedQty: 15, recommendedQty: 10, adjustedQty: 10, justification: '', status: 'Pending for Review', targetDeliveryDate: '2024-08-01' },
];

const mockOrderHistory = [
  { sku: 'PROD-001', productName: 'Organic Bananas', orderDate: '2024-07-25', quantityOrdered: 25, currentInventory: 50, shelfLifeDays: 5 },
];

const mockSpoilageData = [
    { sku: 'PROD-002', productName: 'Avocados (Hass)', quantity: 3, reason: 'Expired', recordedDate: '2024-07-30' },
];

const storeManagerUser = USERS.find(u => u.role === Role.StoreManager)!;

describe('StoreManagerView Component', () => {
  beforeEach(() => {
    // Return copies to prevent mutation across tests
    mockedGeminiService.generateOrderRecommendations.mockResolvedValue(JSON.parse(JSON.stringify(mockRecommendations)));
    mockedGeminiService.generateOrderHistory.mockResolvedValue(JSON.parse(JSON.stringify(mockOrderHistory)));
    mockedGeminiService.generateSpoilageData.mockResolvedValue(JSON.parse(JSON.stringify(mockSpoilageData)));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially then displays recommendations', async () => {
    render(<StoreManagerView user={storeManagerUser} />);
    
    expect(screen.getByText(/generating order recommendations/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Organic Bananas')).toBeInTheDocument();
      expect(screen.getByText('Organic Milk (Gallon)')).toBeInTheDocument();
    });
  });

  it('allows adjusting quantity and status changes to "Adjusted"', async () => {
    render(<StoreManagerView user={storeManagerUser} />);
    
    await waitFor(() => {
      expect(screen.getByText('Organic Bananas')).toBeInTheDocument();
    });

    const quantityInputs = screen.getAllByRole('spinbutton');
    const bananaQtyInput = quantityInputs[0];

    fireEvent.change(bananaQtyInput, { target: { value: '25' } });
    
    // Check that status badge updated
    const rows = screen.getAllByRole('row');
    const bananaRow = rows.find(row => row.textContent?.includes('Organic Bananas'));
    expect(bananaRow).toHaveTextContent('Adjusted');
  });

  it('allows approving a single recommendation', async () => {
    render(<StoreManagerView user={storeManagerUser} />);
    
    await waitFor(() => {
      expect(screen.getByText('Organic Bananas')).toBeInTheDocument();
    });

    const approveButtons = screen.getAllByRole('button', { name: 'Approve' });
    fireEvent.click(approveButtons[0]);

    const rows = screen.getAllByRole('row');
    const bananaRow = rows.find(row => row.textContent?.includes('Organic Bananas'));
    expect(bananaRow).toHaveTextContent('Approved');
  });
  
  it('allows selecting and approving multiple recommendations', async () => {
    render(<StoreManagerView user={storeManagerUser} />);
    
    await waitFor(() => {
      expect(screen.getByText('Organic Bananas')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox').slice(1); // Exclude "select all"
    fireEvent.click(checkboxes[0]); // Select first product
    fireEvent.click(checkboxes[1]); // Select second product

    const approveSelectedButton = screen.getByRole('button', { name: /approve selected/i });
    expect(approveSelectedButton).not.toBeDisabled();
    expect(approveSelectedButton).toHaveTextContent('Approve Selected (2)');
    
    fireEvent.click(approveSelectedButton);

    expect(screen.queryByText('Adjusted and Approved')).not.toBeInTheDocument();
    expect(screen.getAllByText('Approved')).toHaveLength(2);
  });
  
  it('switches to order history tab and displays data', async () => {
      render(<StoreManagerView user={storeManagerUser} />);
      
      await waitFor(() => {
        expect(screen.getByText('Organic Bananas')).toBeInTheDocument();
      });

      const historyTab = screen.getByRole('button', { name: /order history/i });
      fireEvent.click(historyTab);

      await waitFor(() => {
          expect(screen.getByText('Past 90 Days for GreenGrocer Downtown')).toBeInTheDocument();
          expect(screen.getByText('2024-07-25')).toBeInTheDocument(); // Check for order history data
      });
  });

  it('filters recommendations by category', async () => {
      render(<StoreManagerView user={storeManagerUser} />);
      
      await waitFor(() => {
        expect(screen.getByText('Organic Bananas')).toBeInTheDocument();
      });

      // The label is sr-only, so we can't get by label text easily.
      const selects = screen.getAllByRole('combobox');
      const categoryFilter = selects[1]; // Based on DOM order

      fireEvent.change(categoryFilter, { target: { value: 'Dairy' } });

      expect(screen.queryByText('Organic Bananas')).not.toBeInTheDocument();
      expect(screen.getByText('Organic Milk (Gallon)')).toBeInTheDocument();
  });

});
