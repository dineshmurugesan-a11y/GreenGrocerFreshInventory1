import { User, Role, Store, ProductSKU } from './types';

export const USERS: User[] = [
  { id: 1, name: 'Alice Manager', email: 'storemgr@greengrocer.com', role: Role.StoreManager, storeId: 101, region: 'North' },
  { id: 2, name: 'Bob Regional', email: 'regionalmgr@greengrocer.com', role: Role.RegionalManager, region: 'North' },
  { id: 3, name: 'Charlie Analyst', email: 'analyst@greengrocer.com', role: Role.CorporateAnalyst },
];

export const STORES: Store[] = [
  { id: 101, name: 'GreenGrocer Downtown', region: 'North' },
  { id: 102, name: 'GreenGrocer Suburbia', region: 'North' },
  { id: 201, name: 'GreenGrocer Westside', region: 'West' },
  { id: 202, name: 'GreenGrocer East Bay', region: 'West' },
  { id: 301, name: 'GreenGrocer South Central', region: 'South' },
  { id: 401, name: 'GreenGrocer East Village', region: 'East' },
  { id: 402, name: 'GreenGrocer Midtown', region: 'East' },
];

export const PILOT_PRODUCTS: ProductSKU[] = [
  { sku: 'PROD-001', name: 'Organic Bananas', category: 'Produce', unitOfMeasure: 'lb' },
  { sku: 'PROD-002', name: 'Avocados (Hass)', category: 'Produce', unitOfMeasure: 'each' },
  { sku: 'PROD-003', name: 'Strawberries (1lb)', category: 'Produce', unitOfMeasure: 'clamshell' },
  { sku: 'DAIRY-001', name: 'Organic Milk (Gallon)', category: 'Dairy', unitOfMeasure: 'gallon' },
  { sku: 'DAIRY-002', name: 'Greek Yogurt (Plain)', category: 'Dairy', unitOfMeasure: 'tub' },
  { sku: 'BAKE-001', name: 'Artisan Sourdough', category: 'Bakery', unitOfMeasure: 'loaf' },
];

export const JUSTIFICATION_REASONS: string[] = [
  'Supplier Delay',
  'Stock Adjustment',
  'Quality Check Pending',
  'Seasonal Demand Spike',
  'Marketing Promotion',
  'Data Anomaly Review',
];