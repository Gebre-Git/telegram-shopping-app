
const express = require('express');
const router = express.Router();
const { createOrder, getOrders, confirmOrder } = require('../controllers/orderController');

router.post('/create', createOrder);
router.get('/', getOrders);
router.post('/confirm', confirmOrder);

module.exports = router;
