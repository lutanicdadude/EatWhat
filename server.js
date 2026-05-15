const app = require('./src/app');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🍜 EatWhat server running at http://localhost:${PORT}`);
    console.log(`🔧 Mode: ${process.env.USE_MOCK === 'true' ? 'MOCK' : 'LIVE'}`);
});