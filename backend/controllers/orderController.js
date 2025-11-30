
const Order = require('../models/Order');
const axios = require('axios');

// @desc    Create new order
// @route   POST /api/orders/create
exports.createOrder = async (req, res) => {
  try {
    const { items, total, screenshot, telegramUserId, customerName } = req.body;

    if (!items || !total || !screenshot || !telegramUserId) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const order = await Order.create({
      items,
      total,
      screenshot,
      telegramUserId,
      customerName
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Get Orders Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Confirm order
// @route   POST /api/orders/confirm
exports.confirmOrder = async (req, res) => {
  try {
    const { orderId, telegramUserId } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: 'Confirmed' },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Notify User via Telegram
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (botToken && telegramUserId) {
      const message = `✅ *Order Confirmed!*\n\nHello ${order.customerName},\nWe have received your payment for your order.\n\n🚚 Delivery is on the way!`;
      
      try {
        await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          chat_id: telegramUserId,
          text: message,
          parse_mode: 'Markdown'
        });
      } catch (tgError) {
        console.error('Telegram Notification Failed:', tgError.response?.data || tgError.message);
        // We still return success because the order DB update worked
      }
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Confirm Order Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
