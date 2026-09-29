/**
 * Concurrent User & Endpoint Stress Test
 * Tests simultaneous connections and response latency.
 */

const TARGET_URL = 'https://saumya-portfolio.saumyamir25.workers.dev';
const CONCURRENT_USERS = 25;

async function simulateUser(userId) {
  const startTime = Date.now();
  try {
    const res = await fetch(TARGET_URL);
    const duration = Date.now() - startTime;
    return {
      userId,
      status: res.status,
      durationMs: duration,
      ok: res.ok
    };
  } catch (err) {
    return {
      userId,
      status: 0,
      durationMs: Date.now() - startTime,
      error: err.message,
      ok: false
    };
  }
}

async function runLoadTest() {
  console.log(`🚀 Starting load test with ${CONCURRENT_USERS} simultaneous simulated visitors on ${TARGET_URL}...`);
  const promises = [];
  for (let i = 1; i <= CONCURRENT_USERS; i++) {
    promises.push(simulateUser(i));
  }

  const results = await Promise.all(promises);
  const successCount = results.filter(r => r.ok).length;
  const avgLatency = Math.round(results.reduce((acc, r) => acc + r.durationMs, 0) / results.length);

  console.log('--- Results ---');
  console.log(`Total Requests: ${CONCURRENT_USERS}`);
  console.log(`Successful: ${successCount} / ${CONCURRENT_USERS}`);
  console.log(`Average Latency: ${avgLatency}ms`);
  console.log(`Error Rate: ${(((CONCURRENT_USERS - successCount) / CONCURRENT_USERS) * 100).toFixed(1)}%`);
}

runLoadTest();
