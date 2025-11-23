
const { connectToDatabase, Order } = require('./db');
const axios = require('axios');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    const { orderId, telegramUserId } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId, 
      { status: 'Confirmed' },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    // Check if real user ID (not guest) and token exists
    if (botToken && telegramUserId && !telegramUserId.startsWith('web_guest_')) {
      const message = `✅ *Order Confirmed!*\n\nHello ${order.customerName},\nWe have received your payment for:\n📦 *${order.items[0].name}*\n\n🚚 Delivery is on the way!`;
      
      try {
        await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          chat_id: telegramUserId,
          text: message,
          parse_mode: 'Markdown'
        });
      } catch (telegramError) {
        console.error('Failed to send Telegram message:', telegramError.response?.data || telegramError.message);
      }
    }

    return res.status(200).json({ success: true, order });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
