const dotenv = require('dotenv');

dotenv.config();

const { connectDB } = require('./src/config/db');
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

async function start() {
  await connectDB(process.env.MONGODB_URI);

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error('Failed to start the server:', error);
  process.exit(1);
});
