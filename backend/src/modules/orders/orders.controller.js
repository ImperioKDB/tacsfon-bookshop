'use strict';

const { success, error } = require('../../utils/apiResponse');
const svc = require('./orders.service');

exports.getStudentOrders = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const data = await svc.getStudentOrders(req.user.id, page, limit);
    success(res, 200, data, 'Orders retrieved successfully');
  } catch (err) { next(err); }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const data = await svc.getOrderById(req.params.id, req.user.id, isAdmin);
    success(res, 200, data, 'Order retrieved successfully');
  } catch (err) {
    if (err.message === 'ORDER_NOT_FOUND')
      return error(res, 404, 'ORDER_NOT_FOUND', 'Order not found');
    next(err);
  }
};

exports.markReceived = async (req, res, next) => {
  try {
    const data = await svc.markReceived(req.params.id, req.user.id);
    success(res, 200, data, 'Order marked as received');
  } catch (err) {
    if (err.message === 'ORDER_NOT_FOUND')
      return error(res, 404, 'ORDER_NOT_FOUND', 'Order not found or not yet dispatched');
    next(err);
  }
};

exports.getAdminOrders = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const data = await svc.getAdminOrders(status, page, limit);
    success(res, 200, { orders: data }, 'Orders retrieved successfully');
  } catch (err) { next(err); }
};

exports.dispatchOrder = async (req, res, next) => {
  try {
    const data = await svc.dispatchOrder(req.params.id, req.user.id);
    success(res, 200, data, 'Order dispatched successfully');
  } catch (err) {
    if (err.message === 'ORDER_NOT_FOUND')
      return error(res, 404, 'ORDER_NOT_FOUND', 'Order not found');
    next(err);
  }
};

exports.createWalkinOrder = async (req, res, next) => {
  try {
    const data = await svc.createWalkinOrder(req.body, req.user.id);
    success(res, 201, data, 'Walk-in order created');
  } catch (err) {
    const known = ['PRODUCT_NOT_FOUND', 'PRODUCT_UNAVAILABLE', 'INSUFFICIENT_STOCK'];
    if (known.includes(err.message))
      return error(res, 400, err.message, err.message.replace(/_/g, ' ').toLowerCase());
    next(err);
  }
};
