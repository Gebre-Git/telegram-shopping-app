
export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  rating?: number;
  reviews?: number;
  description?: string;
  details?: {
    material: string;
    fit: string;
    care: string;
  };
}

export interface CartItem extends Product {
  quantity: number;
}

export enum OrderStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  REJECTED = 'Rejected',
}

export interface Order {
  _id?: string;
  items: CartItem[];
  total: number;
  screenshot: string; // Base64 string
  telegramUserId: string;
  customerName: string;
  status: OrderStatus;
  createdAt?: string;
}

export interface User {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        isVersionAtLeast: (version: string) => boolean;
        initDataUnsafe?: {
          user?: User;
        };
        MainButton: {
          show: () => void;
          hide: () => void;
          setText: (text: string) => void;
          onClick: (fn: () => void) => void;
          offClick: (fn: () => void) => void;
          showProgress: () => void;
          hideProgress: () => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
        };
        showAlert: (message: string) => void;
      };
    };
  }
}