/* GA4 ecommerce event helpers */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function gtag(...args: unknown[]) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args);
  }
}

export function trackAddToCart(item: { id: string; name: string; price: number; quantity: number }) {
  gtag('event', 'add_to_cart', {
    currency: 'INR',
    value: item.price / 100,
    items: [{ item_id: item.id, item_name: item.name, price: item.price / 100, quantity: item.quantity }],
  });
}

export function trackBeginCheckout(value: number, items: { id: string; name: string; price: number; quantity: number }[]) {
  gtag('event', 'begin_checkout', {
    currency: 'INR',
    value: value / 100,
    items: items.map(i => ({ item_id: i.id, item_name: i.name, price: i.price / 100, quantity: i.quantity })),
  });
}

export function trackPurchase(orderId: string, value: number, items: { id: string; name: string; price: number; quantity: number }[]) {
  gtag('event', 'purchase', {
    transaction_id: orderId,
    currency: 'INR',
    value: value / 100,
    items: items.map(i => ({ item_id: i.id, item_name: i.name, price: i.price / 100, quantity: i.quantity })),
  });
}

export function trackViewItem(item: { id: string; name: string; price: number }) {
  gtag('event', 'view_item', {
    currency: 'INR',
    value: item.price / 100,
    items: [{ item_id: item.id, item_name: item.name, price: item.price / 100 }],
  });
}
