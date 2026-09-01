require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");
const PORT = process.env.PORT || 3009;
connectDB().then(() => app.listen(PORT, () => console.log(`Product Ordering Service running on http://localhost:${PORT}`))).catch((error) => { console.error("Failed to start service:", error.message); process.exit(1); });
