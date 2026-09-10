const express = require("express");
const validationMiddleware = require("./middleware/validationMiddleware");
const errorMiddleware = require("./middleware/errorMiddleware");
const app = express();
app.use(express.json());
app.get("/health", (req, res) => res.status(200).json({ status: "UP", service: "product-ordering-service" }));

app.use(errorMiddleware);
module.exports = app;
