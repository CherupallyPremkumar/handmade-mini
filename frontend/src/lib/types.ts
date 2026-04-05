/* ─── Domain Types ─── */

export interface Saree {
  id: string;
  name: string;
  description: string;
  priceInPaisa: number;
  mrpInPaisa: number;
  fabric: 'SILK' | 'COTTON' | 'SILK_COTTON';
  weave: 'IKAT' | 'TELIA_RUMAL' | 'MERCERIZED';
  color: string;
  lengthInMeters: number;
  blousePieceIncluded: boolean;
  images: string[];
  videoUrl?: string;
  stock: number;
  active: boolean;
  createdAt: string;
}

export interface CartItem {
  saree: Saree;
  quantity: number;
}

export interface OrderAddress {
  name: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  address: OrderAddress;
  status: OrderStatus;
  totalInPaisa: number;
  gstInPaisa: number;
  shippingInPaisa: number;
  grandTotalInPaisa: number;
  trackingNumber?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  sareeId: string;
  sareeName: string;
  priceInPaisa: number;
  quantity: number;
}

export type OrderStatus =
  | 'PLACED'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface SareeFilters {
  fabric?: string;
  weave?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  page?: number;
  size?: number;
}

export interface GenericResponse<T> {
  success: boolean;
  data: T;
  errors?: Array<{
    errorNum: number;
    subErrorNum: number;
    description: string;
    field?: string;
  }>;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpayResponse) => void;
}

export interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface AdminStats {
  totalSarees: number;
  ordersToday: number;
  revenueToday: number;
}
