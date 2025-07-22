// pages/api/send-message.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message, ip } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Invalid message' });
  }

  const botToken = process.env.BOT_TOKEN;
  const chatId = process.env.CHAT_ID;

  if (!botToken || !chatId) {
    return res.status(500).json({ error: 'Bot credentials not configured' });
  }

  const textToSend = `User Message: ${message}\nUser IP: ${ip}`;

  try {
    const telegramRes = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(textToSend)}`
    );
    const data = await telegramRes.json();

    if (!data.ok) {
      throw new Error(data.description || 'Telegram API error');
    }

    return res.status(200).json({ success: true, result: data.result });
  } catch (error) {
    console.error('Telegram API error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

