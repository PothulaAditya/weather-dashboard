const axios = require('axios');

const base = process.argv[2] || process.env.SERVICE_URL;
if (!base) {
  console.error('Usage: node scripts/smoke_test.js <base-url>');
  console.error('Or set SERVICE_URL env variable');
  process.exit(2);
}

const check = async () => {
  try {
    const health = await axios.get(`${base.replace(/\/$/, '')}/health`, { timeout: 5000 });
    console.log('/health ->', health.status, health.data);
  } catch (err) {
    console.error('/health failed:', err.message);
    process.exitCode = 1;
  }

  try {
    const forecast = await axios.get(`${base.replace(/\/$/, '')}/api/forecast`, {
      params: { city: 'Secunderabad,IN' },
      timeout: 8000
    });
    console.log('/api/forecast ->', forecast.status);
    if (forecast.data && Array.isArray(forecast.data.days)) {
      console.log('Forecast days:', forecast.data.days.length);
    } else {
      console.warn('Unexpected /api/forecast payload');
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('/api/forecast failed:', err.message);
    process.exitCode = 1;
  }

  if (process.exitCode && process.exitCode !== 0) {
    console.error('Smoke test failed');
    process.exit(process.exitCode);
  }
  console.log('Smoke test passed');
};

check();
