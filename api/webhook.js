const axios = require("axios");

module.exports = async (req, res) => {
  if (req.method === "POST") {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const update = req.body;

    // Ignore messages without text
    if (!update.message) {
      return res.status(200).send("OK");
    }

    const chatId = update.message.chat.id;
    const text = update.message.text;

    // Handle /start
    if (text === "/start") {
      await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        chat_id: chatId,
        text: "Welcome to S-Shop! 🛒\nClick below to enter the shop.",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🛍 OPEN SHOP",
                web_app: { url: "https://s-shopping.vercel.app" }
              }
            ]
          ]
        }
      });
    }

    return res.status(200).send("OK");
  }

  res.status(200).send("GET OK");
};
