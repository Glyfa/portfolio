/**
 * Личный помощник — AI-чат на MiniMax API
 * Скилл: cursor-ai-chatbot (evgyur/cursor-ai-chatbot)
 * Переменная окружения Vercel: MINIMAX_API_KEY
 */

const path = require('path');
const fs = require('fs');

function getKnowledge() {
  try {
    const knowledgePath = path.join(process.cwd(), 'knowledge.json');
    const raw = fs.readFileSync(knowledgePath, 'utf8');
    const arr = JSON.parse(raw);
    return arr.map((item) => `В: ${item.q}\nО: ${item.a}`).join('\n\n');
  } catch (e) {
    return 'Информация о мастере Атмо Вирья: трансэнергетическое дыхание, медитации Ошо, более 20 лет опыта. Контакты: WhatsApp, Telegram, ВКонтакте — см. на сайте.';
  }
}

const SYSTEM_PROMPT = `Ты — Личный помощник мастера Атмо Вирья. Отвечай кратко и по делу на русском.

ПРАВИЛА:
1. Отвечай ТОЛЬКО на основе информации ниже.
2. Не выдумывай цены или услуги — если не уверен, предложи написать мастеру в WhatsApp, Telegram или ВКонтакте.
3. Если спрашивают, как связаться — направь в раздел «Контакты» на сайте или предложи написать в мессенджер.
4. Будь вежливым и полезным.

Данные:
${getKnowledge()}`;

async function callMiniMax(apiKey, userMessage) {
  const res = await fetch('https://api.minimax.io/v1/text/chatcompletion_v2', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'M2-her',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      max_completion_tokens: 1024,
      temperature: 0.7,
    }),
  });

  const data = await res.json();
  if (data.base_resp && data.base_resp.status_code !== 0) {
    throw new Error(data.base_resp.status_msg || `API error ${data.base_resp.status_code}`);
  }
  const content = data.choices?.[0]?.message?.content;
  return content || 'Извините, не удалось получить ответ. Напишите мастеру напрямую — контакты на сайте.';
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Только POST' });
  }

  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Сервис не настроен. Обратитесь к мастеру по контактам на сайте.' });
  }

  const { message } = req.body || {};
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Нет сообщения' });
  }

  try {
    const response = await callMiniMax(apiKey, message.trim());
    res.status(200).json({ response });
  } catch (err) {
    console.error('MiniMax error:', err.message);
    res.status(500).json({ error: 'Временная ошибка. Напишите мастеру в WhatsApp или Telegram — контакты на сайте.' });
  }
};
