require('dotenv').config();

const app    = require('./app');
const prisma = require('./prisma/client');

const PORT = process.env.PORT || 3000;

async function main() {
  // Verify DB connection before starting
  await prisma.$connect();
  console.log('✅ Database connected');

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});