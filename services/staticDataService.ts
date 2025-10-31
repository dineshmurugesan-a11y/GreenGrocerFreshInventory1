import type { User, Store, ProductSKU } from '../types';

const fetchData = async <T>(url: string): Promise<T> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    return response.json();
};

export const getUsers = () => fetchData<User[]>('/data/users.json');
export const getStores = () => fetchData<Store[]>('/data/stores.json');
export const getProducts = () => fetchData<ProductSKU[]>('/data/products.json');
export const getJustificationReasons = () => fetchData<string[]>('/data/justification_reasons.json');
