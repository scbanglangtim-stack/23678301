import { STUDENT, PRICE_MULTIPLIER } from '@constants/student';

export type CategoryId = 'all' | 'food' | 'drink' | 'study';

export interface ProductItem {
  id: number;
  itemKey: string;
  title: string;
  price: number;
  formattedPrice: string;
  description: string;
  category: CategoryId;
  categoryName: string;
  image: string;
}

interface RawApiProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

export function mapCategory(rawCat: string, rawTitle: string): { category: CategoryId; categoryName: string } {
  const combined = `${rawCat} ${rawTitle}`.toLowerCase();
  if (combined.includes('clothing')) {
    return { category: 'study', categoryName: 'Học tập' };
  }
  if (combined.includes('jewel')) {
    return { category: 'drink', categoryName: 'Nước' };
  }
  return { category: 'food', categoryName: 'Đồ ăn' };
}

export async function fetchProducts(timeoutMs: number = 10000): Promise<ProductItem[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch('https://fakestoreapi.com/products?limit=8', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const rawData: RawApiProduct[] = await response.json();

    return rawData.map((item) => {
      const { category, categoryName } = mapCategory(item.category, item.title);
      const calculatedPrice = Math.round(item.price * PRICE_MULTIPLIER);
      const formattedPrice = `${calculatedPrice.toLocaleString('vi-VN')} đ`;

      return {
        id: item.id,
        itemKey: `${STUDENT.mssv}-${item.id}`,
        title: item.title,
        price: calculatedPrice,
        formattedPrice,
        description: item.description,
        category,
        categoryName,
        image: item.image,
      };
    });
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function checkNetworkConnection(timeoutMs: number = 3000): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch('https://fakestoreapi.com/products?limit=1', {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    clearTimeout(timeoutId);
    return false;
  }
}
