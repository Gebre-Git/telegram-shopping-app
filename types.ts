export interface ProductDetails {
  material: string;
  fit: string;
  care: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  details?: ProductDetails;
}

export interface CartItem extends Product {
  quantity: number;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  date: string;
  customerName: string;
}

export enum View {
  SHOP = 'SHOP',
  CART = 'CART',
  ADMIN = 'ADMIN',
  PRODUCT_DETAIL = 'PRODUCT_DETAIL',
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        initDataUnsafe?: {
          user?: {
            first_name?: string;
            last_name?: string;
            username?: string;
            id?: number;
          };
        };
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
        };
        // Added BackButton definition to fix missing property errors
        BackButton: {
          isVisible: boolean;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
        };
        showPopup: (params: {
          title: string;
          message: string;
          buttons: { type: string; text?: string }[];
        }) => void;
      };
    };
  }
}