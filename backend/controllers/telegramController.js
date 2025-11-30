
const axios = require('axios');

// @desc    Handle Telegram Webhook
// @route   POST /webhook
exports.handleWebhook = async (req, res) => {
  try {
    const update = req.body;

    // Check if it's a message
    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text;

      // Handle /start command
      if (text === '/start') {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        
        await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          chat_id: chatId,
          text: "Welcome to S-Shop! 🛒\nClick below to enter the shop.",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🛒 Open Shop",
                  web_app: { url: "https://s-shopping.vercel.app" }
                }
              ]
            ]
          }
        });
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook Error:', error.response?.data || error.message);
    res.status(200).send('OK'); // Always return OK to Telegram to prevent looping
  }
};
