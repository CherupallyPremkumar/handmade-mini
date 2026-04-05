/**
 * Format paisa to INR display string.
 * e.g., 450000 -> "4,500"
 */
export function formatPrice(paisa: number): string {
  const rupees = paisa / 100;
  return rupees.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
}

/**
 * Format paisa to full INR string with symbol.
 * e.g., 450000 -> "\u20B94,500"
 */
export function formatINR(paisa: number): string {
  return `\u20B9${formatPrice(paisa)}`;
}

/**
 * Calculate discount percentage between MRP and selling price.
 */
export function discountPercent(mrpPaisa: number, pricePaisa: number): number {
  if (mrpPaisa <= pricePaisa) return 0;
  return Math.round(((mrpPaisa - pricePaisa) / mrpPaisa) * 100);
}

/**
 * Format fabric enum to display string.
 */
export function formatFabric(fabric: string): string {
  const map: Record<string, string> = {
    SILK: 'Pure Silk',
    COTTON: 'Handloom Cotton',
    SILK_COTTON: 'Silk Cotton Blend',
  };
  return map[fabric] || fabric;
}

/**
 * Format weave enum to display string.
 */
export function formatWeave(weave: string): string {
  const map: Record<string, string> = {
    IKAT: 'Ikat',
    TELIA_RUMAL: 'Telia Rumal',
    MERCERIZED: 'Mercerized',
  };
  return map[weave] || weave;
}

/**
 * Format order status for display.
 */
export function formatStatus(status: string): string {
  const map: Record<string, string> = {
    PLACED: 'Order Placed',
    PAID: 'Payment Confirmed',
    PROCESSING: 'Processing',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
  };
  return map[status] || status;
}

/**
 * Get status color classes.
 */
export function statusColor(status: string): string {
  const map: Record<string, string> = {
    PLACED: 'bg-amber-100 text-amber-800',
    PAID: 'bg-blue-100 text-blue-800',
    PROCESSING: 'bg-indigo-100 text-indigo-800',
    SHIPPED: 'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-emerald-100 text-emerald-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
}
