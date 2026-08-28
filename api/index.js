require("dotenv").config();

const app = require("../src/app");
const connectDB = require("../src/config/db");

if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  const port = process.env.PORT || 3000;
  connectDB()
    .then(() => {
      app.listen(port, () => {
        console.log(`EventPulse API running on port ${port}`);
      });
    })
    .catch((error) => {
      console.error("Failed to connect to MongoDB", error);
      process.exit(1);
    });
}

module.exports = app;
