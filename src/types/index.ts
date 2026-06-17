export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  priceAdjustment: number;
  stock: number;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  categoryId: string;
  stock: number;
  rating: number;
  reviewsCount: number;
  featured: boolean;
  isActive: boolean;
  tags: string[];
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
}

export type OrderStatus = 
  | "Pending" 
  | "Confirmed" 
  | "Processing" 
  | "Packed" 
  | "Out for Delivery" 
  | "Delivered" 
  | "Cancelled" 
  | "Returned";

export interface OrderItem {
  productId: string;
  variantId?: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export interface TrackingEvent {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  couponCode?: string;
  paymentMethod: "COD";
  status: OrderStatus;
  shippingAddress: Address;
  deliverySlot?: string;
  trackingHistory: TrackingEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Coupon {
  code: string;
  discountType: "percentage" | "flat" | "free_shipping";
  discountValue: number;
  minimumOrder: number;
  maximumDiscount?: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  active: boolean;
}
