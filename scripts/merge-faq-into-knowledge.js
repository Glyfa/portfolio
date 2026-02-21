#!/usr/bin/env node
/**
 * Переносит заполненные ответы из faq-checklist.json в knowledge.json.
 * Запуск: node scripts/merge-faq-into-knowledge.js
 *
 * Заполните поле "answer" в faq-checklist.json. Пустые ответы не добавляются —
 * бот по-прежнему будет предлагать написать по контактам (по базовым правилам).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const checklistPath = path.join(ROOT, 'faq-checklist.json');
const knowledgePath = path.join(ROOT, 'knowledge.json');

function norm(q) {
  return q.trim().toLowerCase().replace(/\s+/g, ' ');
}

function main() {
  let checklist, knowledge;

  try {
    checklist = JSON.parse(fs.readFileSync(checklistPath, 'utf8'));
  } catch (e) {
    console.error('Ошибка чтения faq-checklist.json:', e.message);
    process.exit(1);
  }

  try {
    knowledge = JSON.parse(fs.readFileSync(knowledgePath, 'utf8'));
  } catch (e) {
    console.error('Ошибка чтения knowledge.json:', e.message);
    process.exit(1);
  }

  const byNorm = new Map();
  knowledge.forEach((item) => byNorm.set(norm(item.q), item));

  let updated = 0;
  let added = 0;

  for (const item of checklist) {
    const answer = (item.answer || '').trim();
    const questions = Array.isArray(item.questions) ? item.questions : [item.questions];

    for (const q of questions) {
      const qTrim = q.trim();
      if (!qTrim) continue;
      const n = norm(qTrim);
      const existing = byNorm.get(n);
      if (existing) {
        if (answer && existing.a !== answer) {
          existing.a = answer;
          updated++;
        }
      } else if (answer) {
        knowledge.push({ q: qTrim, a: answer });
        byNorm.set(n, knowledge[knowledge.length - 1]);
        added++;
      }
    }
  }

  fs.writeFileSync(knowledgePath, JSON.stringify(knowledge, null, 2), 'utf8');
  console.log(`Готово. Добавлено: ${added}, обновлено: ${updated}.`);
}

main();
