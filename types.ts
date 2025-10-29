// FIX: Define all necessary types for the application.
export enum Role {
  StoreManager = 'Store Manager',
  RegionalManager = 'Regional Manager',
  CorporateAnalyst = 'Corporate Analyst',
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  storeId?: number;
  region?: string;
}

export interface Store {
  id: number;
  name: string;
  region: string;
}

export interface ProductSKU {
  sku: string;
  name: string;
  category: string;
  unitOfMeasure: string;
}

export interface OrderRecommendation {
  sku: string;
  productName: string;
  currentInventory: number;
  forecastedQty: number;
  recommendedQty: number;
  adjustedQty: number;
  justification: string;
  status: 'Pending for Review' | 'Adjusted' | 'Approved' | 'Adjusted and Approved';
  targetDeliveryDate: string; // YYYY-MM-DD
}

export interface OrderHistory {
  sku: string;
  productName: string;
  orderDate: string; // YYYY-MM-DD
  quantityOrdered: number;
  currentInventory: number;
  shelfLifeDays: number;
}

export type SpoilageReason = 'Expired' | 'Damaged' | 'Overstock' | 'Theft';

export interface SpoilageRecord {
  sku: string;
  productName: string;
  quantity: number;
  reason: SpoilageReason;
  recordedDate: string; // YYYY-MM-DD
}

export interface Notification {
  id: string;
  type: 'Alert' | 'Info' | 'Reminder';
  title: string;
  message: string;
  date: string; // ISO string
  read: boolean;
}

export interface RegionalStorePerformance {
    storeName: string;
    totalSpoilage: number;
    orderAccuracy: number; // percentage
    inventoryTurnover: number;
}

export interface Kpi {
    name: string;
    value: string;
    trend: 'up' | 'down' | 'neutral';
    change: string;
}

export interface CategoryPerformance {
    category: string;
    sales: number;
    spoilage: number;
}