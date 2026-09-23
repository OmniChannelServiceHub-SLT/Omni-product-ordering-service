const service =
    require("../services/validateBBPurchaseRequestService");


async function validateBBPurchaseRequest(req, res) {
    try {
        const input = {
            subscriberID: req.query.subscriberID,
            packageId: req.query.packageId,
            usageType: req.query.usageType
        };

        const result =
            await service.validateBBPurchaseRequest(input);

        const responseFormat =
            req.headers["x-response-format"];

        if (
            responseFormat &&
            responseFormat.toLowerCase() === "legacy"
        ) {
            return res
                .status(200)
                .json(result.legacyResponse);
        }

        return res
            .status(200)
            .json(result.tmfResponse);

    } catch (error) {
        const status =
            error.status || 500;

        return res
            .status(status)
            .json({
                code: String(status),

                reason:
                    status === 400
                        ? "Bad Request"
                        : "Internal Server Error",

                message:
                    error.message ||
                    "Failed to validate broadband purchase request",

                status: String(status),

                "@type": "Error"
            });
    }
}


module.exports = {
    validateBBPurchaseRequest
};