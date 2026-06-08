'use strict';

const app = require('./app');
const env = require('./config/env');

const PORT = env.PORT;

// Health check — pinged every 14 min by GitHub Actions keep-alive workflow
// to prevent Render free-tier cold starts. Must return 200/204.
app.get('/api/health', (_req, res) => res.sendStatus(200));

app.listen(PORT, () => {
  console.log(`\u{1F680} Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});
