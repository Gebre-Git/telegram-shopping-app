
const { connectToDatabase, Order } = require('./db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    
    const { items, total, screenshot, telegramUserId, customerName } = req.body;

    if (!items || !total || !screenshot || !telegramUserId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newOrder = await Order.create({
      items,
      total,
      screenshot,
      telegramUserId,
      customerName,
      status: 'Pending'
    });

    return res.status(201).json({ success: true, orderId: newOrder._id });
  } catch (error) {
    console.error('Order creation error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
