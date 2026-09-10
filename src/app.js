require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const listCustConfirmationRoutes = require(
    "./routes/listCustConfirmationRoutes"
);

const app = express();

app.use(cors());
app.use(express.json({
    limit: "2mb",
    type: [
        "application/json",
        "application/merge-patch+json",
        "application/json;charset=utf-8"
    ]
}));
app.use(morgan("dev"));

app.get("/health", (req, res) => {
    return res.status(200).json({
        status: "UP",
        service: "TMF679 Product Offering Qualification Service"
    });
});

app.use(
    "/tmf-api/productOfferingQualification/v1",
    listCustConfirmationRoutes
);

app.use((req, res) => {
    return res.status(404).json({
        code: "404",
        reason: "Not Found",
        message: `Route not found: ${req.method} ${req.originalUrl}`,
        status: "404",
        "@type": "Error"
    });
});

app.use((err, req, res, next) => {
    const status = err.status || 500;

    return res.status(status).json({
        code: String(status),
        reason: status === 400 ? "Bad Request" : "Internal Server Error",
        message: err.message || "Unexpected server error",
        status: String(status),
        "@type": "Error"
    });
});

module.exports = app;
