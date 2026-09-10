const express = require("express");
const validationMiddleware = require("./middleware/validationMiddleware");
const errorMiddleware = require("./middleware/errorMiddleware");
const listCustConfirmationRoutes = require(
    "./APIs/ListCustConfirmation/routes/listCustConfirmationRoutes"
);
const app = express();
app.use(express.json());
app.get("/health", (req, res) => res.status(200).json({ status: "UP", service: "product-ordering-service" }));

app.use(
    "/tmf-api/productOfferingQualification/v1",
    listCustConfirmationRoutes
);

app.use(errorMiddleware);
module.exports = app;
