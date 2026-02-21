# Атмо Вирья — визитка

Мастер трансэнергетического дыхания и медитаций Ошо. Практики «Дыхание Жизни».

## Чат-бот «Личный помощник»

На сайте работает AI-чат (на базе [cursor-ai-chatbot](https://github.com/evgyur/cursor-ai-chatbot)), который отвечает на вопросы об услугах, ценах и контактах.

### Включение чата на Vercel (Groq — бесплатно)

1. Получи ключ: зайди на [console.groq.com](https://console.groq.com), зарегистрируйся (без карты), создай API Key в разделе API Keys.
2. В [Vercel → проект portfolio → Settings → Environment Variables](https://vercel.com/glyfas-projects/portfolio/settings/environment-variables) добавь переменную **`GROQ_API_KEY`** со значением ключа.
3. Удали старую переменную **`MINIMAX_API_KEY`**, если была (чат теперь использует только Groq).
4. Сохрани и сделай **Redeploy** проекта (Deployments → … → Redeploy).

После этого кнопка чата будет отправлять запросы в Groq и показывать ответы. Тариф Groq бесплатный, лимиты по запросам в минуту/день — см. console.groq.com.

### Локальная проверка API

```bash
cd portfolio
npm init -y
npm install  # не нужны зависимости для статики; для api/ нужен только Node на Vercel
# Локально api/ работает только при деплое на Vercel или через vercel dev
vercel dev
```

Открой сайт, нажми на кнопку чата и напиши сообщение — запрос уйдёт на `/api/chat`.
