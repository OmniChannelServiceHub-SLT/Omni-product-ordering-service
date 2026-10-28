const service = require("../services/retrieveApplicationService");

async function retrieveApplicationController(req, res) {
    try {
        const result = await service.retrieveApplication();

        return res.status(200).json(result);
    } catch (error) {
        const status = error.status || 500;

        return res.status(status).json({
            code: String(status),
            reason:
                status === 400
                    ? "Bad Request"
                    : "Internal Server Error",
            message: error.message || "Failed to retrieve draft applications",
            status: String(status),
            "@type": "Error"
        });
    }
}

module.exports = { retrieveApplicationController };