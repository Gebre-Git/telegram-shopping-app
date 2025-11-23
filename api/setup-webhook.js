
const axios = require('axios');

module.exports = async (req, res) => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  // This must be the deployed Vercel URL, e.g., https://your-project.vercel.app
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : req.headers.host.includes('localhost') ? 'http://localhost:3000' : `https://${req.headers.host}`;
  
  const webhookUrl = `${vercelUrl}/api/webhook`;

  if (!botToken) {
    return res.status(400).json({ error: 'TELEGRAM_BOT_TOKEN env var not set' });
  }

  try {
    const response = await axios.post(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      url: webhookUrl
    });
    
    return res.status(200).json({ 
      success: true, 
      message: 'Webhook registered successfully', 
      webhookUrl, 
      telegramResponse: response.data 
    });
  } catch (error) {
    return res.status(500).json({ error: error.response?.data || error.message });
  }
};
