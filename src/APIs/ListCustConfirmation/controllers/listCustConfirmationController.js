const service = require("../services/listCustConfirmationService");

async function listCustConfirmation(req, res) {
    try {
        const input = {
            userkey: req.query.userkey,
            companycode: req.query.companycode,
            confirmationtype: req.query.confirmationtype
        };

        const result = await service.listCustConfirmation(input);
        const responseFormat = req.headers["x-response-format"];

        if (responseFormat && responseFormat.toLowerCase() === "legacy") {
            return res.status(200).json(result.legacyResponse);
        }

        return res.status(200).json(result.tmfResponse);
    } catch (error) {
        const status = error.status || 500;

        return res.status(status).json({
            code: String(status),
            reason: status === 400 ? "Bad Request" : "Internal Server Error",
            message: error.message || "Failed to list customer confirmation",
            status: String(status),
            "@type": "Error"
        });
    }
}

module.exports = { listCustConfirmation };
