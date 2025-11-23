
const axios = require('axios');

module.exports = async (req, res) => {
  // CORS wrappers (generic for Vercel functions)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const { message } = req.body;

  if (!message || !message.text) {
    // Just return 200 to acknowledge receipt to Telegram
    return res.status(200).json({ status: 'ok' });
  }

  const chatId = message.chat.id;
  const text = message.text;

  try {
    if (text === '/start') {
      // Send the button that opens the Mini App
      await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        chat_id: chatId,
        text: "Welcome to S-Shop! 🛍️\n\nClick the button below to browse our Amazon-style store and place your order.",
        reply_markup: {
          inline_keyboard: [[
            {
              text: "🛒 Open Shop",
              web_app: { url: "https://s-shopping.vercel.app" }
            }
          ]]
        }
      });
    }
    
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error.message);
    res.status(500).json({ error: 'Webhook failed' });
  }
};
