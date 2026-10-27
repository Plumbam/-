// Щадящий нагрузочный тест сайта ckbib.ru (autocannon).
// Ступени 1 → 5 → 10 одновременных соединений по 20 секунд на главную и раздел «Библиотекам».
// Больше 10 соединений на чужой рабочий сайт без согласия владельца не даём.
// Запуск: npm run load  ->  load/results.json + таблица в консоли
import autocannon from 'autocannon';
import { writeFileSync } from 'node:fs';

const BASE = 'https://www.ckbib.ru';
const PAGES = ['/', '/bibliotekam'];
const STAGES = [1, 5, 10];
const DURATION = 20;

// Критерии прохождения
const MAX_P90_MS = 3000;
const MAX_ERROR_RATE = 0.01;

const run = (path, connections) =>
  autocannon({
    url: BASE + path,
    connections,
    duration: DURATION,
    timeout: 30,
    headers: { 'user-agent': 'qa-course-load-test (study project)' },
  });

const results = [];
for (const path of PAGES) {
  for (const connections of STAGES) {
    const r = await run(path, connections);
    const total = r.requests.total;
    const failed = r.errors + r.timeouts + r.non2xx;
    const row = {
      page: path,
      connections,
      requests: total,
      rps: +r.requests.average.toFixed(1),
      p50: r.latency.p50,
      p90: r.latency.p90,
      p99: r.latency.p99,
      max: r.latency.max,
      errors: failed,
      errorRate: total ? +(failed / total).toFixed(3) : 1,
    };
    row.passed = row.p90 <= MAX_P90_MS && row.errorRate <= MAX_ERROR_RATE;
    results.push(row);
    console.log(`${path} × ${connections}: ${total} запросов, p90 ${row.p90} мс, ошибок ${failed}`);
  }
}

console.table(results);
writeFileSync(new URL('./results.json', import.meta.url), JSON.stringify({ base: BASE, duration: DURATION, criteria: { MAX_P90_MS, MAX_ERROR_RATE }, results }, null, 2));
process.exitCode = results.every(r => r.passed) ? 0 : 1;
