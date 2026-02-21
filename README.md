# Атмо Вирья — визитка

Мастер трансэнергетического дыхания и медитаций Ошо. Практики «Дыхание Жизни».

## Чат-бот «Личный помощник»

На сайте работает AI-чат (на базе [cursor-ai-chatbot](https://github.com/evgyur/cursor-ai-chatbot)), который отвечает на вопросы об услугах, ценах и контактах.

### Включение чата на Vercel

1. Зайди в [Vercel → твой проект portfolio → Settings → Environment Variables](https://vercel.com/glyfas-projects/portfolio/settings/environment-variables).
2. Добавь переменную **`MINIMAX_API_KEY`** — ключ с [platform.minimax.io](https://platform.minimax.io) (раздел API Keys).
3. Сохрани и сделай **Redeploy** проекта (Deployments → … → Redeploy).

После этого кнопка чата в правом нижнем углу будет отправлять сообщения в API и показывать ответы.

### Локальная проверка API

```bash
cd portfolio
npm init -y
npm install  # не нужны зависимости для статики; для api/ нужен только Node на Vercel
# Локально api/ работает только при деплое на Vercel или через vercel dev
vercel dev
```

Открой сайт, нажми на кнопку чата и напиши сообщение — запрос уйдёт на `/api/chat`.
