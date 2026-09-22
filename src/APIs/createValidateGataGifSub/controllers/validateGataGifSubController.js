const service =
    require("../services/validateGataGifSubService");


async function validateGataGifSub(req, res) {
    try {
        const input = {
            subscriberID: req.query.subscriberID,
            reciever: req.query.reciever
        };

        const result =
            await service.validateGataGifSub(input);

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
                    "Failed to validate GataGif subscriber",

                status: String(status),

                "@type": "Error"
            });
    }
}


module.exports = {
    validateGataGifSub
};