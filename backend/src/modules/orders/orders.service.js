'use strict';

const supabase     = require('../../config/supabase');
const auditLog     = require('../../utils/auditLog');

/* ── DB error helper — logs real Supabase detail to Render logs ── */
function dbErr(label, error) {
  console.error(
    `[DB ERROR] ${label} |`,
    'msg:',     error?.message,
    '| code:',  error?.code,
    '| hint:',  error?.hint,
    '| detail:', error?.details
  );
  throw new Error('DATABASE_ERROR');
}

/* ── Student: list own orders ── */
exports.getStudentOrders = async (userId, page = 1, limit = 20) => {
  const offset = (Number(page) - 1) * Number(limit);
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id, ref_id, status, payment_status, total, created_at,
      order_items (
        id, quantity, unit_price,
        product:products ( name, image_url )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + Number(limit) - 1);

  if (error) dbErr('getStudentOrders', error);
  return data;
};

/* ── Student / Admin: single order ── */
exports.getOrderById = async (orderId, userId, isAdmin) => {
  let query = supabase
    .from('orders')
    .select(`
      id, ref_id, status, payment_status, total,
      delivery_address, phone, notes, created_at, order_type, customer_name,
      order_items (
        id, quantity, unit_price,
        product:products ( id, name, image_url )
      )
    `)
    .eq('id', orderId)
    .single();

  if (!isAdmin) query = query.eq('user_id', userId);

  const { data, error } = await query;
  if (error) dbErr('getOrderById', error);
  if (!data)  throw new Error('ORDER_NOT_FOUND');
  return data;
};

/* ── Student: mark as received ── */
exports.markReceived = async (orderId, userId) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status: 'received', updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .eq('user_id', userId)
    .eq('status', 'dispatched')
    .select()
    .single();

  if (error) dbErr('markReceived', error);
  if (!data)  throw new Error('ORDER_NOT_FOUND');
  return data;
};

/* ── Admin: list orders by status ── */
exports.getAdminOrders = async (status, page = 1, limit = 50) => {
  const offset = (Number(page) - 1) * Number(limit);

  let query = supabase
    .from('orders')
    .select(`
      id, ref_id, status, payment_status, total, created_at,
      customer_name, phone, delivery_address,
      order_items (
        id, quantity, unit_price,
        product:products ( name )
      )
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + Number(limit) - 1);

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) dbErr('getAdminOrders', error);
  return data;
};

/* ── Admin: dispatch order ── */
exports.dispatchOrder = async (orderId, adminId) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status: 'dispatched', updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single();

  if (error) dbErr('dispatchOrder', error);
  if (!data)  throw new Error('ORDER_NOT_FOUND');

  await auditLog(adminId, 'DISPATCH_ORDER', { order_id: orderId });
  return data;
};

/* ── Admin: create walk-in order ── */
exports.createWalkinOrder = async ({ customer_name, phone, items, notes }, adminId) => {
  const productIds = items.map(i => i.product_id);
  const { data: products, error: prodErr } = await supabase
    .from('products')
    .select('id, price, stock_qty, is_available')
    .in('id', productIds);

  if (prodErr) dbErr('createWalkinOrder:fetchProducts', prodErr);

  const productMap = Object.fromEntries(products.map(p => [p.id, p]));
  let total = 0;

  for (const item of items) {
    const p = productMap[item.product_id];
    if (!p)              throw new Error('PRODUCT_NOT_FOUND');
    if (!p.is_available) throw new Error('PRODUCT_UNAVAILABLE');
    if (p.stock_qty < item.quantity) throw new Error('INSUFFICIENT_STOCK');
    total += p.price * item.quantity;
  }

  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      customer_name,
      phone,
      notes,
      total,
      status:         'dispatched',
      payment_status: 'paid',
      order_type:     'walkin',
    })
    .select()
    .single();

  if (orderErr) dbErr('createWalkinOrder:insertOrder', orderErr);

  const orderItems = items.map(item => ({
    order_id:   order.id,
    product_id: item.product_id,
    quantity:   item.quantity,
    unit_price: productMap[item.product_id].price,
  }));

  const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
  if (itemsErr) dbErr('createWalkinOrder:insertItems', itemsErr);

  await auditLog(adminId, 'CREATE_WALKIN_ORDER', { order_id: order.id });
  return order;
};
