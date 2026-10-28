const service = require("../services/patchApplicationService");

async function patchApplicationController(req, res) {
    try {
        // Accept inputs from the query string (as in the Excel) or the JSON body
        const input = {
            ...(req.query || {}),
            ...(req.body || {}),
            // TMF style: the cart id (REF_NO) comes from the URL
            REF_NO: req.params.REF_NO
        };

        const result = await service.patchApplication(input);

        return res.status(200).json(result);
    } catch (error) {
        const status = error.status || 500;

        return res.status(status).json({
            code: String(status),
            reason:
                status === 400
                    ? "Bad Request"
                    : status === 404
                        ? "Not Found"
                        : "Internal Server Error",
            message: error.message || "Failed to update draft application",
            status: String(status),
            "@type": "Error"
        });
    }
}

module.exports = { patchApplicationController };