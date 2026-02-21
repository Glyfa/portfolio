/**
 * Личный помощник — AI-чат на Groq API (бесплатный тариф)
 * Ключ: console.groq.com → API Keys
 * Переменная окружения Vercel: GROQ_API_KEY
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

function getSystemPrompt() {
  return `Ты — Личный помощник мастера Атмо Вирья. Отвечай кратко и по делу на русском.

ПРАВИЛА:
1. Отвечай ТОЛЬКО на основе информации ниже.
2. Не выдумывай цены или услуги — если не уверен, предложи написать мастеру в WhatsApp, Telegram или ВКонтакте.
3. Если спрашивают, как связаться — направь в раздел «Контакты» на сайте или предложи написать в мессенджер.
4. Будь вежливым и полезным.

Данные:
${getKnowledge()}`;
}

async function callGroq(apiKey, userMessage) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: getSystemPrompt() },
        { role: 'user', content: userMessage },
      ],
      max_completion_tokens: 1024,
      temperature: 0.7,
    }),
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error(`API вернул не JSON (${res.status}). Проверьте ключ на console.groq.com`);
  }

  if (!res.ok) {
    const msg = data.error?.message || data.message || text.slice(0, 200);
    throw new Error(msg || `Groq ${res.status}`);
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

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Сервис не настроен. Обратитесь к мастеру по контактам на сайте.' });
  }

  const { message } = req.body || {};
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Нет сообщения' });
  }

  try {
    const response = await callGroq(apiKey, message.trim());
    res.status(200).json({ response });
  } catch (err) {
    console.error('Groq error:', err.message);
    res.status(500).json({ error: err.message || 'Временная ошибка. Напишите мастеру в WhatsApp или Telegram — контакты на сайте.' });
  }
};
