/* Packify — order system.
   Orders are stored in localStorage for now. To add Stripe/Razorpay later,
   replace createOrder() with a call to your payment provider, then call
   confirmOrder(orderId) on payment success. The receipt/lookup flow stays the same.
*/

const ORDERS_KEY = 'packify_orders';
const FAV_KEY = 'packify_favorites';

function getOrders() {
  try { return JSON.parse(localStorage.getItem(ORDERS_KEY)) || []; }
  catch { return []; }
}

function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function generateOrderId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'PK-';
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  // ensure uniqueness
  if (getOrders().some(o => o.id === id)) return generateOrderId();
  return id;
}

function getFavorites() {
  try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; }
  catch { return []; }
}

function toggleFavorite(packId) {
  const favs = getFavorites();
  const i = favs.indexOf(packId);
  if (i === -1) favs.push(packId); else favs.splice(i, 1);
  localStorage.setItem(FAV_KEY, JSON.stringify(favs));
  return favs.includes(packId);
}

function isFavorite(packId) {
  return getFavorites().includes(packId);
}

/**
 * Create a pending order. Returns the order object.
 * Payment hook: call this AFTER payment succeeds, or call createOrder()
 * with status 'pending' now and update status later via updateOrderStatus().
 */
function createOrder(packId, customer = {}) {
  const pack = PACKS.find(p => p.id === packId);
  if (!pack) throw new Error('Pack not found');

  // pack.price is INR; convert to the customer's selected display currency
  const cur = (typeof getCurrency === 'function') ? getCurrency() : { code: 'INR' };
  const price = (typeof convertINR === 'function')
    ? convertINR(pack.price, cur.code)
    : pack.price;

  const order = {
    id: generateOrderId(),
    packId: pack.id,
    packName: pack.name,
    price,
    currency: cur.code,
    customer: {
      name: (customer.name || '').trim(),
      email: (customer.email || '').trim()
    },
    createdAt: new Date().toISOString(),
    status: 'Pending', // Pending -> Verified -> Completed
    receipt: ''
  };
  order.receipt = buildReceipt(order);

  const orders = getOrders();
  orders.push(order);
  saveOrders(orders);
  return order;
}

function getOrder(id) {
  return getOrders().find(o => o.id.toUpperCase() === String(id).toUpperCase()) || null;
}

function updateOrderStatus(id, status) {
  const orders = getOrders();
  const o = orders.find(o => o.id === id);
  if (o) { o.status = status; saveOrders(orders); }
  return o;
}

function formatOrderPrice(order) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency', currency: order.currency,
      minimumFractionDigits: 2, maximumFractionDigits: 2
    }).format(order.price);
  } catch {
    return `${order.currency} ${order.price.toFixed(2)}`;
  }
}

function buildReceipt(order) {
  const date = new Date(order.createdAt);
  const lines = [
    '================================',
    '           PACKIFY',
    '        PURCHASE RECEIPT',
    '================================',
    `Order ID : ${order.id}`,
    `Pack     : ${order.packName}`,
    `Price    : ${formatOrderPrice(order)}`,
    `Date     : ${date.toLocaleString()}`,
    `Name     : ${order.customer.name || '—'}`,
    `Email    : ${order.customer.email || '—'}`,
    `Status   : ${order.status}`,
    '================================',
    'Join our Discord, create a purchase',
    'ticket, and paste this receipt.',
    '================================'
  ];
  return lines.join('\n');
}
