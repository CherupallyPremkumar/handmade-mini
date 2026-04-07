/* ─── Domain Types ─── */

export interface Saree {
  id: string;
  name: string;
  description: string;
  priceInPaisa: number;
  mrpInPaisa: number;
  fabric: string;
  weave: string;
  color: string;
  lengthInMeters: number;
  blousePieceIncluded: boolean;
  images: string[];
  videoUrl?: string;
  stock: number;
  active: boolean;
  gstPct: number;
  createdAt: string;
}

export interface CartItem {
  saree: Saree;
  quantity: number;
}

export interface Address {
  id: string;
  label?: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  createdAt?: string;
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
  shippingAddress: Record<string, string>;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  status: OrderStatus;
  subtotal: number;
  gstAmount: number;
  shippingCost: number;
  totalAmount: number;
  trackingNumber?: string;
  paymentStatus?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdTime: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  totalPrice: number;
  quantity: number;
}

export type OrderStatus =
  | 'PENDING_PAYMENT'
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
